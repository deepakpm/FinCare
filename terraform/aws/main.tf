##############################################################
# AWS - ECS Fargate + Application Load Balancer Deployment
# Provisions a VPC, ECS cluster, task definition, and ALB
# to run the FinCare/WealthScan application as containers.
##############################################################

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "aws" {
  region = var.aws_region
}

# ---- Variables ---------------------------------------------------------------
variable "aws_region"       { default = "us-east-1" }
variable "app_name"         { default = "fincare" }
variable "frontend_image"   { description = "ECR URI for the frontend image" }
variable "backend_image"    { description = "ECR URI for the backend image" }
variable "gemini_api_key"   { description = "Google Gemini API key" sensitive = true }

# ---- VPC & Networking --------------------------------------------------------
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "${var.app_name}-vpc" }
}

resource "aws_subnet" "public_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = { Name = "${var.app_name}-subnet-a" }
}

resource "aws_subnet" "public_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}b"
  map_public_ip_on_launch = true
  tags = { Name = "${var.app_name}-subnet-b" }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
}

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}
resource "aws_route_table_association" "b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

# ---- Security Groups ---------------------------------------------------------
resource "aws_security_group" "alb_sg" {
  name   = "${var.app_name}-alb-sg"
  vpc_id = aws_vpc.main.id
  ingress { from_port = 80 to_port = 80 protocol = "tcp" cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 443 to_port = 443 protocol = "tcp" cidr_blocks = ["0.0.0.0/0"] }
  egress  { from_port = 0 to_port = 0 protocol = "-1" cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_security_group" "ecs_sg" {
  name   = "${var.app_name}-ecs-sg"
  vpc_id = aws_vpc.main.id
  ingress { from_port = 3000 to_port = 3001 protocol = "tcp" security_groups = [aws_security_group.alb_sg.id] }
  egress  { from_port = 0 to_port = 0 protocol = "-1" cidr_blocks = ["0.0.0.0/0"] }
}

# ---- ECS Cluster -------------------------------------------------------------
resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-cluster"
}

# ---- IAM Role for ECS -------------------------------------------------------
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.app_name}-ecs-execution-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Action = "sts:AssumeRole" Effect = "Allow" Principal = { Service = "ecs-tasks.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ---- ECS Task Definition (Frontend + Backend in one task) -------------------
resource "aws_ecs_task_definition" "app" {
  family                   = var.app_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = var.backend_image
      portMappings = [{ containerPort = 3001 hostPort = 3001 }]
      environment = [{ name = "GEMINI_API_KEY" value = var.gemini_api_key }, { name = "PORT" value = "3001" }]
      logConfiguration = { logDriver = "awslogs" options = { "awslogs-group" = "/ecs/${var.app_name}" "awslogs-region" = var.aws_region "awslogs-stream-prefix" = "backend" } }
    },
    {
      name      = "frontend"
      image     = var.frontend_image
      portMappings = [{ containerPort = 3000 hostPort = 3000 }]
      logConfiguration = { logDriver = "awslogs" options = { "awslogs-group" = "/ecs/${var.app_name}" "awslogs-region" = var.aws_region "awslogs-stream-prefix" = "frontend" } }
    }
  ])
}

resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/${var.app_name}"
  retention_in_days = 7
}

# ---- ECS Service -------------------------------------------------------------
resource "aws_ecs_service" "app" {
  name            = "${var.app_name}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 3000
  }
}

# ---- Application Load Balancer -----------------------------------------------
resource "aws_lb" "main" {
  name               = "${var.app_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}

resource "aws_lb_target_group" "frontend" {
  name        = "${var.app_name}-fe-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  health_check { path = "/" healthy_threshold = 2 }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# ---- Outputs ----------------------------------------------------------------
output "app_url" {
  value = "http://${aws_lb.main.dns_name}"
}

##############################################################
# Digital Ocean - App Platform Deployment
# Fully managed container deployment with auto-scaling.
##############################################################

terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "digitalocean" {
  token = var.do_token
}

# ---- Variables ---------------------------------------------------------------
variable "do_token"        { description = "Digital Ocean API Token" sensitive = true }
variable "do_registry"     { description = "DO Container Registry name (e.g. registry.digitalocean.com/your-registry)" }
variable "app_name"        { default = "fincare" }
variable "region"          { default = "nyc3" }
variable "frontend_image"  { description = "DO registry image for frontend (tag)" }
variable "backend_image"   { description = "DO registry image for backend (tag)" }
variable "gemini_api_key"  { description = "Google Gemini API key" sensitive = true }

# ---- DO App Platform Spec ---------------------------------------------------
resource "digitalocean_app" "fincare" {
  spec {
    name   = var.app_name
    region = var.region

    # Backend service
    service {
      name               = "backend"
      image {
        registry_type = "DOCR"
        registry      = var.do_registry
        repository    = "fincare-backend"
        tag           = var.backend_image
      }
      instance_size_slug = "basic-xxs"
      instance_count     = 1
      http_port          = 3001

      env {
        key   = "GEMINI_API_KEY"
        value = var.gemini_api_key
        type  = "SECRET"
      }
      env {
        key   = "PORT"
        value = "3001"
      }

      health_check {
        http_path = "/health"
      }
    }

    # Frontend service
    service {
      name               = "frontend"
      image {
        registry_type = "DOCR"
        registry      = var.do_registry
        repository    = "fincare-frontend"
        tag           = var.frontend_image
      }
      instance_size_slug = "basic-xxs"
      instance_count     = 1
      http_port          = 3000
    }
  }
}

# ---- Outputs ----------------------------------------------------------------
output "app_url" {
  value = digitalocean_app.fincare.live_url
}

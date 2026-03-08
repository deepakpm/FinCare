##############################################################
# GCP - Cloud Run Deployment (Serverless Containers)
# Highly cost-effective: pay only for actual request time.
##############################################################

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# ---- Variables ---------------------------------------------------------------
variable "gcp_project_id" { description = "Your GCP Project ID" }
variable "gcp_region"     { default     = "us-central1" }
variable "app_name"       { default     = "fincare" }
variable "frontend_image" { description = "GCR image for frontend (e.g. gcr.io/project/fincare-frontend:latest)" }
variable "backend_image"  { description = "GCR image for backend (e.g. gcr.io/project/fincare-backend:latest)" }
variable "gemini_api_key" { description = "Google Gemini API key" sensitive = true }

# ---- Enable required GCP APIs -----------------------------------------------
resource "google_project_service" "run" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

# ---- Backend Cloud Run Service -----------------------------------------------
resource "google_cloud_run_v2_service" "backend" {
  name     = "${var.app_name}-backend"
  location = var.gcp_region

  template {
    containers {
      image = var.backend_image
      ports { container_port = 3001 }
      env { name = "GEMINI_API_KEY" value = var.gemini_api_key }
      env { name = "PORT" value = "3001" }
      resources { limits = { cpu = "1" memory = "512Mi" } }
    }
    scaling { min_instance_count = 0 max_instance_count = 3 }
  }

  depends_on = [google_project_service.run]
}

# ---- Frontend Cloud Run Service ----------------------------------------------
resource "google_cloud_run_v2_service" "frontend" {
  name     = "${var.app_name}-frontend"
  location = var.gcp_region

  template {
    containers {
      image = var.frontend_image
      ports { container_port = 3000 }
      env {
        name  = "VITE_API_URL"
        value = google_cloud_run_v2_service.backend.uri
      }
      resources { limits = { cpu = "1" memory = "512Mi" } }
    }
    scaling { min_instance_count = 0 max_instance_count = 3 }
  }

  depends_on = [google_cloud_run_v2_service.backend]
}

# ---- Allow unauthenticated public access ------------------------------------
resource "google_cloud_run_service_iam_member" "frontend_public" {
  location = var.gcp_region
  service  = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "backend_public" {
  location = var.gcp_region
  service  = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ---- Outputs ----------------------------------------------------------------
output "frontend_url" { value = google_cloud_run_v2_service.frontend.uri }
output "backend_url"  { value = google_cloud_run_v2_service.backend.uri }

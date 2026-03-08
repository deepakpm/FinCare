##############################################################
# Azure - Azure Container Apps Deployment (Serverless)
# Uses Azure Container Registry for image storage.
##############################################################

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "azurerm" {
  features {}
}

# ---- Variables ---------------------------------------------------------------
variable "location"           { default = "East US" }
variable "app_name"           { default = "fincare" }
variable "resource_group_name" { default = "fincare-rg" }
variable "frontend_image"     { description = "ACR image for frontend" }
variable "backend_image"      { description = "ACR image for backend" }
variable "gemini_api_key"     { description = "Google Gemini API key" sensitive = true }
variable "acr_login_server"   { description = "Azure Container Registry login server URL" }
variable "acr_username"       { description = "ACR Admin Username" }
variable "acr_password"       { description = "ACR Admin Password" sensitive = true }

# ---- Resource Group ---------------------------------------------------------
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}

# ---- Container Apps Environment ---------------------------------------------
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.app_name}-logs"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_container_app_environment" "main" {
  name                       = "${var.app_name}-env"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
}

# ---- Backend Container App --------------------------------------------------
resource "azurerm_container_app" "backend" {
  name                         = "${var.app_name}-backend"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  registry {
    server               = var.acr_login_server
    username             = var.acr_username
    password_secret_name = "acr-password"
  }

  secret { name = "acr-password" value = var.acr_password }
  secret { name = "gemini-api-key" value = var.gemini_api_key }

  template {
    container {
      name   = "backend"
      image  = var.backend_image
      cpu    = 0.25
      memory = "0.5Gi"
      env { name = "GEMINI_API_KEY" secret_name = "gemini-api-key" }
      env { name = "PORT" value = "3001" }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 3001
    traffic_weight { percentage = 100 latest_revision = true }
  }
}

# ---- Frontend Container App -------------------------------------------------
resource "azurerm_container_app" "frontend" {
  name                         = "${var.app_name}-frontend"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  registry {
    server               = var.acr_login_server
    username             = var.acr_username
    password_secret_name = "acr-password"
  }
  secret { name = "acr-password" value = var.acr_password }

  template {
    container {
      name   = "frontend"
      image  = var.frontend_image
      cpu    = 0.25
      memory = "0.5Gi"
    }
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    traffic_weight { percentage = 100 latest_revision = true }
  }
}

# ---- Outputs ----------------------------------------------------------------
output "frontend_url" { value = "https://${azurerm_container_app.frontend.ingress[0].fqdn}" }
output "backend_url"  { value = "https://${azurerm_container_app.backend.ingress[0].fqdn}" }

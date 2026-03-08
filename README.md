# FinCare / WealthScan

A highly aesthetic, minimalist, and privacy-first financial analysis web application. Upload bank statements to instantly extract transactions, automatically categorize them using AI, and view deep analytics — all processed entirely in-memory with zero persistent database storage.

## ✨ Features
* **AI-Powered Extraction**: Uses Google Gemini to scan PDFs and CSVs to extract structured transaction data in a single optimized call.
* **Smart Categorization**: Automatically categorizes transactions and detects recurring subscriptions.
* **Minimalist UI**: Starts with a distraction-free upload experience. Navigation appears only after data is loaded.
* **Dynamic Analytics**: Interactive charts via Recharts — spending trends, category breakdowns, and cash flow.
* **Privacy First**: Files are parsed in memory. No database. Data clears on session end.
* **Modern Architecture**: OOP strategy patterns on the backend, React Context on the frontend.
* **Enterprise Security**: Helmet, rate limiting, HPP, and strict CORS protections.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), Vanilla CSS, Recharts, Lucide-React |
| **Backend** | Node.js, Express, Multer (in-memory), `@google/genai`, pdf-parse |
| **Security** | Helmet, express-rate-limit, HPP |
| **Infra** | Terraform (AWS, GCP, Azure, Digital Ocean) |
| **CI/CD** | GitHub Actions |

---

## 🛠 Local Development

### Requirements
* Node.js v18+
* A valid [Google Gemini API Key](https://aistudio.google.com/app/apikey)

```bash
# 1. Backend
cd backend
npm install
echo "GEMINI_API_KEY=your_key_here" > .env
npm run dev          # Runs on http://localhost:3001

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev          # Runs on http://localhost:5173
```

---

## 🐳 Docker — Compose (Quick Local Deploy)

```bash
# Set your key and spin up both containers
export GEMINI_API_KEY="your_actual_api_key"
docker-compose up -d --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |

```bash
docker-compose down   # Stop containers
```

---

## ☁️ Cloud Deployment

All cloud deployments use **Terraform** for infrastructure provisioning and the **GitHub Actions** pipeline for automation.

### 🔁 GitHub Actions — CI/CD Pipeline

The workflow file is at `.github/workflows/deploy.yml`. It is triggered **manually** via `workflow_dispatch`, giving you full control.

**To run it:**
1. Push code to GitHub.
2. Go to **Actions → � Multi-Cloud Deploy → Run workflow**.
3. Fill in the dropdown options:

| Input | Options | Description |
|---|---|---|
| `cloud_provider` | `aws` / `gcp` / `azure` / `do` | Target cloud |
| `run_infra` | `true` / `false` | Run `terraform apply` to provision resources |
| `run_deploy` | `true` / `false` | Build Docker images and push to the cloud registry |
| `terraform_destroy` | `true` / `false` | ⚠️ Tear down all cloud resources |

> **Tip**: Run with `run_infra = true` on first deployment. For subsequent deploys, `run_infra = false, run_deploy = true` is sufficient.

---

### 🔐 Required GitHub Secrets

Set all secrets under repo → **Settings → Secrets and variables → Actions**.

#### Common (all providers)
| Secret | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key |

#### AWS
| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_ACCOUNT_ID` | Your 12-digit AWS account ID |

#### GCP
| Secret | Description |
|---|---|
| `GCP_PROJECT_ID` | Your GCP project ID (e.g. `my-project-123`) |
| `GCP_SA_KEY` | Base64-encoded service account JSON key |

> Create a service account with `Cloud Run Admin`, `Artifact Registry Writer`, and `Service Account User` roles.
> Encode it: `base64 -i service-account-key.json | tr -d '\n'`

#### Azure
| Secret | Description |
|---|---|
| `AZURE_CLIENT_ID` | Service principal App ID |
| `AZURE_CLIENT_SECRET` | Service principal secret |
| `AZURE_TENANT_ID` | Azure tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `ACR_LOGIN_SERVER` | Container Registry URL (e.g. `myregistry.azurecr.io`) |
| `ACR_USERNAME` | ACR admin username |
| `ACR_PASSWORD` | ACR admin password |

#### Digital Ocean
| Secret | Description |
|---|---|
| `DO_TOKEN` | Digital Ocean personal access token |
| `DO_REGISTRY` | DO registry URL (e.g. `registry.digitalocean.com/my-registry`) |

---

### 🏗 Terraform — Manual Provisioning

You can also run Terraform directly without GitHub Actions for each cloud provider.

#### Pre-requisites
```bash
# Install Terraform
brew install terraform  # macOS
```

#### AWS (ECS Fargate + Application Load Balancer)
```bash
cd terraform/aws
terraform init
terraform plan \
  -var="frontend_image=<ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com/fincare-frontend:latest" \
  -var="backend_image=<ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com/fincare-backend:latest" \
  -var="gemini_api_key=<YOUR_KEY>"
terraform apply -auto-approve
```

#### GCP (Cloud Run — Serverless)
```bash
cd terraform/gcp
gcloud auth application-default login
terraform init
terraform plan \
  -var="gcp_project_id=<PROJECT_ID>" \
  -var="frontend_image=gcr.io/<PROJECT_ID>/fincare-frontend:latest" \
  -var="backend_image=gcr.io/<PROJECT_ID>/fincare-backend:latest" \
  -var="gemini_api_key=<YOUR_KEY>"
terraform apply -auto-approve
```

#### Azure (Container Apps — Serverless)
```bash
cd terraform/azure
az login
terraform init
terraform plan \
  -var="frontend_image=<ACR>.azurecr.io/fincare-frontend:latest" \
  -var="backend_image=<ACR>.azurecr.io/fincare-backend:latest" \
  -var="acr_login_server=<ACR>.azurecr.io" \
  -var="acr_username=<USERNAME>" \
  -var="acr_password=<PASSWORD>" \
  -var="gemini_api_key=<YOUR_KEY>"
terraform apply -auto-approve
```

#### Digital Ocean (App Platform)
```bash
cd terraform/digitalocean
terraform init
terraform plan \
  -var="do_token=<DO_TOKEN>" \
  -var="do_registry=registry.digitalocean.com/<YOUR_REGISTRY>" \
  -var="frontend_image=latest" \
  -var="backend_image=latest" \
  -var="gemini_api_key=<YOUR_KEY>"
terraform apply -auto-approve
```

> **⚠️ Important**: Terraform state files (`*.tfstate`) are excluded via `.gitignore`. For team environments, configure a [remote backend](https://developer.hashicorp.com/terraform/language/settings/backends/configuration) (e.g. S3, GCS, Azure Blob) to store state safely.

---

## 🏗 Backend Architecture (OOP)

| Pattern | Implementation |
|---|---|
| **Strategy** | `ParserContext` selects `PdfParserStrategy` or `CsvParserStrategy` at runtime |
| **Dependency Injection** | API routes depend on `IAIService` interface; `GeminiAIService` is the concrete impl |
| **Facade** | `StatementProcessorService` orchestrates parsing + AI in one clean call |

---

*Built with privacy and aesthetics in mind.*

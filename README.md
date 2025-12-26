# 🍽️ ProteinLens

[![Deploy](https://github.com/lucab85/proteinlens.com/actions/workflows/deploy.yml/badge.svg)](https://github.com/lucab85/proteinlens.com/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**AI-Powered Food Protein Analyzer** - Upload food photos and instantly analyze protein content with AI. Track your daily nutrition goals effortlessly.

🌐 **Live Site**: [www.proteinlens.com](https://www.proteinlens.com)

---

## ✨ Features

- 📸 **Snap & Analyze** - Take a photo of your meal, get instant protein breakdown
- 🤖 **AI-Powered** - GPT Vision analyzes food items with high accuracy
- 📊 **Track Progress** - Daily protein tracking with visual insights
- 🎯 **Set Goals** - Customize your daily protein target
- 📱 **Mobile-First** - Responsive design works on any device
- 🌙 **Dark Mode** - Easy on the eyes, day or night

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Azure CLI (for deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/lucab85/proteinlens.com.git
cd proteinlens.com

# Start the frontend
cd frontend
npm install
npm run dev
# Open http://localhost:5173

# Start the backend (in another terminal)
cd backend
npm install
npm start
# API runs on http://localhost:7071
```

### Run Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Frontend      │────▶│   Azure         │────▶│   Azure Blob    │
│   (React/Vite)  │     │   Functions     │     │   Storage       │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │   OpenAI        │
                        │   GPT Vision    │
                        │                 │
                        └─────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Framer Motion |
| **Backend** | Azure Functions v4, Node.js 20, TypeScript |
| **Database** | Azure PostgreSQL Flexible Server, Prisma ORM |
| **Storage** | Azure Blob Storage (meal photos) |
| **AI** | OpenAI GPT Vision API |
| **Auth** | (Coming soon) Azure AD B2C |
| **Payments** | Stripe (Pro subscriptions) |
| **Infrastructure** | Azure Bicep, GitHub Actions CI/CD |

## 📁 Project Structure

```
proteinlens.com/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API clients
│   │   └── contexts/         # React contexts
│   └── public/               # Static assets
│
├── backend/                  # Azure Functions backend
│   ├── src/
│   │   ├── functions/        # HTTP endpoints
│   │   ├── services/         # Business logic
│   │   └── middleware/       # Auth, validation
│   └── prisma/               # Database schema
│
├── infra/                    # Infrastructure as Code
│   ├── bicep/                # Azure Bicep templates
│   └── azure-pipelines.yml   # CI/CD pipeline
│
└── specs/                    # Feature specifications
```

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:7071
```

**Backend** (`local.settings.json`):
```json
{
  "Values": {
    "AZURE_STORAGE_ACCOUNT_NAME": "your-storage-account",
    "OPENAI_API_KEY": "sk-...",
    "DATABASE_URL": "postgresql://..."
  }
}
```

## 🚢 Deployment

The project uses GitHub Actions for CI/CD. On push to `main`:

1. **Secret Scan** - Checks for leaked credentials
2. **Infrastructure** - Deploys Azure resources via Bicep
3. **Backend** - Builds and deploys Azure Functions
4. **Frontend** - Builds and deploys to Azure Static Web Apps
5. **Health Check** - Validates deployment

### Manual Deployment

```bash
# Deploy infrastructure
az deployment group create \
  --resource-group proteinlens-prod \
  --template-file infra/bicep/main.bicep \
  --parameters @infra/bicep/parameters/prod.parameters.json

# Deploy backend
cd backend && npm run build
func azure functionapp publish proteinlens-api-prod

# Deploy frontend
cd frontend && npm run build
# Upload dist/ to Static Web App
```

## 📖 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/upload-url` | Get SAS URL for photo upload |
| `POST` | `/api/meals/analyze` | Analyze meal photo |
| `GET` | `/api/meals` | Get meal history |
| `GET` | `/api/billing/plans` | Get subscription plans |
| `POST` | `/api/billing/checkout` | Create Stripe checkout |

## 📊 Observability

ProteinLens includes comprehensive observability powered by Azure Application Insights.

### Features

- **End-to-End Tracing**: W3C Trace Context correlation across frontend → backend → database
- **Core Web Vitals**: LCP, CLS, INP, FCP, TTFB tracking for frontend performance
- **Health Monitoring**: Deep health checks with dependency status (database, blob storage, AI)
- **Automated Alerts**: Error rate, latency, and availability alerts
- **PII Sanitization**: Automatic redaction of sensitive data in telemetry

### Dashboards

Access monitoring in the Azure Portal:

| Dashboard | Purpose |
|-----------|---------|
| **Live Metrics** | Real-time request and dependency tracking |
| **Application Map** | Visual dependency graph |
| **Performance** | Request duration and dependency latency |
| **Failures** | Exception tracking and error analysis |
| **Metrics** | Custom metrics including Web Vitals |

### Key Metrics

| Metric | Threshold | Alert |
|--------|-----------|-------|
| API Error Rate | >5% over 5min | Sev1 (Critical) |
| API P95 Latency | >3s | Sev2 (Warning) |
| Health Check | 2 consecutive failures | Sev1 (Critical) |
| LCP (P75) | >2.5s | Sev3 (Info) |
| Database P95 | >500ms | Sev2 (Warning) |

### Correlation IDs

All API responses include correlation headers for tracing:

```
X-Correlation-Id: abc123...
traceparent: 00-traceId-spanId-01
```

Use these IDs to search logs in Application Insights for end-to-end request tracing.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for GPT Vision API
- [Azure](https://azure.microsoft.com) for cloud infrastructure
- [Vercel](https://vercel.com) for Vite bundler inspiration

---

<p align="center">
  Made with 💚 by the ProteinLens team
</p>

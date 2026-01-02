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
- 🔗 **Shareable Meals** - Get unique URLs to share meal scans with friends (Feature 017)
- 🥗 **Diet Profiles** - Select from Keto, Paleo, Vegan, or Balanced diet styles (Feature 017)
- 📈 **Macro Breakdown** - View protein, carbs, and fat for every meal with calorie percentages (Feature 001)
- 🎯 **Daily Tracking** - See aggregated daily macro totals and track your nutrition goals (Feature 001)
- 📥 **Export Data** - Download your meal history with complete macro information as JSON (Feature 001)
- ⚡ **Pro Tips** - AI-generated nutrition tips persist with each meal (Feature 017)

## 📋 Shareable Meals & Diet Profiles

**Feature 017** adds social sharing and personalized nutrition tracking:

### Key Capabilities

- **Share Meal Scans**: Every meal gets a unique shareable URL (e.g., `/meal/abc12xyz`) with social media OG tags
- **Diet Style Selection**: Users select from admin-configured diet profiles (Ketogenic, Paleo, Vegan, Balanced)
- **Diet Feedback**: When meal nutrients exceed diet limits, users see personalized warnings
- **Daily Macro Summary**: View daily totals broken down by macro percentage for specialty diets
- **Admin Configuration**: Admins can create and edit diet styles without code deployment
- **Meal Privacy Control**: Toggle between public (shareable) and private meals

### Quick Links

- 📚 [Feature 017 Quickstart Guide](specs/017-shareable-meals-diets/quickstart.md)
- 🎯 [User Story Details](specs/017-shareable-meals-diets/spec.md)
- 🗂️ [Data Model & Relationships](specs/017-shareable-meals-diets/data-model.md)
- 📊 [Architecture & Technical Decisions](specs/017-shareable-meals-diets/research.md)

---

## 🍖 Macro Ingredients Analysis

**Feature 001** enables comprehensive macronutrient tracking for every meal:

### Key Capabilities

- **Complete Macro Analysis**: AI extracts protein, carbs, and fat for each food item
- **Meal-Level Breakdown**: See macro totals and calorie percentages (P/C/F split)
- **Daily Aggregation**: Track daily macro totals with visual summaries
- **Export Functionality**: Download meal history with complete macro data as JSON
- **4-4-9 Calculation**: Accurate calorie totals (4 cal/g protein & carbs, 9 cal/g fat)
- **Backward Compatible**: Legacy meals display protein-only gracefully

### Quick Links

- 📚 [Feature 001 Quickstart Guide](specs/001-macro-ingredients-analysis/quickstart.md)
- 🎯 [User Stories](specs/001-macro-ingredients-analysis/spec.md)
- 📊 [API Documentation](docs/API-MACRO-TRACKING.md)
- 🗂️ [Data Model](specs/001-macro-ingredients-analysis/data-model.md)

### Example API Usage

```bash
# Get active diet styles
curl https://api.proteinlens.com/api/diet-styles

# Set user's diet preference
curl -X PATCH https://api.proteinlens.com/api/me/diet-style \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"dietStyleId": "550e8400-e29b-41d4-a716-446655440000"}'

# Analyze meal with full macro breakdown
curl -X POST https://api.proteinlens.com/api/meals/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"blobName": "meal-123.jpg"}'
# Returns: totalProtein, totalCarbs, totalFat, foods with macros

# View daily macro summary
curl https://api.proteinlens.com/api/meals/daily-summary \
  -H "Authorization: Bearer $TOKEN"
# Returns: daily totals, percentages, calorie breakdown

# Export meal data with macros
curl https://api.proteinlens.com/api/meals/export?startDate=2026-01-01&endDate=2026-01-31 \
  -H "Authorization: Bearer $TOKEN"
# Returns: JSON file with all meals and complete macro data

# Share a meal (public URL with OG tags)
https://www.proteinlens.com/meal/abc12xyz
```

---

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
| **Auth** | Self-managed JWT auth (email/password) |
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
    "DATABASE_URL": "postgresql://...",
    "JWT_SECRET": "at-least-32-characters-secure-random-key",
    "ACS_EMAIL_CONNECTION_STRING": "endpoint=...",
    "ACS_EMAIL_SENDER": "DoNotReply@yourdomain.com"
  }
}
```

## 🔐 Authentication

ProteinLens uses self-managed JWT authentication with the following features:

- **Email/Password Sign Up** with email verification
- **Secure Sign In** with HttpOnly cookie refresh tokens
- **Password Reset** via email link
- **Session Management** - view and revoke active sessions
- **CSRF Protection** via double-submit cookie pattern

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/signin` | Sign in, returns JWT tokens |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `POST` | `/api/auth/logout` | Sign out, revokes refresh token |
| `POST` | `/api/auth/verify-email` | Verify email with token |
| `POST` | `/api/auth/forgot-password` | Request password reset email |
| `POST` | `/api/auth/reset-password` | Reset password with token |
| `GET` | `/api/auth/sessions` | List active sessions |
| `DELETE` | `/api/auth/sessions/:id` | Revoke a session |

### Security Features

- **Password Requirements**: Min 8 chars, max 128, with HIBP breach checking
- **Token Storage**: Access tokens in memory (XSS protection), refresh tokens in HttpOnly cookies
- **Rate Limiting**: Progressive lockout on failed auth attempts
- **Audit Logging**: All auth events logged to AuthEvent table

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
| `POST` | `/api/meals/analyze` | Analyze meal photo (returns protein, carbs, fat) |
| `GET` | `/api/meals` | Get meal history with macro data |
| `GET` | `/api/meals/daily-summary` | Get daily macro aggregation |
| `GET` | `/api/meals/export` | Export meals with macros as JSON |
| `GET` | `/api/billing/plans` | Get subscription plans |
| `POST` | `/api/billing/checkout` | Create Stripe checkout |

See the [Authentication](#-authentication) section for auth-specific endpoints and the [API Documentation](docs/API-MACRO-TRACKING.md) for detailed macro tracking API reference.
=======
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

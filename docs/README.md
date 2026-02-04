# Architecture Documentation

This folder contains comprehensive architecture documentation and diagrams for the platform.

## 📊 Architecture Diagrams

### Investor Presentation Edition
High-quality diagrams optimized for investor presentations and print materials:
- **[architecture-diagram-investor.png](architecture-diagram-investor.png)** - High-quality raster format (2560×1920, 328 KB)
- **[architecture-diagram-investor.svg](architecture-diagram-investor.svg)** - Scalable vector format (2560×1920, 38 KB)

### Presentation Edition (16:9)
Optimized for projectors and widescreen displays:
- **[architecture-diagram-presentation.png](architecture-diagram-presentation.png)** - Raster format (1920×1080, 239 KB)
- **[architecture-diagram-presentation.svg](architecture-diagram-presentation.svg)** - Vector format (1920×1080, 38 KB)

## 📄 Documentation Files

- **[ARCHITECTURE-DIAGRAM.md](ARCHITECTURE-DIAGRAM.md)** - Complete architecture overview in Mermaid format with detailed explanations
- **[EXPORT-DIAGRAMS-GUIDE.md](EXPORT-DIAGRAMS-GUIDE.md)** - Step-by-step guide to generate custom diagrams

## 🏗️ System Components

The architecture includes:

- **Frontend**: React-based web and admin applications
- **Backend**: Serverless Azure Functions with Node.js runtime
- **AI & Vision**: Advanced image analysis and food recognition
- **Database**: PostgreSQL with Redis caching
- **Storage**: Azure Blob Storage for images
- **Security**: Azure Key Vault for secrets management
- **Monitoring**: Application Insights and Log Analytics
- **CDN**: Azure Front Door with global content delivery

## 🎯 Key Features

✅ **Scalable** - Auto-scaling serverless backend  
✅ **Secure** - End-to-end encryption and secret management  
✅ **Global** - CDN distribution and load balancing  
✅ **Monitored** - Real-time performance tracking and logging  
✅ **Automated** - CI/CD pipeline for deployments  

## 📋 Other Resources

- [API Macro Tracking](API-MACRO-TRACKING.md) - Macro calculation details
- [Database Backup](DATABASE-BACKUP.md) - Backup and recovery procedures
- [JWT Secrets Deployment](JWT-SECRETS-DEPLOYMENT.md) - Authentication setup
- [SDD Document](sdd-proteinlens-gpt51-blob.md) - Software design document
- [Self-Managed Auth Setup](SELF-MANAGED-AUTH-SETUP.md) - Identity configuration
- [Email Custom Domain Setup](EMAIL-CUSTOM-DOMAIN-SETUP.md) - Email configuration

## 🔄 Regenerating Diagrams

To regenerate the diagrams with updated content or different formats, see [EXPORT-DIAGRAMS-GUIDE.md](EXPORT-DIAGRAMS-GUIDE.md).

Quick command:
```bash
mmdc -i docs/ARCHITECTURE-DIAGRAM.md -o docs/architecture-diagram-investor.png --width 2560 --height 1920 --scale 2
```

## 📝 Format Recommendations

| Use Case | Format | File |
|----------|--------|------|
| **Investor Pitch Deck** | PNG or PDF | `architecture-diagram-investor.png` |
| **Web Documentation** | SVG | `architecture-diagram-investor.svg` |
| **Projector Presentation** | PNG | `architecture-diagram-presentation.png` |
| **Email / Reports** | PNG | `architecture-diagram-investor.png` |
| **Printed Materials** | SVG (scalable) | `architecture-diagram-investor.svg` |

---

Generated: February 2026 | High-Quality Mermaid Diagrams

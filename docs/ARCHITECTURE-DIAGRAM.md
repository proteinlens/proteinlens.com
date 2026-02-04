# System Architecture Overview

High-level architecture diagram for investors - showing the complete system infrastructure.

## Architecture Diagram

```mermaid
graph TB
    subgraph Client["🖥️ Client Applications"]
        WEB["Web Application<br/>React + TypeScript"]
        ADMIN["Admin Dashboard<br/>React + TypeScript"]
        MOBILE["Mobile Browser<br/>Responsive Design"]
    end
    
    subgraph CDN["📊 Content Delivery"]
        FRONTDOOR["Azure Front Door<br/>Global Load Balancer"]
        CACHE["CDN Cache<br/>Static Assets"]
    end
    
    subgraph API["⚙️ API Layer"]
        FUNCTIONS["Serverless Functions<br/>Node.js + TypeScript<br/>Auto-scaling"]
        AUTH["Authentication<br/>JWT Tokens"]
        VALIDATOR["Request Validation<br/>API Gateway"]
    end
    
    subgraph AI["🤖 AI & Vision"]
        VISION["AI Vision Engine<br/>Image Analysis"]
        MODELS["ML Models<br/>Food Detection"]
    end
    
    subgraph DATA["💾 Data & Storage"]
        DB["PostgreSQL Database<br/>User Data & Meals"]
        CACHE_DB["Redis Cache<br/>Session & Data Cache"]
        BLOB["Blob Storage<br/>Meal Images"]
    end
    
    subgraph SECURITY["🔐 Security & Config"]
        KEYVAULT["Key Vault<br/>Secrets Management"]
        AUTH_SVC["Identity Service<br/>User Management"]
    end
    
    subgraph MONITORING["📈 Monitoring & Analytics"]
        APPINSIGHTS["Application Insights<br/>Performance Monitoring"]
        LOGS["Log Analytics<br/>Audit & Debugging"]
    end
    
    subgraph EMAIL["📧 Communications"]
        EMAIL_SVC["Email Service<br/>Notifications"]
    end
    
    Client -->|HTTPS| FRONTDOOR
    FRONTDOOR -->|Route| API
    FRONTDOOR -->|Serve| CACHE
    
    API --> AUTH
    API --> VALIDATOR
    API --> FUNCTIONS
    
    FUNCTIONS -->|Analyze| VISION
    VISION -->|Use| MODELS
    
    FUNCTIONS -->|Read/Write| DB
    FUNCTIONS -->|Cache| CACHE_DB
    FUNCTIONS -->|Store| BLOB
    
    FUNCTIONS -->|Fetch| KEYVAULT
    FUNCTIONS -->|Verify| AUTH_SVC
    
    FUNCTIONS -->|Log| APPINSIGHTS
    APPINSIGHTS -->|Store| LOGS
    
    EMAIL_SVC -->|Send| Client
    FUNCTIONS -->|Trigger| EMAIL_SVC
    
    style Client fill:#e1f5ff
    style CDN fill:#fff3e0
    style API fill:#f3e5f5
    style AI fill:#fce4ec
    style DATA fill:#e8f5e9
    style SECURITY fill:#ffe0b2
    style MONITORING fill:#f1f8e9
    style EMAIL fill:#e0f2f1
```

## Component Breakdown

### Client Applications
- **Web Application**: Main React-based web interface for users
- **Admin Dashboard**: Administrative portal for managing diet profiles and system configuration
- **Mobile Browser**: Responsive design supporting all mobile devices

### Content Delivery Network
- **Azure Front Door**: Global load balancer and DDoS protection
- **CDN Cache**: Accelerated static asset delivery (CSS, JS, images)

### API Layer
- **Serverless Functions**: Scalable backend processing with Node.js runtime
- **Authentication**: JWT-based token validation
- **Request Validation**: Input sanitization and API contract enforcement

### AI & Vision
- **AI Vision Engine**: Advanced image analysis and food recognition
- **ML Models**: Pre-trained models for food detection and protein estimation

### Data & Storage
- **PostgreSQL Database**: Primary data store for users, meals, and macros
- **Redis Cache**: Session management and frequently accessed data
- **Blob Storage**: Secure image storage with retention policies

### Security & Configuration
- **Key Vault**: Centralized secrets management (API keys, connection strings)
- **Identity Service**: User authentication and authorization

### Monitoring & Analytics
- **Application Insights**: Real-time performance metrics and error tracking
- **Log Analytics**: Centralized logging for troubleshooting and auditing

### Communications
- **Email Service**: Transactional emails and notifications

## Data Flow

1. **User Upload**: Client sends meal image through secure HTTPS to Front Door
2. **Processing**: Function receives request, validates JWT token, retrieves secrets from Key Vault
3. **Analysis**: Image is sent to AI Vision engine for analysis
4. **Storage**: Meal data saved to PostgreSQL, image to Blob Storage
5. **Response**: Results returned to client with macro breakdown
6. **Caching**: Frequently accessed data cached in Redis
7. **Monitoring**: All operations logged to Application Insights

## Scalability Features

- **Auto-scaling Functions**: Automatically scales based on demand
- **Database Replication**: PostgreSQL with backup and failover
- **Global CDN**: Content served from nearest edge location
- **Load Balancing**: Azure Front Door handles traffic distribution
- **Cache Layer**: Redis reduces database load

## Security Features

- **End-to-End Encryption**: HTTPS for all communications
- **Secret Management**: Centralized Key Vault for sensitive data
- **Token-Based Auth**: JWT validation on every request
- **DDoS Protection**: Azure Front Door provides protection
- **Database Encryption**: At-rest and in-transit encryption
- **Access Control**: RBAC for resources and services

## Deployment

- **Infrastructure as Code**: Bicep templates for reproducible infrastructure
- **CI/CD Pipeline**: Automated build, test, and deployment
- **Multi-Stage**: Separate environments for dev, staging, and production
- **Rollback Support**: Version control for infrastructure and code

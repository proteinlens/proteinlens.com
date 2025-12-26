# Data Model: User Signup Process

Spec: [spec.md](./spec.md) | Plan: [plan.md](./plan.md) | Research: [research.md](./research.md)

## Entities

### User (Prisma `User`) - EXTENDED

Extends existing User model from 009-user-auth to include profile fields for signup.

```prisma
model User {
  id                    String              @id @default(uuid())
  
  // External identity (from B2C - existing)
  externalId            String              @unique @db.VarChar(255)
  email                 String?             @db.VarChar(320)
  
  // Profile fields (NEW for 010-user-signup)
  firstName             String?             @db.VarChar(50)
  lastName              String?             @db.VarChar(50)
  organizationName      String?             @db.VarChar(100)
  phone                 String?             @db.VarChar(20)
  emailVerified         Boolean             @default(false)
  profileCompleted      Boolean             @default(false)
  
  // Stripe billing fields (existing from 002)
  stripeCustomerId      String?             @unique @db.VarChar(255)
  stripeSubscriptionId  String?             @db.VarChar(255)
  plan                  Plan                @default(FREE)
  subscriptionStatus    SubscriptionStatus?
  currentPeriodEnd      DateTime?
  
  // Timestamps
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  // Relations (existing)
  usage                 Usage[]
  subscriptionEvents    SubscriptionEvent[]
  
  // Relations (NEW)
  consentRecords        ConsentRecord[]
  
  @@index([externalId])
  @@index([stripeCustomerId])
  @@index([plan])
  @@index([email])
}
```

**Field Notes**:
- `firstName`, `lastName`: Populated from B2C claims or form input
- `organizationName`, `phone`: Optional business fields
- `emailVerified`: Synced from B2C verification status
- `profileCompleted`: True when all required fields are present

### ConsentRecord (NEW)

Tracks user consent for Terms of Service and Privacy Policy.

```prisma
enum ConsentType {
  TERMS_OF_SERVICE
  PRIVACY_POLICY
  MARKETING_EMAILS
}

model ConsentRecord {
  id              String       @id @default(uuid())
  userId          String
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  consentType     ConsentType
  documentVersion String       @db.VarChar(20)  // e.g., "1.0.0", "2025-01-01"
  ipAddress       String       @db.VarChar(45)  // IPv4 or IPv6
  userAgent       String?      @db.VarChar(500)
  
  grantedAt       DateTime     @default(now())
  revokedAt       DateTime?    // Null if still valid
  
  @@unique([userId, consentType])  // One active consent per type per user
  @@index([userId])
  @@index([consentType])
  @@index([grantedAt])
}
```

**Field Notes**:
- `documentVersion`: Links to specific ToS/Privacy version accepted
- `ipAddress`: For legal compliance (proves consent location)
- `revokedAt`: Set when user withdraws consent; null = active consent

### SignupAttempt (NEW)

Audit log for signup attempts (security monitoring).

```prisma
enum SignupAttemptOutcome {
  SUCCESS
  VALIDATION_ERROR
  DUPLICATE_EMAIL
  RATE_LIMITED
  CAPTCHA_FAILED
  BREACH_PASSWORD
  NETWORK_ERROR
}

model SignupAttempt {
  id              String                @id @default(uuid())
  
  email           String                @db.VarChar(320)  // Attempted email (not linked to User)
  ipAddress       String                @db.VarChar(45)
  userAgent       String?               @db.VarChar(500)
  
  outcome         SignupAttemptOutcome
  failureReason   String?               @db.VarChar(200)  // Human-readable reason
  
  // Don't store: password, full form data (PII minimization)
  
  createdAt       DateTime              @default(now())
  
  @@index([email, createdAt])
  @@index([ipAddress, createdAt])
  @@index([outcome])
}
```

**Field Notes**:
- Not linked to User (may not exist yet)
- Used for rate limiting and security monitoring
- No PII beyond email and IP

## Validation Schemas (Zod)

### SignupFormSchema

```typescript
import { z } from 'zod';

export const signupFormSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .max(320, 'Email address is too long')
    .transform(val => val.toLowerCase().trim()),
  
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least one special character'),
  
  confirmPassword: z.string(),
  
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name contains invalid characters')
    .transform(val => val.trim()),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name contains invalid characters')
    .transform(val => val.trim()),
  
  organizationName: z.string()
    .max(100, 'Organization name is too long')
    .optional()
    .transform(val => val?.trim() || undefined),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms of Service' })
  }),
  
  acceptedPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Privacy Policy' })
  }),
  
  acceptedMarketing: z.boolean().optional().default(false),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type SignupFormData = z.infer<typeof signupFormSchema>;
```

### PasswordStrengthSchema

```typescript
export const passwordStrengthSchema = z.object({
  minLength: z.boolean(),      // >= 12 chars
  hasUppercase: z.boolean(),   // [A-Z]
  hasLowercase: z.boolean(),   // [a-z]
  hasNumber: z.boolean(),      // [0-9]
  hasSpecial: z.boolean(),     // Special chars
  notBreached: z.boolean(),    // Not in breach list
});

export type PasswordStrength = z.infer<typeof passwordStrengthSchema>;

export function getStrengthLevel(strength: PasswordStrength): 'weak' | 'medium' | 'strong' {
  const passed = Object.values(strength).filter(Boolean).length;
  if (passed <= 3) return 'weak';
  if (passed <= 5) return 'medium';
  return 'strong';
}
```

## State Transitions

```
┌─────────────────┐
│   Visitor       │
│ (no account)    │
└────────┬────────┘
         │ Starts signup
         ▼
┌─────────────────┐
│  Form Entry     │
│ (in progress)   │
└────────┬────────┘
         │ Submits valid form
         ▼
┌─────────────────┐     B2C signup
│  B2C Flow       │──────────────────┐
│ (redirected)    │                  │
└────────┬────────┘                  │
         │ Returns with token        │ Social login
         ▼                           │ (existing account)
┌─────────────────┐                  │
│  Pending        │                  │
│  Verification   │◄─────────────────┘
└────────┬────────┘
         │ Clicks verification link
         ▼
┌─────────────────┐
│  Active User    │
│ (verified)      │
└─────────────────┘
```

## Relationships

```
User (1) ──────< (N) ConsentRecord
  │
  └── externalId ──────> Azure B2C (credentials, verification state)

SignupAttempt (N) ──────> (standalone audit, no FK to User)
```

## Data Flow

1. **Form Submission**: 
   - Frontend validates via Zod schema
   - Breach check via HIBP k-Anonymity
   - On success: Redirect to B2C signup flow

2. **B2C Callback**:
   - B2C returns tokens to frontend
   - Frontend calls `/api/me` with access token
   - Backend creates/updates User from token claims
   - Backend creates ConsentRecord entries

3. **Profile Completion** (social login edge case):
   - If `firstName` or `lastName` missing from claims
   - Set `profileCompleted = false`
   - Prompt user to complete profile before accessing features

## Indexes for Query Patterns

| Query Pattern | Index |
|---------------|-------|
| Find user by B2C ID | `User.externalId` (unique) |
| Find user by email | `User.email` |
| Get user's consents | `ConsentRecord.userId` |
| Rate limit by email | `SignupAttempt(email, createdAt)` |
| Rate limit by IP | `SignupAttempt(ipAddress, createdAt)` |
| Consent audit by type | `ConsentRecord(consentType, grantedAt)` |

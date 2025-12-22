# Feature Specification: ProteinLens SaaS Billing

**Feature Branch**: `002-saas-billing`  
**Created**: 2025-01-23  
**Status**: Draft  
**Input**: User description: "ProteinLens SaaS (Free + Pro MVP) with scan limits + billing"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Pricing Plans (Priority: P1)

Users discover ProteinLens and want to understand pricing options before committing to the platform.

**Why this priority**: This is the entry point for monetization - users must understand what they get for free and what upgrading offers before they can make a purchase decision.

**Independent Test**: Can be fully tested by navigating to /pricing page and verifying all plan details are displayed correctly. Delivers value by enabling transparent pricing discovery without requiring account creation.

**Acceptance Scenarios**:

1. **Given** a user visits the pricing page, **When** viewing plan comparison, **Then** they see Free plan (5 scans/week, 7-day history) and Pro plan (€9.99/month or €79/year with unlimited scans and full history)
2. **Given** a user compares plans, **When** reviewing feature differences, **Then** each plan clearly shows scan limits, history retention, export capabilities, and price
3. **Given** an anonymous user views pricing, **When** they click "Get Started" on Free plan, **Then** they are directed to sign up
4. **Given** an anonymous user views pricing, **When** they click "Upgrade to Pro" button, **Then** they are prompted to create an account first

---

### User Story 2 - Subscribe to Pro Plan (Priority: P2)

Existing Free users want to upgrade to Pro for unlimited scans and full meal history access.

**Why this priority**: This is the critical conversion path - the primary revenue driver for the business. Without this, monetization cannot happen.

**Independent Test**: Can be fully tested by creating a Free account, navigating to upgrade flow, completing Stripe checkout, and verifying Pro features are activated. Delivers value by enabling revenue generation.

**Acceptance Scenarios**:

1. **Given** a logged-in Free user, **When** they click "Upgrade to Pro" button, **Then** they are redirected to Stripe Checkout with monthly and annual pricing options
2. **Given** a user in Stripe Checkout, **When** they complete payment for monthly plan, **Then** their account is upgraded to Pro (€9.99/month recurring)
3. **Given** a user in Stripe Checkout, **When** they complete payment for annual plan, **Then** their account is upgraded to Pro (€79/year recurring, 33% savings)
4. **Given** a user completes Pro subscription, **When** payment succeeds, **Then** they receive email confirmation with receipt and subscription details
5. **Given** a subscription payment succeeds, **When** Stripe webhook is received, **Then** user's account status is updated to Pro within 30 seconds

---

### User Story 3 - Enforce Free Tier Scan Limits (Priority: P1)

Free users must have their usage limited to 5 scans per week to protect system resources and incentivize Pro upgrades.

**Why this priority**: Critical for business sustainability - prevents abuse of free tier and creates clear upgrade motivation. Must be in place from day one of monetization.

**Independent Test**: Can be fully tested by creating Free account, performing 5 scans in one week, attempting 6th scan, and verifying rejection with upgrade prompt. Delivers value by enforcing fair usage limits.

**Acceptance Scenarios**:

1. **Given** a Free user with 0 scans this week, **When** they upload their 5th meal photo, **Then** scan succeeds and counter shows "0 scans remaining this week"
2. **Given** a Free user with 5 scans this week, **When** they attempt to upload a 6th meal photo, **Then** upload is blocked with message "Weekly limit reached. Upgrade to Pro for unlimited scans."
3. **Given** a Free user hit their weekly limit on Monday, **When** the following Monday arrives (7 days later), **Then** their scan counter resets to 5 available scans
4. **Given** a Free user with 3 scans this week, **When** they view the app, **Then** a counter displays "2 scans remaining this week (resets in X days)"
5. **Given** a Free user hits scan limit, **When** viewing limit message, **Then** a clear "Upgrade to Pro" call-to-action is displayed

---

### User Story 4 - Pro Users Get Unlimited Access (Priority: P2)

Pro subscribers expect unrestricted access to all features as advertised in their subscription benefits.

**Why this priority**: Core value proposition of Pro tier - must work correctly to maintain customer satisfaction and prevent churn.

**Independent Test**: Can be fully tested by upgrading to Pro and verifying unlimited scans, full history access, and export functionality work without restrictions. Delivers value by fulfilling the Pro tier promise.

**Acceptance Scenarios**:

1. **Given** a Pro user, **When** they upload their 10th meal photo in one day, **Then** scan completes successfully with no limit warnings
2. **Given** a Pro user, **When** they view meal history, **Then** all historical meals are displayed regardless of date (no 7-day restriction)
3. **Given** a Pro user, **When** they request data export, **Then** export functionality is accessible and includes all historical data
4. **Given** a Pro user subscription expires/cancels, **When** current billing period ends, **Then** account downgrades to Free tier with 7-day history and scan limits applied
5. **Given** a lapsed Pro user (now Free), **When** they view meals older than 7 days, **Then** those meals are hidden with message "Upgrade to Pro to access full history"

---

### User Story 5 - Manage Billing and Subscription (Priority: P3)

Pro subscribers need self-service tools to update payment methods, view invoices, and manage their subscription.

**Why this priority**: Reduces support burden and improves customer autonomy. Not critical for initial launch but important for operational efficiency.

**Independent Test**: Can be fully tested by subscribing to Pro, accessing billing portal, updating payment method, and downloading invoices. Delivers value by enabling self-service subscription management.

**Acceptance Scenarios**:

1. **Given** a Pro user, **When** they click "Manage Billing" in account settings, **Then** they are redirected to Stripe Customer Portal
2. **Given** a user in Stripe Portal, **When** they update payment method, **Then** new card is saved and used for next billing cycle
3. **Given** a user in Stripe Portal, **When** they view billing history, **Then** all past invoices are listed with download links
4. **Given** a user in Stripe Portal, **When** they cancel subscription, **Then** Pro access continues until end of current billing period, then downgrades to Free
5. **Given** a user canceled subscription, **When** they return to app after billing period ends, **Then** they see "Your Pro plan expired. Reactivate?" message with upgrade button

---

### User Story 6 - Admin View User Subscription Status (Priority: P3)

Support staff and administrators need visibility into user subscription status to troubleshoot billing issues and answer customer questions.

**Why this priority**: Operational necessity for customer support but not required for user-facing functionality. Can be added after core billing works.

**Independent Test**: Can be fully tested by creating admin account, searching for test users, and viewing their subscription details. Delivers value by enabling efficient customer support.

**Acceptance Scenarios**:

1. **Given** an admin user, **When** they search for a user by email, **Then** user's current plan (Free/Pro), subscription status, and billing cycle are displayed
2. **Given** an admin viewing user details, **When** user is on Pro plan, **Then** current period end date, payment method last 4 digits, and next billing amount are shown
3. **Given** an admin viewing user details, **When** user has failed payments, **Then** payment errors and retry dates are displayed
4. **Given** an admin viewing Free user, **When** checking usage stats, **Then** current week's scan count and reset date are shown

---

### Edge Cases

- **Weekly Reset Timing**: What happens when a Free user's scan count resets exactly when they're mid-upload? System should use timestamp of upload initiation (not completion) to determine if scan is within current week's quota.

- **Payment Failure During Active Subscription**: How does system handle failed recurring payment? Pro access continues for grace period (5 days), user receives email notification, Stripe retries payment automatically. After grace period expires, account downgrades to Free tier.

- **Upgrade During Active Week**: What happens when Free user with 4 scans used upgrades to Pro mid-week? Scan counter is immediately cleared and user gets unlimited access. Historical scan count is preserved for analytics but no longer enforced.

- **Subscription Cancellation Timing**: How does system handle cancellation requested 1 day before renewal? Subscription is canceled immediately in Stripe, Pro access continues until end of current period, no future charges occur.

- **Double Webhook Delivery**: How does system handle Stripe sending duplicate webhook events? Webhook handler must be idempotent - use Stripe event ID to deduplicate and only process each event once.

- **Timezone Confusion**: What happens when Free user in timezone UTC+8 hits limit on Sunday but server timezone is UTC? All scan counters use UTC timezone, weekly period is Monday 00:00 UTC to Sunday 23:59 UTC. User sees countdown timer in their local timezone but enforcement uses UTC.

- **Concurrent Scan Uploads**: What happens when Free user with 4 scans uploads 2 photos simultaneously reaching 6 total? Both upload requests are processed atomically - first request succeeds (5 scans), second request fails (limit exceeded). Race condition prevented by database-level atomic increment.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display pricing page showing Free plan (5 scans/week, 7-day history) and Pro plan (€9.99/month or €79/year) with feature comparison
- **FR-002**: System MUST integrate Stripe Checkout for Pro subscription purchases with both monthly and annual billing options
- **FR-003**: System MUST track weekly scan usage for Free tier users with counter resetting every Monday at 00:00 UTC
- **FR-004**: System MUST enforce 5 scans per week limit for Free users by rejecting upload requests when quota exceeded
- **FR-005**: System MUST allow unlimited scans for active Pro subscribers without quota enforcement
- **FR-006**: System MUST restrict Free users to viewing only meals from last 7 days
- **FR-007**: System MUST allow Pro users to view full meal history regardless of date
- **FR-008**: System MUST process Stripe webhook events for subscription lifecycle (created, updated, canceled, payment_failed)
- **FR-009**: System MUST update user account status within 30 seconds of receiving Stripe webhook confirmation
- **FR-010**: System MUST verify Stripe webhook signatures to prevent unauthorized requests
- **FR-011**: System MUST redirect users to Stripe Customer Portal for billing management (payment methods, invoices, cancellation)
- **FR-012**: System MUST display scan usage counter showing "X scans remaining this week" for Free users
- **FR-013**: System MUST display countdown timer showing "Resets in X days" for Free tier weekly quota
- **FR-014**: System MUST show upgrade prompt with "Upgrade to Pro" button when Free users hit scan limit
- **FR-015**: System MUST send email confirmation after successful Pro subscription purchase
- **FR-016**: System MUST automatically downgrade Pro users to Free tier when subscription expires or is canceled (after current period ends)
- **FR-017**: System MUST hide data export functionality for Free users (Pro-only feature)
- **FR-018**: System MUST provide admin interface showing user subscription status (plan, billing cycle, payment status)
- **FR-019**: System MUST log all subscription events (upgrades, downgrades, payment failures) for auditing
- **FR-020**: System MUST persist user's Stripe Customer ID and Subscription ID in database

### Key Entities

- **User**: Represents registered users with subscription information
  - Key attributes: stripeCustomerId (links to Stripe), stripeSubscriptionId (current subscription), plan (Free/Pro), planStatus (active/canceled/past_due), currentPeriodEnd (subscription expiry date)
  - Relationships: Has many UsageTracking records, has one Stripe customer account

- **UsageTracking**: Records scan usage for quota enforcement
  - Key attributes: userId, weekStartDate (Monday of week), scanCount (number of scans in week), createdAt
  - Relationships: Belongs to User
  - Purpose: Enables weekly scan limit tracking for Free tier

- **SubscriptionEvent**: Audit log for subscription changes
  - Key attributes: userId, eventType (subscription_created, subscription_updated, subscription_canceled, payment_failed), eventData (JSON snapshot from Stripe), processedAt
  - Relationships: Belongs to User
  - Purpose: Debugging billing issues, compliance auditing, customer support

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Free users can view pricing page and understand plan differences in under 30 seconds (measured by time-on-page analytics and A/B testing comprehension)

- **SC-002**: Users can complete Pro subscription purchase flow (click upgrade → Stripe checkout → confirmation) in under 2 minutes with 90%+ success rate

- **SC-003**: Stripe webhook events update user account status within 30 seconds of event creation 99% of the time

- **SC-004**: Free tier scan limit enforcement blocks 100% of quota-exceeding upload attempts with clear upgrade messaging

- **SC-005**: Pro subscribers experience zero scan rejections or quota warnings during unlimited usage

- **SC-006**: Weekly scan quota resets occur within 5 minutes of scheduled reset time (Monday 00:00 UTC) for all Free users

- **SC-007**: Subscription cancellation requests process successfully 100% of the time with Pro access continuing until end of billing period

- **SC-008**: Payment failure handling follows grace period policy (5 days Pro access, email notifications, automatic downgrade) in 100% of cases

- **SC-009**: System supports 1000 concurrent Free users performing scan quota checks without performance degradation (sub-100ms response time)

- **SC-010**: Billing portal redirects (Stripe Customer Portal) succeed 99%+ of the time with valid session tokens

- **SC-011**: Admin interface loads user subscription details in under 1 second for support ticket resolution

- **SC-012**: Zero security incidents related to unauthorized webhook processing or payment manipulation

## Assumptions

- **Stripe Integration**: We will use Stripe Checkout for payment processing (industry-standard solution for SaaS subscription billing)

- **Email Provider**: System has existing email service configured for transactional emails (subscription confirmations, payment failures)

- **Authentication**: User authentication system is already implemented from Phase 3 MVP

- **Database**: PostgreSQL database with Prisma ORM is available for schema extensions

- **Timezone Standard**: All time-based calculations use UTC to avoid timezone-related bugs, users see local time via client-side conversion

- **Annual Plan Pricing**: €79/year represents 33% discount over monthly (12 × €9.99 = €119.88 baseline) to incentivize annual commitments

- **Weekly Reset Day**: Monday was chosen as weekly reset day as it aligns with typical user behavior (planning meals at start of work week)

- **Grace Period**: 5-day grace period for failed payments balances user experience (time to fix payment issue) with business risk (free service abuse)

- **History Retention**: Free users with meals older than 7 days keep that data in database (not deleted), it's only hidden from UI and re-accessible if they upgrade to Pro

- **Export Feature**: Data export is Pro-only feature (out of scope for Free tier) to create differentiation and prevent bulk data extraction from free accounts

- **Admin Access**: Admin/support dashboard is for internal use only, not customer-facing, and requires separate admin authentication

- **Test Mode**: Stripe test mode will be used for development/staging environments, production will use live mode with environment variable configuration

- **Webhook Reliability**: Stripe guarantees webhook delivery with automatic retries, but system implements idempotent processing to handle duplicates

- **Tax Handling**: Initial launch does not include tax calculation (Stripe Tax can be added later if required for EU VAT compliance)

## Out of Scope

The following features are explicitly excluded from this specification:

- **Athlete Plan Tier**: Third pricing tier mentioned in brainstorming is not included in MVP
- **Coach/Gym Dashboards**: Multi-user accounts and team management features deferred to future release
- **API Access Plans**: Developer API tiers for third-party integrations not included
- **Barcode Scanning**: OCR food recognition from product barcodes is separate feature
- **Referral Program**: User-to-user referral incentives and credits deferred
- **Promo Codes**: Coupon/discount code system not included in initial launch
- **Trial Period**: No free trial of Pro features (Free tier serves as perpetual trial)
- **Offline Mode**: Pro tier does not include offline scan capability in MVP
- **Family Plans**: Shared subscriptions for multiple users under one payment
- **Tiered Storage**: Pro plan includes unlimited history, no storage-based pricing tiers
- **White-Label**: Custom branding options for enterprise customers deferred
- **Payment Methods**: Only credit/debit cards via Stripe Checkout (no PayPal, bank transfer, crypto)
- **Invoicing**: Automated invoice generation for corporate customers (Stripe provides basic receipts)
- **Expense Reports**: Business expense categorization and reporting for Pro users

## Dependencies

- **Stripe Account**: Production-ready Stripe account with API keys (test and live mode)
- **Stripe SDK**: `stripe` npm package integration for backend webhook processing and checkout session creation
- **Webhook Endpoint**: Publicly accessible HTTPS endpoint for Stripe webhook delivery (requires SSL certificate)
- **Email Service**: Transactional email system for subscription confirmations (SendGrid, Postmark, or similar)
- **Environment Variables**: Secure storage for Stripe API keys (secret key, publishable key, webhook signing secret)
- **Database Migrations**: Prisma migration support for User table schema changes and UsageTracking table creation
- **Authentication Middleware**: Existing user authentication to protect upgrade endpoints and billing portal
- **HTTPS in Production**: SSL/TLS required for Stripe Checkout redirect and webhook security
- **Admin Authentication**: Separate admin role/permission system for support dashboard access

## Technical Requirements

### API Endpoints

The following endpoints must be implemented to support subscription functionality:

- **GET /api/pricing**: Returns pricing plan details (Free and Pro features, prices)
- **POST /api/checkout**: Creates Stripe Checkout session for Pro subscription (requires authentication)
  - Request body: `{ priceId: "price_monthly" | "price_annual" }`
  - Response: `{ sessionId: "cs_...", url: "https://checkout.stripe.com/..." }`
- **POST /api/webhooks/stripe**: Processes Stripe webhook events (subscription lifecycle, payment status)
  - Verifies webhook signature
  - Handles events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- **GET /api/billing-portal**: Creates Stripe Customer Portal session (requires authentication)
  - Response: `{ url: "https://billing.stripe.com/session/..." }`
- **GET /api/usage**: Returns current user's scan usage and quota status (requires authentication)
  - Response: `{ plan: "Free", scansThisWeek: 3, scansRemaining: 2, resetDate: "2025-01-27T00:00:00Z" }`
- **GET /api/admin/users/:userId**: Admin endpoint for viewing user subscription details (requires admin role)
  - Response: `{ email, plan, planStatus, subscriptionId, currentPeriodEnd, scanUsage: {...} }`

### Middleware

- **Scan Quota Enforcement**: Middleware applied to meal upload endpoints that checks user's plan and weekly scan count before allowing upload
- **Pro Feature Gate**: Middleware applied to export/advanced features that verifies user has active Pro subscription
- **Admin Role Check**: Middleware for admin endpoints that validates user has admin privileges

### Database Schema Changes

Extend existing `User` table with subscription fields:

- `stripeCustomerId` (String, nullable): Stripe customer ID (cus_...)
- `stripeSubscriptionId` (String, nullable): Active subscription ID (sub_...)
- `plan` (Enum: Free | Pro, default: Free): Current subscription tier
- `planStatus` (Enum: active | canceled | past_due | trialing, default: active): Subscription status
- `currentPeriodEnd` (DateTime, nullable): Subscription expiry date

New `UsageTracking` table:

- `id` (String, primary key): Unique identifier
- `userId` (String, foreign key to User): User reference
- `weekStartDate` (DateTime): Monday of the week (e.g., 2025-01-20T00:00:00Z)
- `scanCount` (Int, default: 0): Number of scans performed this week
- `createdAt` (DateTime): Record creation timestamp
- `updatedAt` (DateTime): Last update timestamp
- Unique constraint: `(userId, weekStartDate)` to prevent duplicate week records

New `SubscriptionEvent` table (for audit logging):

- `id` (String, primary key): Unique identifier
- `userId` (String, foreign key to User): User reference
- `eventType` (String): Event name (subscription_created, payment_failed, etc.)
- `stripeEventId` (String, unique): Stripe event ID for idempotency
- `eventData` (JSON): Full Stripe event payload
- `processedAt` (DateTime): When webhook was processed
- `createdAt` (DateTime): When event was received

### Stripe Configuration

- **Product Setup**: Create Stripe product "ProteinLens Pro" with two prices:
  - Monthly recurring: €9.99/month (price_monthly)
  - Annual recurring: €79/year (price_annual)
- **Webhook Events**: Subscribe to events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`
- **Customer Portal**: Configure Stripe Customer Portal to allow payment method updates, invoice downloads, and subscription cancellation

### Error Handling

- **Webhook Signature Failure**: Return 400 Bad Request if Stripe signature verification fails, log security event
- **Quota Exceeded**: Return 429 Too Many Requests with JSON body `{ error: "Weekly scan limit reached", upgradeUrl: "/pricing" }`
- **Payment Failure**: Send email notification to user, log event, start grace period countdown
- **Stripe API Errors**: Retry transient failures (network errors) up to 3 times with exponential backoff, log permanent failures for manual review

### Security Considerations

- **Webhook Signature Verification**: All webhook requests must be verified using Stripe webhook signing secret to prevent spoofing
- **Idempotent Processing**: Use Stripe event ID to deduplicate webhook deliveries and prevent double-processing
- **API Key Security**: Stripe secret keys must never be exposed to frontend, stored only in backend environment variables
- **User Authorization**: Verify authenticated user owns the subscription before allowing billing portal access
- **Admin Authentication**: Admin endpoints require separate admin role verification, not accessible to regular users
- **HTTPS Only**: All Stripe integrations require HTTPS in production (Stripe rejects HTTP webhook endpoints)

## Risks and Mitigations

- **Risk**: Stripe webhook delivery delays during high traffic
  - **Mitigation**: Implement async webhook processing with queue, decouple webhook receipt from business logic execution, monitor webhook latency in Stripe dashboard

- **Risk**: Free tier abuse (users creating multiple accounts to bypass limits)
  - **Mitigation**: Rate limit account creation per IP address, require email verification, monitor signup patterns for suspicious activity

- **Risk**: Payment method failures causing Pro users to lose access unexpectedly
  - **Mitigation**: Implement 5-day grace period with email notifications, allow users to update payment method during grace period before downgrade

- **Risk**: Database race conditions during concurrent scan uploads at quota boundary
  - **Mitigation**: Use database-level atomic increment operations, implement row-level locking for usage tracking updates

- **Risk**: Timezone bugs causing scan quota to reset at wrong time for users
  - **Mitigation**: Use UTC exclusively for all server-side time calculations, clearly communicate reset time in user's local timezone in UI

- **Risk**: Webhook endpoint downtime preventing subscription status updates
  - **Mitigation**: Stripe automatically retries failed webhooks for 72 hours, implement health check endpoint, set up monitoring alerts for webhook failures

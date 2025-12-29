# Implementation Plan: Slack Authentication Notifications

**Branch**: `014-slack-auth-notifications` | **Date**: 29 December 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-slack-auth-notifications/spec.md`

## Summary

Send Slack webhook notifications when authentication events occur (signup, password reset, email verification) to enable real-time monitoring of user activity. The implementation adds a lightweight `SlackNotifier` utility that integrates with existing auth flows without blocking user operations.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20+)
**Primary Dependencies**: Native `fetch` API (no new dependencies required)
**Storage**: N/A (stateless notifications)
**Testing**: vitest (existing test framework)
**Target Platform**: Azure Functions v4 (Linux)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Notification sent within 30 seconds of event (non-blocking)
**Constraints**: Notification failures MUST NOT block user operations; 1 retry with 1s delay
**Scale/Scope**: <100 events/day initially

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Zero Secrets in Client or Repository | ✅ PASS | Slack webhook URL stored in environment variable (Key Vault in prod) |
| II. Least Privilege Access | ✅ PASS | Only outbound HTTPS to Slack API; no additional permissions needed |
| IV. Traceability & Auditability | ✅ PASS | Notification attempts logged with event type, email, success/failure |
| X. Secrets Management | ✅ PASS | SLACK_WEBHOOK_URL via env var; production uses Key Vault reference |
| XII. Infrastructure-as-Code Idempotency | ✅ PASS | Single env var addition; Bicep update idempotent |

**Gate Status**: PASSED - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/014-slack-auth-notifications/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - internal feature)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── utils/
│   │   ├── email.ts           # Existing - add notification calls after email send
│   │   └── slack.ts           # NEW - SlackNotifier class
│   └── functions/
│       └── auth.ts            # Existing - add notification on email verification complete
└── tests/
    └── unit/
        └── slack.test.ts      # NEW - unit tests for SlackNotifier

infra/
└── bicep/
    └── function-app.bicep     # Existing - add SLACK_WEBHOOK_URL env var
```

**Structure Decision**: Backend-only change. SlackNotifier is a utility class in `backend/src/utils/slack.ts`. Integration points are in existing `email.ts` (after sending verification/reset emails) and `auth.ts` (after email verification success).

## Complexity Tracking

> No constitution violations to justify.

---

## Phase 0: Research

*Research completed inline - no external dependencies or unknowns.*

### Slack Webhook API

- **Endpoint**: `https://hooks.slack.com/services/T.../B.../xxx`
- **Method**: POST with JSON body
- **Rate Limit**: 1 message per second per webhook (sufficient for our volume)
- **Response**: `ok` on success, error message on failure
- **Timeout**: 30 seconds recommended

### Integration Points (from codebase analysis)

1. **Signup verification email** - `backend/src/utils/email.ts` line 152 `sendVerificationEmail()`
2. **Password reset email** - `backend/src/utils/email.ts` line 205 `sendPasswordResetEmail()`  
3. **Email verified** - `backend/src/functions/auth.ts` line 613 `verifyEmail()` function

### Decision Log

| Decision | Rationale | Alternatives Rejected |
|----------|-----------|----------------------|
| Use native `fetch` | No new dependencies; Node 20+ includes fetch natively | axios (adds dependency) |
| Fire-and-forget with 1 retry | Balances reliability with simplicity; matches FR-010 | Queue-based (overkill for volume) |
| Notify after email send success | Reduces noise from failed email attempts | Notify on attempt (too noisy) |

---

## Phase 1: Design

### Data Model

No database entities required. Notifications are stateless.

**SlackNotification Message Structure**:
```typescript
interface SlackNotificationPayload {
  text: string;           // Fallback for notifications
  blocks: SlackBlock[];   // Rich formatting
}
```

### API Contracts

N/A - Internal utility, no external API surface.

### Component Design

**SlackNotifier Class** (`backend/src/utils/slack.ts`):

```typescript
export type NotificationEventType = 'SIGNUP' | 'PASSWORD_RESET' | 'EMAIL_VERIFIED';

export interface NotificationOptions {
  eventType: NotificationEventType;
  email: string;
  timestamp?: Date;
  metadata?: Record<string, string>;
}

export class SlackNotifier {
  private webhookUrl: string | null;
  
  constructor(webhookUrl?: string);
  
  async notify(options: NotificationOptions): Promise<void>;  // Fire-and-forget
  
  private formatMessage(options: NotificationOptions): SlackPayload;
  private sendWithRetry(payload: SlackPayload): Promise<boolean>;
}

export const slackNotifier: SlackNotifier;  // Singleton instance
```

**Integration Points**:

1. `email.ts` - After `sendVerificationEmail()` returns success:
   ```typescript
   slackNotifier.notify({ eventType: 'SIGNUP', email: data.email });
   ```

2. `email.ts` - After `sendPasswordResetEmail()` returns success:
   ```typescript
   slackNotifier.notify({ eventType: 'PASSWORD_RESET', email: data.email });
   ```

3. `auth.ts` - After email verification succeeds:
   ```typescript
   slackNotifier.notify({ eventType: 'EMAIL_VERIFIED', email: user.email });
   ```

### Message Formats

| Event | Emoji | Format |
|-------|-------|--------|
| SIGNUP | 🎉 | "New signup: user@example.com" |
| PASSWORD_RESET | 🔐 | "Password reset requested: user@example.com" |
| EMAIL_VERIFIED | ✅ | "Email verified: user@example.com" |

### Infrastructure

Add to `function-app.bicep`:
```bicep
{
  name: 'SLACK_WEBHOOK_URL'
  value: '' // Set via Key Vault reference or pipeline
}
```

---

## Phase 2: Implementation Tasks

See [tasks.md](./tasks.md) (generated by `/speckit.tasks`).

# Research: Slack Authentication Notifications

**Feature**: 014-slack-auth-notifications
**Date**: 29 December 2025

## Research Tasks

### 1. Slack Webhook API

**Finding**: Slack Incoming Webhooks are the simplest way to post messages programmatically.

- **Endpoint format**: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`
- **Method**: POST
- **Content-Type**: `application/json`
- **Request body**: `{ "text": "Hello, world!" }` or rich Block Kit format
- **Response**: HTTP 200 with body `ok` on success
- **Rate limit**: 1 message per second per webhook
- **Timeout recommendation**: 10-30 seconds

**Documentation**: https://api.slack.com/messaging/webhooks

### 2. Best Practices for Node.js HTTP Calls

**Finding**: Node.js 20+ includes native `fetch` API - no need for axios or node-fetch.

- Use `AbortController` for timeout handling
- Log failures but don't throw - fire-and-forget pattern
- Simple retry: catch error, wait 1s, retry once

### 3. Integration Points Analysis

**Finding**: Three clear integration points identified in codebase.

| Event | File | Function | Trigger Point |
|-------|------|----------|---------------|
| Signup | `email.ts` | `sendVerificationEmail()` | After email sent successfully |
| Password Reset | `email.ts` | `sendPasswordResetEmail()` | After email sent successfully |
| Email Verified | `auth.ts` | `verifyEmail()` | After DB transaction commits |

### 4. Environment Variable Pattern

**Finding**: Existing pattern uses direct env vars with Key Vault references in production.

Example from `email.ts`:
```typescript
const connectionString = process.env.ACS_EMAIL_CONNECTION_STRING;
```

Follow same pattern for `SLACK_WEBHOOK_URL`.

## Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| HTTP Client | Native `fetch` | No new dependencies; available in Node 20+ |
| Retry Strategy | 1 retry, 1s delay | Simple; matches FR-010; sufficient for transient failures |
| Notification Trigger | After successful email send | Reduces noise; ensures email was actually sent |
| Message Format | Block Kit with emoji | Visually distinct; professional appearance |
| Timeout | 10 seconds | Fast enough to not delay response; covers most latency |

## Alternatives Rejected

1. **Queue-based notifications** - Overkill for <100 events/day; adds infrastructure complexity
2. **axios dependency** - Unnecessary since Node 20 has native fetch
3. **Notification on attempt** - Too noisy; would notify even if email fails
4. **Database logging of notifications** - Stateless is simpler; console logs suffice

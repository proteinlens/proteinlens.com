# Quickstart: Slack Authentication Notifications

**Feature**: 014-slack-auth-notifications
**Date**: 29 December 2025

## Overview

This feature sends Slack notifications when users sign up, request password resets, or verify their email.

## Setup

### 1. Create Slack Webhook

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name it "ProteinLens Notifications" and select your workspace
4. Go to "Incoming Webhooks" → Enable → "Add New Webhook to Workspace"
5. Select the channel (e.g., `#user-signups`)
6. Copy the webhook URL

### 2. Configure Environment Variable

**Local Development** (`backend/local.settings.json`):
```json
{
  "Values": {
    "SLACK_WEBHOOK_URL": "https://hooks.slack.com/services/T.../B.../xxx"
  }
}
```

**Production** (via Azure Portal or CLI):
```bash
az functionapp config appsettings set \
  --name proteinlens-api-prod \
  --resource-group proteinlens-rg-prod \
  --settings SLACK_WEBHOOK_URL="https://hooks.slack.com/services/T.../B.../xxx"
```

Or add to Key Vault and use Key Vault reference in Bicep.

### 3. Test Locally

```bash
cd backend
npm run dev
```

Sign up for a new account - you should see a notification in Slack.

## Usage

The `SlackNotifier` is used automatically by the auth flows. No direct usage required.

### Manual Testing

```typescript
import { slackNotifier } from './utils/slack';

// Test notification
await slackNotifier.notify({
  eventType: 'SIGNUP',
  email: 'test@example.com'
});
```

## Notification Examples

| Event | Slack Message |
|-------|---------------|
| Signup | 🎉 *New Signup* `user@example.com` |
| Password Reset | 🔐 *Password Reset Requested* `user@example.com` |
| Email Verified | ✅ *Email Verified* `user@example.com` |

## Troubleshooting

### Notifications not appearing

1. **Check webhook URL**: Ensure `SLACK_WEBHOOK_URL` is set correctly
2. **Check logs**: Look for `[SlackNotifier]` entries in console
3. **Test webhook**: `curl -X POST -H 'Content-type: application/json' --data '{"text":"Test"}' YOUR_WEBHOOK_URL`

### Rate limiting

Slack allows 1 message per second per webhook. At <100 events/day, this won't be an issue.

## Configuration Reference

| Environment Variable | Required | Default | Description |
|---------------------|----------|---------|-------------|
| `SLACK_WEBHOOK_URL` | No | - | Slack webhook URL. If not set, notifications are disabled. |

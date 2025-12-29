# Data Model: Slack Authentication Notifications

**Feature**: 014-slack-auth-notifications
**Date**: 29 December 2025

## Overview

This feature is **stateless** - no database entities are required. Notifications are fire-and-forget with console logging for troubleshooting.

## TypeScript Interfaces

### NotificationEventType

```typescript
export type NotificationEventType = 'SIGNUP' | 'PASSWORD_RESET' | 'EMAIL_VERIFIED';
```

Represents the type of authentication event that triggered the notification.

### NotificationOptions

```typescript
export interface NotificationOptions {
  eventType: NotificationEventType;
  email: string;
  timestamp?: Date;         // Defaults to now
  metadata?: Record<string, string>;  // Optional extra context
}
```

Input to the notification function. Email is required for all events.

### SlackPayload

```typescript
interface SlackPayload {
  text: string;             // Fallback for notifications/accessibility
  blocks?: SlackBlock[];    // Rich formatting (optional)
}

interface SlackBlock {
  type: 'section' | 'divider' | 'context';
  text?: {
    type: 'mrkdwn' | 'plain_text';
    text: string;
  };
  elements?: Array<{
    type: 'mrkdwn' | 'plain_text';
    text: string;
  }>;
}
```

Slack Block Kit message format for rich notifications.

## Message Formats

### Signup Notification

```json
{
  "text": "🎉 New signup: user@example.com",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "🎉 *New Signup*\n`user@example.com`"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "📅 2025-12-29T14:30:00Z"
        }
      ]
    }
  ]
}
```

### Password Reset Notification

```json
{
  "text": "🔐 Password reset requested: user@example.com",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "🔐 *Password Reset Requested*\n`user@example.com`"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "📅 2025-12-29T14:30:00Z"
        }
      ]
    }
  ]
}
```

### Email Verified Notification

```json
{
  "text": "✅ Email verified: user@example.com",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "✅ *Email Verified*\n`user@example.com`"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "📅 2025-12-29T14:30:00Z"
        }
      ]
    }
  ]
}
```

## Validation Rules

| Field | Rule |
|-------|------|
| `eventType` | Must be one of: `SIGNUP`, `PASSWORD_RESET`, `EMAIL_VERIFIED` |
| `email` | Required; must be a valid email format |
| `timestamp` | Optional; defaults to current time |
| `metadata` | Optional; key-value pairs for extra context |

## State Transitions

N/A - Feature is stateless.

## Relationships

N/A - No database entities.

# Data Model: Admin Dashboard

**Feature**: 012-admin-dashboard  
**Date**: 2024-12-26  
**Status**: Complete

## Entity Overview

```
┌─────────────────┐       ┌──────────────────┐
│      User       │◄──────│  AdminAuditLog   │
├─────────────────┤       ├──────────────────┤
│ + suspended     │       │ adminEmail       │
│ + suspendedAt   │       │ action           │
│ + suspendedReason│      │ targetUserId     │
│ + suspendedBy   │       │ details          │
└─────────────────┘       │ ipAddress        │
                          │ createdAt        │
                          └──────────────────┘
```

## Schema Changes

### User Model Extensions

Add to existing `User` model in `prisma/schema.prisma`:

```prisma
model User {
  // ... existing fields ...
  
  // Feature 012: Admin Dashboard - Account Suspension
  suspended         Boolean   @default(false)
  suspendedAt       DateTime?
  suspendedReason   String?   @db.VarChar(500)
  suspendedBy       String?   @db.VarChar(255)  // Admin email who suspended
  
  // Index for filtering suspended users
  @@index([suspended])
}
```

**Field Descriptions**:
- `suspended`: Boolean flag to block user access
- `suspendedAt`: Timestamp when suspension was applied
- `suspendedReason`: Admin-provided reason (required at suspension time)
- `suspendedBy`: Admin email for audit trail

### New AdminAuditLog Model

```prisma
// Admin Audit Log (Feature 012 - Admin Dashboard)
// Append-only log of all admin actions

enum AdminActionType {
  VIEW_USER_LIST        // Admin viewed users list
  VIEW_USER_DETAIL      // Admin viewed specific user
  PLAN_OVERRIDE         // Admin changed user's plan
  SUSPEND_USER          // Admin suspended user
  REACTIVATE_USER       // Admin reactivated suspended user
  EXPORT_USERS          // Admin exported user data
  VIEW_AUDIT_LOG        // Admin viewed audit log
}

model AdminAuditLog {
  id            String          @id @default(uuid())
  
  // Admin identity
  adminEmail    String          @db.VarChar(320)
  adminId       String?         @db.VarChar(255)  // External ID if available
  
  // Action details
  action        AdminActionType
  targetUserId  String?         @db.VarChar(255)  // User affected (if applicable)
  targetEmail   String?         @db.VarChar(320)  // Denormalized for search
  
  // Action metadata
  details       Json?           // Action-specific data (e.g., old plan, new plan)
  reason        String?         @db.VarChar(500)  // Admin-provided reason
  
  // Request context
  requestId     String          @db.Uuid
  ipAddress     String          @db.VarChar(45)
  userAgent     String?         @db.VarChar(500)
  
  // Timestamp (immutable)
  createdAt     DateTime        @default(now())
  
  // Indexes for efficient querying
  @@index([adminEmail, createdAt])
  @@index([targetUserId, createdAt])
  @@index([action, createdAt])
  @@index([createdAt])
}
```

**Design Decisions**:
1. **Append-only**: No `updatedAt` field, no UPDATE endpoints
2. **Denormalized**: `targetEmail` stored for search without JOIN
3. **JSON details**: Flexible schema for action-specific metadata
4. **Request context**: Full audit trail including IP and user agent

## Entity Relationships

```
AdminAuditLog
    │
    └── targetUserId ──▶ User.externalId (soft reference, not FK)
```

**Note**: No foreign key to User to prevent cascade issues and allow logging for deleted users.

## Validation Rules

### User Suspension

| Field | Rule |
|-------|------|
| suspended | Must be boolean |
| suspendedReason | Required when suspended=true, max 500 chars |
| suspendedBy | Required when suspended=true, must be valid admin email |
| suspendedAt | Auto-set when suspended=true |

### AdminAuditLog

| Field | Rule |
|-------|------|
| adminEmail | Required, max 320 chars, must match JWT email |
| action | Required, must be valid AdminActionType |
| targetUserId | Required for user-specific actions |
| requestId | Required, UUID format |
| ipAddress | Required, max 45 chars (IPv6) |
| createdAt | Auto-set, immutable |

## State Transitions

### User Suspension State

```
┌──────────┐     SUSPEND_USER      ┌───────────┐
│  Active  │ ───────────────────▶  │ Suspended │
│ (default)│                       │           │
└──────────┘                       └───────────┘
     ▲                                   │
     │         REACTIVATE_USER           │
     └───────────────────────────────────┘
```

**Transition Rules**:
- SUSPEND_USER: Sets suspended=true, suspendedAt=now(), requires reason
- REACTIVATE_USER: Sets suspended=false, clears suspendedAt/suspendedReason/suspendedBy
- Both transitions create AdminAuditLog entry

### Plan Override State

```
┌──────────┐     PLAN_OVERRIDE     ┌──────────┐
│   FREE   │ ◀──────────────────▶  │   PRO    │
└──────────┘                       └──────────┘
```

**Transition Rules**:
- PLAN_OVERRIDE: Updates User.plan, creates AdminAuditLog with old/new plan
- Does NOT affect Stripe subscription (per spec)

## Query Patterns

### Admin Users List (with pagination)

```sql
SELECT id, externalId, email, firstName, lastName, plan, 
       subscriptionStatus, suspended, createdAt
FROM User
WHERE (:search IS NULL OR email ILIKE :search OR firstName ILIKE :search)
  AND (:plan IS NULL OR plan = :plan)
  AND (:status IS NULL OR subscriptionStatus = :status)
ORDER BY createdAt DESC
LIMIT 50
OFFSET :cursor
```

### Admin Audit Log (with filters)

```sql
SELECT *
FROM AdminAuditLog
WHERE (:adminEmail IS NULL OR adminEmail = :adminEmail)
  AND (:action IS NULL OR action = :action)
  AND (:targetUserId IS NULL OR targetUserId = :targetUserId)
  AND (:startDate IS NULL OR createdAt >= :startDate)
  AND (:endDate IS NULL OR createdAt <= :endDate)
ORDER BY createdAt DESC
LIMIT 50
OFFSET :cursor
```

### Platform Metrics (aggregations)

```sql
-- Total users
SELECT COUNT(*) FROM User;

-- Users by plan
SELECT plan, COUNT(*) FROM User GROUP BY plan;

-- Active users (last 7 days based on usage)
SELECT COUNT(DISTINCT userId) FROM Usage 
WHERE createdAt >= NOW() - INTERVAL '7 days';

-- Total analyses
SELECT COUNT(*) FROM MealAnalysis;
```

## Migration Notes

1. Add `suspended` fields to User model (backward compatible, defaults to false)
2. Create AdminAuditLog table (new table, no migration of existing data)
3. No data migration required - new fields/tables only

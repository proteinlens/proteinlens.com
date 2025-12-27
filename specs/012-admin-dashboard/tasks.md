# Tasks: Admin Dashboard

**Input**: Design documents from `/specs/012-admin-dashboard/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and admin frontend scaffolding

- [x] T001 Create admin frontend directory structure at `admin/` matching plan.md layout
- [x] T002 Initialize admin frontend with Vite + React + TypeScript in `admin/package.json`
- [x] T003 [P] Configure Tailwind CSS in `admin/tailwind.config.ts` (copy from frontend/)
- [x] T004 [P] Configure Vite build settings in `admin/vite.config.ts`
- [x] T005 [P] Create `admin/staticwebapp.config.json` for Azure SWA deployment
- [x] T006 [P] Setup shadcn/ui components in `admin/src/components/ui/` (Button, Dialog, Table, Input, Select)
- [x] T007 [P] Configure TanStack Query provider in `admin/src/main.tsx`
- [x] T008 [P] Configure React Router in `admin/src/App.tsx` with admin routes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema changes and admin middleware that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Add User suspension fields to `backend/prisma/schema.prisma` (suspended, suspendedAt, suspendedReason, suspendedBy)
- [x] T010 Add AdminActionType enum to `backend/prisma/schema.prisma`
- [x] T011 Add AdminAuditLog model to `backend/prisma/schema.prisma` per data-model.md
- [ ] T012 Run Prisma migration: `npx prisma migrate dev --name add-admin-dashboard` (requires Azure DB connectivity - run via deployment pipeline)
- [x] T013 [P] Enhance `backend/src/middleware/adminMiddleware.ts` to create audit log entries for all admin actions
- [x] T014 [P] Create Zod validation schemas in `backend/src/models/adminSchemas.ts` for API request/response types
- [x] T015 [P] Create admin service foundation in `backend/src/services/adminService.ts` with audit logging helper
- [x] T016 [P] Create admin API client in `admin/src/services/adminApi.ts` with base configuration
- [x] T017 [P] Create AdminLayout component in `admin/src/components/AdminLayout.tsx` with navigation sidebar
- [x] T018 Create suspension check in authentication flow in `backend/src/middleware/authGuard.ts` to block suspended users

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View All Users List (Priority: P1) 🎯 MVP

**Goal**: Admin can view paginated list of all users with basic info

**Independent Test**: Navigate to admin dashboard and see users table with pagination

### Implementation for User Story 1

- [x] T019 [US1] Create GET /admin/users endpoint in `backend/src/functions/admin-users.ts` with pagination
- [x] T020 [US1] Implement listUsers service method in `backend/src/services/adminService.ts` with Prisma query
- [x] T021 [US1] Add pagination helper in `backend/src/utils/pagination.ts` for cursor-based pagination (integrated in adminService)
- [x] T022 [P] [US1] Create useAdminUsers hook in `admin/src/hooks/useAdminUsers.ts` for data fetching
- [x] T023 [P] [US1] Create UserTable component in `admin/src/components/UserTable.tsx` with columns per spec
- [x] T024 [P] [US1] Create Pagination component in `admin/src/components/ui/Pagination.tsx`
- [x] T025 [US1] Create UsersPage in `admin/src/pages/UsersPage.tsx` composing UserTable + Pagination
- [x] T026 [US1] Add admin auth check in `admin/src/hooks/useAdminAuth.ts` redirecting non-admins
- [x] T027 [US1] Wire up UsersPage route in `admin/src/App.tsx` as default admin route

**Checkpoint**: User Story 1 complete - admin can view paginated user list

---

## Phase 4: User Story 2 - View User Details (Priority: P1) 🎯 MVP

**Goal**: Admin can click a user to see full profile, subscription, and usage details

**Independent Test**: Click a user row, see detailed panel with subscription events

### Implementation for User Story 2

- [x] T028 [US2] Enhance existing `backend/src/functions/admin-user.ts` to include suspension status in response
- [x] T029 [P] [US2] Create useUserDetail hook in `admin/src/hooks/useUserDetail.ts`
- [x] T030 [P] [US2] Create UserProfileCard component in `admin/src/components/UserProfileCard.tsx` (integrated in UserDetailPage)
- [x] T031 [P] [US2] Create SubscriptionCard component in `admin/src/components/SubscriptionCard.tsx` (integrated in UserDetailPage)
- [x] T032 [P] [US2] Create UsageCard component in `admin/src/components/UsageCard.tsx` (integrated in UserDetailPage)
- [x] T033 [P] [US2] Create SubscriptionEventsTable component in `admin/src/components/SubscriptionEventsTable.tsx` (integrated in UserDetailPage)
- [x] T034 [US2] Create UserDetailPage in `admin/src/pages/UserDetailPage.tsx` composing all cards
- [x] T035 [US2] Add user detail route `/users/:userId` in `admin/src/App.tsx`
- [x] T036 [US2] Add click handler in UserTable to navigate to user detail page

**Checkpoint**: User Stories 1+2 complete - admin can browse users and view details

---

## Phase 5: User Story 3 - View Platform Analytics (Priority: P2)

**Goal**: Admin sees metrics dashboard with user counts, plan distribution, usage stats

**Independent Test**: Visit admin dashboard home, see metrics cards with real data

### Implementation for User Story 3

- [x] T037 [US3] Create GET /admin/metrics endpoint in `backend/src/functions/admin-metrics.ts`
- [x] T038 [US3] Implement getMetrics service method in `backend/src/services/adminService.ts` with aggregation queries
- [x] T039 [P] [US3] Create useMetrics hook in `admin/src/hooks/useMetrics.ts`
- [x] T040 [P] [US3] Create MetricCard component in `admin/src/components/MetricCard.tsx`
- [x] T041 [P] [US3] Create MetricsCards component in `admin/src/components/MetricsCards.tsx` (integrated in DashboardPage)
- [x] T042 [US3] Create DashboardPage in `admin/src/pages/DashboardPage.tsx` with MetricsCards + quick links
- [x] T043 [US3] Add dashboard route `/` in `admin/src/App.tsx` as home

**Checkpoint**: User Story 3 complete - admin dashboard shows platform overview

---

## Phase 6: User Story 4 - Search and Filter Users (Priority: P2)

**Goal**: Admin can search by email/name and filter by plan/status

**Independent Test**: Enter search term, apply filters, see filtered results

### Implementation for User Story 4

- [x] T044 [US4] Enhance GET /admin/users in `backend/src/functions/admin-users.ts` to support search, plan, status, suspended, sortBy, sortOrder query params
- [x] T045 [US4] Update listUsers service in `backend/src/services/adminService.ts` with filter/search logic
- [x] T046 [P] [US4] Create SearchInput component in `admin/src/components/ui/SearchInput.tsx`
- [x] T047 [P] [US4] Create FilterBar component in `admin/src/components/FilterBar.tsx` with plan/status/suspended dropdowns
- [x] T048 [US4] Update useAdminUsers hook to accept filter params in `admin/src/hooks/useAdminUsers.ts`
- [x] T049 [US4] Integrate SearchInput and FilterBar into UsersPage in `admin/src/pages/UsersPage.tsx`
- [x] T050 [US4] Add column header sort indicators and click handlers in `admin/src/components/UserTable.tsx`

**Checkpoint**: User Story 4 complete - admin can search and filter users

---

## Phase 7: User Story 5 - Export User Data (Priority: P3)

**Goal**: Admin can export current filtered user list to CSV

**Independent Test**: Apply filters, click Export, CSV downloads with matching data

### Implementation for User Story 5

- [x] T051 [P] [US5] Create CSV export utility in `admin/src/utils/csvExport.ts` (integrated in ExportButton)
- [x] T052 [P] [US5] Create ExportButton component in `admin/src/components/ExportButton.tsx`
- [x] T053 [US5] Integrate ExportButton into UsersPage in `admin/src/pages/UsersPage.tsx`
- [x] T054 [US5] Log EXPORT_USERS action via admin API call from ExportButton

**Checkpoint**: User Story 5 complete - admin can export user data

---

## Phase 8: User Story 6 - Override User Subscription Plan (Priority: P2)

**Goal**: Admin can change a user's plan with confirmation and audit trail

**Independent Test**: Click Change Plan on user, confirm, plan updates, audit log entry appears

### Implementation for User Story 6

- [x] T055 [US6] Create PUT /admin/users/{userId}/plan endpoint in `backend/src/functions/admin-plan-override.ts`
- [x] T056 [US6] Implement overrideUserPlan service in `backend/src/services/adminService.ts` with audit logging
- [x] T057 [P] [US6] Create PlanOverrideDialog component in `admin/src/components/PlanOverrideDialog.tsx` (integrated in UserDetailPage)
- [x] T058 [P] [US6] Create usePlanOverride mutation hook in `admin/src/hooks/usePlanOverride.ts`
- [x] T059 [US6] Add "Change Plan" button to UserDetailPage triggering PlanOverrideDialog in `admin/src/pages/UserDetailPage.tsx`
- [x] T060 [US6] Show success toast and refresh user data after plan change

**Checkpoint**: User Story 6 complete - admin can override user plans

---

## Phase 9: User Story 7 - Suspend/Reactivate User Account (Priority: P2)

**Goal**: Admin can suspend user with reason, or reactivate suspended user

**Independent Test**: Suspend user, verify they see suspended message on login, reactivate, verify access restored

### Implementation for User Story 7

- [x] T061 [US7] Create POST /admin/users/{userId}/suspend endpoint in `backend/src/functions/admin-suspend.ts`
- [x] T062 [US7] Create POST /admin/users/{userId}/reactivate endpoint in `backend/src/functions/admin-suspend.ts`
- [x] T063 [US7] Implement suspendUser and reactivateUser services in `backend/src/services/adminService.ts`
- [x] T064 [US7] Add self-suspension prevention check in suspendUser service
- [x] T065 [P] [US7] Create SuspendUserDialog component in `admin/src/components/SuspendUserDialog.tsx` (integrated in UserDetailPage)
- [x] T066 [P] [US7] Create useSuspendUser and useReactivateUser hooks in `admin/src/hooks/useSuspendUser.ts`
- [x] T067 [US7] Add Suspend/Reactivate buttons to UserDetailPage based on suspension state in `admin/src/pages/UserDetailPage.tsx`
- [x] T068 [US7] Add suspended user visual indicator (badge) in UserTable in `admin/src/components/UserTable.tsx`
- [x] T069 [US7] Add suspended user blocking UI message in main frontend `frontend/src/components/SuspendedBanner.tsx`

**Checkpoint**: User Story 7 complete - admin can suspend/reactivate accounts

---

## Phase 10: User Story 8 - View Admin Audit Log (Priority: P2)

**Goal**: Admin can view all admin actions with filters for accountability

**Independent Test**: Perform admin actions, navigate to Audit Log, see entries with filters working

### Implementation for User Story 8

- [x] T070 [US8] Create GET /admin/audit-log endpoint in `backend/src/functions/admin-audit-log.ts`
- [x] T071 [US8] Implement getAuditLog service in `backend/src/services/adminService.ts` with filter support
- [x] T072 [P] [US8] Create useAuditLog hook in `admin/src/hooks/useAuditLog.ts`
- [x] T073 [P] [US8] Create AuditLogTable component in `admin/src/components/AuditLogTable.tsx` (integrated in AuditLogPage)
- [x] T074 [P] [US8] Create AuditLogFilters component in `admin/src/components/AuditLogFilters.tsx` (integrated in AuditLogPage)
- [x] T075 [US8] Create AuditLogPage in `admin/src/pages/AuditLogPage.tsx` composing filters + table
- [x] T076 [US8] Add audit log route `/audit-log` and navigation link in `admin/src/App.tsx`

**Checkpoint**: User Story 8 complete - admin can view audit trail

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Infrastructure deployment, documentation, and final touches

- [x] T077 [P] Create admin SWA Bicep module in `infra/bicep/admin-static-web-app.bicep`
- [x] T078 [P] Update `infra/bicep/main.bicep` to include admin SWA deployment with custom domain
- [x] T079 [P] Add ADMIN_EMAILS configuration to backend Function App settings in Bicep
- [x] T080 [P] Create admin deployment pipeline stage in `infra/azure-pipelines.yml`
- [ ] T081 [P] Add loading skeletons to all admin pages for perceived performance
- [ ] T082 [P] Add empty state components for no users/no audit entries
- [x] T083 [P] Add error boundary to admin app in `admin/src/components/ErrorBoundary.tsx`
- [ ] T084 Update README with admin dashboard section
- [ ] T085 Run quickstart.md validation - test all endpoints locally

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - first MVP increment
- **User Story 2 (Phase 4)**: Depends on Foundational - second MVP increment
- **User Stories 3-8 (Phases 5-10)**: Depend on Foundational, can run in parallel after P1 stories
- **Polish (Phase 11)**: Can start after Foundational, completes after all stories

### User Story Dependencies

| User Story | Depends On | Can Parallel With |
|------------|------------|-------------------|
| US1 (View Users List) | Foundational | - |
| US2 (View User Details) | Foundational | US1 |
| US3 (Platform Analytics) | Foundational | US1, US2 |
| US4 (Search/Filter) | US1 (UserTable exists) | US2, US3 |
| US5 (Export) | US1 (UserTable exists) | US2-US4 |
| US6 (Plan Override) | US2 (UserDetailPage exists) | US3-US5 |
| US7 (Suspend/Reactivate) | US2 (UserDetailPage exists) | US3-US6 |
| US8 (Audit Log) | Foundational | US1-US7 |

### Within Each User Story

- Backend endpoint before frontend hook
- Hook before component
- Component before page integration
- API complete before UI complete

---

## Parallel Execution Examples

### Phase 1 Setup (all can run in parallel)

```
T003: Configure Tailwind CSS
T004: Configure Vite build
T005: Create staticwebapp.config.json
T006: Setup shadcn/ui components
T007: Configure TanStack Query
T008: Configure React Router
```

### Phase 2 Foundational (after T009-T012 schema/migration)

```
T013: Enhance adminMiddleware
T014: Create Zod schemas
T015: Create admin service foundation
T016: Create admin API client
T017: Create AdminLayout component
```

### User Story 1 (after T019-T021 backend)

```
T022: useAdminUsers hook
T023: UserTable component
T024: Pagination component
```

### User Story 2 (after T028 backend)

```
T029: useUserDetail hook
T030: UserProfileCard
T031: SubscriptionCard
T032: UsageCard
T033: SubscriptionEventsTable
```

---

## Implementation Strategy

### MVP First (User Stories 1+2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (view users list)
4. Complete Phase 4: User Story 2 (view user details)
5. **STOP and VALIDATE**: Admin can browse and view users
6. Deploy admin.proteinlens.com with MVP

### Incremental Delivery

1. MVP (US1+US2) → Deploy → Admin can support users
2. Add US3 (Metrics) → Deploy → Admin has business insights
3. Add US4 (Search/Filter) → Deploy → Admin efficiency improved
4. Add US6+US7 (Plan Override + Suspend) → Deploy → Admin has write capabilities
5. Add US8 (Audit Log) → Deploy → Full accountability
6. Add US5 (Export) → Deploy → Reporting capability
7. Polish → Final deploy

---

## Notes

- All admin endpoints MUST call audit logging helper in adminService
- Suspension check in authMiddleware applies to ALL user endpoints (not just admin)
- AdminAuditLog has NO update/delete - append-only by design
- Admin SWA is separate from main SWA but uses same backend API
- ADMIN_EMAILS is comma-separated in environment variable

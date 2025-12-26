# Feature Specification: Admin Dashboard

**Feature Branch**: `012-admin-dashboard`  
**Created**: 2024-12-26  
**Status**: Draft  
**Input**: User description: "add admin dashboard"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View All Users List (Priority: P1)

As an admin, I want to view a list of all registered users so that I can monitor the user base and quickly find specific users.

**Why this priority**: This is the foundational admin capability - without seeing users, no other admin functions are meaningful. Provides immediate value for user support and oversight.

**Independent Test**: Can be fully tested by logging in as admin and viewing the users table. Delivers value by giving admins visibility into the entire user base.

**Acceptance Scenarios**:

1. **Given** I am logged in as an admin, **When** I navigate to the admin dashboard, **Then** I see a paginated list of all users with key information (email, name, plan, status, signup date)
2. **Given** I am viewing the users list, **When** I use the search/filter controls, **Then** the list filters to show only matching users
3. **Given** I am viewing the users list, **When** I click on column headers, **Then** the list sorts by that column
4. **Given** I am not logged in as an admin, **When** I try to access the admin dashboard, **Then** I am redirected to login or shown an unauthorized message

---

### User Story 2 - View User Details (Priority: P1)

As an admin, I want to view detailed information about a specific user so that I can assist with support inquiries and understand user behavior.

**Why this priority**: Essential for customer support - admins need to see individual user details to resolve issues. Builds on P1 user list.

**Independent Test**: Can be fully tested by selecting a user from the list and viewing their profile. Delivers value by enabling admins to investigate and assist users.

**Acceptance Scenarios**:

1. **Given** I am viewing the users list, **When** I click on a user row, **Then** I see a detailed view showing profile info, subscription details, and usage statistics
2. **Given** I am viewing user details, **When** I look at the subscription section, **Then** I see their current plan, subscription status, billing period dates, and recent subscription events
3. **Given** I am viewing user details, **When** I look at the usage section, **Then** I see their usage count, recent activity, and quota status

---

### User Story 3 - View Platform Analytics Overview (Priority: P2)

As an admin, I want to see high-level platform metrics on the dashboard so that I can understand overall system health and growth.

**Why this priority**: Provides strategic value for business decisions but not essential for day-to-day user support. Enhances admin dashboard with aggregate insights.

**Independent Test**: Can be fully tested by viewing the dashboard homepage which shows key metrics cards. Delivers value by surfacing important business KPIs at a glance.

**Acceptance Scenarios**:

1. **Given** I am on the admin dashboard home, **When** I view the metrics section, **Then** I see total users, active users (last 7 days), and user growth trends
2. **Given** I am on the admin dashboard home, **When** I view the subscription metrics, **Then** I see count of users by plan (FREE vs PRO) and conversion rates
3. **Given** I am on the admin dashboard home, **When** I view the usage metrics, **Then** I see total analyses performed, analyses in last 7 days, and average analyses per user

---

### User Story 4 - Search and Filter Users (Priority: P2)

As an admin, I want to search for users by email, name, or filter by plan/status so that I can quickly find specific users needing attention.

**Why this priority**: Improves efficiency when the user base grows but basic list viewing (P1) is sufficient for small user counts.

**Independent Test**: Can be fully tested by using search box and filter dropdowns to narrow down user list. Delivers value by reducing time to find specific users.

**Acceptance Scenarios**:

1. **Given** I am on the users list page, **When** I enter text in the search box, **Then** the list filters to show users matching email or name
2. **Given** I am on the users list page, **When** I select a plan filter (FREE/PRO), **Then** only users with that plan are displayed
3. **Given** I am on the users list page, **When** I select a subscription status filter, **Then** only users with that status are displayed
4. **Given** I have applied filters, **When** I click "Clear Filters", **Then** all filters are reset and full list is shown

---

### User Story 5 - Export User Data (Priority: P3)

As an admin, I want to export user data to a spreadsheet format so that I can perform offline analysis or create reports.

**Why this priority**: Nice-to-have feature for reporting and compliance. Lower priority than real-time dashboard capabilities.

**Independent Test**: Can be fully tested by clicking export button and verifying downloaded file contains expected data. Delivers value by enabling data portability and reporting.

**Acceptance Scenarios**:

1. **Given** I am viewing the users list (with or without filters applied), **When** I click "Export to CSV", **Then** a CSV file downloads containing the currently displayed user data
2. **Given** I export data, **When** I open the CSV file, **Then** it contains columns for user ID, email, name, plan, status, signup date, and usage count

---

### User Story 6 - Override User Subscription Plan (Priority: P2)

As an admin, I want to manually change a user's subscription plan so that I can handle special cases like courtesy upgrades, refund downgrades, or enterprise arrangements.

**Why this priority**: Enables customer support to resolve billing-related issues without requiring direct database access. Important for operational flexibility.

**Independent Test**: Can be fully tested by selecting a user and changing their plan from FREE to PRO (or vice versa). Delivers value by empowering support to resolve plan issues immediately.

**Acceptance Scenarios**:

1. **Given** I am viewing a user's details, **When** I click "Change Plan" and select a new plan, **Then** I see a confirmation dialog explaining the impact
2. **Given** I confirm a plan change, **When** the action completes, **Then** the user's plan is updated immediately and an audit log entry is created
3. **Given** I change a user's plan, **When** I view the user's subscription history, **Then** I see the admin-initiated plan change event with timestamp and admin identifier

---

### User Story 7 - Suspend/Reactivate User Account (Priority: P2)

As an admin, I want to suspend or reactivate a user's account so that I can handle abuse cases, security incidents, or user requests for temporary deactivation.

**Why this priority**: Critical for security and abuse prevention. Enables rapid response to policy violations without permanent deletion.

**Independent Test**: Can be fully tested by suspending a user and verifying they cannot access the service, then reactivating and verifying access restored. Delivers value by protecting platform integrity.

**Acceptance Scenarios**:

1. **Given** I am viewing a user's details, **When** I click "Suspend Account", **Then** I see a confirmation dialog asking for a suspension reason
2. **Given** I confirm account suspension with a reason, **When** the action completes, **Then** the user's account is marked as suspended and an audit log entry is created
3. **Given** a user's account is suspended, **When** they attempt to log in or use the service, **Then** they see a message indicating their account is suspended
4. **Given** I am viewing a suspended user's details, **When** I click "Reactivate Account", **Then** the account is restored and the user can access the service again

---

### User Story 8 - View Admin Audit Log (Priority: P2)

As an admin, I want to view a log of all admin actions so that I can maintain accountability and investigate any questionable activity.

**Why this priority**: Important for compliance, security, and internal governance. Provides transparency into admin operations.

**Independent Test**: Can be fully tested by performing admin actions and verifying they appear in the audit log with correct details. Delivers value by enabling oversight of admin activities.

**Acceptance Scenarios**:

1. **Given** I am on the admin dashboard, **When** I navigate to the Audit Log section, **Then** I see a paginated list of all admin actions with timestamp, admin identity, action type, and affected user
2. **Given** I am viewing the audit log, **When** I filter by action type (plan change, suspension, etc.), **Then** only matching actions are displayed
3. **Given** I am viewing the audit log, **When** I search by admin email or affected user email, **Then** the list filters to show relevant entries
4. **Given** I am viewing the audit log, **When** I filter by date range, **Then** only actions within that range are displayed

---

### Edge Cases

- What happens when admin accesses dashboard with no users in system? Display empty state with helpful message.
- How does system handle very large user lists (10,000+ users)? Pagination with server-side filtering to avoid loading all data.
- What if a user is deleted while admin is viewing their details? Show friendly "User not found" message and link back to list.
- How are admin permissions determined? Via email allowlist or admin role flag in user record.
- What if admin tries to suspend an already suspended account? Show current status and only offer reactivation option.
- What if admin tries to change plan for a user with an active Stripe subscription? Show warning about billing implications and require explicit confirmation.
- Can an admin suspend their own account? No, prevent self-suspension to avoid lockout scenarios.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST restrict admin dashboard access to users with admin privileges only
- **FR-002**: Admin privileges MUST be determined by checking if user's email is in the ADMIN_EMAILS environment variable (comma-separated list)
- **FR-003**: System MUST display a paginated list of all users with essential information (email, name, plan, subscription status, signup date)
- **FR-003**: System MUST allow admins to view detailed profile, subscription, and usage information for any user
- **FR-004**: System MUST display aggregate platform metrics (total users, users by plan, total usage)
- **FR-005**: System MUST allow searching users by email address or name
- **FR-006**: System MUST allow filtering users by subscription plan (FREE/PRO)
- **FR-007**: System MUST allow filtering users by subscription status (active/canceled/past_due/trialing)
- **FR-008**: System MUST allow sorting the user list by key columns (email, plan, signup date)
- **FR-009**: System MUST allow exporting the current user list view to CSV format
- **FR-010**: System MUST log all admin access and actions for audit purposes
- **FR-012**: Admin dashboard MUST be accessible via a dedicated subdomain (e.g., admin.proteinlens.com), separate from the main application
- **FR-013**: System MUST display subscription event history when viewing user details
- **FR-013**: System MUST allow admins to override a user's subscription plan (upgrade or downgrade)
- **FR-014**: System MUST require confirmation before executing plan changes
- **FR-015**: System MUST allow admins to suspend user accounts with a required reason
- **FR-016**: System MUST allow admins to reactivate suspended user accounts
- **FR-017**: Suspended users MUST be prevented from accessing the service until reactivated
- **FR-018**: All admin write actions (plan changes, suspensions) MUST be recorded in audit log with admin identity, timestamp, and reason
- **FR-019**: Account suspension MUST NOT automatically cancel or modify the user's Stripe subscription (billing continues independently)
- **FR-020**: System MUST provide a searchable, filterable audit log viewer within the admin dashboard
- **FR-021**: Audit log viewer MUST support filtering by action type, admin identity, affected user, and date range
- **FR-022**: Audit log entries MUST NOT be editable or deletable by any user (append-only)

### Key Entities

- **Admin User**: A user with elevated privileges who can access the admin dashboard. Identified by admin role or inclusion in admin allowlist.
- **Dashboard Metrics**: Aggregate statistics about platform usage including user counts, plan distribution, and usage totals.
- **User Summary**: A condensed view of user information for list display (email, name, plan, status, dates).
- **User Detail**: Comprehensive user information including profile, subscription history, and usage statistics.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can find any user by email within 10 seconds using search functionality
- **SC-002**: Admin dashboard page loads and displays user list within 3 seconds for up to 10,000 users
- **SC-003**: User detail page loads complete information within 2 seconds
- **SC-004**: 100% of admin dashboard access attempts are logged for audit purposes
- **SC-005**: Non-admin users cannot access any admin dashboard functionality (0% unauthorized access)
- **SC-006**: Platform metrics on dashboard are accurate and update at least every 5 minutes
- **SC-007**: CSV export completes within 30 seconds for up to 10,000 users

## Assumptions

- Admin privileges will be determined by an email allowlist in environment configuration (e.g., ADMIN_EMAILS environment variable). This can be evolved to role-based access control later.
- The existing backend `admin-user.ts` endpoint provides the foundation for user detail retrieval.
- Metrics will be calculated on-demand initially; caching/pre-aggregation can be added for scale.
- Export functionality will generate client-side CSV from currently loaded/paginated data.
- The admin dashboard will be deployed as a separate subdomain (admin.proteinlens.com), sharing the same backend API but with a dedicated frontend build.

## Clarifications

### Session 2024-12-26

- Q: Should admins have write/mutation capabilities (plan override, account suspension) in this initial version? → A: Yes, include both plan override and account suspension
- Q: When admin suspends a user with active PRO subscription, what happens to Stripe billing? → A: Keep Stripe billing active, only block service access
- Q: Should the admin audit log be viewable within the dashboard or only via backend? → A: Include searchable, filterable audit log viewer in admin dashboard
- Q: How should admin permissions be determined (email allowlist vs database role flag)? → A: Email allowlist in environment configuration
- Q: How should admin dashboard be accessed within application navigation? → A: Completely separate URL/subdomain (e.g., admin.proteinlens.com)

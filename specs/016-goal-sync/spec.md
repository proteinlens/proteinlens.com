# Feature Specification: Goal Sync Between Calculator and Settings

**Feature Branch**: `016-goal-sync`  
**Created**: 2025-12-31  
**Status**: Draft  
**Input**: User description: "user can save and set goal - fix sync between protein calculator and settings page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save Calculated Goal to Profile (Priority: P1)

As an authenticated user, I want to save my calculated protein target from the Protein Calculator page so that my goal is persisted and used throughout the app.

**Why this priority**: This is the core feature - users calculate their protein needs and expect to save them. Without this working, the calculator provides no persistent value.

**Independent Test**: Can be fully tested by calculating a protein target, clicking "Save to My Profile", and verifying the goal is stored in the database.

**Acceptance Scenarios**:

1. **Given** I am logged in and on the Protein Calculator page with form values different from my saved profile, **When** I click "Calculate My Protein Target", **Then** I see a "Save to My Profile" button (not "✓ Saved")
2. **Given** I have calculated a new protein target (e.g., 95g), **When** I click "Save to My Profile", **Then** my profile is updated on the server with the new target
3. **Given** I have just saved my profile, **When** the save completes successfully, **Then** the button changes to "✓ Saved to your profile"
4. **Given** I have a saved profile showing "✓ Saved", **When** I change any form value (weight, goal, training level, meals), **Then** the button changes back to "Save to My Profile"

---

### User Story 2 - View Saved Goal in Settings (Priority: P1)

As an authenticated user, I want to see my saved protein goal from the calculator displayed on the Settings page so I can verify and optionally adjust it.

**Why this priority**: Users expect consistency across pages. If they save 95g in Calculator, Settings must show 95g.

**Independent Test**: Can be fully tested by saving a goal in Calculator, navigating to Settings, and verifying the displayed goal matches.

**Acceptance Scenarios**:

1. **Given** I saved a protein target of 95g in the Calculator, **When** I navigate to the Settings page, **Then** I see 95g as my daily protein goal
2. **Given** I have not used the Calculator (no saved profile), **When** I visit Settings, **Then** I see the default goal (120g)
3. **Given** I am not logged in, **When** I use the Calculator and save locally, **Then** Settings reads from local storage

---

### User Story 3 - Update Goal from Settings (Priority: P2)

As an authenticated user, I want to manually adjust my protein goal from the Settings page and have it sync back to my profile.

**Why this priority**: Some users prefer to set a custom goal without recalculating. This provides flexibility but is secondary to the core calculator flow.

**Independent Test**: Can be fully tested by changing the goal in Settings and verifying it persists.

**Acceptance Scenarios**:

1. **Given** I am on the Settings page with a goal of 95g, **When** I change it to 80g and save, **Then** my goal is updated to 80g
2. **Given** I changed my goal in Settings to 80g, **When** I navigate to the Calculator, **Then** the displayed result reflects the new calculations (not the old 95g)

---

### Edge Cases

- What happens when the user has both localStorage data and server profile with different values? → Server profile takes precedence for authenticated users
- How does the system handle a failed save operation? → Show error message, keep "Save to My Profile" button enabled for retry
- What if the user logs out after saving? → Local storage should be cleared, goal reverts to default on next visit until login
- What happens when network is unavailable during save? → Show appropriate error, allow retry

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST reset `hasServerProfile` flag when any calculator form value changes (weight, training level, goal, meals per day)
- **FR-002**: System MUST send a POST request to `/api/protein/profile` when user clicks "Save to My Profile"
- **FR-003**: The "Save to My Profile" button MUST be enabled when form values differ from the saved profile
- **FR-004**: Settings page MUST read the daily goal from the user's protein profile (API for authenticated, localStorage for anonymous)
- **FR-005**: Settings page goal changes MUST update both legacy localStorage and protein profile localStorage for consistency
- **FR-006**: System MUST show "✓ Saved to your profile" ONLY after a successful POST to the server
- **FR-007**: System MUST fall back to localStorage protein profile if server request fails or user is unauthenticated
- **FR-008**: System MUST use a priority order for goal retrieval: Server API > Protein Profile localStorage > Legacy Goal localStorage > Default (120g)

### Key Entities

- **Protein Profile**: User's calculated protein settings including weightKg, trainingLevel, goal, mealsPerDay, and the computed proteinTargetG
- **Daily Goal**: The single protein gram target displayed throughout the app (derived from proteinTargetG)
- **hasServerProfile flag**: Boolean indicating whether the current calculator state matches what's saved on the server

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can save their calculated protein target and see the same value in Settings within 3 seconds of navigation
- **SC-002**: When any calculator form value changes, the save button correctly shows "Save to My Profile" (not "✓ Saved") 100% of the time
- **SC-003**: Goal values are consistent across Calculator, Settings, and History pages for the same user session
- **SC-004**: Authenticated users' goals persist across browser sessions and devices
- **SC-005**: Save operation completes in under 2 seconds with appropriate loading feedback

## Assumptions

- Users understand that changing calculator inputs requires recalculating and re-saving
- The protein target calculation is deterministic (same inputs = same output)
- Network connectivity is available for authenticated users to save to server
- localStorage is available and not blocked by browser settings

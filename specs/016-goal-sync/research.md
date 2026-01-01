# Research: Goal Sync Between Calculator and Settings

**Feature**: 016-goal-sync  
**Date**: 2025-12-31  
**Phase**: 0 - Research

## Research Tasks

### 1. Root Cause Analysis

**Unknown**: Why was the "✓ Saved to your profile" showing incorrectly?

**Finding**: The `hasServerProfile` flag in `useProteinCalculator` was set to `true` when the page loaded (if user had an existing profile), but was never reset to `false` when the user changed form values. This caused the button to show "✓ Saved" even for new, unsaved calculations.

**Decision**: Reset `hasServerProfile: false` in all form setter callbacks.

**Alternatives considered**:
- Compare current form values to last-saved values: More complex, requires storing original values
- Track "dirty" state separately: Redundant with existing hasServerProfile flag

---

### 2. Goal Storage Architecture

**Unknown**: Why wasn't the Settings page showing the Calculator's saved goal?

**Finding**: Two separate storage systems existed that were not synchronized:
1. `useProteinCalculator` → saves to `/api/protein/profile` (backend) + `proteinlens_protein_profile` (localStorage)
2. `useGoal` → reads/writes only `proteinlens_daily_goal` (localStorage)

**Decision**: Update `useGoal` to read from protein profile sources with priority ordering:
1. Server API (authenticated users)
2. Protein profile localStorage (`proteinlens_protein_profile`)
3. Legacy goal localStorage (`proteinlens_daily_goal`)
4. Default value (120g)

**Alternatives considered**:
- Merge storage into single system: Breaking change, requires migration
- Add event listener between hooks: Complex coupling, harder to test

---

### 3. Data Flow Verification

**Unknown**: What happens when Settings updates the goal?

**Finding**: Settings page can update the goal independently. To maintain sync, updates from Settings should also update the protein profile localStorage if it exists.

**Decision**: When `setGoal` is called in `useGoal`, also update `proteinlens_protein_profile.proteinTargetG` if that storage exists.

**Alternatives considered**:
- Block Settings goal updates when profile exists: Poor UX, user loses control
- Force recalculation on Settings change: Unnecessary, user may want custom goal

---

## Technology Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| State Management | React useState/useCallback | Consistent with existing hooks, no additional dependencies |
| Storage | localStorage + Server API | Supports both authenticated and anonymous users |
| API | Existing `/api/protein/profile` | No backend changes needed |

## Dependencies Verified

- `loadLocalProteinProfile()` from `proteinStorage.ts` - ✅ Works correctly
- `saveLocalProteinProfile()` from `proteinStorage.ts` - ✅ Works correctly  
- `getProteinProfile()` from `proteinApi.ts` - ✅ Returns `proteinTargetG` in response
- `isUserAuthenticated()` from `proteinApi.ts` - ✅ Returns boolean

## No Outstanding NEEDS CLARIFICATION

All research questions have been resolved. Ready for Phase 1 design.

# Feature Specification: Protein Target Calculator

**Feature Branch**: `015-protein-target-calculator`  
**Created**: 30 December 2025  
**Status**: Draft  
**Input**: User description: "Implement a Protein target calculator with presets based on weight, training level, and goal"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Calculate Daily Protein Target (Priority: P1)

As a user, I want to calculate my daily protein target based on my weight, training level, and fitness goal so that I know how much protein I should consume each day.

**Why this priority**: This is the core value proposition - users need personalized protein recommendations to guide their nutrition. Without this, the feature has no purpose.

**Independent Test**: Can be fully tested by entering weight (e.g., 70kg), selecting training level (regular), and goal (lose) - system returns a daily protein target (e.g., 126g/day).

**Acceptance Scenarios**:

1. **Given** a user with weight 70kg, training "regular", and goal "lose", **When** they calculate their protein target, **Then** the system displays approximately 126g/day (1.8 × 70kg)
2. **Given** a user with weight 90kg, training "none", and goal "maintain", **When** they calculate their protein target, **Then** the system displays 90g/day (1.0 × 90kg)
3. **Given** a user with weight 50kg and calculated target below 60g, **When** the calculation completes, **Then** the system displays 60g/day (minimum clamp applied)
4. **Given** a user with weight 150kg and calculated target above 220g, **When** the calculation completes, **Then** the system displays 220g/day (maximum clamp applied)

---

### User Story 2 - View Per-Meal Protein Distribution (Priority: P1)

As a user, I want to see how my daily protein target is distributed across meals so that I can plan my meals effectively.

**Why this priority**: Users need actionable meal-level guidance, not just a daily number. This makes the recommendation practical and usable.

**Independent Test**: After calculating daily target, system shows per-meal breakdown (e.g., 32g breakfast, 44g lunch, 50g dinner for 126g/day with 3 meals).

**Acceptance Scenarios**:

1. **Given** a user with 126g/day target and 3 meals, **When** viewing the distribution, **Then** the system shows breakfast (25% = ~32g), lunch (35% = ~44g), dinner (40% = ~50g)
2. **Given** a user who changes meals per day from 3 to 4, **When** recalculating, **Then** the system redistributes protein across 4 meals
3. **Given** a calculated meal target below 20g, **When** displaying, **Then** the system suggests "consider adding a protein side" alongside the target

---

### User Story 3 - Select Number of Meals Per Day (Priority: P2)

As a user, I want to choose how many meals I eat per day (2-5) so that the protein distribution matches my eating pattern.

**Why this priority**: Different users have different meal patterns. This customization improves practical applicability but isn't essential for MVP.

**Independent Test**: User can select 2, 3, 4, or 5 meals and see updated per-meal targets immediately.

**Acceptance Scenarios**:

1. **Given** a user viewing their protein target, **When** they select 4 meals per day, **Then** the system recalculates and displays 4 meal targets
2. **Given** a user who hasn't selected meal count, **When** viewing distribution, **Then** the system defaults to 3 meals per day
3. **Given** a user selecting 2 meals, **When** viewing distribution, **Then** protein is split 45%/55% between meals

---

### User Story 4 - Save Profile and Protein Target (Priority: P2)

As a user, I want my profile information (weight, training, goal) and calculated protein target saved so that I don't have to re-enter it each time.

**Why this priority**: Persistence improves UX and enables tracking over time, but users can still get value from one-time calculations.

**Independent Test**: User enters profile, calculates target, closes app, reopens - profile and target are still displayed.

**Acceptance Scenarios**:

1. **Given** a logged-in user who calculates their protein target, **When** they return later, **Then** their profile and target are pre-populated
2. **Given** a user who updates their weight, **When** they save, **Then** the protein target is automatically recalculated
3. **Given** a user profile with goal, weight, and training level, **When** any field changes, **Then** the target updates in real-time

---

### User Story 5 - Admin Manages Protein Presets (Priority: P3)

As an admin, I want to configure the protein multiplier presets and meal distribution settings so that I can tune recommendations without code changes.

**Why this priority**: Admin configurability enables iteration and A/B testing but requires the core calculation to work first.

**Independent Test**: Admin changes "regular/lose" multiplier from 1.8 to 2.0, saves - new users see updated calculations.

**Acceptance Scenarios**:

1. **Given** an admin on the preset configuration page, **When** they update a multiplier value, **Then** subsequent user calculations use the new value
2. **Given** an admin editing meal splits, **When** they save invalid splits (don't sum to ~1.0), **Then** the system shows a validation error
3. **Given** an admin updating min/max clamp values, **When** saved, **Then** all future calculations respect new bounds

---

### Edge Cases

- What happens when user enters 0 or negative weight? → Show validation error "Please enter a valid weight"
- What happens when user enters extremely high weight (500kg+)? → Apply max clamp and show informational message
- How does system handle missing profile fields? → Require weight, training, and goal before calculation
- What happens if admin sets invalid presets (e.g., multiplier = 0)? → Validation prevents saving invalid values
- How does system handle decimal weights? → Accept decimals, round final protein targets to nearest 5g
- What if meal splits don't sum to 1.0 exactly? → Normalize splits before calculation

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate daily protein target using formula: `weight_kg × multiplier` where multiplier is determined by training level and goal
- **FR-002**: System MUST provide 6 preset multipliers based on training (none/regular) × goal (maintain/lose/gain) combinations
- **FR-003**: System MUST clamp calculated targets between minimum (60g) and maximum (220g) per day
- **FR-004**: System MUST distribute daily protein across meals based on configurable meal splits
- **FR-005**: System MUST support meal counts of 2, 3, 4, or 5 per day
- **FR-006**: System MUST round protein targets to the nearest 5 grams for user-friendly display
- **FR-007**: System MUST default to 3 meals per day if user doesn't specify
- **FR-008**: System MUST persist user profile (weight, training, goal, meals per day) for logged-in users
- **FR-009**: System MUST persist calculated protein target (daily and per-meal) for logged-in users
- **FR-010**: System MUST validate user input (positive weight, valid training/goal selection)
- **FR-011**: System MUST recalculate targets automatically when profile inputs change
- **FR-012**: System MUST allow admins to view and edit preset multipliers
- **FR-013**: System MUST allow admins to configure min/max clamp values
- **FR-014**: System MUST allow admins to configure meal split distributions
- **FR-015**: System MUST normalize meal splits if they don't sum to 1.0
- **FR-016**: System MUST display a suggestion when per-meal target is below 20g
- **FR-017**: System MUST provide a dedicated Protein Calculator page accessible from main navigation
- **FR-018**: System MUST allow anonymous users to use the calculator without logging in
- **FR-019**: System MUST persist anonymous user data in localStorage (cleared when browser storage is cleared)
- **FR-020**: System MUST provide a kg/lbs toggle for weight input with automatic conversion (1 kg = 2.205 lbs)

### Default Preset Values

| Training | Goal     | Multiplier (g/kg) |
| -------- | -------- | ----------------- |
| none     | maintain | 1.0               |
| none     | lose     | 1.2               |
| none     | gain     | 1.2               |
| regular  | maintain | 1.6               |
| regular  | lose     | 1.8               |
| regular  | gain     | 1.8               |

### Default Meal Splits

| Meals | Distribution                |
| ----- | --------------------------- |
| 2     | 45% / 55%                   |
| 3     | 25% / 35% / 40%             |
| 4     | 25% / 30% / 25% / 20%       |
| 5     | 20% / 20% / 25% / 20% / 15% |

### Key Entities

- **UserProteinProfile**: Represents user's input parameters
  - Attributes: user_id, weight_kg, training_level (none/regular), goal (maintain/lose/gain), meals_per_day
  - Relationships: Belongs to User, has one ProteinTarget

- **ProteinTarget**: Represents calculated protein recommendation
  - Attributes: user_id, protein_target_g (daily), per_meal_targets (array), multiplier_used, calculated_at
  - Relationships: Belongs to User, derived from UserProteinProfile

- **ProteinPreset**: Admin-configurable calculation parameters
  - Attributes: training_level, goal, multiplier_g_per_kg, active, updated_at
  - Relationships: Referenced during calculation

- **ProteinConfig**: Global configuration for protein calculations
  - Attributes: min_g_day, max_g_day, default_meals_per_day, meal_splits (JSON)
  - Relationships: Applied to all calculations

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can calculate their protein target in under 30 seconds from entering profile data
- **SC-002**: 95% of users who start the calculator complete it and receive a recommendation
- **SC-003**: Calculated protein targets fall within scientifically reasonable ranges (60-220g/day) 100% of the time
- **SC-004**: Per-meal targets always sum to the daily target (accounting for rounding to nearest 5g)
- **SC-005**: Admin preset changes take effect for new calculations within 5 seconds of saving
- **SC-006**: Users who save their profile can retrieve their target on subsequent visits with 100% accuracy
- **SC-007**: System handles 1000 concurrent protein calculations without degradation
- **SC-008**: 80% of users find their protein target "actionable" (via optional feedback)

## Assumptions

- Users can enter weight in either kilograms or pounds (system provides toggle with auto-conversion)
- Users can self-classify their training level as "none" (sedentary/occasional) or "regular" (≥2 sessions/week)
- Users understand the three goal options: maintain weight, lose fat, gain muscle
- The default preset multipliers are evidence-based starting points that admins may tune
- MVP does not require body fat percentage or lean mass calculations (future enhancement)
- MVP does not include medical condition flags like kidney disease (future enhancement)
- Meal names (breakfast, lunch, dinner, snacks) are implied by position, not explicitly stored

## Clarifications

### Session 2025-12-30

- Q: Where should the Protein Target Calculator be accessible from? → A: Dedicated page accessible from main navigation
- Q: Should anonymous (not logged-in) users be able to use the calculator? → A: Yes, with localStorage persistence (lost on clear)
- Q: Should the calculator support weight input in pounds (lbs) with automatic conversion? → A: Yes, provide kg/lbs toggle with auto-conversion

# Feature Specification: Shareable Meal Scans & Diet Style Profiles

**Feature Branch**: `017-shareable-meals-diets`  
**Created**: 2026-01-01  
**Status**: Draft  
**Input**: User description: "I want to every scan analysis to became browsable and sharable on social media. right now every outcome go to https://www.proteinlens.com/ I need probably a different structure. When I scan I see a Pro tip that I don't see reflected on the history when I browse back. Add a diet_style selector (Balanced, Mediterranean, Low-carb, Ketogenic, Plant-based, etc.) as a template layer on top of your existing weight × (training × goal preset) protein calculator, keeping all multipliers admin-editable. For keto, keep the same protein logic but add a strict net-carb cap (e.g., 20–50 g/day, configurable) and optionally a macro split (high fat, moderate protein, very low carbs), then filter meal suggestions to keto-friendly foods. Store everything in one config (DB/JSON) so you can tune multipliers, carb caps, meal splits, and food rules from an admin screen without redeploy."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Shareable Meal Analysis URLs (Priority: P1)

As a user who just scanned a meal, I want to share my meal analysis on social media so that I can show friends what I ate and its nutritional breakdown.

**Why this priority**: Core viral growth feature. Every shared meal is free marketing and drives new user acquisition. Currently all scans redirect to homepage, losing sharing potential
## User Scenarios & Testing *(mandatory)*

### User Story 1 - Shareable Meal Anresulting URL on Twitter/WhatsApp - recipients see the meal image and nutritional data without needing an account.

**Acceptance Scenarios**:

1. **Given** I scan a meal, **When** the analysis completes, **Then** I receive a unique shareable URL (e.g., \`/meal/abc123\`)
2. **Given** I have a meal URL, **When** I share it on social media, **Then** the preview shows the meal image, total protein, and ProteinLens branding (Open Graph meta tags)
3. **Given** someone clicks my shared meal link, **When** they visit the URL, **Then** they see the full meal analysis without logging in (public read-only view)
4. **Given** I'm viewing my own meal via URL, **When** I'm logged in, **Then** I see additional options (delete, edit notes)

---

### User Story 2 - Pro Tips Persistence (Priority: P1)

As a user reviewing my meal history, I want to see the Pro Tips that were shown during my original scan so that I can reference the nutritional advice later.

**Why this priority**: Users report losing valuable context when browsing history. Pro Tips contain actionable advice that users want to recall.

**Independent Test**: Can be tested by scanning a meal, noting the Pro Tip shown, navigating to History, and verifying the same tip appears on that meal entry.

**Acceptance Scenarios**:

1. **Given** I scan a meal and receive a Pro Tip, **When** I view that meal in History, **Then** I see the same Pro Tip displayed
2. **Given** I click on a meal in History, **When** the meal detail modal opens, **Then** the Pro Tip is visible in a dedicated section
3. **Given** I share a meal URL, **When** someone views it, **Then** they also see the Pro Tip (part of the shareable experience)

---

### User Story 3 - Diet Style Selection (Priority: P2)

As a user with specific dietary preferences, I want to select my diet style (e.g., Ketogenic, Mediterranean, Plant-based) so that the app tailors protein targets and meal feedback to my diet.

**Why this priority**: Expands market appeal beyond general fitness users. Keto/plant-based communities are highly engaged and share nutrition tools actively.

**Independent Test**: Can be tested by selecting "Ketogenic" in Settings, then scanning a meal - feedback should include carb warnings and keto-specific guidance.

**Acceptance Scenarios**:

1. **Given** I'm on the Settings page, **When** I look for diet preferences, **Then** I see a Diet Style selector with options: Balanced (default), Mediterranean, Low-carb, Ketogenic, Plant-based
2. **Given** I select "Ketogenic", **When** I save my profile, **Then** my daily carb limit is set (default 20-50g net carbs, configurable)
3. **Given** I have Ketogenic selected, **When** I view my protein calculator results, **Then** I see both protein target AND carb limit displayed
4. **Given** I have a diet style set, **When** I scan a meal, **Then** the analysis includes diet-specific feedback (e.g., "⚠️ High carbs for keto: 45g net carbs")

---

### User Story 4 - Admin-Editable Diet Configuration (Priority: P2)

As an admin, I want to configure diet style parameters (multipliers, carb caps, macro splits) from the admin dashboard so that I can tune the nutrition logic without code deployment.

**Why this priority**: Enables rapid iteration on nutrition science and diet-specific rules. Admins can respond to user feedback instantly.

**Independent Test**: Can be tested by logging into admin, changing the keto carb cap from 30g to 25g, and verifying a user's profile reflects the new value.

**Acceptance Scenarios**:

1. **Given** I'm logged into the admin dashboard, **When** I navigate to Nutrition Config, **Then** I see all diet styles with their editable parameters
2. **Given** I'm editing the Ketogenic diet, **When** I change netCarbCapG from 30 to 25, **Then** the change is saved and immediately effective for users
3. **Given** I want to add a new diet style, **When** I click "Add Diet Style", **Then** I can define name, description, protein multiplier override, carb cap, and fat targets
4. **Given** diet configs exist in the database, **When** the protein calculator loads, **Then** it fetches the latest config without requiring app restart

---

### User Story 5 - Macro Split Display for Specialty Diets (Priority: P3)

As a user following a ketogenic diet, I want to see my daily macro split (fat/protein/carbs) so that I can ensure I'm hitting the right ratios for ketosis.

**Why this priority**: Nice-to-have enhancement for diet-focused users. Builds on P2 foundation.

**Independent Test**: Can be tested by selecting Keto diet and viewing a dashboard widget showing daily macros: 70% fat, 25% protein, 5% carbs.

**Acceptance Scenarios**:

1. **Given** I have Ketogenic diet selected, **When** I view my daily summary, **Then** I see a macro breakdown showing fat/protein/carb percentages
2. **Given** I scan multiple meals in a day, **When** I view the summary, **Then** the macro split updates to reflect all meals
3. **Given** I'm over my carb limit, **When** I view the summary, **Then** the carb section is highlighted with a warning

---

### Edge Cases

- What happens when a meal URL is accessed but the meal was deleted? → Show "Meal not found" with link to homepage
- What happens when a user changes diet style mid-day? → Historical meals keep their original analysis; future scans use new diet
- How does system handle a meal with no identifiable foods? → Show "Unable to analyze" with option to manually log
- What if admin sets invalid config (e.g., negative carb cap)? → Validate config before saving; reject with error message
- How are anonymous users' meals shared? → Each scan gets a unique ID regardless of auth status; sharing works the same

## Requirements *(mandatory)*

### Functional Requirements

**Shareable URLs:**
- **FR-001**: System MUST generate a unique, permanent URL for each meal analysis (format: \`/meal/{id}\`)
- **FR-002**: Shared meal pages MUST include Open Graph meta tags for rich social media previews (image, title, description)
- **FR-003**: Shared meal pages MUST be publicly accessible (read-only) without authentication
- **FR-004**: System MUST support meal privacy toggle (public/private) for authenticated users

**Pro Tips Persistence:**
- **FR-005**: System MUST store the Pro Tip text with each meal analysis at scan time
- **FR-006**: Meal history list MUST display the Pro Tip for each entry
- **FR-007**: Meal detail view MUST show Pro Tip in a dedicated, visually distinct section

**Diet Styles:**
- **FR-008**: System MUST support multiple diet styles: Balanced, Mediterranean, Low-carb, Ketogenic, Plant-based
- **FR-009**: Each diet style MUST have configurable parameters: display name, description, protein multiplier modifier, carb cap (optional), fat target (optional)
- **FR-010**: Users MUST be able to select their diet style from Settings page
- **FR-011**: Diet style selection MUST affect protein calculator output and meal analysis feedback
- **FR-012**: Ketogenic diet MUST enforce a daily net carb limit (default: 20-50g, admin-configurable)

**Admin Configuration:**
- **FR-013**: Admin dashboard MUST provide a Diet Configuration screen
- **FR-014**: Admin MUST be able to edit all diet style parameters without code deployment
- **FR-015**: Configuration changes MUST take effect immediately (no app restart required)
- **FR-016**: System MUST validate configuration values before saving (e.g., non-negative numbers)

### Key Entities

- **MealAnalysis**: Extended to include \`proTip\` (text), \`shareId\` (unique slug), \`isPublic\` (boolean), \`dietStyleAtScan\` (reference to diet style used)
- **DietStyle**: name, slug, description, proteinMultiplierMod (float, 1.0 = no change), netCarbCapG (int, nullable), fatTargetPercent (int, nullable), isActive (boolean)
- **UserProfile**: Extended to include \`dietStyleId\` (foreign key to DietStyle)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can share a meal analysis URL within 5 seconds of scan completion
- **SC-002**: Shared meal links render rich previews on Twitter, Facebook, WhatsApp, and iMessage
- **SC-003**: 100% of historical meals display their original Pro Tip in history view
- **SC-004**: Users can switch diet styles in under 3 clicks from any page
- **SC-005**: Admin config changes reflect in user experience within 60 seconds (no deployment)
- **SC-006**: System handles 10,000+ shareable meal URLs without performance degradation

## Assumptions

- Current meal analysis already generates a unique ID (mealAnalysisId) that can be used as the share slug
- Pro Tips are currently generated but not persisted - implementation will add storage
- The existing protein calculator multiplier system can accommodate diet-style modifiers as an additional layer
- Social platforms support Open Graph meta tags for rich link previews
- Admin users already have authentication via the existing admin dashboard

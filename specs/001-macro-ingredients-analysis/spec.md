# Feature Specification: Macro Ingredients Analysis

**Feature Branch**: `001-macro-ingredients-analysis`  
**Created**: 2 January 2026  
**Status**: Draft  
**Input**: User description: "I want the analysis show not only proteins but also the main macro ingredientes too. adapt UI, database and api to handle it"

## Clarifications

### Session 2026-01-02

- Q: When storing and displaying macronutrient values (carbs, fat, protein), what precision should be used? → A: One decimal place for all values (e.g., 42.3g carbs) - higher precision, better for tracking
- Q: When the AI cannot accurately determine carb or fat content for a food item (e.g., complex mixed dishes), how should the system handle this? → A: Return best estimate with "low" confidence flag - transparent uncertainty, user can edit
- Q: How should the system display macronutrient data for zero-macro foods (e.g., black coffee, water, diet soda)? → A: Display "0.0g" for each macro - consistent format, technically accurate
- Q: When a user manually edits a food item's macronutrient values, what should happen to the other macro values? → A: Require explicit manual input for each edited macro - accurate, user controls all changes
- Q: How should the system display macro data for meals uploaded before this feature was implemented (legacy meals with protein-only data)? → A: Show protein with "Macro data unavailable" message - transparent, consistent layout

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Comprehensive Macronutrient Breakdown (Priority: P1)

Users can view detailed macronutrient information (protein, carbohydrates, fat) for each food item and meal totals when analyzing meal photos, enabling better dietary tracking and nutritional awareness.

**Why this priority**: This is the core value proposition - users currently only see protein data but need complete macronutrient information to make informed dietary decisions. Without this, users cannot effectively track their overall nutrition, especially those following specific diet styles (keto, Mediterranean, etc.) that have carb or fat targets.

**Independent Test**: Can be fully tested by uploading a meal photo and verifying that the analysis shows carbs, fat, and protein for each food item plus meal totals. Delivers immediate value by providing complete nutritional visibility.

**Acceptance Scenarios**:

1. **Given** a user uploads a meal photo, **When** the AI analysis completes, **Then** each food item displays protein, carbohydrates, and fat content in grams
2. **Given** multiple food items in a meal, **When** viewing the meal summary, **Then** total macros (protein, carbs, fat) are displayed with clear labels
3. **Given** a meal with accurate macro data, **When** viewing the analysis results, **Then** macronutrient percentages (% of total calories) are shown alongside gram amounts

---

### User Story 2 - Track Macro History and Daily Totals (Priority: P2)

Users can review their daily macronutrient totals across all meals and see historical trends, allowing them to track compliance with dietary goals over time.

**Why this priority**: After seeing individual meal macros (P1), users need to understand their daily and historical patterns. This enables goal tracking and dietary adjustments over time, which is essential for sustained behavior change.

**Independent Test**: Can be tested by logging multiple meals in a day and verifying the daily summary shows aggregated macros. Delivers value by enabling daily target tracking.

**Acceptance Scenarios**:

1. **Given** a user has logged multiple meals in a day, **When** viewing the daily summary, **Then** total daily macros (protein, carbs, fat) are displayed with gram amounts and calorie breakdown
2. **Given** a user has meal history spanning multiple days, **When** viewing meal history, **Then** each day shows macro totals and percentage distribution
3. **Given** a user has diet style preferences set (e.g., keto with carb cap), **When** viewing daily totals, **Then** compliance indicators show if carb/fat targets were met

---

### User Story 3 - Export Macro Data for External Analysis (Priority: P3)

Users can export their meal and macro data in structured format (JSON/CSV) to use in other nutrition tracking tools or for personal record-keeping.

**Why this priority**: Power users and those with specific dietary needs may want to analyze data in spreadsheets or integrate with other health tracking systems. This is valuable but not essential for core functionality.

**Independent Test**: Can be tested by exporting meal data and verifying it contains complete macro information in the requested format. Delivers value for advanced users without affecting basic usage.

**Acceptance Scenarios**:

1. **Given** a user requests data export, **When** export completes, **Then** the file includes all meals with complete macro breakdown (protein, carbs, fat per food item and meal totals)
2. **Given** exported data, **When** opened in spreadsheet software, **Then** macronutrient columns are properly formatted and machine-readable
3. **Given** a user selects a date range for export, **When** export is generated, **Then** only meals within that range are included with accurate macro totals

---

### Edge Cases

- When AI cannot accurately determine carb or fat content for a food item (e.g., mixed dishes with unknown ingredients), system returns best estimate with "low" confidence flag and allows user editing
- System handles zero-macro foods (e.g., black coffee, water) by displaying "0.0g" for each macro to maintain consistent formatting
- When a user manually edits food items, each macronutrient must be edited independently - system does not auto-recalculate other macros, preserving user control and data accuracy
- Legacy meals (uploaded before this feature) display protein data with "Macro data unavailable" message for carbs/fat, maintaining consistent UI layout
- How are macro percentages calculated and displayed when a meal has extremely low calorie content (under 50 calories)?

## Requirements *(mandatory)*

### Functional Requirements with one decimal place precision (e.g., 42.3g)

- **FR-001**: System MUST analyze and return carbohydrate content (in grams) for each detected food item in a meal photo
- **FR-002**: System MUST analyze and return fat content (in grams) for each detected food item in a meal photo
- **FR-003**: System MUST calculate and display total meal macronutrients (protein, carbs, fat) as sum of all food items
- **FR-004**: System MUST calculate and display macronutrient percentages (% of total calories from each macro) using standard conversion factors (4 cal/g for protein and carbs, 9 cal/g for fat)
- **FR-005**: System MUST persist carbohydrate and fat data alongside protein data in the database for all analyzed meals
- **FR-006**: System MUST display macronutrient data in the UI for individual food items and meal summaries with clear visual hierarchy, using consistent one decimal place format (including "0.0g" for zero-macro items)
- **FR-007**: System MUST support user corrections to carbohydrate and fat values independently (editing one macro does not auto-update others), maintaining audit trail of original AI values
- **FR-008**: System MUST include macro data (carbs, fat) in daily summary calculations alongside existing protein totals
- **FR-009**: System MUST include macro data in meal export functionality (JSON format used by existing export endpoint)
- **FR-010**: System MUST handle legacy meals (protein-only data) by displaying protein values with "Macro data unavailable" message for carbohydrate and fat fields, maintaining consistent UI layout
- **FR-011**: System MUST validate macronutrient inputs to prevent invalid data (negative values, unrealistic amounts exceeding 999g per item)
- **FR-012**: AI analysis prompt MUST request carbohydrate and fat estimates alongside protein content for each food item, with confidence level indicators for uncertain estimates
- **FR-013**: System MUST display total calories calculated from macros (using 4-4-9 conversion) in meal summaries

### Key Entities *(include if feature involves data)*

- **Food Item**: Individual food detected in a meal. Attributes: name, portion size, protein (grams with 1 decimal), carbohydrates (grams with 1 decimal - NEW), fat (grams with 1 decimal - NEW), confidence level, display order
- **Meal Analysis**: Complete analysis of a meal photo. Attributes: total protein, total carbohydrates (NEW), total fat (NEW), total calories (NEW), confidence rating, AI model used, user corrections, timestamp
- **Daily Summary**: Aggregated nutrition data for a specific day. Attributes: date, meal count, total macros (protein, carbs, fat - carbs and fat are NEW), macro percentages, total calories, diet compliance indicators
- **Macro Correction**: User edit to macronutrient values. Attributes: food item reference, field edited (protein/carbs/fat), original AI value, user-provided value, timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view complete macronutrient breakdown (protein, carbs, fat) for 100% of newly analyzed meals within 3 seconds of analysis completion
- **SC-002**: Daily summary displays accurate macro totals that match the sum of individual meals to within 1g precision
- **SC-003**: 90% of analyzed food items return carb and fat estimates with medium or high confidence rating from AI
- **SC-004**: Users can export meal data including complete macro information with all three macronutrients present in the output
- **SC-005**: User corrections to macro values (protein, carbs, or fat) are saved and reflected in daily totals within 2 seconds
- **SC-006**: Legacy meals (protein-only) display gracefully with clear indication that macro data is unavailable, maintaining backward compatibility
- **SC-007**: Macro percentage calculations are accurate to within 1% of expected values based on standard caloric conversion (4-4-9 rule)
- **SC-008**: System maintains sub-3-second response time for meal analysis including new macro data extraction

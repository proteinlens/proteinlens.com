# Feature Specification: ProteinLens Frontend Redesign

**Feature Branch**: `003-frontend-redesign`  
**Created**: 2025-12-22  
**Status**: Draft  
**Input**: User description: "Redesign ProteinLens frontend into a modern, premium interface with hero upload experience, beautiful results card, protein gap coaching widget, history + trends, and polished UI states"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Land on Premium Home Screen (Priority: P1)

A user visits ProteinLens for the first time or returns to the app and is immediately impressed by the design and understands the core value proposition without any explanation.

**Why this priority**: First impression drives adoption. A hero home screen with clear value communication and obvious CTA is the entry point for all user journeys. Without this, users bounce immediately.

**Independent Test**: Can be fully tested by visiting the home page on mobile and desktop, verifying hero section displays correctly, and confirming the primary "Upload meal photo" CTA is accessible. Delivers value by making app feel professional and trustworthy.

**Acceptance Scenarios**:

1. **Given** a user lands on the home page, **When** the page loads, **Then** hero header with tagline and upload CTA is visible within 300ms (FCP)
2. **Given** a user views the home page, **When** they see the interface, **Then** they immediately understand ProteinLens helps track protein intake from meal photos
3. **Given** a user is on mobile (375px viewport), **When** they view the hero section, **Then** upload CTA button is in thumb zone (bottom third) and at least 44×44px
4. **Given** a user sees example results, **When** viewing mock data preview, **Then** they can see total protein, food items, and portion sizes
5. **Given** a user reviews trust elements, **When** looking at the page, **Then** they see "confidence level" badge and "edit anytime" reassurance text
6. **Given** a user is in dark mode, **When** viewing the home page, **Then** the design adapts with appropriate contrast and colors

---

### User Story 2 - Upload Meal Photo with Beautiful Progress (Priority: P1)

A user uploads a meal photo and sees a delightful, progress-driven experience that clearly communicates what's happening (upload → analyze → results) with no ambiguity about status.

**Why this priority**: Core user task. Upload flow is where users engage most. Beautiful progress states build confidence and prevent abandonment. Without polished upload flow, users get frustrated and abandon.

**Independent Test**: Can be fully tested by selecting/uploading a meal photo on mobile, verifying drag/drop works on desktop, confirming image preview displays correctly, and seeing skeleton loading during analysis. Delivers value by making core task feel smooth and reliable.

**Acceptance Scenarios**:

1. **Given** a user is on the home page, **When** they tap the upload button, **Then** either file picker (mobile) or drag/drop zone (desktop) appears immediately
2. **Given** a user selects an image, **When** the image loads, **Then** a preview is shown with options to "Replace" or "Remove"
3. **Given** a user has uploaded an image, **When** they tap "Analyze", **Then** upload progress shows (e.g., "Uploading... 45%")
4. **Given** an image is uploaded and analyzing, **When** the analyze request is in flight, **Then** skeleton loading states appear (shimmer card for results)
5. **Given** a user watches skeleton states, **When** content is still loading, **Then** no blocking spinner—skeleton shows structure and builds anticipation
6. **Given** analysis completes, **When** results arrive, **Then** content fades in smoothly (motion, 300-400ms transition)
7. **Given** a user is on mobile during upload, **When** the image preview is shown, **Then** they can easily tap "Replace" or "Remove" with 44×44px touch targets

---

### User Story 3 - View and Understand Results at a Glance (Priority: P1)

A user sees the meal analysis results and can instantly understand the total protein, calories/macros, itemized foods, and confidence level. Results feel trustworthy and actionable.

**Why this priority**: Core value delivery. Results are the reason users upload. If results are hard to understand or lack confidence indicators, users won't trust the app. This is where nutrition insights happen.

**Independent Test**: Can be fully tested by viewing results card after upload, verifying total protein is prominent, checking food items are listed, and confirming confidence indicator is visible. Delivers value by clearly communicating analysis output.

**Acceptance Scenarios**:

1. **Given** analysis is complete, **When** results appear, **Then** a summary card shows total protein in large, readable text (16px+ on mobile)
2. **Given** a user sees the results summary, **When** they view the card, **Then** it displays: total protein, estimated calories, macrobreakdown (if available from existing API)
3. **Given** a user examines results, **When** they look at the food list, **Then** each item shows: food name, portion size (visual or numeric), protein grams, confidence %
4. **Given** a user sees an item, **When** confidence is shown, **Then** a badge (e.g., "85% confident") is visible next to the item name
5. **Given** a user views the results, **When** the original image is displayed, **Then** they can see "what AI saw" (image preview) on the same screen to verify accuracy
6. **Given** results are displayed, **When** the user examines the layout, **Then** the food list is scrollable on mobile without blocking the total protein display
7. **Given** a user is on mobile, **When** they view a food item, **Then** tapping it expands to show full details (portion, protein, notes)

---

### User Story 4 - Correct Items Quickly and See Totals Update (Priority: P2)

A user can edit food items (name, portion, protein grams) inline and sees the meal total update immediately. Edit flow doesn't require re-upload. Corrections are saved.

**Why this priority**: High confidence comes from control. Users want to fix AI errors (wrong portion estimate, misidentified food) without friction. Editable results reduce frustration and build trust.

**Independent Test**: Can be fully tested by uploading a meal, clicking edit on a food item, changing protein value, and verifying total updates and persists. Delivers value by giving users correction capability.

**Acceptance Scenarios**:

1. **Given** a user sees a food item in results, **When** they tap the item, **Then** an inline edit view appears with editable fields (name, portion, protein grams)
2. **Given** a user is editing a food item, **When** they change the protein value, **Then** the meal total protein updates immediately (optimistic UI)
3. **Given** a user edits an item, **When** they view the edit form, **Then** the original AI-detected value is shown for reference (e.g., "AI detected: 25g, You: 28g")
4. **Given** a user makes corrections, **When** they tap "Save", **Then** the changes are persisted to the database and a confirmation toast appears
5. **Given** a user has made corrections, **When** they view the results screen, **Then** they can see a "Notes" field to add context (e.g., "actually ate half the portion")
6. **Given** a user edits an item, **When** they interact with the form, **Then** form labels are visible (not placeholder-only) with proper contrast (WCAG AA 4.5:1)
7. **Given** a user cancels editing, **When** they dismiss the edit form, **Then** the original results are preserved and the form closes smoothly

---

### User Story 5 - View Protein Gap and Coaching Suggestions (Priority: P2)

A user sees a "Protein Gap" coaching widget that shows how much more protein they need today and displays 3 suggested high-protein food options to close the gap.

**Why this priority**: Actionable coaching builds habit. Users want guidance on what to eat next. Gap visualization + suggestions turn passive tracking into active behavior change.

**Independent Test**: Can be fully tested by viewing the coaching widget after uploading (or on history screen), verifying gap calculation is correct, and checking that 3 suggestions display. Delivers value by guiding users toward their daily protein goal.

**Acceptance Scenarios**:

1. **Given** a user has logged meals for the day, **When** they view the coaching widget, **Then** it displays "Protein Gap: X grams to reach your 150g daily goal"
2. **Given** a user sees the gap widget, **When** the gap is positive, **Then** 3 suggested high-protein foods are displayed with protein content (e.g., "Chicken breast: 31g per 100g")
3. **Given** a user meets or exceeds their daily protein goal, **When** they view the gap widget, **Then** it shows "🎯 Goal met! Protein: 155g (Goal: 150g)"
4. **Given** suggestions are displayed, **When** a user taps a suggestion, **Then** they can log it directly (quick add) or view more details
5. **Given** a user is on mobile, **When** viewing the coaching widget, **Then** the gap number is large and easily readable (16px+)
6. **Given** the widget is shown, **When** a user returns later, **Then** gap resets at midnight UTC and shows progress for the new day

---

### User Story 6 - View Meal History with Weekly Trends (Priority: P3)

A user can view all logged meals grouped by day and see a weekly protein trend chart showing total protein per day for the past 7 days.

**Why this priority**: Context and motivation. Users want to see patterns (high-protein days vs low) to build awareness. History view is secondary but important for repeat engagement.

**Independent Test**: Can be fully tested by uploading multiple meals over several days, viewing the history page, and verifying meals are grouped by day with a weekly trend chart. Delivers value by showing progress and trends.

**Acceptance Scenarios**:

1. **Given** a user navigates to the History page, **When** the page loads, **Then** meals are grouped by date (most recent first) with date headers
2. **Given** a user views a date section, **When** they see multiple meals for that day, **Then** each meal shows thumbnail (uploaded image), total protein, and timestamp
3. **Given** a user views the history, **When** they scroll to the trend section, **Then** a simple bar chart shows protein intake for each day of the past 7 days
4. **Given** a user sees the chart, **When** they hover/tap a bar, **Then** the exact protein value is displayed (e.g., "Mon: 145g")
5. **Given** a user is on mobile, **When** viewing the chart, **Then** it's responsive and doesn't require horizontal scrolling
6. **Given** a user has no meals logged, **When** they visit the history page, **Then** an empty state message appears with a CTA to "Log your first meal"
7. **Given** a user taps on a past meal, **When** they open it, **Then** the full results are displayed with ability to edit or delete

---

### Edge Cases

- **No permission to camera/file picker**: What happens when a user denies camera access on mobile? System should show file picker as fallback.
- **Slow network during analysis**: What if the analysis request times out after 30 seconds? Show error message with "Retry" button; preserve uploaded image.
- **Goal not set**: What if a user hasn't set a daily protein goal? Gap widget should prompt them to set a goal (e.g., "Set your daily protein goal to see personalized coaching").
- **Zero protein in results**: What if AI detects a food with 0g protein (unlikely but possible)? Show the result but flag with lower confidence.
- **Multiple uploads same meal**: Can a user upload the same meal twice? System should handle as separate logs (no deduplication).
- **Offline mode**: App should work offline for viewing history; uploads require network.

## Requirements *(mandatory)*

### Functional Requirements

### Home Page (FR-001 through FR-005)

- **FR-001**: Home page displays hero header with tagline "Analyze meals in seconds, track protein effortlessly" within 300ms (FCP - First Contentful Paint)
- **FR-002**: Home page displays primary CTA button "📸 Upload Meal Photo" in thumb zone (bottom 30% of viewport) with minimum 44×44px touch target
- **FR-003**: Hero section displays trust elements: "AI-powered", "Edit anytime", "Your data, your control" reassurance text
- **FR-004**: Home page displays example results preview showing sample meal analysis with total protein, food items, and confidence levels
- **FR-005**: Home page adapts to both light and dark mode with proper contrast (WCAG AA 4.5:1 minimum)

### Upload & Image Selection (FR-006 through FR-012)

- **FR-006**: Users can upload a meal photo via file picker on mobile or drag/drop zone on desktop
- **FR-007**: After selecting an image, a preview is displayed with options to "Replace Image" and "Remove Image"
- **FR-008**: Image preview shows the selected photo at 1:1 aspect ratio (or fitted) with clear visual boundaries
- **FR-009**: During upload, a progress indicator shows status (e.g., "Uploading... 45%") without blocking the UI
- **FR-010**: During analysis (AI processing), skeleton loading states display instead of spinners—showing structure of expected results (shimmer cards)
- **FR-011**: Skeleton states remain visible until analysis completes, building anticipation without spinners
- **FR-012**: When analysis completes, results fade in smoothly over 300-400ms with gentle motion (respects `prefers-reduced-motion`)

### Results Display (FR-013 through FR-020)

- **FR-013**: Results summary card displays total protein in large, prominent text (minimum 20px on mobile, 24px on desktop)
- **FR-014**: Results card shows estimated calories and macrobreakdown (carbs, fats, protein) if available from AI analysis
- **FR-015**: Food items are listed with columns: name, portion size, protein grams, confidence % badge
- **FR-016**: Each food item displays a confidence % badge (e.g., "92% confident") with a tooltip explaining confidence means "AI is 92% sure this is correct"
- **FR-017**: Original meal image is displayed on the results screen (preview or full-size button) so users can verify what AI saw
- **FR-018**: Results screen displays all food items in a scrollable list without blocking the total protein display
- **FR-019**: On mobile (≤600px), tapping a food item expands to show full details (portion, protein grams, original name, editable fields)
- **FR-020**: Total protein calculation updates in real-time when any food item protein value changes (before save)

### Editing & Corrections (FR-021 through FR-027)

- **FR-021**: Users can tap any food item to enter edit mode with editable fields: food name, portion (text field), protein grams
- **FR-022**: Edit form displays the original AI-detected value as reference text (e.g., "AI detected: 25g, You: —")
- **FR-023**: Tapping "Save" on an edited food item persists the changes and shows a confirmation toast ("Item saved")
- **FR-024**: After editing, the results card immediately updates to show the corrected values (optimistic UI)
- **FR-025**: Users can add a notes field per meal (optional) to explain context (e.g., "actually ate half the portion")
- **FR-026**: Edit form labels are always visible (not placeholder-only) with proper text contrast (WCAG AA 4.5:1)
- **FR-027**: Canceling an edit form discards changes and closes without saving

### Protein Gap & Coaching Widget (FR-028 through FR-032)

- **FR-028**: Coaching widget displays "Protein Gap: X grams to reach your daily goal" with large, readable text (16px+)
- **FR-029**: If daily goal is not set, coaching widget shows "Set your daily protein goal" with a CTA to configure it
- **FR-030**: When gap is positive (protein < goal), widget displays exactly 3 suggested high-protein foods with protein content (e.g., "Chicken breast: 31g per 100g")
- **FR-031**: When gap is zero or negative (goal met), widget displays "🎯 Goal met! Your protein: X grams (Goal: Y grams)"
- **FR-032**: Users can tap a suggestion to "Quick Add" it to the meal or view details; quick add updates the gap immediately

### History & Trends (FR-033 through FR-037)

- **FR-033**: History page displays all logged meals grouped by date (most recent first) with clear date headers
- **FR-034**: Each meal entry in history shows: thumbnail image preview, total protein, timestamp (e.g., "12:34 PM")
- **FR-035**: History page displays a 7-day trend chart (bar chart) showing total daily protein intake for past 7 days
- **FR-036**: Hovering/tapping a trend bar shows the exact protein value for that day (e.g., "Monday: 145g")
- **FR-037**: Empty state on history page (no meals logged) displays a message "No meals logged yet" with a CTA to "Log your first meal"

### Key Entities

- **Meal**: Represents a single meal logged by a user. Attributes: id, userId, uploadedAt (timestamp), image (blob reference), analysis (JSON object containing detected foods and macros), corrections (array of user edits)
- **Food Item**: Represents an individual food detected in a meal. Attributes: id, mealId, name (detected food name), portion (text or visual descriptor), proteinGrams (numeric), confidence (percentage, 0-100), aiDetected (boolean, true if from AI)
- **Daily Goal**: Represents a user's daily protein target. Attributes: userId, goalGrams (default 150g), lastUpdated (timestamp)
- **Correction**: Represents a user edit to a detected food item. Attributes: id, foodId, fieldEdited (name/portion/protein), originalValue, newValue, savedAt (timestamp)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Home page loads with hero section and upload CTA visible within 300ms (FCP) on 3G network
- **SC-002**: Users can upload a meal photo and complete the full upload + analysis flow within 5 seconds (median)
- **SC-003**: Results display with total protein, itemized foods, and confidence badges within 1 second of analysis completion
- **SC-004**: 95% of users can identify the primary CTA ("Upload Meal Photo") within 3 seconds of landing on the home page
- **SC-005**: Users can edit a food item (change protein value) and see total update within 100ms (real-time)
- **SC-006**: History page with past meals and 7-day trend chart loads within 1 second (median)
- **SC-007**: Protein gap widget calculation is 100% accurate (daily total - goal = gap)
- **SC-008**: Users can navigate the entire app using keyboard only (Tab, Enter, Esc) with visible focus indicators (WCAG AA)
- **SC-009**: All UI text meets WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text)
- **SC-010**: Motion animations respect `prefers-reduced-motion` media query (no animation when user has motion reduced)
- **SC-011**: App is fully functional on mobile (375px viewport) and desktop (1024px+) without horizontal scrolling
- **SC-012**: All interactive elements meet minimum 44×44px touch target size on mobile
- **SC-013**: App passes WCAG AA accessibility validation with zero critical violations (tested via axe DevTools)
- **SC-014**: Dark mode theme displays correctly with proper contrast in all screens
- **SC-015**: Empty states (no meals logged) provide clear CTAs with minimum 16px text
- **SC-016**: Users can delete a meal and see history update without page reload (optimistic UI)

# NW-Compass Onboarding Scan Report
**Date**: 2025-12-28  
**Repository**: hoangtn1304/nw-compass  
**Purpose**: Personal net worth projection and financial planning tool

---

## 🗺️ Repository Map

### Architecture Overview
**Type**: Single-page React application (SPA)  
**Stack**: React 19 + TypeScript + Vite + Zustand + Tailwind CSS  
**Total LOC**: ~2,906 lines of TypeScript/TSX  
**Test Coverage**: 11 tests (2 test files) - focused on core business logic

### Key Folders & Entry Points

```
nw-compass/
├── src/
│   ├── main.tsx              # Application entry point, sets up routing & cross-tab sync
│   ├── App.tsx               # Root component with routing configuration
│   │
│   ├── pages/                # 4 main pages (Dashboard, Config, Teaching, Snapshots)
│   │   ├── DashboardPage.tsx      # Main view: projections, charts, KPIs (~180 LOC)
│   │   ├── ConfigPage.tsx         # Configuration UI with form fields (~200 LOC)
│   │   ├── TeachingPage.tsx       # Educational content and guidance
│   │   └── SnapshotsPage.tsx      # Historical snapshots comparison
│   │
│   ├── components/           # 13 UI components (presentational layer)
│   │   ├── NWChart.tsx            # Recharts-based net worth visualization
│   │   ├── ProjectionTable.tsx    # Tabular projection data
│   │   ├── MilestoneTable.tsx     # Milestone tracking display
│   │   ├── AlertList.tsx          # Financial health alerts
│   │   └── [9 other components]
│   │
│   ├── lib/                  # Core business logic (model, calculations)
│   │   ├── model.ts               # Projection engine (buildProjection, findMilestones)
│   │   ├── alerts.ts              # Alert computation logic (8 alert types)
│   │   ├── snapshots.ts           # Snapshot creation and persistence
│   │   ├── configSchema.ts        # Zod schema for config validation
│   │   ├── defaultConfig.ts       # Default financial configuration
│   │   ├── format.ts              # Number formatting utilities
│   │   ├── input.ts               # Input parsing and validation
│   │   ├── milestoneHelpers.ts    # Milestone grid generation
│   │   ├── salaryFast.ts          # Salary tax calculations (Vietnam-specific)
│   │   ├── model.test.ts          # Model unit tests (3 tests)
│   │   └── alerts.test.ts         # Alerts unit tests (8 tests)
│   │
│   └── store/                # State management (Zustand)
│       ├── lifeStore.ts           # Main app state (config + display preferences)
│       └── crossTabSync.ts        # Cross-tab localStorage sync via storage events
│
├── public/                   # Static assets
├── dist/                     # Build output (689 KB bundle - needs code-splitting)
└── [config files]            # vite.config.ts, tsconfig.json, eslint.config.js, etc.
```

### Data Flow

1. **Initialization**: `main.tsx` → `setupCrossTabSync()` → `useLifeStore` (loads persisted state)
2. **Core Model**: User edits `LifeConfig` → `buildProjection()` → generates `ProjectionRow[]`
3. **Derived Data**: Projections → `findMilestones()` + `computeAlerts()` → Dashboard display
4. **Persistence**: 
   - Config stored in localStorage via Zustand persist middleware
   - Snapshots stored separately in `nw-compass:snapshots:v1`
   - Cross-tab sync via storage events

### Key Abstractions

- **LifeConfig**: Complete financial configuration (income, expenses, CAGR assumptions, etc.)
- **ProjectionRow**: Single year projection (age, income, expense, saving, contrib, nwVnd/nwUsd)
- **Scenario**: "bear" | "base" | "bull" - three CAGR scenarios for risk modeling
- **Alert**: Financial health warnings (lifestyle inflation, no fuel, high CAGR, etc.)
- **Snapshot**: Point-in-time capture of config + computed summary for comparison

---

## ⚠️ Top 10 Risks & Tech Debt

Ranked by **Impact × Likelihood ÷ Effort**

### 🔴 High Impact, Quick Fix

**1. ESLint Violations (22+ errors)**  
- **Impact**: 9/10 - Type safety holes, potential runtime bugs, code quality degradation
- **Effort**: 2/10 - Mostly `@typescript-eslint/no-explicit-any` and unused vars
- **Risk**: TypeScript benefits nullified; `any` types bypass type checking
- **Files**: NWChart.tsx (7), ConfigPage.tsx (4), SalaryTaxFast*.tsx (5), others
- **Fix**: Replace `any` with proper types, remove unused vars, fix react-hooks violation

**2. No Input Validation in UI**  
- **Impact**: 7/10 - Users can enter invalid data (negative years, NaN values)
- **Effort**: 3/10 - Add validation to form fields
- **Risk**: `buildProjection()` crashes or produces garbage output
- **Files**: ConfigPage.tsx, SalaryTaxFastInputsCard.tsx
- **Fix**: Add input validation before saving to store

**3. Missing Error Boundaries**  
- **Impact**: 8/10 - App crashes completely on any component error
- **Effort**: 2/10 - Add React error boundary
- **Risk**: Poor UX, no error recovery mechanism
- **Files**: App.tsx, main.tsx
- **Fix**: Wrap routes in ErrorBoundary component

### 🟡 High Impact, Medium Effort

**4. No Test Coverage for UI Components**  
- **Impact**: 7/10 - Regressions in UI logic go undetected
- **Effort**: 6/10 - Requires React Testing Library setup and component tests
- **Risk**: Refactoring becomes risky, bugs in critical paths (Dashboard, Config forms)
- **Files**: All components/ and pages/
- **Fix**: Add smoke tests for critical user paths (config save, projection display)

**5. Bundle Size (689 KB)**  
- **Impact**: 6/10 - Slow initial load, poor mobile experience
- **Effort**: 5/10 - Code-splitting, lazy loading routes
- **Risk**: User abandonment due to slow load times
- **Cause**: Recharts is heavy (~200 KB), no dynamic imports
- **Fix**: Lazy load routes, consider lighter chart library or tree-shaking

**6. No Data Migration Strategy**  
- **Impact**: 8/10 - Breaking changes can lose user data
- **Effort**: 4/10 - Add versioning and migration logic
- **Risk**: localStorage schema changes break existing users
- **Files**: lifeStore.ts (has basic migrate function, but no version tracking)
- **Fix**: Implement explicit version tracking and migration tests

### 🟠 Medium Impact, Quick Fix

**7. Hardcoded Vietnamese Locale**  
- **Impact**: 5/10 - Not i18n-ready, limits user base
- **Effort**: 4/10 - Extract strings, add i18n library
- **Risk**: Cannot expand to other markets without rewrite
- **Files**: alerts.ts (all messages in Vietnamese), format.ts
- **Fix**: Use react-i18next or similar, extract all strings

**8. Magic Numbers & Constants**  
- **Impact**: 4/10 - Hard to understand intent, error-prone changes
- **Effort**: 2/10 - Extract to named constants
- **Risk**: Bugs when changing thresholds (e.g., milestone thresholds, alert thresholds)
- **Files**: model.ts (milestones: [1e6, 1e7, 1e8, 1e9]), alerts.ts (threshold values)
- **Fix**: Create constants file with documented thresholds

**9. Unused Imports & Dead Code**  
- **Impact**: 3/10 - Code bloat, confusing maintenance
- **Effort**: 1/10 - Run auto-fix with ESLint
- **Risk**: Dead code paths hide bugs
- **Files**: milestoneHelpers.ts (unused Scenario import), ProjectionTable.tsx (unused fmtMoney)
- **Fix**: Enable ESLint auto-fix, add pre-commit hook

### 🔵 Medium Impact, Medium Effort

**10. No Accessibility (a11y) Implementation**  
- **Impact**: 6/10 - Excludes users with disabilities, potential legal issues
- **Effort**: 6/10 - Add ARIA labels, keyboard navigation, screen reader support
- **Risk**: Cannot meet accessibility standards (WCAG 2.1)
- **Files**: All interactive components (SegmentedToggle, forms, charts)
- **Fix**: Add eslint-plugin-jsx-a11y, audit with axe-core, add aria-labels

---

## 🛠️ 5 Small PR Menu (< 200 lines each)

### PR #1: Fix ESLint Violations - Type Safety Cleanup
**Scope**: Replace `any` types with proper TypeScript types  
**Impact**: Improves type safety, catches bugs at compile time  
**Blast Radius**: Minimal - only type annotations change

**Files Touched** (~120 lines):
- `src/components/NWChart.tsx` - Add Recharts types for chart props
- `src/components/SalaryTaxFastInputsCard.tsx` - Type event handlers
- `src/components/SalaryTaxFastDerivedCard.tsx` - Type salary calculations
- `src/components/ToastHost.tsx` - Type timer references
- `src/pages/ConfigPage.tsx` - Type event handlers, remove unused imports
- `src/lib/milestoneHelpers.ts` - Remove unused Scenario import

**Acceptance Criteria**:
- ✅ All ESLint errors resolved (0 errors)
- ✅ Build passes with `npm run build`
- ✅ Existing tests pass (`npm test`)
- ✅ No runtime behavior changes
- ✅ Type inference works correctly in IDE

**Verification**: Run `npx eslint . --fix` and manually fix react-hooks violation

---

### PR #2: Add React Error Boundary for Graceful Failures
**Scope**: Wrap app in error boundary with user-friendly error UI  
**Impact**: Prevents complete app crashes, better UX on errors  
**Blast Radius**: Small - only adds new component and wrapper

**Files Touched** (~80 lines):
- `src/components/ErrorBoundary.tsx` (NEW) - Error boundary component
- `src/App.tsx` - Wrap routes in ErrorBoundary
- `src/components/ErrorBoundary.test.tsx` (NEW) - Unit test

**Acceptance Criteria**:
- ✅ Error boundary catches and displays errors gracefully
- ✅ Includes "Reload" button to reset error state
- ✅ Logs errors to console for debugging
- ✅ Test simulates error and verifies boundary catches it
- ✅ Error UI is styled consistently with app theme

**Verification**: Manually throw error in Dashboard, verify error UI appears

---

### PR #3: Extract Magic Numbers to Named Constants
**Scope**: Move hardcoded thresholds and values to constants file  
**Impact**: Improves code readability and maintainability  
**Blast Radius**: Minimal - pure refactor, no logic changes

**Files Touched** (~60 lines):
- `src/lib/constants.ts` (NEW) - Centralized constants
- `src/lib/model.ts` - Use MILESTONE_THRESHOLDS constant
- `src/lib/alerts.ts` - Use alert threshold constants
- `src/lib/constants.test.ts` (NEW) - Verify constants are exported

**Constants to Extract**:
```typescript
// Milestones (USD)
export const MILESTONE_THRESHOLDS = [1e6, 1e7, 1e8, 1e9] as const;

// Alert thresholds
export const LIFESTYLE_INFLATION_WATCH = 0.005;
export const LIFESTYLE_INFLATION_CAUTION = 0.02;
export const HIGH_CAGR_WATCH = 0.25;
export const HIGH_CAGR_CAUTION = 0.30;
export const BUFFER_THIN_WATCH = 0.70;
export const BUFFER_THIN_CAUTION = 0.85;
// ... etc
```

**Acceptance Criteria**:
- ✅ All magic numbers extracted to constants.ts
- ✅ Constants are properly typed and documented
- ✅ All tests pass (no behavior changes)
- ✅ Build succeeds

**Verification**: Search for remaining magic numbers in model.ts and alerts.ts

---

### PR #4: Add Input Validation to Config Forms
**Scope**: Validate user inputs before saving to store  
**Impact**: Prevents invalid data from breaking projections  
**Blast Radius**: Medium - touches form inputs but adds defensive logic

**Files Touched** (~150 lines):
- `src/lib/validation.ts` (NEW) - Input validation utilities
- `src/pages/ConfigPage.tsx` - Add validation to fields
- `src/lib/validation.test.ts` (NEW) - Validation tests

**Validation Rules**:
- Years: integer, positive, startYear ≥ 1900, horizonYears ≤ 120
- Currency amounts: non-negative numbers
- Growth rates: > -1 (not -100% or worse)
- CAGR: reasonable range (-50% to +100%)
- FX rate: positive number

**Acceptance Criteria**:
- ✅ Invalid inputs show inline error messages
- ✅ Save button disabled when validation fails
- ✅ Validation functions have unit tests (100% coverage)
- ✅ User-friendly error messages in Vietnamese
- ✅ Existing valid configs still work

**Verification**: Try entering negative years, zero FX rate, confirm blocked

---

### PR #5: Add Smoke Tests for Critical User Paths
**Scope**: Add React Testing Library tests for Dashboard and Config pages  
**Impact**: Catches regressions in critical flows  
**Blast Radius**: Small - only adds test files

**Files Touched** (~180 lines):
- `src/pages/DashboardPage.test.tsx` (NEW) - Dashboard rendering tests
- `src/pages/ConfigPage.test.tsx` (NEW) - Config form tests
- `src/components/AlertList.test.tsx` (NEW) - Alert display tests

**Test Cases**:
1. **Dashboard**: Renders without crashing, displays KPI cards, shows chart
2. **Config**: Loads default config, updates field values, saves to store
3. **Alerts**: Renders alerts by severity, shows correct alert count

**Acceptance Criteria**:
- ✅ 10+ new tests added
- ✅ All tests pass (`npm test`)
- ✅ Tests use React Testing Library best practices
- ✅ Tests are fast (< 5 seconds total)
- ✅ Coverage includes happy path for each component

**Verification**: Run `npm test`, confirm new test files execute

---

## 📊 Summary

### Current State
- **Code Quality**: Good foundation, but needs type safety improvements
- **Test Coverage**: Strong for business logic (model, alerts), weak for UI
- **Performance**: Acceptable but bundle size is concerning for scale
- **Maintainability**: Clean architecture, but needs constants extraction and validation

### Recommended Priority
1. **PR #1** (Type Safety) - Foundation for all other work
2. **PR #2** (Error Boundary) - Protects users from crashes
3. **PR #4** (Input Validation) - Prevents data corruption
4. **PR #3** (Constants) - Improves maintainability
5. **PR #5** (Tests) - Regression protection

### Long-Term Improvements (Not in Scope)
- Code-splitting and lazy loading (requires architecture changes)
- Internationalization (i18n) infrastructure
- Accessibility audit and WCAG compliance
- Data migration testing framework
- Consider lighter charting library or custom SVG charts

---

**Next Steps**: Review PR menu and select which PRs to implement. Each PR is designed to be independent and can be implemented in any order.

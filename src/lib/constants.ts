/**
 * Centralized constants for magic numbers used across the application.
 * This improves code readability and maintainability by making thresholds explicit and documented.
 */

// ==================== Milestone Thresholds ====================
/**
 * Net worth milestone thresholds in USD.
 * Used by findMilestones() to track when net worth crosses these values.
 */
export const MILESTONE_THRESHOLDS = [1e6, 1e7, 1e8, 1e9] as const;

// ==================== Alert Thresholds ====================

/**
 * Lifestyle Inflation Alert Thresholds
 * Compares expenseGrowth - incomeGrowth
 */
export const LIFESTYLE_INFLATION_WATCH = 0.005;  // 0.5% difference
export const LIFESTYLE_INFLATION_CAUTION = 0.02;  // 2% difference

/**
 * No Fuel Alert Thresholds
 * Maximum consecutive years with saving = 0
 */
export const NO_FUEL_WATCH_STREAK = 2;  // 2+ consecutive years
export const NO_FUEL_CAUTION_STREAK = 5;  // 5+ consecutive years

/**
 * Contribution Capping Alert Thresholds
 * Proportion of years (in first 10 years) where contribution is capped
 */
export const CONTRIB_CAP_WATCH_RATE = 0.3;   // 30% of years
export const CONTRIB_CAP_CAUTION_RATE = 0.6;  // 60% of years

/**
 * High CAGR Alert Thresholds
 * Base case CAGR thresholds
 */
export const HIGH_CAGR_WATCH = 0.25;    // 25% annual return
export const HIGH_CAGR_CAUTION = 0.30;  // 30% annual return

/**
 * Milestone Slippage Alert Thresholds
 * Years of delay compared to last snapshot
 */
export const MILESTONE_SLIPPAGE_WATCH = 1;  // 1 year delay
export const MILESTONE_SLIPPAGE_CAUTION = 3;  // 3+ years delay

/**
 * Buffer Thin Alert Thresholds
 * Ratio of expense to net income
 */
export const BUFFER_THIN_WATCH = 0.70;    // 70% of income
export const BUFFER_THIN_CAUTION = 0.85;  // 85% of income

// ==================== Time Windows ====================

/**
 * Analysis window for rate-based alerts (e.g., contribution capping)
 * Number of years to examine from the start of projection
 */
export const ALERT_ANALYSIS_WINDOW_YEARS = 10;

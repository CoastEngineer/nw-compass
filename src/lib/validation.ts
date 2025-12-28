// src/lib/validation.ts
// Input validation utilities for configuration forms

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate year values (startYear, birthYear)
 * Rules:
 * - Must be a finite number
 * - Must be an integer
 * - Must be >= 1900
 */
export function validateYear(value: number): ValidationResult {
  if (!Number.isFinite(value)) {
    return { valid: false, error: "Năm phải là số hợp lệ" };
  }
  if (!Number.isInteger(value)) {
    return { valid: false, error: "Năm phải là số nguyên" };
  }
  if (value < 1900) {
    return { valid: false, error: "Năm phải >= 1900" };
  }
  return { valid: true };
}

/**
 * Validate horizon years (projection duration)
 * Rules:
 * - Must be a finite number
 * - Must be a positive integer
 * - Must be <= 120 years (reasonable maximum)
 */
export function validateHorizonYears(value: number): ValidationResult {
  if (!Number.isFinite(value)) {
    return { valid: false, error: "Số năm dự báo phải là số hợp lệ" };
  }
  if (!Number.isInteger(value)) {
    return { valid: false, error: "Số năm dự báo phải là số nguyên" };
  }
  if (value < 1) {
    return { valid: false, error: "Số năm dự báo phải > 0" };
  }
  if (value > 120) {
    return { valid: false, error: "Số năm dự báo phải <= 120" };
  }
  return { valid: true };
}

/**
 * Validate currency amounts (income, expense, net worth)
 * Rules:
 * - Must be a finite number
 * - Must be >= 0 (non-negative)
 */
export function validateCurrency(value: number): ValidationResult {
  if (!Number.isFinite(value)) {
    return { valid: false, error: "Số tiền phải là số hợp lệ" };
  }
  if (value < 0) {
    return { valid: false, error: "Số tiền phải >= 0" };
  }
  return { valid: true };
}

/**
 * Validate growth rates (income growth, expense growth)
 * Rules:
 * - Must be a finite number
 * - Must be > -1 (cannot be -100% or worse)
 */
export function validateGrowthRate(value: number): ValidationResult {
  if (!Number.isFinite(value)) {
    return { valid: false, error: "Tỉ lệ tăng trưởng phải là số hợp lệ" };
  }
  if (value <= -1) {
    return { valid: false, error: "Tỉ lệ tăng trưởng phải > -100%" };
  }
  return { valid: true };
}

/**
 * Validate CAGR (Compound Annual Growth Rate)
 * Rules:
 * - Must be a finite number
 * - Must be > -1 (cannot be -100% or worse)
 * - Reasonable range: -50% to +100% (-0.5 to 1.0)
 */
export function validateCAGR(value: number): ValidationResult {
  if (!Number.isFinite(value)) {
    return { valid: false, error: "CAGR phải là số hợp lệ" };
  }
  if (value <= -1) {
    return { valid: false, error: "CAGR phải > -100%" };
  }
  if (value < -0.5) {
    return { valid: false, error: "CAGR < -50% không hợp lý" };
  }
  if (value > 1.0) {
    return { valid: false, error: "CAGR > 100% không hợp lý" };
  }
  return { valid: true };
}

/**
 * Validate FX rate (VND per USD)
 * Rules:
 * - Must be a finite number
 * - Must be > 0 (positive)
 */
export function validateFxRate(value: number): ValidationResult {
  if (!Number.isFinite(value)) {
    return { valid: false, error: "Tỉ giá phải là số hợp lệ" };
  }
  if (value <= 0) {
    return { valid: false, error: "Tỉ giá phải > 0" };
  }
  return { valid: true };
}

/**
 * Validate saving rate cap (percentage between 0 and 1)
 * Rules:
 * - Must be a finite number
 * - Must be >= 0
 * - Must be <= 1 (100%)
 */
export function validateSavingRateCap(value: number): ValidationResult {
  if (!Number.isFinite(value)) {
    return { valid: false, error: "Tỉ lệ tiết kiệm phải là số hợp lệ" };
  }
  if (value < 0) {
    return { valid: false, error: "Tỉ lệ tiết kiệm phải >= 0%" };
  }
  if (value > 1) {
    return { valid: false, error: "Tỉ lệ tiết kiệm phải <= 100%" };
  }
  return { valid: true };
}

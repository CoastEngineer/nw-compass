import { describe, expect, it } from "vitest";
import {
  MILESTONE_THRESHOLDS,
  LIFESTYLE_INFLATION_WATCH,
  LIFESTYLE_INFLATION_CAUTION,
  NO_FUEL_WATCH_STREAK,
  NO_FUEL_CAUTION_STREAK,
  CONTRIB_CAP_WATCH_RATE,
  CONTRIB_CAP_CAUTION_RATE,
  HIGH_CAGR_WATCH,
  HIGH_CAGR_CAUTION,
  MILESTONE_SLIPPAGE_WATCH,
  MILESTONE_SLIPPAGE_CAUTION,
  BUFFER_THIN_WATCH,
  BUFFER_THIN_CAUTION,
  ALERT_ANALYSIS_WINDOW_YEARS,
} from "./constants";

describe("constants", () => {
  it("exports milestone thresholds as expected", () => {
    expect(MILESTONE_THRESHOLDS).toEqual([1e6, 1e7, 1e8, 1e9]);
    expect(MILESTONE_THRESHOLDS).toHaveLength(4);
  });

  it("exports lifestyle inflation thresholds with correct order", () => {
    expect(LIFESTYLE_INFLATION_WATCH).toBe(0.005);
    expect(LIFESTYLE_INFLATION_CAUTION).toBe(0.02);
    expect(LIFESTYLE_INFLATION_WATCH).toBeLessThan(LIFESTYLE_INFLATION_CAUTION);
  });

  it("exports no fuel thresholds with correct order", () => {
    expect(NO_FUEL_WATCH_STREAK).toBe(2);
    expect(NO_FUEL_CAUTION_STREAK).toBe(5);
    expect(NO_FUEL_WATCH_STREAK).toBeLessThan(NO_FUEL_CAUTION_STREAK);
  });

  it("exports contribution cap rate thresholds with correct order", () => {
    expect(CONTRIB_CAP_WATCH_RATE).toBe(0.3);
    expect(CONTRIB_CAP_CAUTION_RATE).toBe(0.6);
    expect(CONTRIB_CAP_WATCH_RATE).toBeLessThan(CONTRIB_CAP_CAUTION_RATE);
  });

  it("exports high CAGR thresholds with correct order", () => {
    expect(HIGH_CAGR_WATCH).toBe(0.25);
    expect(HIGH_CAGR_CAUTION).toBe(0.30);
    expect(HIGH_CAGR_WATCH).toBeLessThan(HIGH_CAGR_CAUTION);
  });

  it("exports milestone slippage thresholds with correct order", () => {
    expect(MILESTONE_SLIPPAGE_WATCH).toBe(1);
    expect(MILESTONE_SLIPPAGE_CAUTION).toBe(3);
    expect(MILESTONE_SLIPPAGE_WATCH).toBeLessThan(MILESTONE_SLIPPAGE_CAUTION);
  });

  it("exports buffer thin thresholds with correct order", () => {
    expect(BUFFER_THIN_WATCH).toBe(0.70);
    expect(BUFFER_THIN_CAUTION).toBe(0.85);
    expect(BUFFER_THIN_WATCH).toBeLessThan(BUFFER_THIN_CAUTION);
  });

  it("exports alert analysis window as 10 years", () => {
    expect(ALERT_ANALYSIS_WINDOW_YEARS).toBe(10);
  });
});

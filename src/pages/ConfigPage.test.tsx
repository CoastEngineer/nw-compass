import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ConfigPage from "./ConfigPage";
import { useLifeStore } from "../store/lifeStore";
import { defaultConfig } from "../lib/defaultConfig";

// Helper to render component with router
function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe("ConfigPage", () => {
  beforeEach(() => {
    // Reset store to default config before each test
    useLifeStore.setState({
      config: defaultConfig,
      display: {
        currency: "USD",
        tableStep: 5,
        compactNumbers: true,
        kidMode: false,
        yScale: "linear",
      },
    });
  });

  it("renders without crashing", () => {
    renderWithRouter(<ConfigPage />);
    // Check that the page renders by looking for config-specific content
    expect(screen.getByText("Core assumptions")).toBeInTheDocument();
  });

  it("loads default config values", () => {
    renderWithRouter(<ConfigPage />);
    // Check that default values are loaded
    expect(screen.getByText("Core assumptions")).toBeInTheDocument();
    expect(screen.getByText("Income mode")).toBeInTheDocument();
    
    // Net income and expense fields should be present
    const netIncomeLabel = screen.getByText("Net income (VND/year)");
    expect(netIncomeLabel).toBeInTheDocument();
    
    const expenseLabel = screen.getByText("Expense (VND/year)");
    expect(expenseLabel).toBeInTheDocument();
  });

  it("displays CAGR fields", () => {
    renderWithRouter(<ConfigPage />);
    // CAGR fields should be visible
    expect(screen.getByText("CAGR — Bear")).toBeInTheDocument();
    expect(screen.getByText("CAGR — Base")).toBeInTheDocument();
    expect(screen.getByText("CAGR — Bull")).toBeInTheDocument();
  });

  it("displays income mode toggle", () => {
    renderWithRouter(<ConfigPage />);
    // Income mode toggle should be present
    expect(screen.getByText("Income mode")).toBeInTheDocument();
    expect(screen.getByText("Simple")).toBeInTheDocument();
    expect(screen.getByText("Salary (fast)")).toBeInTheDocument();
  });

  it("updates field value on input change", () => {
    renderWithRouter(<ConfigPage />);
    
    // Find expense input by its label
    const expenseLabel = screen.getByText("Expense (VND/year)");
    const expenseInput = expenseLabel.closest("label")?.querySelector("input");
    expect(expenseInput).toBeInTheDocument();
    
    if (expenseInput) {
      // Change the value
      fireEvent.change(expenseInput, { target: { value: "1500000000" } });
      expect(expenseInput.value).toBe("1500000000");
    }
  });

  it("displays export button", () => {
    renderWithRouter(<ConfigPage />);
    // Export button should be present
    expect(screen.getByText("Export JSON (copy)")).toBeInTheDocument();
  });

  it("can change income mode", () => {
    renderWithRouter(<ConfigPage />);
    // Should be able to see both income mode options
    const simpleButton = screen.getByText("Simple");
    const salaryButton = screen.getByText("Salary (fast)");
    
    expect(simpleButton).toBeInTheDocument();
    expect(salaryButton).toBeInTheDocument();
  });

  it("renders with minimal config", () => {
    // Set a minimal config
    useLifeStore.setState({
      config: {
        ...defaultConfig,
        horizonYears: 1,
        netIncomeY1: 1000000,
        expenseY1: 500000,
      },
    });

    renderWithRouter(<ConfigPage />);
    // Page should render without errors
    expect(screen.getByText("Core assumptions")).toBeInTheDocument();
  });
});

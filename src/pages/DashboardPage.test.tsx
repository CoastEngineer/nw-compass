import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import DashboardPage from "./DashboardPage";
import { useLifeStore } from "../store/lifeStore";
import { defaultConfig } from "../lib/defaultConfig";

// Helper to render component with router
function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>);
}

describe("DashboardPage", () => {
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
    renderWithRouter(<DashboardPage />);
    // Check that the page renders by looking for dashboard-specific content
    expect(screen.getByText("Folly Alerts")).toBeInTheDocument();
  });

  it("displays KPI cards", () => {
    renderWithRouter(<DashboardPage />);
    // Should display various KPI sections
    expect(screen.getByText("Folly Alerts")).toBeInTheDocument();
    expect(screen.getByText("Milestones")).toBeInTheDocument();
  });

  it("shows chart toggle controls", () => {
    renderWithRouter(<DashboardPage />);
    // Chart should have scenario toggles (Bear/Base/Bull)
    expect(screen.getByText("Bear")).toBeInTheDocument();
    expect(screen.getByText("Base")).toBeInTheDocument();
    expect(screen.getByText("Bull")).toBeInTheDocument();
  });

  it("displays currency toggle", () => {
    renderWithRouter(<DashboardPage />);
    // Currency toggle should be present
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("VND")).toBeInTheDocument();
  });

  it("renders with custom config", () => {
    // Set a custom config
    useLifeStore.setState({
      config: {
        ...defaultConfig,
        name: "Test User",
        horizonYears: 10,
      },
    });

    renderWithRouter(<DashboardPage />);
    // Page should render without errors with custom config
    expect(screen.getByText("Folly Alerts")).toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AlertList from "./AlertList";
import type { Alert } from "../lib/alerts";

describe("AlertList", () => {
  it("renders without alerts", () => {
    render(<AlertList alerts={[]} />);
    expect(screen.getByText("No alerts.")).toBeInTheDocument();
  });

  it("renders caution alerts", () => {
    const alerts: Alert[] = [
      {
        id: "test-caution",
        status: "caution",
        title: "Test Caution",
        message: "This is a caution message",
      },
    ];
    render(<AlertList alerts={alerts} />);
    expect(screen.getByText("Test Caution")).toBeInTheDocument();
    expect(screen.getByText("This is a caution message")).toBeInTheDocument();
    expect(screen.getByText("Caution")).toBeInTheDocument();
  });

  it("renders watch alerts", () => {
    const alerts: Alert[] = [
      {
        id: "test-watch",
        status: "watch",
        title: "Test Watch",
        message: "This is a watch message",
      },
    ];
    render(<AlertList alerts={alerts} />);
    expect(screen.getByText("Test Watch")).toBeInTheDocument();
    expect(screen.getByText("This is a watch message")).toBeInTheDocument();
    expect(screen.getByText("Watch")).toBeInTheDocument();
  });

  it("does not render ok alerts in preview mode", () => {
    const alerts: Alert[] = [
      {
        id: "test-ok",
        status: "ok",
        title: "Test OK",
        message: "This is an ok message",
      },
    ];
    render(<AlertList alerts={alerts} />);
    // OK alerts are not shown by default (only in collapsed view)
    expect(screen.queryByText("Test OK")).not.toBeInTheDocument();
  });

  it("renders alert with hint", () => {
    const alerts: Alert[] = [
      {
        id: "test-hint",
        status: "watch",
        title: "Test Hint",
        message: "This is a message",
        hint: "This is a helpful hint",
      },
    ];
    render(<AlertList alerts={alerts} />);
    expect(screen.getByText(/This is a helpful hint/)).toBeInTheDocument();
  });

  it("shows correct subtitle based on worst alert status", () => {
    const cautionAlerts: Alert[] = [
      {
        id: "test-caution",
        status: "caution",
        title: "Caution Alert",
        message: "Caution message",
      },
    ];
    const { rerender } = render(<AlertList alerts={cautionAlerts} />);
    expect(
      screen.getByText("A few assumptions are doing damage. Fix the levers.")
    ).toBeInTheDocument();

    const watchAlerts: Alert[] = [
      {
        id: "test-watch",
        status: "watch",
        title: "Watch Alert",
        message: "Watch message",
      },
    ];
    rerender(<AlertList alerts={watchAlerts} />);
    expect(
      screen.getByText("Nothing urgent, but a couple of drifts deserve attention.")
    ).toBeInTheDocument();

    rerender(<AlertList alerts={[]} />);
    expect(
      screen.getByText("Clean. Keep the system simple and repeatable.")
    ).toBeInTheDocument();
  });

  it("displays correct alert count", () => {
    const alerts: Alert[] = [
      {
        id: "alert-1",
        status: "caution",
        title: "Alert 1",
        message: "Message 1",
      },
      {
        id: "alert-2",
        status: "watch",
        title: "Alert 2",
        message: "Message 2",
      },
      {
        id: "alert-3",
        status: "watch",
        title: "Alert 3",
        message: "Message 3",
      },
      {
        id: "alert-4",
        status: "watch",
        title: "Alert 4",
        message: "Message 4",
      },
    ];
    render(<AlertList alerts={alerts} />);
    // Should show "Show all (4)" button since we have more than preview count
    expect(screen.getByText(/Show all \(4\)/)).toBeInTheDocument();
  });
});

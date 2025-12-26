import { useLifeStore } from "./lifeStore";

const STORAGE_KEY = "nw-compass:v1";

export function setupCrossTabSync() {
  if (typeof window === "undefined") return;

  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    if (!e.newValue) return;

    try {
      // Zustand persist stores: { state: {...}, version: ... }
      const parsed = JSON.parse(e.newValue);
      const next = parsed?.state;

      if (next?.config) {
        useLifeStore.setState({
          config: next.config,
          display: next.display ?? useLifeStore.getState().display,
        });
      }
    } catch {
      // ignore
    }
  });
}
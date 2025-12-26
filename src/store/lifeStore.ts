import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LifeConfig } from "../lib/model";
import { defaultConfig } from "../lib/defaultConfig";
import { lifeConfigSchema } from "../lib/configSchema";

export type YScale = "linear" | "log";

type DisplayPrefs = {
  currency: "USD" | "VND";
  tableStep: 1 | 5 | 10;
  compactNumbers: boolean;
  kidMode: boolean;
  yScale: "linear" | "log";
};

type LifeState = {
  config: LifeConfig;
  display: DisplayPrefs;

  setConfig: (cfg: LifeConfig) => void;
  patchConfig: (patch: Partial<LifeConfig>) => void;

  setDisplay: (patch: Partial<DisplayPrefs>) => void;

  exportConfig: () => string;
  importConfig: (jsonText: string) => { ok: true } | { ok: false; error: string };
};

const defaultDisplay: DisplayPrefs = {
  currency: "USD",
  tableStep: 5,
  compactNumbers: true,
  kidMode: false,
  yScale: "linear",
};

// ✅ helper: normalize config from any source (persist/import)
function normalizeConfig(input: any): LifeConfig {
  // validate (throws if invalid)
  const validated = lifeConfigSchema.parse(input);

  // normalize optional fields + merge defaults for newly added fields
  const cfg: LifeConfig = {
    ...defaultConfig,
    ...validated,
    contributeYears: (validated as any).contributeYears ?? null,
  };

  return cfg;
}

// ✅ helper: normalize display from persist
function normalizeDisplay(input: any): DisplayPrefs {
  const d = input ?? {};
  const merged: DisplayPrefs = {
    ...defaultDisplay,
    ...d,
    // hard-guard old/bad values
    currency: d.currency === "VND" ? "VND" : "USD",
    tableStep: d.tableStep === 1 || d.tableStep === 10 ? d.tableStep : 5,
    compactNumbers: typeof d.compactNumbers === "boolean" ? d.compactNumbers : true,
    kidMode: typeof d.kidMode === "boolean" ? d.kidMode : false,
    yScale: d.yScale === "log" ? "log" : "linear",
  };
  return merged;
}

export const useLifeStore = create<LifeState>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      display: defaultDisplay,

      setConfig: (cfg) => set({ config: cfg }),
      patchConfig: (patch) => set({ config: { ...get().config, ...patch } }),

      setDisplay: (patch) => set({ display: { ...get().display, ...patch } }),

      exportConfig: () => JSON.stringify(get().config, null, 2),

      importConfig: (jsonText) => {
        try {
          const parsed = JSON.parse(jsonText);
          const cfg = normalizeConfig(parsed);
          set({ config: cfg });
          return { ok: true };
        } catch (e: any) {
          return { ok: false, error: e?.message ?? "Invalid config JSON" };
        }
      },
    }),
    {
      name: "nw-compass:v1",
      partialize: (s) => ({ config: s.config, display: s.display }),

      // ✅ MIGRATION: keep old localStorage compatible
      migrate: (persisted: any) => {
        try {
          const rawCfg = persisted?.config ?? defaultConfig;
          const rawDisplay = persisted?.display ?? defaultDisplay;

          const cfg = normalizeConfig(rawCfg);
          const display = normalizeDisplay(rawDisplay);

          return { ...persisted, config: cfg, display };
        } catch {
          // if persisted state is corrupted, fall back safely
          return { config: defaultConfig, display: defaultDisplay };
        }
      },
    }
  )
);
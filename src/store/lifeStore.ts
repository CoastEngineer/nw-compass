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
          const validated = lifeConfigSchema.parse(parsed);
          // normalize contributeYears optional
          const cfg: LifeConfig = {
            ...validated,
            contributeYears: validated.contributeYears ?? null,
          };
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
    }
  )
);
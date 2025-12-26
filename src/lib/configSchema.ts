import { z } from "zod";

export const lifeConfigSchema = z.object({
  name: z.string(),
  spouseName: z.string(),
  birthYear: z.number().int().min(1900),
  startYear: z.number().int(),
  horizonYears: z.number().int().min(1).max(120),

  fxVndPerUsd: z.number().positive(),
  startNWVnd: z.number().min(0),

  netIncomeY1: z.number().min(0),
  incomeGrowth: z.number().gt(-1),
  expenseY1: z.number().min(0),
  expenseGrowth: z.number().gt(-1),

  minContrib: z.number().min(0),
  maxContrib: z.number(),
  savingRateCap: z.number().min(0).max(1).optional(),
  contributeYears: z.number().int().min(0).nullable().optional(),

  cagr: z.object({
    bear: z.number().gt(-1),
    base: z.number().gt(-1),
    bull: z.number().gt(-1),
  }),
});

export type LifeConfigSchema = z.infer<typeof lifeConfigSchema>;
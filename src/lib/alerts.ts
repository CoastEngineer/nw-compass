import type { LifeConfig, ProjectionRow } from "./model";

export type AlertStatus = "ok" | "watch" | "caution";

export type Alert = {
  id: string;
  title: string;
  status: AlertStatus;
  message: string;
  hint?: string;
};

function statusRank(s: AlertStatus) {
  return s === "caution" ? 2 : s === "watch" ? 1 : 0;
}

export function computeAlerts(args: {
  cfg: LifeConfig;
  rows: ProjectionRow[];
  // optional snapshot support later (commit 7/8)
  lastSnapshotNextMilestoneBaseYear?: number | null;
  currentNextMilestoneBaseYear?: number | null;
}): Alert[] {
  const { cfg, rows } = args;

  const alerts: Alert[] = [];

  // Alert 1: Lifestyle inflation
  {
    const diff = cfg.expenseGrowth - cfg.incomeGrowth;
    let status: AlertStatus = "ok";
    if (diff >= 0.02) status = "caution";
    else if (diff >= 0.005) status = "watch";
    alerts.push({
      id: "lifestyle-inflation",
      title: "Lifestyle inflation",
      status,
      message: "Chi phí tăng nhanh hơn thu nhập → milestone bị kéo dài theo thời gian.",
      hint: "Giảm expenseGrowth / tăng incomeGrowth / đặt cap chi phí.",
    });
  }

  // Alert X: Cashflow deficit at Year 1
  {
    const diff = cfg.netIncomeY1 - cfg.expenseY1;
    let status: AlertStatus = "ok";
    if (diff < 0) status = "caution";
    alerts.push({
      id: "cashflow-deficit",
      title: "Cashflow deficit",
      status,
      message: "Chi phí đang vượt thu nhập (net) ngay từ năm đầu → kế hoạch phụ thuộc hoàn toàn vào CAGR.",
      hint: "Giảm expenseY1 hoặc tăng netIncomeY1 để tạo saving dương.",
    });
  }

  // Alert 2: No fuel (saving=0 consecutive)
  {
    let maxStreak = 0;
    let streak = 0;
    for (const r of rows) {
      if (r.saving === 0) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else streak = 0;
    }
    let status: AlertStatus = "ok";
    if (maxStreak >= 5) status = "caution";
    else if (maxStreak >= 2) status = "watch";
    alerts.push({
      id: "no-fuel",
      title: "No compounding fuel",
      status,
      message: "Nhiều năm saving = 0 → không có nhiên liệu để compound.",
      hint: "Tăng net income hoặc giảm expense.",
    });
  }

  // Helpers for 10-year window
  const firstN = rows.slice(0, Math.min(10, rows.length));
  const bindRate = (predicate: (r: ProjectionRow) => boolean) => {
    if (firstN.length === 0) return 0;
    const cnt = firstN.filter(predicate).length;
    return cnt / firstN.length;
  };

  // Alert 3: Clamped by maxContrib
  {
    const max = Number.isFinite(cfg.maxContrib) ? cfg.maxContrib : Number.POSITIVE_INFINITY;
    const rate = bindRate((r) => max < Number.POSITIVE_INFINITY && r.saving > 0 && r.saving > max);
    let status: AlertStatus = "ok";
    if (rate >= 0.6) status = "caution";
    else if (rate >= 0.3) status = "watch";
    alerts.push({
      id: "clamped-by-max",
      title: "Contribution capped by max",
      status,
      message: "Max contrib đang giới hạn đóng góp dù saving còn dư.",
      hint: "Tăng maxContrib nếu thực sự có khả năng góp.",
    });
  }

  // Alert 4: Capped by savingRateCap
  {
    const cap = cfg.savingRateCap;
    const rate = bindRate((r) => cap != null && r.saving > 0 && r.income * cap < r.saving);
    let status: AlertStatus = "ok";
    if (rate >= 0.6) status = "caution";
    else if (rate >= 0.3) status = "watch";
    alerts.push({
      id: "capped-by-rate",
      title: "Contribution capped by saving rate",
      status,
      message: "Cap theo % income đang chặn đóng góp.",
      hint: "Nới savingRateCap nếu muốn tăng tốc milestones.",
    });
  }

  // Alert 5: High CAGR caution
  {
    let status: AlertStatus = "ok";
    if (cfg.cagr.base > 0.30) status = "caution";
    else if (cfg.cagr.base > 0.25) status = "watch";
    alerts.push({
      id: "high-cagr",
      title: "Base CAGR very high",
      status,
      message: "Base CAGR rất cao cho dài hạn → dễ tạo kỳ vọng sai.",
      hint: "Tập trung controllables (saving) và giữ range Bear/Base/Bull hợp lý.",
    });
  }

  // Alert 6: Milestone slippage vs snapshot (optional)
  {
    const last = args.lastSnapshotNextMilestoneBaseYear;
    const cur = args.currentNextMilestoneBaseYear;
    let status: AlertStatus = "ok";
    let message = "Milestone đang đúng/nhanh hơn so với snapshot gần nhất.";
    let hint: string | undefined;

    if (last != null && cur != null) {
      const slip = cur - last;
      if (slip >= 3) status = "caution";
      else if (slip >= 1) status = "watch";

      if (slip > 0) {
        message = `Next milestone (Base) bị trễ ${slip} năm so với snapshot gần nhất.`;
        hint = "Xem lại expense/income/contrib assumptions.";
      }
    } else {
      message = "Chưa có snapshot để đo milestone slippage.";
      status = "ok";
    }

    alerts.push({
      id: "milestone-slippage",
      title: "Milestone slippage",
      status,
      message,
      hint,
    });
  }

  // Alert 7: Buffer thin proxy (expense / income)
  {
    const income0 = cfg.netIncomeY1;
    const ratio = income0 > 0 ? cfg.expenseY1 / income0 : 1;
    let status: AlertStatus = "ok";
    if (ratio > 0.85) status = "caution";
    else if (ratio > 0.70) status = "watch";
    alerts.push({
      id: "buffer-thin",
      title: "Safety buffer thin",
      status,
      message: "Biên an toàn mỏng → dễ phá kế hoạch khi có biến.",
      hint: "Tăng saving buffer hoặc hạ expense.",
    });
  }

  // Sort: caution first, then watch, then ok (stable)
  alerts.sort((a, b) => statusRank(b.status) - statusRank(a.status));
  return alerts;
}
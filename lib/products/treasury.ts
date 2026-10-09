export type TreasuryFlowType = "income" | "expense";
export type TreasuryFlowStatus = "planned" | "completed";
export type TreasuryFlowRecurrence = "none" | "monthly";

export type TreasuryFlow = {
  id: string;
  date: string;
  type: TreasuryFlowType;
  category: string;
  label: string;
  amount: number;
  status: TreasuryFlowStatus;
  recurrence?: TreasuryFlowRecurrence;
};

export type TreasurySettings = {
  companyName: string;
  activity: string;
  contactName: string;
  isOnboarded: boolean;
  initialBalance: number;
  initialBalanceDate: string;
  safetyThreshold: number;
};

export type TreasuryDay = {
  date: string;
  income: number;
  expense: number;
  balance: number;
  alert: "normal" | "warning" | "critical";
};

export type TreasuryAnalysis = {
  currentBalance: number;
  balanceAt30Days: number;
  balanceAt60Days: number;
  balanceAt90Days: number;
  plannedIncome: number;
  plannedExpense: number;
  expensesNext7Days: number;
  minimumBalance: number;
  tensionDate: string | null;
  days: TreasuryDay[];
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function signedAmount(flow: TreasuryFlow) {
  return flow.type === "income" ? flow.amount : -flow.amount;
}

function addMonths(date: string, months: number) {
  const result = new Date(`${date}T12:00:00`);
  result.setMonth(result.getMonth() + months);
  return toDateKey(result);
}

function expandPlannedFlows(flows: TreasuryFlow[], todayKey: string, endDateKey: string) {
  return flows.flatMap((flow) => {
    if (flow.status !== "planned") return [];
    if (flow.recurrence !== "monthly") return flow.date >= todayKey ? [flow] : [];

    const occurrences: TreasuryFlow[] = [];
    for (let month = 0; ; month += 1) {
      const date = addMonths(flow.date, month);
      if (date > endDateKey) break;
      if (date >= todayKey) occurrences.push({ ...flow, id: `${flow.id}-${month}`, date });
    }
    return occurrences;
  });
}

export function analyzeTreasury(
  settings: TreasurySettings,
  flows: TreasuryFlow[],
  today = new Date()
): TreasuryAnalysis {
  const todayKey = toDateKey(today);
  const endDateKey = toDateKey(addDays(today, 89));
  const completedBalance = flows
    .filter((flow) => flow.status === "completed")
    .reduce((total, flow) => total + signedAmount(flow), settings.initialBalance);
  const futureFlows = expandPlannedFlows(flows, todayKey, endDateKey);
  const plannedIncome = futureFlows
    .filter((flow) => flow.type === "income")
    .reduce((total, flow) => total + flow.amount, 0);
  const plannedExpense = futureFlows
    .filter((flow) => flow.type === "expense")
    .reduce((total, flow) => total + flow.amount, 0);

  let runningBalance = completedBalance;
  const days = Array.from({ length: 90 }, (_, index) => {
    const date = toDateKey(addDays(today, index));
    const dayFlows = futureFlows.filter((flow) => flow.date === date);
    const income = dayFlows
      .filter((flow) => flow.type === "income")
      .reduce((total, flow) => total + flow.amount, 0);
    const expense = dayFlows
      .filter((flow) => flow.type === "expense")
      .reduce((total, flow) => total + flow.amount, 0);
    runningBalance += income - expense;
    const alert: TreasuryDay["alert"] = runningBalance < settings.safetyThreshold
      ? "critical"
      : runningBalance < settings.safetyThreshold * 1.2
        ? "warning"
        : "normal";

    return { date, income, expense, balance: runningBalance, alert };
  });

  const tensionDate = days.find((day) => day.alert === "critical")?.date ?? null;
  const expensesNext7Days = days.slice(0, 7).reduce((total, day) => total + day.expense, 0);

  return {
    currentBalance: completedBalance,
    balanceAt30Days: days[29].balance,
    balanceAt60Days: days[59].balance,
    balanceAt90Days: days[89].balance,
    plannedIncome,
    plannedExpense,
    expensesNext7Days,
    minimumBalance: Math.min(...days.map((day) => day.balance)),
    tensionDate,
    days,
  };
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
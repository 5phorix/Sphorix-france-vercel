export type ExpenseStatus = "paid" | "planned";
export type ExpenseRecurrence = "none" | "monthly";

export type Expense = {
  id: string;
  date: string;
  supplier: string;
  category: string;
  label: string;
  amount: number;
  status: ExpenseStatus;
  recurrence?: ExpenseRecurrence;
};

export type ExpenseSettings = {
  companyName: string;
  activity: string;
  contactName: string;
  isOnboarded: boolean;
  period: string;
};

export type ExpenseBudget = {
  category: string;
  monthlyBudget: number;
};

export type CategoryAnalysis = ExpenseBudget & {
  actual: number;
  planned: number;
  total: number;
  variance: number;
  varianceRate: number | null;
  isOverBudget: boolean;
};

export type ExpenseAnalysis = {
  totalActual: number;
  totalPlanned: number;
  totalBudget: number;
  totalVariance: number;
  topCategory: CategoryAnalysis | null;
  overduePlanned: number;
  categories: CategoryAnalysis[];
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

export function analyzeExpenses(expenses: Expense[], budgets: ExpenseBudget[], period: string, today = new Date()): ExpenseAnalysis {
  const currentExpenses = expenses.filter((expense) => expense.date.startsWith(period));
  const todayKey = today.toISOString().slice(0, 10);
  const categories = budgets.map((budget) => {
    const categoryExpenses = currentExpenses.filter((expense) => expense.category === budget.category);
    const actual = categoryExpenses.filter((expense) => expense.status === "paid").reduce((total, expense) => total + expense.amount, 0);
    const planned = categoryExpenses.filter((expense) => expense.status === "planned").reduce((total, expense) => total + expense.amount, 0);
    const total = actual + planned;
    const variance = total - budget.monthlyBudget;
    return {
      ...budget,
      actual,
      planned,
      total,
      variance,
      varianceRate: budget.monthlyBudget > 0 ? variance / budget.monthlyBudget : null,
      isOverBudget: variance > 0,
    };
  });
  const totalActual = categories.reduce((total, category) => total + category.actual, 0);
  const totalPlanned = categories.reduce((total, category) => total + category.planned, 0);
  const totalBudget = budgets.reduce((total, budget) => total + budget.monthlyBudget, 0);
  const sorted = [...categories].sort((left, right) => right.total - left.total);

  return {
    totalActual,
    totalPlanned,
    totalBudget,
    totalVariance: totalActual + totalPlanned - totalBudget,
    topCategory: sorted[0] ?? null,
    overduePlanned: expenses.filter((expense) => expense.status === "planned" && expense.date < todayKey).reduce((total, expense) => total + expense.amount, 0),
    categories,
  };
}
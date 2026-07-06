const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  dob: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  currency?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileInput {
  name: string;
  email: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  accountId: string;
  amount: string;
  type: TransactionType;
  category: string;
  date: string;
  createdAt: string;
}

export type InvestmentType = 'PSX' | 'CRYPTO' | 'REAL_ESTATE' | 'METAL';

export interface Investment {
  id: string;
  accountId: string;
  type: InvestmentType;
  assetName: string;
  amount: string;
  units: string;
  currentValue: string;
  purchaseDate: string;
  createdAt: string;
}

export type LoanStatus = 'ACTIVE' | 'PAID_OFF';

export interface Loan {
  id: string;
  accountId: string;
  principal: string;
  interestRate: string;
  remainingAmount: string;
  startDate: string;
  endDate: string;
  status: LoanStatus;
  createdAt: string;
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  amount: string;
  date: string;
}

export interface LoanWithRepayments extends Loan {
  repayments: LoanRepayment[];
}

export interface Goal {
  id: string;
  accountId: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string;
  createdAt: string;
  progress: number;
}

export interface Budget {
  id: string;
  accountId?: string;
  name: string;
  startAmount: string;
  remainingAmount: string;
  spentAmount: string;
  isNearLimit: boolean;
  isWithinPeriod?: boolean;
  startDate?: string;
  endDate?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActiveBudgetSummary {
  id: string;
  name: string;
  startAmount: string;
  remainingAmount: string;
  spentAmount: string;
  isNearLimit: boolean;
}

export interface DashboardSummary {
  accountId: string;
  accountName: string;
  currentBalance: string;
  totalAssets: string;
  totalLoanDebt: string;
  netWorth: string;
  activeBudget: ActiveBudgetSummary | null;
  goalCount: number;
  recentTransactions: Pick<Transaction, 'id' | 'amount' | 'type' | 'category' | 'date'>[];
}

export interface ListTransactionsParams {
  type?: TransactionType;
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface CreateInvestmentInput {
  type: InvestmentType;
  assetName: string;
  amount: number;
  units?: number;
  currentValue?: number;
  purchaseDate: string;
}

export interface UpdateInvestmentInput {
  currentValue: number;
}

export interface CreateLoanInput {
  principal: number;
  interestRate: number;
  startDate: string;
  endDate: string;
}

export interface RepayLoanInput {
  amount: number;
}

export interface UpsertBudgetInput {
  name: string;
  startAmount: number;
  startDate: string;
  endDate: string;
}

export interface CreateGoalInput {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline: string;
}

export interface UpdateGoalInput {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string;
}

class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError((data && data.error) || 'Something went wrong');
  }

  return data as T;
}

function toQueryString(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params) as [string, string | number | undefined][]) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  register: (input: RegisterInput) =>
    request<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  login: (input: LoginInput) =>
    request<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  logout: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
  me: () => request<{ user: User }>('/api/auth/me'),
  updatePassword: (input: UpdatePasswordInput) => request<{ success: boolean }>('/api/auth/password', {
    method: 'PUT',
    body: JSON.stringify(input),
  }),
  updateProfile: (input: UpdateProfileInput) => request<{ user: User }>('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(input),
  }),

  getDashboard: () => request<DashboardSummary>('/api/dashboard'),

  listTransactions: (params: ListTransactionsParams = {}) =>
    request<{ transactions: Transaction[] }>(`/api/transactions${toQueryString(params)}`),
  createTransaction: (input: CreateTransactionInput) =>
    request<{ transaction: Transaction; currentBalance: string; budget: ActiveBudgetSummary | null }>(
      '/api/transactions',
      { method: 'POST', body: JSON.stringify(input) },
    ),
  deleteTransaction: (id: string) =>
    request<{ success: boolean; currentBalance: string }>(`/api/transactions/${id}`, {
      method: 'DELETE',
    }),

  listInvestments: (params: { type?: InvestmentType } = {}) =>
    request<{ investments: Investment[] }>(`/api/investments${toQueryString(params)}`),
  createInvestment: (input: CreateInvestmentInput) =>
    request<{ investment: Investment; totalAssets: string }>('/api/investments', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateInvestment: (id: string, input: UpdateInvestmentInput) =>
    request<{ investment: Investment; totalAssets: string }>(`/api/investments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteInvestment: (id: string) =>
    request<{ success: boolean; totalAssets: string }>(`/api/investments/${id}`, {
      method: 'DELETE',
    }),

  listLoans: (params: { status?: LoanStatus } = {}) =>
    request<{ loans: Loan[] }>(`/api/loans${toQueryString(params)}`),
  getLoan: (id: string) => request<{ loan: LoanWithRepayments }>(`/api/loans/${id}`),
  createLoan: (input: CreateLoanInput) =>
    request<{ loan: Loan }>('/api/loans', { method: 'POST', body: JSON.stringify(input) }),
  repayLoan: (id: string, input: RepayLoanInput) =>
    request<{ loan: Loan; repayment: LoanRepayment }>(`/api/loans/${id}/repay`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  deleteLoan: (id: string) => request<{ success: boolean }>(`/api/loans/${id}`, { method: 'DELETE' }),

  listGoals: () => request<{ goals: Goal[] }>('/api/goals'),
  getGoal: (id: string) => request<{ goal: Goal }>(`/api/goals/${id}`),
  createGoal: (input: CreateGoalInput) =>
    request<{ goal: Goal }>('/api/goals', { method: 'POST', body: JSON.stringify(input) }),
  updateGoal: (id: string, input: UpdateGoalInput) =>
    request<{ goal: Goal }>(`/api/goals/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteGoal: (id: string) => request<{ success: boolean }>(`/api/goals/${id}`, { method: 'DELETE' }),

  getActiveBudget: () => request<{ budget: Budget | null }>('/api/budgets'),
  getBudgetHistory: () => request<{ budgets: Budget[] }>('/api/budgets/history'),
  upsertBudget: (input: UpsertBudgetInput) =>
    request<{ budget: Budget; action: 'created' | 'updated' }>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  deactivateBudget: (id: string) =>
    request<{ budget: Budget }>(`/api/budgets/${id}/deactivate`, { method: 'PATCH' }),
};

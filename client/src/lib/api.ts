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
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
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

  getDashboard: () => request<DashboardSummary>('/api/dashboard'),

  listTransactions: (params: ListTransactionsParams = {}) =>
    request<{ transactions: Transaction[] }>(`/api/transactions${toQueryString(params)}`),

  listInvestments: (params: { type?: InvestmentType } = {}) =>
    request<{ investments: Investment[] }>(`/api/investments${toQueryString(params)}`),

  listLoans: (params: { status?: LoanStatus } = {}) =>
    request<{ loans: Loan[] }>(`/api/loans${toQueryString(params)}`),

  listGoals: () => request<{ goals: Goal[] }>('/api/goals'),
};

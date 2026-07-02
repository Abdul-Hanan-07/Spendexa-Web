import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { LoansPage } from './pages/LoansPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { GoalsPage } from './pages/GoalsPage';

function CatchAll() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/investments" element={<InvestmentsPage />} />
        <Route path="/loans" element={<LoansPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
      </Route>
      <Route path="*" element={<CatchAll />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Landmark, Target, TrendingUp, Wallet } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

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
        <Route
          path="/investments"
          element={<PlaceholderPage title="Investments" icon={TrendingUp} />}
        />
        <Route path="/loans" element={<PlaceholderPage title="Loans" icon={Landmark} />} />
        <Route path="/budgets" element={<PlaceholderPage title="Budgets" icon={Wallet} />} />
        <Route path="/goals" element={<PlaceholderPage title="Goals" icon={Target} />} />
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

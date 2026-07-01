import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-800">Welcome, {user?.name}</h1>
        <p className="mt-2 text-slate-500">Your dashboard is coming soon.</p>
      </main>
    </div>
  );
}

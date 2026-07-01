import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
      <span className="text-lg font-semibold text-slate-800">Spendexa</span>
      {user && (
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          Log out
        </button>
      )}
    </nav>
  );
}

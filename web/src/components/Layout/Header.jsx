import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut, FileText } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../Common';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-stone-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-amber-300">
          <FileText className="w-6 h-6" />
          Convertly
        </Link>

        {/* Desktop Navigation */}
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'text-blue-600'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/convert"
              className={`text-sm font-medium transition-colors ${
                isActive('/convert')
                  ? 'text-blue-600'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Converter
            </Link>
            <Link
              to="/history"
              className={`text-sm font-medium transition-colors ${
                isActive('/history')
                  ? 'text-blue-600'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Histórico
            </Link>
            <div className="text-sm text-stone-400">
              {user?.name}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Entrar
            </Button>
            <Button size="sm" onClick={() => navigate('/register')}>
              Cadastro
            </Button>
          </nav>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 hover:bg-white/10 rounded-lg text-stone-100"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-stone-950/95">
          <nav className="px-4 py-3 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-sm font-medium text-stone-100 hover:bg-white/10 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/convert"
                  className="block px-3 py-2 text-sm font-medium text-stone-100 hover:bg-white/10 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Converter
                </Link>
                <Link
                  to="/history"
                  className="block px-3 py-2 text-sm font-medium text-stone-100 hover:bg-white/10 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Histórico
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10 rounded-lg"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate('/login');
                    setMenuOpen(false);
                  }}
                >
                  Entrar
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={() => {
                    navigate('/register');
                    setMenuOpen(false);
                  }}
                >
                  Cadastro
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

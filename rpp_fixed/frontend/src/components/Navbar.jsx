import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, Bookmark, TrendingUp, BarChart3, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const navLinks = [
    { to: '/', icon: BookOpen, label: 'Dashboard' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/saved', icon: Bookmark, label: 'Saved' },
    { to: '/recommendations', icon: TrendingUp, label: 'Recommendations' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            ResearchAI
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
            
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l">
              <span className="text-gray-700">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center space-x-2 py-2 text-gray-700 hover:text-primary-600"
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="flex items-center space-x-2 py-2 text-red-600 w-full"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import {
  Sun,
  Moon,
  Scan,
  LayoutDashboard,
  Sprout,
  History,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: "Dashboard", path: '/dashboard', icon: LayoutDashboard },
    { name: "AI Scanner", path: '/scanner', icon: Scan },
    { name: "My Plants", path: '/plants', icon: Sprout },
    { name: "History", path: '/history', icon: History },
    { name: "Assistant", path: '/assistant', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0E2218]/95 backdrop-blur-md border-b border-gray-200 dark:border-emerald-900/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">
            PlantCare<span className="text-emerald-600 dark:text-emerald-400">AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 hover:bg-gray-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {!isAuthenticated && (
            <Link
              to="/scanner"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Scan Now</span>
            </Link>
          )}

          <LanguageSelector />

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-emerald-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-emerald-950/40 transition-colors"
            title="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-emerald-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <Link
                to="/settings"
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg border border-gray-200 dark:border-emerald-800 hover:bg-gray-50 dark:hover:bg-emerald-950/40 transition-colors text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">
                  {user?.full_name?.split(' ')[0] || 'User'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="text-xs font-semibold px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:text-emerald-600"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="btn-primary px-3.5 py-1.5 text-xs"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-gray-600 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-emerald-900 px-4 py-3 space-y-1 bg-white dark:bg-[#0E2218]">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-emerald-950/40"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 dark:border-emerald-900">
            <Link
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

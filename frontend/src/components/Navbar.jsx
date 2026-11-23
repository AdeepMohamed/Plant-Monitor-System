import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import {
  Sparkles,
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
  User as UserIcon,
  ChevronDown
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
    { name: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('scanner'), path: '/scanner', icon: Scan, highlight: true },
    { name: t('myPlants'), path: '/plants', icon: Sprout },
    { name: t('history'), path: '/history', icon: History },
    { name: t('assistant'), path: '/assistant', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-emerald-100 dark:border-emerald-950/70 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white dark:bg-emerald-950 rounded-[14px] flex items-center justify-center">
              <Sprout className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-emerald-950 dark:text-white flex items-center gap-1">
              PlantCare<span className="text-emerald-600 dark:text-emerald-400">AI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 ml-1">
                Gemini
              </span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-700/80 dark:text-emerald-400/80 -mt-1 hidden sm:block">
              Intelligent Crop Diagnostics
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 bg-emerald-50/60 dark:bg-emerald-950/50 p-1.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    item.highlight
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs'
                      : active
                      ? 'bg-white dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-white/50 dark:hover:bg-emerald-900/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Public Scanner CTA if logged out */}
          {!isAuthenticated && (
            <Link
              to="/scanner"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-50"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Instant Scan</span>
            </Link>
          )}

          {/* Language Switcher */}
          <LanguageSelector />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl border border-gray-200 dark:border-emerald-800/80 bg-white/70 dark:bg-emerald-950/50 text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors shadow-2xs"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-emerald-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* User Account / Auth Actions */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-white/90 dark:bg-emerald-950/60 hover:border-emerald-400 transition-all shadow-2xs"
                title="Account Settings"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 hidden lg:inline max-w-[110px] truncate">
                  {user?.full_name?.split(' ')[0] || 'Agronomist'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-2xl text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-bold px-3 py-2 text-emerald-800 dark:text-emerald-300 hover:text-emerald-600 transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="text-xs font-bold px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                {t('register')}
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-100 dark:border-emerald-950 px-4 pt-3 pb-5 space-y-1 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-md animate-in slide-in-from-top-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold ${
                  active
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-gray-100 dark:border-emerald-900 flex items-center justify-between">
            <Link
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300"
            >
              <Settings className="w-4 h-4" />
              <span>{t('settings')}</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

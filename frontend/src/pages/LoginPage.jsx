import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sprout, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('farmer.arun@plantcare.ai');
    setPassword('PlantCare2026!');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm clean-card p-6 sm:p-8 space-y-5">
        
        <div className="text-center space-y-1.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center mx-auto">
            <Sprout className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Sign In
          </h1>
          <p className="text-xs text-gray-500">
            Access your plant health monitoring dashboard
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 text-xs text-rose-700 border border-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900/40 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900/40 text-gray-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100 dark:border-emerald-900 text-center">
          <button
            type="button"
            onClick={fillDemoAccount}
            className="text-xs text-emerald-600 font-semibold hover:underline"
          >
            Auto-fill demo agronomist credentials
          </button>
        </div>

        <div className="text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-emerald-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

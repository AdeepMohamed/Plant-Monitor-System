import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import {
  Settings,
  User,
  Key,
  Database,
  Moon,
  Sun,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Save,
  Lock,
  Mail,
  Cpu
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  // Profile Form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Password Form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  // Gemini API Config
  const [geminiStatus, setGeminiStatus] = useState(null);
  const [inputKey, setInputKey] = useState('');
  const [keySaving, setKeySaving] = useState(false);
  const [keyMsg, setKeyMsg] = useState('');

  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }

    api.health.getGeminiStatus()
      .then(data => setGeminiStatus(data))
      .catch(err => console.error("Error checking Gemini status:", err));
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      await updateProfile({ full_name: fullName });
      setProfileMsg("Profile updated successfully!");
    } catch (err) {
      setProfileMsg("Failed: " + err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    if (newPassword.length < 6) {
      setPwdMsg("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg("Passwords do not match.");
      return;
    }
    try {
      await updateProfile({ password: newPassword });
      setPwdMsg("Password changed successfully!");
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdMsg("Failed: " + err.message);
    }
  };

  const handleUpdateKey = async (e) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    setKeySaving(true);
    setKeyMsg('');
    try {
      const res = await api.health.setGeminiKey(inputKey.trim());
      setKeyMsg("Google Gemini API Key updated and verified!");
      setInputKey('');
      const updatedStatus = await api.health.getGeminiStatus();
      setGeminiStatus(updatedStatus);
    } catch (err) {
      setKeyMsg("Error updating key: " + err.message);
    } finally {
      setKeySaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-white">
          System Preferences & Account
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Configure AI connectivity, local database modes, UI theme, and profile credentials
        </p>
      </div>

      {/* 1. Google Gemini API Status Card */}
      <div className="p-6 rounded-3xl glass-panel border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Google Gemini Multimodal Vision API</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                  {geminiStatus?.configured ? "Active & Connected" : "Action Needed"}
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Active Model: <b>{geminiStatus?.model || "gemini-3.6-flash"}</b> • Multimodal Diagnostic Engine
              </p>
            </div>
          </div>
        </div>

        {geminiStatus?.configured ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Connected using configured API key ({geminiStatus.masked_key}). Plant health diagnosis and assistant chat are operational.
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{geminiStatus?.message || "Gemini API key is not configured."}</span>
          </div>
        )}

        {/* Update Key Input */}
        <form onSubmit={handleUpdateKey} className="space-y-3 pt-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
            Update or Override Gemini API Key
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Enter new Gemini API Key (e.g. AIzaSy...)"
                className="w-full text-xs font-medium pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white/70 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={keySaving || !inputKey.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs"
            >
              {keySaving ? "Updating..." : "Update Key"}
            </button>
          </div>
          {keyMsg && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{keyMsg}</p>
          )}
        </form>
      </div>

      {/* 2. Database Mode Status */}
      <div className="p-6 rounded-3xl glass-panel border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-900/60 flex items-center justify-center text-teal-700 dark:text-teal-300">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Database Engine Status</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300">
                Zero-Setup Embedded Local Storage
              </span>
            </h3>
            <p className="text-xs text-gray-500">
              Running locally without external database server requirements. Neon PostgreSQL connection strings supported via environment.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Appearance & Language */}
      <div className="p-6 rounded-3xl glass-panel border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          Appearance & Localization
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Theme */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 space-y-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
              Color Theme
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  theme === 'light'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-emerald-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-emerald-800'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  theme === 'dark'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-emerald-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-emerald-800'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 space-y-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
              Display Language
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-emerald-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-emerald-800'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  language === 'ta'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-emerald-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-emerald-800'
                }`}
              >
                தமிழ்
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  language === 'hi'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-emerald-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-emerald-800'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. User Profile */}
      <div className="p-6 rounded-3xl glass-panel border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          Profile Information
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs font-medium pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white/70 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={user?.email || 'farmer.arun@plantcare.ai'}
                className="w-full text-xs font-medium pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-gray-100 dark:bg-emerald-900/20 text-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={profileSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs"
          >
            {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Profile</span>
          </button>

          {profileMsg && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{profileMsg}</p>
          )}
        </form>
      </div>

      {/* 5. Password & Security */}
      <div className="p-6 rounded-3xl glass-panel border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          Security & Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white/70 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white/70 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={!newPassword}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs"
          >
            <Lock className="w-4 h-4" />
            <span>Update Password</span>
          </button>

          {pwdMsg && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{pwdMsg}</p>
          )}
        </form>
      </div>

      {/* 6. Logout */}
      <div className="p-6 rounded-3xl glass-panel border border-rose-100 dark:border-rose-950/50 shadow-xs flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
            Sign Out of Account
          </h4>
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
            End active session on this device
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>

    </div>
  );
};

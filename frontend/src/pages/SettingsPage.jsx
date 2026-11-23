import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import {
  User,
  Key,
  Database,
  Moon,
  Sun,
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
  const { language, setLanguage } = useLanguage();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

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
      .catch(() => {});
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      await updateProfile({ full_name: fullName });
      setProfileMsg("Profile updated.");
    } catch (err) {
      setProfileMsg("Error: " + err.message);
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
      setPwdMsg("Password updated.");
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdMsg("Error: " + err.message);
    }
  };

  const handleUpdateKey = async (e) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    setKeySaving(true);
    setKeyMsg('');
    try {
      await api.health.setGeminiKey(inputKey.trim());
      setKeyMsg("Gemini API key updated.");
      setInputKey('');
      const updated = await api.health.getGeminiStatus();
      setGeminiStatus(updated);
    } catch (err) {
      setKeyMsg("Error: " + err.message);
    } finally {
      setKeySaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-150">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-xs text-gray-500">
          Manage your account credentials, AI configuration, and preferences.
        </p>
      </div>

      {/* Gemini AI Status */}
      <div className="clean-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                Google Gemini API
              </h3>
              <p className="text-[11px] text-gray-400">Model: {geminiStatus?.model || "gemini-3.6-flash"}</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {geminiStatus?.configured ? "Connected" : "Key Required"}
          </span>
        </div>

        <form onSubmit={handleUpdateKey} className="flex gap-2 pt-1">
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="Change Gemini API Key..."
            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/40 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={keySaving || !inputKey.trim()}
            className="btn-primary px-3 py-1.5 text-xs disabled:opacity-40"
          >
            {keySaving ? "Saving..." : "Save Key"}
          </button>
        </form>
        {keyMsg && <p className="text-xs text-emerald-600">{keyMsg}</p>}
      </div>

      {/* Database Mode Status */}
      <div className="clean-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white">Database Engine</h3>
            <p className="text-[11px] text-gray-400">Zero-setup embedded SQLite (runs completely locally)</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Local Storage
        </span>
      </div>

      {/* Appearance & Language */}
      <div className="clean-card p-5 space-y-3">
        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-gray-500">
          Preferences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-gray-100 dark:border-emerald-900 flex items-center justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-300">Theme</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${theme === 'light' ? 'bg-emerald-600 text-white' : 'text-gray-600'}`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${theme === 'dark' ? 'bg-emerald-600 text-white' : 'text-gray-600'}`}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-gray-100 dark:border-emerald-900 flex items-center justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-300">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 py-1 rounded-md border border-gray-200 dark:border-emerald-800 text-xs"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="clean-card p-5 space-y-3">
        <h3 className="text-xs font-bold text-gray-900 dark:text-white">Profile Details</h3>
        <form onSubmit={handleSaveProfile} className="space-y-3 text-xs max-w-sm">
          <div>
            <label className="font-semibold text-gray-600 block mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-200 dark:border-emerald-800"
            />
          </div>
          <div>
            <label className="font-semibold text-gray-600 block mb-1">Email</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full p-2 rounded-lg border border-gray-100 bg-gray-50 text-gray-400"
            />
          </div>
          <button type="submit" disabled={profileSaving} className="btn-primary px-3.5 py-1.5 text-xs">
            {profileSaving ? "Saving..." : "Save Profile"}
          </button>
          {profileMsg && <p className="text-xs text-emerald-600">{profileMsg}</p>}
        </form>
      </div>

      {/* Logout */}
      <div className="clean-card p-4 flex items-center justify-between border-rose-100 dark:border-rose-900">
        <div>
          <span className="text-xs font-bold text-rose-700">Sign Out</span>
          <p className="text-[11px] text-gray-400">Exit your account on this device</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors cursor-pointer"
        >
          Log Out
        </button>
      </div>

    </div>
  );
};

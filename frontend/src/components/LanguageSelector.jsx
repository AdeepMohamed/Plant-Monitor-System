import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative inline-flex items-center">
      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-2.5 pointer-events-none" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="text-xs font-semibold pl-8 pr-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-emerald-950/40 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
        title="Select Language"
      >
        <option value="en">English (EN)</option>
        <option value="ta">தமிழ் (Tamil)</option>
        <option value="hi">हिन्दी (Hindi)</option>
      </select>
    </div>
  );
};

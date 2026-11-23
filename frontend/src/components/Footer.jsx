import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Heart, Sparkles, Database, FileText } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-emerald-100 dark:border-emerald-900/60 bg-white/60 dark:bg-emerald-950/40 backdrop-blur-md pt-12 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-emerald-950 dark:text-white">
                PlantCare<span className="text-emerald-600 dark:text-emerald-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Empowering farmers, horticulturists, and gardeners with real-time crop disease detection and agronomic intelligence powered by Google Gemini Vision.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Gemini Multimodal AI</span>
            </div>
          </div>

          {/* Core Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 mb-3">
              Application Tools
            </h4>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li>
                <Link to="/scanner" className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">
                  AI Plant Disease Scanner
                </Link>
              </li>
              <li>
                <Link to="/plants" className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">
                  My Crop & Plant Profiles
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">
                  Diagnostic History & Trends
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">
                  Gemini Agronomy Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Supported Crops */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 mb-3">
              Supported Crops & Plants
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['Tomato', 'Rice', 'Wheat', 'Potato', 'Cotton', 'Banana', 'Mango', 'Chilli', 'Brinjal', 'Citrus', 'Houseplants'].map(crop => (
                <span
                  key={crop}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-100 dark:border-emerald-800/60"
                >
                  {crop}
                </span>
              ))}
            </div>
          </div>

          {/* Technology & Safety */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 mb-3">
              Architecture & Transparency
            </h4>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Neon PostgreSQL Persistent DB</span>
              </li>
              <li className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant PDF Diagnostic Reports</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Private & Secure Isolation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Disclaimer */}
        <div className="pt-6 border-t border-emerald-100 dark:border-emerald-900/60 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-gray-500 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} PlantCare AI. Built for modern agricultural technology & sustainable cultivation.
          </p>
          <p className="text-center md:text-right max-w-xl text-[10px] text-gray-400 dark:text-gray-500">
            *Notice: Health scores and diagnostic predictions are indicative AI assessments powered by vision models, not certified phytopathological laboratory tests. Always adhere to chemical manufacturer label warnings and local agricultural directives.
          </p>
        </div>
      </div>
    </footer>
  );
};

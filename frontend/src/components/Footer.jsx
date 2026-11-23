import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-100 dark:border-emerald-950 bg-white/70 dark:bg-emerald-950/40 py-10 mt-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-gray-900 dark:text-white">
                PlantCare<span className="text-emerald-600">AI</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Real-time crop disease diagnosis and agronomic intelligence powered by Google Gemini Vision.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Gemini Multimodal AI</span>
            </div>
          </div>

          {/* Core Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-200 mb-2.5">
              Tools
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li>
                <Link to="/scanner" className="hover:text-emerald-600 transition-colors">
                  AI Plant Scanner
                </Link>
              </li>
              <li>
                <Link to="/plants" className="hover:text-emerald-600 transition-colors">
                  Crop & Plant Profiles
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-emerald-600 transition-colors">
                  Diagnostic History
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-emerald-600 transition-colors">
                  Plant Care Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Supported Crops */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-200 mb-2.5">
              Supported Crops
            </h4>
            <div className="flex flex-wrap gap-1">
              {['Tomato', 'Rice', 'Wheat', 'Potato', 'Cotton', 'Banana', 'Mango', 'Chilli', 'Brinjal', 'Citrus', 'Houseplants'].map(crop => (
                <span
                  key={crop}
                  className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-emerald-900/40 text-gray-700 dark:text-emerald-300 font-medium"
                >
                  {crop}
                </span>
              ))}
            </div>
          </div>

          {/* Architecture & Transparency */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-200 mb-2.5">
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li>High-resolution Gemini Vision</li>
              <li>Instant PDF Diagnostic Reports</li>
              <li>Zero-dependency local database</li>
              <li>Enterprise PostgreSQL ready</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Disclaimer */}
        <div className="pt-6 border-t border-gray-100 dark:border-emerald-950 flex flex-col md:flex-row items-center justify-between gap-2.5 text-[11px] text-gray-400">
          <p>
            © {new Date().getFullYear()} PlantCare AI. Built for precision agriculture.
          </p>
          <p className="text-center md:text-right max-w-lg text-[10px] text-gray-400">
            *Indicative AI assessments powered by vision models. Always verify with local agricultural extension guidelines.
          </p>
        </div>
      </div>
    </footer>
  );
};

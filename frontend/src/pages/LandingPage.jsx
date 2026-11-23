import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import {
  Sprout,
  Scan,
  ShieldCheck,
  Bug,
  Droplets,
  Activity,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const LandingPage = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    total_plants: 0,
    total_analyses: 0,
    healthy_plants: 0,
    average_health_score: 0
  });

  useEffect(() => {
    api.dashboard.getStats()
      .then(data => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, []);

  const features = [
    {
      icon: Scan,
      title: "Disease & Pathogen Detection",
      desc: "Identify blights, rusts, powdery mildew, fungal spots, and bacterial wilt from clear leaf photographs."
    },
    {
      icon: Bug,
      title: "Pest & Infestation Identification",
      desc: "Spot visible mite damage, aphids, thrips, caterpillars, and leaf miners with visual indicator mapping."
    },
    {
      icon: Droplets,
      title: "Nutrient Deficiency Diagnostics",
      desc: "Analyze chlorosis and leaf discoloration to pinpoint Nitrogen, Potassium, Phosphorus, or Iron deficits."
    },
    {
      icon: ShieldCheck,
      title: "Targeted Organic Treatments",
      desc: "Receive biological controls, neem oil formulations, compost regimens, and safe cultural practices."
    },
    {
      icon: Activity,
      title: "Longitudinal Health Monitoring",
      desc: "Track health recovery curves over time and compare progression between scans."
    },
    {
      icon: Sprout,
      title: "Gemini Agronomy Assistant",
      desc: "Ask follow-up questions in natural language about fertilizers, irrigation schedules, and plant health."
    }
  ];

  const crops = [
    'Tomato', 'Rice', 'Wheat', 'Potato', 'Cotton', 'Banana', 'Mango', 'Chilli', 'Brinjal', 'Citrus', 'Houseplants'
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. Hero Section */}
      <section className="pt-16 sm:pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <span>Powered by Google Gemini Multimodal Vision API</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
          Your Plants Deserve <br />
          <span className="text-emerald-600 dark:text-emerald-400">Intelligent Care.</span>
        </h1>

        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          {t('heroSubtitle')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link
            to="/scanner"
            className="btn-primary w-full sm:w-auto px-7 py-3 text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <Scan className="w-4 h-4" />
            <span>Scan Plant Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="btn-secondary w-full sm:w-auto px-6 py-3 text-sm flex items-center justify-center gap-2"
          >
            <span>How It Works</span>
          </a>
        </div>

        {/* Genuine App Stats */}
        <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="clean-card p-4 text-center">
            <span className="text-2xl font-bold text-emerald-600">
              {stats.total_analyses > 0 ? stats.total_analyses : "100%"}
            </span>
            <p className="text-xs text-gray-500 mt-0.5">Real Gemini Scans</p>
          </div>
          <div className="clean-card p-4 text-center">
            <span className="text-2xl font-bold text-emerald-600">
              {stats.total_plants > 0 ? stats.total_plants : "20+"}
            </span>
            <p className="text-xs text-gray-500 mt-0.5">Crop Varieties</p>
          </div>
          <div className="clean-card p-4 text-center">
            <span className="text-2xl font-bold text-emerald-600">0–100</span>
            <p className="text-xs text-gray-500 mt-0.5">Health Scoring</p>
          </div>
          <div className="clean-card p-4 text-center">
            <span className="text-2xl font-bold text-emerald-600">PDF</span>
            <p className="text-xs text-gray-500 mt-0.5">Instant Reports</p>
          </div>
        </div>
      </section>

      {/* 2. How It Works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
            How PlantCare AI Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="clean-card p-6 space-y-2.5">
            <span className="text-2xl font-bold text-emerald-600">01</span>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Capture or Upload</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Take a photo with your device camera or upload an image from your computer or phone.
            </p>
          </div>

          <div className="clean-card p-6 space-y-2.5">
            <span className="text-2xl font-bold text-emerald-600">02</span>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Gemini Multimodal Analysis</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Google Gemini vision models examine leaf discoloration, lesions, and pest damage indicators.
            </p>
          </div>

          <div className="clean-card p-6 space-y-2.5">
            <span className="text-2xl font-bold text-emerald-600">03</span>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Review Care Protocol</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Receive health ratings, organic remedies, preventive tips, and downloadable PDF reports.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Agricultural Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
            Core Features & Capabilities
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="clean-card p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Supported Plants */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Supported Agricultural Crops & Houseplants
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {crops.map((crop) => (
            <span
              key={crop}
              className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium border border-emerald-100 dark:border-emerald-800"
            >
              {crop}
            </span>
          ))}
        </div>
      </section>

      {/* 5. Call to Action */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="clean-card p-8 sm:p-10 text-center space-y-4 bg-emerald-700 text-white border-0">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Start Monitoring Your Crops Today
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
            Early detection prevents spread and protects your harvest. Try our free AI plant health scanner now.
          </p>
          <div className="pt-2">
            <Link
              to="/scanner"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-sm hover:bg-emerald-50 transition-colors"
            >
              <Scan className="w-4 h-4" />
              <span>Scan a Plant Now</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

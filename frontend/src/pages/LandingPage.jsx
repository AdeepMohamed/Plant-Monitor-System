import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import {
  Sprout,
  Scan,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Upload,
  Cpu,
  FileCheck2,
  Bug,
  Droplets,
  Sun,
  Activity,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Leaf,
  Layers,
  ChevronRight
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
    // Try to load genuine stats if available
    api.dashboard.getStats()
      .then(data => {
        if (data) setStats(data);
      })
      .catch(() => {
        // Fallback or unauthenticated state
      });
  }, []);

  const features = [
    {
      icon: Scan,
      title: "Disease & Pathogen Detection",
      desc: "Detect early signs of blights, rusts, powdery mildew, fungal spots, and bacterial wilt before crop loss occurs.",
      color: "emerald"
    },
    {
      icon: Bug,
      title: "Pest & Infestation Identification",
      desc: "Spot visible mite damage, aphids, thrips, caterpillars, and leaf miners with visual indicator mapping.",
      color: "amber"
    },
    {
      icon: Droplets,
      title: "Nutrient Deficiency Diagnostics",
      desc: "Analyze chlorosis and leaf discoloration to pinpoint Nitrogen, Phosphorus, Potassium, Iron, or Magnesium deficits.",
      color: "blue"
    },
    {
      icon: ShieldCheck,
      title: "Targeted Organic Treatments",
      desc: "Receive biological controls, neem formulations, compost regimens, and safe cultural practices.",
      color: "emerald"
    },
    {
      icon: Activity,
      title: "Longitudinal Health Monitoring",
      desc: "Track health recovery curves over time and compare progression between scans.",
      color: "teal"
    },
    {
      icon: Cpu,
      title: "Gemini Conversational Agronomist",
      desc: "Ask follow-up questions in natural language about fertilizers, irrigation schedules, and weather resilience.",
      color: "purple"
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Capture or Upload",
      desc: "Take a clear photograph of the affected plant leaf, stem, or whole plant using your camera or upload from files."
    },
    {
      step: "02",
      title: "Gemini Vision AI Analysis",
      desc: "Our neural pipeline transmits the image to Google Gemini Multimodal Vision to inspect lesions, discoloration, and morphology."
    },
    {
      step: "03",
      title: "Review Treatment & Care Plan",
      desc: "Obtain an indicative health score (0–100), diagnosis confidence, organic and chemical remedies, and downloadable PDF report."
    }
  ];

  const crops = [
    { name: "Tomato", icon: "🍅", desc: "Early & Late Blight, Septoria, Blossom End Rot" },
    { name: "Rice", icon: "🌾", desc: "Blast, Brown Spot, Bacterial Leaf Blight" },
    { name: "Wheat", icon: "🌱", desc: "Rust, Powdery Mildew, Tan Spot" },
    { name: "Potato", icon: "🥔", desc: "Late Blight, Early Blight, Scab" },
    { name: "Cotton", icon: "🌿", desc: "Bollworm, Leaf Curl Virus, Bacterial Blight" },
    { name: "Banana", icon: "🍌", desc: "Panama Wilt, Sigatoka Leaf Spot" },
    { name: "Mango", icon: "🥭", desc: "Anthracnose, Powdery Mildew, Dieback" },
    { name: "Chilli & Pepper", icon: "🌶️", desc: "Anthracnose Fruit Rot, Leaf Curl, Mites" },
    { name: "Brinjal (Eggplant)", icon: "🍆", desc: "Shoot & Fruit Borer, Phomopsis Blight" },
    { name: "Houseplants", icon: "🪴", desc: "Monstera, Ficus, Snake Plant root/leaf issues" },
  ];

  return (
    <div className="space-y-24 pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold tracking-wide shadow-xs animate-in fade-in duration-300">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Powered by Google Gemini Multimodal Vision API</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-emerald-950 dark:text-white tracking-tight leading-[1.15]">
            Your Plants Deserve <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Intelligent Care.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
            {t('heroSubtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/scanner"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 transition-all transform hover:-translate-y-0.5"
            >
              <Scan className="w-5 h-5" />
              <span>{t('uploadPhotoCTA')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold text-base hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <span>{t('exploreFeaturesCTA')}</span>
            </a>
          </div>

          {/* Genuine App Stats Bar */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl glass-panel text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {stats.total_analyses > 0 ? stats.total_analyses : "100%"}
              </span>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                {stats.total_analyses > 0 ? "Total Scans Completed" : "Real Gemini Diagnostics"}
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-panel text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {stats.total_plants > 0 ? stats.total_plants : "20+"}
              </span>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                {stats.total_plants > 0 ? "Plants in Garden" : "Agricultural Crops"}
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-panel text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                0–100
              </span>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                Objective Health Scoring
              </p>
            </div>
            <div className="p-4 rounded-2xl glass-panel text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                PDF
              </span>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                Downloadable Reports
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Simple 3-Step Workflow
          </span>
          <h2 className="text-3xl font-black text-emerald-950 dark:text-white mt-1">
            How PlantCare AI Diagnoses Your Crops
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((st, i) => (
            <div
              key={st.step}
              className="relative p-6 rounded-2xl bg-white dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl font-black text-emerald-200 dark:text-emerald-900/80 mb-3">
                {st.step}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {st.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Intelligent Agronomy
          </span>
          <h2 className="text-3xl font-black text-emerald-950 dark:text-white mt-1">
            Engineered For Farmers, Gardeners & Enthusiasts
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Never guess whether yellowing is nitrogen starvation, overwatering, or fungal infection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl glass-panel hover:border-emerald-500/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Supported Plant Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-950 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Multi-Crop Support
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Trained Across Field Crops, Fruit Trees & Houseplants
              </h2>
              <p className="text-xs text-emerald-200/80 mt-2 leading-relaxed">
                While pre-configured for primary staple crops, Google Gemini vision analyzes any plant species in your greenhouse or backyard.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {crops.map((c) => (
                <div
                  key={c.name}
                  className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 hover:bg-white/15 transition-colors"
                >
                  <div className="text-2xl mb-1">{c.icon}</div>
                  <h4 className="text-xs font-bold text-white">{c.name}</h4>
                  <p className="text-[10px] text-emerald-200/70 truncate mt-0.5">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI Technology & Transparency */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Ethical AI & Sound Agronomy
            </span>
            <h2 className="text-3xl font-black text-emerald-950 dark:text-white leading-tight">
              Evidence-Based Diagnostics, Not Fabricated Guesses.
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Unlike generic classification models that force an answer, PlantCare AI operates under strict agricultural guidelines:
            </p>
            <ul className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><b>Separates Symptoms from Root Causes:</b> Leaf spots are evaluated for fungal fruiting bodies, pest punctures, or physiological stress.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><b>Refuses to Invent Pathogens:</b> If photographic resolution is blurry or insufficient, an "Inconclusive" verdict is returned with instructions for a better angle.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><b>Prioritizes Organic Solutions First:</b> Bio-fungicides, beneficial predatory insects, neem oil, and pruning come before chemical alternatives.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><b>Chemical Safety First:</b> Emphasizes PPE precautions, manufacturer label instructions, and avoids arbitrary or unsafe dosage recipes.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-emerald-500/20 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-emerald-900">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Live Sample Diagnostic Output</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">
                Confidence 94%
              </span>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Identified Crop:</span>
                <span className="font-bold text-gray-800 dark:text-white">Solanum lycopersicum (Tomato)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Observed Condition:</span>
                <span className="font-bold text-amber-600">Early Blight (Alternaria solani)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Health Score:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">68/100 (Moderate)</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 text-[11px] text-emerald-900 dark:text-emerald-200">
                <b>Immediate Action:</b> Prune lower infected leaves showing concentric dark rings. Water exclusively at root zone to prevent leaf splash. Apply copper fungicide or Bacillus subtilis biopesticide.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action Footer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center shadow-xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black">
            Start Monitoring Your Plants Today
          </h2>
          <p className="max-w-xl mx-auto text-sm text-emerald-100">
            Join agriculturalists, farmers, and plant enthusiasts who rely on PlantCare AI for fast, scientifically sound plant diagnostics.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/scanner"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-emerald-800 font-bold text-sm shadow-md hover:bg-emerald-50 transition-colors"
            >
              Analyze Your First Plant Free
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

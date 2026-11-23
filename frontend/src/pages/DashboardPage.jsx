import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { HealthBadge } from '../components/HealthBadge';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Sprout,
  Scan,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Clock,
  PlusCircle,
  FileText,
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const DashboardPage = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, activityData, analysesData] = await Promise.all([
          api.dashboard.getStats(),
          api.dashboard.getRecentActivity(),
          api.analyses.getAll()
        ]);
        setStats(statsData);
        setRecentActivity(activityData);
        setRecentAnalyses(analysesData.slice(0, 4));
      } catch (err) {
        console.error("Dashboard data load failed:", err);
        setError("Unable to load dashboard metrics. Please verify backend connection.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-xs font-semibold text-gray-500">Retrieving agricultural metrics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: t('totalPlants'),
      value: stats?.total_plants || 0,
      icon: Sprout,
      desc: "Registered crop profiles",
      color: "emerald"
    },
    {
      title: t('totalAnalyses'),
      value: stats?.total_analyses || 0,
      icon: Scan,
      desc: "Gemini diagnostic scans",
      color: "teal"
    },
    {
      title: t('healthyPlants'),
      value: stats?.healthy_plants || 0,
      icon: CheckCircle2,
      desc: "Score >= 75 (Optimal)",
      color: "green"
    },
    {
      title: t('attentionNeeded'),
      value: stats?.attention_needed || 0,
      icon: AlertTriangle,
      desc: "Score < 75 (Action required)",
      color: "amber"
    }
  ];

  const distributionData = stats?.health_distribution?.filter(d => d.value > 0) || [];
  const diseaseData = stats?.disease_summary || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner: Quick Action & Status */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-emerald-200 text-xs font-semibold border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Multimodal Vision Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Agricultural Health Overview
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
            Real-time crop surveillance and diagnostic intelligence powered by Google Gemini. All metrics reflect your actual database records.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/scanner"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-emerald-900 font-bold text-xs uppercase tracking-wider shadow-md hover:bg-emerald-50 hover:shadow-lg transition-all"
          >
            <Scan className="w-4 h-4" />
            <span>{t('quickScan')}</span>
          </Link>
          <Link
            to="/plants"
            className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-xs hover:bg-white/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Plant</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl glass-panel border border-emerald-100 dark:border-emerald-900/60 shadow-xs hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {card.title}
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {card.value}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                {card.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Health Distribution Chart */}
        <div className="p-6 rounded-2xl glass-panel border border-emerald-100 dark:border-emerald-900/60 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t('healthDistribution')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Categorized health status across all completed plant scans
              </p>
            </div>
            {stats?.average_health_score > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                Avg: {stats.average_health_score}/100
              </span>
            )}
          </div>

          {distributionData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(16, 75, 50, 0.95)',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                {distributionData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span>{d.name}: <b>{d.value}</b></span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-200 dark:border-emerald-900 rounded-xl">
              <Scan className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-xs font-medium text-gray-500">No plant diagnostic data yet.</p>
              <Link to="/scanner" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 hover:underline">
                Run your first plant scan →
              </Link>
            </div>
          )}
        </div>

        {/* Detected Issues / Disease Summary Bar Chart */}
        <div className="p-6 rounded-2xl glass-panel border border-emerald-100 dark:border-emerald-900/60 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t('diseaseSummary')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Frequency of detected plant diseases & visible physiological symptoms
              </p>
            </div>
          </div>

          {diseaseData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diseaseData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" allowDecimals={false} fontSize={11} />
                  <YAxis type="category" dataKey="disease" width={120} fontSize={10} tick={{ fill: 'currentColor' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(16, 75, 50, 0.95)',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" fill="#16834A" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-200 dark:border-emerald-900 rounded-xl">
              <Sprout className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-xs font-medium text-gray-500">No diseases or pest issues recorded yet.</p>
              <p className="text-[11px] text-gray-400 mt-1">Upload healthy or symptomatic plant photos to track trends.</p>
            </div>
          )}
        </div>

      </div>

      {/* Recent Analyses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {t('recentAnalyses')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Latest AI multimodal examinations
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 flex items-center gap-1"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAnalyses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentAnalyses.map((a) => (
              <Link
                key={a.id}
                to={`/analysis/${a.id}`}
                className="group rounded-2xl glass-panel border border-emerald-100 dark:border-emerald-900/60 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-video w-full bg-gray-100 dark:bg-emerald-950 overflow-hidden relative">
                  <img
                    src={a.image_path}
                    alt={a.common_name || "Plant Scan"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <HealthBadge status={a.health_status} score={a.health_score} size="sm" />
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {a.common_name || "Unidentified Plant"}
                  </h4>
                  <p className="text-[11px] text-gray-500 italic truncate">
                    {a.scientific_name || "Species unknown"}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-emerald-900/60 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline">
                      View Report →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl glass-panel text-center space-y-3">
            <Scan className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              No scans recorded yet
            </h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Scan your crops or houseplants to inspect symptoms, identify pests, and receive immediate organic solutions.
            </p>
            <Link
              to="/scanner"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md hover:bg-emerald-700"
            >
              <Scan className="w-4 h-4" />
              <span>Launch AI Scanner</span>
            </Link>
          </div>
        )}
      </div>

      {/* Real Recent Activity Timeline */}
      <div className="p-6 rounded-2xl glass-panel border border-emerald-100 dark:border-emerald-900/60 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
          {t('recentActivity')}
        </h3>

        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((act) => (
              <div
                key={`${act.type}-${act.id}`}
                className="flex items-start gap-3.5 pb-4 border-b border-gray-100 dark:border-emerald-900/60 last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
                  {act.type === 'analysis' ? <Scan className="w-4 h-4" /> : <Sprout className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {act.title}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center py-6">
            No recent activity recorded yet. Create a plant profile or scan a leaf to populate this feed.
          </p>
        )}
      </div>

    </div>
  );
};

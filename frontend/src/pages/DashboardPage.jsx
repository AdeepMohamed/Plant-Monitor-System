import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { HealthBadge } from '../components/HealthBadge';
import {
  Sprout,
  Scan,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Plus,
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
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [statsData, activityData, analysesData] = await Promise.all([
          api.dashboard.getStats(),
          api.dashboard.getRecentActivity(),
          api.analyses.getAll()
        ]);
        setStats(statsData);
        setRecentActivity(activityData || []);
        setRecentAnalyses(analysesData?.slice(0, 4) || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs text-gray-500 font-medium">Loading metrics...</p>
      </div>
    );
  }

  const statCards = [
    { title: "Total Plants", value: stats?.total_plants || 0, desc: "Active in garden", color: "text-gray-900 dark:text-white" },
    { title: "Analyses Completed", value: stats?.total_analyses || 0, desc: "Total diagnostic scans", color: "text-gray-900 dark:text-white" },
    { title: "Healthy Plants", value: stats?.healthy_plants || 0, desc: "Score ≥ 75", color: "text-emerald-600" },
    { title: "Requires Attention", value: stats?.attention_needed || 0, desc: "Score < 75", color: "text-amber-600" }
  ];

  const distribution = stats?.health_distribution?.filter(d => d.value > 0) || [];
  const diseases = stats?.disease_summary || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Overview of plant health, recent diagnoses, and agricultural alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/scanner"
            className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan Plant</span>
          </Link>
          <Link
            to="/plants"
            className="btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Add Plant</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="clean-card p-5">
            <span className="text-xs font-semibold text-gray-500 block">
              {card.title}
            </span>
            <div className={`text-2xl sm:text-3xl font-bold tracking-tight mt-1.5 ${card.color}`}>
              {card.value}
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block">
              {card.desc}
            </span>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Health Distribution */}
        <div className="clean-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Health Score Distribution
            </h3>
            {stats?.average_health_score > 0 && (
              <span className="text-xs font-semibold text-gray-500">
                Avg: {stats.average_health_score}/100
              </span>
            )}
          </div>

          {distribution.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
                {distribution.map((d, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span>{d.name}: <b>{d.value}</b></span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-gray-400">
              No health distribution data yet.
            </div>
          )}
        </div>

        {/* Common Detected Issues */}
        <div className="clean-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Common Diagnosed Conditions
          </h3>

          {diseases.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diseases} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" allowDecimals={false} fontSize={11} />
                  <YAxis type="category" dataKey="disease" width={110} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16834A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-gray-400">
              No disease conditions detected.
            </div>
          )}
        </div>

      </div>

      {/* Recent Scans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Recent Scans
          </h2>
          <Link to="/history" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAnalyses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentAnalyses.map((a) => (
              <Link
                key={a.id}
                to={`/analysis/${a.id}`}
                className="clean-card clean-card-hover overflow-hidden flex flex-col group"
              >
                <div className="aspect-video w-full bg-gray-100 dark:bg-emerald-950 overflow-hidden relative">
                  <img src={a.image_path} alt={a.common_name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <HealthBadge status={a.health_status} score={a.health_score} size="sm" />
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {a.common_name || "Unidentified Plant"}
                  </h4>
                  <p className="text-[11px] text-gray-500 italic truncate">
                    {a.scientific_name || "Species unknown"}
                  </p>
                  <p className="text-[10px] text-gray-400 pt-1">
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="clean-card p-8 text-center text-xs text-gray-500">
            No scans recorded yet. <Link to="/scanner" className="text-emerald-600 font-semibold hover:underline">Scan your first plant →</Link>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="clean-card p-6 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        {recentActivity.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-emerald-900/60">
            {recentActivity.map((act, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{act.title}</span>
                  <p className="text-[11px] text-gray-400">{act.description}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No activity logged yet.</p>
        )}
      </div>

    </div>
  );
};

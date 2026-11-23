import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { HealthBadge } from '../components/HealthBadge';
import {
  TrendingUp,
  Columns,
  Download,
  Trash2,
  Scan,
  X,
  ExternalLink,
  Loader2,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export const HistoryPage = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlantFilter, setSelectedPlantFilter] = useState('All');

  // Comparison
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareIdA, setCompareIdA] = useState('');
  const [compareIdB, setCompareIdB] = useState('');

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const data = await api.analyses.getAll();
      setAnalyses(data || []);
      if (data && data.length >= 2) {
        setCompareIdA(data[0].id.toString());
        setCompareIdB(data[1].id.toString());
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const handleDeleteAnalysis = async (id, name) => {
    if (!window.confirm(`Delete report for '${name || "Plant"}'?`)) return;
    try {
      await api.analyses.delete(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const uniquePlants = Array.from(new Set(analyses.map(a => a.common_name).filter(Boolean)));

  const filteredAnalyses = analyses.filter(a => {
    if (selectedPlantFilter === 'All') return true;
    return a.common_name === selectedPlantFilter;
  });

  const chartData = filteredAnalyses
    .slice()
    .reverse()
    .map(a => ({
      date: new Date(a.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      score: a.health_score
    }));

  const scanA = analyses.find(a => a.id.toString() === compareIdA);
  const scanB = analyses.find(a => a.id.toString() === compareIdB);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Health History
          </h1>
          <p className="text-xs text-gray-500">
            Timeline of plant health scans and longitudinal recovery tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {analyses.length >= 2 && (
            <button
              type="button"
              onClick={() => setIsCompareOpen(true)}
              className="btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Compare Scans</span>
            </button>
          )}

          <Link
            to="/scanner"
            className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </Link>
        </div>
      </div>

      {/* Chart */}
      {analyses.length > 0 && (
        <div className="clean-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Health Score Trends</span>
            </h3>

            {uniquePlants.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={selectedPlantFilter}
                  onChange={(e) => setSelectedPlantFilter(e.target.value)}
                  className="px-2 py-1 rounded-md border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-xs"
                >
                  <option value="All">All Plants</option>
                  {uniquePlants.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis domain={[0, 100]} fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#16834A" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Scans Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs text-gray-500 font-medium">Loading history...</p>
        </div>
      ) : filteredAnalyses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnalyses.map((a) => (
            <div
              key={a.id}
              className="clean-card clean-card-hover overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video w-full bg-gray-100 dark:bg-emerald-950 overflow-hidden relative">
                  <img src={a.image_path} alt={a.common_name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <HealthBadge status={a.health_status} score={a.health_score} size="sm" />
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {a.common_name || "Plant Scan"}
                      </h4>
                      <p className="text-[11px] text-gray-500 italic truncate">
                        {a.scientific_name || "Species unknown"}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {a.detected_issues?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {a.detected_issues.map((iss, ii) => (
                        <span key={ii} className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          {iss.issue_name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-emerald-600 font-medium">✓ Healthy specimen</p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-100 dark:border-emerald-900/60 mt-2 gap-2">
                <Link
                  to={`/analysis/${a.id}`}
                  className="btn-primary flex-1 py-1.5 text-xs text-center flex items-center justify-center gap-1"
                >
                  <span>View Report</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <a
                  href={api.analyses.downloadPdfUrl(a.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-emerald-800 text-gray-500 hover:text-emerald-600 transition-colors"
                  title="PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => handleDeleteAnalysis(a.id, a.common_name)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="clean-card p-12 text-center text-xs text-gray-500">
          No historical scans recorded yet. <Link to="/scanner" className="text-emerald-600 font-semibold hover:underline">Scan a plant →</Link>
        </div>
      )}

      {/* Comparison Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white dark:bg-emerald-950 rounded-2xl shadow-xl border border-gray-200 dark:border-emerald-900 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-emerald-900 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Columns className="w-4 h-4 text-emerald-600" />
                <span>Compare Two Scans</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCompareOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-gray-600 block mb-1">Earlier Scan:</label>
                <select
                  value={compareIdA}
                  onChange={(e) => setCompareIdA(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-emerald-800"
                >
                  {analyses.map(a => (
                    <option key={a.id} value={a.id}>#{a.id} - {a.common_name} (Score: {a.health_score})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-600 block mb-1">Follow-up Scan:</label>
                <select
                  value={compareIdB}
                  onChange={(e) => setCompareIdB(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-emerald-800"
                >
                  {analyses.map(a => (
                    <option key={a.id} value={a.id}>#{a.id} - {a.common_name} (Score: {a.health_score})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {scanA && (
                <div className="p-4 rounded-xl border border-gray-200 dark:border-emerald-900 space-y-2">
                  <img src={scanA.image_path} alt="Scan A" className="w-full aspect-video object-cover rounded-lg" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{scanA.common_name}</span>
                    <HealthBadge status={scanA.health_status} score={scanA.health_score} size="sm" />
                  </div>
                  <p className="text-[11px] text-gray-400">Date: {new Date(scanA.created_at).toLocaleDateString()}</p>
                </div>
              )}
              {scanB && (
                <div className="p-4 rounded-xl border border-gray-200 dark:border-emerald-900 space-y-2">
                  <img src={scanB.image_path} alt="Scan B" className="w-full aspect-video object-cover rounded-lg" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{scanB.common_name}</span>
                    <HealthBadge status={scanB.health_status} score={scanB.health_score} size="sm" />
                  </div>
                  <p className="text-[11px] text-gray-400">Date: {new Date(scanB.created_at).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

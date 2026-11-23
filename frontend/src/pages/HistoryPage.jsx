import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { HealthBadge } from '../components/HealthBadge';
import {
  History,
  TrendingUp,
  Columns,
  Download,
  Trash2,
  Calendar,
  Clock,
  Scan,
  AlertCircle,
  X,
  ExternalLink,
  Loader2,
  Sprout,
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
  const [error, setError] = useState('');
  const [selectedPlantFilter, setSelectedPlantFilter] = useState('All');

  // Comparison Modal State
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
      console.error("Failed to load history:", err);
      setError("Failed to retrieve diagnostic history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const handleDeleteAnalysis = async (id, name) => {
    if (!window.confirm(`Delete diagnostic report for '${name || "Plant"}'?`)) return;
    try {
      await api.analyses.delete(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert("Failed to delete report: " + err.message);
    }
  };

  // Unique plants for filtering
  const uniquePlants = Array.from(new Set(analyses.map(a => a.common_name).filter(Boolean)));

  const filteredAnalyses = analyses.filter(a => {
    if (selectedPlantFilter === 'All') return true;
    return a.common_name === selectedPlantFilter;
  });

  // Recharts timeline
  const chartData = filteredAnalyses
    .slice()
    .reverse()
    .map(a => ({
      date: new Date(a.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      score: a.health_score,
      plant: a.common_name || "Plant"
    }));

  const scanA = analyses.find(a => a.id.toString() === compareIdA);
  const scanB = analyses.find(a => a.id.toString() === compareIdB);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-white">
            Health Monitoring History
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Chronological record of all plant health assessments, symptoms, and treatment tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          {analyses.length >= 2 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs shadow-xs hover:bg-emerald-50"
            >
              <Columns className="w-4 h-4" />
              <span>Compare Two Scans</span>
            </button>
          )}

          <Link
            to="/scanner"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md"
          >
            <Scan className="w-4 h-4" />
            <span>New Scan</span>
          </Link>
        </div>
      </div>

      {/* Filter and Timeline Chart */}
      {analyses.length > 0 && (
        <div className="p-6 rounded-3xl glass-panel border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Health Score Trajectory Over Time</span>
              </h3>
              <p className="text-xs text-gray-500">
                Visualizing diagnostic fluctuations and treatment efficacy
              </p>
            </div>

            {uniquePlants.length > 1 && (
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={selectedPlantFilter}
                  onChange={(e) => setSelectedPlantFilter(e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-800 dark:text-white"
                >
                  <option value="All">All Plant Species</option>
                  {uniquePlants.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis domain={[0, 100]} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(16, 75, 50, 0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#16834A"
                  strokeWidth={3}
                  dot={{ fill: '#16834A', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Historical Scans List */}
      <div className="space-y-4">
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            <p className="text-xs font-semibold text-gray-500">Retrieving diagnostic history...</p>
          </div>
        ) : filteredAnalyses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnalyses.map((a) => (
              <div
                key={a.id}
                className="rounded-3xl glass-panel border border-emerald-100 dark:border-emerald-900/60 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo Thumbnail */}
                  <div className="aspect-video w-full bg-black/5 overflow-hidden relative">
                    <img
                      src={a.image_path}
                      alt={a.common_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <HealthBadge status={a.health_status} score={a.health_score} size="sm" />
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(a.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">
                        {a.common_name || "Unidentified Plant"}
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 italic font-medium truncate">
                        {a.scientific_name || "Species unknown"}
                      </p>
                    </div>

                    {/* Detected Issues pills */}
                    {a.detected_issues?.length > 0 ? (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400">
                          Detected Conditions:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {a.detected_issues.map((iss, ii) => (
                            <span
                              key={ii}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 font-medium"
                            >
                              {iss.issue_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ No pathogen detected (Foliage optimal)
                      </p>
                    )}

                    {a.analysis_summary && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {a.analysis_summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 pt-0 flex items-center justify-between border-t border-gray-100 dark:border-emerald-900/60 gap-2">
                  <Link
                    to={`/analysis/${a.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    <span>View Diagnostic</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <a
                    href={api.analyses.downloadPdfUrl(a.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl border border-gray-200 dark:border-emerald-800 text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDeleteAnalysis(a.id, a.common_name)}
                    className="p-2 rounded-xl text-gray-400 hover:text-rose-600 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl glass-panel text-center space-y-3 max-w-md mx-auto">
            <History className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              No historical scans recorded
            </h3>
            <p className="text-xs text-gray-500">
              Run your first plant analysis to establish an agricultural health baseline.
            </p>
            <Link
              to="/scanner"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Scan a Plant Now
            </Link>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white dark:bg-emerald-950 rounded-3xl shadow-2xl border border-emerald-200 dark:border-emerald-900 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-emerald-900 pb-3">
              <h3 className="text-base font-black text-emerald-950 dark:text-white flex items-center gap-2">
                <Columns className="w-5 h-5 text-emerald-600" />
                <span>Side-by-Side Condition Comparison</span>
              </h3>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Baseline / Earlier Scan:
                </label>
                <select
                  value={compareIdA}
                  onChange={(e) => setCompareIdA(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-800 dark:text-white"
                >
                  {analyses.map(a => (
                    <option key={a.id} value={a.id}>
                      #{a.id} - {a.common_name} ({new Date(a.created_at).toLocaleDateString()}) - Score: {a.health_score}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Recent / Follow-up Scan:
                </label>
                <select
                  value={compareIdB}
                  onChange={(e) => setCompareIdB(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-800 dark:text-white"
                >
                  {analyses.map(a => (
                    <option key={a.id} value={a.id}>
                      #{a.id} - {a.common_name} ({new Date(a.created_at).toLocaleDateString()}) - Score: {a.health_score}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Scan A */}
              {scanA && (
                <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 space-y-3">
                  <div className="aspect-video rounded-xl overflow-hidden bg-black/5">
                    <img src={scanA.image_path} alt="Scan A" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{scanA.common_name}</h4>
                    <HealthBadge status={scanA.health_status} score={scanA.health_score} size="sm" />
                  </div>
                  <p className="text-xs text-gray-500">Date: {new Date(scanA.created_at).toLocaleDateString()}</p>
                  <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                    <b>Observed Issues:</b>
                    <ul className="list-disc list-inside text-[11px] text-gray-600 dark:text-gray-400">
                      {scanA.detected_issues?.map((i, idx) => (
                        <li key={idx}>{i.issue_name}</li>
                      )) || <li>None recorded</li>}
                    </ul>
                  </div>
                </div>
              )}

              {/* Scan B */}
              {scanB && (
                <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 space-y-3">
                  <div className="aspect-video rounded-xl overflow-hidden bg-black/5">
                    <img src={scanB.image_path} alt="Scan B" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{scanB.common_name}</h4>
                    <HealthBadge status={scanB.health_status} score={scanB.health_score} size="sm" />
                  </div>
                  <p className="text-xs text-gray-500">Date: {new Date(scanB.created_at).toLocaleDateString()}</p>
                  <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                    <b>Observed Issues:</b>
                    <ul className="list-disc list-inside text-[11px] text-gray-600 dark:text-gray-400">
                      {scanB.detected_issues?.map((i, idx) => (
                        <li key={idx}>{i.issue_name}</li>
                      )) || <li>None recorded</li>}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Health Score Differential */}
            {scanA && scanB && (
              <div className="p-4 rounded-xl bg-white dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Health Differential
                </span>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                  {scanB.health_score - scanA.health_score > 0 ? "+" : ""}
                  {scanB.health_score - scanA.health_score} Points Change
                </p>
                <p className="text-[11px] text-gray-500">
                  {scanB.health_score >= scanA.health_score
                    ? "✓ Plant health demonstrates steady positive recovery."
                    : "⚠️ Health score has declined. Review recommended treatment actions."}
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

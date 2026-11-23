import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { HealthBadge } from '../components/HealthBadge';
import {
  Sprout,
  Scan,
  ArrowLeft,
  Calendar,
  MapPin,
  Droplets,
  Sun,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink
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

export const PlantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plant, setPlant] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [plantData, analysesData] = await Promise.all([
          api.plants.getOne(id),
          api.plants.getAnalyses(id)
        ]);
        setPlant(plantData);
        setAnalyses(analysesData || []);
      } catch (err) {
        console.error("Failed to load plant details:", err);
        setError("Could not retrieve plant details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-xs font-semibold text-gray-500">Loading plant profile and diagnostic history...</p>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Plant Not Found</h2>
        <Link to="/plants" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600">
          ← Back to My Plants
        </Link>
      </div>
    );
  }

  // Format data for health trend chart
  const trendData = analyses
    .slice()
    .reverse()
    .map(a => ({
      date: new Date(a.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      score: a.health_score,
      status: a.health_status
    }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Back button */}
      <Link
        to="/plants"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Plants</span>
      </Link>

      {/* Plant Overview Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-emerald-100 dark:border-emerald-900/60 shadow-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-4 aspect-square rounded-2xl overflow-hidden bg-black/10 dark:bg-emerald-950/40 relative">
            <img
              src={plant.image_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'}
              alt={plant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80';
              }}
            />
            {plant.latest_health_status && (
              <div className="absolute top-3 right-3">
                <HealthBadge status={plant.latest_health_status} score={plant.latest_health_score} size="md" />
              </div>
            )}
          </div>

          <div className="md:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {plant.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-0.5">
                  {plant.name}
                </h1>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 italic font-medium">
                  {plant.species || "Species unspecified"}
                </p>
              </div>

              <Link
                to="/scanner"
                state={{ plantId: plant.id }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md"
              >
                <Scan className="w-4 h-4" />
                <span>Scan Health Now</span>
              </Link>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Location</span>
                <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{plant.location || "General Bed"}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Watering</span>
                <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{plant.watering_frequency || "Regular"}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Sunlight</span>
                <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{plant.sunlight_requirement || "Full sun"}</p>
              </div>
            </div>

            {plant.notes && (
              <div className="pt-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Notes:</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{plant.notes}</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Health Trajectory Chart */}
      {trendData.length > 1 && (
        <div className="p-6 rounded-3xl glass-panel border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Health Score Progression Over Time</span>
              </h3>
              <p className="text-xs text-gray-500">
                Longitudinal recovery tracking across scans
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Recorded Diagnostic Scans ({analyses.length})
        </h3>

        {analyses.length > 0 ? (
          <div className="space-y-3">
            {analyses.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-2xl glass-panel border border-emerald-100 dark:border-emerald-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/5 shrink-0">
                    <img src={a.image_path} alt="Scan thumbnail" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {new Date(a.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <HealthBadge status={a.health_status} score={a.health_score} size="sm" />
                    </div>
                    <p className="text-xs text-gray-500 max-w-md truncate">
                      {a.analysis_summary || "Health assessment report recorded."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Link
                    to={`/analysis/${a.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    <span>View Report</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl glass-panel text-center space-y-3">
            <Scan className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="text-xs text-gray-500">No diagnostic scans recorded for this plant profile yet.</p>
            <Link
              to="/scanner"
              state={{ plantId: plant.id }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Scan This Plant Now
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

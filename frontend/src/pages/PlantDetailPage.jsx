import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { HealthBadge } from '../components/HealthBadge';
import {
  Scan,
  ArrowLeft,
  Calendar,
  MapPin,
  Droplets,
  Sun,
  TrendingUp,
  AlertCircle,
  Loader2,
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs text-gray-500">Loading plant profile...</p>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Plant Not Found</h2>
        <Link to="/plants" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Plants
        </Link>
      </div>
    );
  }

  const trendData = analyses
    .slice()
    .reverse()
    .map(a => ({
      date: new Date(a.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      score: a.health_score,
      status: a.health_status
    }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <Link
        to="/plants"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to My Plants</span>
      </Link>

      {/* Main Plant Profile Card */}
      <div className="clean-card p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-4 aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-emerald-950/40 relative">
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
                <HealthBadge status={plant.latest_health_status} score={plant.latest_health_score} size="sm" />
              </div>
            )}
          </div>

          <div className="md:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  {plant.category || 'Crop'}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {plant.name}
                </h1>
                <p className="text-xs text-gray-500 italic">
                  {plant.species || 'Species unverified'}
                </p>
              </div>

              <Link
                to="/scanner"
                state={{ plantId: plant.id }}
                className="btn-primary self-start text-xs flex items-center gap-1.5"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Scan Health</span>
              </Link>
            </div>

            {/* Plant Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg border border-gray-100 dark:border-emerald-900 bg-gray-50 dark:bg-emerald-950/30">
                <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase">Location</span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{plant.location || "General Plot"}</p>
              </div>

              <div className="p-3 rounded-lg border border-gray-100 dark:border-emerald-900 bg-gray-50 dark:bg-emerald-950/30">
                <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                  <Droplets className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase">Watering</span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{plant.watering_frequency || "Regular"}</p>
              </div>

              <div className="p-3 rounded-lg border border-gray-100 dark:border-emerald-900 bg-gray-50 dark:bg-emerald-950/30">
                <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                  <Sun className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase">Sunlight</span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{plant.sunlight_requirement || "Full sun"}</p>
              </div>
            </div>

            {plant.notes && (
              <div className="pt-2 text-xs">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Notes:</span>
                <p className="text-gray-500 mt-1 leading-relaxed">{plant.notes}</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Health Trend Chart */}
      {trendData.length > 1 && (
        <div className="clean-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Health Score Trend</span>
              </h3>
              <p className="text-xs text-gray-500">Historical trajectory across recorded scans</p>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" fontSize={11} stroke="#9CA3AF" />
                <YAxis domain={[0, 100]} fontSize={11} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '11px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#16834A"
                  strokeWidth={2.5}
                  dot={{ fill: '#16834A', strokeWidth: 1.5, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recorded Analyses List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          Recorded Diagnostic Scans ({analyses.length})
        </h3>

        {analyses.length > 0 ? (
          <div className="space-y-2.5">
            {analyses.map((a) => (
              <div
                key={a.id}
                className="clean-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img src={a.image_path} alt="Scan thumbnail" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {new Date(a.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <HealthBadge status={a.health_status} score={a.health_score} size="sm" />
                    </div>
                    <p className="text-xs text-gray-500 max-w-md truncate">
                      {a.analysis_summary || "Health diagnosis report recorded."}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/analysis/${a.id}`}
                  className="btn-secondary text-xs flex items-center gap-1.5 self-end sm:self-center"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="clean-card p-8 text-center space-y-3">
            <Scan className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs text-gray-500">No diagnostic scans recorded for this plant yet.</p>
            <Link
              to="/scanner"
              state={{ plantId: plant.id }}
              className="btn-primary inline-flex items-center gap-1.5 text-xs"
            >
              Scan Now
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { HealthBadge } from '../components/HealthBadge';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Download,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Sun,
  Layers,
  Sprout,
  ShieldAlert,
  Loader2,
  PlusCircle,
  Clock,
  Info
} from 'lucide-react';

export const AnalysisResultPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Link to plant
  const [plants, setPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const data = await api.analyses.getOne(id);
        setAnalysis(data);

        if (data.health_score >= 85) {
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        }
      } catch (err) {
        console.error("Analysis load error:", err);
        setError("Diagnostic report could not be found.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();

    if (isAuthenticated) {
      api.plants.getAll().then(data => {
        if (data) setPlants(data);
      }).catch(() => {});
    }
  }, [id, isAuthenticated]);

  const handleDownloadPdf = () => {
    try {
      setDownloadingPdf(true);
      const url = api.analyses.downloadPdfUrl(id);
      window.open(url, '_blank');
    } finally {
      setTimeout(() => setDownloadingPdf(false), 1000);
    }
  };

  const handleLinkPlant = async () => {
    if (!selectedPlantId) return;
    setLinking(true);
    try {
      await api.analyses.linkPlant(id, selectedPlantId);
      setLinkSuccess("Diagnostic scan linked to plant profile.");
      const updated = await api.analyses.getOne(id);
      setAnalysis(updated);
    } catch (err) {
      console.error("Link error:", err);
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs text-gray-500 font-medium">Loading diagnostic report...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Report Not Found</h2>
        <p className="text-xs text-gray-500">{error || "This scan does not exist."}</p>
        <Link to="/scanner" className="btn-primary inline-flex px-4 py-2 text-xs">
          Start New Scan
        </Link>
      </div>
    );
  }

  const treatment = analysis.treatment_recommendations?.[0] || {};
  const issues = analysis.detected_issues || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-150">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/scanner"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Analyze Another Plant</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {downloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Download PDF</span>
          </button>

          <Link
            to="/assistant"
            state={{
              plantContext: `Plant: ${analysis.common_name} (${analysis.scientific_name}), Health: ${analysis.health_score}/100, Issues: ${issues.map(i => i.issue_name).join(', ')}`
            }}
            className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask Agronomy Assistant</span>
          </Link>
        </div>
      </div>

      {/* Main Diagnostic Summary Card */}
      <div className="clean-card p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Specimen Photograph */}
          <div className="md:col-span-4 aspect-4/3 rounded-xl overflow-hidden bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-emerald-900 relative">
            <img
              src={analysis.image_path}
              alt={analysis.common_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Identification & Health Assessment */}
          <div className="md:col-span-8 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-emerald-600">
                  {Math.round(analysis.identification_confidence * 100)}% Species Confidence
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-0.5">
                  {analysis.common_name || "Unidentified Plant"}
                </h1>
                <p className="text-xs text-gray-500 italic">
                  {analysis.scientific_name || "Species unavailable"}
                </p>
              </div>

              {/* Health Score Pill */}
              <div className="flex items-center gap-2">
                <HealthBadge status={analysis.health_status} score={analysis.health_score} size="lg" />
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-emerald-950/40 border border-gray-100 dark:border-emerald-900">
                <span className="text-[10px] font-semibold text-gray-400 block uppercase">Severity</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{analysis.severity || "None"}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-emerald-950/40 border border-gray-100 dark:border-emerald-900">
                <span className="text-[10px] font-semibold text-gray-400 block uppercase">Follow-up Check</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">In {analysis.next_check_days || 7} days</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-emerald-950/40 border border-gray-100 dark:border-emerald-900 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-semibold text-gray-400 block uppercase">Scan Date</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {new Date(analysis.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Summary */}
            {analysis.analysis_summary && (
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pt-1">
                {analysis.analysis_summary}
              </p>
            )}
          </div>

        </div>

        {/* Link to Garden Plant Profile */}
        {plants.length > 0 && !analysis.plant_id && (
          <div className="pt-4 border-t border-gray-100 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Link this scan to your plant garden profile:</span>
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-800 dark:text-gray-200"
              >
                <option value="">Select Plant...</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleLinkPlant}
                disabled={!selectedPlantId || linking}
                className="btn-primary px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              >
                {linking ? "Linking..." : "Save Link"}
              </button>
            </div>
          </div>
        )}
        {linkSuccess && (
          <p className="text-xs font-semibold text-emerald-600 text-center">{linkSuccess}</p>
        )}
      </div>

      {/* Detected Issues */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <span>Observed Pathology & Pest Indicators</span>
        </h2>

        {issues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.map((issue, idx) => (
              <div key={idx} className="clean-card p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {issue.issue_name}
                    </h3>
                    {issue.possible_disease && issue.possible_disease.toLowerCase() !== "none" && (
                      <p className="text-xs font-medium text-amber-600 mt-0.5">
                        Possible Disease: {issue.possible_disease}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {Math.round((issue.confidence || 0.8) * 100)}% Match
                  </span>
                </div>

                {issue.observed_symptoms?.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Symptoms Observed:</span>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-0.5">
                      {issue.observed_symptoms.map((s, si) => <li key={si}>{s}</li>)}
                    </ul>
                  </div>
                )}

                {issue.possible_causes?.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Potential Causes:</span>
                    <ul className="list-disc list-inside text-gray-500 space-y-0.5">
                      {issue.possible_causes.map((c, ci) => <li key={ci}>{c}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="clean-card p-5 text-center text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>No pathogenic diseases detected. Foliage appears healthy.</span>
          </div>
        )}
      </div>

      {/* Nutrient Assessment */}
      {(analysis.nutrient_deficiencies?.length > 0 || analysis.nutrient_observations) && (
        <div className="clean-card p-5 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-teal-600" />
            <span>Nutrient Deficiency Analysis</span>
          </h3>
          {analysis.nutrient_deficiencies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {analysis.nutrient_deficiencies.map((nut, ni) => (
                <span key={ni} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {nut} Deficit
                </span>
              ))}
            </div>
          )}
          {analysis.nutrient_observations && (
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {analysis.nutrient_observations}
            </p>
          )}
        </div>
      )}

      {/* Treatment Protocols */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">
          Recommended Treatment Protocols
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Immediate Actions */}
          <div className="clean-card p-5 space-y-2">
            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
              Immediate Actions
            </h4>
            {treatment.immediate_actions?.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                {treatment.immediate_actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">Maintain routine care.</p>
            )}
          </div>

          {/* Organic Treatments */}
          <div className="clean-card p-5 space-y-2">
            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
              Organic & Natural Remedies
            </h4>
            {treatment.organic_treatments?.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                {treatment.organic_treatments.map((org, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{org}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">No active organic amendments required.</p>
            )}
          </div>

          {/* Conventional / Chemical Options */}
          <div className="clean-card p-5 space-y-2">
            <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wide">
              Chemical Considerations (Use With Caution)
            </h4>
            {treatment.other_treatment_options?.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                {treatment.other_treatment_options.map((chem, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <span>{chem}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">No chemical interventions needed.</p>
            )}
            <p className="text-[10px] text-amber-700 dark:text-amber-400 pt-1">
              *Safety Note: Wear protective gloves and mask. Always follow registered manufacturer label guidelines.
            </p>
          </div>

          {/* Prevention */}
          <div className="clean-card p-5 space-y-2">
            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
              Preventive Measures
            </h4>
            {treatment.preventive_measures?.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                {treatment.preventive_measures.map((prev, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{prev}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">Maintain soil health and crop rotation.</p>
            )}
          </div>

        </div>
      </div>

      {/* Routine Environmental Care */}
      <div className="clean-card p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Routine Environmental Care
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-emerald-950/40">
            <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1 mb-1">
              <Droplets className="w-3.5 h-3.5 text-emerald-600" />
              <span>Watering</span>
            </span>
            <p className="text-gray-500">{analysis.watering_guide || "Standard moisture"}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-emerald-950/40">
            <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1 mb-1">
              <Sun className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sunlight</span>
            </span>
            <p className="text-gray-500">{analysis.sunlight_guide || "Appropriate sun"}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-emerald-950/40">
            <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1 mb-1">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Soil</span>
            </span>
            <p className="text-gray-500">{analysis.soil_guide || "Well draining"}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-emerald-950/40">
            <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1 mb-1">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fertilizer</span>
            </span>
            <p className="text-gray-500">{analysis.fertilizer_guide || "Balanced compost"}</p>
          </div>
        </div>
      </div>

      {/* Disclaimers */}
      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-emerald-950/20 text-[11px] text-gray-500 space-y-1">
        <p className="font-semibold flex items-center gap-1 text-gray-700 dark:text-gray-300">
          <Info className="w-3.5 h-3.5 text-emerald-600" />
          <span>Diagnostic Notice</span>
        </p>
        <p>
          Diagnostic scores and disease classifications are indicative AI assessments powered by Google Gemini Vision. They do not replace certified phytopathological laboratory tests.
        </p>
      </div>

    </div>
  );
};

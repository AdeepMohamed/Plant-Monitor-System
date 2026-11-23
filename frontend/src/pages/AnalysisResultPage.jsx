import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { HealthBadge } from '../components/HealthBadge';
import { ScoreGauge } from '../components/ScoreGauge';
import confetti from 'canvas-confetti';
import {
  Sprout,
  Scan,
  Download,
  Share2,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Droplets,
  Sun,
  Layers,
  Calendar,
  Sparkles,
  Bot,
  ExternalLink,
  Info,
  Clock,
  PlusCircle,
  Loader2,
  FileText
} from 'lucide-react';

export const AnalysisResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Link to plant state
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

        // Fire celebratory confetti if high score
        if (data.health_score >= 85) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
      } catch (err) {
        console.error("Failed to load analysis:", err);
        setError("Analysis report not found or you may not have permission to view it.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();

    if (isAuthenticated) {
      api.plants.getAll().then(data => {
        if (data) setPlants(data);
      }).catch(err => console.error("Error loading user plants:", err));
    }
  }, [id, isAuthenticated]);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const url = api.analyses.downloadPdfUrl(id);
      window.open(url, '_blank');
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleLinkPlant = async () => {
    if (!selectedPlantId) return;
    setLinking(true);
    try {
      await api.analyses.linkPlant(id, selectedPlantId);
      setLinkSuccess("Successfully linked this diagnostic scan to your plant!");
      // Reload updated analysis
      const updated = await api.analyses.getOne(id);
      setAnalysis(updated);
    } catch (err) {
      console.error("Failed to link:", err);
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-xs font-semibold text-gray-500">Retrieving diagnostic report...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Report Not Found</h2>
        <p className="text-xs text-gray-500">{error || "The requested analysis does not exist."}</p>
        <Link
          to="/scanner"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md hover:bg-emerald-700"
        >
          <Scan className="w-4 h-4" />
          <span>Start New Scan</span>
        </Link>
      </div>
    );
  }

  const treatment = analysis.treatment_recommendations?.[0] || {};
  const issues = analysis.detected_issues || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to="/scanner"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Analyze Another Plant</span>
        </Link>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs hover:bg-emerald-50 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            {downloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Download PDF Report</span>
          </button>

          <Link
            to="/assistant"
            state={{
              plantContext: `Plant: ${analysis.common_name} (${analysis.scientific_name}), Health: ${analysis.health_score}/100 (${analysis.health_status}), Issues: ${issues.map(i => i.issue_name).join(', ')}`
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>Consult Assistant</span>
          </Link>
        </div>
      </div>

      {/* Main Diagnostic Summary Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-emerald-100 dark:border-emerald-900/60 shadow-lg space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Photo Preview with Zoom Frame */}
          <div className="md:col-span-4 space-y-2">
            <div className="aspect-square rounded-2xl overflow-hidden bg-black/5 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 relative group shadow-sm">
              <img
                src={analysis.image_path}
                alt={analysis.common_name || "Analyzed Plant"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute top-2 left-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(analysis.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 text-center">
              Original photograph evaluated by Gemini Vision
            </p>
          </div>

          {/* Plant Identification & Diagnosis Overview */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
                <Sprout className="w-3.5 h-3.5" />
                <span>Identified Species Match ({Math.round(analysis.identification_confidence * 100)}%)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                {analysis.common_name || "Unidentified Plant"}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 italic font-medium">
                {analysis.scientific_name || "Species name unavailable"}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                <span className="text-[10px] uppercase font-bold text-gray-400">Diagnosis Severity</span>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 capitalize">
                  {analysis.severity || "None"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                <span className="text-[10px] uppercase font-bold text-gray-400">Follow-Up Check</span>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  In {analysis.next_check_days || 7} days
                </p>
              </div>
            </div>

            {/* Summary */}
            {analysis.analysis_summary && (
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pt-1">
                {analysis.analysis_summary}
              </p>
            )}
          </div>

          {/* Radial Score Gauge */}
          <div className="md:col-span-3 flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-3">
              Overall Health Rating
            </span>
            <ScoreGauge score={analysis.health_score} size={150} />
            <div className="mt-3 text-center">
              <HealthBadge status={analysis.health_status} size="md" />
              <p className="text-[10px] text-gray-400 mt-2">
                Indicative assessment (0–100)
              </p>
            </div>
          </div>

        </div>

        {/* Link to Registered Plant in Garden banner */}
        {plants.length > 0 && !analysis.plant_id && (
          <div className="pt-4 border-t border-gray-100 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Link this scan to a plant in your garden to track health over time:</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-800 dark:text-white"
              >
                <option value="">Select Plant Profile...</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleLinkPlant}
                disabled={!selectedPlantId || linking}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs"
              >
                {linking ? "Linking..." : "Save Link"}
              </button>
            </div>
          </div>
        )}
        {linkSuccess && (
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center">
            {linkSuccess}
          </p>
        )}
      </div>

      {/* Detected Issues Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg font-black text-emerald-950 dark:text-white">
            Detected Issues & Pathology Observations
          </h2>
        </div>

        {issues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.map((iss, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl glass-panel border border-emerald-100 dark:border-emerald-900/60 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {iss.issue_name}
                    </h3>
                    {iss.possible_disease && iss.possible_disease.toLowerCase() !== "none" && (
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                        Possible Disease: {iss.possible_disease}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    {Math.round((iss.confidence || 0.8) * 100)}% Match
                  </span>
                </div>

                {/* Observed Symptoms */}
                {iss.observed_symptoms && iss.observed_symptoms.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                      Observed Symptoms:
                    </span>
                    <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                      {iss.observed_symptoms.map((s, si) => (
                        <li key={si}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Possible Causes */}
                {iss.possible_causes && iss.possible_causes.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                      Possible Contributing Causes:
                    </span>
                    <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                      {iss.possible_causes.map((c, ci) => (
                        <li key={ci}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              No Pathogenic Infection or Severe Pest Damage Detected
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Your plant foliage displays healthy vigor. Maintain routine watering and cultural hygiene.
            </p>
          </div>
        )}
      </div>

      {/* Nutrient Assessment */}
      {(analysis.nutrient_deficiencies?.length > 0 || analysis.nutrient_observations) && (
        <div className="p-6 rounded-2xl glass-panel border border-emerald-100 dark:border-emerald-900/60 space-y-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold text-emerald-950 dark:text-white">
              Nutrient Status & Chlorosis Analysis
            </h3>
          </div>

          {analysis.nutrient_deficiencies?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                Suspected Deficiencies:
              </span>
              {analysis.nutrient_deficiencies.map((nut, ni) => (
                <span
                  key={ni}
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                >
                  {nut}
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

      {/* Treatment Protocols Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg font-black text-emerald-950 dark:text-white">
            Actionable Treatment & Care Protocols
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Immediate Actions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Immediate Actions</span>
            </h4>
            {treatment.immediate_actions?.length > 0 ? (
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                {treatment.immediate_actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">Continue standard cultivation protocols.</p>
            )}
          </div>

          {/* Organic Treatments */}
          <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Organic & Eco-Friendly Treatments</span>
            </h4>
            {treatment.organic_treatments?.length > 0 ? (
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                {treatment.organic_treatments.map((org, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{org}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">No active organic amendments required at this stage.</p>
            )}
          </div>

          {/* Conventional / Chemical Considerations */}
          <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Conventional / Chemical Options (Use With Caution)</span>
            </h4>
            {treatment.other_treatment_options?.length > 0 ? (
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                {treatment.other_treatment_options.map((chem, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <span>{chem}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">No chemical interventions warranted.</p>
            )}
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[10px] text-amber-800 dark:text-amber-300">
              <b>Safety Notice:</b> Always wear protective gloves and eyewear. Follow manufacturer registered dosage labels strictly.
            </div>
          </div>

          {/* Preventive Measures */}
          <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Preventive Measures for Long-Term Vitality</span>
            </h4>
            {treatment.preventive_measures?.length > 0 ? (
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                {treatment.preventive_measures.map((prev, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{prev}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">Maintain good air circulation and weed control.</p>
            )}
          </div>

        </div>
      </div>

      {/* Routine Crop Care Specs */}
      <div className="p-6 rounded-2xl glass-panel border border-emerald-100 dark:border-emerald-900/60 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
          Cultivation & Environmental Recommendations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
              <Droplets className="w-4 h-4 text-emerald-600" />
              <span>Watering Regimen</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {analysis.watering_guide || "Maintain moderate moisture"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
              <Sun className="w-4 h-4 text-emerald-600" />
              <span>Sunlight Exposure</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {analysis.sunlight_guide || "Appropriate sun exposure"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Soil & Substrate</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {analysis.soil_guide || "Well-draining fertile soil"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Fertilization</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {analysis.fertilizer_guide || "Balanced organic fertilizer"}
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimers & Limitations */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-900/40 text-[11px] text-gray-500 dark:text-gray-400 space-y-1">
        <p className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-emerald-600" />
          <span>Diagnostic Limitations & Notice:</span>
        </p>
        <p>
          These scores and pathogen predictions are indicative AI assessments powered by Google Gemini Vision based on visible photographic patterns. They are not certified phytopathological laboratory tests.
        </p>
      </div>

    </div>
  );
};

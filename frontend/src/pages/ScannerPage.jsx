import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CameraCapture } from '../components/CameraCapture';
import {
  Upload,
  Camera,
  Scan,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sprout,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Image as ImageIcon,
  ArrowRight,
  Zap,
  Check
} from 'lucide-react';

export const ScannerPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fileInputRef = useRef(null);

  // States
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState('');

  // Plant Linking
  const [plants, setPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState(location.state?.plantId || '');

  const progressMessages = [
    "Validating image resolution & leaf contours...",
    "Sending photograph to Google Gemini Multimodal Vision API...",
    "Analyzing leaf patterns, lesions, chlorosis, and pest indicators...",
    "Formulating targeted organic and cultural treatment protocols...",
    "Compiling agronomic diagnostic report..."
  ];

  // Quick Test Samples so the user can test with 1 click!
  const demoSamples = [
    {
      title: "Tomato Early Blight",
      species: "Solanum lycopersicum",
      url: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&auto=format&fit=crop&q=80",
      filename: "sample-tomato-blight.jpg"
    },
    {
      title: "Paddy Rice Leaf",
      species: "Oryza sativa",
      url: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop&q=80",
      filename: "sample-paddy-rice.jpg"
    },
    {
      title: "Fiddle Leaf Fig",
      species: "Ficus lyrata",
      url: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=800&auto=format&fit=crop&q=80",
      filename: "sample-fig-leaf.jpg"
    }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      api.plants.getAll().then(data => {
        if (data) setPlants(data);
      }).catch(err => console.error("Error loading plants:", err));
    }
  }, [isAuthenticated]);

  const handleFileSelect = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image format (JPG, PNG, or WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image file exceeds the 10MB size limit.");
      return;
    }

    setError('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSelectSample = async (sample) => {
    try {
      setError('');
      setLoading(true);
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const file = new File([blob], sample.filename, { type: "image/jpeg" });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError("Failed to load sample image. Please upload a file manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError('');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please choose or capture a plant photograph first.");
      return;
    }

    setLoading(true);
    setError('');
    setProgressStep(0);

    const interval = setInterval(() => {
      setProgressStep(prev => (prev < progressMessages.length - 1 ? prev + 1 : prev));
    }, 1600);

    try {
      const result = await api.analyses.analyze(
        selectedFile,
        selectedPlantId ? parseInt(selectedPlantId) : null
      );
      clearInterval(interval);
      navigate(`/analysis/${result.id}`, { state: { newScan: true } });
    } catch (err) {
      clearInterval(interval);
      console.error("Analysis failed:", err);
      setError(err.message || "Failed to analyze plant photograph. Please try another image or check backend status.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Google Gemini Vision • Multimodal Diagnostics</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
          AI Plant Health <span className="gradient-text-emerald">Scanner</span>
        </h1>

        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
          Capture or upload high-resolution foliage photographs to detect foliar diseases, spot pest damage, identify nutrient starvation, and obtain customized treatment plans.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-3 shadow-xs animate-in shake">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Scanner Notification</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Main Glass Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
        
        {/* Plant Linking Selector */}
        {plants.length > 0 && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
              <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Link scan to registered plant in garden (Optional):</span>
            </div>
            <select
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
            >
              <option value="">-- Standalone Scan (Do not link) --</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Upload Dropzone OR Active Preview */}
        {!previewUrl ? (
          <div className="space-y-6">
            
            {/* High-Tech Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/80 scale-[1.01] shadow-lg shadow-emerald-500/10'
                  : 'border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 hover:bg-emerald-50/40'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              <div className="max-w-md mx-auto space-y-4 pointer-events-none">
                <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
                  <Upload className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Drop your plant photograph here, or browse
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Supports high-resolution JPG, PNG, WEBP files up to 10MB
                  </p>
                </div>

                {/* Badges */}
                <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60">
                    ✓ Clear Focus
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60">
                    ✓ True Color
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60">
                    ✓ Single Leaf or Plant
                  </span>
                </div>
              </div>
            </div>

            {/* Upload or Camera Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Upload Photograph</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider hover:bg-emerald-50 dark:hover:bg-emerald-900/40 shadow-xs transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Open Device Camera</span>
              </button>
            </div>

            {/* Quick Demo Samples (Click to test instantly) */}
            <div className="pt-4 border-t border-gray-100 dark:border-emerald-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Quick Test Samples (Click to load & analyze immediately):</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {demoSamples.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(s)}
                    className="p-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/60 bg-white/60 dark:bg-emerald-950/40 hover:border-emerald-500 hover:shadow-md transition-all text-left flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/5 shrink-0">
                      <img src={s.url} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {s.title}
                      </h4>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 italic truncate">
                        {s.species}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* Preview and Scanning Execution */
          <div className="space-y-6">
            
            {/* Viewfinder Preview with Laser Sweep */}
            <div className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-emerald-500/30 aspect-video max-h-[460px] flex items-center justify-center shadow-inner group">
              <img
                src={previewUrl}
                alt="Plant specimen"
                className="w-full h-full object-contain"
              />

              {/* Glowing Corner Target Reticles */}
              <div className="absolute inset-4 pointer-events-none">
                <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0 rounded-tl-lg shadow-[0_0_8px_#22c55e]" />
                <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0 rounded-tr-lg shadow-[0_0_8px_#22c55e]" />
                <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0 rounded-bl-lg shadow-[0_0_8px_#22c55e]" />
                <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0 rounded-br-lg shadow-[0_0_8px_#22c55e]" />
              </div>

              {/* Animated Laser Sweep during active Gemini analysis */}
              {loading && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#22c55e] animate-laser" />
                  <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[0.5px]" />
                </div>
              )}

              {/* Replace / Cancel button */}
              {!loading && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  title="Remove image and select another"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Change Photo</span>
                </button>
              )}
            </div>

            {/* Analysis Progress UI */}
            {loading ? (
              <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-7 h-7 animate-spin text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                      Gemini Multimodal Neural Diagnostic in Progress
                    </h4>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {progressMessages[progressStep]}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-emerald-200/60 dark:bg-emerald-900 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-700 ease-out shadow-xs"
                    style={{ width: `${((progressStep + 1) / progressMessages.length) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              /* Ready for Analysis CTA */
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Specimen locked. Ready to inspect with Gemini Multimodal Vision.</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl border border-gray-200 dark:border-emerald-800 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors"
                  >
                    Retake
                  </button>

                  <button
                    type="button"
                    onClick={handleAnalyze}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all cursor-pointer transform hover:scale-[1.02]"
                  >
                    <Scan className="w-4 h-4" />
                    <span>Run PlantCare AI Diagnostics</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Photography Guide Card */}
      <div className="p-6 rounded-3xl glass-panel space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>Diagnostic Photography Guidelines</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="p-3 rounded-2xl bg-white/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 space-y-1">
            <span className="font-bold text-gray-900 dark:text-white">1. Focus On Symptomatic Margins</span>
            <p>Ensure the boundary between green leaf tissue and yellowing or brown lesions is in sharp focus.</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 space-y-1">
            <span className="font-bold text-gray-900 dark:text-white">2. Natural Indirect Lighting</span>
            <p>Bright natural light reveals genuine foliar pigmentation without flash glare washing out spots.</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 space-y-1">
            <span className="font-bold text-gray-900 dark:text-white">3. Check Undersides for Pests</span>
            <p>Aphids, whiteflies, and spider mites cluster along leaf veins on the underside.</p>
          </div>
        </div>
      </div>

      {/* Live Camera Modal */}
      {isCameraOpen && (
        <CameraCapture
          onCapture={(file) => {
            handleFileSelect(file);
            setIsCameraOpen(false);
          }}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

    </div>
  );
};

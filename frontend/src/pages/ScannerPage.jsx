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
  ArrowRight
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

  // Optional Plant Linking
  const [plants, setPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState(location.state?.plantId || '');

  const progressMessages = [
    "Validating image resolution and foliage visibility...",
    "Sending photograph to Google Gemini Multimodal Vision API...",
    "Analyzing leaf patterns, lesions, chlorosis, and pest indicators...",
    "Formulating targeted organic and cultural treatment plan...",
    "Finalizing diagnostic report..."
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

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, or WEBP).");
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file exceeds the 10MB size limit.");
      return;
    }

    setError('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
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
      setError("Please select or capture a plant photograph first.");
      return;
    }

    setLoading(true);
    setError('');
    setProgressStep(0);

    // Realistic progress animation
    const interval = setInterval(() => {
      setProgressStep(prev => (prev < progressMessages.length - 1 ? prev + 1 : prev));
    }, 1800);

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
      setError(err.message || "Failed to analyze plant photograph. Please try another image or check connection.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini Multimodal Diagnostics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-white">
          AI Plant Health Scanner
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Upload or capture a clear photo of your plant's leaf, fruit, or stem for instant pathology, pest analysis, and organic treatment plans.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Scan Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Main Upload / Camera Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-emerald-100 dark:border-emerald-900/60 shadow-lg space-y-6">
        
        {/* Optional: Link to Existing Plant in Garden */}
        {plants.length > 0 && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
              <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Link scan to registered plant profile (Optional):</span>
            </div>
            <select
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

        {/* Dropzone or Preview */}
        {!previewUrl ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/80 scale-[1.01]'
                : 'border-emerald-200 dark:border-emerald-900 hover:border-emerald-400 bg-white/40 dark:bg-emerald-950/20'
            }`}
          >
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-xs">
                <Upload className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Drag and drop your plant photograph
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Supported formats: JPG, JPEG, PNG, WEBP (Max 10MB)
                </p>
              </div>

              {/* Upload & Camera Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Choose from Device</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Device Camera</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Image Preview Mode */
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 border border-emerald-100 dark:border-emerald-900/60 aspect-video max-h-96 flex items-center justify-center group">
              <img
                src={previewUrl}
                alt="Plant to analyze"
                className="w-full h-full object-contain"
              />

              {/* Active Scanner Line Animation when loading */}
              {loading && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#22c55e] animate-scan" />
                  <div className="absolute inset-0 bg-emerald-900/10 backdrop-blur-[1px]" />
                </div>
              )}

              {/* Remove / Retake overlay button */}
              {!loading && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-1.5"
                  title="Remove image and choose another"
                >
                  <X className="w-4 h-4" />
                  <span>Change Photo</span>
                </button>
              )}
            </div>

            {/* Analysis Progress Indicator */}
            {loading ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                      Gemini Vision Diagnostic in Progress
                    </h4>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {progressMessages[progressStep]}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-emerald-200/60 dark:bg-emerald-900 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${((progressStep + 1) / progressMessages.length) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              /* Action Button */
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Photograph ready for pathology & nutrient analysis</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex-1 sm:flex-initial px-4 py-3 rounded-xl border border-gray-200 dark:border-emerald-800 text-gray-700 dark:text-gray-300 font-semibold text-xs hover:bg-gray-50 transition-colors"
                  >
                    Retake / Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all cursor-pointer"
                  >
                    <Scan className="w-4 h-4" />
                    <span>Analyze Plant Health</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Photography Tips Card */}
      <div className="p-6 rounded-2xl bg-white/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>Tips for Maximum Diagnostic Accuracy</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="space-y-1">
            <span className="font-bold text-gray-800 dark:text-gray-200">1. Good Natural Lighting:</span>
            <p>Avoid harsh midday glare or dark shadows. Morning indirect sunlight shows true leaf color.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-gray-800 dark:text-gray-200">2. Focus on Affected Area:</span>
            <p>Capture both healthy and symptomatic leaf tissue or lesion boundaries in crisp focus.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-gray-800 dark:text-gray-200">3. Leaf Undersides:</span>
            <p>For pest suspicion (mites, aphids, whiteflies), flip the leaf to inspect the underside.</p>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
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

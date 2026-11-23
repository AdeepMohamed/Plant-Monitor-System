import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CameraCapture } from '../components/CameraCapture';
import {
  Upload,
  Camera,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sprout,
  Sparkles,
  ArrowRight,
  ImageIcon
} from 'lucide-react';

export const ScannerPage = () => {
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

  // Plant linking
  const [plants, setPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState(location.state?.plantId || '');

  const progressSteps = [
    "Uploading and verifying image quality...",
    "Connecting to Google Gemini Vision...",
    "Scanning leaf margins, lesions, and discoloration...",
    "Preparing treatment and prevention recommendations..."
  ];

  const quickSamples = [
    {
      title: "Tomato Early Blight",
      url: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&auto=format&fit=crop&q=80",
      filename: "sample-tomato.jpg"
    },
    {
      title: "Rice Leaf Inspection",
      url: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop&q=80",
      filename: "sample-rice.jpg"
    },
    {
      title: "Healthy Houseplant",
      url: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=800&auto=format&fit=crop&q=80",
      filename: "sample-houseplant.jpg"
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
      setError("Please select a JPG, PNG, or WEBP image.");
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
      setError("Failed to load sample. Please upload an image directly.");
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
      setError("Please select or capture a plant image first.");
      return;
    }

    setLoading(true);
    setError('');
    setProgressStep(0);

    const interval = setInterval(() => {
      setProgressStep(prev => (prev < progressSteps.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const result = await api.analyses.analyze(
        selectedFile,
        selectedPlantId ? parseInt(selectedPlantId) : null
      );
      clearInterval(interval);
      navigate(`/analysis/${result.id}`);
    } catch (err) {
      clearInterval(interval);
      console.error("Diagnosis error:", err);
      setError(err.message || "Failed to analyze plant photograph. Please try another image.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6 animate-in fade-in duration-150">
      
      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          AI Plant Scanner
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
          Upload or capture a photo of a leaf or plant to detect diseases, pest damage, and nutrient deficiencies with Google Gemini.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="clean-card p-6 sm:p-8 space-y-6">
        
        {/* Plant Link (Optional) */}
        {plants.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-gray-100 dark:border-emerald-900/60">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Link to registered plant (optional):</span>
            </label>
            <select
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-800 dark:text-gray-200"
            >
              <option value="">-- Standalone Scan --</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Upload Dropzone or Preview */}
        {!previewUrl ? (
          <div className="space-y-5">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-gray-200 dark:border-emerald-900 hover:border-emerald-500 hover:bg-gray-50/50 dark:hover:bg-emerald-950/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              <div className="max-w-sm mx-auto space-y-3 pointer-events-none">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Click to upload, or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    JPG, PNG, or WEBP (up to 10MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary w-full sm:w-auto px-5 py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Choose Image</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="btn-secondary w-full sm:w-auto px-5 py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Use Camera</span>
              </button>
            </div>

            {/* Quick Samples */}
            <div className="pt-4 border-t border-gray-100 dark:border-emerald-900/60">
              <span className="text-xs font-semibold text-gray-500 block mb-2">
                Or test with a sample photograph:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {quickSamples.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-emerald-900/80 bg-gray-50/50 dark:bg-emerald-950/20 hover:border-emerald-500 transition-colors text-left flex items-center gap-2.5 cursor-pointer"
                  >
                    <img src={sample.url} alt={sample.title} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                      {sample.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div className="space-y-5">
            <div className="relative rounded-xl overflow-hidden bg-black/5 dark:bg-black/30 border border-gray-200 dark:border-emerald-900 aspect-video max-h-80 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Plant specimen"
                className="w-full h-full object-contain"
              />
              {!loading && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs transition-colors flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* Loading Indicator */}
            {loading ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>{progressSteps[progressStep]}</span>
                </div>
                <div className="w-full bg-emerald-200 dark:bg-emerald-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((progressStep + 1) / progressSteps.length) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              /* Action Button */
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Photo ready for diagnosis</span>
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="btn-secondary px-4 py-2 text-xs w-full sm:w-auto"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    className="btn-primary px-6 py-2.5 text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-sm"
                  >
                    <span>Analyze Plant</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Camera Capture Modal */}
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

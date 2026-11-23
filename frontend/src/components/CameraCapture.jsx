import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  Check,
  AlertCircle,
  SwitchCamera,
  Grid,
  Zap,
  Sparkles
} from 'lucide-react';

export const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [showGrid, setShowGrid] = useState(true);
  const [flashTriggered, setFlashTriggered] = useState(false);

  useEffect(() => {
    let activeStream = null;

    const startCamera = async () => {
      try {
        setCameraError(null);
        // Stop any existing stream first
        if (activeStream) {
          activeStream.getTracks().forEach(t => t.stop());
        }

        const constraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // List cameras
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = allDevices.filter(d => d.kind === 'videoinput');
        setDevices(videoDevs);
      } catch (err) {
        console.error("Camera access error:", err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? "Camera permission denied. Please allow camera access in browser settings to capture plant photos."
            : "No active camera found or camera is currently engaged by another program."
        );
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [facingMode]);

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    
    // Trigger visual shutter flash
    setFlashTriggered(true);
    setTimeout(() => setFlashTriggered(false), 250);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    
    // If front camera, mirror image back to natural orientation
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], `plantcare-camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        setCapturedImage({ file, previewUrl });
        stopCameraStream();
      }
    }, 'image/jpeg', 0.95);
  };

  const handleRetake = () => {
    if (capturedImage?.previewUrl) {
      URL.revokeObjectURL(capturedImage.previewUrl);
    }
    setCapturedImage(null);
    setFacingMode(prev => prev); // trigger camera re-init
  };

  const handleConfirm = () => {
    if (capturedImage?.file) {
      onCapture(capturedImage.file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-6 animate-in fade-in duration-200">
      
      {/* Native-style Camera Container */}
      <div className="relative w-full max-w-3xl bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/30 flex flex-col h-[90vh] sm:h-auto sm:aspect-[4/3] max-h-[820px]">
        
        {/* Shutter White Flash Effect */}
        {flashTriggered && (
          <div className="absolute inset-0 bg-white z-40 pointer-events-none animate-shutter" />
        )}

        {/* Top Floating Controls Bar */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 sm:p-5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-md text-white text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Live Lens</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!capturedImage && (
              <>
                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                    showGrid ? 'bg-emerald-600 text-white' : 'bg-black/50 text-white/70 hover:text-white border border-white/10'
                  }`}
                  title="Toggle Framing Grid"
                >
                  <Grid className="w-4 h-4" />
                </button>

                {devices.length > 1 && (
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-2.5 rounded-full bg-black/50 border border-white/10 text-white/80 hover:text-white backdrop-blur-md transition-all"
                    title="Switch Front/Rear Camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => {
                stopCameraStream();
                onClose();
              }}
              className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white backdrop-blur-md transition-all ml-1"
              title="Close Camera"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Viewfinder / Canvas Area */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
          
          {cameraError ? (
            <div className="p-8 text-center max-w-md space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-white text-base font-bold">Camera Unavailable</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">{cameraError}</p>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  onClose();
                }}
                className="mt-2 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                Upload from Files Instead
              </button>
            </div>
          ) : capturedImage ? (
            /* Review Captured Snapshot */
            <div className="w-full h-full relative flex items-center justify-center bg-zinc-950">
              <img
                src={capturedImage.previewUrl}
                alt="Captured Snapshot"
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6">
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-black/60 border border-emerald-400/30 text-emerald-300 backdrop-blur-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>High-Resolution Foliage Frame Locked</span>
                </span>
              </div>
            </div>
          ) : (
            /* Active Live Video Stream */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* 3x3 Rule of Thirds Grid */}
              {showGrid && (
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div />
                </div>
              )}

              {/* High-Tech Holographic Target Reticle */}
              <div className="absolute inset-8 sm:inset-16 pointer-events-none flex items-center justify-center">
                {/* Outer Reticle Frame */}
                <div className="relative w-full h-full border border-dashed border-emerald-400/40 rounded-3xl flex items-center justify-center">
                  {/* Glowing Corner Accents */}
                  <div className="w-7 h-7 border-t-3 border-l-3 border-emerald-400 absolute -top-1 -left-1 rounded-tl-xl shadow-[0_0_10px_#22c55e]" />
                  <div className="w-7 h-7 border-t-3 border-r-3 border-emerald-400 absolute -top-1 -right-1 rounded-tr-xl shadow-[0_0_10px_#22c55e]" />
                  <div className="w-7 h-7 border-b-3 border-l-3 border-emerald-400 absolute -bottom-1 -left-1 rounded-bl-xl shadow-[0_0_10px_#22c55e]" />
                  <div className="w-7 h-7 border-b-3 border-r-3 border-emerald-400 absolute -bottom-1 -right-1 rounded-br-xl shadow-[0_0_10px_#22c55e]" />

                  {/* Pulsing Central Target */}
                  <div className="w-14 h-14 rounded-full border-2 border-emerald-400/60 animate-reticle flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e]" />
                  </div>
                </div>
              </div>

              {/* Guidance Prompt */}
              <div className="absolute bottom-24 inset-x-0 flex justify-center pointer-events-none px-4">
                <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-black/60 text-white/90 border border-white/10 backdrop-blur-md shadow-md text-center">
                  Align leaf blade or affected lesion within frame
                </span>
              </div>
            </>
          )}

        </div>

        {/* Bottom Shutter & Controls Dock */}
        <div className="p-5 sm:p-6 bg-black/90 border-t border-white/10 flex items-center justify-between gap-4">
          
          {capturedImage ? (
            /* Post-Capture Review Actions */
            <div className="w-full flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake Photo</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition-all cursor-pointer transform hover:scale-[1.02]"
              >
                <Check className="w-4 h-4" />
                <span>Use This Photograph</span>
              </button>
            </div>
          ) : (
            /* Live Capture Shutter Button */
            <div className="w-full flex items-center justify-center relative">
              
              {/* Secondary Camera Toggle on Mobile */}
              {devices.length > 1 && (
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
                  title="Switch Camera"
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>
              )}

              {/* Shutter Button Ring */}
              <button
                type="button"
                onClick={handleCapture}
                disabled={!!cameraError}
                className="group relative w-18 h-18 rounded-full border-4 border-white/90 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] disabled:opacity-40 transition-all active:scale-90 cursor-pointer"
                title="Capture Plant Photo"
              >
                <div className="w-full h-full rounded-full bg-emerald-500 group-hover:bg-emerald-400 transition-colors shadow-inner flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

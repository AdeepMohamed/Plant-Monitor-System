import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, FlipHorizontal } from 'lucide-react';

export const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [devicesCount, setDevicesCount] = useState(1);

  useEffect(() => {
    let currentStream = null;

    const initCamera = async () => {
      try {
        setError(null);
        if (currentStream) {
          currentStream.getTracks().forEach(t => t.stop());
        }

        const constraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setDevicesCount(videoInputs.length);
      } catch (err) {
        console.error("Camera access error:", err);
        setError(
          err.name === 'NotAllowedError'
            ? "Camera permission was denied. Please allow camera access in your browser to take a photo."
            : "No camera detected or camera is in use by another application."
        );
      }
    };

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [facingMode]);

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        setCapturedPreview(previewUrl);
        setCapturedFile(file);
        stopStream();
      }
    }, 'image/jpeg', 0.92);
  };

  const handleRetake = () => {
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
    }
    setCapturedPreview(null);
    setCapturedFile(null);
    setFacingMode((prev) => (prev === 'environment' ? 'environment' : 'user'));
  };

  const handleConfirm = () => {
    if (capturedFile) {
      onCapture(capturedFile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-emerald-900 overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-emerald-900">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {capturedPreview ? "Review Photograph" : "Capture Plant Photo"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Image Preview */}
        <div className="relative aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center max-w-sm space-y-2">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-xs text-white font-medium">{error}</p>
              <button
                type="button"
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                className="mt-3 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                Upload from Computer Instead
              </button>
            </div>
          ) : capturedPreview ? (
            <img
              src={capturedPreview}
              alt="Captured plant preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Simple subtle alignment frame */}
              <div className="absolute inset-8 border border-white/40 rounded-xl pointer-events-none flex items-end justify-center pb-3">
                <span className="text-[11px] font-medium bg-black/60 text-white px-3 py-1 rounded-full backdrop-blur-xs">
                  Center leaf or plant in frame
                </span>
              </div>
            </>
          )}
        </div>

        {/* Modal Controls */}
        <div className="p-4 bg-gray-50 dark:bg-emerald-950/80 border-t border-gray-100 dark:border-emerald-900 flex items-center justify-between gap-3">
          {capturedPreview ? (
            <div className="w-full flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-emerald-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-white dark:hover:bg-emerald-900 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Use This Photo</span>
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              {devicesCount > 1 ? (
                <button
                  type="button"
                  onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-emerald-800 text-xs text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-emerald-900 flex items-center gap-1.5"
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span>Switch Camera</span>
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={handleTakePhoto}
                disabled={!!error}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Photo</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

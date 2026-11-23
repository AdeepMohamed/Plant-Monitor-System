import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';

export const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  useEffect(() => {
    let activeStream = null;

    const startCamera = async () => {
      try {
        setCameraError(null);
        const constraints = {
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Enumerate video devices
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = allDevices.filter(d => d.kind === 'videoinput');
        setDevices(videoDevs);
      } catch (err) {
        console.error("Camera access failed:", err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? "Camera permission denied. Please allow camera access in your browser settings."
            : "No usable camera detected or camera is currently in use by another application."
        );
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDeviceId]);

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], `camera-scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        setCapturedImage({ file, previewUrl });
        stopCameraStream();
      }
    }, 'image/jpeg', 0.95);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    // Restart camera
    setSelectedDeviceId(prev => prev);
  };

  const handleConfirm = () => {
    if (capturedImage?.file) {
      onCapture(capturedImage.file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl overflow-hidden border border-emerald-500/20">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-emerald-900 bg-gray-50/50 dark:bg-emerald-900/40">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
            <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Plant Snapshot Camera</span>
          </div>
          <button
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <p className="text-white font-medium mb-2">{cameraError}</p>
              <p className="text-xs text-gray-400">You can also upload plant photographs directly from your computer or phone library.</p>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage.previewUrl}
              alt="Plant Snapshot"
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
              {/* Target Focus Overlay */}
              <div className="absolute inset-8 border-2 border-dashed border-emerald-400/60 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0" />
                <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0" />
                <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0" />
                <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0" />
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/50 text-white/90 backdrop-blur-xs">
                  Center plant leaf or lesion in frame
                </span>
              </div>
            </>
          )}
        </div>

        {/* Camera Selector & Controls */}
        <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-emerald-950">
          {!capturedImage && devices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={e => setSelectedDeviceId(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-emerald-800 bg-gray-50 dark:bg-emerald-900 text-gray-700 dark:text-gray-200"
            >
              {devices.map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {capturedImage ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-emerald-900 text-sm transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retake Photo
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Use This Photograph
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleCapture}
                disabled={!!cameraError}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md transition-colors"
              >
                <Camera className="w-4 h-4" />
                Capture Snapshot
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

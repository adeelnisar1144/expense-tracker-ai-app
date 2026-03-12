
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../api';
import { Expense } from '../types';
import { Camera, X, Loader2, AlertTriangle, ScanLine, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface ReceiptScannerProps {
  onClose: () => void;
  onScanSuccess: (data: Omit<Expense, 'id'>) => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onClose, onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const isOnline = useNetworkStatus();

  const cleanupCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (!isOnline) return;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera not supported on this device.");
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (err) {
        console.error("Camera access error:", err);
        setError("Could not access camera. Please check permissions.");
      }
    };
    startCamera();

    // Cleanup on component unmount
    return () => {
      cleanupCamera();
    };
  }, [cleanupCamera, isOnline]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context) {
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = video.videoWidth;
        let height = video.videoHeight;

        if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
        } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
        }
        canvas.width = width;
        canvas.height = height;

        context.drawImage(video, 0, 0, width, height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const base64Image = imageDataUrl.split(',')[1];
        
        try {
            const scannedData = await api.scanReceipt(base64Image);
            onScanSuccess(scannedData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsProcessing(false);
        }
    } else {
        setError("Could not process image.");
        setIsProcessing(false);
    }
  };
  
  const handleClose = () => {
    cleanupCamera();
    onClose();
  };

  if (!isOnline) {
      return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6">
            <div className="bg-gray-800 p-6 rounded-xl flex flex-col items-center max-w-sm w-full text-center">
                <WifiOff size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Offline</h3>
                <p className="text-gray-300 mb-6">Receipt scanning requires an internet connection to process the image.</p>
                <button onClick={onClose} className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    Close
                </button>
            </div>
        </div>
      )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay UI */}
      <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-between p-6">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
            <h2 className="text-white text-lg font-bold">Scan Receipt</h2>
            <button onClick={handleClose} className="text-white bg-black bg-opacity-50 rounded-full p-2">
                <X size={24} />
            </button>
        </div>

        {/* Viewfinder and messages */}
        <div className="flex-grow flex items-center justify-center">
            <div className="w-full max-w-lg aspect-[3/4] border-4 border-dashed border-white/50 rounded-2xl relative overflow-hidden">
                <ScanLine className="absolute w-full h-1 bg-cyan-300 animate-[scan_3s_ease-in-out_infinite]" style={{'--scan-y-start': '-10%', '--scan-y-end': '110%'} as React.CSSProperties} />
                <style>{`
                  @keyframes scan {
                    0% { transform: translateY(var(--scan-y-start)); }
                    100% { transform: translateY(var(--scan-y-end)); }
                  }
                `}</style>
            </div>
        </div>

        {/* Footer */}
        <div className="w-full flex flex-col items-center">
            {error && (
                <div className="bg-red-500 text-white p-3 rounded-lg mb-4 flex items-center gap-2 max-w-md w-full">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}
            <p className="text-white text-center text-sm mb-4">Position receipt within the frame and capture.</p>
             <button
                onClick={handleCapture}
                disabled={isProcessing}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center ring-4 ring-white/30 transition hover:bg-gray-200 disabled:opacity-50"
                aria-label="Capture receipt"
            >
                {isProcessing ? <Loader2 className="animate-spin text-gray-700" size={32} /> : <Camera size={32} className="text-gray-700" />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptScanner;

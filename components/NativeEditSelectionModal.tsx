import React, { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ImageUploader from './ImageUploader';

interface NativeEditSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageConfirmed: (file: File) => void;
  isDarkMode: boolean;
}

const NativeEditSelectionModal: React.FC<NativeEditSelectionModalProps> = ({
  isOpen,
  onClose,
  onImageConfirmed,
  isDarkMode,
}) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [view, setView] = useState<'selection' | 'camera' | 'preview'>('selection');
  const [selectedImage, setSelectedImage] = useState<{ file: File, src: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopCameraStream = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  const resetState = useCallback(() => {
    stopCameraStream();
    setView('selection');
    setSelectedImage(null);
    setCapturedImage(null);
    setCameraError(null);
    setIsLoading(false);
  }, [stopCameraStream]);

  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
      resetState();
    }, 300);
  }, [onClose, resetState]);

  const handleImageSelected = useCallback((file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage({ file, src: reader.result as string });
      setView('preview');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const startCamera = useCallback(async () => {
    stopCameraStream();
    setCameraError(null);
    setCapturedImage(null);
    setView('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      let message = "Não foi possível acessar a câmera. ";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          message += "Por favor, conceda permissão à câmera no seu navegador.";
        } else {
          message += `Erro: ${err.message}`;
        }
      }
      setCameraError(message);
      setView('selection');
    }
  }, [stopCameraStream]);

  useEffect(() => {
    if (view === 'camera' && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(e => console.error("Video play failed:", e));
    }
  }, [view, cameraStream]);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      stopCameraStream();
      setView('preview');
    }
  }, [stopCameraStream]);

  useEffect(() => {
    if (view === 'preview' && capturedImage && !selectedImage) {
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          if (blob) {
            const file = new File([blob], `capture-${uuidv4()}.jpg`, { type: 'image/jpeg' });
            setSelectedImage({ file, src: capturedImage });
          }
        });
    }
  }, [view, capturedImage, selectedImage]);
  
  const handleConfirm = useCallback(() => {
    if (selectedImage) {
      onImageConfirmed(selectedImage.file);
    }
  }, [selectedImage, onImageConfirmed]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (view) {
      case 'camera':
        return (
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
            <video ref={videoRef} playsInline className="w-full h-full object-cover"></video>
            <button onClick={() => { stopCameraStream(); setView('selection'); }} className="absolute top-4 right-4 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition z-10" aria-label="Voltar">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="absolute bottom-6 flex justify-center w-full z-10">
              <button onClick={handleCapture} className="w-16 h-16 bg-accentBlue rounded-full border-4 border-white" aria-label="Tirar Foto"></button>
            </div>
          </div>
        );
      case 'preview':
        return (
          <div className="p-6 flex flex-col items-center justify-center gap-4 h-full">
            <p className="text-secondaryText text-center">Pré-visualização da imagem. Clique em 'Confirmar' para começar a editar.</p>
            <img src={selectedImage?.src} alt="Pré-visualização" className="max-w-full max-h-[60vh] object-contain rounded-lg border border-borderColor" />
          </div>
        );
      case 'selection':
      default:
        return (
          <div className="p-6">
            {cameraError && <p className="text-red-400 text-center text-sm mb-4">{cameraError}</p>}
            <ImageUploader onImageSelected={handleImageSelected} onCameraSelect={startCamera} isLoading={isLoading} isDarkMode={isDarkMode} />
          </div>
        );
    }
  };

  const getTitle = () => {
    switch(view) {
      case 'camera': return 'Câmera';
      case 'preview': return 'Pré-visualização';
      default: return 'Editar Foto Local';
    }
  };
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 modal-backdrop ${isAnimatingOut ? 'animate-out' : ''}`} onClick={handleClose}>
      <div className={`relative bg-appBg rounded-lg shadow-2xl border border-borderColor w-full md:w-4/5 md:max-w-xl max-h-[95vh] flex flex-col modal-content ${isAnimatingOut ? 'animate-out' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-borderColor bg-appHeaderBg rounded-t-lg">
          <h2 className="text-xl font-title text-primaryAccent">{getTitle()}</h2>
          <button onClick={handleClose} className="p-2 rounded-full text-primaryText hover:bg-gray-700 transition" aria-label="Fechar">
            <svg className="w-6 h-6 icon-effect" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className={`flex-1 overflow-y-auto custom-scrollbar ${view === 'camera' ? 'p-0' : ''}`}>
            {renderContent()}
        </div>
        {(view === 'preview' || (view === 'selection' && selectedImage)) && (
            <div className="flex justify-end items-center p-4 border-t border-borderColor">
                <button onClick={() => { setCapturedImage(null); setSelectedImage(null); setView('selection'); }} className="px-6 py-2 bg-inactiveButtonBg text-primaryText rounded-full font-title text-base hover:bg-gray-600 transition mr-4">
                    Voltar
                </button>
                <button onClick={handleConfirm} disabled={!selectedImage} className="px-6 py-2 bg-primaryAccent text-white rounded-full font-title text-base hover:bg-primaryAccentDark transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Confirmar
                </button>
            </div>
        )}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
};

export default NativeEditSelectionModal;

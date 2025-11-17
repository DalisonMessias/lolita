import React, { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ImageUploader from './ImageUploader';

interface MagicEraserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPerformRemoval: (imageFile: File, maskBase64: string) => void;
  isDarkMode: boolean;
}

const MagicEraserModal: React.FC<MagicEraserModalProps> = ({ isOpen, onClose, onPerformRemoval, isDarkMode }) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [view, setView] = useState<'selection' | 'camera' | 'preview' | 'editor'>('selection');
  const [image, setImage] = useState<{ file: File, src: string } | null>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef<{ x: number, y: number } | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const stopCameraStream = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  const resetState = useCallback(() => {
    stopCameraStream();
    setImage(null);
    setHistory([]);
    setView('selection');
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

  const handleImageReadyForEditing = useCallback((file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage({ file, src: reader.result as string });
      setView('editor');
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
      console.error("Camera access error:", err);
      setCameraError("Não foi possível acessar a câmera. Verifique as permissões.");
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
    if (videoRef.current && captureCanvasRef.current) {
      const video = videoRef.current;
      const canvas = captureCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      stopCameraStream();
      setView('preview');
    }
  }, [stopCameraStream]);

  const handleUsePhoto = useCallback(() => {
    if (capturedImage) {
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          if (blob) {
            const file = new File([blob], `capture-${uuidv4()}.jpg`, { type: 'image/jpeg' });
            handleImageReadyForEditing(file);
          }
        });
    }
  }, [capturedImage, handleImageReadyForEditing]);

  const clearMask = useCallback(() => { /* ... ( unchanged ) ... */ }, []);
  const undoLast = () => { /* ... ( unchanged ) ... */ };
  
  useEffect(() => {
    if (view === 'editor' && image && imageCanvasRef.current && drawingCanvasRef.current && canvasContainerRef.current) {
        // ... (existing canvas setup logic)
        const img = new Image();
        img.src = image.src;
        img.onload = () => {
            const container = canvasContainerRef.current!;
            const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
            const imgAspectRatio = img.naturalWidth / img.naturalHeight;
            const containerAspectRatio = containerWidth / containerHeight;

            let canvasWidth, canvasHeight;
            if (imgAspectRatio > containerAspectRatio) {
                canvasWidth = containerWidth;
                canvasHeight = containerWidth / imgAspectRatio;
            } else {
                canvasHeight = containerHeight;
                canvasWidth = containerHeight * imgAspectRatio;
            }

            const canvases = [imageCanvasRef.current!, drawingCanvasRef.current!];
            canvases.forEach(canvas => {
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
            });

            imageCanvasRef.current!.getContext('2d')!.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            clearMask();
        };
    }
  }, [view, image, clearMask]);
  
  const getCoords = (e: React.MouseEvent | React.TouchEvent) => { /* ... ( unchanged ) ... */ return {x:0,y:0}; };
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => { /* ... ( unchanged ) ... */ };
  const draw = (e: React.MouseEvent | React.TouchEvent) => { /* ... ( unchanged ) ... */ };
  const stopDrawing = () => setIsDrawing(false);

  const handleConfirm = useCallback(() => { /* ... ( unchanged ) ... */ }, [image, onPerformRemoval]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch(view) {
      case 'camera':
        return (
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
            <video ref={videoRef} playsInline className="w-full h-full object-cover"></video>
            <button onClick={() => { stopCameraStream(); setView('selection'); }} className="absolute top-4 right-4 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition z-10" aria-label="Voltar"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            <div className="absolute bottom-6 flex justify-center w-full z-10"><button onClick={handleCapture} className="w-16 h-16 bg-accentBlue rounded-full border-4 border-white" aria-label="Tirar Foto"></button></div>
          </div>
        );
      case 'preview':
        return (
          <div className="p-6 flex flex-col items-center justify-center gap-4 h-full">
            <img src={capturedImage} alt="Pré-visualização" className="max-w-full max-h-[60vh] object-contain rounded-lg border border-borderColor" />
            <div className="flex gap-4">
              <button onClick={startCamera} className="px-6 py-2 bg-inactiveButtonBg text-primaryText rounded-full font-title text-base hover:bg-gray-600 transition">Tirar Novamente</button>
              <button onClick={handleUsePhoto} className="px-6 py-2 bg-primaryAccent text-white rounded-full font-title text-base hover:bg-primaryAccentDark transition">Usar Foto</button>
            </div>
          </div>
        );
      case 'editor':
        return (
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-6">
            <div className="flex-grow flex flex-col items-center justify-center min-h-[300px] md:min-h-0" ref={canvasContainerRef}>
              <div className="relative cursor-crosshair">
                <canvas ref={imageCanvasRef} className="rounded-lg" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
                <canvas ref={drawingCanvasRef} className="absolute top-0 left-0" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
              </div>
            </div>
            <div className="w-full md:w-64 flex-shrink-0 space-y-4">
              <h3 className="text-lg font-title text-primaryText">Controles</h3>
              <div>
                <label htmlFor="brush-size" className="block text-secondaryText text-sm mb-1">Tamanho do Pincel: {brushSize}</label>
                <input id="brush-size" type="range" min="5" max="100" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full h-2 bg-borderColor rounded-lg appearance-none cursor-pointer accent-primaryAccent" />
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={undoLast} disabled={history.length === 0} className="w-full px-4 py-2 bg-inactiveButtonBg text-primaryText rounded-full font-title text-sm hover:bg-gray-600 transition disabled:opacity-50">Desfazer</button>
                <button onClick={clearMask} className="w-full px-4 py-2 bg-inactiveButtonBg text-primaryText rounded-full font-title text-sm hover:bg-gray-600 transition disabled:opacity-50">Limpar Máscara</button>
              </div>
            </div>
          </div>
        );
      case 'selection':
      default:
        return (
          <div className="p-6">
            {cameraError && <p className="text-red-400 text-center text-sm mb-4">{cameraError}</p>}
            <ImageUploader onImageSelected={handleImageReadyForEditing} onCameraSelect={startCamera} isLoading={isLoading} isDarkMode={isDarkMode} />
          </div>
        );
    }
  };
  
  const getTitle = () => {
     switch(view) {
      case 'camera': return 'Câmera';
      case 'preview': return 'Pré-visualização';
      default: return 'Remoção Mágica de Objetos';
    }
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 modal-backdrop ${isAnimatingOut ? 'animate-out' : ''}`} onClick={handleClose}>
      <div className={`relative bg-appBg rounded-lg shadow-2xl border border-borderColor w-full md:w-4/5 md:max-w-6xl max-h-[95vh] flex flex-col modal-content ${isAnimatingOut ? 'animate-out' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-borderColor bg-appHeaderBg rounded-t-lg">
          <h2 className="text-xl font-title text-primaryAccent">{getTitle()}</h2>
          <button onClick={handleClose} className="p-2 rounded-full text-primaryText hover:bg-gray-700 transition" aria-label="Fechar"><svg className="w-6 h-6 icon-effect" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        {renderContent()}
        {view === 'editor' && (
          <div className="flex justify-end items-center p-4 border-t border-borderColor">
            <button onClick={handleConfirm} disabled={!image || history.length === 0} className="px-6 py-2 bg-primaryAccent text-white rounded-full font-title text-base hover:bg-primaryAccentDark transition disabled:opacity-50">
              Remover Objeto
            </button>
          </div>
        )}
        <canvas ref={captureCanvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
};

export default MagicEraserModal;

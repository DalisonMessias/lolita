import React, { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ImageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (file: File, prompt: string) => void;
  isDarkMode: boolean;
}

type CropRect = { x: number; y: number; width: number; height: number };
type DragInfo = { 
  type: string; 
  startX: number; 
  startY: number; 
  startRect: CropRect; 
};

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSend, 
  isDarkMode, 
}) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [view, setView] = useState<'selection' | 'camera' | 'preview' | 'cropping' | 'prompt'>('selection');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [croppingImage, setCroppingImage] = useState<{ file: File; src: string } | null>(null);
  const [finalImage, setFinalImage] = useState<{ file: File; src: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [cropRect, setCropRect] = useState<CropRect>({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);

  const stopCameraStream = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  const resetAllState = useCallback(() => {
    stopCameraStream();
    setView('selection');
    setCapturedImage(null);
    setCroppingImage(null);
    setFinalImage(null);
    setPrompt('');
    setCameraError(null);
    setCropRect({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
    setDragInfo(null);
  }, [stopCameraStream]);

  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      resetAllState();
      onClose();
      setIsAnimatingOut(false);
    }, 300);
  }, [onClose, resetAllState]);

  useEffect(() => {
    return () => {
      if (finalImage && finalImage.src.startsWith('blob:')) {
        URL.revokeObjectURL(finalImage.src);
      }
    };
  }, [finalImage]);

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
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          message += "Nenhum dispositivo de câmera foi encontrado.";
        } else {
          message += `Erro: ${err.message}`;
        }
      }
      setCameraError(message);
      setView('selection'); 
    }
  }, [stopCameraStream]);
  
  useEffect(() => {
    if (cameraStream && videoRef.current) {
        videoRef.current.srcObject = cameraStream;
        videoRef.current.play().catch(e => console.error("Video play failed:", e));
    }
  }, [cameraStream]);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCameraStream();
        setView('preview');
      }
    }
  }, [stopCameraStream]);
  
  const handleUsePhoto = useCallback(() => {
    if (capturedImage) {
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
           if (blob) {
             const file = new File([blob], `capture-${uuidv4()}.jpg`, { type: 'image/jpeg' });
             setCroppingImage({ file, src: capturedImage });
             setView('cropping');
           }
        });
    }
  }, [capturedImage]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCroppingImage({ file, src: reader.result as string });
        setView('cropping');
      };
      reader.readAsDataURL(file);
      event.target.value = ''; // Allow selecting the same file again
    }
  }, []);
  
  const handleUseFullImage = useCallback(() => {
    if (croppingImage) {
      setFinalImage(croppingImage);
      setView('prompt');
    }
  }, [croppingImage]);

  const handleConfirmCrop = useCallback(() => {
    if (!croppingImage || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = croppingImage.src;
    img.onload = () => {
        const sx = img.naturalWidth * cropRect.x;
        const sy = img.naturalHeight * cropRect.y;
        const sWidth = img.naturalWidth * cropRect.width;
        const sHeight = img.naturalHeight * cropRect.height;
        
        canvas.width = sWidth;
        canvas.height = sHeight;
        
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `cropped-${uuidv4()}.png`, { type: 'image/png' });
            const src = URL.createObjectURL(blob);
            setFinalImage({ file, src });
            setView('prompt');
          }
        }, 'image/png', 0.95);
    };
    img.onerror = () => {
        console.error("A imagem não pôde ser carregada para o recorte.");
    };
  }, [croppingImage, cropRect]);

  const handleSendWithPrompt = useCallback(() => {
    if (finalImage) {
      onSend(finalImage.file, prompt);
      handleClose();
    }
  }, [finalImage, prompt, onSend, handleClose]);

  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragInfo({ type, startX: e.clientX, startY: e.clientY, startRect: cropRect });
  };

  const handleCropMouseMove = useCallback((e: MouseEvent) => {
    if (!dragInfo || !cropImageRef.current) return;
    const { type, startX, startY, startRect } = dragInfo;
    const { width: containerWidth, height: containerHeight } = cropImageRef.current.getBoundingClientRect();
    let dx = (e.clientX - startX) / containerWidth;
    let dy = (e.clientY - startY) / containerHeight;
    let newRect = { ...startRect };

    if (type === 'move') {
      newRect.x = startRect.x + dx;
      newRect.y = startRect.y + dy;
    } else {
      if (type.includes('e')) newRect.width = startRect.width + dx;
      if (type.includes('w')) { newRect.width = startRect.width - dx; newRect.x = startRect.x + dx; }
      if (type.includes('s')) newRect.height = startRect.height + dy;
      if (type.includes('n')) { newRect.height = startRect.height - dy; newRect.y = startRect.y + dy; }
    }
    
    newRect.width = Math.max(0.05, Math.min(newRect.width, 1));
    newRect.height = Math.max(0.05, Math.min(newRect.height, 1));
    if (newRect.x + newRect.width > 1) newRect.x = 1 - newRect.width;
    if (newRect.y + newRect.height > 1) newRect.y = 1 - newRect.height;
    if (newRect.x < 0) newRect.x = 0;
    if (newRect.y < 0) newRect.y = 0;

    setCropRect(newRect);
  }, [dragInfo]);

  const handleCropMouseUp = useCallback(() => setDragInfo(null), []);

  useEffect(() => {
    if (dragInfo) {
      window.addEventListener('mousemove', handleCropMouseMove);
      window.addEventListener('mouseup', handleCropMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleCropMouseMove);
        window.removeEventListener('mouseup', handleCropMouseUp);
      };
    }
  }, [dragInfo, handleCropMouseMove, handleCropMouseUp]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const modalContentClasses = `relative bg-inputBg rounded-lg shadow-2xl border border-borderColor w-full md:w-4/5 md:max-w-6xl max-h-[90vh] flex flex-col modal-content ${isAnimatingOut ? 'animate-out' : ''}`;
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 modal-backdrop ${isAnimatingOut ? 'animate-out' : ''}`} onClick={handleClose}>
      <div className={modalContentClasses} onClick={e => e.stopPropagation()}>
        {view !== 'camera' && view !== 'cropping' && view !== 'prompt' && (
          <div className="flex justify-between items-center p-4 border-b border-borderColor flex-shrink-0">
            <h2 className="text-xl font-title text-primaryText">
                {view === 'selection' ? 'Adicionar uma imagem' : 'Pré-visualização'}
            </h2>
            <button onClick={handleClose} className="p-2 rounded-full text-secondaryText hover:bg-gray-700 transition" aria-label="Fechar modal">
              <svg className="w-6 h-6 icon-effect" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        )}

        <div className={`flex-1 overflow-auto custom-scrollbar ${view === 'camera' || view === 'cropping' || view === 'prompt' ? 'p-0' : 'p-6'}`}>
          {view === 'selection' && (
            <div className="space-y-4">
              {cameraError && <p className="text-red-400 text-center text-sm">{cameraError}</p>}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className={`w-full flex items-center justify-center gap-4 p-6 bg-aiBubble rounded-lg transition-colors duration-200 hover:bg-gray-700`}>
                <svg className="w-8 h-8 text-primaryAccent icon-effect" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/></svg>
                <span className="text-lg font-title text-primaryText">Galeria de Fotos</span>
              </button>
              <button onClick={startCamera} className={`w-full flex items-center justify-center gap-4 p-6 bg-aiBubble rounded-lg transition-colors duration-200 hover:bg-gray-700`}>
                <svg className="w-8 h-8 text-accentBlue icon-effect" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
                <span className="text-lg font-title text-primaryText">Câmera</span>
              </button>
            </div>
          )}

          {view === 'camera' && (
            <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <video ref={videoRef} playsInline className="w-full h-full object-cover"></video>
              <button onClick={() => { stopCameraStream(); setView('selection'); }} className="absolute top-4 right-4 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-transform duration-200 ease-in-out hover:scale-110 z-10" aria-label="Voltar">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <div className="absolute bottom-6 flex justify-center w-full z-10">
                <button onClick={handleCapture} className="w-16 h-16 bg-accentBlue rounded-full border-4 border-white flex items-center justify-center text-white hover:bg-blue-700 transition-transform duration-200 ease-in-out hover:scale-110" aria-label="Tirar Foto">
                   <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
                </button>
              </div>
            </div>
          )}

          {view === 'preview' && capturedImage && (
            <div className="flex flex-col items-center justify-center gap-4 h-full">
              <img src={capturedImage} alt="Pré-visualização da captura" className="max-w-full max-h-[60vh] object-contain rounded-lg border border-borderColor" />
              <div className="flex gap-4">
                <button onClick={() => startCamera()} className="px-6 py-2 bg-inactiveButtonBg text-primaryText rounded-full font-title text-base hover:bg-gray-600 transition">Tirar Novamente</button>
                <button onClick={handleUsePhoto} className="px-6 py-2 bg-primaryAccent text-white rounded-full font-title text-base hover:bg-primaryAccentDark transition">Usar Foto</button>
              </div>
            </div>
          )}

          {view === 'cropping' && croppingImage && (
             <div className="w-full h-full flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-borderColor flex-shrink-0">
                    <h2 className="text-xl font-title text-primaryText">Recortar Imagem</h2>
                    <button onClick={() => setView('selection')} className="p-2 rounded-full text-secondaryText hover:bg-gray-700 transition" aria-label="Cancelar Recorte">
                        <svg className="w-6 h-6 icon-effect" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                 <div className="flex-1 p-6 overflow-hidden relative flex items-center justify-center">
                    <div className="relative inline-block" style={{ userSelect: 'none' }}>
                        <img ref={cropImageRef} src={croppingImage.src} alt="Recortar" className="max-w-full max-h-[60vh] object-contain" />
                        <div className="absolute top-0 left-0 w-full h-full" onMouseDown={(e) => handleCropMouseDown(e, 'move')} style={{ cursor: 'move' }}>
                            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-60" style={{ clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${cropRect.x * 100}% ${cropRect.y * 100}%, ${cropRect.x * 100}% ${(cropRect.y + cropRect.height) * 100}%, ${(cropRect.x + cropRect.width) * 100}% ${(cropRect.y + cropRect.height) * 100}%, ${(cropRect.x + cropRect.width) * 100}% ${cropRect.y * 100}%, ${cropRect.x * 100}% ${cropRect.y * 100}%)` }}></div>
                            <div className="absolute border-2 border-white pointer-events-none" style={{ left: `${cropRect.x * 100}%`, top: `${cropRect.y * 100}%`, width: `${cropRect.width * 100}%`, height: `${cropRect.height * 100}%` }}>
                                <div onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'nw'); }} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-full cursor-nwse-resize pointer-events-auto"></div>
                                <div onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'ne'); }} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full cursor-nesw-resize pointer-events-auto"></div>
                                <div onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'sw'); }} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white rounded-full cursor-nesw-resize pointer-events-auto"></div>
                                <div onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'se'); }} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full cursor-nwse-resize pointer-events-auto"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 w-full flex flex-col sm:flex-row justify-center items-center p-4 border-t border-borderColor gap-4">
                    <button onClick={() => setView('selection')} className="w-full sm:w-auto px-5 py-2.5 bg-inactiveButtonBg text-primaryText rounded-full font-title text-base hover:bg-gray-600 transition">Cancelar</button>
                    <button onClick={handleUseFullImage} className="w-full sm:w-auto px-5 py-2.5 bg-accentBlue text-white rounded-full font-title text-base hover:bg-blue-700 transition">Usar Imagem Inteira</button>
                    <button onClick={handleConfirmCrop} className="w-full sm:w-auto px-5 py-2.5 bg-primaryAccent text-white rounded-full font-title text-base hover:bg-primaryAccentDark transition">Confirmar Recorte</button>
                </div>
            </div>
          )}

          {view === 'prompt' && finalImage && (
            <div className="w-full h-full flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-borderColor flex-shrink-0">
                  <h2 className="text-xl font-title text-primaryText">Enviar Imagem</h2>
                  <button onClick={() => setView('cropping')} className="p-2 rounded-full text-secondaryText hover:bg-gray-700 transition" aria-label="Voltar ao Recorte">
                      <svg className="w-6 h-6 icon-effect" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-shrink-0">
                      <img src={finalImage.src} alt="Pré-visualização final" className="w-48 h-48 object-cover rounded-lg border border-borderColor" />
                  </div>
                  <div className="flex-1 w-full">
                      <label htmlFor="image-prompt" className="block text-primaryText text-sm font-medium mb-2">Adicionar um prompt (Opcional)</label>
                      <textarea
                          id="image-prompt"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Ex: Aprimorar as cores e a nitidez"
                          className="w-full p-3 h-28 rounded-lg bg-appBg text-primaryText border border-borderColor focus:outline-none focus:ring-1 focus:ring-primaryAccent resize-y custom-scrollbar"
                          rows={3}
                      />
                  </div>
              </div>
              <div className="flex-shrink-0 w-full flex flex-col sm:flex-row justify-end items-center p-4 border-t border-borderColor gap-4">
                  <button onClick={handleClose} className="w-full sm:w-auto px-5 py-2.5 bg-inactiveButtonBg text-primaryText rounded-full font-title text-base hover:bg-gray-600 transition">Cancelar</button>
                  <button onClick={handleSendWithPrompt} className="w-full sm:w-auto px-5 py-2.5 bg-primaryAccent text-white rounded-full font-title text-base hover:bg-primaryAccentDark transition">Enviar</button>
              </div>
            </div>
          )}

        </div>
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
};

export default ImageSelectionModal;
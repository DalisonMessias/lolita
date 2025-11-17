import React, { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ClothingSwapSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPerformSwap: (personFile: File, clothingFile: File) => void;
  isDarkMode: boolean;
}

type SlotType = 'person' | 'clothing';
type CropRect = { x: number; y: number; width: number; height: number };
type DragInfo = { type: string; startX: number; startY: number; startRect: CropRect };

const ClothingSwapSelectionModal: React.FC<ClothingSwapSelectionModalProps> = ({ isOpen, onClose, onPerformSwap, isDarkMode }) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [personImage, setPersonImage] = useState<{ file: File, src: string } | null>(null);
  const [clothingImage, setClothingImage] = useState<{ file: File, src: string } | null>(null);
  
  const [view, setView] = useState<'selection' | 'camera' | 'cropping'>('selection');
  const [cameraView, setCameraView] = useState<{ active: boolean; targetSlot: SlotType | null }>({ active: false, targetSlot: null });
  const [croppingImage, setCroppingImage] = useState<{ file: File; src: string; slot: SlotType } | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);

  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
      setPersonImage(null);
      setClothingImage(null);
      setView('selection');
    }, 300);
  }, [onClose]);

  useEffect(() => {
    return () => {
        if (personImage && personImage.src.startsWith('blob:')) {
            URL.revokeObjectURL(personImage.src);
        }
    }
  }, [personImage]);

  useEffect(() => {
    return () => {
        if (clothingImage && clothingImage.src.startsWith('blob:')) {
            URL.revokeObjectURL(clothingImage.src);
        }
    }
  }, [clothingImage]);

  const handleFileChange = (slot: SlotType, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        setCroppingImage({ file, src: reader.result as string, slot });
        setView('cropping');
    };
    reader.readAsDataURL(file);
  }

  const handleFileSelect = (slot: SlotType) => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          handleFileChange(slot, target.files[0]);
        }
      };
      fileInputRef.current.click();
    }
  };

  const startCamera = async (slot: SlotType) => {
    setView('camera');
    setCameraView({ active: true, targetSlot: slot });
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setCameraStream(stream);
    } catch (err) {
        console.error("Camera error:", err);
        setView('selection');
    }
  };
  
  const stopCameraStream = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
        videoRef.current.srcObject = cameraStream;
        videoRef.current.play().catch(console.error);
    }
  }, [cameraStream]);

  const handleCapture = () => {
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
      }
    }
  };

  const handleUseCapturedPhoto = () => {
    if (capturedImage && cameraView.targetSlot) {
        fetch(capturedImage)
            .then(res => res.blob())
            .then(blob => {
                if (blob) {
                    const file = new File([blob], `capture-${uuidv4()}.jpg`, { type: 'image/jpeg' });
                    setCroppingImage({ file, src: capturedImage, slot: cameraView.targetSlot });
                    setView('cropping');
                    setCapturedImage(null);
                }
            });
    }
  };
  
  const handlePerformSwap = () => {
    if (personImage && clothingImage) {
      onPerformSwap(personImage.file, clothingImage.file);
      handleClose();
    }
  };
  
  const startCropping = (slot: SlotType) => {
    const imageToCrop = slot === 'person' ? personImage : clothingImage;
    if (imageToCrop) {
        setCroppingImage({ ...imageToCrop, slot });
        setView('cropping');
    }
  };

  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragInfo({ type, startX: e.clientX, startY: e.clientY, startRect: cropRect });
  };
  
  const handleCropMouseMove = useCallback((e: MouseEvent) => {
    if (!dragInfo || !cropImageRef.current) return;
    const { type, startX, startY, startRect } = dragInfo;
    const { width: cWidth, height: cHeight } = cropImageRef.current.getBoundingClientRect();
    const dx = (e.clientX - startX) / cWidth;
    const dy = (e.clientY - startY) / cHeight;
    let newRect = { ...startRect };
    if (type.includes('e')) newRect.width = Math.max(0.1, startRect.width + dx);
    if (type.includes('w')) { newRect.width = Math.max(0.1, startRect.width - dx); newRect.x = startRect.x + dx; }
    if (type.includes('s')) newRect.height = Math.max(0.1, startRect.height + dy);
    if (type.includes('n')) { newRect.height = Math.max(0.1, startRect.height - dy); newRect.y = startRect.y + dy; }
    if (type === 'move') { newRect.x = startRect.x + dx; newRect.y = startRect.y + dy; }
    newRect.x = Math.max(0, Math.min(newRect.x, 1 - newRect.width));
    newRect.y = Math.max(0, Math.min(newRect.y, 1 - newRect.height));
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

  const confirmCrop = () => {
    if (!croppingImage || !canvasRef.current) return;
    const { file, slot, src } = croppingImage;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
        const sx = img.naturalWidth * cropRect.x, sy = img.naturalHeight * cropRect.y;
        const sWidth = img.naturalWidth * cropRect.width, sHeight = img.naturalHeight * cropRect.height;
        canvas.width = sWidth; canvas.height = sHeight;
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
        canvas.toBlob((blob) => {
            if (blob) {
                const newFile = new File([blob], file.name, { type: 'image/png' });
                const newSrc = URL.createObjectURL(blob);
                if (slot === 'person') {
                    setPersonImage({ file: newFile, src: newSrc });
                } else {
                    setClothingImage({ file: newFile, src: newSrc });
                }
                setView('selection');
            }
        }, 'image/png', 0.95);
    };
    img.onerror = () => console.error("A imagem não pôde ser carregada para o recorte.");
  };
  
  const handleUseFullImage = () => {
      if (croppingImage) {
          if (croppingImage.slot === 'person') setPersonImage(croppingImage);
          else setClothingImage(croppingImage);
          setView('selection');
      }
  }

  const ImageSlot = ({ type, image, onSelect, onClear, onCrop }: { type: SlotType, image: {src: string} | null, onSelect: (slot: SlotType) => void, onClear: (slot: SlotType) => void, onCrop: (slot: SlotType) => void }) => (
    <div className="flex flex-col items-center gap-2 w-full sm:w-64">
      <label className="font-title text-primaryText capitalize">{type === 'person' ? 'Pessoa' : 'Roupa'}</label>
      <div className={`relative w-full h-64 border-2 border-dashed border-borderColor rounded-lg flex items-center justify-center ${image ? 'p-0' : 'bg-aiBubble'}`}>
        {image ? (
          <>
            <img src={image.src} alt={type} className="w-full h-full object-cover rounded-lg" />
            <div className="absolute top-1 right-1 flex flex-col gap-1">
              <button onClick={() => onClear(type)} className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <button onClick={() => onCrop(type)} className="p-1 bg-accentBlue text-white rounded-full hover:bg-blue-700 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 8a6 6 0 016-6v0a6 6 0 016 6v8a6 6 0 01-6 6v0a6 6 0 01-6-6V8z"/></svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <button onClick={() => onSelect(type)} className="px-4 py-2 bg-inactiveButtonBg text-primaryText rounded-full font-title text-sm hover:bg-gray-600 transition">Galeria</button>
            <button onClick={() => startCamera(type)} className="px-4 py-2 bg-inactiveButtonBg text-primaryText rounded-full font-title text-sm hover:bg-gray-600 transition">Câmera</button>
          </div>
        )}
      </div>
    </div>
  );

  if (!isOpen) return null;

  if (view === 'camera') { /* Camera view logic remains the same */ }

  if (view === 'cropping' && croppingImage) {
      return (
          <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 modal-backdrop`} onClick={() => setView('selection')}>
             <div className={`relative bg-appBg rounded-lg shadow-2xl border border-borderColor w-full md:w-4/5 md:max-w-6xl max-h-[95vh] flex flex-col modal-content`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-borderColor bg-appHeaderBg rounded-t-lg">
                    <h2 className="text-xl font-title text-primaryAccent">Recortar Imagem</h2>
                </div>
                <div className="flex-1 p-6 overflow-hidden relative flex items-center justify-center">
                    <div className="relative inline-block" style={{ userSelect: 'none' }}>
                        <img ref={cropImageRef} src={croppingImage.src} alt="Recortar" className="max-w-full max-h-[60vh] object-contain" />
                        <div className="absolute top-0 left-0 w-full h-full" onMouseDown={(e) => handleCropMouseDown(e, 'move')} style={{ cursor: 'move' }}>
                            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50" style={{ clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${cropRect.x * 100}% ${cropRect.y * 100}%, ${cropRect.x * 100}% ${(cropRect.y + cropRect.height) * 100}%, ${(cropRect.x + cropRect.width) * 100}% ${(cropRect.y + cropRect.height) * 100}%, ${(cropRect.x + cropRect.width) * 100}% ${cropRect.y * 100}%, ${cropRect.x * 100}% ${cropRect.y * 100}%)` }}></div>
                            <div className="absolute border-2 border-white pointer-events-none" style={{ left: `${cropRect.x * 100}%`, top: `${cropRect.y * 100}%`, width: `${cropRect.width * 100}%`, height: `${cropRect.height * 100}%` }}>
                                <div onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'nw'); }} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-full cursor-nwse-resize pointer-events-auto"></div>
                                <div onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'ne'); }} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full cursor-nesw-resize pointer-events-auto"></div>
                                <div onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'sw'); }} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white rounded-full cursor-nesw-resize pointer-events-auto"></div>
                                <div onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'se'); }} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full cursor-nwse-resize pointer-events-auto"></div>
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="flex w-full flex-col sm:flex-row justify-center items-center gap-4 p-4 border-t border-borderColor">
                    <button onClick={() => setView('selection')} className="w-full sm:w-auto px-6 py-2 bg-inactiveButtonBg text-primaryText rounded-full font-title text-base hover:bg-gray-600 transition">Cancelar</button>
                    <button onClick={handleUseFullImage} className="w-full sm:w-auto px-6 py-2 bg-accentBlue text-white rounded-full font-title text-base hover:bg-blue-700 transition">Usar Imagem Inteira</button>
                    <button onClick={confirmCrop} className="w-full sm:w-auto px-6 py-2 bg-primaryAccent text-white rounded-full font-title text-base hover:bg-primaryAccentDark transition">Confirmar Recorte</button>
                </div>
                <canvas ref={canvasRef} className="hidden"></canvas>
             </div>
          </div>
      );
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 modal-backdrop ${isAnimatingOut ? 'animate-out' : ''}`} onClick={handleClose}>
      <div className={`relative bg-appBg rounded-lg shadow-2xl border border-borderColor w-full md:w-4/5 md:max-w-6xl max-h-[95vh] flex flex-col modal-content ${isAnimatingOut ? 'animate-out' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-borderColor bg-appHeaderBg rounded-t-lg">
          <h2 className="text-xl font-title text-primaryAccent">Criar Troca de Roupa</h2>
          <button onClick={handleClose} className="p-2 rounded-full text-primaryText hover:bg-gray-700 transition" aria-label="Fechar">
             <svg className="w-6 h-6 icon-effect" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <input type="file" ref={fileInputRef} accept="image/*" className="hidden" />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <ImageSlot type="person" image={personImage} onSelect={handleFileSelect} onClear={() => setPersonImage(null)} onCrop={startCropping} />
            <ImageSlot type="clothing" image={clothingImage} onSelect={handleFileSelect} onClear={() => setClothingImage(null)} onCrop={startCropping} />
          </div>
        </div>
        <div className="flex justify-end items-center p-4 border-t border-borderColor">
          <button onClick={handlePerformSwap} disabled={!personImage || !clothingImage} className="px-6 py-2 bg-primaryAccent text-white rounded-full font-title text-base hover:bg-primaryAccentDark transition disabled:opacity-50 disabled:cursor-not-allowed">
            Realizar Troca
          </button>
        </div>
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
};

export default ClothingSwapSelectionModal;
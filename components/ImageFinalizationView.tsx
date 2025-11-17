import React, { useState, useCallback, useEffect, useRef } from 'react';
import ImageSliderComparison from './ImageSliderComparison';
import { EnhancedImageHistoryEntry, ImageFilter, SocialMediaFilter, ChatMessage, AIFilter } from '../types';
import ShareModal from './ShareModal';
import { getSocialMediaFilterStyle, socialMediaFilters } from '../utils/filterUtils';
import { aiFilters } from '../utils/aiFilterUtils';
import SimpleImageViewer from './SimpleImageViewer';

interface ImageFinalizationViewProps {
  isOpen: boolean;
  onClose: () => void;
  imageEntry: EnhancedImageHistoryEntry;
  currentIndex: number;
  historyLength: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  onDownloadSpecificImage: (entry: EnhancedImageHistoryEntry) => void;
  onSaveImageEntryAdjustments: (entry: EnhancedImageHistoryEntry) => void;
  onApplyCrop: (historyId: string, croppedImageSrc: string) => void;
  onResetAdjustments: (historyId: string) => void;
  onApplyAIFilter: (historyId: string, filter: AIFilter) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  isDarkMode: boolean;
}

type CropRect = { x: number; y: number; width: number; height: number };
type DragInfo = { type: string; startX: number; startY: number; startRect: CropRect };

const aspectRatios = {
  standard: [
    { name: '1:1', value: 1 / 1 }, { name: '4:3', value: 4 / 3 }, { name: '3:2', value: 3 / 2 },
    { name: '16:9', value: 16 / 9 }, { name: '16:10', value: 16 / 10 }, { name: '5:4', value: 5 / 4 },
    { name: '21:9', value: 21 / 9 }, { name: '9:16', value: 9 / 16 }, { name: '2:1', value: 2 / 1 },
    { name: '2.39:1', value: 2.39 / 1 },
  ],
  social: [
    { name: '1.91:1', value: 1.91 / 1 }, { name: '4:5', value: 4 / 5 }, { name: '3:4', value: 3 / 4 },
    { name: '9:16', value: 9 / 16 }, { name: '9:21', value: 9 / 21 }, { name: '5:3', value: 5 / 3 }, 
    { name: '7:5', value: 7 / 5 },
  ],
};

const ImageFinalizationView: React.FC<ImageFinalizationViewProps> = ({
  isOpen, onClose, imageEntry, currentIndex, historyLength, onNavigate,
  onDownloadSpecificImage, onSaveImageEntryAdjustments, onApplyCrop, onResetAdjustments, onApplyAIFilter, addMessage, isDarkMode,
}) => {
  const [view, setView] = useState<'adjustments' | 'cropping'>('adjustments');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  
  // Local state for adjustments
  const [currentFilter, setCurrentFilter] = useState<ImageFilter>(imageEntry.appliedFilter);
  const [currentBrightness, setCurrentBrightness] = useState<number>(imageEntry.appliedBrightness);
  const [currentContrast, setCurrentContrast] = useState<number>(imageEntry.appliedContrast);
  const [currentSocialMediaFilter, setCurrentSocialMediaFilter] = useState<SocialMediaFilter>(imageEntry.appliedSocialMediaFilter);
  const [currentSocialMediaFilterIntensity, setCurrentSocialMediaFilterIntensity] = useState<number>(imageEntry.appliedSocialMediaFilterIntensity);
  const [isApplyingAIFilter, setIsApplyingAIFilter] = useState(false);
  
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [fullscreenImageSrc, setFullscreenImageSrc] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  const [activeAspectRatio, setActiveAspectRatio] = useState<number | null>(null);
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);

  useEffect(() => {
    setCurrentFilter(imageEntry.appliedFilter);
    setCurrentBrightness(imageEntry.appliedBrightness);
    setCurrentContrast(imageEntry.appliedContrast);
    setCurrentSocialMediaFilter(imageEntry.appliedSocialMediaFilter);
    setCurrentSocialMediaFilterIntensity(imageEntry.appliedSocialMediaFilterIntensity);
    setView('adjustments');
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [imageEntry]);

  useEffect(() => {
    if (zoomLevel <= 1) setPanOffset({ x: 0, y: 0 });
  }, [zoomLevel]);

  const checkScrollability = useCallback(() => {
    const el = filterContainerRef.current;
    if (el) {
        const hasOverflow = el.scrollWidth > el.clientWidth;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(hasOverflow && el.scrollLeft < (el.scrollWidth - el.clientWidth - 1));
    }
  }, []);

  useEffect(() => {
      const el = filterContainerRef.current;
      if (!el) return;
      checkScrollability();
      const resizeObserver = new ResizeObserver(checkScrollability);
      resizeObserver.observe(el);
      return () => resizeObserver.unobserve(el);
  }, [checkScrollability, currentSocialMediaFilter]);

  const handleFilterScroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
      const el = ref.current;
      if (el) {
          const scrollAmount = el.clientWidth * 0.8;
          el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      }
  };

  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300);
  }, [onClose]);

  const handleSave = useCallback(() => {
    const updatedEntry: EnhancedImageHistoryEntry = {
      ...imageEntry,
      appliedFilter: currentFilter,
      appliedBrightness: currentBrightness,
      appliedContrast: currentContrast,
      appliedSocialMediaFilter: currentSocialMediaFilter,
      appliedSocialMediaFilterIntensity: currentSocialMediaFilterIntensity,
    };
    onSaveImageEntryAdjustments(updatedEntry);
  }, [imageEntry, currentFilter, currentBrightness, currentContrast, currentSocialMediaFilter, currentSocialMediaFilterIntensity, onSaveImageEntryAdjustments]);

  const handleSetAspectRatio = (ratio: number | null) => {
    setActiveAspectRatio(ratio);
    if (ratio && cropImageRef.current) {
      const img = cropImageRef.current;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      let newWidth, newHeight;
      if (ratio > imgRatio) {
        newWidth = 1;
        newHeight = (1 / ratio) * imgRatio;
      } else {
        newHeight = 1;
        newWidth = ratio / imgRatio;
      }
      setCropRect({ x: (1 - newWidth) / 2, y: (1 - newHeight) / 2, width: newWidth, height: newHeight });
    } else {
        setCropRect({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
    }
  };

  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>, type: string) => {
    e.preventDefault(); e.stopPropagation();
    setDragInfo({ type, startX: e.clientX, startY: e.clientY, startRect: cropRect });
  };

  const handleCropMouseMove = useCallback((e: MouseEvent) => {
    if (!dragInfo || !cropImageRef.current) return;
    const { type, startX, startY, startRect } = dragInfo;
    const { width: cWidth, height: cHeight } = cropImageRef.current.getBoundingClientRect();
    let dx = (e.clientX - startX) / cWidth; let dy = (e.clientY - startY) / cHeight;
    let newRect = { ...startRect };
    if (type === 'move') { newRect.x = startRect.x + dx; newRect.y = startRect.y + dy; } 
    else {
      if (type.includes('e')) newRect.width = startRect.width + dx;
      if (type.includes('w')) { newRect.width = startRect.width - dx; newRect.x = startRect.x + dx; }
      if (type.includes('s')) newRect.height = startRect.height + dy;
      if (type.includes('n')) { newRect.height = startRect.height - dy; newRect.y = startRect.y + dy; }
      if (activeAspectRatio) {
        if (type.includes('e') || type.includes('w')) newRect.height = newRect.width / activeAspectRatio * (cWidth / cHeight);
        else newRect.width = newRect.height * activeAspectRatio * (cHeight / cWidth);
      }
    }
    newRect.width = Math.max(0.05, Math.min(newRect.width, 1));
    newRect.height = Math.max(0.05, Math.min(newRect.height, 1));
    if (newRect.x + newRect.width > 1) newRect.x = 1 - newRect.width;
    if (newRect.y + newRect.height > 1) newRect.y = 1 - newRect.height;
    if (newRect.x < 0) newRect.x = 0;
    if (newRect.y < 0) newRect.y = 0;
    setCropRect(newRect);
  }, [dragInfo, activeAspectRatio]);

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

  const handleApplyCropClick = () => {
    if (!cropImageRef.current || !canvasRef.current) return;
    const img = cropImageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageToCrop = imageEntry.uncroppedEnhancedImageSrc || imageEntry.enhancedImageSrc;
    const tempImg = new Image();
    tempImg.crossOrigin = "anonymous";
    tempImg.src = imageToCrop;
    tempImg.onload = () => {
        const sx = tempImg.naturalWidth * cropRect.x, sy = tempImg.naturalHeight * cropRect.y;
        const sWidth = tempImg.naturalWidth * cropRect.width, sHeight = tempImg.naturalHeight * cropRect.height;
        canvas.width = sWidth; canvas.height = sHeight;
        ctx.drawImage(tempImg, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
        const croppedDataUrl = canvas.toDataURL(imageEntry.imageMimeType || 'image/png', 0.95);
        onApplyCrop(imageEntry.id, croppedDataUrl);
        setView('adjustments');
    };
  };

  const handleApplyAIFilterClick = (filter: AIFilter) => {
    if (isApplyingAIFilter) return;
    setIsApplyingAIFilter(true);
    onApplyAIFilter(imageEntry.id, filter).finally(() => setIsApplyingAIFilter(false));
  };

  const combinedFilterStyle = getSocialMediaFilterStyle(currentSocialMediaFilter, currentSocialMediaFilterIntensity);
  const finalFilterStyle = `brightness(${currentBrightness}%) contrast(${currentContrast}%) ${currentFilter !== ImageFilter.NONE ? `${currentFilter}(1)` : ''} ${combinedFilterStyle}`.trim();

  const handleImageClick = () => setFullscreenImageSrc(imageEntry.uncroppedEnhancedImageSrc || imageEntry.enhancedImageSrc);

  const renderAdjustmentsView = () => (
    <>
      <div className="flex-1 w-full flex items-center justify-center p-4 overflow-hidden min-h-0 relative">
          <ImageSliderComparison
            originalSrc={imageEntry.originalImageSrc}
            enhancedSrc={imageEntry.uncroppedEnhancedImageSrc || imageEntry.enhancedImageSrc}
            filterStyle={finalFilterStyle}
            zoomLevel={zoomLevel}
            panOffset={panOffset}
            onPanChange={setPanOffset}
            onImageClick={handleImageClick}
          />
          {isApplyingAIFilter && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primaryAccent"></div>
              <p className="text-white mt-3 font-title">A aplicar filtro de IA...</p>
            </div>
          )}
      </div>
       <div className={`flex-shrink-0 w-full bg-appBg shadow-lg p-4 border-t border-borderColor overflow-y-auto custom-scrollbar max-h-[45vh] md:max-h-[50vh] ${isApplyingAIFilter ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="mx-auto max-w-2xl space-y-4">
            
            {historyLength > 1 && (
              <div className="flex justify-between items-center text-secondaryText">
                <button onClick={() => onNavigate('prev')} disabled={currentIndex <= 0} className="p-2 rounded-full disabled:opacity-30 hover:bg-gray-700 transition"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                <div className="text-center">
                    <span className="font-title text-sm">{currentIndex + 1} / {historyLength}</span>
                    <p className="text-xs text-secondaryText">Gerado em: {new Date(imageEntry.timestamp).toLocaleString('pt-BR')}</p>
                </div>
                <button onClick={() => onNavigate('next')} disabled={currentIndex >= historyLength - 1} className="p-2 rounded-full disabled:opacity-30 hover:bg-gray-700 transition"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4-4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></button>
              </div>
            )}
            
            <div className="space-y-4">
                <h3 className="text-lg font-title text-primaryText text-center border-b border-borderColor pb-2">Ajustes e Filtros</h3>
                
                <div className="space-y-2 pt-2">
                    <label htmlFor="zoom-slider" className="block text-primaryText text-sm font-medium">Zoom: <span className="text-primaryAccent">{Math.round(zoomLevel * 100)}%</span></label>
                    <input id="zoom-slider" type="range" min="1" max="5" step="0.1" value={zoomLevel} onChange={(e) => setZoomLevel(Number(e.target.value))} className="w-full h-2 bg-borderColor rounded-lg appearance-none cursor-pointer accent-primaryAccent" aria-valuetext={`${Math.round(zoomLevel * 100)}%`} />
                </div>

                <button onClick={() => setView('cropping')} className="w-full text-center p-3 bg-inactiveButtonBg rounded-lg text-primaryText font-title hover:bg-gray-600 transition">Recortar Imagem</button>

                <div>
                    <h4 className="text-sm font-title text-secondaryText mb-2">Filtros de IA</h4>
                    <div className="relative flex items-center gap-2">
                       <div className="flex-1 flex items-center gap-2 overflow-x-auto whitespace-nowrap scroll-smooth hide-scrollbar">
                           {aiFilters.map((filter) => (
                               <button key={filter.value} onClick={() => handleApplyAIFilterClick(filter.value)} className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-full transition ${imageEntry.appliedAIFilter === filter.value ? 'bg-primaryAccent text-white' : 'bg-inputBg text-primaryText hover:bg-gray-700'}`}>{filter.name}</button>
                           ))}
                       </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="brightness-slider" className="block text-primaryText text-sm font-medium mb-1">Brilho: <span className="text-primaryAccent">{currentBrightness}%</span></label>
                        <input id="brightness-slider" type="range" min="0" max="200" value={currentBrightness} onChange={(e) => setCurrentBrightness(Number(e.target.value))} className="w-full h-2 bg-borderColor rounded-lg appearance-none cursor-pointer accent-primaryAccent" aria-valuetext={`${currentBrightness}%`} />
                    </div>
                    <div>
                        <label htmlFor="contrast-slider" className="block text-primaryText text-sm font-medium mb-1">Contraste: <span className="text-primaryAccent">{currentContrast}%</span></label>
                        <input id="contrast-slider" type="range" min="0" max="200" value={currentContrast} onChange={(e) => setCurrentContrast(Number(e.target.value))} className="w-full h-2 bg-borderColor rounded-lg appearance-none cursor-pointer accent-primaryAccent" aria-valuetext={`${currentContrast}%`} />
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-title text-secondaryText mb-2">Filtros Básicos</h4>
                    <div className="flex flex-wrap gap-2">
                        {Object.values(ImageFilter).map((filter) => (
                            <button key={filter} onClick={() => setCurrentFilter(filter)} className={`px-3 py-1.5 text-xs rounded-full transition ${currentFilter === filter ? 'bg-accentBlue text-white' : 'bg-inputBg text-primaryText hover:bg-gray-700'}`}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</button>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-title text-secondaryText mb-2">Filtros de Rede Social</h4>
                    <div className="relative flex items-center gap-2">
                        <button onClick={() => handleFilterScroll(filterContainerRef, 'left')} className={`p-1 rounded-full text-primaryText bg-inputBg hover:bg-gray-700 transition ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} aria-label="Rolar filtros para a esquerda"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg></button>
                        <div ref={filterContainerRef} onScroll={checkScrollability} className="flex-1 flex items-center gap-2 overflow-x-auto whitespace-nowrap scroll-smooth hide-scrollbar">
                           {socialMediaFilters.map((filter) => (
                               <button key={filter.value} onClick={() => setCurrentSocialMediaFilter(prev => prev === filter.value ? SocialMediaFilter.NONE : filter.value)} className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-full transition ${currentSocialMediaFilter === filter.value ? 'bg-accentBlue text-white' : 'bg-inputBg text-primaryText hover:bg-gray-700'}`}>{filter.name}</button>
                           ))}
                        </div>
                        <button onClick={() => handleFilterScroll(filterContainerRef, 'right')} className={`p-1 rounded-full text-primaryText bg-inputBg hover:bg-gray-700 transition ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} aria-label="Rolar filtros para a direita"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg></button>
                    </div>
                    {currentSocialMediaFilter !== SocialMediaFilter.NONE && (
                        <div className="mt-3 control-fade-in">
                        <label htmlFor="intensity-slider" className="block text-primaryText text-sm font-medium mb-1">Intensidade: <span className="text-primaryAccent">{currentSocialMediaFilterIntensity}%</span></label>
                        <input id="intensity-slider" type="range" min="0" max="100" value={currentSocialMediaFilterIntensity} onChange={(e) => setCurrentSocialMediaFilterIntensity(Number(e.target.value))} className="w-full h-2 bg-borderColor rounded-lg appearance-none cursor-pointer accent-primaryAccent" aria-valuetext={`${currentSocialMediaFilterIntensity}%`} />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-borderColor">
                <button onClick={handleSave} className="w-full text-center p-3 bg-primaryAccent text-white rounded-full font-title hover:bg-primaryAccentDark transition">Salvar Ajustes</button>
                <button onClick={() => setShowShareModal(true)} className="w-full text-center p-3 bg-accentBlue text-white rounded-full font-title hover:bg-blue-700 transition">Compartilhar</button>
                <button onClick={() => onDownloadSpecificImage(imageEntry)} className="w-full text-center p-3 bg-primaryAccent text-white rounded-full font-title hover:bg-primaryAccentDark transition">Baixar</button>
                <button onClick={() => onResetAdjustments(imageEntry.id)} className="w-full text-center p-3 bg-inactiveButtonBg text-primaryText rounded-full font-title hover:bg-gray-600 transition">Redefinir</button>
            </div>
          </div>
       </div>
       {showShareModal && <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} imageEntry={imageEntry} filterStyle={finalFilterStyle} isDarkMode={isDarkMode} addMessage={addMessage} />}
       {fullscreenImageSrc && <SimpleImageViewer isOpen={!!fullscreenImageSrc} onClose={() => setFullscreenImageSrc(null)} imageSrc={fullscreenImageSrc} isDarkMode={isDarkMode} filterStyle={finalFilterStyle} />}
    </>
  );

  const renderCroppingView = () => (
    <>
        <div className="flex-1 w-full flex items-center justify-center p-4 overflow-hidden relative" style={{ userSelect: 'none' }}>
            <img ref={cropImageRef} src={imageEntry.uncroppedEnhancedImageSrc || imageEntry.enhancedImageSrc} alt="Recortar" className="max-w-full max-h-full object-contain" />
            <div className="absolute top-0 left-0 w-full h-full" onMouseDown={(e) => handleCropMouseDown(e, 'move')} style={{ cursor: 'move' }}>
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-60" style={{ clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${cropRect.x * 100}% ${cropRect.y * 100}%, ${cropRect.x * 100}% ${(cropRect.y + cropRect.height) * 100}%, ${(cropRect.x + cropRect.width) * 100}% ${(cropRect.y + cropRect.height) * 100}%, ${(cropRect.x + cropRect.width) * 100}% ${cropRect.y * 100}%, ${cropRect.x * 100}% ${cropRect.y * 100}%)` }}></div>
                <div className="absolute border-2 border-white pointer-events-none" style={{ left: `${cropRect.x * 100}%`, top: `${cropRect.y * 100}%`, width: `${cropRect.width * 100}%`, height: `${cropRect.height * 100}%` }}>
                    <div onMouseDown={(e) => handleCropMouseDown(e, 'nw')} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-full cursor-nwse-resize pointer-events-auto"></div>
                    <div onMouseDown={(e) => handleCropMouseDown(e, 'ne')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full cursor-nesw-resize pointer-events-auto"></div>
                    <div onMouseDown={(e) => handleCropMouseDown(e, 'sw')} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white rounded-full cursor-nesw-resize pointer-events-auto"></div>
                    <div onMouseDown={(e) => handleCropMouseDown(e, 'se')} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full cursor-nwse-resize pointer-events-auto"></div>
                </div>
            </div>
        </div>
         <div className="flex-shrink-0 w-full bg-appBg shadow-lg p-4 border-t border-borderColor overflow-y-auto custom-scrollbar max-h-[40vh]">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-title text-secondaryText mb-2">Padrão</h4>
                <div className="flex flex-wrap gap-2">
                  {aspectRatios.standard.map(r => <button key={r.name} onClick={() => handleSetAspectRatio(r.value)} className={`px-3 py-1 text-xs rounded-full ${activeAspectRatio === r.value ? 'bg-accentBlue text-white' : 'bg-inputBg text-primaryText'}`}>{r.name}</button>)}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-title text-secondaryText mb-2">Mídia Social</h4>
                <div className="flex flex-wrap gap-2">
                  {aspectRatios.social.map(r => <button key={r.name} onClick={() => handleSetAspectRatio(r.value)} className={`px-3 py-1 text-xs rounded-full ${activeAspectRatio === r.value ? 'bg-accentBlue text-white' : 'bg-inputBg text-primaryText'}`}>{r.name}</button>)}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-borderColor">
                <button onClick={() => setView('adjustments')} className="px-5 py-2 bg-inactiveButtonBg text-primaryText rounded-full font-title text-base hover:bg-gray-600 transition">Cancelar</button>
                <button onClick={handleApplyCropClick} className="px-5 py-2 bg-primaryAccent text-white rounded-full font-title text-base hover:bg-primaryAccentDark transition">Aplicar Recorte</button>
            </div>
        </div>
    </>
  );

  return (
    <div className={`fixed inset-0 z-40 flex flex-col bg-appBg fullscreen-view ${isAnimatingOut ? 'animate-out' : ''}`}>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <div className="flex-shrink-0 flex justify-between items-center p-3 bg-appHeaderBg border-b border-borderColor">
        <h2 className="text-lg font-title text-primaryText">{view === 'cropping' ? 'Recortar Imagem' : 'Editar Imagem'}</h2>
        <button onClick={handleClose} className="p-2 rounded-full text-secondaryText hover:bg-gray-700 transition" aria-label="Fechar Edição">
          <svg className="w-6 h-6 icon-effect" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      {view === 'adjustments' ? renderAdjustmentsView() : renderCroppingView()}

    </div>
  );
};

export default ImageFinalizationView;
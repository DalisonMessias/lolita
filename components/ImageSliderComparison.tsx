import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ImageSliderComparisonProps {
  originalSrc: string;
  enhancedSrc: string;
  filterStyle?: string;
  zoomLevel?: number;
  panOffset?: { x: number; y: number };
  onPanChange?: (offset: { x: number; y: number }) => void;
  onImageClick?: () => void;
}

const ImageSliderComparison: React.FC<ImageSliderComparisonProps> = ({
  originalSrc,
  enhancedSrc,
  filterStyle = 'none',
  zoomLevel = 1,
  panOffset = { x: 0, y: 0 },
  onPanChange,
  onImageClick,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef({ x: 0, y: 0 });
  const clickStartRef = useRef(0);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0, aspectRatio: '1/1' });

  useEffect(() => {
    const img = new Image();
    img.src = originalSrc;
    img.onload = () => {
      setImageSize({ 
        width: img.naturalWidth, 
        height: img.naturalHeight,
        aspectRatio: `${img.naturalWidth} / ${img.naturalHeight}`
      });
    };
  }, [originalSrc]);

  const handleMoveSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleMouseDownSlider = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingSlider(true);
  };
  
  const handleTouchStartSlider = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDraggingSlider(true);
  };

  const handlePanStart = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    e.preventDefault();
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    };
    clickStartRef.current = Date.now();
  };

  // Fix: Changed the type of 'e' to a structural type compatible with both native and React MouseEvents,
  // as the function only depends on clientX and clientY.
  const handlePanMove = (e: { clientX: number, clientY: number }) => {
    if (!isPanning || zoomLevel <= 1 || !onPanChange || !containerRef.current) return;
    
    const newX = e.clientX - panStartRef.current.x;
    const newY = e.clientY - panStartRef.current.y;
    
    const container = containerRef.current.getBoundingClientRect();
    const maxPanX = (container.width * (zoomLevel - 1)) / 2;
    const maxPanY = (container.height * (zoomLevel - 1)) / 2;

    const clampedX = Math.max(-maxPanX, Math.min(maxPanX, newX));
    const clampedY = Math.max(-maxPanY, Math.min(maxPanY, newY));

    onPanChange({ x: clampedX, y: clampedY });
  };

  const handleUp = useCallback(() => {
    setIsDraggingSlider(false);
    setIsPanning(false);
  }, []);

  const handleMoveEvent = useCallback((e: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    if (isDraggingSlider) {
      handleMoveSlider(clientX);
    }
    if ('buttons' in e && isPanning) { // Check for mouse event
      handlePanMove(e as MouseEvent);
    }
  }, [isDraggingSlider, isPanning, handleMoveSlider, handlePanMove]);

  const handleClick = (e: React.MouseEvent) => {
    const dragDuration = Date.now() - clickStartRef.current;
    if (dragDuration < 200 && onImageClick && zoomLevel <= 1) {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-role="slider-handle"]')) {
           onImageClick();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMoveEvent);
    window.addEventListener('touchmove', handleMoveEvent);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMoveEvent);
      window.removeEventListener('touchmove', handleMoveEvent);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [handleMoveEvent, handleUp]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-full max-h-full overflow-hidden select-none rounded-lg border border-borderColor touch-manipulation"
      style={{ 
        aspectRatio: imageSize.aspectRatio,
        cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : (onImageClick ? 'pointer' : 'default')
      }}
      onMouseLeave={handleUp}
      onMouseDown={handlePanStart}
      onMouseUp={handleUp}
      onMouseMove={handlePanMove}
      onClick={handleClick}
    >
      <div 
        className="absolute top-0 left-0 w-full h-full"
        style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transition: 'transform 0.1s ease-out'
        }}
      >
        <img
          src={originalSrc}
          alt="Original"
          className="block absolute top-0 left-0 w-full h-full object-contain"
          draggable={false}
        />
        <div
          className="absolute top-0 left-0 w-full h-full overflow-hidden"
          style={{ clipPath: `polygon(0% 0%, ${sliderPosition}% 0%, ${sliderPosition}% 100%, 0% 100%)` }}
        >
          <img
            src={enhancedSrc}
            alt="Aprimorada"
            className="block absolute top-0 left-0 w-full h-full object-contain"
            style={{ filter: filterStyle }}
            draggable={false}
          />
        </div>
        <div
          className="absolute top-0 bottom-0 w-1 bg-white/70 cursor-ew-resize"
          style={{ 
            left: `calc(${sliderPosition}% - ${panOffset.x}px)`, // Adjust slider based on pan
            transform: `translateX(-50%) scale(${1 / zoomLevel})`, // Counter-scale slider
            transformOrigin: 'center center'
          }}
          onMouseDown={handleMouseDownSlider}
          onTouchStart={handleTouchStartSlider}
          data-role="slider-handle"
        >
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-black shadow-lg"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5 5-5m2 10l5-5-5-5" />
              </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSliderComparison;

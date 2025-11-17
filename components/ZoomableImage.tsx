import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string; // For base styling like max-width, border, etc. applied to the container
  filterClass?: string; // For CSS filters applied to the image itself
  isDarkMode: boolean; // New prop for theme
  // Props for external control (used by ImageFinalizationView)
  currentZoomLevel?: number;
  onZoomChange?: (newLevel: number, newOffsetX: number, newOffsetY: number) => void;
  currentOffset?: { x: number; y: number };
  onOffsetChange?: (newOffset: { x: number; y: number }) => void;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt,
  className,
  filterClass,
  isDarkMode,
  currentZoomLevel: externalZoomLevel,
  onZoomChange: setExternalZoomLevel,
  currentOffset: externalOffset,
  onOffsetChange: setExternalOffset,
}) => {
  const [internalZoomLevel, setInternalZoomLevel] = useState(1);
  const [internalOffset, setInternalOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 }); // Mouse position when drag started

  const zoomLevel = externalZoomLevel !== undefined ? externalZoomLevel : internalZoomLevel;
  const offset = externalOffset !== undefined ? externalOffset : internalOffset;
  const setZoomLevel = setExternalZoomLevel !== undefined ? setExternalZoomLevel : (level, ox, oy) => setInternalZoomLevel(level);
  const setOffset = setExternalOffset !== undefined ? setExternalOffset : setInternalOffset;


  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset zoom and pan when image source changes
  useEffect(() => {
    setZoomLevel(1, 0, 0); // Reset externally if controlled, otherwise internally
    setOffset({ x: 0, y: 0 });
    setIsDragging(false); // Ensure dragging is off
  }, [src, setOffset, setZoomLevel]);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent page scrolling

    if (!containerRef.current || !imageRef.current) return;

    const scaleFactor = 1.1; // Amount to zoom in/out
    const newZoomLevel = event.deltaY < 0
      ? Math.min(zoomLevel * scaleFactor, 5) // Max zoom 5x
      : Math.max(zoomLevel / scaleFactor, 1); // Min zoom 1x

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate new offsets to keep the mouse position fixed relative to the content
    const newOffsetX = mouseX - ((mouseX - offset.x) * (newZoomLevel / zoomLevel));
    const newOffsetY = mouseY - ((mouseY - offset.y) * (newZoomLevel / zoomLevel));

    // Clamp offsets to prevent image from going completely out of bounds
    const imageWidth = imageRef.current.naturalWidth * newZoomLevel;
    const imageHeight = imageRef.current.naturalHeight * newZoomLevel;
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    const maxOffsetX = Math.max(0, (imageWidth - containerWidth) / 2 / newZoomLevel);
    const minOffsetX = -maxOffsetX;
    const maxOffsetY = Math.max(0, (imageHeight - containerHeight) / 2 / newZoomLevel);
    const minOffsetY = -maxOffsetY;
    
    // Clamp the new offset
    let clampedOffsetX = newOffsetX;
    let clampedOffsetY = newOffsetY;

    if (newZoomLevel > 1) {
        clampedOffsetX = Math.max(containerWidth - imageWidth, Math.min(0, newOffsetX));
        clampedOffsetY = Math.max(containerHeight - imageHeight, Math.min(0, newOffsetY));
    } else { // If not zoomed, center the image
        clampedOffsetX = 0;
        clampedOffsetY = 0;
    }


    if (setExternalZoomLevel) {
        setExternalZoomLevel(newZoomLevel, clampedOffsetX, clampedOffsetY);
    } else {
        setInternalZoomLevel(newZoomLevel);
        setInternalOffset({ x: clampedOffsetX, y: clampedOffsetY });
    }
  }, [zoomLevel, offset, setZoomLevel, setOffset]);


  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel > 1) { // Only allow dragging if zoomed in
      setIsDragging(true);
      setStartDrag({ x: event.clientX - offset.x, y: event.clientY - offset.y });
      event.preventDefault(); // Prevent default browser drag behavior (e.g., image drag)
    }
  }, [zoomLevel, offset]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      if (!imageRef.current || !containerRef.current) return;

      const newOffsetX = event.clientX - startDrag.x;
      const newOffsetY = event.clientY - startDrag.y;
      
      const imageWidth = imageRef.current.offsetWidth * zoomLevel;
      const imageHeight = imageRef.current.offsetHeight * zoomLevel;
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      let clampedOffsetX = newOffsetX;
      let clampedOffsetY = newOffsetY;

      // Clamp to container bounds
      if (imageWidth > containerWidth) {
          clampedOffsetX = Math.max(containerWidth - imageWidth, Math.min(0, newOffsetX));
      } else { // If image is smaller than container, keep it centered
          clampedOffsetX = (containerWidth - imageWidth) / 2;
      }
      if (imageHeight > containerHeight) {
          clampedOffsetY = Math.max(containerHeight - imageHeight, Math.min(0, newOffsetY));
      } else { // If image is smaller than container, keep it centered
          clampedOffsetY = (containerHeight - imageHeight) / 2;
      }

      setOffset({ x: clampedOffsetX, y: clampedOffsetY });
    }
  }, [isDragging, startDrag, zoomLevel, setOffset]);


  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false); // Stop dragging if mouse leaves the element
  }, []);

  const transformStyle: React.CSSProperties = {
    transform: `translateX(${offset.x}px) translateY(${offset.y}px) scale(${zoomLevel})`,
    cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
    transformOrigin: '0 0', // Ensure transforms apply from the top-left corner
    filter: filterClass || 'none', // Apply filterClass directly here
  };

  const borderColor = 'border-borderColor'; // Usar borderColor padrão do tema escuro
  const dragBorderColor = 'border-primaryAccent';

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden w-full h-full flex justify-center items-center rounded-md transition-all duration-150 ease-out 
                  ${isDragging ? `${dragBorderColor} shadow-lg` : borderColor}
                  ${className || ''}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        touchAction: 'none', // Disable default touch actions for better drag experience on touch devices
      }}
      aria-label="Imagem zoomável"
      role="img"
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`max-w-none max-h-none block transform-gpu will-change-transform 
                    ${zoomLevel === 1 ? 'w-full h-full object-contain transition-transform duration-100 ease-out' : ''}`} // Reset object-contain when not zoomed, apply transition only for initial zoom/reset
        style={transformStyle}
        onLoad={(e) => {
            // Recenter/reset if image changes and zoom is 1
            if (zoomLevel === 1) {
                setOffset({x:0, y:0});
            }
        }}
      />
    </div>
  );
};

export default ZoomableImage;
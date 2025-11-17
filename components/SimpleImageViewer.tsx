import React, { useState, useCallback, useEffect } from 'react';

interface SimpleImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  isDarkMode: boolean;
  filterStyle?: string;
  onEdit?: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  currentIndex?: number;
  galleryLength?: number;
}

const SimpleImageViewer: React.FC<SimpleImageViewerProps> = ({
  isOpen,
  onClose,
  imageSrc,
  isDarkMode,
  filterStyle,
  onEdit,
  onNavigate,
  currentIndex,
  galleryLength,
}) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      } else if (onNavigate) {
        if (event.key === 'ArrowLeft' && currentIndex !== undefined && currentIndex > 0) {
          onNavigate('prev');
        } else if (event.key === 'ArrowRight' && currentIndex !== undefined && galleryLength !== undefined && currentIndex < galleryLength - 1) {
          onNavigate('next');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose, onNavigate, currentIndex, galleryLength]);

  if (!isOpen) return null;

  const canNavigatePrev = onNavigate && typeof currentIndex === 'number' && currentIndex > 0;
  const canNavigateNext = onNavigate && typeof currentIndex === 'number' && typeof galleryLength === 'number' && currentIndex < galleryLength - 1;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8 transition-opacity duration-300 ${isAnimatingOut ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Close Button (top right) */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
        aria-label="Fechar visualizador"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      {/* Main Image */}
      <img
        src={imageSrc}
        alt="Visualização da imagem"
        className={`block max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-300 ${isAnimatingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        style={{ filter: filterStyle || 'none' }}
        onClick={e => e.stopPropagation()} // Prevent closing modal when clicking image
        key={imageSrc}
      />

      {/* Navigation and Info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
        {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="px-6 py-3 bg-black bg-opacity-50 text-white rounded-full font-title text-base hover:bg-opacity-75 transition-all backdrop-blur-sm border border-white/20 shadow-lg"
            >
              Editar Foto
            </button>
        )}
        {typeof currentIndex === 'number' && typeof galleryLength === 'number' && (
          <div className="bg-black/50 text-white text-sm rounded-full px-4 py-1 backdrop-blur-sm">
            <span>{currentIndex + 1} / {galleryLength}</span>
          </div>
        )}
      </div>

      {/* Prev Button */}
      {canNavigatePrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
          aria-label="Imagem anterior"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
      )}

      {/* Next Button */}
      {canNavigateNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
          aria-label="Próxima imagem"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      )}
    </div>
  );
};

export default SimpleImageViewer;

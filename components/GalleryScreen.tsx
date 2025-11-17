import React, { useState, useCallback } from 'react';
import { EnhancedImageHistoryEntry } from '../types';
import WatermarkedImage from './WatermarkedImage';

interface GalleryScreenProps {
  gallery: EnhancedImageHistoryEntry[];
  onViewImage: (entry: EnhancedImageHistoryEntry, index: number) => void;
  isDarkMode: boolean;
}

const GalleryScreen: React.FC<GalleryScreenProps> = ({ gallery, onViewImage, isDarkMode }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const containerBg = 'bg-appBg';
  const textColor = 'text-primaryText';
  const secondaryTextColor = 'text-secondaryText';
  const imageBg = 'bg-inputBg';
  const borderColor = 'border-borderColor';

  const handleViewClick = useCallback((entry: EnhancedImageHistoryEntry, index: number) => {
    setActiveIndex(index);
    setTimeout(() => {
      onViewImage(entry, index);
      setTimeout(() => setActiveIndex(null), 300);
    }, 150);
  }, [onViewImage]);

  if (gallery.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${containerBg} ${textColor} p-8 text-center`}>
        <svg className={`w-16 h-16 mb-4 ${secondaryTextColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <h2 className="text-2xl font-title">A sua Galeria está Vazia</h2>
        <p className={`mt-2 ${secondaryTextColor}`}>As imagens que gerar com a IA aparecerão aqui.</p>
      </div>
    );
  }

  const reversedGallery = gallery.slice().reverse();

  return (
    <div className={`p-4 md:p-6 ${containerBg} h-full overflow-y-auto custom-scrollbar`}>
      <h2 className={`text-2xl font-title ${textColor} mb-4`}>Galeria de Imagens</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {reversedGallery.map((entry, reverseIndex) => {
            const originalIndex = gallery.length - 1 - reverseIndex;
            const isActive = activeIndex === originalIndex;
            return (
              <div
                key={entry.id}
                className={`relative group aspect-square ${imageBg} rounded-lg overflow-hidden shadow-md cursor-pointer border ${borderColor} transition-transform transform ${isActive ? 'scale-95 opacity-70' : 'hover:scale-105'}`}
                onClick={() => handleViewClick(entry, originalIndex)}
                aria-label={`Visualizar imagem gerada em ${new Date(entry.timestamp).toLocaleDateString('pt-BR')}`}
              >
                <WatermarkedImage
                  src={entry.enhancedImageSrc}
                  alt={`Imagem aprimorada ${entry.id}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                  <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity p-2">
                    <p className="font-bold text-lg">Visualizar</p>
                    <p className="text-xs">{new Date(entry.timestamp).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default GalleryScreen;

import React, { useState, useCallback } from 'react';
import { ImageFilter, SocialMediaFilter } from '../types';
import ZoomableImage from './ZoomableImage';
import { getSocialMediaFilterStyle, socialMediaFilters } from '../utils/filterUtils';

interface ImageComparisonProps {
  originalImageSrc: string;
  enhancedImageSrc: string;
  onDownload: (entry?: any) => void;
  onReset: () => void;
  isLoading: boolean;
  selectedFilter: ImageFilter;
  onFilterChange: (filter: ImageFilter) => void;
  brightness: number;
  onBrightnessChange: (brightness: number) => void;
  contrast: number;
  onContrastChange: (contrast: number) => void;
  isDarkMode: boolean;
  selectedSocialMediaFilter: SocialMediaFilter | null;
  onSocialMediaFilterChange: (filter: SocialMediaFilter | null) => void;
  socialMediaFilterIntensity: number;
  onSocialMediaFilterIntensityChange: (intensity: number) => void;
}

const ImageComparison: React.FC<ImageComparisonProps> = ({
  originalImageSrc,
  enhancedImageSrc,
  onDownload,
  onReset,
  isLoading,
  selectedFilter,
  onFilterChange,
  brightness,
  onBrightnessChange,
  contrast,
  onContrastChange,
  isDarkMode,
  selectedSocialMediaFilter,
  onSocialMediaFilterChange,
  socialMediaFilterIntensity,
  onSocialMediaFilterIntensityChange,
}) => {
  const [showSocialMediaFilters, setShowSocialMediaFilters] = useState(false);

  const combinedFilterStyle = [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    selectedFilter !== ImageFilter.NONE ? `${selectedFilter}(100%)` : '',
    getSocialMediaFilterStyle(selectedSocialMediaFilter, socialMediaFilterIntensity),
  ].filter(Boolean).join(' ');

  const imageContainerClasses = `p-3 bg-inputBg rounded-lg shadow-sm flex flex-col items-center justify-center relative min-h-[250px] aspect-square overflow-hidden`;
  const zoomableImageBaseClasses = `w-full h-full object-contain rounded-md border border-borderColor`;
  const headerTextColorClass = 'text-primaryText';
  const labelTextColorClass = 'text-secondaryText';
  const sectionBgClass = 'bg-inputBg';
  const sectionBorderClass = 'border-borderColor';
  const filterButtonActiveBg = 'bg-primaryAccent';
  const filterButtonInactiveBg = 'bg-inactiveButtonBg';
  const filterButtonInactiveText = 'text-inactiveButtonText';
  const sliderBgClass = 'bg-borderColor';
  const placeholderBgClass = 'bg-aiBubble';
  const placeholderTextColorClass = 'text-secondaryText';
  const actionPanelBgClass = 'bg-appBg';

  const handleSocialMediaFilterClick = useCallback((filter: SocialMediaFilter) => {
    if (selectedSocialMediaFilter === filter) {
      onSocialMediaFilterChange(SocialMediaFilter.NONE);
    } else {
      onSocialMediaFilterChange(filter);
    }
  }, [selectedSocialMediaFilter, onSocialMediaFilterChange]);

  return (
    <div className={`w-full flex flex-col items-center gap-4 p-4 ${sectionBgClass} rounded-lg shadow-xl border ${sectionBorderClass}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className={imageContainerClasses}>
          <h3 className={`text-lg font-title ${headerTextColorClass} mb-2`}>Original</h3>
          <p className={`text-xs ${labelTextColorClass} mb-2`}>Role para zoom, arraste para mover</p>
          <ZoomableImage src={originalImageSrc} alt="Original" className={zoomableImageBaseClasses} isDarkMode={isDarkMode} />
        </div>
        <div className={imageContainerClasses}>
          <h3 className={`text-lg font-title ${headerTextColorClass} mb-2`}>Aprimorada</h3>
          <p className={`text-xs ${labelTextColorClass} mb-2`}>Role para zoom, arraste para mover</p>
          {enhancedImageSrc ? (
            <ZoomableImage
              src={enhancedImageSrc}
              alt="Aprimorada"
              className={zoomableImageBaseClasses}
              filterClass={combinedFilterStyle}
              isDarkMode={isDarkMode}
            />
          ) : (
            <div className={`flex items-center justify-center h-full w-full ${placeholderBgClass} ${placeholderTextColorClass} rounded-md text-sm`}>
              Nenhuma imagem aprimorada ainda.
            </div>
          )}
        </div>
      </div>

      <div className={`w-full flex flex-col items-center gap-3 p-3 ${sectionBgClass} rounded-lg shadow-md border ${sectionBorderClass}`}>
        <h3 className={`text-lg font-title ${headerTextColorClass}`}>Ajustes da Imagem</h3>

        <div className="w-full max-w-md">
          <label htmlFor="brightness-slider" className={`block ${headerTextColorClass} text-sm font-medium mb-1`}>
            Brilho: <span className="text-primaryAccent">{brightness}%</span>
          </label>
          <input
            id="brightness-slider"
            type="range"
            min="0"
            max="200"
            value={brightness}
            onChange={(e) => onBrightnessChange(Number(e.target.value))}
            className={`w-full h-2 ${sliderBgClass} rounded-lg appearance-none cursor-pointer accent-primaryAccent`}
            disabled={isLoading || !enhancedImageSrc}
            aria-label={`Ajustar brilho para ${brightness} por cento`}
          />
        </div>

        <div className="w-full max-w-md">
          <label htmlFor="contrast-slider" className={`block ${headerTextColorClass} text-sm font-medium mb-1`}>
            Contraste: <span className="text-primaryAccent">{contrast}%</span>
          </label>
          <input
            id="contrast-slider"
            type="range"
            min="0"
            max="200"
            value={contrast}
            onChange={(e) => onContrastChange(Number(e.target.value))}
            className={`w-full h-2 ${sliderBgClass} rounded-lg appearance-none cursor-pointer accent-primaryAccent`}
            disabled={isLoading || !enhancedImageSrc}
            aria-label={`Ajustar contraste para ${contrast} por cento`}
          />
        </div>

        <h4 className={`text-md font-title ${labelTextColorClass} mt-2`}>Aplicar Filtro Rápido</h4>
        <div className="flex flex-wrap justify-center gap-2">
          {Object.values(ImageFilter).map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 ease-in-out
                ${selectedFilter === filter
                  ? `${filterButtonActiveBg} text-white shadow-md`
                  : `${filterButtonInactiveBg} ${filterButtonInactiveText} hover:bg-gray-600`
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={isLoading || !enhancedImageSrc}
              aria-pressed={selectedFilter === filter}
            >
              {(filter as string).charAt(0).toUpperCase() + (filter as string).slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={`w-full flex flex-col items-center gap-3 p-3 ${sectionBgClass} rounded-lg shadow-md border ${sectionBorderClass}`}>
        <button
          onClick={() => setShowSocialMediaFilters(prev => !prev)}
          className={`flex items-center justify-center w-full px-5 py-2.5 bg-inactiveButtonBg text-primaryText rounded-full font-title text-base hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-appBg transition duration-200 ease-in-out`}
          aria-expanded={showSocialMediaFilters}
          aria-controls="social-media-filters-panel"
          disabled={isLoading || !enhancedImageSrc}
        >
          Explorar Filtros de Rede Social
          <svg className={`w-5 h-5 ml-2 transition-transform duration-200 ${showSocialMediaFilters ? 'rotate-180' : ''} icon-effect`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>

        {showSocialMediaFilters && (
          <div id="social-media-filters-panel" className="w-full mt-3 flex flex-col items-center gap-3">
            <h4 className={`text-md font-title ${labelTextColorClass}`}>Aplicar Efeito</h4>
            <div className="flex flex-nowrap overflow-x-auto custom-scrollbar-horizontal pb-2 w-full justify-start md:justify-center gap-2 px-1">
              {socialMediaFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleSocialMediaFilterClick(filter.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition duration-200 ease-in-out
                    ${selectedSocialMediaFilter === filter.value
                      ? `${filterButtonActiveBg} text-white shadow-md`
                      : `${filterButtonInactiveBg} ${filterButtonInactiveText} hover:bg-gray-600`
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={isLoading || !enhancedImageSrc}
                  aria-pressed={selectedSocialMediaFilter === filter.value}
                >
                  {filter.name}
                </button>
              ))}
            </div>

            {selectedSocialMediaFilter && selectedSocialMediaFilter !== SocialMediaFilter.NONE && (
              <div className="w-full max-w-md mt-4">
                <label htmlFor="social-media-filter-intensity-slider" className={`block ${headerTextColorClass} text-sm font-medium mb-1`}>
                  Intensidade do Filtro: <span className="text-primaryAccent">{socialMediaFilterIntensity}%</span>
                </label>
                <input
                  id="social-media-filter-intensity-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={socialMediaFilterIntensity}
                  onChange={(e) => onSocialMediaFilterIntensityChange(Number(e.target.value))}
                  className={`w-full h-2 ${sliderBgClass} rounded-lg appearance-none cursor-pointer accent-primaryAccent`}
                  disabled={isLoading || !enhancedImageSrc}
                  aria-label={`Ajustar intensidade do filtro ${selectedSocialMediaFilter} para ${socialMediaFilterIntensity} por cento`}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`flex flex-col sm:flex-row gap-3 w-full justify-center p-2 ${actionPanelBgClass} rounded-lg shadow-md`}>
        <button
          onClick={() => onDownload()}
          disabled={!enhancedImageSrc || isLoading}
          className="flex-1 px-5 py-2.5 bg-primaryAccent text-white rounded-full font-title text-base hover:bg-primaryAccentDark focus:outline-none focus:ring-2 focus:ring-primaryAccent focus:ring-offset-2 focus:ring-offset-appBg transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Baixar imagem aprimorada com ajustes"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              A transferir...
            </span>
          ) : (
            'Transferir Imagem Aprimorada'
          )}
        </button>
        <button
          onClick={onReset}
          className={`flex-1 px-5 py-2.5 bg-inactiveButtonBg text-primaryText rounded-full font-title text-base hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-appBg transition duration-200 ease-in-out`}
          disabled={isLoading}
          aria-label="Aprimorar outra imagem"
        >
          Nova Imagem
        </button>
      </div>
      <style>{`
        .custom-scrollbar-horizontal::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-track {
          background: #2C2D30;
          border-radius: 3px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
          background: #6B7280;
          border-radius: 3px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
          background: #888;
        }
      `}</style>
    </div>
  );
};

export default ImageComparison;
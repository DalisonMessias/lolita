import React, { useState, useCallback, useEffect } from 'react';
import { StagedImage } from '../types';

interface ClothingSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (personImage: StagedImage, clothingImage: StagedImage) => void;
  stagedImages: StagedImage[];
  isDarkMode: boolean;
}

const ClothingSwapModal: React.FC<ClothingSwapModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  stagedImages,
  isDarkMode,
}) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  // The order of images can be swapped by the user
  const [personImage, setPersonImage] = useState<StagedImage | null>(null);
  const [clothingImage, setClothingImage] = useState<StagedImage | null>(null);

  useEffect(() => {
    // Initialize image order when modal opens or images change
    if (isOpen && stagedImages.length === 2) {
      setPersonImage(stagedImages[0]);
      setClothingImage(stagedImages[1]);
    }
  }, [isOpen, stagedImages]);

  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); // Animation duration
  }, [onClose]);

  const handleSwap = useCallback(() => {
    setPersonImage(clothingImage);
    setClothingImage(personImage);
  }, [personImage, clothingImage]);

  const handleConfirm = useCallback(() => {
    if (personImage && clothingImage) {
      onConfirm(personImage, clothingImage);
      handleClose(); // Close modal after confirming
    }
  }, [personImage, clothingImage, onConfirm, handleClose]);
  
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !personImage || !clothingImage) return null;

  const modalBgClass = 'bg-appBg';
  const headerBgClass = 'bg-appHeaderBg';
  const textColorClass = 'text-primaryText';
  const borderColorClass = 'border-borderColor';
  const buttonHoverBgClass = 'hover:bg-gray-700';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 modal-backdrop ${isAnimatingOut ? 'animate-out' : ''}`} onClick={handleClose}>
      <div className={`relative ${modalBgClass} rounded-lg shadow-2xl border ${borderColorClass} w-full md:w-4/5 md:max-w-6xl max-h-[95vh] flex flex-col modal-content ${isAnimatingOut ? 'animate-out' : ''}`} onClick={e => e.stopPropagation()}>
        <div className={`flex justify-between items-center p-4 border-b ${borderColorClass} ${headerBgClass} rounded-t-lg`}>
          <h2 className={`text-xl font-bold text-primaryAccent`}>Confirmar Troca de Roupa</h2>
          <button onClick={handleClose} className={`p-2 rounded-full text-primaryText ${buttonHoverBgClass} transition`} aria-label="Fechar modal de troca de roupa">
            <svg className="w-6 h-6 icon-effect" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <p className="text-center text-secondaryText mb-6">Confirme qual imagem contém a pessoa e qual contém a roupa. Use o botão de troca se necessário.</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {/* Person Image Slot */}
            <div className="flex flex-col items-center gap-2">
              <label className="font-semibold text-primaryText">Pessoa</label>
              <div className={`w-48 h-48 border-2 ${borderColorClass} rounded-lg overflow-hidden flex items-center justify-center`}>
                <img src={personImage.src} alt="Pessoa" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex items-center justify-center p-4">
               <button onClick={handleSwap} className="p-3 rounded-full bg-accentBlue text-white hover:bg-blue-600 transition-transform duration-300 hover:rotate-180" aria-label="Trocar imagens">
                 <svg className="w-6 h-6 icon-effect" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M15.97 3.97a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H3a.75.75 0 010-1.5h14.69l-1.72-1.72a.75.75 0 010-1.06zm-7.94 9a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06l1.72 1.72H21a.75.75 0 010 1.5H5.03l1.72 1.72a.75.75 0 010 1.06z" clipRule="evenodd"></path></svg>
               </button>
            </div>

            {/* Clothing Image Slot */}
            <div className="flex flex-col items-center gap-2">
              <label className="font-semibold text-primaryText">Roupa</label>
              <div className={`w-48 h-48 border-2 ${borderColorClass} rounded-lg overflow-hidden flex items-center justify-center`}>
                <img src={clothingImage.src} alt="Roupa" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
        
        <div className={`flex justify-end items-center p-4 border-t ${borderColorClass} rounded-b-lg`}>
            <button onClick={handleClose} className={`px-6 py-2 bg-inactiveButtonBg text-primaryText rounded-full font-semibold text-base hover:bg-gray-600 transition mr-4`}>
                Cancelar
            </button>
            <button onClick={handleConfirm} className="px-6 py-2 bg-primaryAccent text-white rounded-full font-semibold text-base hover:bg-primaryAccentDark transition">
                Confirmar Troca
            </button>
        </div>
      </div>
    </div>
  );
};

export default ClothingSwapModal;
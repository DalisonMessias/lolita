import React, { useState, useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDarkMode: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDarkMode,
}) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300);
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen && !isAnimatingOut) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 modal-backdrop ${isAnimatingOut ? 'animate-out' : ''}`}
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirmation-title"
    >
      <div
        className={`relative bg-appBg rounded-lg shadow-2xl border border-borderColor w-full max-w-md modal-content ${isAnimatingOut ? 'animate-out' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="confirmation-title" className="text-xl font-title text-primaryText mb-2">{title}</h2>
          <p className="text-secondaryText text-sm">{message}</p>
        </div>
        <div className="flex justify-end items-center p-4 bg-inputBg border-t border-borderColor rounded-b-lg gap-3">
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-inactiveButtonBg text-primaryText rounded-full font-title text-base hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-red-600 text-white rounded-full font-title text-base hover:bg-red-700 transition"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

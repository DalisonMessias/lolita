import React, { useCallback, useRef } from 'react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  onCameraSelect: () => void;
  isLoading: boolean;
  isDarkMode: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, onCameraSelect, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onImageSelected(event.dataTransfer.files[0]);
    }
  }, [onImageSelected]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onImageSelected(event.target.files[0]);
      event.target.value = ''; // Reset for same file selection
    }
  }, [onImageSelected]);

  const handleGalleryClick = () => fileInputRef.current?.click();

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="space-y-4"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isLoading}
      />
      <button
        onClick={handleGalleryClick}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-4 p-6 bg-aiBubble rounded-lg transition-colors duration-200 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <svg className="w-8 h-8 text-primaryAccent icon-effect" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/></svg>
        <span className="text-lg font-title text-primaryText">Galeria de Fotos</span>
      </button>
      <button
        onClick={onCameraSelect}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-4 p-6 bg-aiBubble rounded-lg transition-colors duration-200 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <svg className="w-8 h-8 text-accentBlue icon-effect" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
        <span className="text-lg font-title text-primaryText">Câmera</span>
      </button>
    </div>
  );
};

export default ImageUploader;

import React, { useState, useCallback, useEffect } from 'react';
import { EnhancedImageHistoryEntry, ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { drawWatermarkOnCanvas } from '../utils/watermark';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageEntry: EnhancedImageHistoryEntry;
  filterStyle: string;
  isDarkMode: boolean;
  addMessage: (message: ChatMessage) => void;
}

const socialPlatforms = [
  { name: 'Instagram', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2c-2.717 0-3.056.01-4.122.06-1.065.05-1.79.2-2.428.465-.66.275-1.155.64-1.64 1.125-.484.485-.85 1.005-1.125 1.64-.265.635-.415 1.36-.465 2.428C2.01 8.944 2 9.283 2 12s.01 3.056.06 4.122c.05 1.065.2 1.79.465 2.428.275.66.64 1.155 1.125 1.64.485.484 1.005.85 1.64 1.125.635.265 1.36.415 2.428.465C8.944 21.99 9.283 22 12 22s3.056-.01 4.122-.06c1.065-.05 1.79-.2 2.428-.465.66-.275 1.155-.64 1.64-1.125.484-.485.85-1.005-1.125-1.64.265-.635.415-1.36.465-2.428.06-1.065.06-1.404.06-4.122s-.01-3.056-.06-4.122c-.05-1.065-.2-1.79-.465-2.428a4.885 4.885 0 00-1.125-1.64c-.485-.484-1.005-.85-1.64-1.125-.635-.265-1.36-.415-2.428-.465C15.056 2.01 14.717 2 12 2zm0 1.62c2.673 0 2.986.01 4.04.058 1.005.045 1.503.208 1.83.33.365.132.618.31.88.575.26.26.44.51.575.88.122.325.285.825.33 1.83.05 1.054.058 1.367.058 4.04s-.01 2.986-.058 4.04c-.045 1.005-.208 1.503-.33 1.83-.132.365-.31.618-.575.88-.26.26-.51.44-.88-.575-.325.122-.825.285-1.83.33-1.054.05-1.367.058-4.04.058s-2.986-.01-4.04-.058c-1.005-.045-1.503-.208-1.83-.33-.365-.132-.618-.31-.88-.575-.26-.26-.44-.51-.88-.575-.122-.325-.285-.825-.33-1.83-.05-1.054-.058-1.367-.058-4.04s.01-2.986.058-4.04c.045-1.005.208 1.503.33-1.83.132.365.31.618.575-.88.26-.26.51-.44.88-.575.325-.122.825-.285-1.83.33C9.014 3.63 9.327 3.62 12 3.62zM12 7.18c-2.65 0-4.82 2.17-4.82 4.82s2.17 4.82 4.82 4.82 4.82-2.17 4.82-4.82S14.65 7.18 12 7.18zm0 8.04c-1.78 0-3.22-1.44-3.22-3.22s1.44-3.22 3.22-3.22 3.22 1.44 3.22 3.22S13.78 15.22 12 15.22zm4.335-8.16a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"/></svg>, url: 'https://www.instagram.com/' },
  { name: 'WhatsApp', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M16.75 13.96c.25.71-1.21 1.63-1.63 1.83-.42.2-1.03.41-1.28.41-.25,0-.62,0-1.13-.2-.5-.2-1.51-.51-2.41-1.31-.9-.8-1.51-1.83-1.61-2.03-.1-.2-.51-1.02-.51-1.32,0-.31.1-.51.3-.71.2-.2.4-.2.6-.2.19,0,.39,0,.58.31.19.3.62.82.72.92.1.1.1.2.01.4-.09.2-.1.3-.2.4-.1.1-.2.2-.1.3.1.2.5.82 1.01 1.32.5.51 1.11.92 1.31 1.02.1.1.3.09.4-.01.1-.1.3-.2.4-.3.1-.1.3-.1.4,0,.1,0,.61.52.81.72zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>, url: 'https://api.whatsapp.com/send' },
  { name: 'Facebook', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17,3H7C4.791,3,3,4.791,3,7v10c0,2.209,1.791,4,4,4h5.621v-6.961h-2.343v-2.725h2.343V9.309 c0-2.324,1.421-3.591,3.495-3.591c0.699-0.002,1.397,0.034,2.092,0.105v2.43h-1.428c-1.13,0-1.35,0.534-1.35,1.322v1.735h2.666 l-0.347,2.725h-2.319V21H17c2.209,0,4-1.791,4-4V7C21,4.791,19.209,3,17,3z"/></svg>, url: 'https://www.facebook.com/sharer/sharer.php' },
  { name: 'X', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, url: 'https://twitter.com/intent/tweet' },
  { name: 'Telegram', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.944,2A9.944,9.944,0,0,0,2,11.944a9.945,9.945,0,0,0,9.944,9.944A9.945,9.945,0,0,0,21.888,11.944,9.944,9.944,0,0,0,11.944,2Zm5.041,7.2L15,14.613c-.278,1.207-.8,1.588-1.84,1.012l-3.328-2.458-1.6,1.543a.633.633,0,0,1-.5.223l.235-3.394,6.486-6.075c.278-.254-.025-.4-.388-.242l-8.01,5.013L3.6,10.051s-.812-.277-.812-.893c0-.435.526-.581.526-.581L15.9,4.456s.927-.37,1.085,0C17.165,4.734,16.985,6.039,16.985,6.039Z"/></svg>, url: 'https://t.me/share/url' },
  { name: 'Pinterest', icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12,2C6.477,2,2,6.477,2,12c0,4.237,2.633,7.855,6.357,9.262c-0.073-0.702-0.005-1.54.187-2.18 c0.211-0.71,1.334-5.611,1.334-5.611s-0.34-0.679-0.34-1.681c0-1.58,0.916-2.76,2.058-2.76c0.975,0,1.438,0.732,1.438,1.606 c0,0.975-0.619,2.431-0.938,3.784c-0.269,1.139,0.563,2.067,1.688,2.067c2.02,0,3.563-2.14,3.563-5.228 c0-2.772-1.992-4.755-4.904-4.755c-3.29,0-5.2,2.47-5.2,4.953c0,0.975,0.363,2.02,0.838,2.592c0.092,0.113,0.112,0.213,0.082,0.329 c-0.082,0.329-0.269,1.088-0.313,1.262c-0.05,0.187-0.187,0.232-0.363,0.112c-1.058-0.655-1.725-2.613-1.725-3.831 c0-2.22,1.613-4.228,4.717-4.228c2.51,0,4.425,1.788,4.425,4.072c0,2.525-1.5,4.555-3.594,4.555c-0.712,0-1.387-0.375-1.612-0.812 c0,0-0.338,1.35-0.425,1.681C9.155,20.061,8.745,21,8.105,21.321C9.362,21.752,10.65,22,12,22c5.523,0,10-4.477,10-10 S17.523,2,12,2z"/></svg>, url: 'https://pinterest.com/pin/create/button/' },
];

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  imageEntry,
  filterStyle,
  isDarkMode,
  addMessage,
}) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [caption, setCaption] = useState<string>('');
  const [shareStatus, setShareStatus] = useState<'idle' | 'preparing' | 'sharing' | 'success' | 'error'>('idle');
  const [shareErrorMessage, setShareErrorMessage] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 300); // Corresponds to animation duration
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setCaption(`Imagem aprimorada com IA! Prompt: "${imageEntry.promptUsed || 'nenhum'}" #AprimoradorDeFotosIA`);
      setShareStatus('idle');
      setShareErrorMessage(null);
    }
  }, [isOpen, imageEntry.promptUsed]);

  const generateFilteredImageBlob = useCallback(async (): Promise<Blob | null> => {
    setShareStatus('preparing');
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageEntry.enhancedImageSrc;
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Não foi possível obter o contexto 2D do canvas.');
      
      ctx.filter = filterStyle;
      ctx.drawImage(img, 0, 0);

      // Apply watermark on top of filters
      ctx.filter = 'none';
      await drawWatermarkOnCanvas(canvas);
      
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, imageEntry.imageMimeType || 'image/png', 0.95));
      if (!blob) throw new Error('Falha ao gerar o Blob da imagem.');
      setShareStatus('idle');
      return blob;
    } catch (error) {
      const msg = `Erro ao preparar imagem: ${error instanceof Error ? error.message : 'Desconhecido'}`;
      setShareStatus('error');
      setShareErrorMessage(msg);
      addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: msg, timestamp: new Date() });
      return null;
    }
  }, [imageEntry.enhancedImageSrc, imageEntry.imageMimeType, filterStyle, addMessage]);
  
  const handleNativeShare = useCallback(async () => {
      const blob = await generateFilteredImageBlob();
      if (!blob) return;

      setShareStatus('sharing');
      
      const file = new File([blob], `aprimorada_ia.${imageEntry.imageMimeType?.split('/')[1] || 'png'}`, { type: blob.type });
      const shareData: ShareData = {
          files: [file],
          title: 'Imagem Aprimorada com IA',
          text: caption,
      };

      try {
          if (navigator.share && navigator.canShare(shareData)) {
              await navigator.share(shareData);
              setShareStatus('success');
              addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Imagem partilhada com sucesso!`, timestamp: new Date() });
          } else {
              throw new Error('A partilha nativa de ficheiros não é suportada neste navegador. Tente transferir e partilhar manualmente.');
          }
      } catch (error) {
          const msg = error instanceof Error && error.name !== 'AbortError' ? error.message : 'Partilha cancelada ou falhou.';
          setShareStatus('error');
          setShareErrorMessage(msg);
          if (error instanceof Error && error.name !== 'AbortError') {
              addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Falha na partilha: ${msg}`, timestamp: new Date() });
          }
      }
  }, [generateFilteredImageBlob, imageEntry.imageMimeType, caption, addMessage]);
  
  const handleSocialShare = (platform: { name: string, url: string }) => {
    const appUrl = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(caption);
    let shareUrl = '';
    
    switch (platform.name) {
        case 'Instagram':
            shareUrl = platform.url; // Just open the site
            break;
        case 'WhatsApp':
            shareUrl = `${platform.url}?text=${text}%20${appUrl}`;
            break;
        case 'Facebook':
            shareUrl = `${platform.url}?u=${appUrl}&quote=${text}`;
            break;
        case 'X':
            shareUrl = `${platform.url}?text=${text}&url=${appUrl}`;
            break;
        case 'Telegram':
            shareUrl = `${platform.url}?url=${appUrl}&text=${text}`;
            break;
        case 'Pinterest':
             shareUrl = `${platform.url}?url=${appUrl}&description=${text}`;
            break;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
        addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `A abrir interface de partilha do ${platform.name}...`, timestamp: new Date() });
    }
  };


  const handleCopyImage = useCallback(async () => {
    const blob = await generateFilteredImageBlob();
    if (!blob) return;
    try {
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
        ]);
        addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: 'Imagem copiada para a área de transferência!', timestamp: new Date() });
    } catch (error) {
        const msg = `Falha ao copiar imagem: ${error instanceof Error ? error.message : 'Desconhecido'}. Tente transferir.`;
        addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: msg, timestamp: new Date() });
    }
  }, [generateFilteredImageBlob, addMessage]);


  const handleCopyCaption = useCallback(() => {
    navigator.clipboard.writeText(caption).then(() => {
      addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: 'Legenda copiada para a área de transferência!', timestamp: new Date() });
    }).catch(err => {
      addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Falha ao copiar legenda: ${err.message}`, timestamp: new Date() });
    });
  }, [caption, addMessage]);
  
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: 'Link do aplicativo copiado!', timestamp: new Date() });
    }).catch(err => {
        addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Falha ao copiar o link: ${err.message}`, timestamp: new Date() });
    });
  }, [addMessage]);

  if (!isOpen) return null;

  const modalBgClass = 'bg-appBg';
  const headerBgClass = 'bg-appHeaderBg';
  const textColorClass = 'text-primaryText';
  const borderColorClass = 'border-borderColor';
  const inputBgClass = 'bg-inputBg';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 modal-backdrop ${isAnimatingOut ? 'animate-out' : ''}`} onClick={handleClose}>
      <div className={`relative ${modalBgClass} rounded-lg shadow-2xl border ${borderColorClass} w-full md:w-4/5 md:max-w-6xl max-h-[95vh] flex flex-col modal-content ${isAnimatingOut ? 'animate-out' : ''}`} onClick={e => e.stopPropagation()}>
        <div className={`flex justify-between items-center p-4 border-b ${borderColorClass} ${headerBgClass} rounded-t-lg`}>
          <h2 className={`text-xl font-title text-primaryAccent`}>Partilhar Imagem</h2>
          <button onClick={handleClose} className={`p-2 rounded-full text-primaryText hover:bg-gray-700 transition`} aria-label="Fechar modal de partilha">
            <svg className="w-6 h-6 icon-effect" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="mb-4 flex flex-col items-center">
            <h3 className={`text-lg font-title ${textColorClass} mb-2`}>Pré-visualização Final</h3>
            <div className={`w-full max-w-sm border ${borderColorClass} rounded-lg overflow-hidden`}>
              <img src={imageEntry.enhancedImageSrc} alt="Pré-visualização para partilha" className="w-full h-auto object-contain" style={{ filter: filterStyle }} />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="share-caption" className={`block ${textColorClass} text-sm font-medium mb-1`}>Legenda</label>
            <textarea id="share-caption" className={`w-full p-2 rounded-lg ${inputBgClass} ${textColorClass} border ${borderColorClass} focus:outline-none focus:ring-1 focus:ring-primaryAccent resize-y custom-scrollbar`} rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Adicione uma legenda..."></textarea>
            <div className="flex gap-2 mt-2 flex-wrap">
                <button onClick={handleCopyCaption} className={`px-4 py-2 bg-inactiveButtonBg text-primaryText rounded-full font-title text-sm hover:bg-gray-600 transition`}>Copiar Legenda</button>
                <button onClick={handleCopyImage} className={`px-4 py-2 bg-inactiveButtonBg text-primaryText rounded-full font-title text-sm hover:bg-gray-600 transition`}>Copiar Imagem</button>
                <button onClick={handleCopyLink} className={`px-4 py-2 bg-inactiveButtonBg text-primaryText rounded-full font-title text-sm hover:bg-gray-600 transition`}>Copiar Link</button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className={`block ${textColorClass} text-sm font-medium mb-2`}>Partilhar em:</label>
            <div className="flex justify-center gap-4 flex-wrap">
              {socialPlatforms.map(platform => (
                <button 
                  key={platform.name} 
                  onClick={() => handleSocialShare(platform)}
                  className="flex flex-col items-center gap-1 text-secondaryText hover:text-primaryText transition-colors"
                  aria-label={`Partilhar no ${platform.name}`}
                >
                  <span className="w-12 h-12 flex items-center justify-center bg-inputBg rounded-full border border-borderColor group-hover:border-accentBlue">
                    {platform.icon}
                  </span>
                  <span className="text-xs">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>

           <p className="text-xs text-secondaryText text-center my-4">A partilha de ficheiros depende do seu navegador e sistema operativo. Para o Instagram, recomendamos transferir a imagem e publicá-la através da aplicação móvel.</p>

          <div className="flex flex-col gap-3">
            <button onClick={handleNativeShare} className="flex items-center justify-center gap-2 w-full p-3 rounded-full bg-accentBlue text-white font-title hover:bg-blue-700 transition" disabled={shareStatus === 'sharing' || shareStatus === 'preparing'}>
              <svg className="w-5 h-5 icon-effect" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path></svg>
              Partilhar...
            </button>
          </div>

          {(shareStatus === 'preparing' || shareStatus === 'sharing') && (
            <div className={`mt-4 p-3 rounded-lg flex items-center justify-center bg-blue-900 text-blue-200`}><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></span>{shareStatus === 'preparing' ? 'A preparar imagem...' : `A partilhar...`}</div>
          )}
          {shareStatus === 'success' && (
            <div className={`mt-4 p-3 rounded-lg flex items-center justify-center bg-green-800 text-green-200`}><svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>Partilhado com sucesso!</div>
          )}
          {shareStatus === 'error' && shareErrorMessage && (
            <div className={`mt-4 p-3 rounded-lg flex flex-col items-center justify-center bg-red-900 text-red-200`}>
                <span className="flex items-center mb-1"><svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>Falha na partilha:</span>
                <p className="text-sm text-center">{shareErrorMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

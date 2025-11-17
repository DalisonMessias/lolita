import React, { useState, useRef, useEffect } from 'react';

interface AppMenuProps {
    onNavigateToGallery: () => void;
    onNavigateToConversations: () => void;
    onNavigateToDocumentation: () => void;
    onClearData: () => void;
}

const AppMenu: React.FC<AppMenuProps> = ({ onNavigateToGallery, onNavigateToConversations, onNavigateToDocumentation, onClearData }) => {
    return (
        <div className="absolute top-full right-0 mt-2 w-56 bg-appHeaderBg rounded-md shadow-lg border border-borderColor z-50">
            <div className="py-1">
                 <button
                    onClick={onNavigateToConversations}
                    className="w-full text-left px-4 py-2 text-sm text-primaryText hover:bg-inputBg flex items-center gap-3 transition-colors"
                    role="menuitem"
                >
                    <svg className="w-5 h-5 text-secondaryText" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    Conversas Salvas
                </button>
                <button
                    onClick={onNavigateToGallery}
                    className="w-full text-left px-4 py-2 text-sm text-primaryText hover:bg-inputBg flex items-center gap-3 transition-colors"
                    role="menuitem"
                >
                    <svg className="w-5 h-5 text-secondaryText" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Galeria de Imagens
                </button>
                <button
                    onClick={onNavigateToDocumentation}
                    className="w-full text-left px-4 py-2 text-sm text-primaryText hover:bg-inputBg flex items-center gap-3 transition-colors"
                    role="menuitem"
                >
                    <svg className="w-5 h-5 text-secondaryText" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                    Sobre a IA Generativa
                </button>
                <div className="border-t border-borderColor my-1"></div>
                <button
                    onClick={onClearData}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/50 flex items-center gap-3 transition-colors"
                    role="menuitem"
                >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Limpar Dados
                </button>
            </div>
        </div>
    );
};

interface AppHeaderProps {
  appName: string;
  appDescription: string;
  isDarkMode: boolean;
  currentView: 'chat' | 'gallery' | 'conversations' | 'documentation';
  onNavigateToChat: () => void;
  onNavigateToGallery: () => void;
  onNavigateToConversations: () => void;
  onNavigateToDocumentation: () => void;
  onNewChat: () => void;
  onClearData: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
    appName, appDescription, isDarkMode, currentView, 
    onNavigateToChat, onNavigateToGallery, onNavigateToConversations, onNavigateToDocumentation, onNewChat, onClearData 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
              setIsMenuOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearDataClick = () => {
    onClearData();
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-appHeaderBg z-30 shadow-sm border-b border-borderColor">
      <div className="w-full max-w-sm md:max-w-3xl lg:max-w-4xl mx-auto p-3 flex flex-row items-center justify-between gap-3">
        {currentView !== 'chat' ? (
            <button onClick={onNavigateToChat} className="p-2 rounded-full text-secondaryText hover:bg-gray-700 transition" aria-label="Voltar ao Chat">
                <svg className="w-6 h-6 icon-effect" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
        ) : (
            <button onClick={onNewChat} className="p-2 rounded-full text-secondaryText hover:bg-gray-700 transition" aria-label="Nova Conversa (Home)">
                <svg className="w-6 h-6 icon-effect" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg>
            </button>
        )}

        <div className="flex items-center gap-3 text-center cursor-pointer" onClick={onNavigateToChat}>
          <img
            src="https://raw.githubusercontent.com/DalisonMessias/cdn.rabbit.gg/main/assets/logo-revo.png"
            alt={`${appName} logo`}
            className="w-12 h-12"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-title text-primaryText text-left">{appName}</h1>
            <p className="text-xs text-secondaryText text-left">{appDescription}</p>
          </div>
        </div>

        <div ref={menuRef} className="relative">
            <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-2 rounded-full text-secondaryText hover:bg-gray-700 transition" aria-label="Abrir menu" aria-haspopup="true" aria-expanded={isMenuOpen}>
               <svg className="w-6 h-6 icon-effect" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            {isMenuOpen && (
                <AppMenu
                    onNavigateToConversations={() => {
                        onNavigateToConversations();
                        setIsMenuOpen(false);
                    }}
                    onNavigateToGallery={() => {
                        onNavigateToGallery();
                        setIsMenuOpen(false);
                    }}
                    onNavigateToDocumentation={() => {
                        onNavigateToDocumentation();
                        setIsMenuOpen(false);
                    }}
                    onClearData={handleClearDataClick}
                />
            )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
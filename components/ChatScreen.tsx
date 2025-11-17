import React from 'react';
import { ChatMessage } from '../types';
import { PromptSuggestions } from './PromptSuggestions';
import ChatMessageDisplay from './ChatMessageDisplay';

interface ChatScreenProps {
  messages: ChatMessage[];
  showIntroContent: boolean;
  onPromptSuggestionClick: (prompt: string) => void;
  onStartChat: () => void;
  isDarkMode: boolean;
  onViewEnhancedImage: (historyId: string) => void;
  onOpenClothingSwapModal: () => void;
  onOpenFaceSwapModal: () => void;
  onOpenFaceTreatmentModal: () => void;
  onOpenAnimateImageModal: () => void;
  onOpenChangeBackgroundModal: () => void;
  onOpenNativeEditModal: () => void;
  onOpenMagicEraserModal: () => void;
  onOpenRestorePhotoModal: () => void;
  onOpenStyleTransferModal: () => void;
  onOpenAgeChangeModal: () => void;
  onRegenerate: (messageId: string) => void;
  onViewImage: (src: string) => void;
  onOpenCreativeToolsModal: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ 
  messages,
  showIntroContent,
  onPromptSuggestionClick, 
  onStartChat,
  isDarkMode, 
  onViewEnhancedImage, 
  onOpenClothingSwapModal, 
  onOpenFaceSwapModal,
  onOpenFaceTreatmentModal,
  onOpenAnimateImageModal,
  onOpenChangeBackgroundModal,
  onOpenNativeEditModal,
  onOpenMagicEraserModal,
  onOpenRestorePhotoModal,
  onOpenStyleTransferModal,
  onOpenAgeChangeModal,
  onRegenerate,
  onViewImage,
  onOpenCreativeToolsModal
}) => {

  return (
    <div className="flex flex-col h-full w-full">
      {showIntroContent ? (
        <div className="flex-1 py-2">
          <PromptSuggestions 
            onPromptSuggestionClick={onPromptSuggestionClick} 
            isDarkMode={isDarkMode} 
          />
          
          <div className="w-full max-w-sm md:max-w-3xl lg:max-w-4xl mx-auto px-4 py-6 border-t border-borderColor mt-4">
            <h2 className="text-xl font-title mb-4 text-primaryText">Ferramentas Criativas</h2>
            <p className="text-sm text-secondaryText mb-4 -mt-2 text-center">
              As nossas ferramentas de IA estão em fase Beta. Os resultados podem variar e nem sempre ser perfeitos.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Conversar com a IA */}
              <div className="relative group">
                <button
                  onClick={onStartChat}
                  className="w-full h-full text-left p-4 bg-inputBg rounded-lg border border-borderColor flex items-center gap-4 transition-colors duration-200 hover:bg-gray-700 hover:border-gray-500"
                >
                  <svg className="w-6 h-6 text-accentBlue icon-effect flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>
                  <div className="flex-1">
                    <h3 className="font-title text-primaryText">Conversar com a IA</h3>
                    <p className="text-xs text-secondaryText mt-1">Comece um novo chat com o assistente de IA.</p>
                  </div>
                </button>
              </div>

               {/* Editar uma Foto Nativa */}
               <div className="relative group">
                <button
                  onClick={onOpenNativeEditModal}
                  className="w-full h-full text-left p-4 bg-inputBg rounded-lg border border-borderColor flex items-center gap-4 transition-colors duration-200 hover:bg-gray-700 hover:border-gray-500"
                >
                  <svg className="w-6 h-6 text-accentBlue icon-effect flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
                  <div className="flex-1">
                    <h3 className="font-title text-primaryText">Editar uma Foto</h3>
                    <p className="text-xs text-secondaryText mt-1">Carregue e edite uma foto do seu dispositivo.</p>
                  </div>
                </button>
              </div>

              {/* Animar Imagem com Veo */}
              <div className="relative group">
                <button
                  onClick={onOpenAnimateImageModal}
                  className="w-full h-full text-left p-4 bg-inputBg rounded-lg border border-borderColor flex items-center gap-4 transition-colors duration-200 hover:bg-gray-700 hover:border-gray-500"
                >
                  <svg className="w-6 h-6 text-accentBlue icon-effect flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.712 1.295 2.573 0 3.286L7.279 20.99c-1.25.72-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd"></path></svg>
                  <div className="flex-1">
                    <h3 className="font-title text-primaryText">Animar Imagem com Veo</h3>
                    <p className="text-xs text-secondaryText mt-1">Transforme uma foto estática num vídeo curto e dinâmico.</p>
                  </div>
                </button>
              </div>

              {/* Remoção Mágica de Objetos */}
              <div className="relative group">
                <button
                  onClick={onOpenMagicEraserModal}
                  className="w-full h-full text-left p-4 bg-inputBg rounded-lg border border-borderColor flex items-center gap-4 transition-colors duration-200 hover:bg-gray-700 hover:border-gray-500"
                >
                  <svg className="w-6 h-6 text-accentBlue icon-effect flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M2.5 2.5a.5.5 0 01.5.5v14a.5.5 0 01-.5.5H2a.5.5 0 01-.5-.5V3a.5.5 0 01.5-.5h.5zM3 3v14h14V3H3zm2.5 1.5a.5.5 0 000 1h8a.5.5 0 000-1h-8zM5.5 7a.5.5 0 000 1h8a.5.5 0 000-1h-8zm0 3a.5.5 0 000 1h8a.5.5 0 000-1h-8zm0 3a.5.5 0 000 1h4a.5.5 0 000-1h-4z" clipRule="evenodd" /><path d="M14.854 3.146a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L7.5 9.793l6.646-6.647a.5.5 0 01.708 0z" /></svg>
                  <div className="flex-1">
                    <h3 className="font-title text-primaryText">Remoção Mágica de Objetos</h3>
                    <p className="text-xs text-secondaryText mt-1">Pinte sobre um objeto para removê-lo da imagem.</p>
                  </div>
                </button>
              </div>

              {/* Restaurar Foto Antiga */}
              <div className="relative group">
                <button
                  onClick={onOpenRestorePhotoModal}
                  className="w-full h-full text-left p-4 bg-inputBg rounded-lg border border-borderColor flex items-center gap-4 transition-colors duration-200 hover:bg-gray-700 hover:border-gray-500"
                >
                  <svg className="w-6 h-6 text-accentBlue icon-effect flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M7.737 3.34a1 1 0 00-1.474-1.474L2.343 5.785a1.25 1.25 0 000 1.768l3.92 3.92a1 1 0 001.474-1.474L5.215 7.5h6.07a1 1 0 110 2H3.75a1 1 0 110-2h.586l1.25-1.25-1.25-1.25H3.75a1 1 0 110-2h.914l-.44-1.46zM12.263 16.66a1 1 0 001.474 1.474l3.92-3.92a1.25 1.25 0 000-1.768l-3.92-3.92a1 1 0 00-1.474 1.474L14.785 12.5h-6.07a1 1 0 110-2h7.5a1 1 0 110 2h-.586l-1.25 1.25 1.25 1.25h.586a1 1 0 110 2h-.914l.44 1.46z"/></svg>
                  <div className="flex-1">
                    <h3 className="font-title text-primaryText">Restaurar Foto Antiga</h3>
                    <p className="text-xs text-secondaryText mt-1">Repare, melhore a nitidez e colorize fotos antigas.</p>
                  </div>
                </button>
              </div>

              {/* Transferência de Estilo Artístico */}
              <div className="relative group">
                <button
                  onClick={onOpenStyleTransferModal}
                  className="w-full h-full text-left p-4 bg-inputBg rounded-lg border border-borderColor flex items-center gap-4 transition-colors duration-200 hover:bg-gray-700 hover:border-gray-500"
                >
                  <svg className="w-6 h-6 text-accentBlue icon-effect flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M.5 5.5A.5.5 0 011 6v8.5a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zM2 4.5A.5.5 0 012.5 5v10a.5.5 0 01-1 0V5a.5.5 0 01.5-.5zM4 3.5A.5.5 0 014.5 4v12a.5.5 0 01-1 0V4a.5.5 0 01.5-.5zM6 2.5a.5.5 0 01.5.5v14a.5.5 0 01-1 0V3a.5.5 0 01.5-.5zM8 .5a.5.5 0 01.5.5v18a.5.5 0 01-1 0V1a.5.5 0 01.5-.5zM10 .5a.5.5 0 01.5.5v18a.5.5 0 01-1 0V1a.5.5 0 01.5-.5zM12 2.5a.5.5 0 01.5.5v14a.5.5 0 01-1 0V3a.5.5 0 01.5-.5zM14 3.5a.5.5 0 01.5.5v12a.5.5 0 01-1 0V4a.5.5 0 01.5-.5zM16 4.5A.5.5 0 01.5.5v10a.5.5 0 01-1 0V5a.5.5 0 01.5-.5zM18 5.5a.5.5 0 01.5.5v8a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zM20 5.5a.5.5 0 01.5.5v8a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zM22 5.5a.5.5 0 01.5.5v8a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zM24 5.5a.5.5 0 01.5.5v8a.5.5 0 01-1 0V6a.5.5 0 01.5-.5z"/></svg>
                  <div className="flex-1">
                    <h3 className="font-title text-primaryText">Transferência de Estilo Artístico</h3>
                    <p className="text-xs text-secondaryText mt-1">Aplique o estilo de uma pintura famosa à sua foto.</p>
                  </div>
                </button>
              </div>
              
              {/* Trocar Roupa */}
              <div className="relative group">
                <button
                  onClick={onOpenClothingSwapModal}
                  className="w-full h-full text-left p-4 bg-inputBg rounded-lg border border-borderColor flex items-center gap-4 transition-colors duration-200 hover:bg-gray-700 hover:border-gray-500"
                >
                  <svg className="w-6 h-6 text-accentBlue icon-effect flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M15.97 3.97a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H3a.75.75 0 010-1.5h14.69l-1.72-1.72a.75.75 0 010-1.06zm-7.94 9a.75.75 0 010 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06l1.72 1.72H21a.75.75 0 010 1.5H5.03l1.72 1.72a.75.75 0 010 1.06z" clipRule="evenodd"></path></svg>
                  <div className="flex-1">
                    <h3 className="font-title text-primaryText">Trocar Roupa</h3>
                    <p className="text-xs text-secondaryText mt-1">Vista uma pessoa com a roupa de outra imagem.</p>
                  </div>
                </button>
              </div>

              {/* Trocar Rosto */}
              <div className="relative group">
                <button
                  onClick={onOpenFaceSwapModal}
                  className="w-full h-full text-left p-4 bg-inputBg rounded-lg border border-borderColor flex items-center gap-4 transition-colors duration-200 hover:bg-gray-700 hover:border-gray-500"
                >
                  <svg className="w-6 h-6 text-accentBlue icon-effect flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M15.182 2.968a.75.75 0 01.936-.448l4.5 2.25a.75.75 0 010 1.334l-4.5 2.25a.75.75 0 11-.472-1.334L19.04 6 15.654 4.3a.75.75 0 01-.472-.884zM4.5 2.5a.75.75 0 01.936.448L8.346 6l-3.388 1.7a.75.75 0 11-.472-1.334L4.5 5.514V16.5a.75.75 0 001.5 0v-2.833a.75.75 0 011.5 0v2.833a2.25 2.25 0 01-4.5 0V5.513l-.03.015a.75.75 0 11-.472-1.334L4.5 2.5zM12.5 14.25a.75.75 0 00-1.5 0v2.833a.75.75 0 01-1.5 0V14.25a2.25 2.25 0 014.5 0zM19.5 15a.75.75 0 01.936.448l2.914 5.828a.75.75 0 11-1.342.67l-2.914-5.828a.75.75 0 01.406-1.118zM14.094 21.418a.75.75 0 11-1.342-.67l2.914-5.828a.75.75 0 111.342.67l-2.914 5.828z" clipRule="evenodd"></path></svg>
                  <div className="flex-1">
                    <h3 className="font-title text-primaryText">Trocar Rosto</h3>
                    <p className="text-xs text-secondaryText mt-1">Transplante o rosto de uma imagem para outra.</p>
                  </div>
                </button>
              </div>

              {/* Tratamento de Rosto */}
               <div className="relative group">
                <button
                  onClick={onOpenFaceTreatmentModal}
                  className="w-full h-full text-left p-4 bg-inputBg rounded-lg border border-borderColor flex items-center gap-4 transition-colors duration-200 hover:bg-gray-700 hover:border-gray-500"
                >
                  <svg className="w-6 h-6 text-accentBlue icon-effect flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM7.758 6.697a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.06l1.591-1.59z" /></svg>
                  <div className="flex-1">
                    <h3 className="font-title text-primaryText">Tratamento de Pele e Rosto</h3>
                    <p className="text-xs text-secondaryText mt-1">Suavize a pele e remova imperfeições.</p>
                  </div>
                </button>
              </div>

              {/* Envelhecimento/Rejuvenescimento */}
              <div className="relative group">
                <button
                  onClick={onOpenAgeChangeModal}
                  className="w-full h-full text-left p-4 bg-inputBg rounded-lg border border-borderColor flex items-center gap-4 transition-colors duration-200 hover:bg-gray-700 hover:border-gray-500"
                >
                  <svg className="w-6 h-6 text-accentBlue icon-effect flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path><path d="M16.707 9.293a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L14.586 10l-1.293-1.293a1 1 0 011.414-1.414l2 2z"></path><path d="M3.293 9.293a1 1 0 011.414 0L6 10.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z"></path></svg>
                  <div className="flex-1">
                    <h3 className="font-title text-primaryText">Envelhecimento/Rejuvenescimento</h3>
                    <p className="text-xs text-secondaryText mt-1">Ajuste a idade da pessoa na foto.</p>
                  </div>
                </button>
              </div>

              {/* Alterar Fundo */}
              <div className="relative group">
                <button
                  onClick={onOpenChangeBackgroundModal}
                  className="w-full h-full text-left p-4 bg-inputBg rounded-lg border border-borderColor flex items-center gap-4 transition-colors duration-200 hover:bg-gray-700 hover:border-gray-500"
                >
                  <svg className="w-6 h-6 text-accentBlue icon-effect flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25-2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5a.75.75 0 00.75-.75v-1.94l-2.03-2.03a3.75 3.75 0 00-5.304 0L9.47 16.061l-4.183-4.183a1.125 1.125 0 00-1.59 0l-1.59 1.59zm14.25-8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>
                  <div className="flex-1">
                    <h3 className="font-title text-primaryText">Alterar Fundo</h3>
                    <p className="text-xs text-secondaryText mt-1">Substitua o fundo da sua foto por qualquer cenário.</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 w-full max-w-sm md:max-w-3xl lg:max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessageDisplay
              key={message.id}
              message={message}
              isDarkMode={isDarkMode}
              onViewEnhancedImage={onViewEnhancedImage}
              onRegenerate={onRegenerate}
              onViewImage={onViewImage}
              onOpenCreativeToolsModal={onOpenCreativeToolsModal}
              onOpenClothingSwapModal={onOpenClothingSwapModal}
              onOpenFaceSwapModal={onOpenFaceSwapModal}
              onOpenFaceTreatmentModal={onOpenFaceTreatmentModal}
              onOpenAnimateImageModal={onOpenAnimateImageModal}
              onOpenChangeBackgroundModal={onOpenChangeBackgroundModal}
              onOpenNativeEditModal={onOpenNativeEditModal}
              onOpenMagicEraserModal={onOpenMagicEraserModal}
              onOpenRestorePhotoModal={onOpenRestorePhotoModal}
              onOpenStyleTransferModal={onOpenStyleTransferModal}
              onOpenAgeChangeModal={onOpenAgeChangeModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatScreen;

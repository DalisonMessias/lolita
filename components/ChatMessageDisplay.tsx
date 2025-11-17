import React from 'react';
import { ChatMessage } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import AudioPlayer from './AudioPlayer';
import WatermarkedImage from './WatermarkedImage';

interface ChatMessageDisplayProps {
  message: ChatMessage;
  isDarkMode: boolean;
  onViewEnhancedImage?: (historyId: string) => void;
  onRegenerate?: (messageId: string) => void;
  onViewImage?: (src: string) => void;
  onOpenCreativeToolsModal?: () => void;
}

const ChatMessageDisplay: React.FC<ChatMessageDisplayProps> = ({ 
  message, 
  isDarkMode, 
  onViewEnhancedImage, 
  onRegenerate,
  onViewImage,
  onOpenCreativeToolsModal
}) => {
  const isUser = message.sender === 'user';
  const bubbleClasses = isUser ? 'bg-userBubble ml-auto' : 'bg-aiBubble mr-auto';
  const textColor = 'text-primaryText';

  const isEnhancedAndClickable = message.type === 'image-enhanced' && message.historyId && onViewEnhancedImage;
  const isUploadAndClickable = message.type === 'image-upload' && message.imageUrls && onViewImage;
  const canRegenerate = message.sender === 'ai' && (message.type === 'text' || message.type === 'image-enhanced' || message.type === 'audio') && onRegenerate;

  const buttonTag = '[CHOOSE_TOOL_BUTTON]';
  const hasToolButton = message.sender === 'ai' && message.content?.includes(buttonTag) && onOpenCreativeToolsModal;

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        {!isUser && canRegenerate && (
            <button 
                onClick={() => onRegenerate(message.id)}
                className="p-1.5 rounded-full text-secondaryText hover:bg-aiBubble hover:text-primaryText transition-colors flex-shrink-0"
                aria-label="Regenerar resposta"
            >
                <svg className="w-4 h-4 icon-effect" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>
        )}

      <div className={`max-w-[80%] rounded-xl p-3 shadow-sm ${bubbleClasses} ${textColor}`}>
        {message.type === 'loading-indicator' ? (
          <div className="flex items-center">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primaryText mr-2 opacity-75"></span>
            <span className="text-sm opacity-75">{message.content}</span>
          </div>
        ) : (
          <>
            {(message.type === 'text' || message.type === 'system-info' || message.type === 'audio') && message.content && (
              <>
                {isUser ? (
                  <p className="text-sm break-words whitespace-pre-wrap">
                    {message.content}
                  </p>
                ) : (
                  <>
                    <MarkdownRenderer 
                      text={hasToolButton ? message.content.replace(buttonTag, '') : message.content}
                      className={message.type === 'system-info' ? 'italic text-secondaryText' : ''}
                    />
                    {message.type === 'audio' && message.audioUrl && (
                        <div className="mt-3">
                            <AudioPlayer audioSrc={message.audioUrl} isDarkMode={isDarkMode} />
                        </div>
                    )}
                    {hasToolButton && (
                      <button
                        onClick={onOpenCreativeToolsModal}
                        className="mt-3 w-full text-center p-3 bg-accentBlue text-white rounded-full font-title hover:bg-blue-700 transition"
                      >
                        Escolher Ferramenta
                      </button>
                    )}
                  </>
                )}
              </>
            )}
            
            {message.type === 'image-upload' && message.imageUrls && message.imageUrls.length > 0 && (
              <div className="flex flex-col">
                {message.content && <p className="text-sm mb-2 break-words whitespace-pre-wrap">{message.content}</p>}
                <div className="flex flex-row flex-wrap justify-center gap-2 mt-1">
                  {message.imageUrls.map((url, index) => (
                     <WatermarkedImage
                        key={index}
                        src={url}
                        alt={`Upload de usuário ${index + 1}`}
                        className={`w-28 h-28 object-cover rounded-lg border border-borderColor ${isUploadAndClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                        loading="lazy"
                        onClick={() => isUploadAndClickable && onViewImage(url)}
                        containerClassName="w-28 h-28"
                      />
                  ))}
                </div>
              </div>
            )}
            
            {message.type === 'image-enhanced' && message.imageUrls && message.imageUrls.length > 0 && (
              <div className="flex flex-col">
                {message.content && <p className="text-sm mb-2 break-words whitespace-pre-wrap">{message.content}</p>}
                <WatermarkedImage
                  src={message.imageUrls[0]}
                  alt="Aprimorada"
                  className={`max-w-full h-auto rounded-lg mt-1 border border-borderColor object-contain ${isEnhancedAndClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  style={{ maxHeight: '200px' }}
                  loading="lazy"
                  onClick={() => isEnhancedAndClickable && onViewEnhancedImage(message.historyId!)}
                  containerClassName="max-w-full"
                />
              </div>
            )}

            {message.type === 'video-generated' && message.videoUrl && (
              <div className="flex flex-col">
                {message.content && <p className="text-sm mb-2 break-words whitespace-pre-wrap">{message.content}</p>}
                <video
                  src={message.videoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="max-w-full h-auto rounded-lg mt-1 border border-borderColor object-contain"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}

            <p className="text-xs text-secondaryText mt-1 text-right">
              {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessageDisplay;
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { correctSpelling } from '../services/geminiService';

interface ChatInputBarProps {
  onOpenImageModal: () => void;
  onSendMessage: (prompt: string) => void;
  isLoading: boolean;
  isDarkMode: boolean;
}

// SpeechRecognition might not be in the default window type
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const MAX_PROMPT_LENGTH = 500;
const DEFAULT_PLACEHOLDER = "Digite um prompt ou adicione uma imagem...";


const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onOpenImageModal,
  onSendMessage,
  isLoading,
  isDarkMode,
}) => {
  const [currentPromptInput, setCurrentPromptInput] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [placeholderText, setPlaceholderText] = useState(DEFAULT_PLACEHOLDER);
  const recognitionRef = useRef<any>(null);
  const [isCorrecting, setIsCorrecting] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<number | null>(null);

  // Debounced real-time correction
  useEffect(() => {
    if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
    }

    const performDebouncedCorrection = async () => {
        if (
            currentPromptInput.trim() &&
            !isListening &&
            !isCorrecting &&
            !isLoading &&
            inputRef.current &&
            inputRef.current.selectionStart === currentPromptInput.length // Only correct if cursor is at the end
        ) {
            try {
                const correctedText = await correctSpelling(currentPromptInput);
                if (correctedText !== currentPromptInput) {
                    setCurrentPromptInput(correctedText);
                }
            } catch (error) {
                console.error("Debounced correction failed:", error);
            }
        }
    };

    debounceTimeoutRef.current = window.setTimeout(performDebouncedCorrection, 1500);

    return () => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
    };
  }, [currentPromptInput, isListening, isCorrecting, isLoading]);


  const handleSend = useCallback(async () => {
    // Clear any pending debounce correction to avoid race conditions
    if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
    }
    const promptToSend = currentPromptInput.trim();
    if (promptToSend) {
      setIsCorrecting(true);
      try {
        const correctedPrompt = await correctSpelling(promptToSend);
        onSendMessage(correctedPrompt);
        setCurrentPromptInput('');
      } catch (error) {
        console.error("A correção ortográfica falhou, a enviar o texto original.", error);
        onSendMessage(promptToSend);
        setCurrentPromptInput('');
      } finally {
        setIsCorrecting(false);
      }
    }
  }, [currentPromptInput, onSendMessage]);

  const handleMicClick = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // A simple alert is fine for this context.
      alert("O seu navegador não suporta a conversão de voz para texto.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'pt-BR';
    recognition.interimResults = true;
    recognition.continuous = false; // Stop after a pause

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
          setCurrentPromptInput(prev => prev.trim() ? `${prev.trim()} ${finalTranscript}` : finalTranscript);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error("Erro no reconhecimento de voz:", event.error);
      if (event.error === 'no-speech') {
        setPlaceholderText("Nenhuma voz detetada. Tente novamente.");
        setTimeout(() => {
            setPlaceholderText(DEFAULT_PLACEHOLDER);
        }, 3000);
      } else if (event.error === 'not-allowed') {
        alert("A permissão para usar o microfone foi negada. Por favor, habilite-a nas configurações do seu navegador.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();

  }, [isListening]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);


  const isSendButtonActive = currentPromptInput.trim().length > 0;

  const charCountColorClass =
    currentPromptInput.length > MAX_PROMPT_LENGTH
      ? 'text-red-500'
      : currentPromptInput.length >= MAX_PROMPT_LENGTH * 0.8
      ? 'text-orange-500'
      : 'text-secondaryText';

  return (
    <div className="relative w-full  p-2 sm:p-4 z-20">
      <div className="w-full max-w-sm md:max-w-3xl lg:max-w-4xl mx-auto">
        <div className="relative flex items-center bg-inputBg rounded-full p-2">
          <input
            ref={inputRef}
            type="text"
            spellCheck="false"
            className="flex-grow bg-transparent border-none focus:ring-0 focus:outline-none text-primaryText placeholder-secondaryText pl-2"
            placeholder={isListening ? "A ouvir..." : placeholderText}
            value={currentPromptInput}
            onChange={(e) => setCurrentPromptInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            maxLength={MAX_PROMPT_LENGTH}
            disabled={isLoading || isListening || isCorrecting}
            aria-label="Campo de entrada de mensagem"
          />
          <button
            onClick={handleMicClick}
            className={`p-2 mx-1 ${isListening ? 'text-red-500 animate-pulse' : 'text-secondaryText hover:text-primaryAccent'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            disabled={isLoading || isCorrecting}
            aria-label={isListening ? "Parar gravação" : "Gravar voz"}
          >
            <svg className="w-6 h-6 icon-effect" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"></path>
            </svg>
          </button>
          <button
            onClick={onOpenImageModal}
            className="p-2 mx-1 text-secondaryText hover:text-accentBlue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading || isListening || isCorrecting}
            aria-label="Adicionar imagem da galeria ou câmera"
          >
             <svg className="w-6 h-6 icon-effect" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25-2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5a.75.75 0 00.75-.75v-1.94l-2.03-2.03a3.75 3.75 0 00-5.304 0L9.47 16.061l-4.183-4.183a1.125 1.125 0 00-1.59 0l-1.59 1.59zm14.25-8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>
          </button>
          <button
            onClick={handleSend}
            className={`p-2 rounded-full ${isSendButtonActive ? 'bg-accentBlue text-white hover:bg-blue-600' : 'bg-gray-700 text-secondaryText'} transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isLoading || isCorrecting || !isSendButtonActive || currentPromptInput.length > MAX_PROMPT_LENGTH || isListening}
            aria-label="Enviar mensagem"
          >
            {isLoading || isCorrecting ? (
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            ) : (
              <svg className="w-6 h-6 icon-effect" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"></path></svg>
            )}
          </button>
        </div>
        <div className={`text-right text-xs mt-1 mr-3 ${charCountColorClass}`} aria-live="polite">
          {currentPromptInput.length}/{MAX_PROMPT_LENGTH}
        </div>
      </div>
    </div>
  );
};

export default ChatInputBar;
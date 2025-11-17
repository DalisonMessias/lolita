import React, { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendToDiscordApi } from './services/discordService';
import { 
  enhanceImage, generateContent, swapClothing, swapFace, performFaceTreatment, 
  animateImageWithVeo, changeImageBackground, removeObjectFromImage, 
  restoreOldPhoto, transferImageStyle, applyAIFilter, changeAge
} from './services/geminiService';
import { AppStatus, ChatMessage, EnhancedImageHistoryEntry, ImageFilter, SocialMediaFilter, Conversation, AIFilter } from './types';
import { getSocialMediaFilterStyle } from './utils/filterUtils';
import { loadConversations, saveConversations, loadImageGallery, saveImageGallery, clearAllData, saveActiveConversationId, loadActiveConversationId } from './utils/storage';
import { loadWatermark, drawWatermarkOnCanvas } from './utils/watermark';
import AppHeader from './components/AppHeader';
import ChatScreen from './components/ChatScreen';
import ChatInputBar from './components/ChatInputBar';
import ImageSelectionModal from './components/ImageSelectionModal';
import ImageFinalizationView from './components/ImageFinalizationView';
import ClothingSwapSelectionModal from './components/ClothingSwapSelectionModal';
import FaceSwapSelectionModal from './components/FaceSwapSelectionModal';
import FaceTreatmentSelectionModal from './components/FaceTreatmentSelectionModal';
import AnimateImageModal from './components/AnimateImageModal';
import ChangeBackgroundModal from './components/ChangeBackgroundModal';
import SimpleImageViewer from './components/SimpleImageViewer';
import GalleryScreen from './components/GalleryScreen';
import ConversationsScreen from './components/ConversationsScreen';
import NativeEditSelectionModal from './components/NativeEditSelectionModal';
import ConfirmationModal from './components/ConfirmationModal';
import DocumentationScreen from './components/DocumentationScreen';
import CreativeToolsModal from './components/CreativeToolsModal';
import MagicEraserModal from './components/MagicEraserModal';
import RestorePhotoModal from './components/RestorePhotoModal';
import StyleTransferModal from './components/StyleTransferModal';
import AgeChangeModal from './components/AgeChangeModal';


console.log('App.tsx loaded.');

const createWelcomeMessage = (): ChatMessage => ({
  id: uuidv4(),
  sender: 'ai',
  type: 'system-info',
  content: 'Olá! As suas conversas e imagens geradas são guardadas automaticamente apenas neste dispositivo. Carregue uma imagem ou utilize uma sugestão para começar.',
  timestamp: new Date(),
});

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [isClothingSwapSelectionModalOpen, setIsClothingSwapSelectionModalOpen] = useState<boolean>(false);
  const [isFaceSwapModalOpen, setIsFaceSwapModalOpen] = useState<boolean>(false);
  const [isFaceTreatmentModalOpen, setIsFaceTreatmentModalOpen] = useState<boolean>(false);
  const [isAnimateImageModalOpen, setIsAnimateImageModalOpen] = useState<boolean>(false);
  const [isChangeBackgroundModalOpen, setIsChangeBackgroundModalOpen] = useState<boolean>(false);
  const [isNativeEditModalOpen, setIsNativeEditModalOpen] = useState<boolean>(false);
  const [isCreativeToolsModalOpen, setIsCreativeToolsModalOpen] = useState<boolean>(false);
  const [isMagicEraserModalOpen, setIsMagicEraserModalOpen] = useState<boolean>(false);
  const [isRestorePhotoModalOpen, setIsRestorePhotoModalOpen] = useState<boolean>(false);
  const [isStyleTransferModalOpen, setIsStyleTransferModalOpen] = useState<boolean>(false);
  const [isAgeChangeModalOpen, setIsAgeChangeModalOpen] = useState<boolean>(false);

  
  const [enhancedImageHistory, setEnhancedImageHistory] = useState<EnhancedImageHistoryEntry[]>([]);
  const [isFinalizationViewOpen, setIsFinalizationViewOpen] = useState<boolean>(false);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number | null>(null);

  const [viewingImage, setViewingImage] = useState<{src: string, entry?: EnhancedImageHistoryEntry, index?: number} | null>(null);
  const [appName, setAppName] = useState<string>('Revo Foto');
  const [appDescription, setAppDescription] = useState<string>('');
  const [currentView, setCurrentView] = useState<'chat' | 'gallery' | 'conversations' | 'documentation'>('chat');
  const [confirmationAction, setConfirmationAction] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState<boolean>(false);
  const [chatExplicitlyStarted, setChatExplicitlyStarted] = useState<boolean>(false);


  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  
  const activeConversationMessages = conversations.find(c => c.id === activeConversationId)?.messages || [];
  const showIntroContent = !chatExplicitlyStarted && activeConversationMessages.length <= 1 && (activeConversationMessages.length === 0 || activeConversationMessages[0].type === 'system-info');
  const showChatInput = currentView === 'chat' && !showIntroContent;


  useEffect(() => {
    const loadInitialData = async () => {
      // Pré-carregar a marca d'água
      loadWatermark().catch(console.error);
        
      // Carregar metadados da aplicação
      try {
        const response = await fetch('./metadata.json');
        const data = await response.json();
        const newAppName = data.name || 'Revo Foto';
        setAppName(newAppName);
        setAppDescription(data.description);
        document.title = newAppName;
      } catch (error) {
        console.error("Failed to load metadata.json:", error);
        const fallbackName = 'Revo Foto';
        setAppName(fallbackName);
        setAppDescription("Melhore e corrija as suas imagens com a IA.");
        document.title = fallbackName;
      }

      // Carregar galeria de imagens
      const gallery = await loadImageGallery();
      if (gallery) setEnhancedImageHistory(gallery);

      // Carregar conversas
      const loadedConversations = await loadConversations();
      const loadedActiveId = loadActiveConversationId();
      
      if (loadedConversations.length > 0) {
        setConversations(loadedConversations);
        if (loadedActiveId && loadedConversations.some(c => c.id === loadedActiveId)) {
          setActiveConversationId(loadedActiveId);
        } else {
          setActiveConversationId(loadedConversations[0].id);
        }
      } else {
        // Se não houver conversas, criar uma nova
        const newConversationId = uuidv4();
        const newConversation: Conversation = {
          id: newConversationId,
          title: "Nova Conversa",
          messages: [createWelcomeMessage()],
          lastModified: new Date(),
        };
        setConversations([newConversation]);
        setActiveConversationId(newConversationId);
      }
    };
    loadInitialData();
  }, []);
  
  // Efeito para guardar conversas e galeria sempre que mudarem
  useEffect(() => {
    if (!isInitialMount.current) {
      saveConversations(conversations);
      saveImageGallery(enhancedImageHistory);
      saveActiveConversationId(activeConversationId);
    } else {
      isInitialMount.current = false;
    }
  }, [conversations, enhancedImageHistory, activeConversationId]);
  
  // Scroll para o final do chat
  useEffect(() => {
    if (shouldScrollToBottom && chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom, activeConversationMessages]);

  const addMessageToConversation = useCallback((message: ChatMessage) => {
    setConversations(prev =>
      prev.map(convo => {
        if (convo.id === activeConversationId) {
          // Remover o indicador de carregamento, se existir
          const newMessages = convo.messages.filter(m => m.type !== 'loading-indicator');
          const updatedConvo = {
            ...convo,
            messages: [...newMessages, message],
            lastModified: new Date(),
          };
          // Se for uma mensagem do utilizador, atualizar o título da conversa
          if (message.sender === 'user' && (convo.messages.length <= 1 || convo.title === "Nova Conversa")) {
            const newTitle = message.content?.substring(0, 30) || 'Conversa de Imagem';
            updatedConvo.title = newTitle;
          }
          return updatedConvo;
        }
        return convo;
      })
    );
    sendToDiscordApi(message);
    setShouldScrollToBottom(true);
  }, [activeConversationId]);

  const handleSendMessage = useCallback(async (prompt: string, images: { file: File, src: string }[] = []) => {
    setStatus(AppStatus.LOADING);

    if (activeConversationId) {
        // Se for a primeira mensagem de um utilizador, iniciar explicitamente o chat
        const currentConvo = conversations.find(c => c.id === activeConversationId);
        if (currentConvo && currentConvo.messages.length <= 1) {
            setChatExplicitlyStarted(true);
        }
    }

    const userMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'user',
      type: images.length > 0 ? 'image-upload' : 'text',
      content: prompt,
      imageUrls: images.map(img => img.src),
      timestamp: new Date(),
    };
    addMessageToConversation(userMessage);

    // Adicionar indicador de carregamento
    const loadingMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'ai',
        type: 'loading-indicator',
        content: "A IA está a pensar...",
        timestamp: new Date(),
    };
    addMessageToConversation(loadingMessage);

    try {
        if (images.length > 0) {
            const base64 = images[0].src.split(',')[1];
            const mimeType = images[0].file.type;
            const enhancedBase64 = await enhanceImage(base64, mimeType, prompt);
            
            const newHistoryEntry: EnhancedImageHistoryEntry = {
                id: uuidv4(),
                originalImageSrc: images[0].src,
                enhancedImageSrc: `data:${mimeType};base64,${enhancedBase64}`,
                uncroppedEnhancedImageSrc: `data:${mimeType};base64,${enhancedBase64}`,
                imageMimeType: mimeType,
                promptUsed: prompt,
                timestamp: new Date(),
                appliedFilter: ImageFilter.NONE,
                appliedBrightness: 100,
                appliedContrast: 100,
                appliedSocialMediaFilter: SocialMediaFilter.NONE,
                appliedSocialMediaFilterIntensity: 100,
                appliedAIFilter: AIFilter.NONE,
            };
            setEnhancedImageHistory(prev => [...prev, newHistoryEntry]);

            const aiMessage: ChatMessage = {
                id: uuidv4(),
                sender: 'ai',
                type: 'image-enhanced',
                content: 'A sua imagem foi aprimorada com sucesso. Pode agora editá-la e guardá-la.',
                imageUrls: [`data:${mimeType};base64,${enhancedBase64}`],
                promptUsed: prompt,
                historyId: newHistoryEntry.id,
                timestamp: new Date(),
            };
            addMessageToConversation(aiMessage);
            
        } else {
            const messageHistory = conversations.find(c => c.id === activeConversationId)?.messages || [];
            const aiResponse = await generateContent(prompt, messageHistory);
            
            const aiMessage: ChatMessage = {
                id: uuidv4(),
                sender: 'ai',
                type: aiResponse.type === 'audio' ? 'audio' : 'text',
                content: aiResponse.data,
                imageUrls: aiResponse.type === 'image' ? [aiResponse.data] : undefined,
                imageMimeType: aiResponse.type === 'image' ? aiResponse.mimeType : undefined,
                audioUrl: aiResponse.audioUrl,
                suggestedToolId: aiResponse.suggestedToolId,
                timestamp: new Date(),
            };
            addMessageToConversation(aiMessage);
        }
        setStatus(AppStatus.SUCCESS);
    } catch (error) {
        console.error("Erro ao comunicar com a API Gemini:", error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        const aiErrorMessage: ChatMessage = {
            id: uuidv4(),
            sender: 'ai',
            type: 'system-info',
            content: `Erro: ${errorMessage}`,
            timestamp: new Date(),
        };
        addMessageToConversation(aiErrorMessage);
        setStatus(AppStatus.ERROR);
    }
  }, [addMessageToConversation, activeConversationId, conversations]);
  
  const handleRegenerate = useCallback(async (messageId: string) => {
    setStatus(AppStatus.LOADING);
    let userMessage: ChatMessage | null = null;
    let historyForRegen: ChatMessage[] = [];

    setConversations(prev => 
        prev.map(convo => {
            if (convo.id !== activeConversationId) return convo;
            
            const messageIndex = convo.messages.findIndex(m => m.id === messageId);
            if (messageIndex < 1) return convo;
            
            // Encontrar a mensagem do utilizador anterior
            let userMessageIndex = -1;
            for (let i = messageIndex - 1; i >= 0; i--) {
                if (convo.messages[i].sender === 'user') {
                    userMessage = convo.messages[i];
                    userMessageIndex = i;
                    break;
                }
            }
            if (!userMessage) return convo;

            historyForRegen = convo.messages.slice(0, userMessageIndex);
            
            // Remover a mensagem da IA antiga e adicionar o indicador de carregamento
            const newMessages = [...convo.messages.slice(0, messageIndex), {
                id: uuidv4(), sender: 'ai', type: 'loading-indicator', content: 'A regenerar resposta...', timestamp: new Date()
            } as ChatMessage];
            
            return { ...convo, messages: newMessages, lastModified: new Date() };
        })
    );

    if (!userMessage || (!userMessage.content && (!userMessage.imageUrls || userMessage.imageUrls.length === 0))) {
        setStatus(AppStatus.ERROR);
        addMessageToConversation({ id: uuidv4(), sender: 'ai', type: 'system-info', content: 'Erro: Não foi possível encontrar o prompt original para regenerar.', timestamp: new Date() });
        return;
    }

    try {
        const aiResponse = await generateContent(userMessage.content || '', historyForRegen);
        const newAiMessage: ChatMessage = {
            id: uuidv4(),
            sender: 'ai',
            type: aiResponse.type === 'audio' ? 'audio' : 'text',
            content: aiResponse.data,
            audioUrl: aiResponse.audioUrl,
            suggestedToolId: aiResponse.suggestedToolId,
            timestamp: new Date(),
        };
        addMessageToConversation(newAiMessage);
        setStatus(AppStatus.SUCCESS);
    } catch (error) {
        console.error("Erro ao regenerar resposta:", error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        addMessageToConversation({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro: ${errorMessage}`, timestamp: new Date() });
        setStatus(AppStatus.ERROR);
    }
  }, [activeConversationId, addMessageToConversation]);


  const handleStartNewChat = useCallback((startEmpty: boolean = false) => {
    const newId = uuidv4();
    const newConversation: Conversation = {
        id: newId,
        title: "Nova Conversa",
        messages: startEmpty ? [] : [createWelcomeMessage()],
        lastModified: new Date(),
    };
    setConversations(prev => [...prev, newConversation]);
    setActiveConversationId(newId);
    setChatExplicitlyStarted(startEmpty); // Se começar vazia, considerar como iniciada
    setCurrentView('chat');
  }, []);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    const convo = conversations.find(c => c.id === id);
    // Se a conversa tiver mais do que a mensagem de boas-vindas, considerar como "iniciada"
    if (convo && (convo.messages.length > 1 || (convo.messages.length === 1 && convo.messages[0].type !== 'system-info'))) {
        setChatExplicitlyStarted(true);
    } else {
        setChatExplicitlyStarted(false);
    }
    setCurrentView('chat');
  };
  
  const handleDeleteConversationRequest = (id: string, title: string) => {
      setConfirmationAction({
          title: "Apagar Conversa",
          message: `Tem a certeza de que quer apagar permanentemente a conversa "${title}"? Esta ação não pode ser desfeita.`,
          onConfirm: () => handleDeleteConversation(id)
      });
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(convo => convo.id !== id));
    // Se a conversa ativa for apagada, selecionar a mais recente ou criar uma nova
    if (activeConversationId === id) {
        const remainingConversations = conversations.filter(convo => convo.id !== id);
        if (remainingConversations.length > 0) {
            // Ordenar por data e selecionar a mais recente
            const sorted = [...remainingConversations].sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
            setActiveConversationId(sorted[0].id);
        } else {
            handleStartNewChat();
        }
    }
  };

  const handleClearAllDataRequest = () => {
    setConfirmationAction({
        title: "Limpar Todos os Dados",
        message: "Tem a certeza de que quer apagar todas as suas conversas e a galeria de imagens? Esta ação é irreversível.",
        onConfirm: async () => {
            await clearAllData();
            // Recarregar o estado da aplicação
            setConversations([]);
            setEnhancedImageHistory([]);
            setChatExplicitlyStarted(false);
            handleStartNewChat();
        }
    });
  };
  
  const handleOpenImageModal = () => setIsImageModalOpen(true);
  const handleSendWithImage = (file: File, prompt: string) => handleSendMessage(prompt, [{ file, src: URL.createObjectURL(file) }]);

  const handleViewImageFromChat = (historyId: string) => {
    const entryIndex = enhancedImageHistory.findIndex(e => e.id === historyId);
    if (entryIndex !== -1) {
      const entry = enhancedImageHistory[entryIndex];
      setViewingImage({ src: entry.enhancedImageSrc, entry: entry, index: entryIndex });
    }
  };
  
  const handleOpenFinalizationViewFromViewer = () => {
      if (viewingImage?.entry) {
        const entryIndex = enhancedImageHistory.findIndex(e => e.id === viewingImage.entry!.id);
        if (entryIndex !== -1) {
          setCurrentHistoryIndex(entryIndex);
          setIsFinalizationViewOpen(true);
        }
      }
      setViewingImage(null);
  }

  const handleApplyCrop = useCallback((historyId: string, croppedImageSrc: string) => {
      setEnhancedImageHistory(prev =>
          prev.map(entry =>
              entry.id === historyId ? { ...entry, enhancedImageSrc: croppedImageSrc } : entry
          )
      );
  }, []);
  
  const handleResetAdjustments = useCallback((historyId: string) => {
      setEnhancedImageHistory(prev =>
          prev.map(entry => {
              if (entry.id === historyId) {
                  return {
                      ...entry,
                      enhancedImageSrc: entry.uncroppedEnhancedImageSrc || entry.enhancedImageSrc,
                      appliedFilter: ImageFilter.NONE,
                      appliedBrightness: 100,
                      appliedContrast: 100,
                      appliedSocialMediaFilter: SocialMediaFilter.NONE,
                      appliedSocialMediaFilterIntensity: 100,
                      appliedAIFilter: AIFilter.NONE,
                  };
              }
              return entry;
          })
      );
  }, []);
  
  const handleSaveImageEntryAdjustments = useCallback((updatedEntry: EnhancedImageHistoryEntry) => {
    setEnhancedImageHistory(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    addMessageToConversation({
        id: uuidv4(),
        sender: 'ai',
        type: 'system-info',
        content: `Ajustes guardados para a imagem.`,
        timestamp: new Date(),
    });
  }, [addMessageToConversation]);
  
  const downloadWithWatermark = useCallback(async (entry: EnhancedImageHistoryEntry) => {
    setStatus(AppStatus.LOADING);
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Não foi possível criar o contexto do canvas.");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = entry.enhancedImageSrc;
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Aplicar filtros CSS antes de desenhar
        const filterStyle = [
            `brightness(${entry.appliedBrightness}%)`,
            `contrast(${entry.appliedContrast}%)`,
            entry.appliedFilter !== ImageFilter.NONE ? `${entry.appliedFilter}(1)` : '',
            getSocialMediaFilterStyle(entry.appliedSocialMediaFilter, entry.appliedSocialMediaFilterIntensity),
        ].filter(Boolean).join(' ');
        
        ctx.filter = filterStyle;
        ctx.drawImage(img, 0, 0);
        
        // Remover filtro para desenhar a marca d'água
        ctx.filter = 'none';
        await drawWatermarkOnCanvas(canvas);

        const dataUrl = canvas.toDataURL(entry.imageMimeType || 'image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `aprimorada_${entry.id.substring(0, 8)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        addMessageToConversation({ id: uuidv4(), sender: 'ai', type: 'system-info', content: 'Download da imagem com marca d\'água iniciado.', timestamp: new Date() });
    } catch (error) {
        console.error("Erro ao transferir a imagem:", error);
        addMessageToConversation({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro ao transferir imagem: ${error instanceof Error ? error.message : 'Desconhecido'}.`, timestamp: new Date() });
    } finally {
        setStatus(AppStatus.IDLE);
    }
  }, [addMessageToConversation]);

  const handleToolAction = async (
    action: (...args: any[]) => Promise<any>,
    options: {
        userMessageContent: string;
        userMessageFiles?: File[];
        loadingMessage: string;
        successMessage: string;
        errorMessageContext: string;
        sourceFileForHistory?: File;
    },
    ...args: any[]
  ) => {
    // 1. Create and add user message to the chat history
    const userMessageImageUrls = options.userMessageFiles?.map(f => URL.createObjectURL(f));
    const userMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'user',
      type: userMessageImageUrls && userMessageImageUrls.length > 0 ? 'image-upload' : 'text',
      content: options.userMessageContent,
      imageUrls: userMessageImageUrls,
      timestamp: new Date(),
    };
    addMessageToConversation(userMessage);

    // 2. Add loading indicator and perform AI action
    setStatus(AppStatus.LOADING);
    const { loadingMessage, successMessage, errorMessageContext } = options;
    addMessageToConversation({ id: uuidv4(), sender: 'ai', type: 'loading-indicator', content: loadingMessage, timestamp: new Date() });

    try {
      const result = await action(...args);
      const message: Partial<ChatMessage> = {
          id: uuidv4(),
          sender: 'ai',
          content: successMessage,
          timestamp: new Date(),
      };

      if (typeof result === 'string') {
          if(result.startsWith('data:video')) {
              message.type = 'video-generated';
              message.videoUrl = result;
          } else {
             // The source file for history should be the main image the user is editing.
             // If not explicitly provided, default to the first file in the user's message.
             const originalSrcFile = options.sourceFileForHistory || options.userMessageFiles?.[0];
             
             if (!originalSrcFile) {
                 console.warn("sourceFileForHistory was not provided for a tool that generates an image.");
             }

             const newHistoryEntry: EnhancedImageHistoryEntry = {
                id: uuidv4(),
                originalImageSrc: originalSrcFile ? URL.createObjectURL(originalSrcFile) : '', 
                enhancedImageSrc: `data:image/png;base64,${result}`,
                uncroppedEnhancedImageSrc: `data:image/png;base64,${result}`,
                imageMimeType: 'image/png',
                promptUsed: errorMessageContext,
                timestamp: new Date(),
                appliedFilter: ImageFilter.NONE, appliedBrightness: 100, appliedContrast: 100,
                appliedSocialMediaFilter: SocialMediaFilter.NONE, appliedSocialMediaFilterIntensity: 100,
                appliedAIFilter: AIFilter.NONE,
             };
             setEnhancedImageHistory(prev => [...prev, newHistoryEntry]);
             message.type = 'image-enhanced';
             message.imageUrls = [newHistoryEntry.enhancedImageSrc];
             message.historyId = newHistoryEntry.id;
          }
      } else {
          message.type = 'system-info';
      }
      addMessageToConversation(message as ChatMessage);
      setStatus(AppStatus.SUCCESS);
    } catch (error) {
      console.error(`Erro na chamada da API Gemini para ${errorMessageContext}:`, error);
      const userMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      if (errorMessageContext === 'animar a imagem com Veo' && userMessage.includes('Requested entity was not found')) {
          addMessageToConversation({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `A sua chave de API pode não ser válida para o Veo. Verifique as suas informações de faturação em ai.google.dev/gemini-api/docs/billing e selecione uma chave válida.`, timestamp: new Date() });
          window.aistudio?.openSelectKey();
      } else {
          addMessageToConversation({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro: ${userMessage}`, timestamp: new Date() });
      }
      setStatus(AppStatus.ERROR);
    }
  };


  const fileToB64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleClothingSwap = async (personFile: File, clothingFile: File) => {
    const personB64 = await fileToB64(personFile);
    const clothingB64 = await fileToB64(clothingFile);
    handleToolAction(
        swapClothing, 
        {
            userMessageContent: 'Realizar troca de roupa com as imagens fornecidas.',
            userMessageFiles: [personFile, clothingFile],
            loadingMessage: 'A realizar a troca de roupa...',
            successMessage: 'Troca de roupa concluída com sucesso!',
            errorMessageContext: 'trocar a roupa',
            sourceFileForHistory: personFile
        },
        personB64, personFile.type, clothingB64, clothingFile.type
    );
  };
  
  const handleFaceSwap = async (targetFile: File, sourceFile: File) => {
    const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    const targetDataUrl = await toDataUrl(targetFile);
    const sourceDataUrl = await toDataUrl(sourceFile);
    handleToolAction(
        swapFace, 
        {
            userMessageContent: 'Realizar troca de rosto com as imagens fornecidas.',
            userMessageFiles: [targetFile, sourceFile],
            loadingMessage: 'A realizar a troca de rosto...',
            successMessage: 'Troca de rosto concluída com sucesso!',
            errorMessageContext: 'trocar o rosto',
            sourceFileForHistory: targetFile
        },
        targetDataUrl, sourceDataUrl
    );
  };

  const handleFaceTreatment = (file: File) => handleToolAction(
    async (imgFile: File) => performFaceTreatment(await fileToB64(imgFile), imgFile.type),
    {
        userMessageContent: 'Aplicar tratamento de rosto a esta imagem.',
        userMessageFiles: [file],
        loadingMessage: 'A aplicar tratamento ao rosto...',
        successMessage: 'Tratamento de rosto concluído!',
        errorMessageContext: 'realizar o tratamento de rosto',
        sourceFileForHistory: file
    },
    file
  );
  
  const handleAnimateImage = (file: File, prompt: string | null, aspectRatio: '16:9' | '9:16') => handleToolAction(
    async (imgFile: File, p: string | null, ar: '16:9' | '9:16') => animateImageWithVeo(await fileToB64(imgFile), imgFile.type, p, ar), 
    {
        userMessageContent: `Animar imagem com Veo. ${prompt ? `Prompt: "${prompt}"` : ''}`,
        userMessageFiles: [file],
        loadingMessage: 'A animar a sua imagem com o Veo... Isto pode demorar alguns minutos.',
        successMessage: 'Vídeo gerado com sucesso!',
        errorMessageContext: 'animar a imagem com Veo'
    },
    file, prompt, aspectRatio
  );

  const handleChangeBackground = (file: File, prompt: string) => handleToolAction(
    async (imgFile: File, p: string) => changeImageBackground(await fileToB64(imgFile), imgFile.type, p), 
    {
        userMessageContent: `Alterar o fundo da imagem para: "${prompt}"`,
        userMessageFiles: [file],
        loadingMessage: 'A alterar o fundo...',
        successMessage: 'Fundo alterado com sucesso!',
        errorMessageContext: 'alterar o fundo da imagem',
        sourceFileForHistory: file
    },
    file, prompt
  );
  
  const handleRemoveObject = (file: File, maskB64: string) => handleToolAction(
    async (imgFile: File, mB64: string) => removeObjectFromImage(await fileToB64(imgFile), imgFile.type, mB64), 
    {
        userMessageContent: 'Remover o objeto selecionado da imagem.',
        userMessageFiles: [file],
        loadingMessage: 'A remover o objeto...',
        successMessage: 'Objeto removido com sucesso!',
        errorMessageContext: 'remover o objeto da imagem',
        sourceFileForHistory: file
    },
    file, maskB64
  );

  const handleRestorePhoto = (file: File) => handleToolAction(
    async (imgFile: File) => restoreOldPhoto(await fileToB64(imgFile), imgFile.type), 
    {
        userMessageContent: 'Restaurar esta foto antiga.',
        userMessageFiles: [file],
        loadingMessage: 'A restaurar a foto...',
        successMessage: 'Foto restaurada com sucesso!',
        errorMessageContext: 'restaurar a foto antiga',
        sourceFileForHistory: file
    },
    file
  );

  const handleStyleTransfer = (file: File, prompt: string) => handleToolAction(
    async (imgFile: File, p: string) => transferImageStyle(await fileToB64(imgFile), imgFile.type, p),
    {
        userMessageContent: `Aplicar estilo artístico: "${prompt}"`,
        userMessageFiles: [file],
        loadingMessage: 'A aplicar o estilo artístico...',
        successMessage: 'Estilo aplicado com sucesso!',
        errorMessageContext: 'aplicar o estilo artístico',
        sourceFileForHistory: file
    },
    file, prompt
  );
  
  const handleChangeAge = (file: File, currentAge: number, desiredAge: number, mode: 'rejuvenate' | 'age') => handleToolAction(
    async (imgFile: File, cAge: number, dAge: number, m: 'rejuvenate'|'age') => changeAge(await fileToB64(imgFile), imgFile.type, cAge, dAge, m),
    {
        userMessageContent: `${mode === 'age' ? 'Envelhecer' : 'Rejuvenescer'} de ${currentAge} para ${desiredAge} anos.`,
        userMessageFiles: [file],
        loadingMessage: 'A alterar a idade...',
        successMessage: 'Idade alterada com sucesso!',
        errorMessageContext: 'alterar a idade da pessoa',
        sourceFileForHistory: file
    },
    file, currentAge, desiredAge, mode
  );
  
  const handleApplyAIFilter = async (historyId: string, filter: AIFilter) => {
    const entry = enhancedImageHistory.find(e => e.id === historyId);
    if (!entry) return;
    
    setStatus(AppStatus.LOADING);
    try {
        const base64 = (entry.uncroppedEnhancedImageSrc || entry.enhancedImageSrc).split(',')[1];
        const mimeType = entry.imageMimeType;
        const newBase64 = await applyAIFilter(base64, mimeType, filter);
        setEnhancedImageHistory(prev => prev.map(e => e.id === historyId ? { 
            ...e, 
            appliedAIFilter: filter,
            uncroppedEnhancedImageSrc: `data:${mimeType};base64,${newBase64}`,
            enhancedImageSrc: `data:${mimeType};base64,${newBase64}`,
            // Reset local adjustments when applying an AI filter
            appliedFilter: ImageFilter.NONE,
            appliedBrightness: 100,
            appliedContrast: 100,
            appliedSocialMediaFilter: SocialMediaFilter.NONE,
            appliedSocialMediaFilterIntensity: 100,
        } : e));
        setStatus(AppStatus.SUCCESS);
    } catch (error) {
        console.error("Erro ao aplicar filtro de IA:", error);
        addMessageToConversation({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro: ${error instanceof Error ? error.message : 'Falha ao aplicar filtro.'}`, timestamp: new Date() });
        setStatus(AppStatus.ERROR);
    }
  };

  return (
    <div className={`flex flex-col h-screen w-screen bg-appBg font-sans`}>
        <AppHeader
            appName={appName}
            appDescription={appDescription}
            isDarkMode={isDarkMode}
            currentView={currentView}
            onNavigateToChat={() => setCurrentView('chat')}
            onNavigateToGallery={() => setCurrentView('gallery')}
            onNavigateToConversations={() => setCurrentView('conversations')}
            onNavigateToDocumentation={() => setCurrentView('documentation')}
            onNewChat={() => handleStartNewChat()}
            onClearData={handleClearAllDataRequest}
        />
        <main ref={chatHistoryRef} className="flex-1 overflow-y-auto custom-scrollbar pt-24 pb-28">
          {currentView === 'chat' && (
             <ChatScreen 
                messages={activeConversationMessages}
                showIntroContent={showIntroContent}
                onPromptSuggestionClick={(p) => handleSendMessage(p)}
                onStartChat={() => setChatExplicitlyStarted(true)}
                isDarkMode={isDarkMode}
                onViewEnhancedImage={handleViewImageFromChat}
                onRegenerate={handleRegenerate}
                onViewImage={(src) => setViewingImage({ src })}
                onOpenCreativeToolsModal={() => setIsCreativeToolsModalOpen(true)}
                // Pass tool handlers
                onOpenClothingSwapModal={() => setIsClothingSwapSelectionModalOpen(true)}
                onOpenFaceSwapModal={() => setIsFaceSwapModalOpen(true)}
                onOpenFaceTreatmentModal={() => setIsFaceTreatmentModalOpen(true)}
                onOpenAnimateImageModal={() => setIsAnimateImageModalOpen(true)}
                onOpenChangeBackgroundModal={() => setIsChangeBackgroundModalOpen(true)}
                onOpenNativeEditModal={() => setIsNativeEditModalOpen(true)}
                onOpenMagicEraserModal={() => setIsMagicEraserModalOpen(true)}
                onOpenRestorePhotoModal={() => setIsRestorePhotoModalOpen(true)}
                onOpenStyleTransferModal={() => setIsStyleTransferModalOpen(true)}
                onOpenAgeChangeModal={() => setIsAgeChangeModalOpen(true)}
             />
          )}
          {currentView === 'gallery' && (
             <GalleryScreen 
                gallery={enhancedImageHistory}
                isDarkMode={isDarkMode}
                onViewImage={(entry, index) => setViewingImage({ src: entry.enhancedImageSrc, entry, index })}
             />
          )}
          {currentView === 'conversations' && (
            <ConversationsScreen 
                conversations={conversations}
                onSelectConversation={handleSelectConversation}
                onDeleteConversationRequest={handleDeleteConversationRequest}
                onNewChat={() => handleStartNewChat(true)}
                isDarkMode={isDarkMode}
            />
          )}
          {currentView === 'documentation' && <DocumentationScreen isDarkMode={isDarkMode} />}
        </main>

       {showChatInput && (
          <footer className="fixed bottom-0 left-0 right-0 bg-appBg/80 backdrop-blur-sm border-t border-borderColor">
            <ChatInputBar onSendMessage={handleSendMessage} onOpenImageModal={handleOpenImageModal} isLoading={status === AppStatus.LOADING} isDarkMode={isDarkMode} />
          </footer>
       )}

      {/* --- Modals and Views --- */}
      {isImageModalOpen && <ImageSelectionModal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onSend={handleSendWithImage} isDarkMode={isDarkMode} />}
      {isFinalizationViewOpen && currentHistoryIndex !== null && (
        <ImageFinalizationView
          isOpen={isFinalizationViewOpen}
          onClose={() => setIsFinalizationViewOpen(false)}
          imageEntry={enhancedImageHistory[currentHistoryIndex]}
          currentIndex={currentHistoryIndex}
          historyLength={enhancedImageHistory.length}
          onNavigate={(dir) => setCurrentHistoryIndex(prev => prev !== null ? (dir === 'prev' ? Math.max(0, prev - 1) : Math.min(enhancedImageHistory.length - 1, prev + 1)) : null)}
          onDownloadSpecificImage={downloadWithWatermark}
          onSaveImageEntryAdjustments={handleSaveImageEntryAdjustments}
          onApplyCrop={handleApplyCrop}
          onResetAdjustments={handleResetAdjustments}
          onApplyAIFilter={handleApplyAIFilter}
          addMessage={addMessageToConversation}
          isDarkMode={isDarkMode}
        />
      )}
       {viewingImage && (
        <SimpleImageViewer
          isOpen={!!viewingImage}
          onClose={() => setViewingImage(null)}
          imageSrc={viewingImage.src}
          isDarkMode={isDarkMode}
          onEdit={viewingImage.entry ? handleOpenFinalizationViewFromViewer : undefined}
          onNavigate={viewingImage.entry ? (dir) => {
              const newIndex = viewingImage.index! + (dir === 'prev' ? -1 : 1);
              if (newIndex >= 0 && newIndex < enhancedImageHistory.length) {
                  const newEntry = enhancedImageHistory[newIndex];
                  setViewingImage({ src: newEntry.enhancedImageSrc, entry: newEntry, index: newIndex });
              }
          } : undefined}
          currentIndex={viewingImage.index}
          galleryLength={enhancedImageHistory.length}
        />
      )}
      {isClothingSwapSelectionModalOpen && <ClothingSwapSelectionModal isOpen={isClothingSwapSelectionModalOpen} onClose={() => setIsClothingSwapSelectionModalOpen(false)} onPerformSwap={handleClothingSwap} isDarkMode={isDarkMode} />}
      {isFaceSwapModalOpen && <FaceSwapSelectionModal isOpen={isFaceSwapModalOpen} onClose={() => setIsFaceSwapModalOpen(false)} onPerformSwap={handleFaceSwap} isDarkMode={isDarkMode} />}
      {isFaceTreatmentModalOpen && <FaceTreatmentSelectionModal isOpen={isFaceTreatmentModalOpen} onClose={() => setIsFaceTreatmentModalOpen(false)} onPerformTreatment={handleFaceTreatment} isDarkMode={isDarkMode} />}
      {isAnimateImageModalOpen && <AnimateImageModal isOpen={isAnimateImageModalOpen} onClose={() => setIsAnimateImageModalOpen(false)} onAnimate={handleAnimateImage} isDarkMode={isDarkMode} />}
      {isChangeBackgroundModalOpen && <ChangeBackgroundModal isOpen={isChangeBackgroundModalOpen} onClose={() => setIsChangeBackgroundModalOpen(false)} onConfirm={handleChangeBackground} isDarkMode={isDarkMode} />}
      {isNativeEditModalOpen && <NativeEditSelectionModal isOpen={isNativeEditModalOpen} onClose={() => setIsNativeEditModalOpen(false)} onImageConfirmed={(file) => console.log("Not implemented yet")} isDarkMode={isDarkMode} />}
      {confirmationAction && <ConfirmationModal isOpen={!!confirmationAction} onClose={() => setConfirmationAction(null)} onConfirm={confirmationAction.onConfirm} title={confirmationAction.title} message={confirmationAction.message} isDarkMode={isDarkMode} />}
      {isCreativeToolsModalOpen && <CreativeToolsModal isOpen={isCreativeToolsModalOpen} onClose={() => setIsCreativeToolsModalOpen(false)} onOpenAnimateImageModal={() => { setIsCreativeToolsModalOpen(false); setIsAnimateImageModalOpen(true); }} onOpenChangeBackgroundModal={() => { setIsCreativeToolsModalOpen(false); setIsChangeBackgroundModalOpen(true); }} onOpenClothingSwapModal={() => { setIsCreativeToolsModalOpen(false); setIsClothingSwapSelectionModalOpen(true); }} onOpenFaceSwapModal={() => { setIsCreativeToolsModalOpen(false); setIsFaceSwapModalOpen(true); }} onOpenFaceTreatmentModal={() => { setIsCreativeToolsModalOpen(false); setIsFaceTreatmentModalOpen(true); }} onOpenNativeEditModal={() => { setIsCreativeToolsModalOpen(false); setIsNativeEditModalOpen(true); }} onOpenMagicEraserModal={() => { setIsCreativeToolsModalOpen(false); setIsMagicEraserModalOpen(true); }} onOpenRestorePhotoModal={() => { setIsCreativeToolsModalOpen(false); setIsRestorePhotoModalOpen(true); }} onOpenStyleTransferModal={() => { setIsCreativeToolsModalOpen(false); setIsStyleTransferModalOpen(true); }} onOpenAgeChangeModal={() => { setIsCreativeToolsModalOpen(false); setIsAgeChangeModalOpen(true); }} isDarkMode={isDarkMode} />}
      {isMagicEraserModalOpen && <MagicEraserModal isOpen={isMagicEraserModalOpen} onClose={() => setIsMagicEraserModalOpen(false)} onPerformRemoval={handleRemoveObject} isDarkMode={isDarkMode} />}
      {isRestorePhotoModalOpen && <RestorePhotoModal isOpen={isRestorePhotoModalOpen} onClose={() => setIsRestorePhotoModalOpen(false)} onPerformRestore={handleRestorePhoto} isDarkMode={isDarkMode} />}
      {isStyleTransferModalOpen && <StyleTransferModal isOpen={isStyleTransferModalOpen} onClose={() => setIsStyleTransferModalOpen(false)} onConfirm={handleStyleTransfer} isDarkMode={isDarkMode} />}
      {isAgeChangeModalOpen && <AgeChangeModal isOpen={isAgeChangeModalOpen} onClose={() => setIsAgeChangeModalOpen(false)} onConfirm={handleChangeAge} isDarkMode={isDarkMode} />}

    </div>
  );
};

export default App;
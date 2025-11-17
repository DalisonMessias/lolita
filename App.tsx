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

      // Carregar galeria de imagens do IndexedDB
      const loadedGallery = await loadImageGallery();
      if (loadedGallery) {
        setEnhancedImageHistory(loadedGallery);
      }

      // Carregar conversas do IndexedDB
      const loadedConversations = await loadConversations();
      if (loadedConversations.length > 0) {
        setConversations(loadedConversations);
        const lastActiveId = loadActiveConversationId();
        const activeId = loadedConversations.some(c => c.id === lastActiveId) 
            ? lastActiveId 
            : loadedConversations[0].id;
        setActiveConversationId(activeId);
      } else {
        handleNewChat();
      }
    };
    
    loadInitialData();
  }, []);

  // Effect to scroll to the top of the chat when a conversation is loaded.
  useEffect(() => {
    setChatExplicitlyStarted(false);
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = 0;
    }
  }, [activeConversationId]);

  // Effect to scroll to the bottom of the chat ONLY when a new message is added.
  useEffect(() => {
    if (shouldScrollToBottom && chatHistoryRef.current) {
      setTimeout(() => {
        chatHistoryRef.current?.scrollTo({
          top: chatHistoryRef.current.scrollHeight,
          behavior: 'smooth'
        });
        setShouldScrollToBottom(false); // Reset the trigger
      }, 100);
    }
  }, [shouldScrollToBottom, activeConversationMessages]); // Depend on messages to ensure DOM is updated before scrolling
  
  // Save conversations to IndexedDB on changes
  useEffect(() => {
    if (isInitialMount.current) return;
    const save = async () => {
        const conversationsToPersist = conversations.filter(convo => 
            convo.messages.length > 1 || 
            (convo.messages.length === 1 && convo.messages[0].type !== 'system-info')
        );
        if (conversationsToPersist.length > 0 || conversations.length === 0) {
          await saveConversations(conversationsToPersist);
        }
    };
    save();
  }, [conversations]);

  useEffect(() => {
     saveActiveConversationId(activeConversationId);
  }, [activeConversationId]);
  
  // Salvar galeria no IndexedDB quando mudar
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const saveGallery = async () => {
      await saveImageGallery(enhancedImageHistory);
    };
    saveGallery();
  }, [enhancedImageHistory]);
  
  // CORREÇÃO: Os hooks que geriam o ciclo de vida dos Blob URLs foram removidos.
  // A revogação agressiva dos URLs estava a causar uma "race condition" com a lógica de
  // gravação no IndexedDB, resultando em erros "Failed to fetch". Ao remover esta lógica,
  // os URLs dos blobs permanecem válidos durante toda a sessão, resolvendo o erro de gravação.
  // A memória será libertada pelo navegador quando a página for fechada.

  const addMessage = useCallback((message: ChatMessage) => {
    sendToDiscordApi(message).catch(e => console.error("Falha ao enviar mensagem para o backend:", e));
    
    setConversations(prev => {
        const newConversations = [...prev];
        const activeConvoIndex = newConversations.findIndex(c => c.id === activeConversationId);
        if (activeConvoIndex !== -1) {
            const activeConvo = { ...newConversations[activeConvoIndex] };
            const isFirstUserMessage = activeConvo.messages.length <= 1;
            
            if (isFirstUserMessage && message.sender === 'user' && (message.content || message.imageUrls)) {
                 activeConvo.title = (message.content || 'Imagem Enviada').substring(0, 40);
                 if (activeConvo.title.length === 40) activeConvo.title += '...';
                 activeConvo.messages = [message];
            } else {
                 activeConvo.messages = [...activeConvo.messages, message];
            }
            activeConvo.lastModified = new Date();
            newConversations[activeConvoIndex] = activeConvo;
        }
        return newConversations;
    });
    setShouldScrollToBottom(true);
  }, [activeConversationId]);
  
  const handleNewChat = useCallback(() => {
      const newId = uuidv4();
      const newConversation: Conversation = {
          id: newId,
          title: "Nova Conversa",
          messages: [createWelcomeMessage()],
          lastModified: new Date(),
      };
      setConversations(prev => [...prev, newConversation]);
      setActiveConversationId(newId);
      setCurrentView('chat');
  }, []);

  const handleStartChat = () => {
    setChatExplicitlyStarted(true);
    setConversations(prev => {
        const newConversations = [...prev];
        const activeConvoIndex = newConversations.findIndex(c => c.id === activeConversationId);
        if (activeConvoIndex !== -1) {
            const activeConvo = { ...newConversations[activeConvoIndex] };
            if (activeConvo.messages.length === 1 && activeConvo.messages[0].type === 'system-info') {
                activeConvo.messages = [];
            }
            newConversations[activeConvoIndex] = activeConvo;
        }
        return newConversations;
    });
  };

  const handleSelectConversation = useCallback((id: string) => {
      setActiveConversationId(id);
      setCurrentView('chat');
  }, []);

  const performDeleteConversation = useCallback((idToDelete: string) => {
    setConversations(prevConversations => {
      const remaining = prevConversations.filter(c => c.id !== idToDelete);
      
      if (activeConversationId === idToDelete) {
        if (remaining.length > 0) {
          const sorted = [...remaining].sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
          setActiveConversationId(sorted[0].id);
        }
      }
      return remaining;
    });
    setConversations(currentConvos => {
        if (currentConvos.length === 0) {
            handleNewChat();
        }
        return currentConvos;
    });
  }, [activeConversationId, handleNewChat]);


  const handleDeleteConversationRequest = useCallback((id: string, title: string) => {
    setConfirmationAction({
        title: "Apagar Conversa",
        message: `Tem a certeza de que pretende apagar permanentemente a conversa "${title}"?`,
        onConfirm: () => performDeleteConversation(id),
    });
  }, [performDeleteConversation]);


  const performClearData = useCallback(async () => {
    await clearAllData();
    setEnhancedImageHistory([]);
    setConversations([]);
    handleNewChat();
  }, [handleNewChat]);

  const handleClearDataRequest = useCallback(() => {
    setConfirmationAction({
      title: "Limpar Todos os Dados",
      message: "Tem a certeza de que pretende apagar permanentemente todas as suas conversas e imagens guardadas? Esta ação não pode ser desfeita.",
      onConfirm: async () => await performClearData(),
    });
  }, [performClearData]);
  
  const createNewHistoryEntry = (
    originalSrc: string,
    enhancedSrc: string,
    mimeType: string,
    prompt: string
  ): EnhancedImageHistoryEntry => {
    return {
      id: uuidv4(),
      originalImageSrc: originalSrc,
      enhancedImageSrc: enhancedSrc,
      uncroppedEnhancedImageSrc: enhancedSrc,
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
  };

  const handleOpenAnimateImageModal = async () => {
    try {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                if (typeof window.aistudio.openSelectKey === 'function') {
                    await window.aistudio.openSelectKey();
                    setIsAnimateImageModalOpen(true);
                    return;
                }
            }
        }
        setIsAnimateImageModalOpen(true);
    } catch (error) {
        console.error("Error checking for Veo API key:", error);
        addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: 'Erro ao verificar a chave de API para o Veo.', timestamp: new Date() });
    }
  };

  const handleAnimateImage = useCallback(async (imageFile: File, prompt: string | null, aspectRatio: '16:9' | '9:16') => {
    setIsAnimateImageModalOpen(false);

    const readAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });

    const imageUrl = await readAsDataURL(imageFile);

    const userMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'user',
        type: 'image-upload',
        imageUrls: [imageUrl],
        content: `Solicitação de Animação com Veo (Prompt: ${prompt || 'nenhum'})`,
        promptUsed: "__ANIMATE_IMAGE__",
        timestamp: new Date(),
    };
  
    addMessage(userMessage);
  
    const loadingMessageId = uuidv4();
    addMessage({ id: loadingMessageId, sender: 'ai', type: 'loading-indicator', content: 'A IA está a animar a sua imagem... Este processo pode demorar alguns minutos.', timestamp: new Date() });
    
    try {
        const imageBase64 = imageUrl.split(',')[1];
        const videoDataUrl = await animateImageWithVeo(imageBase64, imageFile.type, prompt, aspectRatio);

        addMessage({
            id: uuidv4(), 
            sender: 'ai', 
            type: 'video-generated',
            videoUrl: videoDataUrl,
            content: `Animação concluída!`, 
            timestamp: new Date(),
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido ao gerar o vídeo.";
        if (err instanceof Error && err.message.includes('Requested entity was not found')) {
            addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: 'A sua chave de API para o Veo pode ser inválida. Clique novamente na ferramenta "Animar Imagem com Veo" para selecionar uma chave válida. Saiba mais em ai.google.dev/gemini-api/docs/billing.', timestamp: new Date() });
            if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
                window.aistudio.openSelectKey();
            }
        } else {
            addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro: ${errorMessage}.`, timestamp: new Date() });
        }
    } finally {
        setConversations((prev) => prev.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.filter(msg => msg.id !== loadingMessageId) } : c));
    }
  }, [addMessage, activeConversationId]);

  
  const handlePerformClothingSwap = useCallback(async (personFile: File, clothingFile: File) => {
    setIsClothingSwapSelectionModalOpen(false);
  
    const readAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  
    const [personImageUrl, clothingImageUrl] = await Promise.all([readAsDataURL(personFile), readAsDataURL(clothingFile)]);
    
    const userMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'user',
        type: 'image-upload',
        imageUrls: [personImageUrl, clothingImageUrl],
        content: "Solicitação de Troca de Roupa",
        promptUsed: "__SWAP_CLOTHING__",
        timestamp: new Date(),
    };
  
    addMessage(userMessage);
  
    const loadingMessageId = uuidv4();
    addMessage({ id: loadingMessageId, sender: 'ai', type: 'loading-indicator', content: 'A IA está a trocar a roupa...', timestamp: new Date() });
    
    try {
        const personBase64 = personImageUrl.split(',')[1];
        const clothingBase64 = clothingImageUrl.split(',')[1];
        const resultBase64 = await swapClothing(personBase64, personFile.type, clothingBase64, clothingFile.type);
        const resultImageUrl = `data:${personFile.type};base64,${resultBase64}`;
        
        const newHistoryEntry = createNewHistoryEntry(personImageUrl, resultImageUrl, personFile.type, "Troca de Roupa");
        setEnhancedImageHistory(prev => [...prev, newHistoryEntry]);
        
        addMessage({
            id: uuidv4(), sender: 'ai', type: 'image-enhanced', historyId: newHistoryEntry.id,
            imageUrls: [resultImageUrl], imageMimeType: personFile.type,
            content: `Troca de roupa concluída! (Clique para editar)`, promptUsed: "Troca de Roupa", timestamp: new Date(),
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
        addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro: ${errorMessage}.`, timestamp: new Date() });
    } finally {
        setConversations((prev) => prev.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.filter(msg => msg.id !== loadingMessageId) } : c));
    }
  }, [addMessage, activeConversationId]);
  
  const handlePerformFaceSwap = useCallback(async (targetFile: File, sourceFile: File) => {
    setIsFaceSwapModalOpen(false);
  
    const readAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  
    const [targetImageUrl, sourceImageUrl] = await Promise.all([readAsDataURL(targetFile), readAsDataURL(sourceFile)]);
  
    const userMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'user',
        type: 'image-upload',
        imageUrls: [targetImageUrl, sourceImageUrl],
        content: "Solicitação de Troca de Rosto",
        promptUsed: "__SWAP_FACE__",
        timestamp: new Date(),
    };
  
    addMessage(userMessage);
  
    const loadingMessageId = uuidv4();
    addMessage({ id: loadingMessageId, sender: 'ai', type: 'loading-indicator', content: 'A IA está a trocar o rosto...', timestamp: new Date() });
    
    try {
        const resultBase64 = await swapFace(targetImageUrl, sourceImageUrl);
        const resultImageUrl = `data:${targetFile.type};base64,${resultBase64}`;
        
        const newHistoryEntry = createNewHistoryEntry(targetImageUrl, resultImageUrl, targetFile.type, "Troca de Rosto");
        setEnhancedImageHistory(prev => [...prev, newHistoryEntry]);

        addMessage({
            id: uuidv4(), sender: 'ai', type: 'image-enhanced', historyId: newHistoryEntry.id,
            imageUrls: [resultImageUrl], imageMimeType: targetFile.type,
            content: `Troca de rosto concluída! (Clique para editar)`, promptUsed: "Troca de Rosto", timestamp: new Date(),
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
        addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro: ${errorMessage}.`, timestamp: new Date() });
    } finally {
        setConversations((prev) => prev.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.filter(msg => msg.id !== loadingMessageId) } : c));
    }
  }, [addMessage, activeConversationId]);

  const handlePerformFaceTreatment = useCallback(async (imageFile: File) => {
    setIsFaceTreatmentModalOpen(false);

    const readAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });

    const imageUrl = await readAsDataURL(imageFile);

    const userMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'user',
        type: 'image-upload',
        imageUrls: [imageUrl],
        content: "Solicitação de Tratamento de Pele e Rosto",
        promptUsed: "__FACE_TREATMENT__",
        timestamp: new Date(),
    };
  
    addMessage(userMessage);
  
    const loadingMessageId = uuidv4();
    addMessage({ id: loadingMessageId, sender: 'ai', type: 'loading-indicator', content: 'A IA está a tratar a imagem...', timestamp: new Date() });
    
    try {
        const imageBase64 = imageUrl.split(',')[1];
        const resultBase64 = await performFaceTreatment(imageBase64, imageFile.type);
        const resultImageUrl = `data:${imageFile.type};base64,${resultBase64}`;
        
        const newHistoryEntry = createNewHistoryEntry(imageUrl, resultImageUrl, imageFile.type, "Tratamento de Pele e Rosto");
        setEnhancedImageHistory(prev => [...prev, newHistoryEntry]);

        addMessage({
            id: uuidv4(), sender: 'ai', type: 'image-enhanced', historyId: newHistoryEntry.id,
            imageUrls: [resultImageUrl], imageMimeType: imageFile.type,
            content: `Tratamento de pele e rosto concluído! (Clique para editar)`, promptUsed: "Tratamento de Pele e Rosto", timestamp: new Date(),
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
        addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro: ${errorMessage}.`, timestamp: new Date() });
    } finally {
        setConversations((prev) => prev.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.filter(msg => msg.id !== loadingMessageId) } : c));
    }
  }, [addMessage, activeConversationId]);

  const handlePerformBackgroundChange = useCallback(async (imageFile: File, prompt: string) => {
    setIsChangeBackgroundModalOpen(false);

    const readAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });

    const imageUrl = await readAsDataURL(imageFile);

    const userMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'user',
        type: 'image-upload',
        imageUrls: [imageUrl],
        content: `Alterar fundo para: "${prompt}"`,
        promptUsed: "__CHANGE_BACKGROUND__",
        timestamp: new Date(),
    };

    addMessage(userMessage);

    const loadingMessageId = uuidv4();
    addMessage({ id: loadingMessageId, sender: 'ai', type: 'loading-indicator', content: 'A IA está a alterar o fundo...', timestamp: new Date() });
    
    try {
        const imageBase64 = imageUrl.split(',')[1];
        const resultBase64 = await changeImageBackground(imageBase64, imageFile.type, prompt);
        const resultImageUrl = `data:${imageFile.type};base64,${resultBase64}`;
        
        const newHistoryEntry = createNewHistoryEntry(imageUrl, resultImageUrl, imageFile.type, `Fundo alterado para: ${prompt}`);
        setEnhancedImageHistory(prev => [...prev, newHistoryEntry]);

        addMessage({
            id: uuidv4(), sender: 'ai', type: 'image-enhanced', historyId: newHistoryEntry.id,
            imageUrls: [resultImageUrl], imageMimeType: imageFile.type,
            content: `Fundo alterado com sucesso! (Clique para editar)`, promptUsed: `Fundo alterado para: ${prompt}`, timestamp: new Date(),
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
        addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro: ${errorMessage}.`, timestamp: new Date() });
    } finally {
        setConversations((prev) => prev.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.filter(msg => msg.id !== loadingMessageId) } : c));
    }
  }, [addMessage, activeConversationId]);

  const handlePerformAgeChange = useCallback(async (imageFile: File, currentAge: number, desiredAge: number, mode: 'rejuvenate' | 'age') => {
    setIsAgeChangeModalOpen(false);
    
    const readAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });

    const imageUrl = await readAsDataURL(imageFile);

    const userMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'user',
        type: 'image-upload',
        imageUrls: [imageUrl],
        content: `Solicitação de Alteração de Idade: De ${currentAge} para ${desiredAge} anos.`,
        promptUsed: "__AGE_CHANGE__",
        timestamp: new Date(),
    };
  
    addMessage(userMessage);
  
    const loadingMessageId = uuidv4();
    addMessage({ id: loadingMessageId, sender: 'ai', type: 'loading-indicator', content: 'A IA está a ajustar a idade na imagem...', timestamp: new Date() });
    
    try {
        const imageBase64 = imageUrl.split(',')[1];
        const resultBase64 = await changeAge(imageBase64, imageFile.type, currentAge, desiredAge, mode);
        const resultImageUrl = `data:${imageFile.type};base64,${resultBase64}`;
        
        const promptUsed = `Alteração de idade: De ${currentAge} para ${desiredAge} anos.`;
        const newHistoryEntry = createNewHistoryEntry(imageUrl, resultImageUrl, imageFile.type, promptUsed);
        setEnhancedImageHistory(prev => [...prev, newHistoryEntry]);

        addMessage({
            id: uuidv4(), sender: 'ai', type: 'image-enhanced', historyId: newHistoryEntry.id,
            imageUrls: [resultImageUrl], imageMimeType: imageFile.type,
            content: `Alteração de idade concluída! (Clique para editar)`, promptUsed: promptUsed, timestamp: new Date(),
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
        addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro: ${errorMessage}.`, timestamp: new Date() });
    } finally {
        setConversations((prev) => prev.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.filter(msg => msg.id !== loadingMessageId) } : c));
    }
  }, [addMessage, activeConversationId]);


  const handleSendMessage = useCallback(async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || status === AppStatus.LOADING) return;

    setStatus(AppStatus.LOADING);
    const historyBeforeSend = [...activeConversationMessages];
    
    const userMessage: ChatMessage = { 
        id: uuidv4(), 
        sender: 'user', 
        type: 'text', 
        content: trimmedPrompt, 
        promptUsed: trimmedPrompt, 
        timestamp: new Date() 
    };

    addMessage(userMessage);
    const loadingMessageId = uuidv4();
    addMessage({ id: loadingMessageId, sender: 'ai', type: 'loading-indicator', content: 'A processar...', timestamp: new Date() });

    try {
        const aiResponse = await generateContent(trimmedPrompt, historyBeforeSend);
        if (aiResponse.type === 'image') {
              const newHistoryEntry = createNewHistoryEntry('', aiResponse.data, aiResponse.mimeType || 'image/png', trimmedPrompt);
              setEnhancedImageHistory(prev => [...prev, newHistoryEntry]);
              addMessage({
                id: uuidv4(), sender: 'ai', type: 'image-enhanced', historyId: newHistoryEntry.id,
                imageUrls: [newHistoryEntry.enhancedImageSrc], imageMimeType: newHistoryEntry.imageMimeType,
                content: 'Imagem gerada a partir do seu prompt:', promptUsed: trimmedPrompt, timestamp: new Date(),
            });
        } else {
             addMessage({ 
                id: uuidv4(), 
                sender: 'ai', 
                type: 'audio', 
                content: aiResponse.data, 
                audioUrl: aiResponse.audioUrl,
                timestamp: new Date() 
            });
        }
        setStatus(AppStatus.SUCCESS);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido ao gerar o conteúdo.";
        addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro: ${errorMessage}.`, timestamp: new Date() });
        setStatus(AppStatus.ERROR);
    } finally {
        setConversations((prev) => prev.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.filter(msg => msg.id !== loadingMessageId) } : c));
    }
  }, [addMessage, status, activeConversationMessages, activeConversationId]);
  
   const handleSendImageWithPrompt = useCallback(async (imageFile: File, prompt: string) => {
    if (!imageFile || status === AppStatus.LOADING) return;

    setStatus(AppStatus.LOADING);

    const readAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
    
    const imageUrl = await readAsDataURL(imageFile);
    
    const userMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'user',
      type: 'image-upload',
      imageUrls: [imageUrl],
      content: prompt,
      promptUsed: prompt || "Aprimoramento automático",
      timestamp: new Date(),
    };
    addMessage(userMessage);

    const loadingMessageId = uuidv4();
    addMessage({ id: loadingMessageId, sender: 'ai', type: 'loading-indicator', content: 'A IA está a trabalhar na sua imagem...', timestamp: new Date() });
    
    try {
      const base64ImageData = imageUrl.split(',')[1];
      const enhancedBase64 = await enhanceImage(base64ImageData, imageFile.type, prompt);
      const enhancedImageUrl = `data:${imageFile.type};base64,${enhancedBase64}`;

      const newHistoryEntry = createNewHistoryEntry(imageUrl, enhancedImageUrl, imageFile.type, prompt);
      setEnhancedImageHistory(prev => [...prev, newHistoryEntry]);
      
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'ai',
        type: 'image-enhanced',
        imageUrls: [enhancedImageUrl],
        imageMimeType: imageFile.type,
        content: `Aprimoramento concluído! (Clique para editar)`,
        promptUsed: prompt,
        historyId: newHistoryEntry.id,
        timestamp: new Date(),
      };
      addMessage(aiMessage);
      setStatus(AppStatus.SUCCESS);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro: ${errorMessage}.`, timestamp: new Date() });
      setStatus(AppStatus.ERROR);
    } finally {
      setConversations((prev) => prev.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.filter(msg => msg.id !== loadingMessageId) } : c));
    }
  }, [addMessage, status, activeConversationId]);

  const handlePerformObjectRemoval = useCallback(async (imageFile: File, maskBase64: string) => {
    setIsMagicEraserModalOpen(false);
    const imageUrl = await new Promise<string>(res => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.readAsDataURL(imageFile);
    });
    addMessage({ id: uuidv4(), sender: 'user', type: 'image-upload', imageUrls: [imageUrl], content: 'Remoção de objeto', timestamp: new Date() });
    const loadingMessageId = uuidv4();
    addMessage({ id: loadingMessageId, sender: 'ai', type: 'loading-indicator', content: 'A IA está a remover o objeto...', timestamp: new Date() });
    try {
      const imageBase64 = imageUrl.split(',')[1];
      const resultBase64 = await removeObjectFromImage(imageBase64, imageFile.type, maskBase64);
      const resultImageUrl = `data:${imageFile.type};base64,${resultBase64}`;
      const newHistoryEntry = createNewHistoryEntry(imageUrl, resultImageUrl, imageFile.type, "Remoção Mágica de Objeto");
      setEnhancedImageHistory(prev => [...prev, newHistoryEntry]);
      addMessage({
        id: uuidv4(), sender: 'ai', type: 'image-enhanced', historyId: newHistoryEntry.id,
        imageUrls: [resultImageUrl], content: 'Objeto removido com sucesso!', timestamp: new Date(),
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro: ${errorMessage}.`, timestamp: new Date() });
    } finally {
      setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.filter(msg => msg.id !== loadingMessageId) } : c));
    }
  }, [addMessage, activeConversationId]);

  const handlePerformPhotoRestoration = useCallback(async (imageFile: File) => {
    setIsRestorePhotoModalOpen(false);
    const imageUrl = await new Promise<string>(res => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.readAsDataURL(imageFile);
    });
    addMessage({ id: uuidv4(), sender: 'user', type: 'image-upload', imageUrls: [imageUrl], content: 'Restaurar foto antiga', timestamp: new Date() });
    const loadingMessageId = uuidv4();
    addMessage({ id: loadingMessageId, sender: 'ai', type: 'loading-indicator', content: 'A IA está a restaurar a sua foto...', timestamp: new Date() });
    try {
      const imageBase64 = imageUrl.split(',')[1];
      const resultBase64 = await restoreOldPhoto(imageBase64, imageFile.type);
      const resultImageUrl = `data:${imageFile.type};base64,${resultBase64}`;
      const newHistoryEntry = createNewHistoryEntry(imageUrl, resultImageUrl, imageFile.type, "Foto Antiga Restaurada");
      setEnhancedImageHistory(prev => [...prev, newHistoryEntry]);
      addMessage({
        id: uuidv4(), sender: 'ai', type: 'image-enhanced', historyId: newHistoryEntry.id,
        imageUrls: [resultImageUrl], content: 'Foto restaurada com sucesso!', timestamp: new Date(),
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro: ${errorMessage}.`, timestamp: new Date() });
    } finally {
       setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.filter(msg => msg.id !== loadingMessageId) } : c));
    }
  }, [addMessage, activeConversationId]);
  
  const handlePerformStyleTransfer = useCallback(async (imageFile: File, stylePrompt: string) => {
    setIsStyleTransferModalOpen(false);
    const imageUrl = await new Promise<string>(res => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.readAsDataURL(imageFile);
    });
    addMessage({ id: uuidv4(), sender: 'user', type: 'image-upload', imageUrls: [imageUrl], content: `Aplicar estilo: "${stylePrompt}"`, timestamp: new Date() });
    const loadingMessageId = uuidv4();
    addMessage({ id: loadingMessageId, sender: 'ai', type: 'loading-indicator', content: 'A IA está a aplicar o estilo...', timestamp: new Date() });
    try {
      const imageBase64 = imageUrl.split(',')[1];
      const resultBase64 = await transferImageStyle(imageBase64, imageFile.type, stylePrompt);
      const resultImageUrl = `data:${imageFile.type};base64,${resultBase64}`;
      const newHistoryEntry = createNewHistoryEntry(imageUrl, resultImageUrl, imageFile.type, `Estilo: ${stylePrompt}`);
      setEnhancedImageHistory(prev => [...prev, newHistoryEntry]);
      addMessage({
        id: uuidv4(), sender: 'ai', type: 'image-enhanced', historyId: newHistoryEntry.id,
        imageUrls: [resultImageUrl], content: 'Estilo aplicado com sucesso!', timestamp: new Date(),
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro: ${errorMessage}.`, timestamp: new Date() });
    } finally {
       setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.filter(msg => msg.id !== loadingMessageId) } : c));
    }
  }, [addMessage, activeConversationId]);
  
  const handleNativeImageSelected = useCallback((file: File) => {
    setIsNativeEditModalOpen(false);
    
    const reader = new FileReader();
    reader.onloadend = () => {
        const imageUrl = reader.result as string;
        
        const newHistoryEntry = createNewHistoryEntry(imageUrl, imageUrl, file.type, "Edição Local");
        
        setEnhancedImageHistory(prev => {
          const newHistory = [...prev, newHistoryEntry];
          const newIndex = newHistory.length - 1;
          setCurrentHistoryIndex(newIndex);
          setIsFinalizationViewOpen(true);
          return newHistory;
        });
    };
    reader.readAsDataURL(file);
  }, []);
  
  const handleOpenFinalizationView = useCallback((historyId: string) => {
    const index = enhancedImageHistory.findIndex(entry => entry.id === historyId);
    if (index !== -1) {
      setCurrentHistoryIndex(index);
      setIsFinalizationViewOpen(true);
    }
  }, [enhancedImageHistory]);

  const handleNavigateFinalization = useCallback((direction: 'prev' | 'next') => {
    setCurrentHistoryIndex(prev => {
      if (prev === null) return null;
      const newIndex = direction === 'prev' ? prev - 1 : prev + 1;
      if (newIndex >= 0 && newIndex < enhancedImageHistory.length) {
        return newIndex;
      }
      return prev;
    });
  }, [enhancedImageHistory.length]);

  const handleSaveAdjustments = useCallback((updatedEntry: EnhancedImageHistoryEntry) => {
    setEnhancedImageHistory(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
  }, []);

  const handleResetAdjustments = useCallback((historyId: string) => {
    setEnhancedImageHistory(prev => prev.map(entry => {
      if (entry.id === historyId) {
        return {
          ...entry,
          enhancedImageSrc: entry.uncroppedEnhancedImageSrc || entry.enhancedImageSrc, // Revert to uncropped
          appliedFilter: ImageFilter.NONE,
          appliedBrightness: 100,
          appliedContrast: 100,
          appliedSocialMediaFilter: SocialMediaFilter.NONE,
          appliedSocialMediaFilterIntensity: 100,
          appliedAIFilter: AIFilter.NONE,
        };
      }
      return entry;
    }));
  }, []);
  
  const handleApplyCrop = useCallback((historyId: string, croppedImageSrc: string) => {
    setEnhancedImageHistory(prev => prev.map(entry => 
      entry.id === historyId ? { ...entry, enhancedImageSrc: croppedImageSrc } : entry
    ));
  }, []);

  const handleApplyAIFilter = useCallback(async (historyId: string, filter: AIFilter) => {
    const entry = enhancedImageHistory.find(e => e.id === historyId);
    if (!entry) return;

    const baseImageSrc = entry.uncroppedEnhancedImageSrc || entry.enhancedImageSrc;
    const [header, base64] = baseImageSrc.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    
    try {
        const resultBase64 = await applyAIFilter(base64, mimeType, filter);
        const newImageUrl = `data:${mimeType};base64,${resultBase64}`;
        
        setEnhancedImageHistory(prev => prev.map(e => {
            if (e.id === historyId) {
                return {
                    ...e,
                    enhancedImageSrc: newImageUrl,
                    uncroppedEnhancedImageSrc: newImageUrl, // New AI image becomes the base
                    appliedAIFilter: filter,
                    // Reset CSS adjustments as they were based on the old image
                    appliedFilter: ImageFilter.NONE,
                    appliedBrightness: 100,
                    appliedContrast: 100,
                    appliedSocialMediaFilter: SocialMediaFilter.NONE,
                    appliedSocialMediaFilterIntensity: 100,
                };
            }
            return e;
        }));
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
        addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro ao aplicar filtro de IA: ${errorMessage}.`, timestamp: new Date() });
    }
  }, [enhancedImageHistory, addMessage]);


  const handleDownloadSpecificImage = useCallback(async (entry: EnhancedImageHistoryEntry) => {
    const imageToDownload = entry.enhancedImageSrc;
    const filterToApply = [
      `brightness(${entry.appliedBrightness}%)`,
      `contrast(${entry.appliedContrast}%)`,
      entry.appliedFilter !== ImageFilter.NONE ? `${entry.appliedFilter}(1)` : '',
      getSocialMediaFilterStyle(entry.appliedSocialMediaFilter, entry.appliedSocialMediaFilterIntensity)
    ].filter(Boolean).join(' ');

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageToDownload;
    img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.filter = filterToApply;
            ctx.drawImage(img, 0, 0);
            
            // Apply watermark
            ctx.filter = 'none'; // Reset filter before drawing watermark
            await drawWatermarkOnCanvas(canvas);

            const link = document.createElement('a');
            link.download = `aprimorada-${entry.id.substring(0, 6)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };
  }, []);
  
  const handleRegenerate = useCallback(async (messageId: string) => {
    if (status === AppStatus.LOADING) return;

    const currentMessages = [...activeConversationMessages];
    const messageIndex = currentMessages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    let userPromptIndex = -1;
    for (let i = messageIndex - 1; i >= 0; i--) {
        if (currentMessages[i].sender === 'user') {
            userPromptIndex = i;
            break;
        }
    }

    if (userPromptIndex === -1) {
        addMessage({ id: uuidv4(), sender: 'ai', type: 'system-info', content: 'Não foi possível encontrar o prompt original para regenerar.', timestamp: new Date() });
        return;
    }

    const userPromptMessage = currentMessages[userPromptIndex];
    const promptToRegenerate = userPromptMessage.content || userPromptMessage.promptUsed || '';
    if (!promptToRegenerate) return;

    const historyForApi = currentMessages.slice(0, userPromptIndex);
    const messagesToKeep = currentMessages.slice(0, messageIndex);
    const loadingMessageId = uuidv4();

    // Fix: Explicitly type the loading message object to match ChatMessage interface
    const loadingMessage: ChatMessage = { id: loadingMessageId, sender: 'ai', type: 'loading-indicator', content: 'A regenerar...', timestamp: new Date() };

    setConversations(prev => prev.map(c => 
        c.id === activeConversationId 
            ? { ...c, messages: [...messagesToKeep, loadingMessage] }
            : c
    ));
    setShouldScrollToBottom(true);
    setStatus(AppStatus.LOADING);

    try {
        const aiResponse = await generateContent(promptToRegenerate, historyForApi);
        let newAiMessage: ChatMessage;

        if (aiResponse.type === 'image') {
          const newHistoryEntry = createNewHistoryEntry('', aiResponse.data, aiResponse.mimeType || 'image/png', promptToRegenerate);
          setEnhancedImageHistory(prev => [...prev, newHistoryEntry]);
          newAiMessage = {
            id: uuidv4(), sender: 'ai', type: 'image-enhanced', historyId: newHistoryEntry.id,
            imageUrls: [newHistoryEntry.enhancedImageSrc], imageMimeType: newHistoryEntry.imageMimeType,
            content: 'Imagem regenerada:', promptUsed: promptToRegenerate, timestamp: new Date(),
          };
        } else {
           newAiMessage = { 
            id: uuidv4(), sender: 'ai', type: 'audio', content: aiResponse.data, 
            audioUrl: aiResponse.audioUrl, timestamp: new Date() 
           };
        }
        
        setConversations(prev => prev.map(c => 
            c.id === activeConversationId 
                ? { ...c, messages: [...messagesToKeep, newAiMessage] } 
                : c
        ));
        setStatus(AppStatus.SUCCESS);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
        // Fix: Explicitly type the error message object to match ChatMessage interface
        const errorMsg: ChatMessage = { id: uuidv4(), sender: 'ai', type: 'system-info', content: `Erro ao regenerar: ${errorMessage}.`, timestamp: new Date() };
        setConversations(prev => prev.map(c => 
            c.id === activeConversationId 
                ? { ...c, messages: [...messagesToKeep, errorMsg] } 
                : c
        ));
        setStatus(AppStatus.ERROR);
    } finally {
        setShouldScrollToBottom(true);
    }
  }, [status, activeConversationMessages, activeConversationId, addMessage]);
  
  const handleViewImage = useCallback((src: string, entry?: EnhancedImageHistoryEntry, index?: number) => {
      setViewingImage({ src, entry, index });
  }, []);

  const handleNavigateViewer = useCallback((direction: 'prev' | 'next') => {
    setViewingImage(prev => {
        if (!prev || typeof prev.index === 'undefined' || !prev.entry) return prev;
        
        const gallery = [...enhancedImageHistory].reverse();
        const galleryIndex = gallery.findIndex(item => item.id === prev.entry?.id);

        if (galleryIndex === -1) return prev;

        const newGalleryIndex = direction === 'prev' ? galleryIndex + 1 : galleryIndex - 1;
        
        if (newGalleryIndex >= 0 && newGalleryIndex < gallery.length) {
            const newEntry = gallery[newGalleryIndex];
            const originalFullHistoryIndex = enhancedImageHistory.findIndex(item => item.id === newEntry.id);
            return { src: newEntry.enhancedImageSrc, entry: newEntry, index: originalFullHistoryIndex };
        }
        return prev;
    });
  }, [enhancedImageHistory]);
  
  const handleEditFromViewer = useCallback(() => {
    if (viewingImage && viewingImage.entry) {
        handleOpenFinalizationView(viewingImage.entry.id);
        setViewingImage(null);
    }
  }, [viewingImage, handleOpenFinalizationView]);

  const handleOpenCreativeToolsModal = () => setIsCreativeToolsModalOpen(true);
  
  const handleSelectCreativeTool = (toolAction: () => void) => {
    setIsCreativeToolsModalOpen(false);
    toolAction();
  };

  const handleViewImageFromChat = useCallback((historyId: string) => {
    const index = enhancedImageHistory.findIndex(entry => entry.id === historyId);
    if (index !== -1) {
        const entry = enhancedImageHistory[index];
        handleViewImage(entry.enhancedImageSrc, entry, index);
    }
  }, [enhancedImageHistory, handleViewImage]);


  return (
    <div className="h-full w-full flex flex-col bg-appBg text-primaryText">
      <AppHeader
        appName={appName}
        appDescription={appDescription}
        isDarkMode={isDarkMode}
        currentView={currentView}
        onNavigateToChat={() => setCurrentView('chat')}
        onNavigateToGallery={() => setCurrentView('gallery')}
        onNavigateToConversations={() => setCurrentView('conversations')}
        onNavigateToDocumentation={() => setCurrentView('documentation')}
        onNewChat={handleNewChat}
        onClearData={handleClearDataRequest}
      />

      <main ref={chatHistoryRef} className={`flex-1 w-full overflow-y-auto custom-scrollbar pt-24 ${showChatInput ? 'pb-28' : 'pb-4'}`}>
        {currentView === 'chat' && (
          <ChatScreen
            messages={activeConversationMessages}
            showIntroContent={showIntroContent}
            onPromptSuggestionClick={handleSendMessage}
            onStartChat={handleStartChat}
            isDarkMode={isDarkMode}
            onViewEnhancedImage={handleViewImageFromChat}
            onOpenClothingSwapModal={() => setIsClothingSwapSelectionModalOpen(true)}
            onOpenFaceSwapModal={() => setIsFaceSwapModalOpen(true)}
            onOpenFaceTreatmentModal={() => setIsFaceTreatmentModalOpen(true)}
            onOpenAnimateImageModal={handleOpenAnimateImageModal}
            onOpenChangeBackgroundModal={() => setIsChangeBackgroundModalOpen(true)}
            onOpenNativeEditModal={() => setIsNativeEditModalOpen(true)}
            onOpenMagicEraserModal={() => setIsMagicEraserModalOpen(true)}
            onOpenRestorePhotoModal={() => setIsRestorePhotoModalOpen(true)}
            onOpenStyleTransferModal={() => setIsStyleTransferModalOpen(true)}
            onOpenAgeChangeModal={() => setIsAgeChangeModalOpen(true)}
            onRegenerate={handleRegenerate}
            onViewImage={(src) => handleViewImage(src)}
            onOpenCreativeToolsModal={handleOpenCreativeToolsModal}
          />
        )}
        {currentView === 'gallery' && <GalleryScreen gallery={enhancedImageHistory} onViewImage={(entry, index) => handleViewImage(entry.enhancedImageSrc, entry, index)} isDarkMode={isDarkMode} />}
        {currentView === 'conversations' && (
            <ConversationsScreen 
                conversations={conversations} 
                onSelectConversation={handleSelectConversation}
                onDeleteConversationRequest={handleDeleteConversationRequest}
                onNewChat={handleNewChat}
                isDarkMode={isDarkMode}
            />
        )}
        {currentView === 'documentation' && <DocumentationScreen isDarkMode={isDarkMode} />}
      </main>

      {showChatInput && (
        <footer className="fixed bottom-0 left-0 right-0 w-full bg-gradient-to-t from-appBg to-transparent">
          <ChatInputBar
            onOpenImageModal={() => setIsImageModalOpen(true)}
            onSendMessage={handleSendMessage}
            isLoading={status === AppStatus.LOADING}
            isDarkMode={isDarkMode}
          />
        </footer>
      )}

      {isImageModalOpen && (
        <ImageSelectionModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onSend={handleSendImageWithPrompt}
          isDarkMode={isDarkMode}
        />
      )}

       {isClothingSwapSelectionModalOpen && (
        <ClothingSwapSelectionModal
          isOpen={isClothingSwapSelectionModalOpen}
          onClose={() => setIsClothingSwapSelectionModalOpen(false)}
          onPerformSwap={handlePerformClothingSwap}
          isDarkMode={isDarkMode}
        />
      )}
      
       {isFaceSwapModalOpen && (
        <FaceSwapSelectionModal
          isOpen={isFaceSwapModalOpen}
          onClose={() => setIsFaceSwapModalOpen(false)}
          onPerformSwap={handlePerformFaceSwap}
          isDarkMode={isDarkMode}
        />
      )}

       {isFaceTreatmentModalOpen && (
        <FaceTreatmentSelectionModal
          isOpen={isFaceTreatmentModalOpen}
          onClose={() => setIsFaceTreatmentModalOpen(false)}
          onPerformTreatment={handlePerformFaceTreatment}
          isDarkMode={isDarkMode}
        />
      )}
      
       {isAnimateImageModalOpen && (
        <AnimateImageModal
          isOpen={isAnimateImageModalOpen}
          onClose={() => setIsAnimateImageModalOpen(false)}
          onAnimate={handleAnimateImage}
          isDarkMode={isDarkMode}
        />
      )}
      
       {isChangeBackgroundModalOpen && (
        <ChangeBackgroundModal
          isOpen={isChangeBackgroundModalOpen}
          onClose={() => setIsChangeBackgroundModalOpen(false)}
          onConfirm={handlePerformBackgroundChange}
          isDarkMode={isDarkMode}
        />
      )}

      {isNativeEditModalOpen && (
        <NativeEditSelectionModal
            isOpen={isNativeEditModalOpen}
            onClose={() => setIsNativeEditModalOpen(false)}
            onImageConfirmed={handleNativeImageSelected}
            isDarkMode={isDarkMode}
        />
      )}
      
      {isMagicEraserModalOpen && (
        <MagicEraserModal
          isOpen={isMagicEraserModalOpen}
          onClose={() => setIsMagicEraserModalOpen(false)}
          onPerformRemoval={handlePerformObjectRemoval}
          isDarkMode={isDarkMode}
        />
      )}

      {isRestorePhotoModalOpen && (
        <RestorePhotoModal
          isOpen={isRestorePhotoModalOpen}
          onClose={() => setIsRestorePhotoModalOpen(false)}
          onPerformRestore={handlePerformPhotoRestoration}
          isDarkMode={isDarkMode}
        />
      )}

      {isStyleTransferModalOpen && (
        <StyleTransferModal
          isOpen={isStyleTransferModalOpen}
          onClose={() => setIsStyleTransferModalOpen(false)}
          onConfirm={handlePerformStyleTransfer}
          isDarkMode={isDarkMode}
        />
      )}

      {isAgeChangeModalOpen && (
        <AgeChangeModal
          isOpen={isAgeChangeModalOpen}
          onClose={() => setIsAgeChangeModalOpen(false)}
          onConfirm={handlePerformAgeChange}
          isDarkMode={isDarkMode}
        />
      )}

      {isFinalizationViewOpen && currentHistoryIndex !== null && (
        <ImageFinalizationView
          isOpen={isFinalizationViewOpen}
          onClose={() => setIsFinalizationViewOpen(false)}
          imageEntry={enhancedImageHistory[currentHistoryIndex]}
          currentIndex={currentHistoryIndex}
          historyLength={enhancedImageHistory.length}
          onNavigate={handleNavigateFinalization}
          onDownloadSpecificImage={handleDownloadSpecificImage}
          onSaveImageEntryAdjustments={handleSaveAdjustments}
          onApplyCrop={handleApplyCrop}
          onResetAdjustments={handleResetAdjustments}
          onApplyAIFilter={handleApplyAIFilter}
          addMessage={addMessage}
          isDarkMode={isDarkMode}
        />
      )}
      
      {viewingImage && (
          <SimpleImageViewer
              isOpen={!!viewingImage}
              onClose={() => setViewingImage(null)}
              imageSrc={viewingImage.src}
              isDarkMode={isDarkMode}
              onEdit={viewingImage.entry ? handleEditFromViewer : undefined}
              onNavigate={viewingImage.entry ? handleNavigateViewer : undefined}
              currentIndex={viewingImage.index}
              galleryLength={enhancedImageHistory.length}
          />
      )}

      {confirmationAction && (
        <ConfirmationModal
            isOpen={!!confirmationAction}
            onClose={() => setConfirmationAction(null)}
            onConfirm={() => {
                confirmationAction.onConfirm();
                setConfirmationAction(null);
            }}
            title={confirmationAction.title}
            message={confirmationAction.message}
            isDarkMode={isDarkMode}
        />
      )}

      {isCreativeToolsModalOpen && (
        <CreativeToolsModal
          isOpen={isCreativeToolsModalOpen}
          onClose={() => setIsCreativeToolsModalOpen(false)}
          onOpenNativeEditModal={() => handleSelectCreativeTool(() => setIsNativeEditModalOpen(true))}
          onOpenAnimateImageModal={() => handleSelectCreativeTool(handleOpenAnimateImageModal)}
          onOpenClothingSwapModal={() => handleSelectCreativeTool(() => setIsClothingSwapSelectionModalOpen(true))}
          onOpenFaceSwapModal={() => handleSelectCreativeTool(() => setIsFaceSwapModalOpen(true))}

          onOpenFaceTreatmentModal={() => handleSelectCreativeTool(() => setIsFaceTreatmentModalOpen(true))}
          onOpenAgeChangeModal={() => handleSelectCreativeTool(() => setIsAgeChangeModalOpen(true))}
          onOpenChangeBackgroundModal={() => handleSelectCreativeTool(() => setIsChangeBackgroundModalOpen(true))}
          onOpenMagicEraserModal={() => handleSelectCreativeTool(() => setIsMagicEraserModalOpen(true))}
          onOpenRestorePhotoModal={() => handleSelectCreativeTool(() => setIsRestorePhotoModalOpen(true))}
          onOpenStyleTransferModal={() => handleSelectCreativeTool(() => setIsStyleTransferModalOpen(true))}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default App;
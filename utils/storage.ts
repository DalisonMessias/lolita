import { Conversation, EnhancedImageHistoryEntry, ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';

const CONVERSATIONS_KEY_LS = 'revo_foto_conversations';
const ACTIVE_CONVERSATION_ID_KEY = 'revo_foto_active_conversation_id';

// --- IndexedDB Configuration ---
const DB_NAME = 'revo_foto_db';
const DB_VERSION = 2; // Incremented version for schema change
const GALLERY_STORE_NAME = 'image_gallery';
const CONVERSATIONS_STORE_NAME = 'conversations_store';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(new Error("Erro ao abrir IndexedDB."));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(GALLERY_STORE_NAME)) {
        db.createObjectStore(GALLERY_STORE_NAME, { keyPath: 'id' });
      }
      // New store for conversations
      if (!db.objectStoreNames.contains(CONVERSATIONS_STORE_NAME)) {
        db.createObjectStore(CONVERSATIONS_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const dataURLtoBlob = (dataurl: string): Blob | null => {
    try {
        const arr = dataurl.split(',');
        if (arr.length < 2) return null;
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) return null;
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    } catch (error) {
        console.error("Erro ao converter data URL para Blob:", error);
        return null;
    }
}

const urlToBlob = async (src: string | null): Promise<Blob | null> => {
    if (!src) return null;
    if (src.startsWith('blob:')) {
        try {
            const response = await fetch(src);
            return await response.blob();
        } catch(e) {
            console.error("Não foi possível buscar o URL do blob, ele pode ter sido revogado.", e);
            return null;
        }
    }
    return dataURLtoBlob(src);
};

// --- Conversation Management (Now with IndexedDB) ---

export const saveConversations = async (conversations: Conversation[]): Promise<void> => {
  try {
    const db = await openDB();

    const storableConversations = await Promise.all(
      conversations.map(async (convo) => {
        const storableMessages = await Promise.all(
          convo.messages.map(async (msg: ChatMessage) => {
            const { imageUrls, videoUrl, audioUrl, ...rest } = msg;
            let imageBlobs: (Blob | null)[] | undefined = undefined;
            let videoBlob: Blob | null | undefined = undefined;
            let audioBlob: Blob | null | undefined = undefined;

            if (imageUrls) {
              imageBlobs = await Promise.all(imageUrls.map(url => urlToBlob(url)));
            }
            if (videoUrl) {
              videoBlob = await urlToBlob(videoUrl);
            }
            if (audioUrl) {
              audioBlob = await urlToBlob(audioUrl);
            }
            
            return { ...rest, imageBlobs, videoBlob, audioBlob };
          })
        );
        return { ...convo, messages: storableMessages };
      })
    );
    
    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(CONVERSATIONS_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(CONVERSATIONS_STORE_NAME);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || "Erro na transação ao salvar conversas.");

        const clearRequest = store.clear();
        clearRequest.onsuccess = () => {
            storableConversations.forEach(convo => {
                store.put(convo);
            });
        };
    });
  } catch (error) {
    console.error("Não foi possível guardar as conversas no IndexedDB", error);
  }
};

const migrateOldConversationsFromLS = (): Conversation[] => {
    try {
        const serializedState = localStorage.getItem(CONVERSATIONS_KEY_LS);
        if (serializedState) {
            const conversations: Conversation[] = JSON.parse(serializedState).map((convo: any) => ({
                ...convo,
                lastModified: new Date(convo.lastModified),
                messages: convo.messages.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp),
                })),
            }));
            
            if (conversations.length > 0) {
                saveConversations(conversations).then(() => {
                    console.log("Conversas antigas migradas com sucesso para o IndexedDB.");
                    localStorage.removeItem(CONVERSATIONS_KEY_LS);
                });
            }
            return conversations;
        }
    } catch (error) {
        console.error("Falha ao migrar conversas do localStorage:", error);
    }
    return [];
};


export const loadConversations = async (): Promise<Conversation[]> => {
  try {
    const db = await openDB();
    const conversations = await new Promise<any[]>((resolve, reject) => {
      const transaction = db.transaction(CONVERSATIONS_STORE_NAME, 'readonly');
      const store = transaction.objectStore(CONVERSATIONS_STORE_NAME);
      const request = store.getAll();
      request.onerror = () => reject(request.error || "Erro ao carregar conversas do IndexedDB.");
      request.onsuccess = () => resolve(request.result);
    });

    if (conversations.length === 0) {
        return migrateOldConversationsFromLS();
    }

    return conversations.map(convo => ({
      ...convo,
      lastModified: new Date(convo.lastModified),
      messages: convo.messages.map((msg: any) => {
        const { imageBlobs, videoBlob, audioBlob, ...rest } = msg;
        let imageUrls: string[] | undefined = undefined;
        let videoUrl: string | undefined = undefined;
        let audioUrl: string | undefined = undefined;

        if (imageBlobs) {
          imageUrls = imageBlobs.map((blob: Blob | null) => blob ? URL.createObjectURL(blob) : '').filter(Boolean);
        }
        if (videoBlob) {
          videoUrl = URL.createObjectURL(videoBlob);
        }
        if (audioBlob) {
          audioUrl = URL.createObjectURL(audioBlob);
        }

        return {
          ...rest,
          timestamp: new Date(rest.timestamp),
          imageUrls,
          videoUrl,
          audioUrl,
        };
      }),
    }));
  } catch (error) {
    console.error("Não foi possível carregar as conversas do IndexedDB, tentando localStorage como fallback.", error);
    return migrateOldConversationsFromLS();
  }
};


export const saveActiveConversationId = (id: string | null): void => {
    try {
        if (id) {
            localStorage.setItem(ACTIVE_CONVERSATION_ID_KEY, id);
        } else {
            localStorage.removeItem(ACTIVE_CONVERSATION_ID_KEY);
        }
    } catch (error) {
        console.error("Não foi possível guardar o ID da conversa ativa", error);
    }
};

export const loadActiveConversationId = (): string | null => {
    try {
        return localStorage.getItem(ACTIVE_CONVERSATION_ID_KEY);
    } catch (error) {
        console.error("Não foi possível carregar o ID da conversa ativa", error);
        return null;
    }
};


// --- Image Gallery Management (IndexedDB) ---

export const saveImageGallery = async (gallery: EnhancedImageHistoryEntry[]): Promise<void> => {
  try {
    const storableEntries = await Promise.all(
      gallery.map(async (entry) => {
        const { originalImageSrc, enhancedImageSrc, uncroppedEnhancedImageSrc, ...rest } = entry;
        const [originalImageBlob, enhancedImageBlob, uncroppedEnhancedImageBlob] = await Promise.all([
          urlToBlob(originalImageSrc),
          urlToBlob(enhancedImageSrc),
          urlToBlob(uncroppedEnhancedImageSrc)
        ]);
        return { ...rest, originalImageBlob, enhancedImageBlob, uncroppedEnhancedImageBlob };
      })
    );

    const db = await openDB();
    
    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(GALLERY_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(GALLERY_STORE_NAME);
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => {
            console.error("Erro na transação:", transaction.error);
            reject(transaction.error || new Error("Erro na transação do IndexedDB ao guardar galeria."));
        };

        const clearRequest = store.clear();
        clearRequest.onsuccess = () => {
            storableEntries.forEach(entry => store.put(entry));
        };
    });

  } catch (error) {
    console.error("Não foi possível guardar a galeria de imagens no IndexedDB", error);
  }
};

export const loadImageGallery = async (): Promise<EnhancedImageHistoryEntry[] | null> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(GALLERY_STORE_NAME, 'readonly');
    const store = transaction.objectStore(GALLERY_STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onerror = () => reject(new Error("Erro ao carregar galeria do IndexedDB."));
      request.onsuccess = () => {
        const results = request.result as any[];
        const gallery: EnhancedImageHistoryEntry[] = results.map(record => {
          const { originalImageBlob, enhancedImageBlob, uncroppedEnhancedImageBlob, ...rest } = record;
          return {
            ...rest,
            timestamp: new Date(rest.timestamp),
            originalImageSrc: originalImageBlob ? URL.createObjectURL(originalImageBlob) : '',
            enhancedImageSrc: enhancedImageBlob ? URL.createObjectURL(enhancedImageBlob) : '',
            uncroppedEnhancedImageSrc: uncroppedEnhancedImageBlob ? URL.createObjectURL(uncroppedEnhancedImageBlob) : null,
          };
        });
        resolve(gallery);
      };
    });
  } catch (error) {
    console.error("Não foi possível carregar a galeria de imagens do IndexedDB", error);
    return null;
  }
};

// --- Data Clearing ---

export const clearAllData = async (): Promise<void> => {
    try {
        // Limpar localStorage
        localStorage.removeItem(CONVERSATIONS_KEY_LS);
        localStorage.removeItem(ACTIVE_CONVERSATION_ID_KEY);

        // Limpar IndexedDB
        const db = await openDB();
        const galleryTransaction = db.transaction(GALLERY_STORE_NAME, 'readwrite');
        galleryTransaction.objectStore(GALLERY_STORE_NAME).clear();

        const convosTransaction = db.transaction(CONVERSATIONS_STORE_NAME, 'readwrite');
        convosTransaction.objectStore(CONVERSATIONS_STORE_NAME).clear();

    } catch (error) {
        console.error("Não foi possível limpar todos os dados", error);
    }
};
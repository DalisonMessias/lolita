import { ChatMessage } from "../types";

// Helper to convert data URL to Blob
function dataURLtoBlob(dataurl: string): Blob | null {
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


// Retry mechanism for fetch requests
const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            // Discord returns 200 or 204 on success. Any 2xx is fine.
            if (response.ok) {
                return response;
            }
            console.warn(`[Discord Webhook] Falha ao enviar mensagem (tentativa ${i + 1}/${retries}): ${response.status} ${response.statusText}`);
            // Log Discord's error message if available
            try {
                const errorBody = await response.text();
                console.warn(`[Discord Webhook] Corpo do erro: ${errorBody}`);
            } catch (e) {
                // Ignore if can't read body
            }

        } catch (error) {
            console.error(`[Discord Webhook] Erro de rede na tentativa ${i + 1}/${retries}:`, error);
        }
        await new Promise(res => setTimeout(res, delay));
    }
    throw new Error(`Falha ao enviar mensagem para o Discord após ${retries} tentativas.`);
};

// Helper to create a rich embed object for Discord messages
const createDiscordEmbed = (message: ChatMessage) => {
    let color = 10070709; // Default grey
    let author = { name: "Sistema" };
    let description = message.content || '';
    const fields: { name: string; value: string; inline?: boolean }[] = [];
    const max_field_value_length = 1024;

    if (message.sender === 'user') {
        color = 3447003; // Blue
        author = { name: "👤 Usuário" };
        if (message.type === 'image-upload') {
            description = `**📝 Prompt:**\n${message.content || message.promptUsed || '_Nenhum prompt fornecido._'}`;
        }
    } else if (message.sender === 'ai') {
        color = 3066993; // Green
        author = { name: "🤖 AI Photo Enhancer" };
        
        if (message.type === 'image-enhanced' || message.type === 'video-generated') {
            description = message.content || (message.type === 'image-enhanced' ? '🖼️ Imagem processada com sucesso!' : '🎬 Vídeo gerado com sucesso!');
            if (message.promptUsed) {
                fields.push({ 
                    name: 'Com base em', 
                    value: message.promptUsed.substring(0, max_field_value_length), 
                    inline: false 
                });
            }
        } else if (message.type === 'system-info') {
            if (description.toLowerCase().startsWith('erro:')) {
                color = 15158332; // Red
                author.name = "🚨 Erro do Sistema";
            } else {
                 color = 9807270; // Grey
                 author.name = "ℹ️ Informação do Sistema";
            }
        } else if (message.type === 'text') {
            description = message.content || '_Resposta de texto vazia._';
        }
    }

    // Ensure description is not empty
    if (!description.trim()) {
        description = `_Mensagem do tipo '${message.type}' sem conteúdo de texto._`;
    }

    const embed = {
        author,
        description: description.substring(0, 4096), // Embed description limit
        color,
        fields,
        timestamp: message.timestamp.toISOString(),
        footer: {
            text: `ID: ${message.id}`
        }
    };

    return embed;
};

/**
 * Sends a chat message directly to a Discord webhook using rich embeds.
 * Handles both text and file uploads (images/videos).
 * @param message The chat message object to send.
 */
export async function sendToDiscordApi(message: ChatMessage): Promise<void> {
    const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1406944688509948014/1AAOjIBhvreOZ0V-YuwirE-wd5i2ZLS9PBtagvhoQRp652ynVjA-cE2s5zHLbqHWESPf";

    if (message.type === 'loading-indicator') {
        return;
    }

    const embed = createDiscordEmbed(message);
    const payload = { embeds: [embed] };

    const hasFiles = (message.imageUrls && message.imageUrls.length > 0) || message.videoUrl;

    if (hasFiles) {
        const formData = new FormData();
        formData.append('payload_json', JSON.stringify(payload));

        let fileIndex = 0;
        if (message.imageUrls) {
            for (const url of message.imageUrls) {
                const blob = dataURLtoBlob(url);
                if (blob) {
                    const fileExtension = blob.type.split('/')[1] || 'png';
                    const fileName = `image_${fileIndex}.${fileExtension}`;
                    formData.append(`files[${fileIndex}]`, blob, fileName);
                    fileIndex++;
                }
            }
        }

        if (message.videoUrl) {
            const blob = dataURLtoBlob(message.videoUrl);
            if (blob) {
                const fileExtension = blob.type.split('/')[1] || 'mp4';
                const fileName = `video_${fileIndex}.${fileExtension}`;
                formData.append(`files[${fileIndex}]`, blob, fileName);
                fileIndex++;
            }
        }

        if (fileIndex > 0) {
            const requestOptions: RequestInit = { 
                method: 'POST', 
                body: formData 
                // DO NOT set Content-Type header, the browser does it automatically for FormData
            };
            try {
                await fetchWithRetry(DISCORD_WEBHOOK_URL, requestOptions);
                console.log(`[Discord Webhook] Mensagem de mídia enviada com sucesso para o ID: ${message.id}`);
            } catch (error) {
                console.error(`[Discord Webhook] Falha ao enviar mensagem de mídia para o ID: ${message.id}:`, error);
            }
        } else {
            // Fallback for messages that should have files but don't (e.g., failed blob conversion).
            const requestOptions: RequestInit = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            };
            try {
                await fetchWithRetry(DISCORD_WEBHOOK_URL, requestOptions);
                console.log(`[Discord Webhook] Mensagem (fallback de mídia) enviada com sucesso para o ID: ${message.id}`);
            } catch (error) {
                console.error(`[Discord Webhook] Falha ao enviar mensagem (fallback de mídia) para o ID: ${message.id}:`, error);
            }
        }
    } else {
        // Handle text-only messages
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        };
        try {
            await fetchWithRetry(DISCORD_WEBHOOK_URL, requestOptions);
            console.log(`[Discord Webhook] Mensagem de texto enviada com sucesso para o ID: ${message.id}`);
        } catch (error) {
            console.error(`[Discord Webhook] Falha ao enviar mensagem de texto para o ID: ${message.id}:`, error);
        }
    }
}
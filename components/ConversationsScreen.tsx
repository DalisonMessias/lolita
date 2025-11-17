import React from 'react';
import { Conversation } from '../types';

interface ConversationsScreenProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onDeleteConversationRequest: (id: string, title: string) => void;
  onNewChat: () => void;
  isDarkMode: boolean;
}

const ConversationsScreen: React.FC<ConversationsScreenProps> = ({
  conversations,
  onSelectConversation,
  onDeleteConversationRequest,
  onNewChat,
  isDarkMode,
}) => {
  const containerBg = 'bg-appBg';
  const textColor = 'text-primaryText';
  const secondaryTextColor = 'text-secondaryText';
  const itemBg = 'bg-inputBg';
  const itemHoverBg = 'hover:bg-aiBubble';
  const borderColor = 'border-borderColor';

  const conversationsWithContent = conversations.filter(
    convo => convo.messages.length > 1 || (convo.messages.length === 1 && convo.messages[0].type !== 'system-info')
  );

  if (conversationsWithContent.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${containerBg} ${textColor} p-8 text-center`}>
        <svg className={`w-16 h-16 mb-4 ${secondaryTextColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        <h2 className="text-2xl font-title">Nenhuma Conversa Salva</h2>
        <p className={`mt-2 ${secondaryTextColor}`}>Comece uma nova conversa e ela aparecerá aqui.</p>
        <button
            onClick={onNewChat}
            className="mt-6 px-6 py-2.5 bg-primaryAccent text-white rounded-full font-title text-base hover:bg-primaryAccentDark transition"
        >
            Nova Conversa
        </button>
      </div>
    );
  }

  const sortedConversations = [...conversationsWithContent].sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

  return (
    <div className={`p-4 md:p-6 ${containerBg} h-full overflow-y-auto custom-scrollbar`}>
      <h2 className={`text-2xl font-title ${textColor} mb-4`}>Conversas Salvas</h2>
      <div className="space-y-3">
        {sortedConversations.map(convo => (
          <div
            key={convo.id}
            className={`flex items-center justify-between p-4 rounded-lg ${itemBg} border ${borderColor} transition-colors duration-200 ${itemHoverBg}`}
          >
            <div 
              className="flex-1 cursor-pointer min-w-0" 
              onClick={() => onSelectConversation(convo.id)}
              aria-label={`Carregar conversa: ${convo.title}`}
            >
              <h3 className={`font-bold truncate ${textColor}`}>{convo.title}</h3>
              <p className={`text-xs ${secondaryTextColor}`}>
                Última modificação: {convo.lastModified.toLocaleString('pt-BR')}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversationRequest(convo.id, convo.title);
              }}
              className="p-2 ml-4 text-red-400 rounded-full hover:bg-red-900/50 transition-colors flex-shrink-0"
              aria-label={`Apagar conversa: ${convo.title}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationsScreen;

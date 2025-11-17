import React from 'react';

interface PromptSuggestionsProps {
  onPromptSuggestionClick: (prompt: string) => void;
  isDarkMode: boolean;
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onPromptSuggestionClick, isDarkMode }) => {

  const suggestions = [
    {
      text: "Como posso aprimorar detalhes e clareza de uma imagem?",
      icon: (
        <svg className="w-5 h-5 text-secondaryText icon-effect" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5a.75.75 0 00.75-.75v-1.94l-2.03-2.03a3.75 3.75 0 00-5.304 0L9.47 16.061l-4.183-4.183a1.125 1.125 0 00-1.59 0l-1.59 1.59zm14.25-8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
      ),
      action: () => onPromptSuggestionClick("Como posso aprimorar detalhes e clareza de uma imagem?"),
    },
    {
      text: "Sugira um estilo para deixar minhas fotos mais profissionais.",
      icon: (
        <svg className="w-5 h-5 text-secondaryText icon-effect" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
        </svg>
      ),
      action: () => onPromptSuggestionClick("Sugira um estilo para deixar minhas fotos mais profissionais."),
    },
    {
      text: "Quais ajustes posso fazer para melhorar cores e iluminação?",
      icon: (
        <svg className="w-5 h-5 text-secondaryText icon-effect" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM7.758 6.697a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.06l1.591-1.59z" />
        </svg>
      ),
      action: () => onPromptSuggestionClick("Quais ajustes posso fazer para melhorar cores e iluminação?"),
    },
  ];

  return (
    <div className="w-full max-w-sm md:max-w-3xl lg:max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-xl font-title mb-4 text-primaryText">Sugestões de Prompt</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="relative group">
            <button
              onClick={suggestion.action}
              className={`w-full text-left p-4 bg-inputBg rounded-lg border border-borderColor flex items-center gap-4 transition-colors duration-200 hover:bg-gray-700 hover:border-gray-500`}
            >
              {suggestion.icon}
              <span className="flex-1 text-sm text-primaryText">{suggestion.text}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
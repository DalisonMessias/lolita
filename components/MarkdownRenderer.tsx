import React from 'react';

interface MarkdownRendererProps {
  text: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text, className }) => {
  // Dividir o texto pelo padrão de negrito do markdown, mantendo os delimitadores
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <div className={`text-sm break-words whitespace-pre-wrap ${className || ''}`}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="font-bold text-primaryAccent">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      })}
    </div>
  );
};

export default MarkdownRenderer;

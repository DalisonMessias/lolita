import React from 'react';

interface DocumentationScreenProps {
  isDarkMode: boolean;
}

const DocumentationScreen: React.FC<DocumentationScreenProps> = ({ isDarkMode }) => {
  const containerBg = 'bg-appBg';
  const textColor = 'text-primaryText';
  const secondaryTextColor = 'text-secondaryText';
  const titleColor = 'text-primaryAccent';
  const sectionBg = 'bg-inputBg';
  const borderColor = 'border-borderColor';

  return (
    <div className={`p-4 md:p-6 ${containerBg} h-full overflow-y-auto custom-scrollbar`}>
      <div className={`max-w-3xl mx-auto ${textColor}`}>
        <h1 className={`text-3xl font-title ${titleColor} mb-4 text-center`}>
          Sobre a Tecnologia IA Generativa
        </h1>
        <p className={`${secondaryTextColor} text-center mb-8`}>
          Descubra como a nossa inteligência artificial transforma as suas ideias em realidade visual.
        </p>

        <div className={`p-6 rounded-lg border ${borderColor} ${sectionBg} mb-6`}>
          <h2 className="text-2xl font-title text-primaryText mb-3">Como Funciona?</h2>
          <p className={secondaryTextColor}>
            O nosso aplicativo utiliza um poderoso modelo de inteligência artificial generativa, que chamamos de "IA Generativa". Esta tecnologia foi treinada com milhões de imagens e textos para compreender profundamente os elementos visuais, desde a iluminação e cor até à textura e composição.
          </p>
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-lg border ${borderColor} ${sectionBg}`}>
            <h3 className="text-xl font-title text-primaryText mb-2">1. Compreensão do Pedido</h3>
            <p className={secondaryTextColor}>
              Quando você escreve um comando, como "tornar o céu mais dramático" ou "aplicar um estilo vintage", a IA analisa o texto para entender a sua intenção artística e técnica. Ela interpreta não apenas as palavras, mas também o contexto.
            </p>
          </div>

          <div className={`p-6 rounded-lg border ${borderColor} ${sectionBg}`}>
            <h3 className="text-xl font-title text-primaryText mb-2">2. Análise da Imagem</h3>
            <p className={secondaryTextColor}>
              Simultaneamente, a IA "vê" a imagem que você enviou. Ela identifica os objetos principais, o fundo, as fontes de luz, as sombras e a paleta de cores. Esta análise detalhada permite-lhe aplicar as alterações de forma inteligente e realista.
            </p>
          </div>

          <div className={`p-6 rounded-lg border ${borderColor} ${sectionBg}`}>
            <h3 className="text-xl font-title text-primaryText mb-2">3. Transformação Pixel a Pixel</h3>
            <p className={secondaryTextColor}>
              Com base no seu pedido e na análise da imagem, a IA Generativa não aplica um simples filtro. Em vez disso, ela recria partes da imagem, ou mesmo a imagem inteira, pixel a pixel, para alcançar o resultado desejado. Ferramentas como "Alterar Fundo" ou "Tratamento de Pele" utilizam versões especializadas deste processo para isolar elementos específicos e gerar novos detalhes com um realismo impressionante.
            </p>
          </div>
          
          <div className={`p-6 rounded-lg border ${borderColor} ${sectionBg}`}>
            <h3 className="text-xl font-title text-primaryText mb-2">A Sua Privacidade</h3>
            <p className={secondaryTextColor}>
              A sua privacidade é fundamental. Todas as suas conversas e as imagens que você gera são guardadas exclusivamente no seu dispositivo. Nada é armazenado nos nossos servidores após o processamento.
            </p>
          </div>
        </div>

        <p className="text-center mt-10 text-lg font-title">
          Explore a sua criatividade sem limites!
        </p>
        <p className="text-xs text-secondaryText text-center">A AI pode cometer erros. Por isso, lembre-se de conferir informações relevantes.</p>
      </div>
    </div>
  );
};

export default DocumentationScreen;
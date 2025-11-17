import { AIFilter } from '../types';

export const aiFilters = [
    {
        name: 'Nenhum',
        value: AIFilter.NONE,
        prompt: ''
    },
    {
        name: 'Cinematográfico',
        value: AIFilter.CINEMATIC,
        prompt: 'Redesenhe esta imagem com um estilo cinematográfico. Use gradação de cores teal and orange, adicione um leve grão de filme e uma vinheta subtil. A iluminação deve ser dramática, com alto contraste entre luzes e sombras para criar profundidade e um clima de filme.'
    },
    {
        name: 'Filme Vintage',
        value: AIFilter.VINTAGE_FILM,
        prompt: 'Transforme esta imagem para que pareça uma fotografia de filme dos anos 70. Aplique um tom sépia quente, dessature ligeiramente as cores, aumente o contraste nos tons médios e adicione um grão de filme visível. As áreas de destaque devem ter um leve brilho amarelado.'
    },
    {
        name: 'Preto & Branco Dramático',
        value: AIFilter.DRAMATIC_BW,
        prompt: 'Converta esta imagem para preto e branco com alto contraste. Crie pretos profundos e brancos brilhantes, realçando texturas e formas. O resultado deve ser poderoso e evocativo, semelhante a uma fotografia de Ansel Adams.'
    },
    {
        name: 'Gourmet',
        value: AIFilter.GOURMET_FOOD,
        prompt: 'Melhore esta imagem de comida para parecer uma fotografia gourmet profissional. Aumente a saturação e a vibração das cores, melhore a nitidez para realçar as texturas e ajuste a iluminação para criar realces especulares apetitosos. O fundo deve ser ligeiramente desfocado para focar no prato principal.'
    },
    {
        name: 'Neon Punk',
        value: AIFilter.NEON_PUNK,
        prompt: 'Aplique um estilo cyberpunk a esta imagem. Adicione realces de cor neon (rosa, ciano, roxo) nas fontes de luz e reflexos. Aumente o contraste geral, tornando as sombras mais escuras e profundas. O ambiente deve parecer noturno e urbano, com um toque futurista.'
    }
];
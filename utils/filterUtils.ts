import { SocialMediaFilter } from '../types';

export const getSocialMediaFilterStyle = (filter: SocialMediaFilter | null, intensity: number): string => {
  if (!filter || filter === SocialMediaFilter.NONE || intensity === 0) return '';
  const scale = intensity / 100;

  switch (filter) {
    case SocialMediaFilter.VINTAGE:
      return `sepia(${0.5 * scale}) contrast(${1 + 0.2 * scale}) brightness(${0.9 + 0.1 * scale}) saturate(${0.8 + 0.4 * scale})`;
    case SocialMediaFilter.CINEMATIC:
      return `contrast(${1 + 0.1 * scale}) brightness(${0.9 + 0.1 * scale}) saturate(${1 + 0.2 * scale}) hue-rotate(${scale * -10}deg)`;
    case SocialMediaFilter.HDR:
      return `contrast(${1 + 0.5 * scale}) brightness(${1 + 0.2 * scale}) saturate(${1 + 0.3 * scale}) sepia(${0.1 * scale})`;
    case SocialMediaFilter.SOFT_LIGHT:
      return `brightness(${1 + 0.1 * scale}) contrast(${1 - 0.1 * scale}) saturate(${1 + 0.05 * scale}) blur(${0.5 * scale}px)`;
    case SocialMediaFilter.RETRO_GLOW:
      return `sepia(${0.6 * scale}) brightness(${1 + 0.1 * scale}) contrast(${1 + 0.1 * scale}) hue-rotate(${15 * scale}deg) saturate(${0.9 + 0.2 * scale})`;
    case SocialMediaFilter.STUDIO_PRO:
      return `contrast(${1 + 0.05 * scale}) brightness(${1 + 0.05 * scale}) saturate(${1 + 0.1 * scale})`;
    case SocialMediaFilter.CLARENDON:
      return `contrast(calc(1 + 0.2 * ${scale})) saturate(calc(1 + 0.3 * ${scale})) hue-rotate(calc(-15deg * ${scale}))`;
    case SocialMediaFilter.GINGHAM:
      return `sepia(calc(0.15 * ${scale})) contrast(calc(1 + 0.1 * ${scale})) brightness(calc(1 + 0.1 * ${scale})) saturate(calc(1 - 0.1 * ${scale})) hue-rotate(calc(5deg * ${scale}))`;
    case SocialMediaFilter.MOON:
      return `grayscale(100%) contrast(calc(1 + 0.1 * ${scale})) brightness(calc(1 + 0.1 * ${scale}))`;
    case SocialMediaFilter.LARK:
      return `brightness(calc(1 + 0.2 * ${scale})) saturate(calc(1 + 0.2 * ${scale})) hue-rotate(calc(-8deg * ${scale}))`;
    case SocialMediaFilter.REYES:
      return `sepia(calc(0.25 * ${scale})) brightness(calc(1 + 0.2 * ${scale})) contrast(calc(1 - 0.15 * ${scale})) saturate(calc(1 - 0.25 * ${scale}))`;
    case SocialMediaFilter.JUNO:
      return `brightness(calc(1 + 0.15 * ${scale})) saturate(calc(1 + 0.3 * ${scale})) hue-rotate(calc(10deg * ${scale}))`;
    case SocialMediaFilter.SLUMBER:
      return `saturate(calc(1 - 0.2 * ${scale})) brightness(calc(1 + 0.05 * ${scale})) contrast(calc(1 + 0.05 * ${scale}))`;
    case SocialMediaFilter.CREMA:
      return `sepia(calc(0.15 * ${scale})) brightness(calc(1 + 0.1 * ${scale})) contrast(calc(1 - 0.1 * ${scale})) saturate(calc(1 - 0.1 * ${scale}))`;
    case SocialMediaFilter.LUDWIG:
      return `saturate(calc(1 - 0.15 * ${scale})) brightness(calc(1 + 0.1 * ${scale})) contrast(calc(1 + 0.1 * ${scale})) hue-rotate(calc(5deg * ${scale}))`;
    case SocialMediaFilter.ADEN:
      return `saturate(calc(1 - 0.1 * ${scale})) brightness(calc(1 + 0.1 * ${scale})) hue-rotate(calc(-5deg * ${scale}))`;
    case SocialMediaFilter.PERPETUA:
      return `sepia(calc(0.1 * ${scale})) brightness(calc(1 + 0.1 * ${scale})) contrast(calc(1 + 0.1 * ${scale})) hue-rotate(calc(10deg * ${scale}))`;
    case SocialMediaFilter.AMARO:
      return `brightness(calc(1 + 0.15 * ${scale})) saturate(calc(1 + 0.2 * ${scale})) contrast(calc(1 + 0.05 * ${scale})) sepia(calc(0.1 * ${scale}))`;
    case SocialMediaFilter.MAYFAIR:
      return `sepia(calc(0.05 * ${scale})) brightness(calc(1 + 0.1 * ${scale})) contrast(calc(1 + 0.1 * ${scale})) saturate(calc(1 + 0.1 * ${scale}))`;
    case SocialMediaFilter.RISE:
      return `brightness(calc(1 + 0.1 * ${scale})) sepia(calc(0.2 * ${scale})) saturate(calc(1 + 0.1 * ${scale}))`;
    case SocialMediaFilter.HUDSON:
      return `contrast(calc(1 + 0.1 * ${scale})) brightness(calc(1 - 0.1 * ${scale})) saturate(calc(1 + 0.2 * ${scale})) hue-rotate(calc(-20deg * ${scale}))`;
    case SocialMediaFilter.VALENCIA:
      return `sepia(calc(0.08 * ${scale})) brightness(calc(1 + 0.1 * ${scale})) saturate(calc(1 + 0.1 * ${scale})) contrast(calc(1 + 0.05 * ${scale}))`;
    case SocialMediaFilter.XPRO_II:
      return `contrast(calc(1 + 0.3 * ${scale})) brightness(calc(1 - 0.2 * ${scale})) saturate(calc(1 + 0.2 * ${scale})) sepia(calc(0.2 * ${scale}))`;
    case SocialMediaFilter.SIERRA:
      return `sepia(calc(0.15 * ${scale})) contrast(calc(1 - 0.2 * ${scale})) brightness(calc(1 + 0.1 * ${scale})) saturate(calc(1 - 0.2 * ${scale}))`;
    case SocialMediaFilter.WILLOW:
      return `grayscale(100%) contrast(calc(1 - 0.1 * ${scale})) brightness(calc(1 + 0.1 * ${scale})) sepia(calc(0.02 * ${scale}))`;
    case SocialMediaFilter.LO_FI:
      return `contrast(calc(1 + 0.5 * ${scale})) saturate(calc(1 + 0.3 * ${scale})) brightness(calc(1 - 0.1 * ${scale}))`;
    case SocialMediaFilter.INKWELL:
      return `grayscale(100%) contrast(calc(1 + 0.2 * ${scale}))`;
    case SocialMediaFilter.HEFE:
      return `contrast(calc(1 + 0.25 * ${scale})) saturate(calc(1 + 0.25 * ${scale})) brightness(calc(1 + 0.05 * ${scale})) sepia(calc(0.15 * ${scale}))`;
    case SocialMediaFilter.NASHVILLE:
      return `sepia(calc(0.2 * ${scale})) contrast(calc(1 + 0.05 * ${scale})) brightness(calc(1 + 0.05 * ${scale})) saturate(calc(1 + 0.1 * ${scale})) hue-rotate(calc(5deg * ${scale}))`;
    case SocialMediaFilter.TOKYO:
      return `contrast(calc(1 + 0.2 * ${scale})) saturate(calc(0.85 + 0.15 * ${scale})) brightness(calc(1 - 0.05 * ${scale})) hue-rotate(calc(-10deg * ${scale}))`;
    case SocialMediaFilter.LAGOS:
      return `saturate(calc(1 + 0.4 * ${scale})) brightness(calc(1 + 0.1 * ${scale})) contrast(calc(1 + 0.1 * ${scale})) sepia(calc(0.1 * ${scale}))`;
    case SocialMediaFilter.OSLO:
      return `brightness(calc(1 + 0.05 * ${scale})) contrast(calc(1 - 0.1 * ${scale})) sepia(calc(0.1 * ${scale})) hue-rotate(calc(-15deg * ${scale}))`;
    case SocialMediaFilter.RIO:
      return `saturate(calc(1 + 0.3 * ${scale})) brightness(calc(1 + 0.15 * ${scale})) contrast(calc(1 + 0.05 * ${scale}))`;
    case SocialMediaFilter.JAIPUR:
      return `sepia(calc(0.1 * ${scale})) hue-rotate(calc(15deg * ${scale})) contrast(calc(1 + 0.1 * ${scale})) saturate(calc(1 + 0.2 * ${scale}))`;
    case SocialMediaFilter.CAIRO:
      return `sepia(calc(0.25 * ${scale})) brightness(calc(1 + 0.1 * ${scale})) contrast(calc(1 + 0.1 * ${scale})) saturate(calc(1 + 0.1 * ${scale}))`;
    case SocialMediaFilter.BROOKLYN:
      return `contrast(calc(1 + 0.3 * ${scale})) saturate(calc(1 - 0.1 * ${scale})) brightness(calc(1 - 0.05 * ${scale}))`;
    case SocialMediaFilter.HELENA:
      return `contrast(calc(1 + 0.05 * ${scale})) saturate(calc(1 + 0.1 * ${scale})) sepia(calc(0.15 * ${scale}))`;
    case SocialMediaFilter.ASHBY:
      return `brightness(calc(1 + 0.1 * ${scale})) sepia(calc(0.3 * ${scale})) contrast(calc(1 - 0.05 * ${scale}))`;
    case SocialMediaFilter.SKYLINE:
      return `contrast(calc(1 + 0.15 * ${scale})) brightness(calc(1 - 0.05 * ${scale})) saturate(calc(1 + 0.1 * ${scale}))`;
    case SocialMediaFilter.VESPER:
      return `brightness(calc(1 + 0.05 * ${scale})) sepia(calc(0.2 * ${scale})) contrast(calc(1 - 0.1 * ${scale})) saturate(calc(1 + 0.1 * ${scale}))`;
    case SocialMediaFilter.MAVEN:
      return `saturate(calc(1 - 0.2 * ${scale})) contrast(calc(1 + 0.1 * ${scale})) brightness(calc(1 - 0.1 * ${scale}))`;
    case SocialMediaFilter.STINSON:
      return `brightness(calc(1 + 0.1 * ${scale})) contrast(calc(1 - 0.2 * ${scale})) sepia(calc(0.1 * ${scale}))`;
    case SocialMediaFilter.TOASTER:
      return `sepia(calc(0.3 * ${scale})) contrast(calc(1 + 0.5 * ${scale})) brightness(calc(1 - 0.1 * ${scale})) hue-rotate(calc(-15deg * ${scale}))`;
    case SocialMediaFilter._1977:
      return `sepia(calc(0.5 * ${scale})) hue-rotate(calc(-30deg * ${scale})) saturate(calc(1 + 0.2 * ${scale})) contrast(calc(1 - 0.2 * ${scale}))`;
    case SocialMediaFilter.WALDEN:
      return `brightness(calc(1 + 0.1 * ${scale})) hue-rotate(calc(-10deg * ${scale})) sepia(calc(0.3 * ${scale})) saturate(calc(1 + 0.6 * ${scale}))`;
    case SocialMediaFilter.BRANNAN:
      return `sepia(calc(0.5 * ${scale})) contrast(calc(1 + 0.4 * ${scale}))`;
    case SocialMediaFilter.EARLYBIRD:
      return `sepia(calc(0.4 * ${scale})) contrast(calc(1 + 0.1 * ${scale})) brightness(calc(1 - 0.05 * ${scale}))`;
    case SocialMediaFilter.SUTRO:
      return `brightness(calc(1 - 0.2 * ${scale})) contrast(calc(1 + 0.2 * ${scale})) sepia(calc(0.4 * ${scale})) saturate(calc(1 - 0.2 * ${scale}))`;
    // New cases
    case SocialMediaFilter.FILM_NOIR:
      return `grayscale(${1 * scale}) contrast(calc(1 + 0.5 * ${scale})) brightness(calc(1 - 0.1 * ${scale}))`;
    case SocialMediaFilter.TECHNICOLOR:
      return `saturate(calc(1 + 1 * ${scale})) contrast(calc(1 + 0.2 * ${scale}))`;
    case SocialMediaFilter.CYBERPUNK:
      return `hue-rotate(calc(-40deg * ${scale})) saturate(calc(1 + 0.5 * ${scale})) contrast(calc(1 + 0.2 * ${scale})) brightness(calc(1 - 0.1 * ${scale}))`;
    case SocialMediaFilter.TEAL_ORANGE:
      return `contrast(calc(1 + 0.1 * ${scale})) saturate(calc(1 + 0.2 * ${scale})) sepia(calc(0.3 * ${scale})) hue-rotate(calc(-20deg * ${scale}))`;
    case SocialMediaFilter.GOLDEN_HOUR:
      return `sepia(calc(0.4 * ${scale})) saturate(calc(1 + 0.2 * ${scale})) brightness(calc(1 + 0.1 * ${scale})) contrast(calc(1 - 0.1 * ${scale}))`;
    case SocialMediaFilter.DREAMY:
      return `blur(${0.5 * scale}px) saturate(calc(1 - 0.2 * ${scale})) brightness(calc(1 + 0.2 * ${scale})) contrast(calc(1 - 0.1 * ${scale}))`;
    case SocialMediaFilter.MELANCHOLY:
      return `saturate(calc(1 - 0.3 * ${scale})) brightness(calc(1 - 0.1 * ${scale})) contrast(calc(1 + 0.1 * ${scale})) hue-rotate(calc(-15deg * ${scale})) sepia(calc(0.1 * ${scale}))`;
    case SocialMediaFilter.NORDIC:
      return `contrast(calc(1 + 0.1 * ${scale})) brightness(calc(1 + 0.05 * ${scale})) saturate(calc(1 - 0.1 * ${scale})) hue-rotate(calc(-10deg * ${scale}))`;
    case SocialMediaFilter.MIAMI:
      return `saturate(calc(1 + 0.4 * ${scale})) contrast(calc(1 + 0.1 * ${scale})) hue-rotate(calc(15deg * ${scale}))`;
    case SocialMediaFilter.DESERT:
      return `sepia(calc(0.5 * ${scale})) contrast(calc(1 + 0.2 * ${scale})) saturate(calc(1 + 0.1 * ${scale})) brightness(calc(1 + 0.05 * ${scale}))`;
    case SocialMediaFilter.FOREST:
      return `saturate(calc(1 + 0.2 * ${scale})) contrast(calc(1 + 0.1 * ${scale})) sepia(calc(0.1 * ${scale})) hue-rotate(calc(5deg * ${scale}))`;
    case SocialMediaFilter.OCEANIC:
      return `saturate(calc(1 + 0.3 * ${scale})) contrast(calc(1 + 0.1 * ${scale})) hue-rotate(calc(-25deg * ${scale}))`;
    case SocialMediaFilter.ROSE_GOLD:
      return `sepia(calc(0.3 * ${scale})) saturate(calc(1 + 0.2 * ${scale})) hue-rotate(calc(-10deg * ${scale}))`;
    case SocialMediaFilter.PASTEL:
      return `saturate(calc(1 - 0.3 * ${scale})) brightness(calc(1 + 0.1 * ${scale})) contrast(calc(1 - 0.1 * ${scale}))`;
    case SocialMediaFilter.SOLARIZE:
      return `invert(${1 * scale}) hue-rotate(${180 * scale}deg)`;
    case SocialMediaFilter.CRIMSON:
      return `sepia(calc(0.3 * ${scale})) saturate(calc(1 + 0.5 * ${scale})) hue-rotate(calc(-20deg * ${scale})) contrast(calc(1 + 0.1 * ${scale}))`;
    case SocialMediaFilter.FADED:
      return `contrast(calc(1 - 0.2 * ${scale})) saturate(calc(1 - 0.2 * ${scale})) brightness(calc(1 + 0.1 * ${scale}))`;
    case SocialMediaFilter.MATRIX:
      return `sepia(calc(0.5 * ${scale})) hue-rotate(calc(50deg * ${scale})) saturate(calc(1 + 0.5 * ${scale})) contrast(calc(1 + 0.2 * ${scale}))`;
    case SocialMediaFilter.SEPIA_TONE:
      return `sepia(${0.8 * scale})`;
    case SocialMediaFilter.MUTED:
      return `saturate(calc(1 - 0.5 * ${scale})) contrast(calc(1 - 0.1 * ${scale}))`;
    case SocialMediaFilter.VIBRANT:
      return `saturate(calc(1 + 0.5 * ${scale}))`;
    case SocialMediaFilter.COOL:
      return `brightness(calc(1 + 0.05 * ${scale})) contrast(calc(1 + 0.05 * ${scale})) hue-rotate(calc(-10deg * ${scale}))`;
    case SocialMediaFilter.WARM:
      return `sepia(calc(0.2 * ${scale})) brightness(calc(1 + 0.05 * ${scale})) contrast(calc(1 + 0.05 * ${scale}))`;
    case SocialMediaFilter.DRAMATIC:
      return `contrast(calc(1 + 0.4 * ${scale})) brightness(calc(1 - 0.1 * ${scale})) saturate(calc(1 + 0.1 * ${scale}))`;
    case SocialMediaFilter.INFRARED:
      return `hue-rotate(${180 * scale}deg) saturate(calc(1 + 1 * ${scale})) contrast(calc(1 + 0.1 * ${scale}))`;
    case SocialMediaFilter.GOTHIC:
      return `grayscale(${0.5 * scale}) contrast(calc(1 + 0.2 * ${scale})) brightness(calc(1 - 0.2 * ${scale})) sepia(calc(0.2 * ${scale}))`;
    case SocialMediaFilter.POP_ART:
      return `contrast(calc(1 + 0.6 * ${scale})) saturate(calc(1 + 0.8 * ${scale}))`;
    case SocialMediaFilter.LOMO:
      return `contrast(calc(1 + 0.5 * ${scale})) saturate(calc(1 + 0.5 * ${scale})) sepia(calc(0.2 * ${scale})) hue-rotate(calc(-5deg * ${scale}))`;
    case SocialMediaFilter.SUMMER:
      return `saturate(calc(1 + 0.3 * ${scale})) brightness(calc(1 + 0.1 * ${scale})) sepia(calc(0.1 * ${scale}))`;
    case SocialMediaFilter.WINTER:
      return `saturate(calc(1 - 0.2 * ${scale})) brightness(calc(1 + 0.1 * ${scale})) contrast(calc(1 + 0.1 * ${scale})) hue-rotate(calc(-10deg * ${scale}))`;
    case SocialMediaFilter.AUTUMN:
      return `sepia(calc(0.4 * ${scale})) saturate(calc(1 + 0.2 * ${scale})) hue-rotate(calc(-15deg * ${scale}))`;
    // New cases for the new filters
    case SocialMediaFilter.SUMMER_TAN:
      return `sepia(calc(0.3 * ${scale})) saturate(calc(1.2 * ${scale})) contrast(calc(1.1 * ${scale})) brightness(calc(1.05 * ${scale}))`;
    case SocialMediaFilter.WEBCORE:
      return `sepia(calc(0.2 * ${scale})) contrast(calc(1.2 * ${scale})) saturate(calc(0.9 * ${scale})) hue-rotate(calc(-5deg * ${scale}))`;
    case SocialMediaFilter.BOLD_GLAMOUR:
      return `contrast(calc(1.2 * ${scale})) saturate(calc(1.3 * ${scale})) sepia(calc(0.15 * ${scale})) brightness(calc(1.05 * ${scale}))`;
    case SocialMediaFilter.AESTHETIC_WEEKEND:
      return `brightness(calc(1.15 * ${scale})) contrast(calc(0.9 * ${scale})) saturate(calc(0.85 * ${scale})) sepia(calc(0.2 * ${scale}))`;
    default:
      return '';
  }
};

export const socialMediaFilters = [
    { name: "Nenhum", value: SocialMediaFilter.NONE },
    { name: "Vintage", value: SocialMediaFilter.VINTAGE },
    { name: "Cinemático", value: SocialMediaFilter.CINEMATIC },
    { name: "HDR", value: SocialMediaFilter.HDR },
    { name: "Luz Suave", value: SocialMediaFilter.SOFT_LIGHT },
    { name: "Brilho Retro", value: SocialMediaFilter.RETRO_GLOW },
    { name: "Estúdio Pro", value: SocialMediaFilter.STUDIO_PRO },
    { name: "Clarendon", value: SocialMediaFilter.CLARENDON },
    { name: "Gingham", value: SocialMediaFilter.GINGHAM },
    { name: "Moon", value: SocialMediaFilter.MOON },
    { name: "Lark", value: SocialMediaFilter.LARK },
    { name: "Reyes", value: SocialMediaFilter.REYES },
    { name: "Juno", value: SocialMediaFilter.JUNO },
    { name: "Slumber", value: SocialMediaFilter.SLUMBER },
    { name: "Crema", value: SocialMediaFilter.CREMA },
    { name: "Ludwig", value: SocialMediaFilter.LUDWIG },
    { name: "Aden", value: SocialMediaFilter.ADEN },
    { name: "Perpetua", value: SocialMediaFilter.PERPETUA },
    { name: "Amaro", value: SocialMediaFilter.AMARO },
    { name: "Mayfair", value: SocialMediaFilter.MAYFAIR },
    { name: "Rise", value: SocialMediaFilter.RISE },
    { name: "Hudson", value: SocialMediaFilter.HUDSON },
    { name: "Valencia", value: SocialMediaFilter.VALENCIA },
    { name: "X-Pro II", value: SocialMediaFilter.XPRO_II },
    { name: "Sierra", value: SocialMediaFilter.SIERRA },
    { name: "Willow", value: SocialMediaFilter.WILLOW },
    { name: "Lo-Fi", value: SocialMediaFilter.LO_FI },
    { name: "Inkwell", value: SocialMediaFilter.INKWELL },
    { name: "Hefe", value: SocialMediaFilter.HEFE },
    { name: "Nashville", value: SocialMediaFilter.NASHVILLE },
    { name: "Tokyo", value: SocialMediaFilter.TOKYO },
    { name: "Lagos", value: SocialMediaFilter.LAGOS },
    { name: "Oslo", value: SocialMediaFilter.OSLO },
    { name: "Rio", value: SocialMediaFilter.RIO },
    { name: "Jaipur", value: SocialMediaFilter.JAIPUR },
    { name: "Cairo", value: SocialMediaFilter.CAIRO },
    { name: "Brooklyn", value: SocialMediaFilter.BROOKLYN },
    { name: "Helena", value: SocialMediaFilter.HELENA },
    { name: "Ashby", value: SocialMediaFilter.ASHBY },
    { name: "Skyline", value: SocialMediaFilter.SKYLINE },
    { name: "Vesper", value: SocialMediaFilter.VESPER },
    { name: "Maven", value: SocialMediaFilter.MAVEN },
    { name: "Stinson", value: SocialMediaFilter.STINSON },
    { name: "Toaster", value: SocialMediaFilter.TOASTER },
    { name: "1977", value: SocialMediaFilter._1977 },
    { name: "Walden", value: SocialMediaFilter.WALDEN },
    { name: "Brannan", value: SocialMediaFilter.BRANNAN },
    { name: "Earlybird", value: SocialMediaFilter.EARLYBIRD },
    { name: "Sutro", value: SocialMediaFilter.SUTRO },
    // New filters
    { name: "Film Noir", value: SocialMediaFilter.FILM_NOIR },
    { name: "Technicolor", value: SocialMediaFilter.TECHNICOLOR },
    { name: "Cyberpunk", value: SocialMediaFilter.CYBERPUNK },
    { name: "Azul & Laranja", value: SocialMediaFilter.TEAL_ORANGE },
    { name: "Hora Dourada", value: SocialMediaFilter.GOLDEN_HOUR },
    { name: "Sonhador", value: SocialMediaFilter.DREAMY },
    { name: "Melancolia", value: SocialMediaFilter.MELANCHOLY },
    { name: "Nórdico", value: SocialMediaFilter.NORDIC },
    { name: "Miami", value: SocialMediaFilter.MIAMI },
    { name: "Deserto", value: SocialMediaFilter.DESERT },
    { name: "Floresta", value: SocialMediaFilter.FOREST },
    { name: "Oceânico", value: SocialMediaFilter.OCEANIC },
    { name: "Ouro Rosa", value: SocialMediaFilter.ROSE_GOLD },
    { name: "Pastel", value: SocialMediaFilter.PASTEL },
    { name: "Solarizado", value: SocialMediaFilter.SOLARIZE },
    { name: "Carmesim", value: SocialMediaFilter.CRIMSON },
    { name: "Desbotado", value: SocialMediaFilter.FADED },
    { name: "Matrix", value: SocialMediaFilter.MATRIX },
    { name: "Sépia", value: SocialMediaFilter.SEPIA_TONE },
    { name: "Silenciado", value: SocialMediaFilter.MUTED },
    { name: "Vibrante", value: SocialMediaFilter.VIBRANT },
    { name: "Frio", value: SocialMediaFilter.COOL },
    { name: "Quente", value: SocialMediaFilter.WARM },
    { name: "Dramático", value: SocialMediaFilter.DRAMATIC },
    { name: "Infravermelho", value: SocialMediaFilter.INFRARED },
    { name: "Gótico", value: SocialMediaFilter.GOTHIC },
    { name: "Pop Art", value: SocialMediaFilter.POP_ART },
    { name: "Lomo", value: SocialMediaFilter.LOMO },
    { name: "Verão", value: SocialMediaFilter.SUMMER },
    { name: "Inverno", value: SocialMediaFilter.WINTER },
    { name: "Outono", value: SocialMediaFilter.AUTUMN },
    // Add new filters
    { name: "Bronzeado de Verão", value: SocialMediaFilter.SUMMER_TAN },
    { name: "Webcore", value: SocialMediaFilter.WEBCORE },
    { name: "Glamour Ousado", value: SocialMediaFilter.BOLD_GLAMOUR },
    { name: "Fim de Semana Estético", value: SocialMediaFilter.AESTHETIC_WEEKEND },
];
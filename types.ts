
export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

// New: Enum for basic image filters
export enum ImageFilter {
  NONE = 'none',
  SEPIA = 'sepia',
  GRAYSCALE = 'grayscale',
  INVERT = 'invert',
  BLUR = 'blur',
}

// New: Enum for social media-like filters
export enum SocialMediaFilter {
  NONE = 'NONE',
  VINTAGE = 'VINTAGE',
  CINEMATIC = 'CINEMATIC',
  HDR = 'HDR',
  SOFT_LIGHT = 'SOFT_LIGHT',
  RETRO_GLOW = 'RETRO_GLOW',
  STUDIO_PRO = 'STUDIO_PRO',
  CLARENDON = 'CLARENDON',
  GINGHAM = 'GINGHAM',
  MOON = 'MOON',
  LARK = 'LARK',
  REYES = 'REYES',
  JUNO = 'JUNO',
  SLUMBER = 'SLUMBER',
  CREMA = 'CREMA',
  LUDWIG = 'LUDWIG',
  ADEN = 'ADEN',
  PERPETUA = 'PERPETUA',
  AMARO = 'AMARO',
  MAYFAIR = 'MAYFAIR',
  RISE = 'RISE',
  HUDSON = 'HUDSON',
  VALENCIA = 'VALENCIA',
  XPRO_II = 'XPRO_II',
  SIERRA = 'SIERRA',
  WILLOW = 'WILLOW',
  LO_FI = 'LO_FI',
  INKWELL = 'INKWELL',
  HEFE = 'HEFE',
  NASHVILLE = 'NASHVILLE',
  // New filters added
  TOKYO = 'TOKYO',
  LAGOS = 'LAGOS',
  OSLO = 'OSLO',
  RIO = 'RIO',
  JAIPUR = 'JAIPUR',
  CAIRO = 'CAIRO',
  BROOKLYN = 'BROOKLYN',
  HELENA = 'HELENA',
  ASHBY = 'ASHBY',
  SKYLINE = 'SKYLINE',
  VESPER = 'VESPER',
  MAVEN = 'MAVEN',
  STINSON = 'STINSON',
  TOASTER = 'TOASTER',
  _1977 = '_1977', // Enum members cannot start with a number
  WALDEN = 'WALDEN',
  BRANNAN = 'BRANNAN',
  EARLYBIRD = 'EARLYBIRD',
  SUTRO = 'SUTRO',
  // Freshly added filters based on the new request
  FILM_NOIR = 'FILM_NOIR',
  TECHNICOLOR = 'TECHNICOLOR',
  CYBERPUNK = 'CYBERPUNK',
  TEAL_ORANGE = 'TEAL_ORANGE',
  GOLDEN_HOUR = 'GOLDEN_HOUR',
  DREAMY = 'DREAMY',
  MELANCHOLY = 'MELANCHOLY',
  NORDIC = 'NORDIC',
  MIAMI = 'MIAMI',
  DESERT = 'DESERT',
  FOREST = 'FOREST',
  OCEANIC = 'OCEANIC',
  ROSE_GOLD = 'ROSE_GOLD',
  PASTEL = 'PASTEL',
  SOLARIZE = 'SOLARIZE',
  CRIMSON = 'CRIMSON',
  FADED = 'FADED',
  MATRIX = 'MATRIX',
  SEPIA_TONE = 'SEPIA_TONE',
  MUTED = 'MUTED',
  VIBRANT = 'VIBRANT',
  COOL = 'COOL',
  WARM = 'WARM',
  DRAMATIC = 'DRAMATIC',
  INFRARED = 'INFRARED',
  GOTHIC = 'GOTHIC',
  POP_ART = 'POP_ART',
  LOMO = 'LOMO',
  SUMMER = 'SUMMER',
  WINTER = 'WINTER',
  AUTUMN = 'AUTUMN',
  // New filters from user request
  SUMMER_TAN = 'SUMMER_TAN',
  WEBCORE = 'WEBCORE',
  BOLD_GLAMOUR = 'BOLD_GLAMOUR',
  AESTHETIC_WEEKEND = 'AESTHETIC_WEEKEND',
}

export enum AIFilter {
    NONE = 'NONE',
    CINEMATIC = 'CINEMATIC',
    VINTAGE_FILM = 'VINTAGE_FILM',
    DRAMATIC_BW = 'DRAMATIC_BW',
    GOURMET_FOOD = 'GOURMET_FOOD',
    NEON_PUNK = 'NEON_PUNK',
}

export interface ImagePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export interface StagedImage {
  id: string;
  file: File;
  src: string; // Data URL for preview
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  type: 'text' | 'image-upload' | 'image-enhanced' | 'system-info' | 'loading-indicator' | 'video-generated' | 'audio';
  content?: string; // For text messages or base64 of image for system-info
  imageUrls?: string[]; // Data URLs for image-upload or image-enhanced. Single image for enhanced, multiple for upload.
  videoUrl?: string; // For 'video-generated' messages
  audioUrl?: string; // For 'audio' messages
  imageMimeType?: string; // Only relevant for the first image in an array if needed
  promptUsed?: string; // For 'image-enhanced' messages, store the prompt for Discord webhook
  historyId?: string; // New: Links an 'image-enhanced' message to its history entry
  timestamp: Date;
}

// New: Interface to store enhanced image details in history, including adjustments
export interface EnhancedImageHistoryEntry {
  id: string;
  originalImageSrc: string;
  enhancedImageSrc: string;
  uncroppedEnhancedImageSrc: string | null; // The original enhanced image before any cropping.
  imageMimeType: string;
  promptUsed: string;
  timestamp: Date;
  appliedFilter: ImageFilter;
  appliedBrightness: number;
  appliedContrast: number;
  appliedSocialMediaFilter: SocialMediaFilter;
  appliedSocialMediaFilterIntensity: number;
  appliedAIFilter: AIFilter;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastModified: Date;
}
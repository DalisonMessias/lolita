const WATERMARK_URL = 'https://raw.githubusercontent.com/DalisonMessias/cdn.rabbit.gg/main/assets/mask-revo.png';
const WATERMARK_MARGIN = 32;

let watermarkImage: HTMLImageElement | null = null;
let watermarkPromise: Promise<HTMLImageElement> | null = null;

// Pre-load the watermark image for better performance
export const loadWatermark = (): Promise<HTMLImageElement> => {
  if (watermarkPromise) {
    return watermarkPromise;
  }
  watermarkPromise = new Promise((resolve, reject) => {
    if (watermarkImage && watermarkImage.complete) {
      resolve(watermarkImage);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      watermarkImage = img;
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error("Falha ao carregar a imagem da marca d'água."));
    };
    img.src = WATERMARK_URL;
  });
  return watermarkPromise;
};

export const drawWatermarkOnCanvas = async (canvas: HTMLCanvasElement): Promise<void> => {
  try {
    const watermark = await loadWatermark();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Original image size
    let watermarkWidth = watermark.naturalWidth;
    let watermarkHeight = watermark.naturalHeight;

    // REDUZIR A MARCA D'ÁGUA PELA METADE
    const sizeReduction = 0.5;
    watermarkWidth *= sizeReduction;
    watermarkHeight *= sizeReduction;

    // Limite máximo ainda respeitando sua lógica
    const maxWatermarkWidth = Math.min(canvas.width * 0.10, 127 * sizeReduction);

    if (watermarkWidth > maxWatermarkWidth) {
      const scale = maxWatermarkWidth / watermarkWidth;
      watermarkWidth = maxWatermarkWidth;
      watermarkHeight *= scale;
    }

    const margin = Math.min(WATERMARK_MARGIN, canvas.width / 4, canvas.height / 4);

    const x = canvas.width - watermarkWidth - margin;
    const y = canvas.height - watermarkHeight - margin;

    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.drawImage(watermark, x, y, watermarkWidth, watermarkHeight);
    ctx.restore();

  } catch (error) {
    console.error("Erro ao desenhar a marca d'água:", error);
  }
};

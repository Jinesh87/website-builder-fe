/**
 * Modern High-Performance Image Optimization & Responsive WebP Engine
 * Converts web images (PNG, JPEG, BMP, etc.) into ultra-lightweight WebP
 * with near-lossless visual quality (85-90%), preserving transparency,
 * high-DPI clarity, and responsive size presets.
 */

export const RESPONSIVE_PRESETS = {
  thumbnail: { maxWidth: 400, maxHeight: 400, quality: 0.82 },
  tablet: { maxWidth: 960, maxHeight: 960, quality: 0.86 },
  desktop: { maxWidth: 1920, maxHeight: 1920, quality: 0.88 },
} as const;

export type ResponsivePresetName = keyof typeof RESPONSIVE_PRESETS;

export type OptimizationProgressCallback = (
  progress: number,
  statusText: string,
) => void;

export type OptimizeImageOptions = {
  /** Target quality between 0.1 and 1.0 (default: 0.88 for near-lossless clarity) */
  quality?: number;
  /** Maximum width constraint (default: 1920px for high-DPI displays) */
  maxWidth?: number;
  /** Maximum height constraint (default: 1920px) */
  maxHeight?: number;
  /** Whether to generate responsive variants (thumbnail, tablet, desktop) */
  generateVariants?: boolean;
  /** Progress notification callback */
  onProgress?: OptimizationProgressCallback;
};

export type OptimizedImageResult = {
  file: File;
  originalSize: number;
  optimizedSize: number;
  savedPercent: number;
  width: number;
  height: number;
  mimeType: string;
  variants?: Record<ResponsivePresetName, ResponsiveVariant>;
};

export type ResponsiveVariant = {
  name: ResponsivePresetName;
  file: File;
  width: number;
  height: number;
  size: number;
};

/**
 * Resizes an image element to fit within maxWidth and maxHeight
 * while strictly preserving the aspect ratio.
 */
export function calculateFitDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }
  const ratio = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

/**
 * Draws an image to a high-precision Canvas and exports as a WebP blob.
 */
async function renderToWebPBlob(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: false });

  if (!ctx) {
    throw new Error("Unable to create 2D canvas context for image optimization.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/webp", quality);
  });

  // Free canvas GPU memory
  canvas.width = 0;
  canvas.height = 0;

  if (!blob) {
    throw new Error("Failed to render image to WebP format.");
  }

  return blob;
}

/**
 * Optimizes an uploaded image into clean WebP format with optional responsive downscaling.
 */
export async function optimizeImageToWebP(
  file: File,
  options: OptimizeImageOptions = {},
): Promise<OptimizedImageResult> {
  const {
    quality = 0.88,
    maxWidth = 1920,
    maxHeight = 1920,
    generateVariants = false,
    onProgress,
  } = options;

  const originalSize = file.size;

  // Pass SVG, animated GIF, or non-images through unchanged
  if (
    file.type === "image/svg+xml" ||
    file.type === "image/gif" ||
    !file.type.startsWith("image/")
  ) {
    onProgress?.(100, "Ready");
    return {
      file,
      originalSize,
      optimizedSize: originalSize,
      savedPercent: 0,
      width: 0,
      height: 0,
      mimeType: file.type,
    };
  }

  onProgress?.(15, "Reading image data…");
  const img = await loadImageFromFile(file);

  onProgress?.(45, "Optimizing to WebP…");
  const target = calculateFitDimensions(img.width, img.height, maxWidth, maxHeight);
  const primaryBlob = await renderToWebPBlob(img, target.width, target.height, quality);

  // If converted WebP is larger than original WebP, retain original
  if (primaryBlob.size >= originalSize && file.type === "image/webp") {
    onProgress?.(100, "Optimization complete");
    return {
      file,
      originalSize,
      optimizedSize: originalSize,
      savedPercent: 0,
      width: img.width,
      height: img.height,
      mimeType: file.type,
    };
  }

  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const primaryFileName = `${baseName}.webp`;

  const primaryFile = new File([primaryBlob], primaryFileName, {
    type: "image/webp",
    lastModified: Date.now(),
  });

  const optimizedSize = primaryFile.size;
  const savedPercent = Math.max(
    0,
    Math.round(((originalSize - optimizedSize) / originalSize) * 100),
  );

  let variants: Record<ResponsivePresetName, ResponsiveVariant> | undefined;

  // Optionally generate responsive variants (thumbnail, tablet, desktop)
  if (generateVariants) {
    onProgress?.(80, "Generating responsive sizes…");
    variants = {} as Record<ResponsivePresetName, ResponsiveVariant>;

    for (const [presetKey, preset] of Object.entries(RESPONSIVE_PRESETS) as [
      ResponsivePresetName,
      (typeof RESPONSIVE_PRESETS)[ResponsivePresetName],
    ][]) {
      const variantDim = calculateFitDimensions(img.width, img.height, preset.maxWidth, preset.maxHeight);
      const variantBlob = await renderToWebPBlob(img, variantDim.width, variantDim.height, preset.quality);
      const variantFileName = `${baseName}-${presetKey}.webp`;
      const variantFile = new File([variantBlob], variantFileName, {
        type: "image/webp",
        lastModified: Date.now(),
      });

      variants[presetKey] = {
        name: presetKey,
        file: variantFile,
        width: variantDim.width,
        height: variantDim.height,
        size: variantFile.size,
      };
    }
  }

  onProgress?.(100, savedPercent > 0 ? `Optimized: ${savedPercent}% smaller` : "Ready");

  return {
    file: primaryFile,
    originalSize,
    optimizedSize,
    savedPercent,
    width: target.width,
    height: target.height,
    mimeType: "image/webp",
    variants,
  };
}

/**
 * Helper to generate responsive WebP variants directly from a source image.
 */
export async function generateResponsiveWebPVariants(
  file: File,
  onProgress?: OptimizationProgressCallback,
): Promise<OptimizedImageResult> {
  return optimizeImageToWebP(file, { generateVariants: true, onProgress });
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to decode image: ${file.name}`));
    };

    img.src = url;
  });
}

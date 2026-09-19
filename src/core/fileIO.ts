import { encodeBMP } from './bmpEncoder';
import { readPsd, Psd } from 'ag-psd';
import { Layer } from './types';
import { createLayer } from './layerEngine';

export function exportToPNG(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate PNG blob'));
    }, 'image/png');
  });
}

export function exportToJPEG(
  canvas: HTMLCanvasElement,
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Composite onto white background for JPEG
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);

    tempCanvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate JPEG blob'));
      },
      'image/jpeg',
      quality
    );
  });
}

export function exportToBMP(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return encodeBMP(imgData);
}

export function exportToWebP(
  canvas: HTMLCanvasElement,
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate WebP blob'));
      },
      'image/webp',
      quality
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface LoadedImageResult {
  width: number;
  height: number;
  layers: Layer[];
  title: string;
}

export async function loadFile(file: File): Promise<LoadedImageResult> {
  const filename = file.name;
  const isPsd = filename.toLowerCase().endsWith('.psd');

  if (isPsd) {
    try {
      const buffer = await file.arrayBuffer();
      const psd: Psd = readPsd(buffer);
      const width = psd.width;
      const height = psd.height;
      const loadedLayers: Layer[] = [];

      if (psd.children && psd.children.length > 0) {
        for (let i = 0; i < psd.children.length; i++) {
          const child = psd.children[i];
          const l = createLayer(width, height, child.name || `Layer ${i + 1}`);
          l.visible = !child.hidden;
          l.opacity = child.opacity !== undefined ? child.opacity : 1.0;
          if (child.canvas) {
            l.ctx.drawImage(
              child.canvas,
              child.left || 0,
              child.top || 0
            );
          }
          loadedLayers.push(l);
        }
      } else if (psd.canvas) {
        const l = createLayer(width, height, 'Background');
        l.ctx.drawImage(psd.canvas, 0, 0);
        loadedLayers.push(l);
      }

      if (loadedLayers.length > 0) {
        return { width, height, layers: loadedLayers, title: filename };
      }
    } catch (e) {
      console.warn('PSD parse failed, falling back to standard image load', e);
    }
  }

  // Standard image loading (PNG, JPG, BMP, WebP, etc.)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const baseLayer = createLayer(width, height, 'Background');
        baseLayer.ctx.drawImage(img, 0, 0);
        resolve({
          width,
          height,
          layers: [baseLayer],
          title: filename,
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

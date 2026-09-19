/**
 * High-performance client-side raster filters operating directly on ImageData.
 */

export function applyBrightnessContrast(
  imageData: ImageData,
  brightness: number = 0, // -100 to 100
  contrast: number = 0 // -100 to 100
): ImageData {
  const data = imageData.data;
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const bVal = (brightness / 100) * 255;

  for (let i = 0; i < data.length; i += 4) {
    // Red
    let r = factor * (data[i] - 128) + 128 + bVal;
    data[i] = r < 0 ? 0 : r > 255 ? 255 : r;

    // Green
    let g = factor * (data[i + 1] - 128) + 128 + bVal;
    data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;

    // Blue
    let b = factor * (data[i + 2] - 128) + 128 + bVal;
    data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
  }
  return imageData;
}

export function applyInvert(imageData: ImageData): ImageData {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  return imageData;
}

export function applyGrayscale(imageData: ImageData): ImageData {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Standard sRGB luminance weighting
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  return imageData;
}

export function applyHueSaturation(
  imageData: ImageData,
  hueShift: number = 0, // -180 to 180
  satShift: number = 0, // -100 to 100
  lightShift: number = 0 // -100 to 100
): ImageData {
  const data = imageData.data;
  const hDelta = hueShift / 360;
  const sDelta = satShift / 100;
  const lDelta = lightShift / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    // Apply adjustments
    h = (h + hDelta) % 1;
    if (h < 0) h += 1;
    s = Math.max(0, Math.min(1, s + sDelta));
    l = Math.max(0, Math.min(1, l + lDelta));

    // Convert back to RGB
    let newR: number, newG: number, newB: number;
    if (s === 0) {
      newR = newG = newB = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      newR = hue2rgb(p, q, h + 1 / 3);
      newG = hue2rgb(p, q, h);
      newB = hue2rgb(p, q, h - 1 / 3);
    }

    data[i] = Math.round(newR * 255);
    data[i + 1] = Math.round(newG * 255);
    data[i + 2] = Math.round(newB * 255);
  }
  return imageData;
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function applyBlur(imageData: ImageData, radius: number = 3): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const src = new Uint8ClampedArray(imageData.data);
  const dest = imageData.data;
  const r = Math.max(1, Math.min(20, Math.round(radius)));

  // Two-pass separable box blur
  const temp = new Uint8ClampedArray(src.length);

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rSum = 0, gSum = 0, bSum = 0, aSum = 0, count = 0;
      for (let kx = -r; kx <= r; kx++) {
        const px = Math.min(width - 1, Math.max(0, x + kx));
        const idx = (y * width + px) * 4;
        rSum += src[idx];
        gSum += src[idx + 1];
        bSum += src[idx + 2];
        aSum += src[idx + 3];
        count++;
      }
      const outIdx = (y * width + x) * 4;
      temp[outIdx] = rSum / count;
      temp[outIdx + 1] = gSum / count;
      temp[outIdx + 2] = bSum / count;
      temp[outIdx + 3] = aSum / count;
    }
  }

  // Vertical pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rSum = 0, gSum = 0, bSum = 0, aSum = 0, count = 0;
      for (let ky = -r; ky <= r; ky++) {
        const py = Math.min(height - 1, Math.max(0, y + ky));
        const idx = (py * width + x) * 4;
        rSum += temp[idx];
        gSum += temp[idx + 1];
        bSum += temp[idx + 2];
        aSum += temp[idx + 3];
        count++;
      }
      const outIdx = (y * width + x) * 4;
      dest[outIdx] = rSum / count;
      dest[outIdx + 1] = gSum / count;
      dest[outIdx + 2] = bSum / count;
      dest[outIdx + 3] = aSum / count;
    }
  }

  return imageData;
}

export function applySharpen(imageData: ImageData, amount: number = 30): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const src = new Uint8ClampedArray(imageData.data);
  const dest = imageData.data;
  const factor = amount / 30; // Scale factor

  // 3x3 Laplacian sharpening kernel
  const k = -factor;
  const center = 1 + 4 * factor;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const top = ((y - 1) * width + x) * 4;
      const bottom = ((y + 1) * width + x) * 4;
      const left = (y * width + (x - 1)) * 4;
      const right = (y * width + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const val =
          src[idx + c] * center +
          (src[top + c] + src[bottom + c] + src[left + c] + src[right + c]) * k;
        dest[idx + c] = Math.min(255, Math.max(0, val));
      }
      // Preserve alpha
      dest[idx + 3] = src[idx + 3];
    }
  }

  return imageData;
}

export function applyNoise(imageData: ImageData, amount: number = 25): ImageData {
  const data = imageData.data;
  const range = (amount / 100) * 128;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue; // Skip transparent
    const noise = (Math.random() * 2 - 1) * range;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  return imageData;
}

export function applyPixelate(imageData: ImageData, blockSize: number = 8): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const size = Math.max(2, Math.min(64, Math.round(blockSize)));

  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      // Find average or center color of block
      const centerX = Math.min(width - 1, x + Math.floor(size / 2));
      const centerY = Math.min(height - 1, y + Math.floor(size / 2));
      const centerIdx = (centerY * width + centerX) * 4;

      const r = data[centerIdx];
      const g = data[centerIdx + 1];
      const b = data[centerIdx + 2];
      const a = data[centerIdx + 3];

      // Fill block
      for (let by = 0; by < size && y + by < height; by++) {
        for (let bx = 0; bx < size && x + bx < width; bx++) {
          const destIdx = ((y + by) * width + (x + bx)) * 4;
          data[destIdx] = r;
          data[destIdx + 1] = g;
          data[destIdx + 2] = b;
          data[destIdx + 3] = a;
        }
      }
    }
  }

  return imageData;
}

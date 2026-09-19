/**
 * Gradient tool — draws linear or radial gradients between two colors.
 */

import { SelectionBounds } from '../types';

export function drawGradient(
  ctx: CanvasRenderingContext2D,
  type: 'linear' | 'radial',
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color1: string,
  color2: string,
  canvasWidth: number,
  canvasHeight: number,
  opacity: number = 1.0,
  selectionMask: ImageData | null = null,
  selectionBounds: SelectionBounds | null = null
): void {
  const hasSelection = Boolean(
    selectionBounds && selectionBounds.w > 0 && selectionBounds.h > 0
  );

  // 1. Create an offscreen buffer canvas to render the pure gradient
  const offscreen = document.createElement('canvas');
  offscreen.width = Math.max(1, canvasWidth);
  offscreen.height = Math.max(1, canvasHeight);
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return;

  // Fallback for zero-length drag vector (e.g. single click or tap)
  let gx2 = x2;
  let gy2 = y2;
  if (x1 === gx2 && y1 === gy2) {
    if (hasSelection && selectionBounds) {
      gy2 = y1 + Math.max(10, selectionBounds.h);
    } else {
      gy2 = y1 + Math.max(20, canvasHeight);
    }
  }

  let gradient: CanvasGradient;
  if (type === 'radial') {
    const dx = gx2 - x1;
    const dy = gy2 - y1;
    const radius = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    gradient = offCtx.createRadialGradient(x1, y1, 0, x1, y1, radius);
  } else {
    gradient = offCtx.createLinearGradient(x1, y1, gx2, gy2);
  }

  const c1 = color1 || '#000000';
  const c2 = color2 || '#ffffff';
  try {
    gradient.addColorStop(0, c1);
    gradient.addColorStop(1, c2);
  } catch (_) {
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#ffffff');
  }

  offCtx.fillStyle = gradient;

  // If a selection bounding box is active, only draw within that bounding box
  if (hasSelection && selectionBounds) {
    const rx = Math.max(0, selectionBounds.x);
    const ry = Math.max(0, selectionBounds.y);
    const rw = Math.min(canvasWidth - rx, selectionBounds.w);
    const rh = Math.min(canvasHeight - ry, selectionBounds.h);
    offCtx.fillRect(rx, ry, rw, rh);
  } else {
    offCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // 2. If a pixel-level selection mask is present, mask the offscreen gradient buffer
  if (hasSelection && selectionMask) {
    const offData = offCtx.getImageData(0, 0, canvasWidth, canvasHeight);
    const maskData = selectionMask.data;
    const pixels = offData.data;
    const totalPixels = canvasWidth * canvasHeight;

    for (let i = 0; i < totalPixels; i++) {
      const alphaIdx = i * 4 + 3;
      const maskAlpha = maskData[alphaIdx];
      if (maskAlpha === 0) {
        pixels[alphaIdx] = 0;
      } else if (maskAlpha < 255) {
        pixels[alphaIdx] = Math.round((pixels[alphaIdx] * maskAlpha) / 255);
      }
    }
    offCtx.putImageData(offData, 0, 0);
  }

  // 3. Composite the offscreen gradient buffer onto the target context using standard source-over
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity ?? 1.0));
  ctx.drawImage(offscreen, 0, 0);
  ctx.restore();
}

/**
 * Draw a preview gradient on the overlay/preview canvas.
 */
export function drawGradientPreview(
  ctx: CanvasRenderingContext2D,
  type: 'linear' | 'radial',
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color1: string,
  color2: string,
  canvasWidth: number,
  canvasHeight: number,
  opacity: number = 1.0,
  selectionMask: ImageData | null = null,
  selectionBounds: SelectionBounds | null = null
): void {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawGradient(
    ctx,
    type,
    x1,
    y1,
    x2,
    y2,
    color1,
    color2,
    canvasWidth,
    canvasHeight,
    opacity * 0.7,
    selectionMask,
    selectionBounds
  );

  // Draw the drag line indicator
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(x1 + 0.5, y1 + 0.5);
  ctx.lineTo(x2 + 0.5, y2 + 0.5);
  ctx.stroke();

  ctx.strokeStyle = '#000000';
  ctx.lineDashOffset = 4;
  ctx.beginPath();
  ctx.moveTo(x1 + 0.5, y1 + 0.5);
  ctx.lineTo(x2 + 0.5, y2 + 0.5);
  ctx.stroke();
  ctx.restore();
}

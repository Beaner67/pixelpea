/**
 * Unified brush engine for advanced retouching tools:
 * Smudge, Dodge/Burn, Blur/Sharpen, Healing Brush
 */

/**
 * Smudge tool — picks up color at brush start and smears it in drag direction.
 * Uses alpha blending to mix the picked color with destination pixels.
 */
export function smudgeBrush(
  ctx: CanvasRenderingContext2D,
  prevX: number,
  prevY: number,
  curX: number,
  curY: number,
  brushRadius: number,
  strength: number = 0.5
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const r = Math.max(1, Math.round(brushRadius));
  const r2 = r * r;

  // Sample source region at previous position
  const sx = Math.max(0, Math.round(prevX) - r);
  const sy = Math.max(0, Math.round(prevY) - r);
  const sw = Math.min(w - sx, r * 2);
  const sh = Math.min(h - sy, r * 2);
  if (sw <= 0 || sh <= 0) return;

  const srcData = ctx.getImageData(sx, sy, sw, sh);

  // Sample destination region at current position
  const dx = Math.max(0, Math.round(curX) - r);
  const dy = Math.max(0, Math.round(curY) - r);
  const dw = Math.min(w - dx, r * 2);
  const dh = Math.min(h - dy, r * 2);
  if (dw <= 0 || dh <= 0) return;

  const destData = ctx.getImageData(dx, dy, dw, dh);
  const dest = destData.data;
  const src = srcData.data;

  const cx = Math.round(curX) - dx;
  const cy = Math.round(curY) - dy;

  for (let py = 0; py < dh; py++) {
    for (let px = 0; px < dw; px++) {
      const distX = px - cx;
      const distY = py - cy;
      if (distX * distX + distY * distY > r2) continue;

      const srcPx = px + (dx - sx);
      const srcPy = py + (dy - sy);
      if (srcPx < 0 || srcPx >= sw || srcPy < 0 || srcPy >= sh) continue;

      const si = (srcPy * sw + srcPx) * 4;
      const di = (py * dw + px) * 4;

      dest[di] = dest[di] + (src[si] - dest[di]) * strength;
      dest[di + 1] = dest[di + 1] + (src[si + 1] - dest[di + 1]) * strength;
      dest[di + 2] = dest[di + 2] + (src[si + 2] - dest[di + 2]) * strength;
    }
  }

  ctx.putImageData(destData, dx, dy);
}

/**
 * Dodge (lighten) or Burn (darken) pixels under the brush.
 */
export function dodgeBurnBrush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  brushRadius: number,
  mode: 'dodge' | 'burn',
  strength: number = 0.15
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const r = Math.max(1, Math.round(brushRadius));
  const r2 = r * r;

  const startX = Math.max(0, Math.round(x) - r);
  const startY = Math.max(0, Math.round(y) - r);
  const regionW = Math.min(w - startX, r * 2);
  const regionH = Math.min(h - startY, r * 2);
  if (regionW <= 0 || regionH <= 0) return;

  const imgData = ctx.getImageData(startX, startY, regionW, regionH);
  const data = imgData.data;
  const cx = Math.round(x) - startX;
  const cy = Math.round(y) - startY;

  for (let py = 0; py < regionH; py++) {
    for (let px = 0; px < regionW; px++) {
      const distX = px - cx;
      const distY = py - cy;
      if (distX * distX + distY * distY > r2) continue;

      const i = (py * regionW + px) * 4;
      if (data[i + 3] === 0) continue; // Skip transparent

      if (mode === 'dodge') {
        data[i] = Math.min(255, data[i] + (255 - data[i]) * strength);
        data[i + 1] = Math.min(255, data[i + 1] + (255 - data[i + 1]) * strength);
        data[i + 2] = Math.min(255, data[i + 2] + (255 - data[i + 2]) * strength);
      } else {
        data[i] = Math.max(0, data[i] - data[i] * strength);
        data[i + 1] = Math.max(0, data[i + 1] - data[i + 1] * strength);
        data[i + 2] = Math.max(0, data[i + 2] - data[i + 2] * strength);
      }
    }
  }

  ctx.putImageData(imgData, startX, startY);
}

/**
 * Localized blur or sharpen under the brush radius.
 */
export function blurSharpenBrush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  brushRadius: number,
  mode: 'blur' | 'sharpen',
  strength: number = 0.5
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const r = Math.max(2, Math.round(brushRadius));
  const r2 = r * r;

  const startX = Math.max(0, Math.round(x) - r);
  const startY = Math.max(0, Math.round(y) - r);
  const regionW = Math.min(w - startX, r * 2);
  const regionH = Math.min(h - startY, r * 2);
  if (regionW <= 2 || regionH <= 2) return;

  const imgData = ctx.getImageData(startX, startY, regionW, regionH);
  const src = new Uint8ClampedArray(imgData.data);
  const dest = imgData.data;
  const cx = Math.round(x) - startX;
  const cy = Math.round(y) - startY;

  for (let py = 1; py < regionH - 1; py++) {
    for (let px = 1; px < regionW - 1; px++) {
      const distX = px - cx;
      const distY = py - cy;
      if (distX * distX + distY * distY > r2) continue;

      const i = (py * regionW + px) * 4;
      const top = ((py - 1) * regionW + px) * 4;
      const bot = ((py + 1) * regionW + px) * 4;
      const left = (py * regionW + (px - 1)) * 4;
      const right = (py * regionW + (px + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const avg = (src[top + c] + src[bot + c] + src[left + c] + src[right + c]) / 4;
        if (mode === 'blur') {
          dest[i + c] = src[i + c] + (avg - src[i + c]) * strength;
        } else {
          // Sharpen: amplify difference from average
          const diff = src[i + c] - avg;
          dest[i + c] = Math.min(255, Math.max(0, src[i + c] + diff * strength * 2));
        }
      }
    }
  }

  ctx.putImageData(imgData, startX, startY);
}

/**
 * Healing brush — blends surrounding texture into the brush area.
 * Samples average color around the brush ring and blends inward.
 */
export function healingBrush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  brushRadius: number,
  strength: number = 0.6
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const r = Math.max(2, Math.round(brushRadius));
  const r2 = r * r;

  const startX = Math.max(0, Math.round(x) - r - 1);
  const startY = Math.max(0, Math.round(y) - r - 1);
  const regionW = Math.min(w - startX, (r + 1) * 2);
  const regionH = Math.min(h - startY, (r + 1) * 2);
  if (regionW <= 2 || regionH <= 2) return;

  const imgData = ctx.getImageData(startX, startY, regionW, regionH);
  const data = imgData.data;
  const cx = Math.round(x) - startX;
  const cy = Math.round(y) - startY;

  // Calculate average color at the outer ring of the brush
  let avgR = 0, avgG = 0, avgB = 0, ringCount = 0;
  const outerR2 = (r + 1) * (r + 1);

  for (let py = 0; py < regionH; py++) {
    for (let px = 0; px < regionW; px++) {
      const dx = px - cx;
      const dy = py - cy;
      const dist2 = dx * dx + dy * dy;
      if (dist2 >= r2 && dist2 < outerR2) {
        const i = (py * regionW + px) * 4;
        avgR += data[i];
        avgG += data[i + 1];
        avgB += data[i + 2];
        ringCount++;
      }
    }
  }

  if (ringCount === 0) return;
  avgR /= ringCount;
  avgG /= ringCount;
  avgB /= ringCount;

  // Blend inner pixels toward the average
  for (let py = 0; py < regionH; py++) {
    for (let px = 0; px < regionW; px++) {
      const dx = px - cx;
      const dy = py - cy;
      if (dx * dx + dy * dy > r2) continue;

      const i = (py * regionW + px) * 4;
      // Blend more strongly at center
      const dist = Math.sqrt(dx * dx + dy * dy);
      const blend = strength * (1 - dist / r);
      if (blend <= 0) continue;

      data[i] = data[i] + (avgR - data[i]) * blend;
      data[i + 1] = data[i + 1] + (avgG - data[i + 1]) * blend;
      data[i + 2] = data[i + 2] + (avgB - data[i + 2]) * blend;
    }
  }

  ctx.putImageData(imgData, startX, startY);
}

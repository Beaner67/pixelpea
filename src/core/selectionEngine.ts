import { SelectionBounds } from './types';

export function createSelectionMask(width: number, height: number): ImageData {
  return new ImageData(width, height);
}

export function setRectSelection(
  width: number,
  height: number,
  rect: SelectionBounds
): ImageData {
  const mask = new ImageData(width, height);
  const data = mask.data;

  const minX = Math.max(0, Math.min(rect.x, rect.x + rect.w));
  const maxX = Math.min(width, Math.max(rect.x, rect.x + rect.w));
  const minY = Math.max(0, Math.min(rect.y, rect.y + rect.h));
  const maxY = Math.min(height, Math.max(rect.y, rect.y + rect.h));

  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      const idx = (y * width + x) * 4;
      data[idx + 3] = 255; // Alpha 255 = selected
    }
  }

  return mask;
}

export function setEllipseSelection(
  width: number,
  height: number,
  rect: SelectionBounds
): ImageData {
  const mask = new ImageData(width, height);
  const data = mask.data;

  const x0 = Math.min(rect.x, rect.x + rect.w);
  const y0 = Math.min(rect.y, rect.y + rect.h);
  const w = Math.abs(rect.w);
  const h = Math.abs(rect.h);

  const cx = x0 + w / 2;
  const cy = y0 + h / 2;
  const rx = w / 2;
  const ry = h / 2;

  if (rx <= 0 || ry <= 0) return mask;

  const minX = Math.max(0, Math.floor(x0));
  const maxX = Math.min(width, Math.ceil(x0 + w));
  const minY = Math.max(0, Math.floor(y0));
  const maxY = Math.min(height, Math.ceil(y0 + h));

  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) {
        const idx = (y * width + x) * 4;
        data[idx + 3] = 255;
      }
    }
  }

  return mask;
}

/**
 * Create a selection mask from a polygon (freehand lasso or polygonal lasso points).
 * Uses scanline fill with point-in-polygon ray casting.
 */
export function setLassoSelection(
  width: number,
  height: number,
  points: { x: number; y: number }[]
): ImageData {
  const mask = new ImageData(width, height);
  const data = mask.data;

  if (points.length < 3) return mask;

  // Calculate bounding box for efficiency
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  minX = Math.max(0, Math.floor(minX));
  minY = Math.max(0, Math.floor(minY));
  maxX = Math.min(width - 1, Math.ceil(maxX));
  maxY = Math.min(height - 1, Math.ceil(maxY));

  // Ray casting point-in-polygon test
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x, yi = points[i].y;
        const xj = points[j].x, yj = points[j].y;
        if (
          yi > y !== yj > y &&
          x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
        ) {
          inside = !inside;
        }
      }
      if (inside) {
        const idx = (y * width + x) * 4;
        data[idx + 3] = 255;
      }
    }
  }

  return mask;
}

/**
 * Compute bounding box of a lasso polygon selection.
 */
export function getLassoBounds(
  points: { x: number; y: number }[],
  canvasWidth: number,
  canvasHeight: number
): SelectionBounds {
  let minX = canvasWidth, minY = canvasHeight, maxX = 0, maxY = 0;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return {
    x: Math.max(0, Math.floor(minX)),
    y: Math.max(0, Math.floor(minY)),
    w: Math.min(canvasWidth, Math.ceil(maxX)) - Math.max(0, Math.floor(minX)),
    h: Math.min(canvasHeight, Math.ceil(maxY)) - Math.max(0, Math.floor(minY)),
  };
}

export function invertSelectionMask(mask: ImageData): ImageData {
  const inverted = new ImageData(mask.width, mask.height);
  const src = mask.data;
  const dest = inverted.data;

  for (let i = 3; i < src.length; i += 4) {
    dest[i] = src[i] === 255 ? 0 : 255;
  }
  return inverted;
}

export function selectAllMask(width: number, height: number): ImageData {
  const mask = new ImageData(width, height);
  const data = mask.data;
  for (let i = 3; i < data.length; i += 4) {
    data[i] = 255;
  }
  return mask;
}

/**
 * Renders the iconic animated marching ants outline on the selection overlay canvas.
 * Supports rectangular bounds, ellipse bounds, and lasso polygon paths.
 */
export function drawMarchingAnts(
  overlayCtx: CanvasRenderingContext2D,
  mask: ImageData | null,
  bounds: SelectionBounds | null,
  offset: number,
  selectionType: 'rect' | 'ellipse' | 'lasso' = 'rect',
  lassoPoints?: { x: number; y: number }[]
): void {
  overlayCtx.clearRect(0, 0, overlayCtx.canvas.width, overlayCtx.canvas.height);
  if (!mask && !bounds) return;

  overlayCtx.save();
  overlayCtx.lineWidth = 1;
  overlayCtx.setLineDash([4, 4]);

  if (selectionType === 'ellipse' && bounds) {
    const x = Math.min(bounds.x, bounds.x + bounds.w);
    const y = Math.min(bounds.y, bounds.y + bounds.h);
    const w = Math.abs(bounds.w);
    const h = Math.abs(bounds.h);
    const cx = x + w / 2;
    const cy = y + h / 2;

    // Black line
    overlayCtx.strokeStyle = '#000000';
    overlayCtx.lineDashOffset = offset;
    overlayCtx.beginPath();
    overlayCtx.ellipse(cx, cy, Math.max(0.5, w / 2), Math.max(0.5, h / 2), 0, 0, Math.PI * 2);
    overlayCtx.stroke();

    // White line inverted dash
    overlayCtx.strokeStyle = '#ffffff';
    overlayCtx.lineDashOffset = offset + 4;
    overlayCtx.beginPath();
    overlayCtx.ellipse(cx, cy, Math.max(0.5, w / 2), Math.max(0.5, h / 2), 0, 0, Math.PI * 2);
    overlayCtx.stroke();
  } else if (selectionType === 'lasso' && lassoPoints && lassoPoints.length >= 3) {
    // Draw lasso polygon path
    overlayCtx.strokeStyle = '#000000';
    overlayCtx.lineDashOffset = offset;
    overlayCtx.beginPath();
    overlayCtx.moveTo(lassoPoints[0].x + 0.5, lassoPoints[0].y + 0.5);
    for (let i = 1; i < lassoPoints.length; i++) {
      overlayCtx.lineTo(lassoPoints[i].x + 0.5, lassoPoints[i].y + 0.5);
    }
    overlayCtx.closePath();
    overlayCtx.stroke();

    overlayCtx.strokeStyle = '#ffffff';
    overlayCtx.lineDashOffset = offset + 4;
    overlayCtx.beginPath();
    overlayCtx.moveTo(lassoPoints[0].x + 0.5, lassoPoints[0].y + 0.5);
    for (let i = 1; i < lassoPoints.length; i++) {
      overlayCtx.lineTo(lassoPoints[i].x + 0.5, lassoPoints[i].y + 0.5);
    }
    overlayCtx.closePath();
    overlayCtx.stroke();
  } else if (bounds) {
    const x = Math.min(bounds.x, bounds.x + bounds.w);
    const y = Math.min(bounds.y, bounds.y + bounds.h);
    const w = Math.abs(bounds.w);
    const h = Math.abs(bounds.h);

    // Black line
    overlayCtx.strokeStyle = '#000000';
    overlayCtx.lineDashOffset = offset;
    overlayCtx.strokeRect(x + 0.5, y + 0.5, w, h);

    // White line inverted dash
    overlayCtx.strokeStyle = '#ffffff';
    overlayCtx.lineDashOffset = offset + 4;
    overlayCtx.strokeRect(x + 0.5, y + 0.5, w, h);
  }

  overlayCtx.restore();
}

/**
 * Vector and raster shape drawing routines supporting classic Paint modes:
 * 1. Outline only
 * 2. Outline + Fill
 * 3. Fill only
 */

export type ShapeType = 'line' | 'rectangle' | 'ellipse' | 'round-rect' | 'polygon';

export function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: ShapeType,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  mode: 'outline' | 'fill' | 'both',
  strokeColor: string,
  fillColor: string,
  lineWidth: number = 1,
  polygonSides: number = 5
): void {
  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;
  ctx.beginPath();

  if (shape === 'line') {
    ctx.moveTo(x1 + 0.5, y1 + 0.5);
    ctx.lineTo(x2 + 0.5, y2 + 0.5);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const w = Math.abs(x2 - x1);
  const h = Math.abs(y2 - y1);

  if (shape === 'rectangle') {
    ctx.rect(x + 0.5, y + 0.5, w, h);
  } else if (shape === 'ellipse') {
    ctx.ellipse(
      x + w / 2,
      y + h / 2,
      Math.max(0.1, w / 2),
      Math.max(0.1, h / 2),
      0,
      0,
      Math.PI * 2
    );
  } else if (shape === 'round-rect') {
    const radius = Math.min(10, w / 4, h / 4);
    ctx.roundRect(x + 0.5, y + 0.5, w, h, radius);
  } else if (shape === 'polygon') {
    const sides = Math.max(3, Math.min(12, polygonSides));
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rx = w / 2;
    const ry = h / 2;
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const px = cx + rx * Math.cos(angle);
      const py = cy + ry * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  if (mode === 'fill' || mode === 'both') {
    ctx.fill();
  }
  if (mode === 'outline' || mode === 'both') {
    ctx.stroke();
  }

  ctx.restore();
}

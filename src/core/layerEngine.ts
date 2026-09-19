import { Layer, TextBox } from './types';

let layerIdCounter = 1;

export function createLayer(
  width: number,
  height: number,
  name?: string,
  fillColor?: string
): Layer {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);

  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = false;

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const id = `layer-${Date.now()}-${layerIdCounter++}`;
  return {
    id,
    name: name || `Layer ${layerIdCounter}`,
    visible: true,
    locked: false,
    opacity: 1.0,
    blendMode: 'source-over',
    canvas,
    ctx,
  };
}

export function cloneLayer(source: Layer, newName?: string): Layer {
  const cloned = createLayer(
    source.canvas.width,
    source.canvas.height,
    newName || `${source.name} (Copy)`
  );
  cloned.opacity = source.opacity;
  cloned.blendMode = source.blendMode;
  cloned.visible = source.visible;
  cloned.locked = source.locked;
  cloned.ctx.drawImage(source.canvas, 0, 0);
  return cloned;
}

export function renderTextBoxToContext(ctx: CanvasRenderingContext2D, tb: TextBox): void {
  if (!tb.text) return;
  ctx.save();
  const fontStyle = `${tb.fontItalic ? 'italic ' : ''}${tb.fontBold ? 'bold ' : ''}${tb.fontSize}px ${tb.fontFamily || 'Tahoma, sans-serif'}`;
  ctx.font = fontStyle;
  ctx.fillStyle = tb.color || '#000000';
  ctx.textBaseline = 'top';
  ctx.textAlign = tb.textAlign || 'left';

  const lines = tb.text.split('\n');
  const lineHeight = Math.max(12, Math.round(tb.fontSize * 1.25));

  let startX = tb.x;
  if (tb.textAlign === 'center') {
    startX = tb.x + (tb.width || 0) / 2;
  } else if (tb.textAlign === 'right') {
    startX = tb.x + (tb.width || 0);
  }

  lines.forEach((line, idx) => {
    const y = tb.y + idx * lineHeight;
    ctx.fillText(line, startX, y);

    if (tb.fontUnderline) {
      const metrics = ctx.measureText(line);
      let lineLeft = startX;
      if (tb.textAlign === 'center') {
        lineLeft = startX - metrics.width / 2;
      } else if (tb.textAlign === 'right') {
        lineLeft = startX - metrics.width;
      }
      ctx.beginPath();
      ctx.lineWidth = Math.max(1, Math.round(tb.fontSize / 14));
      ctx.strokeStyle = tb.color || '#000000';
      ctx.moveTo(lineLeft, y + lineHeight - 2);
      ctx.lineTo(lineLeft + metrics.width, y + lineHeight - 2);
      ctx.stroke();
    }
  });

  ctx.restore();
}

export function compositeLayers(
  layers: Layer[],
  targetCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
  textBoxes?: TextBox[]
): void {
  targetCtx.clearRect(0, 0, width, height);

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    if (!layer.visible) continue;

    targetCtx.save();
    targetCtx.globalAlpha = layer.opacity;
    targetCtx.globalCompositeOperation = layer.blendMode;
    targetCtx.drawImage(layer.canvas, 0, 0);
    targetCtx.restore();
  }

  if (textBoxes && textBoxes.length > 0) {
    for (const tb of textBoxes) {
      renderTextBoxToContext(targetCtx, tb);
    }
  }
}

export function mergeLayerDown(
  upperLayer: Layer,
  lowerLayer: Layer,
  width: number,
  height: number
): Layer {
  const merged = createLayer(width, height, lowerLayer.name);
  // Draw lower layer
  merged.ctx.save();
  merged.ctx.globalAlpha = lowerLayer.opacity;
  merged.ctx.globalCompositeOperation = lowerLayer.blendMode;
  merged.ctx.drawImage(lowerLayer.canvas, 0, 0);
  merged.ctx.restore();

  // Draw upper layer
  merged.ctx.save();
  merged.ctx.globalAlpha = upperLayer.opacity;
  merged.ctx.globalCompositeOperation = upperLayer.blendMode;
  merged.ctx.drawImage(upperLayer.canvas, 0, 0);
  merged.ctx.restore();

  return merged;
}

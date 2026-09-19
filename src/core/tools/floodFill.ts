/**
 * High-performance scanline flood fill for the Paint Bucket tool and Magic Wand selection.
 */

interface RGBColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function hexToRgba(hex: string, alpha: number = 255): RGBColor {
  const cleanHex = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length >= 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return { r, g, b, a: alpha };
}

function colorMatch(
  data: Uint8ClampedArray,
  idx: number,
  target: RGBColor,
  tolerance: number
): boolean {
  const rDiff = Math.abs(data[idx] - target.r);
  const gDiff = Math.abs(data[idx + 1] - target.g);
  const bDiff = Math.abs(data[idx + 2] - target.b);
  const aDiff = Math.abs(data[idx + 3] - target.a);

  return (rDiff + gDiff + bDiff + aDiff) / 4 <= tolerance;
}

export function executeFloodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColorHex: string,
  tolerance: number = 32
): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const startIdx = (startY * width + startX) * 4;
  const targetColor: RGBColor = {
    r: data[startIdx],
    g: data[startIdx + 1],
    b: data[startIdx + 2],
    a: data[startIdx + 3],
  };

  const fillColor = hexToRgba(fillColorHex);

  // If already the same color, abort to avoid infinite loop
  if (
    targetColor.r === fillColor.r &&
    targetColor.g === fillColor.g &&
    targetColor.b === fillColor.b &&
    targetColor.a === fillColor.a
  ) {
    return;
  }

  const visited = new Uint8Array(width * height);
  const queue: [number, number][] = [[startX, startY]];
  visited[startY * width + startX] = 1;

  while (queue.length > 0) {
    const [x, y] = queue.pop()!;
    const idx = (y * width + x) * 4;

    data[idx] = fillColor.r;
    data[idx + 1] = fillColor.g;
    data[idx + 2] = fillColor.b;
    data[idx + 3] = fillColor.a;

    // 4-way neighbor check
    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];

    for (let i = 0; i < neighbors.length; i++) {
      const [nx, ny] = neighbors[i];
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!visited[nPos]) {
          visited[nPos] = 1;
          const nIdx = nPos * 4;
          if (colorMatch(data, nIdx, targetColor, tolerance)) {
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Magic Wand selection generator based on color flood matching.
 */
export function executeWandSelection(
  compositeCanvas: HTMLCanvasElement,
  startX: number,
  startY: number,
  tolerance: number = 32,
  contiguous: boolean = true
): ImageData {
  const width = compositeCanvas.width;
  const height = compositeCanvas.height;
  const ctx = compositeCanvas.getContext('2d')!;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const mask = new ImageData(width, height);
  const maskData = mask.data;

  const startIdx = (startY * width + startX) * 4;
  const targetColor: RGBColor = {
    r: data[startIdx],
    g: data[startIdx + 1],
    b: data[startIdx + 2],
    a: data[startIdx + 3],
  };

  if (!contiguous) {
    // Non-contiguous: select all pixels matching tolerance across whole image
    for (let i = 0; i < data.length; i += 4) {
      if (colorMatch(data, i, targetColor, tolerance)) {
        maskData[i + 3] = 255;
      }
    }
    return mask;
  }

  // Contiguous flood fill
  const visited = new Uint8Array(width * height);
  const queue: [number, number][] = [[startX, startY]];
  visited[startY * width + startX] = 1;

  while (queue.length > 0) {
    const [x, y] = queue.pop()!;
    const pos = y * width + x;
    maskData[pos * 4 + 3] = 255;

    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];

    for (let i = 0; i < neighbors.length; i++) {
      const [nx, ny] = neighbors[i];
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!visited[nPos]) {
          visited[nPos] = 1;
          const nIdx = nPos * 4;
          if (colorMatch(data, nIdx, targetColor, tolerance)) {
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  return mask;
}

/**
 * Authentic 24-bit uncompressed Windows Bitmap (BMP) binary encoder.
 * Encodes canvas ImageData into a standard .bmp binary Blob.
 */
export function encodeBMP(imageData: ImageData): Blob {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // Each scanline is padded to a multiple of 4 bytes
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileHeaderSize = 14;
  const infoHeaderSize = 40;
  const fileSize = fileHeaderSize + infoHeaderSize + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // --- BITMAPFILEHEADER (14 bytes) ---
  // Signature 'BM'
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  // File size
  view.setUint32(2, fileSize, true);
  // Reserved (0)
  view.setUint32(6, 0, true);
  // Offset to pixel data (54 bytes)
  view.setUint32(10, fileHeaderSize + infoHeaderSize, true);

  // --- BITMAPINFOHEADER (40 bytes) ---
  view.setUint32(14, infoHeaderSize, true); // Header size
  view.setInt32(18, width, true); // Width
  view.setInt32(22, height, true); // Height (positive = bottom-up)
  view.setUint16(26, 1, true); // Planes = 1
  view.setUint16(28, 24, true); // 24 bits per pixel (RGB)
  view.setUint32(30, 0, true); // Compression = 0 (BI_RGB)
  view.setUint32(34, pixelArraySize, true); // Image data size
  view.setInt32(38, 2835, true); // 72 DPI horizontal (2835 ppm)
  view.setInt32(42, 2835, true); // 72 DPI vertical
  view.setUint32(46, 0, true); // Colors in palette
  view.setUint32(50, 0, true); // Important colors

  // --- PIXEL DATA (Bottom to top, BGR order) ---
  const pixelOffset = fileHeaderSize + infoHeaderSize;
  const uint8View = new Uint8Array(buffer);

  for (let y = 0; y < height; y++) {
    // BMP is stored bottom-to-top
    const srcY = height - 1 - y;
    const srcRowOffset = srcY * width * 4;
    const destRowOffset = pixelOffset + y * rowSize;

    for (let x = 0; x < width; x++) {
      const srcIdx = srcRowOffset + x * 4;
      const destIdx = destRowOffset + x * 3;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];
      const a = data[srcIdx + 3] / 255;

      // Composite onto white background for formats without alpha channel
      const finalR = Math.round(r * a + 255 * (1 - a));
      const finalG = Math.round(g * a + 255 * (1 - a));
      const finalB = Math.round(b * a + 255 * (1 - a));

      // BMP stores in BGR order
      uint8View[destIdx] = finalB;
      uint8View[destIdx + 1] = finalG;
      uint8View[destIdx + 2] = finalR;
    }

    // Padding bytes are already 0 by ArrayBuffer initialization
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

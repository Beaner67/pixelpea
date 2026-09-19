/**
 * Clone Stamp Tool manager
 */

export interface CloneStampState {
  sourcePoint: { x: number; y: number } | null;
  dragOrigin: { x: number; y: number } | null;
}

export const cloneStampState: CloneStampState = {
  sourcePoint: null,
  dragOrigin: null,
};

export function setCloneSource(x: number, y: number): void {
  cloneStampState.sourcePoint = { x, y };
}

export function paintCloneStamp(
  targetCtx: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  currentX: number,
  currentY: number,
  brushRadius: number = 8
): void {
  if (!cloneStampState.sourcePoint || !cloneStampState.dragOrigin) return;

  const offsetX = currentX - cloneStampState.dragOrigin.x;
  const offsetY = currentY - cloneStampState.dragOrigin.y;

  const srcX = cloneStampState.sourcePoint.x + offsetX;
  const srcY = cloneStampState.sourcePoint.y + offsetY;

  targetCtx.save();
  targetCtx.beginPath();
  targetCtx.arc(currentX, currentY, brushRadius, 0, Math.PI * 2);
  targetCtx.clip();

  // Draw source canvas offset so (srcX, srcY) lands at (currentX, currentY)
  targetCtx.drawImage(
    sourceCanvas,
    currentX - srcX,
    currentY - srcY
  );
  targetCtx.restore();
}

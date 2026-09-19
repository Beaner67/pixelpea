/**
 * Curve Tool Engine (Classic MS Paint style)
 * Supports:
 * - Stage 0: Click & drag to define the base line.
 * - Stage 1: Click & drag to bend the line (first control point). Peak passes directly through cursor.
 * - Stage 2: Click & drag to adjust second bend point (S-curve), or single click to finalize.
 * - Live real-time preview during all drags.
 * - Enter to finalize at any bend stage, Escape to cancel.
 */

export interface CurveState {
  stage: 0 | 1 | 2;
  isDragging: boolean;
  p0: { x: number; y: number } | null;
  p1: { x: number; y: number } | null;
  bend1: { x: number; y: number } | null;
  bend2: { x: number; y: number } | null;
  color: string;
  lineWidth: number;
}

export function createInitialCurveState(): CurveState {
  return {
    stage: 0,
    isDragging: false,
    p0: null,
    p1: null,
    bend1: null,
    bend2: null,
    color: '#000000',
    lineWidth: 1,
  };
}

/**
 * Calculates cubic Bézier control points CP1 and CP2 from endpoints and user bend points.
 * Quadratic bend point is mapped so the curve peak passes directly under the cursor.
 */
export function calculateCurvePoints(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  bend1: { x: number; y: number } | null,
  bend2: { x: number; y: number } | null
): { cp1: { x: number; y: number }; cp2: { x: number; y: number } } | null {
  if (!bend1) return null;

  const M = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
  // Q1 placed so the quadratic curve apex B(0.5) is exactly at bend1
  const Q1 = { x: 2 * bend1.x - M.x, y: 2 * bend1.y - M.y };

  const b2 = bend2 || bend1;
  const Q2 = { x: 2 * b2.x - M.x, y: 2 * b2.y - M.y };

  // Convert quadratic control points to equivalent cubic Bézier control points
  const cp1 = {
    x: p0.x + (2 / 3) * (Q1.x - p0.x),
    y: p0.y + (2 / 3) * (Q1.y - p0.y),
  };
  const cp2 = {
    x: p1.x + (2 / 3) * (Q2.x - p1.x),
    y: p1.y + (2 / 3) * (Q2.y - p1.y),
  };

  return { cp1, cp2 };
}

/**
 * Renders the curve preview on the preview canvas.
 */
export function renderCurvePreview(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: CurveState,
  currentPos?: { x: number; y: number }
) {
  ctx.clearRect(0, 0, width, height);
  if (!state.p0) return;

  const p0 = state.p0;
  const p1 = state.stage === 0 ? (currentPos || state.p1 || p0) : (state.p1 || p0);

  ctx.save();
  ctx.strokeStyle = state.color;
  ctx.lineWidth = Math.max(1, state.lineWidth);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(p0.x + 0.5, p0.y + 0.5);

  if (state.stage === 0) {
    // Drawing initial straight line
    ctx.lineTo(p1.x + 0.5, p1.y + 0.5);
  } else {
    const activeBend1 = state.stage === 1 && state.isDragging && currentPos ? currentPos : state.bend1;
    const activeBend2 = state.stage === 2 && state.isDragging && currentPos ? currentPos : state.bend2;

    const control = calculateCurvePoints(p0, p1, activeBend1, activeBend2);
    if (control) {
      ctx.bezierCurveTo(
        control.cp1.x + 0.5,
        control.cp1.y + 0.5,
        control.cp2.x + 0.5,
        control.cp2.y + 0.5,
        p1.x + 0.5,
        p1.y + 0.5
      );
    } else {
      ctx.lineTo(p1.x + 0.5, p1.y + 0.5);
    }
  }

  ctx.stroke();
  ctx.restore();
}

/**
 * Commits the completed curve to the active layer.
 */
export function drawCurveToLayer(
  ctx: CanvasRenderingContext2D,
  state: CurveState
) {
  if (!state.p0 || !state.p1) return;
  const { p0, p1, bend1, bend2, color, lineWidth } = state;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, lineWidth);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(p0.x + 0.5, p0.y + 0.5);

  if (!bend1) {
    ctx.lineTo(p1.x + 0.5, p1.y + 0.5);
  } else {
    const control = calculateCurvePoints(p0, p1, bend1, bend2);
    if (control) {
      ctx.bezierCurveTo(
        control.cp1.x + 0.5,
        control.cp1.y + 0.5,
        control.cp2.x + 0.5,
        control.cp2.y + 0.5,
        p1.x + 0.5,
        p1.y + 0.5
      );
    } else {
      ctx.lineTo(p1.x + 0.5, p1.y + 0.5);
    }
  }

  ctx.stroke();
  ctx.restore();
}

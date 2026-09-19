import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DocumentState, ToolSettings, SelectionBounds, TextBox } from '../core/types';
import { compositeLayers } from '../core/layerEngine';
import {
  drawMarchingAnts,
  setRectSelection,
  setEllipseSelection,
  setLassoSelection,
  getLassoBounds,
} from '../core/selectionEngine';
import { executeFloodFill, executeWandSelection } from '../core/tools/floodFill';
import { paintCloneStamp, setCloneSource, cloneStampState } from '../core/tools/cloneStamp';
import { drawShape } from '../core/tools/shapes';
import { drawGradient, drawGradientPreview } from '../core/tools/gradientTool';
import { smudgeBrush, dodgeBurnBrush, blurSharpenBrush, healingBrush } from '../core/tools/brushEngine';
import {
  CurveState,
  createInitialCurveState,
  renderCurvePreview,
  drawCurveToLayer,
} from '../core/tools/curveTool';

interface CanvasViewportProps {
  doc: DocumentState;
  settings: ToolSettings;
  gridVisible: boolean;
  onUpdateDoc: (newDoc: DocumentState, historyDesc?: string) => void;
  onUpdateCursor: (pos: { x: number; y: number } | null) => void;
  onUpdateSettings: (updates: Partial<ToolSettings>) => void;
  onCrop?: (x: number, y: number, w: number, h: number) => void;
  onHelpText?: (text: string) => void;
  selectedTextBoxId?: string | null;
  onSelectTextBox?: (id: string | null) => void;
}

// Stored selection type for marching ants rendering
let currentSelectionType: 'rect' | 'ellipse' | 'lasso' = 'rect';
let currentLassoPoints: { x: number; y: number }[] = [];

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  doc,
  settings,
  gridVisible,
  onUpdateDoc,
  onUpdateCursor,
  onUpdateSettings,
  onCrop,
  onHelpText,
  selectedTextBoxId,
  onSelectTextBox,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const selectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // Lasso/polygonal lasso state
  const lassoPointsRef = useRef<{ x: number; y: number }[]>([]);
  // Move tool state
  const moveSnapshotRef = useRef<ImageData | null>(null);
  const moveOriginRef = useRef<{ x: number; y: number } | null>(null);
  // Crop state
  const cropBoundsRef = useRef<SelectionBounds | null>(null);
  // Curve tool state (authentic MS Paint 3-step Bézier)
  const curveStateRef = useRef<CurveState>(createInitialCurveState());

  // On-canvas text box state
  const [isEditingText, setIsEditingText] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragTextBoxRef = useRef<{
    mode: 'move' | 'resize';
    handle?: string;
    startClientX: number;
    startClientY: number;
    initialX: number;
    initialY: number;
    initialWidth: number;
    initialHeight: number;
    boxId: string;
  } | null>(null);

  const antOffsetRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditingText && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditingText, selectedTextBoxId]);

  useEffect(() => {
    if (!selectedTextBoxId) {
      setIsEditingText(false);
    }
  }, [selectedTextBoxId]);

  // Commit text helper
  const commitActiveText = useCallback(() => {
    if (!selectedTextBoxId) return;
    const currentBox = (doc.textBoxes || []).find((b) => b.id === selectedTextBoxId);
    if (!currentBox) {
      setIsEditingText(false);
      return;
    }

    if (!currentBox.text || currentBox.text.trim() === '') {
      const nextBoxes = (doc.textBoxes || []).filter((b) => b.id !== selectedTextBoxId);
      onSelectTextBox?.(null);
      onUpdateDoc({ ...doc, textBoxes: nextBoxes });
    } else {
      onUpdateDoc({ ...doc }, 'Edit Text');
    }
    setIsEditingText(false);
  }, [doc, selectedTextBoxId, onUpdateDoc, onSelectTextBox]);

  const findTextBoxAtCoords = (x: number, y: number): TextBox | undefined => {
    if (!doc.textBoxes || doc.textBoxes.length === 0) return undefined;
    for (let i = doc.textBoxes.length - 1; i >= 0; i--) {
      const tb = doc.textBoxes[i];
      if (x >= tb.x && x <= tb.x + tb.width && y >= tb.y && y <= tb.y + tb.height) {
        return tb;
      }
    }
    return undefined;
  };

  // Redraw composite whenever doc layers or active layer changes
  const redrawComposite = useCallback(() => {
    if (!compositeCanvasRef.current) return;
    const ctx = compositeCanvasRef.current.getContext('2d')!;
    const boxesToDraw = (doc.textBoxes || []).filter(
      (tb) => !(isEditingText && tb.id === selectedTextBoxId)
    );
    compositeLayers(doc.layers, ctx, doc.width, doc.height, boxesToDraw);
  }, [doc.layers, doc.width, doc.height, doc.textBoxes, isEditingText, selectedTextBoxId]);

  useEffect(() => {
    redrawComposite();
  }, [redrawComposite]);

  // Marching ants animation loop
  useEffect(() => {
    const loop = () => {
      antOffsetRef.current = (antOffsetRef.current + 0.5) % 8;
      if (selectionCanvasRef.current) {
        const ctx = selectionCanvasRef.current.getContext('2d')!;
        drawMarchingAnts(
          ctx,
          doc.selectionMask,
          doc.selectionBounds,
          antOffsetRef.current,
          currentSelectionType,
          currentLassoPoints.length >= 3 ? currentLassoPoints : undefined
        );
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [doc.selectionMask, doc.selectionBounds]);

  // Pixel grid drawing
  useEffect(() => {
    if (!gridCanvasRef.current) return;
    const ctx = gridCanvasRef.current.getContext('2d')!;
    ctx.clearRect(0, 0, doc.width, doc.height);

    if (gridVisible && settings.zoom >= 4) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1 / settings.zoom;
      ctx.beginPath();
      for (let x = 0; x <= doc.width; x++) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, doc.height);
      }
      for (let y = 0; y <= doc.height; y++) {
        ctx.moveTo(0, y);
        ctx.lineTo(doc.width, y);
      }
      ctx.stroke();
    }
  }, [gridVisible, settings.zoom, doc.width, doc.height]);

  // Convert client coordinates to canvas document pixel coordinates
  const getDocCoords = (e: React.PointerEvent): { x: number; y: number } => {
    if (!compositeCanvasRef.current) return { x: 0, y: 0 };
    const rect = compositeCanvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / settings.zoom);
    const y = Math.floor((e.clientY - rect.top) / settings.zoom);
    return {
      x: Math.max(0, Math.min(doc.width - 1, x)),
      y: Math.max(0, Math.min(doc.height - 1, y)),
    };
  };

  const getActiveLayer = () => {
    return doc.layers.find((l) => l.id === doc.activeLayerId) || doc.layers[0];
  };

  /**
   * Apply selection clipping to a layer context before drawing.
   * Returns a cleanup function to restore the context.
   */
  const applySelectionClip = (ctx: CanvasRenderingContext2D): (() => void) => {
    if (doc.selectionBounds && doc.selectionBounds.w > 0 && doc.selectionBounds.h > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        doc.selectionBounds.x,
        doc.selectionBounds.y,
        doc.selectionBounds.w,
        doc.selectionBounds.h
      );
      ctx.clip();
      return () => ctx.restore();
    }
    return () => {}; // No-op if no selection
  };

  // --- POINTER EVENTS ---

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 2) return;
    const isRightClick = e.button === 2;
    const activeLayer = getActiveLayer();

    // Guard: locked or hidden layer for drawing tools
    const isDrawingTool = ![
      'zoom', 'pan', 'eyedropper', 'select-rect', 'select-ellipse',
      'select-lasso', 'select-poly-lasso', 'select-wand', 'text',
    ].includes(settings.currentTool);
    if (isDrawingTool && activeLayer && (activeLayer.locked || !activeLayer.visible)) {
      return;
    }

    const coords = getDocCoords(e);
    const currentColor = isRightClick ? settings.secondaryColor : settings.primaryColor;

    // Pointer capture to prevent lost strokes
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}

    // --- IMMEDIATE TOOLS (no drag state) ---

    // Handle Text tool and text box selection / creation
    if (settings.currentTool === 'text' || settings.currentTool === 'move') {
      const hitBox = findTextBoxAtCoords(coords.x, coords.y);
      if (hitBox) {
        if (isEditingText && selectedTextBoxId !== hitBox.id) {
          commitActiveText();
        }
        onSelectTextBox?.(hitBox.id);
        if (e.detail >= 2) {
          setIsEditingText(true);
        } else {
          setIsEditingText(false);
          dragTextBoxRef.current = {
            mode: 'move',
            startClientX: e.clientX,
            startClientY: e.clientY,
            initialX: hitBox.x,
            initialY: hitBox.y,
            initialWidth: hitBox.width,
            initialHeight: hitBox.height,
            boxId: hitBox.id,
          };
        }
        return;
      }
    }

    if (settings.currentTool === 'text') {
      if (isEditingText) {
        commitActiveText();
      }
      const newBox: TextBox = {
        id: `tb-${Date.now()}`,
        x: coords.x,
        y: coords.y,
        width: Math.min(Math.max(160, Math.round((settings.fontSize || 16) * 8)), Math.max(80, doc.width - coords.x)),
        height: Math.min(Math.max(40, Math.round((settings.fontSize || 16) * 2.5)), Math.max(30, doc.height - coords.y)),
        text: '',
        fontFamily: settings.fontFamily || 'Tahoma, sans-serif',
        fontSize: settings.fontSize || 16,
        fontBold: settings.fontBold || false,
        fontItalic: settings.fontItalic || false,
        fontUnderline: settings.fontUnderline || false,
        textAlign: settings.textAlign || 'left',
        color: settings.primaryColor || '#000000',
      };
      const updatedBoxes = [...(doc.textBoxes || []), newBox];
      onUpdateDoc({ ...doc, textBoxes: updatedBoxes });
      onSelectTextBox?.(newBox.id);
      setIsEditingText(true);
      return;
    } else {
      if (isEditingText) {
        commitActiveText();
      }
      if (selectedTextBoxId && settings.currentTool !== 'move') {
        onSelectTextBox?.(null);
      }
    }

    // Eyedropper Tool
    if (settings.currentTool === 'eyedropper') {
      const ctx = compositeCanvasRef.current?.getContext('2d');
      if (ctx) {
        const pixel = ctx.getImageData(coords.x, coords.y, 1, 1).data;
        const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2])
          .toString(16)
          .slice(1)}`;
        if (isRightClick) {
          onUpdateSettings({ secondaryColor: hex });
        } else {
          onUpdateSettings({ primaryColor: hex });
        }
      }
      return;
    }

    // Clone Stamp Alt+Click Sampling
    if (settings.currentTool === 'clone-stamp' && e.altKey) {
      setCloneSource(coords.x, coords.y);
      return;
    }

    // Bucket Tool
    if (settings.currentTool === 'bucket') {
      if (!activeLayer) return;
      const restore = applySelectionClip(activeLayer.ctx);
      executeFloodFill(activeLayer.ctx, coords.x, coords.y, currentColor, settings.tolerance);
      restore();
      redrawComposite();
      onUpdateDoc({ ...doc }, 'Fill With Color');
      return;
    }

    // Magic Wand
    if (settings.currentTool === 'select-wand') {
      if (compositeCanvasRef.current) {
        const mask = executeWandSelection(
          compositeCanvasRef.current,
          coords.x,
          coords.y,
          settings.tolerance,
          settings.contiguous
        );
        currentSelectionType = 'rect';
        currentLassoPoints = [];
        onUpdateDoc({
          ...doc,
          selectionMask: mask,
          selectionBounds: { x: 0, y: 0, w: doc.width, h: doc.height },
        });
      }
      return;
    }

    // Zoom Click
    if (settings.currentTool === 'zoom') {
      const nextZoom = isRightClick
        ? Math.max(0.25, settings.zoom / 2)
        : Math.min(16, settings.zoom * 2);
      onUpdateSettings({ zoom: nextZoom });
      return;
    }

    // Polygonal Lasso — click to add point
    if (settings.currentTool === 'select-poly-lasso') {
      if (lassoPointsRef.current.length === 0) {
        lassoPointsRef.current = [coords];
        setIsDrawing(true);
      } else {
        // Check if close to first point (close the selection)
        const first = lassoPointsRef.current[0];
        const dist = Math.sqrt((coords.x - first.x) ** 2 + (coords.y - first.y) ** 2);
        if (dist < 5 && lassoPointsRef.current.length >= 3) {
          // Close selection
          const points = lassoPointsRef.current;
          const mask = setLassoSelection(doc.width, doc.height, points);
          const bounds = getLassoBounds(points, doc.width, doc.height);
          currentSelectionType = 'lasso';
          currentLassoPoints = [...points];
          onUpdateDoc({ ...doc, selectionMask: mask, selectionBounds: bounds });
          lassoPointsRef.current = [];
          setIsDrawing(false);
          // Clear preview
          if (previewCanvasRef.current) {
            previewCanvasRef.current.getContext('2d')!.clearRect(0, 0, doc.width, doc.height);
          }
        } else {
          lassoPointsRef.current.push(coords);
        }
      }
      return;
    }

    // --- DRAG TOOLS ---
    setIsDrawing(true);
    setStartPoint(coords);
    setLastPoint(coords);

    if (settings.currentTool === 'curve') {
      const state = curveStateRef.current;
      if (state.stage === 0) {
        curveStateRef.current = {
          stage: 0,
          isDragging: true,
          p0: coords,
          p1: coords,
          bend1: null,
          bend2: null,
          color: currentColor,
          lineWidth: settings.brushSize || 1,
        };
        onHelpText?.('Curve: Drag to draw the line.');
      } else if (state.stage === 1) {
        state.isDragging = true;
        state.bend1 = coords;
        if (previewCanvasRef.current) {
          const pCtx = previewCanvasRef.current.getContext('2d')!;
          renderCurvePreview(pCtx, doc.width, doc.height, state, coords);
        }
        onHelpText?.('Curve: Drag to bend the line (release to set first bend).');
      } else if (state.stage === 2) {
        state.isDragging = true;
        state.bend2 = coords;
        if (previewCanvasRef.current) {
          const pCtx = previewCanvasRef.current.getContext('2d')!;
          renderCurvePreview(pCtx, doc.width, doc.height, state, coords);
        }
        onHelpText?.('Curve: Drag for second bend, or click to finalize.');
      }
      return;
    }

    if (settings.currentTool === 'move') {
      // Snapshot the active layer for move
      if (activeLayer) {
        moveSnapshotRef.current = activeLayer.ctx.getImageData(0, 0, doc.width, doc.height);
        moveOriginRef.current = coords;
      }
    } else if (settings.currentTool === 'clone-stamp') {
      cloneStampState.dragOrigin = coords;
      if (compositeCanvasRef.current && activeLayer) {
        const restore = applySelectionClip(activeLayer.ctx);
        paintCloneStamp(activeLayer.ctx, compositeCanvasRef.current, coords.x, coords.y, settings.brushSize);
        restore();
        redrawComposite();
      }
    } else if (settings.currentTool === 'pencil') {
      if (activeLayer) {
        const restore = applySelectionClip(activeLayer.ctx);
        activeLayer.ctx.fillStyle = currentColor;
        activeLayer.ctx.fillRect(coords.x, coords.y, 1, 1);
        restore();
        redrawComposite();
      }
    } else if (settings.currentTool === 'brush') {
      if (activeLayer) {
        const restore = applySelectionClip(activeLayer.ctx);
        activeLayer.ctx.fillStyle = currentColor;
        activeLayer.ctx.beginPath();
        activeLayer.ctx.arc(coords.x, coords.y, settings.brushSize / 2, 0, Math.PI * 2);
        activeLayer.ctx.fill();
        restore();
        redrawComposite();
      }
    } else if (settings.currentTool === 'eraser') {
      if (activeLayer) {
        const restore = applySelectionClip(activeLayer.ctx);
        activeLayer.ctx.clearRect(
          coords.x - settings.eraserSize / 2,
          coords.y - settings.eraserSize / 2,
          settings.eraserSize,
          settings.eraserSize
        );
        restore();
        redrawComposite();
      }
    } else if (settings.currentTool === 'healing-brush') {
      if (activeLayer) {
        const restore = applySelectionClip(activeLayer.ctx);
        healingBrush(activeLayer.ctx, coords.x, coords.y, settings.brushSize / 2);
        restore();
        redrawComposite();
      }
    } else if (settings.currentTool === 'smudge') {
      // Smudge needs two points — first click just records position
    } else if (settings.currentTool === 'dodge-burn') {
      if (activeLayer) {
        const restore = applySelectionClip(activeLayer.ctx);
        dodgeBurnBrush(activeLayer.ctx, coords.x, coords.y, settings.brushSize / 2, settings.dodgeBurnMode);
        restore();
        redrawComposite();
      }
    } else if (settings.currentTool === 'blur-sharpen') {
      if (activeLayer) {
        const restore = applySelectionClip(activeLayer.ctx);
        blurSharpenBrush(activeLayer.ctx, coords.x, coords.y, settings.brushSize / 2, settings.blurSharpenMode);
        restore();
        redrawComposite();
      }
    } else if (settings.currentTool === 'select-lasso') {
      lassoPointsRef.current = [coords];
    } else if (settings.currentTool === 'pan') {
      // Pan start — record position for scrolling
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const coords = getDocCoords(e);
    onUpdateCursor(coords);

    // Text box moving / resizing drag
    if (dragTextBoxRef.current) {
      const drag = dragTextBoxRef.current;
      const dx = Math.round((e.clientX - drag.startClientX) / settings.zoom);
      const dy = Math.round((e.clientY - drag.startClientY) / settings.zoom);

      if (drag.mode === 'move') {
        const newX = Math.max(-drag.initialWidth + 20, Math.min(doc.width - 20, drag.initialX + dx));
        const newY = Math.max(-drag.initialHeight + 20, Math.min(doc.height - 20, drag.initialY + dy));
        const updatedBoxes = (doc.textBoxes || []).map((b) =>
          b.id === drag.boxId ? { ...b, x: newX, y: newY } : b
        );
        onUpdateDoc({ ...doc, textBoxes: updatedBoxes });
      } else if (drag.mode === 'resize' && drag.handle) {
        let newX = drag.initialX;
        let newY = drag.initialY;
        let newW = drag.initialWidth;
        let newH = drag.initialHeight;

        if (drag.handle.includes('e')) {
          newW = Math.max(30, drag.initialWidth + dx);
        }
        if (drag.handle.includes('s')) {
          newH = Math.max(20, drag.initialHeight + dy);
        }
        if (drag.handle.includes('w')) {
          const rawW = drag.initialWidth - dx;
          if (rawW >= 30) {
            newW = rawW;
            newX = drag.initialX + dx;
          }
        }
        if (drag.handle.includes('n')) {
          const rawH = drag.initialHeight - dy;
          if (rawH >= 20) {
            newH = rawH;
            newY = drag.initialY + dy;
          }
        }

        const updatedBoxes = (doc.textBoxes || []).map((b) =>
          b.id === drag.boxId ? { ...b, x: newX, y: newY, width: newW, height: newH } : b
        );
        onUpdateDoc({ ...doc, textBoxes: updatedBoxes });
      }
      return;
    }

    // Pan tool dragging — scroll the container
    if (settings.currentTool === 'pan' && isDrawing && lastPoint) {
      if (containerRef.current) {
        const dx = (coords.x - lastPoint.x) * settings.zoom;
        const dy = (coords.y - lastPoint.y) * settings.zoom;
        containerRef.current.scrollLeft -= dx;
        containerRef.current.scrollTop -= dy;
      }
      // Don't update lastPoint for pan (we want cumulative scroll)
      return;
    }

    // Polygonal lasso preview
    if (settings.currentTool === 'select-poly-lasso' && lassoPointsRef.current.length > 0) {
      if (previewCanvasRef.current) {
        const pCtx = previewCanvasRef.current.getContext('2d')!;
        pCtx.clearRect(0, 0, doc.width, doc.height);
        pCtx.strokeStyle = '#000000';
        pCtx.lineWidth = 1;
        pCtx.setLineDash([3, 3]);
        pCtx.beginPath();
        pCtx.moveTo(lassoPointsRef.current[0].x + 0.5, lassoPointsRef.current[0].y + 0.5);
        for (let i = 1; i < lassoPointsRef.current.length; i++) {
          pCtx.lineTo(lassoPointsRef.current[i].x + 0.5, lassoPointsRef.current[i].y + 0.5);
        }
        pCtx.lineTo(coords.x + 0.5, coords.y + 0.5);
        pCtx.stroke();
        pCtx.setLineDash([]);
      }
      return;
    }

    if (!isDrawing || !startPoint || !lastPoint) return;
    const activeLayer = getActiveLayer();
    if (!activeLayer) return;

    const currentColor = e.buttons === 2 ? settings.secondaryColor : settings.primaryColor;

    // Move tool
    if (settings.currentTool === 'move' && moveSnapshotRef.current && moveOriginRef.current) {
      const dx = coords.x - moveOriginRef.current.x;
      const dy = coords.y - moveOriginRef.current.y;
      activeLayer.ctx.clearRect(0, 0, doc.width, doc.height);
      activeLayer.ctx.putImageData(moveSnapshotRef.current, dx, dy);
      redrawComposite();
      setLastPoint(coords);
      return;
    }

    // Pencil continuous line
    if (settings.currentTool === 'pencil') {
      const restore = applySelectionClip(activeLayer.ctx);
      activeLayer.ctx.save();
      activeLayer.ctx.strokeStyle = currentColor;
      activeLayer.ctx.lineWidth = 1;
      activeLayer.ctx.beginPath();
      activeLayer.ctx.moveTo(lastPoint.x + 0.5, lastPoint.y + 0.5);
      activeLayer.ctx.lineTo(coords.x + 0.5, coords.y + 0.5);
      activeLayer.ctx.stroke();
      activeLayer.ctx.restore();
      restore();
      redrawComposite();
      setLastPoint(coords);
    } else if (settings.currentTool === 'brush') {
      const restore = applySelectionClip(activeLayer.ctx);
      activeLayer.ctx.save();
      activeLayer.ctx.strokeStyle = currentColor;
      activeLayer.ctx.fillStyle = currentColor;
      activeLayer.ctx.lineWidth = settings.brushSize;
      activeLayer.ctx.lineCap = 'round';
      activeLayer.ctx.lineJoin = 'round';
      activeLayer.ctx.beginPath();
      activeLayer.ctx.moveTo(lastPoint.x, lastPoint.y);
      activeLayer.ctx.lineTo(coords.x, coords.y);
      activeLayer.ctx.stroke();
      activeLayer.ctx.restore();
      restore();
      redrawComposite();
      setLastPoint(coords);
    } else if (settings.currentTool === 'eraser') {
      const restore = applySelectionClip(activeLayer.ctx);
      activeLayer.ctx.clearRect(
        coords.x - settings.eraserSize / 2,
        coords.y - settings.eraserSize / 2,
        settings.eraserSize,
        settings.eraserSize
      );
      restore();
      redrawComposite();
      setLastPoint(coords);
    } else if (settings.currentTool === 'clone-stamp') {
      if (compositeCanvasRef.current) {
        const restore = applySelectionClip(activeLayer.ctx);
        paintCloneStamp(activeLayer.ctx, compositeCanvasRef.current, coords.x, coords.y, settings.brushSize);
        restore();
        redrawComposite();
      }
      setLastPoint(coords);
    } else if (settings.currentTool === 'healing-brush') {
      const restore = applySelectionClip(activeLayer.ctx);
      healingBrush(activeLayer.ctx, coords.x, coords.y, settings.brushSize / 2);
      restore();
      redrawComposite();
      setLastPoint(coords);
    } else if (settings.currentTool === 'smudge') {
      const restore = applySelectionClip(activeLayer.ctx);
      smudgeBrush(activeLayer.ctx, lastPoint.x, lastPoint.y, coords.x, coords.y, settings.brushSize / 2);
      restore();
      redrawComposite();
      setLastPoint(coords);
    } else if (settings.currentTool === 'dodge-burn') {
      const restore = applySelectionClip(activeLayer.ctx);
      dodgeBurnBrush(activeLayer.ctx, coords.x, coords.y, settings.brushSize / 2, settings.dodgeBurnMode);
      restore();
      redrawComposite();
      setLastPoint(coords);
    } else if (settings.currentTool === 'blur-sharpen') {
      const restore = applySelectionClip(activeLayer.ctx);
      blurSharpenBrush(activeLayer.ctx, coords.x, coords.y, settings.brushSize / 2, settings.blurSharpenMode);
      restore();
      redrawComposite();
      setLastPoint(coords);
    } else if (
      ['line', 'rectangle', 'ellipse', 'round-rect', 'polygon'].includes(settings.currentTool)
    ) {
      // Draw live shape preview on transient overlay canvas
      if (previewCanvasRef.current) {
        const pCtx = previewCanvasRef.current.getContext('2d')!;
        pCtx.clearRect(0, 0, doc.width, doc.height);
        drawShape(
          pCtx,
          settings.currentTool as any,
          startPoint.x,
          startPoint.y,
          coords.x,
          coords.y,
          settings.shapeFillMode,
          currentColor,
          settings.secondaryColor,
          settings.brushSize || 1,
          settings.polygonSides
        );
      }
    } else if (settings.currentTool === 'gradient') {
      // Gradient preview
      if (previewCanvasRef.current) {
        const pCtx = previewCanvasRef.current.getContext('2d')!;
        drawGradientPreview(
          pCtx,
          settings.gradientType,
          startPoint.x,
          startPoint.y,
          coords.x,
          coords.y,
          currentColor,
          settings.secondaryColor,
          doc.width,
          doc.height,
          settings.opacity ?? 1.0,
          doc.selectionMask,
          doc.selectionBounds
        );
      }
    } else if (settings.currentTool === 'curve') {
      const state = curveStateRef.current;
      if (state.isDragging && previewCanvasRef.current) {
        const pCtx = previewCanvasRef.current.getContext('2d')!;
        renderCurvePreview(pCtx, doc.width, doc.height, state, coords);
      }
      return;
    } else if (settings.currentTool === 'select-rect') {
      // Draw selection marquee preview
      const bounds: SelectionBounds = {
        x: Math.min(startPoint.x, coords.x),
        y: Math.min(startPoint.y, coords.y),
        w: Math.abs(coords.x - startPoint.x),
        h: Math.abs(coords.y - startPoint.y),
      };
      if (selectionCanvasRef.current) {
        const sCtx = selectionCanvasRef.current.getContext('2d')!;
        drawMarchingAnts(sCtx, null, bounds, antOffsetRef.current, 'rect');
      }
    } else if (settings.currentTool === 'select-ellipse') {
      // Draw ellipse selection preview
      const bounds: SelectionBounds = {
        x: Math.min(startPoint.x, coords.x),
        y: Math.min(startPoint.y, coords.y),
        w: Math.abs(coords.x - startPoint.x),
        h: Math.abs(coords.y - startPoint.y),
      };
      if (selectionCanvasRef.current) {
        const sCtx = selectionCanvasRef.current.getContext('2d')!;
        drawMarchingAnts(sCtx, null, bounds, antOffsetRef.current, 'ellipse');
      }
    } else if (settings.currentTool === 'select-lasso') {
      // Collect freehand lasso points
      lassoPointsRef.current.push(coords);
      // Draw preview
      if (previewCanvasRef.current) {
        const pCtx = previewCanvasRef.current.getContext('2d')!;
        pCtx.clearRect(0, 0, doc.width, doc.height);
        pCtx.strokeStyle = '#000000';
        pCtx.lineWidth = 1;
        pCtx.setLineDash([3, 3]);
        pCtx.beginPath();
        const pts = lassoPointsRef.current;
        pCtx.moveTo(pts[0].x + 0.5, pts[0].y + 0.5);
        for (let i = 1; i < pts.length; i++) {
          pCtx.lineTo(pts[i].x + 0.5, pts[i].y + 0.5);
        }
        pCtx.stroke();
        pCtx.setLineDash([]);
      }
    } else if (settings.currentTool === 'crop') {
      // Crop preview
      if (previewCanvasRef.current) {
        const pCtx = previewCanvasRef.current.getContext('2d')!;
        pCtx.clearRect(0, 0, doc.width, doc.height);

        const cx = Math.min(startPoint.x, coords.x);
        const cy = Math.min(startPoint.y, coords.y);
        const cw = Math.abs(coords.x - startPoint.x);
        const ch = Math.abs(coords.y - startPoint.y);

        // Darken outside the crop area
        pCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        pCtx.fillRect(0, 0, doc.width, doc.height);
        pCtx.clearRect(cx, cy, cw, ch);

        // Draw crop border
        pCtx.strokeStyle = '#ffffff';
        pCtx.lineWidth = 1;
        pCtx.setLineDash([4, 4]);
        pCtx.strokeRect(cx + 0.5, cy + 0.5, cw, ch);
        pCtx.setLineDash([]);

        cropBoundsRef.current = { x: cx, y: cy, w: cw, h: ch };
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // Release pointer capture
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) { /* already released */ }

    if (dragTextBoxRef.current) {
      const action = dragTextBoxRef.current.mode === 'move' ? 'Move Text' : 'Resize Text';
      dragTextBoxRef.current = null;
      onUpdateDoc({ ...doc }, action);
      return;
    }

    if (!isDrawing || !startPoint) return;
    setIsDrawing(false);
    const coords = getDocCoords(e);
    const activeLayer = getActiveLayer();
    const currentColor = e.button === 2 ? settings.secondaryColor : settings.primaryColor;

    // Clear preview canvas (for tools that do not keep a multi-stage preview)
    if (
      previewCanvasRef.current &&
      settings.currentTool !== 'curve' &&
      settings.currentTool !== 'crop' &&
      settings.currentTool !== 'select-poly-lasso'
    ) {
      const pCtx = previewCanvasRef.current.getContext('2d')!;
      pCtx.clearRect(0, 0, doc.width, doc.height);
    }

    if (activeLayer) {
      if (['line', 'rectangle', 'ellipse', 'round-rect', 'polygon'].includes(settings.currentTool)) {
        const restore = applySelectionClip(activeLayer.ctx);
        drawShape(
          activeLayer.ctx,
          settings.currentTool as any,
          startPoint.x,
          startPoint.y,
          coords.x,
          coords.y,
          settings.shapeFillMode,
          currentColor,
          settings.secondaryColor,
          settings.brushSize || 1,
          settings.polygonSides
        );
        restore();
        redrawComposite();
        onUpdateDoc({ ...doc }, settings.currentTool.toUpperCase());
      } else if (settings.currentTool === 'curve') {
        const state = curveStateRef.current;
        if (state.stage === 0) {
          const p0 = state.p0 || startPoint;
          const dist = Math.hypot(coords.x - p0.x, coords.y - p0.y);
          if (dist < 2) {
            curveStateRef.current = createInitialCurveState();
            if (previewCanvasRef.current) {
              previewCanvasRef.current.getContext('2d')!.clearRect(0, 0, doc.width, doc.height);
            }
            onHelpText?.('');
            setStartPoint(null);
            setLastPoint(null);
            return;
          }
          state.p1 = coords;
          state.isDragging = false;
          state.stage = 1;
          if (previewCanvasRef.current) {
            const pCtx = previewCanvasRef.current.getContext('2d')!;
            renderCurvePreview(pCtx, doc.width, doc.height, state);
          }
          onHelpText?.('Curve: Click and drag to bend the line (or click to finish).');
          setStartPoint(null);
          setLastPoint(null);
          return;
        } else if (state.stage === 1) {
          state.isDragging = false;
          state.bend1 = coords;
          state.stage = 2;
          if (previewCanvasRef.current) {
            const pCtx = previewCanvasRef.current.getContext('2d')!;
            renderCurvePreview(pCtx, doc.width, doc.height, state);
          }
          onHelpText?.('Curve: Click and drag for second bend, or click/press Enter to finalize.');
          setStartPoint(null);
          setLastPoint(null);
          return;
        } else if (state.stage === 2) {
          state.isDragging = false;
          const dist = Math.hypot(coords.x - startPoint.x, coords.y - startPoint.y);
          state.bend2 = dist < 3 ? state.bend1 : coords;

          const restore = applySelectionClip(activeLayer.ctx);
          drawCurveToLayer(activeLayer.ctx, state);
          restore();
          redrawComposite();
          onUpdateDoc({ ...doc }, 'CURVE');

          if (previewCanvasRef.current) {
            previewCanvasRef.current.getContext('2d')!.clearRect(0, 0, doc.width, doc.height);
          }
          curveStateRef.current = createInitialCurveState();
          onHelpText?.('');
          setStartPoint(null);
          setLastPoint(null);
          return;
        }
      } else if (settings.currentTool === 'gradient') {
        // Commit gradient
        drawGradient(
          activeLayer.ctx,
          settings.gradientType,
          startPoint.x,
          startPoint.y,
          coords.x,
          coords.y,
          currentColor,
          settings.secondaryColor,
          doc.width,
          doc.height,
          settings.opacity ?? 1.0,
          doc.selectionMask,
          doc.selectionBounds
        );
        redrawComposite();
        onUpdateDoc({ ...doc }, 'Gradient');
      } else if (settings.currentTool === 'select-rect') {
        const bounds: SelectionBounds = {
          x: Math.min(startPoint.x, coords.x),
          y: Math.min(startPoint.y, coords.y),
          w: Math.abs(coords.x - startPoint.x),
          h: Math.abs(coords.y - startPoint.y),
        };
        currentSelectionType = 'rect';
        currentLassoPoints = [];
        if (bounds.w < 2 && bounds.h < 2) {
          onUpdateDoc({ ...doc, selectionMask: null, selectionBounds: null }, 'Deselect');
        } else {
          const mask = setRectSelection(doc.width, doc.height, bounds);
          onUpdateDoc({ ...doc, selectionMask: mask, selectionBounds: bounds }, 'Select Rectangle');
        }
      } else if (settings.currentTool === 'select-ellipse') {
        const bounds: SelectionBounds = {
          x: Math.min(startPoint.x, coords.x),
          y: Math.min(startPoint.y, coords.y),
          w: Math.abs(coords.x - startPoint.x),
          h: Math.abs(coords.y - startPoint.y),
        };
        currentSelectionType = 'ellipse';
        currentLassoPoints = [];
        if (bounds.w < 2 && bounds.h < 2) {
          onUpdateDoc({ ...doc, selectionMask: null, selectionBounds: null }, 'Deselect');
        } else {
          const mask = setEllipseSelection(doc.width, doc.height, bounds);
          onUpdateDoc({ ...doc, selectionMask: mask, selectionBounds: bounds }, 'Select Ellipse');
        }
      } else if (settings.currentTool === 'select-lasso') {
        const points = lassoPointsRef.current;
        if (points.length >= 3) {
          const bounds = getLassoBounds(points, doc.width, doc.height);
          if (bounds.w < 2 && bounds.h < 2) {
            currentSelectionType = 'rect';
            currentLassoPoints = [];
            onUpdateDoc({ ...doc, selectionMask: null, selectionBounds: null }, 'Deselect');
          } else {
            const mask = setLassoSelection(doc.width, doc.height, points);
            currentSelectionType = 'lasso';
            currentLassoPoints = [...points];
            onUpdateDoc({ ...doc, selectionMask: mask, selectionBounds: bounds }, 'Select Lasso');
          }
        } else {
          currentSelectionType = 'rect';
          currentLassoPoints = [];
          onUpdateDoc({ ...doc, selectionMask: null, selectionBounds: null }, 'Deselect');
        }
        lassoPointsRef.current = [];
      } else if (settings.currentTool === 'move') {
        moveSnapshotRef.current = null;
        moveOriginRef.current = null;
        onUpdateDoc({ ...doc }, 'Move Layer');
      } else if (settings.currentTool === 'crop') {
        // Keep crop bounds visible; user must press Enter to confirm
        // The crop bounds are stored in cropBoundsRef
        if (cropBoundsRef.current && cropBoundsRef.current.w > 0 && cropBoundsRef.current.h > 0) {
          // Redraw crop preview to keep it visible
          if (previewCanvasRef.current) {
            const pCtx = previewCanvasRef.current.getContext('2d')!;
            const { x, y, w, h } = cropBoundsRef.current;
            pCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            pCtx.fillRect(0, 0, doc.width, doc.height);
            pCtx.clearRect(x, y, w, h);
            pCtx.strokeStyle = '#ffffff';
            pCtx.lineWidth = 1;
            pCtx.setLineDash([4, 4]);
            pCtx.strokeRect(x + 0.5, y + 0.5, w, h);
            pCtx.setLineDash([]);
          }
        }
      } else if (
        ['pencil', 'brush', 'eraser', 'clone-stamp', 'healing-brush',
         'smudge', 'dodge-burn', 'blur-sharpen'].includes(settings.currentTool)
      ) {
        onUpdateDoc({ ...doc }, settings.currentTool.toUpperCase());
      }
    }

    setStartPoint(null);
    setLastPoint(null);
  };

  const commitActiveTextRef = useRef(commitActiveText);
  commitActiveTextRef.current = commitActiveText;
  const isEditingTextRef = useRef(isEditingText);
  isEditingTextRef.current = isEditingText;

  // Tool reset on tool change ONLY
  useEffect(() => {
    if (settings.currentTool !== 'text' && isEditingTextRef.current) {
      commitActiveTextRef.current();
    }
    curveStateRef.current = createInitialCurveState();
    lassoPointsRef.current = [];
    cropBoundsRef.current = null;
    setIsDrawing(false);
    setStartPoint(null);
    if (previewCanvasRef.current) {
      previewCanvasRef.current.getContext('2d')?.clearRect(0, 0, doc.width, doc.height);
    }
  }, [settings.currentTool]);

  // Handle Enter, Escape, and Delete keys
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTextBoxId && !isEditingText) {
        const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (targetTag === 'input' || targetTag === 'textarea') return;
        e.preventDefault();
        const nextBoxes = (doc.textBoxes || []).filter((b) => b.id !== selectedTextBoxId);
        onSelectTextBox?.(null);
        onUpdateDoc({ ...doc, textBoxes: nextBoxes }, 'Delete Text');
        return;
      }

      if (e.key === 'Enter') {
        if (settings.currentTool === 'crop' && cropBoundsRef.current) {
          const { x, y, w, h } = cropBoundsRef.current;
          if (w > 0 && h > 0 && onCrop) {
            onCrop(x, y, w, h);
          }
          cropBoundsRef.current = null;
          if (previewCanvasRef.current) {
            previewCanvasRef.current.getContext('2d')!.clearRect(0, 0, doc.width, doc.height);
          }
        } else if (settings.currentTool === 'curve' && curveStateRef.current.stage > 0) {
          const state = curveStateRef.current;
          const activeLayer = getActiveLayer();
          if (activeLayer && state.p0 && state.p1) {
            const restore = applySelectionClip(activeLayer.ctx);
            drawCurveToLayer(activeLayer.ctx, state);
            restore();
            redrawComposite();
            onUpdateDoc({ ...doc }, 'CURVE');
          }
          if (previewCanvasRef.current) {
            previewCanvasRef.current.getContext('2d')!.clearRect(0, 0, doc.width, doc.height);
          }
          curveStateRef.current = createInitialCurveState();
          setIsDrawing(false);
          setStartPoint(null);
          onHelpText?.('');
        }
      } else if (e.key === 'Escape') {
        if (isEditingText) {
          commitActiveText();
        } else if (selectedTextBoxId) {
          onSelectTextBox?.(null);
        }
        // Cancel crop / poly lasso / curve
        cropBoundsRef.current = null;
        lassoPointsRef.current = [];
        curveStateRef.current = createInitialCurveState();
        setIsDrawing(false);
        setStartPoint(null);
        if (previewCanvasRef.current) {
          previewCanvasRef.current.getContext('2d')!.clearRect(0, 0, doc.width, doc.height);
        }
        onHelpText?.('');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [
    settings.currentTool,
    doc,
    selectedTextBoxId,
    isEditingText,
    commitActiveText,
    onSelectTextBox,
    onUpdateDoc,
    onCrop,
    onHelpText,
  ]);

  // Cursor style based on tool
  const getCursor = (): string => {
    switch (settings.currentTool) {
      case 'zoom': return 'zoom-in';
      case 'pan': return 'grab';
      case 'move': return 'move';
      case 'eyedropper': return 'crosshair';
      case 'text': return 'text';
      case 'crop': return 'crosshair';
      default: return 'crosshair';
    }
  };

  return (
    <div
      ref={containerRef}
      className="win-canvas-viewport"
      style={{
        flex: 1,
        backgroundColor: '#808080',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
      }}
      onContextMenu={(e) => e.preventDefault()}
      onPointerLeave={() => onUpdateCursor(null)}
    >
      {/* Canvas Frame */}
      <div
        className="win-bevel-sunken"
        style={{
          width: doc.width * settings.zoom,
          height: doc.height * settings.zoom,
          position: 'relative',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        {/* Layer 0: Checkerboard Backdrop */}
        <div
          className="canvas-checkerboard"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
          }}
        />

        {/* Layer 1: Composite Display Canvas */}
        <canvas
          ref={compositeCanvasRef}
          width={doc.width}
          height={doc.height}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
          }}
        />

        {/* Layer 2: Transient Tool Preview Canvas */}
        <canvas
          ref={previewCanvasRef}
          width={doc.width}
          height={doc.height}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            pointerEvents: 'none',
          }}
        />

        {/* Layer 3: Marching Ants Selection Overlay */}
        <canvas
          ref={selectionCanvasRef}
          width={doc.width}
          height={doc.height}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            pointerEvents: 'none',
          }}
        />

        {/* Layer 4: Pixel Grid Overlay */}
        <canvas
          ref={gridCanvasRef}
          width={doc.width}
          height={doc.height}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            pointerEvents: 'none',
          }}
        />

        {/* Transparent Interactive Event Capture Surface */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            cursor: getCursor(),
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        {/* Layer 5: On-Canvas Text Boxes Overlays */}
        {(doc.textBoxes || []).map((tb) => {
          const isSelected = tb.id === selectedTextBoxId;
          const isEditing = isSelected && isEditingText;

          if (isEditing) {
            return (
              <div
                key={tb.id}
                style={{
                  position: 'absolute',
                  left: tb.x * settings.zoom,
                  top: tb.y * settings.zoom,
                  width: Math.max(20, tb.width * settings.zoom),
                  height: Math.max(20, tb.height * settings.zoom),
                  zIndex: 30,
                  boxSizing: 'border-box',
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <textarea
                  ref={textareaRef}
                  value={tb.text}
                  placeholder="Type text..."
                  onChange={(e) => {
                    const newText = e.target.value;
                    const updatedBoxes = (doc.textBoxes || []).map((b) =>
                      b.id === tb.id ? { ...b, text: newText } : b
                    );
                    onUpdateDoc({ ...doc, textBoxes: updatedBoxes });
                  }}
                  onBlur={() => {
                    commitActiveText();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      commitActiveText();
                    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      commitActiveText();
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                    resize: 'none',
                    outline: 'none',
                    border: '1px dashed #000080',
                    backgroundColor: 'rgba(255, 255, 255, 0.45)',
                    color: tb.color || '#000000',
                    fontFamily: tb.fontFamily || 'Tahoma, sans-serif',
                    fontSize: `${tb.fontSize * settings.zoom}px`,
                    fontWeight: tb.fontBold ? 'bold' : 'normal',
                    fontStyle: tb.fontItalic ? 'italic' : 'normal',
                    textDecoration: tb.fontUnderline ? 'underline' : 'none',
                    textAlign: tb.textAlign || 'left',
                    lineHeight: 1.25,
                    padding: 0,
                    margin: 0,
                    overflow: 'hidden',
                    cursor: 'text',
                  }}
                />
              </div>
            );
          }

          if (isSelected) {
            return (
              <div
                key={tb.id}
                style={{
                  position: 'absolute',
                  left: tb.x * settings.zoom,
                  top: tb.y * settings.zoom,
                  width: Math.max(20, tb.width * settings.zoom),
                  height: Math.max(20, tb.height * settings.zoom),
                  zIndex: 25,
                  boxSizing: 'border-box',
                  border: '1px dashed #000000',
                  cursor: 'move',
                  userSelect: 'none',
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsEditingText(true);
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  dragTextBoxRef.current = {
                    mode: 'move',
                    startClientX: e.clientX,
                    startClientY: e.clientY,
                    initialX: tb.x,
                    initialY: tb.y,
                    initialWidth: tb.width,
                    initialHeight: tb.height,
                    boxId: tb.id,
                  };
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {/* 8 Retro Win95 Square Resize Handles */}
                {[
                  { h: 'nw', top: -3, left: -3, cursor: 'nwse-resize' },
                  { h: 'n', top: -3, left: 'calc(50% - 3px)', cursor: 'ns-resize' },
                  { h: 'ne', top: -3, right: -3, cursor: 'nesw-resize' },
                  { h: 'e', top: 'calc(50% - 3px)', right: -3, cursor: 'ew-resize' },
                  { h: 'se', bottom: -3, right: -3, cursor: 'nwse-resize' },
                  { h: 's', bottom: -3, left: 'calc(50% - 3px)', cursor: 'ns-resize' },
                  { h: 'sw', bottom: -3, left: -3, cursor: 'nesw-resize' },
                  { h: 'w', top: 'calc(50% - 3px)', left: -3, cursor: 'ew-resize' },
                ].map((pos) => (
                  <div
                    key={pos.h}
                    style={{
                      position: 'absolute',
                      width: 6,
                      height: 6,
                      backgroundColor: '#ffffff',
                      border: '1px solid #000000',
                      cursor: pos.cursor,
                      top: pos.top,
                      left: pos.left,
                      right: pos.right,
                      bottom: pos.bottom,
                      boxSizing: 'border-box',
                      zIndex: 30,
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      dragTextBoxRef.current = {
                        mode: 'resize',
                        handle: pos.h,
                        startClientX: e.clientX,
                        startClientY: e.clientY,
                        initialX: tb.x,
                        initialY: tb.y,
                        initialWidth: tb.width,
                        initialHeight: tb.height,
                        boxId: tb.id,
                      };
                      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                    }}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  />
                ))}
              </div>
            );
          }

          // Unselected text box interactive hit-area (when using text or move tool)
          return (
            <div
              key={tb.id}
              style={{
                position: 'absolute',
                left: tb.x * settings.zoom,
                top: tb.y * settings.zoom,
                width: Math.max(20, tb.width * settings.zoom),
                height: Math.max(20, tb.height * settings.zoom),
                zIndex: 15,
                cursor:
                  settings.currentTool === 'text'
                    ? 'text'
                    : settings.currentTool === 'move'
                    ? 'move'
                    : 'default',
                pointerEvents:
                  settings.currentTool === 'text' || settings.currentTool === 'move'
                    ? 'auto'
                    : 'none',
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onSelectTextBox?.(tb.id);
                setIsEditingText(true);
              }}
              onPointerDown={(e) => {
                if (settings.currentTool === 'text' || settings.currentTool === 'move') {
                  e.stopPropagation();
                  onSelectTextBox?.(tb.id);
                  setIsEditingText(false);
                  dragTextBoxRef.current = {
                    mode: 'move',
                    startClientX: e.clientX,
                    startClientY: e.clientY,
                    initialX: tb.x,
                    initialY: tb.y,
                    initialWidth: tb.width,
                    initialHeight: tb.height,
                    boxId: tb.id,
                  };
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                }
              }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            />
          );
        })}
      </div>
    </div>
  );
};

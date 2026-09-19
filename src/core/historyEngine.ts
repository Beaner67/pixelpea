import { DocumentState, HistoryEntry, HistoryLayerSnapshot, Layer, TextBox } from './types';
import { createLayer } from './layerEngine';

const MAX_HISTORY_STEPS = 30;

export function captureHistorySnapshot(
  description: string,
  doc: DocumentState
): HistoryEntry {
  const layerSnapshots: HistoryLayerSnapshot[] = doc.layers.map((l) => ({
    id: l.id,
    name: l.name,
    visible: l.visible,
    locked: l.locked,
    opacity: l.opacity,
    blendMode: l.blendMode,
    imageData: l.ctx.getImageData(0, 0, doc.width, doc.height),
  }));

  return {
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    description,
    timestamp: Date.now(),
    width: doc.width,
    height: doc.height,
    activeLayerId: doc.activeLayerId,
    layers: layerSnapshots,
    textBoxes: doc.textBoxes ? JSON.parse(JSON.stringify(doc.textBoxes)) : [],
  };
}

export function restoreFromSnapshot(entry: HistoryEntry): {
  layers: Layer[];
  activeLayerId: string;
  width: number;
  height: number;
  textBoxes: TextBox[];
} {
  const restoredLayers: Layer[] = entry.layers.map((snap) => {
    const layer = createLayer(entry.width, entry.height, snap.name);
    layer.id = snap.id;
    layer.visible = snap.visible;
    layer.locked = snap.locked;
    layer.opacity = snap.opacity;
    layer.blendMode = snap.blendMode;
    layer.ctx.putImageData(snap.imageData, 0, 0);
    return layer;
  });

  return {
    layers: restoredLayers,
    activeLayerId: entry.activeLayerId,
    width: entry.width,
    height: entry.height,
    textBoxes: entry.textBoxes ? JSON.parse(JSON.stringify(entry.textBoxes)) : [],
  };
}

export class HistoryManager {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];

  constructor() {}

  public pushState(entry: HistoryEntry): void {
    this.undoStack.push(entry);
    if (this.undoStack.length > MAX_HISTORY_STEPS) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo stack on new action
  }

  public canUndo(): boolean {
    return this.undoStack.length > 1; // Keep at least the initial state
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public undo(): HistoryEntry | null {
    if (!this.canUndo()) return null;
    const current = this.undoStack.pop()!;
    this.redoStack.push(current);
    return this.undoStack[this.undoStack.length - 1];
  }

  public redo(): HistoryEntry | null {
    if (!this.canRedo()) return null;
    const next = this.redoStack.pop()!;
    this.undoStack.push(next);
    return next;
  }

  public getUndoStack(): HistoryEntry[] {
    return [...this.undoStack];
  }

  public jumpTo(index: number): HistoryEntry | null {
    if (index < 0 || index >= this.undoStack.length) return null;
    const target = this.undoStack[index];
    const removed = this.undoStack.splice(index + 1);
    this.redoStack.unshift(...removed);
    return target;
  }
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0.0 to 1.0
  blendMode: GlobalCompositeOperation;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export interface SelectionBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TextBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontBold: boolean;
  fontItalic: boolean;
  fontUnderline: boolean;
  textAlign: 'left' | 'center' | 'right';
  color: string;
}

export interface DocumentState {
  id: string;
  title: string;
  width: number;
  height: number;
  layers: Layer[];
  activeLayerId: string;
  selectionMask: ImageData | null; // Alpha channel represents selection
  selectionBounds: SelectionBounds | null;
  textBoxes?: TextBox[];
}

export type ToolType =
  | 'select-rect'
  | 'select-ellipse'
  | 'select-lasso'
  | 'select-poly-lasso'
  | 'select-wand'
  | 'move'
  | 'crop'
  | 'pencil'
  | 'brush'
  | 'eraser'
  | 'bucket'
  | 'gradient'
  | 'eyedropper'
  | 'clone-stamp'
  | 'healing-brush'
  | 'smudge'
  | 'blur-sharpen'
  | 'dodge-burn'
  | 'text'
  | 'line'
  | 'curve'
  | 'rectangle'
  | 'ellipse'
  | 'round-rect'
  | 'polygon'
  | 'zoom'
  | 'pan';

export interface ToolSettings {
  currentTool: ToolType;
  primaryColor: string; // Foreground color hex (e.g. #000000)
  secondaryColor: string; // Background color hex (e.g. #ffffff)
  brushSize: number;
  brushHardness: number; // 0.0 to 1.0
  eraserSize: number;
  opacity: number; // 0.0 to 1.0 — tool opacity for brush/dodge/smudge
  shapeFillMode: 'outline' | 'fill' | 'both';
  tolerance: number; // 0 to 255 for wand / bucket
  contiguous: boolean;
  fontFamily: string;
  fontSize: number;
  fontBold: boolean;
  fontItalic: boolean;
  fontUnderline: boolean;
  textAlign: 'left' | 'center' | 'right';
  gradientType: 'linear' | 'radial';
  dodgeBurnMode: 'dodge' | 'burn';
  blurSharpenMode: 'blur' | 'sharpen';
  polygonSides: number; // 3 to 12
  zoom: number; // e.g. 1, 2, 4, 0.5
}

export interface HistoryLayerSnapshot {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  imageData: ImageData;
}

export interface HistoryEntry {
  id: string;
  description: string;
  timestamp: number;
  width: number;
  height: number;
  activeLayerId: string;
  layers: HistoryLayerSnapshot[];
  textBoxes?: TextBox[];
}

export type FilterType =
  | 'brightness-contrast'
  | 'hue-saturation'
  | 'invert'
  | 'grayscale'
  | 'blur'
  | 'sharpen'
  | 'noise'
  | 'pixelate';

export interface FilterParams {
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  hue?: number; // -180 to 180
  saturation?: number; // -100 to 100
  lightness?: number; // -100 to 100
  radius?: number; // 1 to 20
  amount?: number; // 1 to 100
  blockSize?: number; // 2 to 32
}

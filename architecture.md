# OG Photo — Technical Architecture Document

## 1. System Overview
**OG Photo** is built as a high-performance, purely client-side Single Page Application (SPA) leveraging **TypeScript**, **React**, and the **HTML5 Canvas 2D / TypedArray API**. 

The architecture cleanly decouples the **Retro UI Presentation Layer** (authentic Windows 95/98 windowing, menus, dialogs, beveled styling) from the **Core Raster Graphics Engine** (multi-layer compositing, pixel manipulation algorithms, selection mask engine, and undo/redo history).

```
+-------------------------------------------------------------------------+
|                        Windows 95/98 UI Layer                           |
|  [Title Bar]  [Menu Bar]  [Toolbox]  [Color Swatches]  [Status Bar]     |
|  [Floating Panels: Layers, History]  [Retro Dialogs: New, Save, Filter] |
+-------------------------------------------------------------------------+
                                    |
                            (State & Events)
                                    v
+-------------------------------------------------------------------------+
|                      Editor Controller & State                          |
|  - Document Store (Width, Height, Layers Stack, Active Layer)           |
|  - Tool Manager (Tool config, Color state, Active operation)            |
|  - History Engine (Snapshot-based Undo/Redo stack)                      |
|  - Selection Engine (Mask buffer, Marquee geometry, Marching ants)      |
+-------------------------------------------------------------------------+
                                    |
                            (Raster Operations)
                                    v
+-------------------------------------------------------------------------+
|                     Raster Rendering & Processing                       |
|  +--------------------+  +--------------------+  +--------------------+ |
|  | Layer Compositor   |  | Pixel Manipulator  |  | Filter Engine      | |
|  | (Blend modes,      |  | (Flood fill, Brush,|  | (Convolution, HSL, | |
|  |  Opacity, Alpha)   |  |  Pencil, Shapes)   |  |  Sharpen, Blur)    | |
|  +--------------------+  +--------------------+  +--------------------+ |
|                                   |                                     |
|                                   v                                     |
|  +--------------------------------------------------------------------+ |
|  | Multi-Layer Canvas Stack (Display, Preview Overlay, Marching Ants) | |
|  +--------------------------------------------------------------------+ |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                      File I/O & Encoding Subsystem                      |
|  - Decoders: PNG, JPEG, WebP, BMP, PSD (ag-psd)                         |
|  - Encoders: PNG (Lossless Alpha), JPEG, WebP, Binary BMP (24-bit)      |
+-------------------------------------------------------------------------+
```

---

## 2. Data Models & State Architecture

### 2.1 Layer Model
Each layer is represented as an independent off-screen canvas to allow hardware-accelerated composition and non-destructive editing:

```typescript
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0.0 to 1.0
  blendMode: GlobalCompositeOperation; // 'source-over', 'multiply', 'screen', 'overlay', etc.
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}
```

### 2.2 Document State
```typescript
export interface DocumentState {
  id: string;
  title: string;
  width: number;
  height: number;
  layers: Layer[];
  activeLayerId: string;
  selectionMask: ImageData | null; // null = no active selection
  selectionBounds: { x: number; y: number; w: number; h: number } | null;
}
```

### 2.3 Tool State & Options
```typescript
export type ToolType =
  | 'select-rect'
  | 'select-ellipse'
  | 'select-lasso'
  | 'select-wand'
  | 'move'
  | 'pencil'
  | 'brush'
  | 'eraser'
  | 'bucket'
  | 'gradient'
  | 'eyedropper'
  | 'clone-stamp'
  | 'text'
  | 'line'
  | 'curve'
  | 'rectangle'
  | 'ellipse'
  | 'round-rect'
  | 'zoom'
  | 'pan';

export interface ToolSettings {
  currentTool: ToolType;
  primaryColor: string; // Foreground color (hex / rgb)
  secondaryColor: string; // Background color (hex / rgb)
  brushSize: number;
  brushHardness: number; // 0.0 (soft) to 1.0 (hard)
  shapeFillMode: 'outline' | 'fill' | 'both';
  tolerance: number; // For magic wand & bucket (0 - 255)
  contiguous: boolean;
  fontFamily: string;
  fontSize: number;
  fontBold: boolean;
  fontItalic: boolean;
}
```

### 2.4 History Engine
To guarantee performance and memory efficiency:
- History snapshots store compressed `ImageData` or diffs of affected layers along with document metadata.
- Maximum history depth defaults to 30 states.
- Every mutating tool action (brush stroke end, filter execution, bucket fill, layer reorder) pushes an entry onto `undoStack` and empties `redoStack`.

---

## 3. Canvas Compositing & Rendering Pipeline

### 3.1 Stacked Canvases Strategy
The viewport displays multiple stacked canvas layers for silky smooth 60fps interaction:

1. **Checkerboard / Backdrop Canvas**: Renders the classic transparency checkerboard pattern (`#ffffff` and `#cccccc` 8x8 tiles) sized to the document boundaries.
2. **Composite Display Canvas**:
   - Cleared and redrawn when layers or layer properties change.
   - Iterates through `layers` from bottom to top:
     ```typescript
     ctx.globalAlpha = layer.opacity;
     ctx.globalCompositeOperation = layer.blendMode;
     ctx.drawImage(layer.canvas, 0, 0);
     ```
3. **Transient Tool Preview Overlay Canvas**:
   - Sits directly on top of the composite canvas.
   - During tool interactions (dragging a brush stroke, rubber-banding a rectangle/ellipse, moving a selection boundary, drawing a line), preview rendering occurs solely on this overlay canvas.
   - On `pointerup`, the finished stroke/shape is committed into the active layer's off-screen canvas, and the preview canvas is cleared.
4. **Marching Ants Selection Canvas**:
   - If a selection is active, this top canvas renders the animated marching ants border with `setLineDash([4, 4])` and an animated `lineDashOffset` incremented via `requestAnimationFrame`.

---

## 4. Key Raster Algorithms

### 4.1 Aliased Pencil & Anti-Aliased Brush
- **Pencil**: Uses standard Bresenham's line algorithm between mouse move events with `imageSmoothingEnabled = false` for 1px pixel-perfect retro precision.
- **Brush**: Interpolates smooth distance-spaced stamp circles between pointer positions with configurable radius and softness.

### 4.2 Fast Scanline Flood Fill (Bucket Tool)
- Operates directly on the 32-bit representation of `ImageData` (`Uint32Array(imageData.data.buffer)`).
- Breadth-first / scanline queue checks pixel color match within Euclidean tolerance against the target seed pixel.
- Respects active selection mask boundaries.

### 4.3 Magic Wand Selection
- Uses flood-fill exploration on the merged canvas or active layer to generate an 8-bit alpha mask (`Uint8ClampedArray`), where selected pixels have alpha 255 and unselected have alpha 0.

### 4.4 Clone Stamp Tool
- `Alt + Click` records the source anchor point `(srcX, srcY)` and layer ID.
- Subsequent drag paints cloned pixels offset by `(destX - startDestX, destY - startDestY)`.

### 4.5 Convolution & Color Filters
- **Brightness / Contrast**: Single-pass pixel loop:
  $$P' = \text{clamp}\left(((P - 128) \times \text{contrast} + 128) + \text{brightness}\right)$$
- **Hue / Saturation**: Fast RGB $\to$ HSL $\to$ RGB conversion.
- **Sharpen & Gaussian Blur**: 3x3 or 5x5 spatial convolution kernels operating on clamped pixel matrices.
- **Retro Pixelate / Mosaic**: Downsampling and nearest-neighbor blitting by block sizes (4px, 8px, 16px).

---

## 5. File I/O & Retro Encoders

1. **Standard Formats (PNG, JPEG, WebP)**:
   - Uses `HTMLCanvasElement.toBlob()` / `HTMLCanvasElement.toDataURL()` with appropriate MIME types and quality parameters.
2. **Binary BMP Encoder (24-bit uncompressed Windows Bitmap)**:
   - Implements authentic BMP structure in pure JavaScript via `ArrayBuffer` and `DataView`:
     - BITMAPFILEHEADER (14 bytes): `BM` magic number, total file size, reserved bytes, offset to pixel array (54 bytes).
     - BITMAPINFOHEADER (40 bytes): Header size (40), width, height, color planes (1), bits per pixel (24), compression (0 = BI_RGB), image size, resolution.
     - Pixel Array: BGR order with 4-byte row padding.
3. **PSD Format**:
   - Integrates `ag-psd` library for reading Adobe Photoshop files into layer stacks and writing multi-layer PSD exports.

---

## 6. Retro UI & Component Architecture

### 6.1 Authentic Windows 95/98 CSS System
The CSS styling is built on a modular design system emulating classic Windows 95/98 GUI elements:
- `.win98-window`: Raised window container with outer black/white and inner gray bevels.
- `.win98-titlebar`: Active navy gradient (`#000080` to `#1084d0`), white bold text, and 16x16 icon.
- `.win98-titlebar-btn`: 16x14 bevel button with `_`, `□`, and `✕`.
- `.win98-menu-bar` & `.win98-menu-dropdown`: Flat `#c0c0c0` background, 2px raised borders, keyboard shortcut alignment, navy highlight.
- `.win98-btn`: Outset button that shifts content 1px down and right when depressed (`:active` or active tool state).
- `.win98-inset`: Inset 2px border for status bar, tool option wells, and canvas viewport.
- `.win98-floating-panel`: Mini titlebar window (`18px` height) with close button and draggable header.

### 6.2 Component Hierarchy
```
<App>
  <DesktopBackdrop>              {/* Teal #008080 background */}
    <MainWindow>                 {/* Main Win98 Window */}
      <TitleBar />               {/* Title, icon, minimize/maximize/close */}
      <MenuBar />                {/* File, Edit, View, Image, Layers, Filters, Help */}
      <WorkspaceBody>
        <ToolPalette />          {/* 2-col tool buttons + tool options well */}
        <ViewportArea>           {/* Scrollable canvas viewport */}
          <CanvasViewport />     {/* Stacked canvases, rulers, zoom */}
        </ViewportArea>
        <FloatingPanels>
          <LayersPanel />        {/* Layer list, opacity, blend mode, add/delete */}
          <HistoryPanel />       {/* Action history list */}
        </FloatingPanels>
      </WorkspaceBody>
      <ColorPaletteStrip />      {/* 28 classic colors + FG/BG swatches */}
      <StatusBar />              {/* 3 inset status compartments */}
    </MainWindow>
    <DialogManager />            {/* Modal dialogs: New, Save, Filters, Resize */}
  </DesktopBackdrop>
</App>
```

---

## 7. Verification & Quality Assurance Strategy
- **Unit & Integration Verification**:
  - Test Canvas layer compositing across multiple blend modes (`multiply`, `screen`, `overlay`).
  - Test Flood Fill algorithm correctness on edge cases and boundaries.
  - Test BMP binary encoding round-trip.
  - Test History engine undo/redo integrity.
- **End-to-End Browser Testing**:
  - Playwright browser automation tests validating UI clicks, tool activation, drawing on canvas, layer addition, and filter application.

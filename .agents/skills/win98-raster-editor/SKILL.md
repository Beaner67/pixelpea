---
name: win98-raster-editor
description: Expert guidelines and domain patterns for building a high-fidelity Windows 95/98 themed raster image editor (OG Photo) with multi-layer canvas, pixel-accurate retro UI, and raster manipulation tools.
---

# Windows 95/98 Raster Image Editor (OG Photo) Skill

## 1. Visual Authenticity Principles (Windows 95/98 / mspaint.exe)
- **Palette**: Classic Windows 3D face `#c0c0c0`, light highlight `#ffffff`, dark shadow `#808080`, deep shadow `#000000`, active title bar gradient `linear-gradient(90deg, #000080, #1084d0)`.
- **Borders & Bevels**:
  - Outset / Raised (buttons, menus, panels): Top/Left 1px `#ffffff` (outer) and `#dfdfdf` (inner), Bottom/Right 1px `#000000` (outer) and `#808080` (inner).
  - Inset / Sunken (canvas viewport, status bar segments, depressed buttons): Top/Left `#808080` / `#000000`, Bottom/Right `#ffffff`.
- **Typography**: Authentic MS Sans Serif / Tahoma 11px/12px bitmap style (`-webkit-font-smoothing: none; font-smooth: never; image-rendering: pixelated; font-family: "MS Sans Serif", Tahoma, "Segoe UI", sans-serif`).
- **Classic Win98 Window Controls**: Minimize (`_`), Maximize (`□`), Close (`✕`) buttons with 2px beveled borders and centered glyphs.
- **Classic Paint Layout**:
  - Title Bar with icon, title, and window actions
  - Menu Bar (File, Edit, Image, Colors, Layers, Filters, View, Help)
  - Left Tool Palette (2 columns of tools + sub-options panel underneath)
  - Center Canvas Viewport with gray desktop backdrop and scrollbars
  - Bottom Color Palette (28 classic colors + foreground/background indicator box)
  - Bottom Status Bar (3 beveled boxes: help tooltip, cursor coordinates `X, Y`, canvas dimensions `W x H`)
  - Floating Tool Windows (Layers, History, Adjustments) with classic mini titlebars

## 2. Raster Engine & Layer Pipeline
- **Canvas Multi-Layer Architecture**:
  - Each layer maintains its own `HTMLCanvasElement` and `CanvasRenderingContext2D` at full canvas resolution.
  - Layer properties: `id`, `name`, `visible` (boolean), `opacity` (0..1), `blendMode` (`source-over`, `multiply`, `screen`, `overlay`, `darken`, `lighten`, etc.), `locked` (boolean).
  - Main display canvas renders layers from bottom to top with their respective blend modes and opacity.
  - Active tool preview is rendered on a separate transient overlay canvas, avoiding continuous layer re-allocations.
- **Selection & Marching Ants**:
  - Selection mask is a 1-bit or 8-bit alpha mask canvas of size `(width, height)`.
  - Marching ants boundary is computed via boundary edge extraction and rendered with `setLineDash([4, 4])` and animated `lineDashOffset`.
  - Operations (Draw, Erase, Fill, Filter, Transform) respect the selection mask via clipping or pixel-wise mask testing.
- **Raster Tools**:
  - Pencil: 1px aliased Bresenham line algorithm or `ctx.imageSmoothingEnabled = false`.
  - Brush: Round/square tip with size control, drawing continuous interpolated points.
  - Eraser: Replaces pixels with transparency on transparent layers or background color on background layers.
  - Paint Bucket (Flood Fill): Fast BFS/DFS queue scanline flood fill with RGB tolerance testing against raw `ImageData.data`.
  - Eyedropper: Direct pixel color sampling from composite canvas or active layer.
  - Clone Stamp: Sample origin point via Alt+Click, offset reproduction onto target canvas.
  - Text: Classic rasterized font rendering with configurable family, size, bold, italic.
  - Shape tools (Line, Rectangle, Ellipse, Rounded Rect): Three classic modes (Stroke only, Stroke + Fill, Fill only).
- **History & Undo/Redo**:
  - Action-based / Tile or Snapshot based `ImageData` stack.
  - Maximum history limit (e.g. 30 states) for memory safety.
- **Filters & Processing**:
  - Pure JavaScript / WebGL pixel shader transformations: Brightness/Contrast, Hue/Saturation/Lightness, Invert, Grayscale, Gaussian/Box Blur, Sharpen, Noise, Pixelate/Mosaic.

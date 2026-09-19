# OG Photo — Product Requirements Document (PRD)

## 1. Product Overview
**OG Photo** is a powerful, web-based raster graphics editor that combines the modern editing capabilities of tools like Photopea (multi-layer composition, blend modes, non-destructive selection masks, advanced filters, flood fill, clone stamping, history states) with the unmistakable, pixel-accurate aesthetic of classic Windows 95/98 **Paint (mspaint.exe)**.

OG Photo runs 100% client-side in modern web browsers with zero installation, zero server requirements, and zero sign-ups required.

---

## 2. Core Themes & Design Language

### 2.1 Authentic Windows 95/98 Visual Fidelity
- **Color Palette**:
  - Button Face: `#c0c0c0`
  - Button Highlight: `#ffffff`
  - Light Shadow: `#dfdfdf`
  - Medium Shadow: `#808080`
  - Dark Shadow: `#000000`
  - Active Window Titlebar: Classic blue gradient (`linear-gradient(90deg, #000080, #1084d0)`)
  - Inactive Window Titlebar: Dark gray gradient (`linear-gradient(90deg, #808080, #b5b5b5)`)
  - Desktop Background: Classic Windows Teal (`#008080`)
- **Bevels and Borders**:
  - Raised Elements (Buttons, Windows, Dialogs, Menu bars): 2px 3D bevel (White/light top-left, dark/black bottom-right).
  - Sunken Elements (Canvas viewport, Status bar segments, Tool options inset, Active depressed tool buttons): 2px inset bevel (Dark/black top-left, white/light bottom-right).
  - Menus: Flat `#c0c0c0` surface, 1px black outline, 1px raised border, highlighted item in classic navy `#000080` with crisp white text.
- **Typography**:
  - Pixel-rendered MS Sans Serif / Tahoma 11px/12px font styling (`-webkit-font-smoothing: none; font-smooth: never; font-family: "MS Sans Serif", Tahoma, "Segoe UI", sans-serif;`).
- **Icons & Graphics**:
  - Chunky 16x16 pixel-art icons faithfully replicated for classic Paint tools and modern Photopea additions (Pencil, Brush, Eraser, Fill Bucket, Eyedropper, Magnifier, Text, Line, Curve, Rectangle, Ellipse, Rounded Rect, Rect Selection, Lasso, Magic Wand, Clone Stamp, Gradient, Hand/Pan).

---

## 3. Detailed Feature Specifications

### 3.1 Retro Window & Shell Architecture
1. **Title Bar**:
   - Icon: Classic 16x16 Paint palette icon.
   - Title: `[filename] - OG Photo`.
   - Window control buttons: Minimize (`_`), Maximize/Restore (`□`), Close (`✕`) with distinct depressed click states.
2. **Menu Bar**:
   - Menus: `File`, `Edit`, `View`, `Image`, `Layers`, `Filters`, `Colors`, `Help`.
   - Keyboard accelerator shortcuts indicated (Ctrl+N, Ctrl+O, Ctrl+S, Ctrl+Z, Ctrl+Y, Ctrl+A, Ctrl+D, Ctrl+C, Ctrl+V, etc.).
   - Authentic dropdown behavior: opens on click, closes on click outside or escape, submenus, checkmarks for active view toggles.
3. **Left Tool Palette**:
   - 2-column grid of tools with active tool depression state.
   - Dynamic Tool Options sub-panel below the tool buttons (e.g., Brush size/shape picker, Selection mode, Shape fill modes: Outline Only, Outline + Fill, Fill Only).
4. **Bottom Color Palette**:
   - The iconic 28-color Windows Paint palette strip.
   - Left-hand Foreground/Background overlapping swatch box:
     - Left-click on any swatch sets Foreground color.
     - Right-click on any swatch sets Background color.
     - Double-click opens classic Windows-style Color Picker dialog with hex input and custom color selection.
5. **Bottom Status Bar**:
   - Segment 1 (Left, wide): Contextual help / tool tip description (e.g. "For Help, click Help Topics on the Help Menu.").
   - Segment 2 (Center, ~100px): Live cursor coordinates `X, Y px`.
   - Segment 3 (Right, ~120px): Canvas dimensions `W x H px` or selection dimensions during drag.
6. **Floating Windows & Dialogs**:
   - **Layers Window**: Classic Win98 floating tool window with mini title bar, draggable, togglable from `Layers` or `View` menu.
   - **History Window**: Floating undo/redo step list with thumbnail/action description.
   - **Filter Dialogs**: Modal dialogs with sliders, input boxes, "OK" and "Cancel" buttons, and live preview checkmark.

---

### 3.2 Raster Canvas & Layer Pipeline (Photopea-grade)
1. **Multi-Layer Support**:
   - Layer list with thumbnails, layer names, visibility checkboxes (eye icon), lock toggle.
   - Opacity slider (0% - 100%).
   - Layer Blend Modes: `Normal` (source-over), `Multiply`, `Screen`, `Overlay`, `Darken`, `Lighten`, `Color Dodge`, `Color Burn`, `Difference`.
   - Layer operations: New Layer, Duplicate Layer, Delete Layer, Merge Down, Move Layer Up/Down.
2. **Tools Suite**:
   - **Selection**:
     - Rectangular Marquee, Elliptical Marquee, Freehand Lasso, Magic Wand (with tolerance slider and contiguous option).
     - Selection state rendered with animated marching ants line (`dash-offset` animation).
     - Selection commands: Deselect (Ctrl+D), Select All (Ctrl+A), Invert Selection (Ctrl+Shift+I), Delete Selection (Backspace/Del).
   - **Drawing & Painting**:
     - *Pencil*: 1px crisp aliased pixel drawing.
     - *Brush*: Configurable size (1px to 100px), shapes (round, square, calligraphic), softness.
     - *Eraser*: Classic square pixel eraser or soft brush eraser; erases to transparent on alpha layers or background color on locked base.
     - *Paint Bucket*: Scanline flood-fill algorithm with color tolerance support and contiguous boundary fill.
     - *Gradient Tool*: Linear and radial gradient fill within selection or entire layer.
     - *Eyedropper*: Picks exact color from composite canvas or active layer.
     - *Clone Stamp*: Alt+Click sets sampling source point; paint draws cloned pixels with aligned offset.
   - **Vector / Raster Shapes**:
     - Line, Curve, Rectangle, Ellipse, Rounded Rectangle with classic 3 modes (Outline only, Outline + Fill, Fill only).
   - **Text Tool**:
     - Click on canvas to insert editable text layer or rasterized text with font family, size, bold, italic, and color controls.
   - **Navigation & Transform**:
     - Zoom Tool & Pan (Hand tool, Spacebar + Drag, Mouse wheel zoom).
     - Move Tool (V): Moves current layer content or active selection.
     - Canvas Resize / Crop to Selection.
     - Rotate 90° CW, 90° CCW, 180°, Flip Horizontal, Flip Vertical.

---

### 3.3 Filters & Image Adjustments
- **Brightness & Contrast**: Real-time slider adjustments with preview.
- **Hue, Saturation & Lightness**: HSL shifting.
- **Invert**: Inverts RGB channels.
- **Grayscale**: Converts to luminance monochrome.
- **Gaussian Blur / Box Blur**: Configurable radius.
- **Sharpen**: 3x3 convolution kernel sharpening.
- **Noise / Grain**: Add random RGB or monochrome noise.
- **Pixelate / Mosaic**: Classic 90s retro block pixelation effect.

---

### 3.4 File I/O & Format Compatibility
- **New Image Dialog**:
  - Presets (640x480, 800x600, 1024x768, 1920x1080, custom WxH).
  - Background choices (White, Transparent, Current Background Color).
- **Open File**:
  - Supports PNG, JPEG, BMP, GIF, WebP, SVG, and PSD via file picker or drag-and-drop.
- **Save / Export**:
  - Export to PNG (with alpha transparency), JPEG (with quality slider), BMP (authentic 24-bit bitmap format), WebP.
  - Classic "Save As" retro dialog simulation.

---

### 3.5 History Engine (Undo / Redo)
- Full multi-step Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z).
- History panel displays chronological list of actions with current position indicator.
- Fast canvas snapshot management with memory ceiling protection.

---

## 4. Technical Constraints & Targets
- **Zero Server Dependency**: 100% in-browser client execution.
- **Frame Rate**: Smooth 60fps tool rendering and cursor tracking.
- **Initial Load Time**: < 1.5s on standard broadband.
- **Desktop Illusion**: Authentic 90s CRT / Win98 desktop window layout with optional maximize, clean scrollable canvas, and retro UI widgets.

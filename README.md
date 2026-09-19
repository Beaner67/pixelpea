# 🎨 PixelPea (OG Photo)

> **Where 1998 Windows Paint Nostalgia Meets Modern Photopea Power.**  
> *A high-fidelity retro raster graphics editor crafted with authentic Windows 95/98 chrome, multi-layer compositing, and a full desktop-class creative toolset.*

---

## 💾 Overview

**PixelPea** resurrects the unmistakable look, feel, and tactile charm of late-90s desktop software while delivering modern, layer-based raster image editing right in the web browser. 

Whether you're painting pixel art with an authentic 1px pencil, designing vector-precise Bézier curves, blending custom linear/radial gradients, or retouching photos with clone stamps and healing brushes, PixelPea marries retro delight with real creative utility.

---

## ✨ Features & Capabilities

### 🪄 1. Deep Selection Engine
- **Rectangular & Elliptical Marquee** (`M` / `Shift+M`): Precise region selection with animated marching ants.
- **Freehand Lasso & Polygonal Lasso** (`L` / `Shift+L`): Smooth freehand tracing or point-by-point geometric selections.
- **Magic Wand** (`W`): Contiguous color flood selection with adjustable tolerance sliders.
- **Selection Mask Respect**: All painting, erasing, filling, and gradient tools strictly honor active selection boundaries with subpixel masking. Click to cleanly deselect.

### 🖌️ 2. Expressive Painting & Drawing
- **Pencil & Brush** (`N` / `B`): Pixel-crisp strokes or variable-radius soft brushes.
- **Authentic MS Paint Curve Tool**: True 3-stage Bézier curve engine (drag base line, pull first apex, pull second apex for S-curves, with live preview).
- **Shapes & Polygons** (`U`): Rectangle, Rounded Rectangle, Ellipse, Line, and regular N-sided Polygon (3 to 12 sides) with stroke, fill, and outline+fill modes.
- **Paint Bucket Flood Fill** (`G`): Fast scanline flood fill respecting tolerance and layer alpha.

### 🌈 3. Linear & Radial Gradient Engine
- **Linear & Radial Gradients** (`Shift+G`): Interactive drag-vector gradient projection.
- **Alpha Compositing (`source-over`)**: Gracefully blends over existing artwork with controllable opacity without obliterating layers.
- **Selection Clipping**: Confines gradient fills exclusively to selected pixels when a marquee is active.
- **Zero-Drop Protection**: Fallback handling for single-click taps and micro-drags ensures gradients always render cleanly.

### 🩹 4. Retouching & Effects Suite
- **Clone Stamp** (`S`): `Alt+Click` to sample canvas texture, drag to duplicate and stamp anywhere.
- **Healing Brush** (`J`): Samples surrounding context to seamlessly blend imperfections away.
- **Smudge Tool**: Realistic pixel-drag diffusion along mouse drag trajectories.
- **Dodge & Burn** (`O`): Selectively lighten or darken exposure with customizable brush diameters.
- **Blur & Sharpen**: Localized 3×3 convolution filters for precision edge soft/crisp adjustments.

### 📝 5. Authentic On-Canvas Retro Text Tool (`T`)
- **Direct On-Canvas Editing**: Click anywhere on the canvas to pop up an in-place retro text box—zero disruptive browser `prompt()` popups.
- **Movable & Resizable**: Classic dashed border with 8 Win95 square drag handles to reposition or stretch text.
- **Retro Typography Bar**: Choose from vintage fonts (*Tahoma, MS Sans Serif, Comic Sans MS, Courier New, Times New Roman, Impact, Trebuchet MS, Arial, Georgia, Lucida Console*), font sizing, Bold/Italic/Underline styling, and alignment.
- **Non-Destructive**: Double-click anytime to re-edit committed text boxes.

### 📑 6. Multi-Layer Architecture & History
- **Unlimited Layer Stack**: Add, duplicate, merge down, reorder, toggle visibility, and adjust opacity and blend modes per layer.
- **30-Step Non-Linear Undo/Redo**: Jump to any past snapshot instantly via the retro floating History panel.
- **Canvas Viewport Controls**: Magnifier (`Z`) with pixel grid zoom view, and Hand/Pan tool (`H`) for panning across oversized canvases.
- **Export Formats**: Save and export artwork to **PNG**, **BMP**, **JPEG**, **WebP**, and Photoshop **PSD**.

---

## 🕹️ Controls & Keyboard Shortcuts

| Shortcut | Tool / Action |
| :---: | :--- |
| <kbd>V</kbd> | Move Layer Content |
| <kbd>M</kbd> | Rectangular Select |
| <kbd>Shift</kbd>+<kbd>M</kbd> | Elliptical Select |
| <kbd>L</kbd> | Freehand Lasso |
| <kbd>Shift</kbd>+<kbd>L</kbd> | Polygonal Lasso |
| <kbd>W</kbd> | Magic Wand |
| <kbd>C</kbd> | Crop Tool (<kbd>Enter</kbd> to confirm) |
| <kbd>I</kbd> | Eyedropper Color Picker |
| <kbd>N</kbd> | Pencil |
| <kbd>B</kbd> | Paintbrush |
| <kbd>E</kbd> | Eraser |
| <kbd>S</kbd> | Clone Stamp (`Alt+Click` to set source) |
| <kbd>J</kbd> | Healing Brush |
| <kbd>O</kbd> | Dodge / Burn |
| <kbd>G</kbd> | Paint Bucket |
| <kbd>Shift</kbd>+<kbd>G</kbd> | Gradient Tool (Linear / Radial) |
| <kbd>T</kbd> | Text Tool |
| <kbd>U</kbd> | Line & Shape Tools |
| <kbd>Z</kbd> | Zoom Magnifier |
| <kbd>H</kbd> | Hand / Pan Tool |
| <kbd>Ctrl</kbd>+<kbd>Z</kbd> | Undo |
| <kbd>Ctrl</kbd>+<kbd>Y</kbd> | Redo |
| <kbd>Ctrl</kbd>+<kbd>A</kbd> | Select All |
| <kbd>Ctrl</kbd>+<kbd>D</kbd> | Deselect |

---

## 🚀 Quickstart & Development

### Prerequisites
- Node.js 18+
- npm / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Beaner67/pixelpea.git

# Enter repository directory
cd pixelpea

# Install dependencies
npm install

# Start local dev server with hot reload
npm run dev

# Build production bundle
npm run build
```

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 6](https://vitejs.dev/)
- **Graphics Pipeline**: HTML5 Canvas 2D + Custom Convolution & Scanline Engines
- **PSD Support**: [ag-psd](https://github.com/Ag-Software/ag-psd)
- **Styling**: Authentic Win95/98 CSS Tokens & Bevel Utilities (Pure Vanilla CSS)

---

## 📜 License

MIT License © 2026. Made with nostalgia and pixel precision.

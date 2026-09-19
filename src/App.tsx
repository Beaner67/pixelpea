import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DocumentState, FilterParams, FilterType, Layer, ToolSettings, TextBox } from './core/types';
import { createLayer, cloneLayer, mergeLayerDown, compositeLayers } from './core/layerEngine';
import { HistoryManager, captureHistorySnapshot, restoreFromSnapshot } from './core/historyEngine';
import { selectAllMask, invertSelectionMask } from './core/selectionEngine';
import {
  applyBrightnessContrast,
  applyHueSaturation,
  applyInvert,
  applyGrayscale,
  applyBlur,
  applySharpen,
  applyNoise,
  applyPixelate,
} from './core/filters';
import {
  exportToPNG,
  exportToJPEG,
  exportToBMP,
  exportToWebP,
  downloadBlob,
  loadFile,
} from './core/fileIO';

import { TitleBar } from './components/TitleBar';
import { MenuBar, MenuActionHandlers } from './components/MenuBar';
import { TextOptionsBar } from './components/TextOptionsBar';
import { Toolbox } from './components/Toolbox';
import { ColorPalette } from './components/ColorPalette';
import { StatusBar } from './components/StatusBar';
import { CanvasViewport } from './components/CanvasViewport';
import { FloatingPanel } from './components/FloatingPanel';
import { LayersPanel } from './components/LayersPanel';
import { HistoryPanel } from './components/HistoryPanel';

import { NewDialog } from './components/dialogs/NewDialog';
import { SaveDialog } from './components/dialogs/SaveDialog';
import { FilterDialog } from './components/dialogs/FilterDialog';
import { ResizeDialog } from './components/dialogs/ResizeDialog';
import { ColorDialog } from './components/dialogs/ColorDialog';
import { AboutDialog } from './components/dialogs/AboutDialog';

export const App: React.FC = () => {
  // --- INITIAL DOCUMENT CREATION ---
  const [doc, setDoc] = useState<DocumentState>(() => {
    const width = 800;
    const height = 600;
    const bgLayer = createLayer(width, height, 'Background', '#ffffff');
    return {
      id: 'doc-initial',
      title: 'untitled',
      width,
      height,
      layers: [bgLayer],
      activeLayerId: bgLayer.id,
      selectionMask: null,
      selectionBounds: null,
      textBoxes: [],
    };
  });

  // --- TOOL SETTINGS ---
  const [settings, setSettings] = useState<ToolSettings>({
    currentTool: 'pencil',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    brushSize: 6,
    brushHardness: 1.0,
    eraserSize: 16,
    opacity: 1.0,
    shapeFillMode: 'outline',
    tolerance: 32,
    contiguous: true,
    fontFamily: 'Tahoma, sans-serif',
    fontSize: 16,
    fontBold: false,
    fontItalic: false,
    fontUnderline: false,
    textAlign: 'left',
    gradientType: 'linear',
    dodgeBurnMode: 'dodge',
    blurSharpenMode: 'blur',
    polygonSides: 5,
    zoom: 1,
  });

  // --- TEXT BOX SELECTION ---
  const [selectedTextBoxId, setSelectedTextBoxId] = useState<string | null>(null);
  const activeTextBox = doc.textBoxes?.find((t) => t.id === selectedTextBoxId) || null;

  const handleUpdateActiveTextBox = useCallback(
    (updates: Partial<TextBox>) => {
      if (!selectedTextBoxId) return;
      setDoc((prev) => {
        const nextTextBoxes = prev.textBoxes?.map((t) =>
          t.id === selectedTextBoxId ? { ...t, ...updates } : t
        );
        return { ...prev, textBoxes: nextTextBoxes };
      });
    },
    [selectedTextBoxId]
  );

  // --- UI & WINDOW STATE ---
  const [isMaximized, setIsMaximized] = useState(true);
  const [layersVisible, setLayersVisible] = useState(true);
  const [historyVisible, setHistoryVisible] = useState(true);
  const [gridVisible, setGridVisible] = useState(false);
  const [helpText, setHelpText] = useState('');
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // --- DIALOGS ---
  const [activeDialog, setActiveDialog] = useState<
    'new' | 'save' | 'filter' | 'resize' | 'color' | 'about' | null
  >(null);
  const [currentFilter, setCurrentFilter] = useState<FilterType | null>(null);

  // --- HISTORY ENGINE ---
  const historyRef = useRef<HistoryManager>(new HistoryManager());
  const [historyStack, setHistoryStack] = useState(historyRef.current.getUndoStack());
  const [historyIndex, setHistoryIndex] = useState(0);

  // File input for opening images/PSD
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize history on mount
  useEffect(() => {
    const initialSnapshot = captureHistorySnapshot('New Image', doc);
    historyRef.current.pushState(initialSnapshot);
    setHistoryStack(historyRef.current.getUndoStack());
    setHistoryIndex(0);
  }, []);

  const pushHistory = useCallback(
    (description: string, targetDoc?: DocumentState) => {
      const stateToSnap = targetDoc || doc;
      const snapshot = captureHistorySnapshot(description, stateToSnap);
      historyRef.current.pushState(snapshot);
      const stack = historyRef.current.getUndoStack();
      setHistoryStack(stack);
      setHistoryIndex(stack.length - 1);
    },
    [doc]
  );

  const handleUpdateDoc = useCallback((newDoc: DocumentState, historyDesc?: string) => {
    setDoc(newDoc);
    if (historyDesc) {
      pushHistory(historyDesc, newDoc);
    }
  }, [pushHistory]);

  const handleUpdateSettings = useCallback((updates: Partial<ToolSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // --- UNDO / REDO ---
  const handleUndo = () => {
    const prev = historyRef.current.undo();
    if (prev) {
      const restored = restoreFromSnapshot(prev);
      setDoc((d) => ({
        ...d,
        width: restored.width,
        height: restored.height,
        layers: restored.layers,
        activeLayerId: restored.activeLayerId,
        textBoxes: restored.textBoxes || [],
      }));
      setHistoryIndex(historyRef.current.getUndoStack().indexOf(prev));
    }
  };

  const handleRedo = () => {
    const next = historyRef.current.redo();
    if (next) {
      const restored = restoreFromSnapshot(next);
      setDoc((d) => ({
        ...d,
        width: restored.width,
        height: restored.height,
        layers: restored.layers,
        activeLayerId: restored.activeLayerId,
        textBoxes: restored.textBoxes || [],
      }));
      setHistoryIndex(historyRef.current.getUndoStack().indexOf(next));
    }
  };

  const handleJumpHistory = (idx: number) => {
    const target = historyRef.current.jumpTo(idx);
    if (target) {
      const restored = restoreFromSnapshot(target);
      setDoc((d) => ({
        ...d,
        width: restored.width,
        height: restored.height,
        layers: restored.layers,
        activeLayerId: restored.activeLayerId,
        textBoxes: restored.textBoxes || [],
      }));
      setHistoryStack(historyRef.current.getUndoStack());
      setHistoryIndex(idx);
    }
  };

  // --- FILE ACTIONS ---
  const handleCreateNew = (
    width: number,
    height: number,
    bgType: 'white' | 'transparent' | 'secondary'
  ) => {
    const fillColor =
      bgType === 'white'
        ? '#ffffff'
        : bgType === 'secondary'
        ? settings.secondaryColor
        : undefined;
    const baseLayer = createLayer(width, height, 'Background', fillColor);
    const newDoc: DocumentState = {
      id: `doc-${Date.now()}`,
      title: 'untitled',
      width,
      height,
      layers: [baseLayer],
      activeLayerId: baseLayer.id,
      selectionMask: null,
      selectionBounds: null,
    };
    setDoc(newDoc);
    pushHistory('New Document', newDoc);
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await loadFile(file);
      const newDoc: DocumentState = {
        id: `doc-${Date.now()}`,
        title: result.title,
        width: result.width,
        height: result.height,
        layers: result.layers,
        activeLayerId: result.layers[result.layers.length - 1].id,
        selectionMask: null,
        selectionBounds: null,
      };
      setDoc(newDoc);
      pushHistory(`Open ${result.title}`, newDoc);
    } catch (err) {
      alert(`Could not open file: ${err}`);
    }
    e.target.value = '';
  };

  const getCompositeCanvas = (): HTMLCanvasElement => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = doc.width;
    tempCanvas.height = doc.height;
    const ctx = tempCanvas.getContext('2d')!;
    compositeLayers(doc.layers, ctx, doc.width, doc.height, doc.textBoxes);
    return tempCanvas;
  };

  const handleSaveExport = async (
    filename: string,
    format: 'png' | 'bmp' | 'jpeg' | 'webp',
    quality: number
  ) => {
    const composite = getCompositeCanvas();
    let blob: Blob;

    if (format === 'bmp') {
      blob = exportToBMP(composite);
    } else if (format === 'jpeg') {
      blob = await exportToJPEG(composite, quality);
    } else if (format === 'webp') {
      blob = await exportToWebP(composite, quality);
    } else {
      blob = await exportToPNG(composite);
    }

    downloadBlob(blob, `${filename}.${format === 'jpeg' ? 'jpg' : format}`);
  };

  // --- LAYER OPERATIONS ---
  const handleAddLayer = () => {
    const newL = createLayer(doc.width, doc.height, `Layer ${doc.layers.length + 1}`);
    const updated = {
      ...doc,
      layers: [...doc.layers, newL],
      activeLayerId: newL.id,
    };
    handleUpdateDoc(updated, 'Add Layer');
  };

  const handleDuplicateLayer = (id: string) => {
    const target = doc.layers.find((l) => l.id === id);
    if (!target) return;
    const cloned = cloneLayer(target);
    const idx = doc.layers.indexOf(target);
    const newLayers = [...doc.layers];
    newLayers.splice(idx + 1, 0, cloned);
    const updated = {
      ...doc,
      layers: newLayers,
      activeLayerId: cloned.id,
    };
    handleUpdateDoc(updated, 'Duplicate Layer');
  };

  const handleDeleteLayer = (id: string) => {
    if (doc.layers.length <= 1) return;
    const newLayers = doc.layers.filter((l) => l.id !== id);
    const updated = {
      ...doc,
      layers: newLayers,
      activeLayerId: newLayers[newLayers.length - 1].id,
    };
    handleUpdateDoc(updated, 'Delete Layer');
  };

  const handleMergeDown = (id: string) => {
    const idx = doc.layers.findIndex((l) => l.id === id);
    if (idx <= 0) return;
    const upper = doc.layers[idx];
    const lower = doc.layers[idx - 1];
    const merged = mergeLayerDown(upper, lower, doc.width, doc.height);

    const newLayers = [...doc.layers];
    newLayers.splice(idx - 1, 2, merged);
    const updated = {
      ...doc,
      layers: newLayers,
      activeLayerId: merged.id,
    };
    handleUpdateDoc(updated, 'Merge Layer Down');
  };

  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    const idx = doc.layers.findIndex((l) => l.id === id);
    if (idx < 0) return;
    if (direction === 'up' && idx < doc.layers.length - 1) {
      const newLayers = [...doc.layers];
      const temp = newLayers[idx];
      newLayers[idx] = newLayers[idx + 1];
      newLayers[idx + 1] = temp;
      handleUpdateDoc({ ...doc, layers: newLayers }, 'Reorder Layer');
    } else if (direction === 'down' && idx > 0) {
      const newLayers = [...doc.layers];
      const temp = newLayers[idx];
      newLayers[idx] = newLayers[idx - 1];
      newLayers[idx - 1] = temp;
      handleUpdateDoc({ ...doc, layers: newLayers }, 'Reorder Layer');
    }
  };

  // --- FILTERS ---
  const handleOpenFilter = (type: string) => {
    if (type === 'invert') {
      applyFilterToActiveLayer('invert', {});
    } else if (type === 'grayscale') {
      applyFilterToActiveLayer('grayscale', {});
    } else {
      setCurrentFilter(type as FilterType);
      setActiveDialog('filter');
    }
  };

  const applyFilterToActiveLayer = (type: FilterType, params: FilterParams) => {
    const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId);
    if (!activeLayer) return;

    const imgData = activeLayer.ctx.getImageData(0, 0, doc.width, doc.height);

    switch (type) {
      case 'invert':
        applyInvert(imgData);
        break;
      case 'grayscale':
        applyGrayscale(imgData);
        break;
      case 'brightness-contrast':
        applyBrightnessContrast(imgData, params.brightness, params.contrast);
        break;
      case 'hue-saturation':
        applyHueSaturation(imgData, params.hue, params.saturation, params.lightness);
        break;
      case 'blur':
        applyBlur(imgData, params.radius);
        break;
      case 'sharpen':
        applySharpen(imgData, params.amount);
        break;
      case 'noise':
        applyNoise(imgData, params.amount);
        break;
      case 'pixelate':
        applyPixelate(imgData, params.blockSize);
        break;
    }

    activeLayer.ctx.putImageData(imgData, 0, 0);
    handleUpdateDoc({ ...doc }, type.toUpperCase());
  };

  // --- TRANSFORMATIONS ---
  const handleFlip = (horizontal: boolean) => {
    const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId);
    if (!activeLayer) return;

    const temp = document.createElement('canvas');
    temp.width = doc.width;
    temp.height = doc.height;
    const tCtx = temp.getContext('2d')!;
    tCtx.drawImage(activeLayer.canvas, 0, 0);

    activeLayer.ctx.clearRect(0, 0, doc.width, doc.height);
    activeLayer.ctx.save();
    if (horizontal) {
      activeLayer.ctx.translate(doc.width, 0);
      activeLayer.ctx.scale(-1, 1);
    } else {
      activeLayer.ctx.translate(0, doc.height);
      activeLayer.ctx.scale(1, -1);
    }
    activeLayer.ctx.drawImage(temp, 0, 0);
    activeLayer.ctx.restore();

    handleUpdateDoc({ ...doc }, horizontal ? 'Flip Horizontal' : 'Flip Vertical');
  };

  const handleRotate = (angleDegrees: number) => {
    const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId);
    if (!activeLayer) return;

    const temp = document.createElement('canvas');
    temp.width = doc.width;
    temp.height = doc.height;
    const tCtx = temp.getContext('2d')!;
    tCtx.drawImage(activeLayer.canvas, 0, 0);

    activeLayer.ctx.clearRect(0, 0, doc.width, doc.height);
    activeLayer.ctx.save();
    activeLayer.ctx.translate(doc.width / 2, doc.height / 2);
    activeLayer.ctx.rotate((angleDegrees * Math.PI) / 180);
    activeLayer.ctx.drawImage(temp, -doc.width / 2, -doc.height / 2);
    activeLayer.ctx.restore();

    handleUpdateDoc({ ...doc }, `Rotate ${angleDegrees}°`);
  };

  // --- CROP HANDLER ---
  const handleCrop = (x: number, y: number, w: number, h: number) => {
    if (w <= 0 || h <= 0) return;
    doc.layers.forEach((l) => {
      const temp = document.createElement('canvas');
      temp.width = w;
      temp.height = h;
      const tCtx = temp.getContext('2d')!;
      tCtx.drawImage(l.canvas, -x, -y);
      l.canvas.width = w;
      l.canvas.height = h;
      l.ctx.imageSmoothingEnabled = false;
      l.ctx.drawImage(temp, 0, 0);
    });
    handleUpdateDoc({ ...doc, width: w, height: h, selectionMask: null, selectionBounds: null }, 'Crop');
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) handleRedo();
          else handleUndo();
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          handleRedo();
        } else if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          setActiveDialog('new');
        } else if (e.key.toLowerCase() === 'o') {
          e.preventDefault();
          handleOpenFile();
        } else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          setActiveDialog('save');
        } else if (e.key.toLowerCase() === 'a') {
          e.preventDefault();
          setDoc((d) => ({
            ...d,
            selectionMask: selectAllMask(d.width, d.height),
            selectionBounds: { x: 0, y: 0, w: d.width, h: d.height },
          }));
        } else if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          setDoc((d) => ({ ...d, selectionMask: null, selectionBounds: null }));
        } else if (e.key.toLowerCase() === 'i') {
          e.preventDefault();
          handleOpenFilter('invert');
        } else if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          handleUpdateSettings({ zoom: Math.min(16, settings.zoom * 2) });
        } else if (e.key === '-') {
          e.preventDefault();
          handleUpdateSettings({ zoom: Math.max(0.25, settings.zoom / 2) });
        } else if (e.key === '0') {
          e.preventDefault();
          handleUpdateSettings({ zoom: 1 });
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (doc.selectionBounds) {
          const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId);
          if (activeLayer) {
            activeLayer.ctx.clearRect(
              doc.selectionBounds.x,
              doc.selectionBounds.y,
              doc.selectionBounds.w,
              doc.selectionBounds.h
            );
            handleUpdateDoc({ ...doc }, 'Clear Selection');
          }
        }
      } else {
        // Tool hotkeys (single key, no modifier)
        const toolKeys: Record<string, ToolSettings['currentTool']> = {
          v: 'move', m: 'select-rect', l: 'select-lasso', w: 'select-wand',
          b: 'brush', n: 'pencil', e: 'eraser', g: 'bucket',
          t: 'text', i: 'eyedropper', c: 'crop', z: 'zoom',
          h: 'pan', s: 'clone-stamp', j: 'healing-brush', o: 'dodge-burn',
          u: 'line',
        };
        const key = e.key.toLowerCase();
        if (toolKeys[key]) {
          handleUpdateSettings({ currentTool: toolKeys[key] });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [doc, settings.zoom]);

  // Menu action handlers definition
  const menuHandlers: MenuActionHandlers = {
    onNew: () => setActiveDialog('new'),
    onOpen: handleOpenFile,
    onSave: () => setActiveDialog('save'),
    onSaveAs: () => setActiveDialog('save'),
    onExportPNG: () => handleSaveExport(doc.title, 'png', 1),
    onExportJPEG: () => handleSaveExport(doc.title, 'jpeg', 0.9),
    onExportBMP: () => handleSaveExport(doc.title, 'bmp', 1),
    onExportWebP: () => handleSaveExport(doc.title, 'webp', 0.9),
    onUndo: handleUndo,
    onRedo: handleRedo,
    onCut: () => {},
    onCopy: () => {},
    onPaste: () => {},
    onClearSelection: () => {
      if (doc.selectionBounds) {
        const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId);
        if (activeLayer) {
          activeLayer.ctx.clearRect(
            doc.selectionBounds.x,
            doc.selectionBounds.y,
            doc.selectionBounds.w,
            doc.selectionBounds.h
          );
          handleUpdateDoc({ ...doc }, 'Clear Selection');
        }
      }
    },
    onSelectAll: () =>
      setDoc((d) => ({
        ...d,
        selectionMask: selectAllMask(d.width, d.height),
        selectionBounds: { x: 0, y: 0, w: d.width, h: d.height },
      })),
    onDeselect: () => setDoc((d) => ({ ...d, selectionMask: null, selectionBounds: null })),
    onInvertSelection: () =>
      setDoc((d) => ({
        ...d,
        selectionMask: d.selectionMask ? invertSelectionMask(d.selectionMask) : null,
      })),
    onZoomIn: () => handleUpdateSettings({ zoom: Math.min(16, settings.zoom * 2) }),
    onZoomOut: () => handleUpdateSettings({ zoom: Math.max(0.25, settings.zoom / 2) }),
    onZoom100: () => handleUpdateSettings({ zoom: 1 }),
    onToggleLayersPanel: () => setLayersVisible((v) => !v),
    onToggleHistoryPanel: () => setHistoryVisible((v) => !v),
    onToggleGrid: () => setGridVisible((v) => !v),
    onFlipH: () => handleFlip(true),
    onFlipV: () => handleFlip(false),
    onRotate90CW: () => handleRotate(90),
    onRotate90CCW: () => handleRotate(-90),
    onRotate180: () => handleRotate(180),
    onResizeCanvas: () => setActiveDialog('resize'),
    onClearImage: () => {
      const activeLayer = doc.layers.find((l) => l.id === doc.activeLayerId);
      if (activeLayer) {
        activeLayer.ctx.clearRect(0, 0, doc.width, doc.height);
        handleUpdateDoc({ ...doc }, 'Clear Layer');
      }
    },
    onNewLayer: handleAddLayer,
    onDuplicateLayer: () => doc.activeLayerId && handleDuplicateLayer(doc.activeLayerId),
    onDeleteLayer: () => doc.activeLayerId && handleDeleteLayer(doc.activeLayerId),
    onMergeDown: () => doc.activeLayerId && handleMergeDown(doc.activeLayerId),
    onFilter: handleOpenFilter,
    onOpenColorDialog: () => setActiveDialog('color'),
    onAbout: () => setActiveDialog('about'),
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--win-desktop-teal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Hidden File Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.bmp,.webp,.psd,image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />

      {/* Main Authentic Paint Window */}
      <div
        className="win-window"
        style={{
          width: isMaximized ? '100%' : 980,
          height: isMaximized ? '100%' : 720,
          boxShadow: isMaximized ? 'none' : '4px 4px 16px rgba(0,0,0,0.5)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Title Bar */}
        <TitleBar
          title={doc.title}
          isMaximized={isMaximized}
          onToggleMaximize={() => setIsMaximized((m) => !m)}
          onClose={() => {
            if (confirm('Exit OG Photo? Unsaved changes will be lost.')) {
              window.close();
            }
          }}
        />

        {/* Menu Bar */}
        <MenuBar
          handlers={menuHandlers}
          canUndo={historyRef.current.canUndo()}
          canRedo={historyRef.current.canRedo()}
          hasSelection={!!doc.selectionBounds}
          layersVisible={layersVisible}
          historyVisible={historyVisible}
          gridVisible={gridVisible}
        />

        {/* Text Tool Options Bar */}
        {(settings.currentTool === 'text' || !!selectedTextBoxId) && (
          <TextOptionsBar
            settings={settings}
            activeTextBox={activeTextBox}
            onUpdateSettings={handleUpdateSettings}
            onUpdateActiveTextBox={handleUpdateActiveTextBox}
          />
        )}

        {/* Workspace Central Area */}
        <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
          {/* Left Tool Palette */}
          <Toolbox
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onHoverTool={setHelpText}
          />

          {/* Central Scrollable Canvas Viewport */}
          <CanvasViewport
            doc={doc}
            settings={settings}
            gridVisible={gridVisible}
            onUpdateDoc={handleUpdateDoc}
            onUpdateCursor={setCursorPos}
            onUpdateSettings={handleUpdateSettings}
            onCrop={handleCrop}
            onHelpText={setHelpText}
            selectedTextBoxId={selectedTextBoxId}
            onSelectTextBox={setSelectedTextBoxId}
          />

          {/* Floating Layers Panel */}
          <FloatingPanel
            title="Layers"
            initialX={isMaximized ? window.innerWidth - 240 : 730}
            initialY={35}
            visible={layersVisible}
            onClose={() => setLayersVisible(false)}
          >
            <LayersPanel
              layers={doc.layers}
              activeLayerId={doc.activeLayerId}
              onSelectLayer={(id) => setDoc((d) => ({ ...d, activeLayerId: id }))}
              onToggleVisibility={(id) => {
                const target = doc.layers.find((l) => l.id === id);
                if (target) {
                  target.visible = !target.visible;
                  handleUpdateDoc({ ...doc });
                }
              }}
              onChangeOpacity={(id, op) => {
                const target = doc.layers.find((l) => l.id === id);
                if (target) {
                  target.opacity = op;
                  handleUpdateDoc({ ...doc });
                }
              }}
              onChangeBlendMode={(id, mode) => {
                const target = doc.layers.find((l) => l.id === id);
                if (target) {
                  target.blendMode = mode;
                  handleUpdateDoc({ ...doc });
                }
              }}
              onAddLayer={handleAddLayer}
              onDuplicateLayer={handleDuplicateLayer}
              onDeleteLayer={handleDeleteLayer}
              onMergeDown={handleMergeDown}
              onMoveLayer={handleMoveLayer}
              onRenameLayer={(id, name) => {
                const target = doc.layers.find((l) => l.id === id);
                if (target) {
                  target.name = name;
                  handleUpdateDoc({ ...doc });
                }
              }}
            />
          </FloatingPanel>

          {/* Floating History Panel */}
          <FloatingPanel
            title="History"
            initialX={isMaximized ? window.innerWidth - 430 : 540}
            initialY={35}
            visible={historyVisible}
            onClose={() => setHistoryVisible(false)}
          >
            <HistoryPanel
              historyStack={historyStack}
              currentIndex={historyIndex}
              onJumpTo={handleJumpHistory}
            />
          </FloatingPanel>
        </div>

        {/* Bottom Color Palette Strip */}
        <ColorPalette
          primaryColor={settings.primaryColor}
          secondaryColor={settings.secondaryColor}
          onSelectPrimary={(c) => handleUpdateSettings({ primaryColor: c })}
          onSelectSecondary={(c) => handleUpdateSettings({ secondaryColor: c })}
          onOpenColorDialog={() => setActiveDialog('color')}
        />

        {/* Bottom 3-Segment Status Bar */}
        <StatusBar
          helpText={helpText}
          cursorPos={cursorPos}
          canvasSize={{ width: doc.width, height: doc.height }}
          selectionSize={
            doc.selectionBounds
              ? { width: doc.selectionBounds.w, height: doc.selectionBounds.h }
              : null
          }
        />
      </div>

      {/* --- MODAL DIALOGS --- */}
      <NewDialog
        visible={activeDialog === 'new'}
        onClose={() => setActiveDialog(null)}
        onCreate={handleCreateNew}
      />

      <SaveDialog
        visible={activeDialog === 'save'}
        defaultFilename={doc.title}
        onClose={() => setActiveDialog(null)}
        onSave={handleSaveExport}
      />

      <FilterDialog
        filterType={currentFilter}
        onClose={() => {
          setActiveDialog(null);
          setCurrentFilter(null);
        }}
        onApply={applyFilterToActiveLayer}
      />

      <ResizeDialog
        visible={activeDialog === 'resize'}
        currentWidth={doc.width}
        currentHeight={doc.height}
        onClose={() => setActiveDialog(null)}
        onResize={(newW, newH) => {
          // Resize each layer's canvas
          doc.layers.forEach((l) => {
            const temp = document.createElement('canvas');
            temp.width = l.canvas.width;
            temp.height = l.canvas.height;
            temp.getContext('2d')!.drawImage(l.canvas, 0, 0);

            l.canvas.width = newW;
            l.canvas.height = newH;
            l.ctx.imageSmoothingEnabled = false;
            l.ctx.drawImage(temp, 0, 0);
          });
          handleUpdateDoc({ ...doc, width: newW, height: newH }, 'Resize Canvas');
        }}
      />

      <ColorDialog
        visible={activeDialog === 'color'}
        currentColor={settings.primaryColor}
        onClose={() => setActiveDialog(null)}
        onSelectColor={(c) => handleUpdateSettings({ primaryColor: c })}
      />

      <AboutDialog
        visible={activeDialog === 'about'}
        onClose={() => setActiveDialog(null)}
      />
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';

export interface MenuActionHandlers {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExportPNG: () => void;
  onExportJPEG: () => void;
  onExportBMP: () => void;
  onExportWebP: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onDeselect: () => void;
  onInvertSelection: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoom100: () => void;
  onToggleLayersPanel: () => void;
  onToggleHistoryPanel: () => void;
  onToggleGrid: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onRotate90CW: () => void;
  onRotate90CCW: () => void;
  onRotate180: () => void;
  onResizeCanvas: () => void;
  onClearImage: () => void;
  onNewLayer: () => void;
  onDuplicateLayer: () => void;
  onDeleteLayer: () => void;
  onMergeDown: () => void;
  onFilter: (filterType: string) => void;
  onOpenColorDialog: () => void;
  onAbout: () => void;
}

interface MenuBarProps {
  handlers: MenuActionHandlers;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  layersVisible: boolean;
  historyVisible: boolean;
  gridVisible: boolean;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  handlers,
  canUndo,
  canRedo,
  hasSelection,
  layersVisible,
  historyVisible,
  gridVisible,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuBarRef.current &&
        !menuBarRef.current.contains(e.target as Node)
      ) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTrigger = (menu: string) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  const handleHover = (menu: string) => {
    if (activeMenu !== null) {
      setActiveMenu(menu);
    }
  };

  const runAndClose = (action: () => void) => {
    action();
    setActiveMenu(null);
  };

  return (
    <div className="win-menubar" ref={menuBarRef}>
      {/* FILE MENU */}
      <div className="win-menu-item-wrapper" style={{ position: 'relative' }}>
        <div
          className={`win-menu-trigger ${activeMenu === 'file' ? 'active' : ''}`}
          onClick={() => handleTrigger('file')}
          onMouseEnter={() => handleHover('file')}
        >
          <u>F</u>ile
        </div>
        {activeMenu === 'file' && (
          <div className="win-menu-dropdown">
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onNew)}>
              <span><u>N</u>ew...</span>
              <span className="win-menu-shortcut">Ctrl+N</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onOpen)}>
              <span><u>O</u>pen...</span>
              <span className="win-menu-shortcut">Ctrl+O</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onSave)}>
              <span><u>S</u>ave</span>
              <span className="win-menu-shortcut">Ctrl+S</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onSaveAs)}>
              <span>Save <u>A</u>s...</span>
            </div>
            <div className="win-menu-separator" />
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onExportPNG)}>
              <span>Export as PNG...</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onExportJPEG)}>
              <span>Export as JPEG...</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onExportBMP)}>
              <span>Export as 24-bit BMP...</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onExportWebP)}>
              <span>Export as WebP...</span>
            </div>
            <div className="win-menu-separator" />
            <div className="win-menu-item" onClick={() => runAndClose(() => window.close())}>
              <span>E<u>x</u>it</span>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MENU */}
      <div className="win-menu-item-wrapper" style={{ position: 'relative' }}>
        <div
          className={`win-menu-trigger ${activeMenu === 'edit' ? 'active' : ''}`}
          onClick={() => handleTrigger('edit')}
          onMouseEnter={() => handleHover('edit')}
        >
          <u>E</u>dit
        </div>
        {activeMenu === 'edit' && (
          <div className="win-menu-dropdown">
            <div
              className={`win-menu-item ${!canUndo ? 'disabled' : ''}`}
              onClick={() => canUndo && runAndClose(handlers.onUndo)}
            >
              <span><u>U</u>ndo</span>
              <span className="win-menu-shortcut">Ctrl+Z</span>
            </div>
            <div
              className={`win-menu-item ${!canRedo ? 'disabled' : ''}`}
              onClick={() => canRedo && runAndClose(handlers.onRedo)}
            >
              <span><u>R</u>edo</span>
              <span className="win-menu-shortcut">Ctrl+Y</span>
            </div>
            <div className="win-menu-separator" />
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onCut)}>
              <span>Cu<u>t</u></span>
              <span className="win-menu-shortcut">Ctrl+X</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onCopy)}>
              <span><u>C</u>opy</span>
              <span className="win-menu-shortcut">Ctrl+C</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onPaste)}>
              <span><u>P</u>aste</span>
              <span className="win-menu-shortcut">Ctrl+V</span>
            </div>
            <div
              className={`win-menu-item ${!hasSelection ? 'disabled' : ''}`}
              onClick={() => hasSelection && runAndClose(handlers.onClearSelection)}
            >
              <span>Clear Selection</span>
              <span className="win-menu-shortcut">Del</span>
            </div>
            <div className="win-menu-separator" />
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onSelectAll)}>
              <span>Select <u>A</u>ll</span>
              <span className="win-menu-shortcut">Ctrl+A</span>
            </div>
            <div
              className={`win-menu-item ${!hasSelection ? 'disabled' : ''}`}
              onClick={() => hasSelection && runAndClose(handlers.onDeselect)}
            >
              <span><u>D</u>eselect</span>
              <span className="win-menu-shortcut">Ctrl+D</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onInvertSelection)}>
              <span><u>I</u>nvert Selection</span>
              <span className="win-menu-shortcut">Ctrl+Shift+I</span>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MENU */}
      <div className="win-menu-item-wrapper" style={{ position: 'relative' }}>
        <div
          className={`win-menu-trigger ${activeMenu === 'view' ? 'active' : ''}`}
          onClick={() => handleTrigger('view')}
          onMouseEnter={() => handleHover('view')}
        >
          <u>V</u>iew
        </div>
        {activeMenu === 'view' && (
          <div className="win-menu-dropdown">
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onZoomIn)}>
              <span>Zoom <u>I</u>n</span>
              <span className="win-menu-shortcut">Ctrl++</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onZoomOut)}>
              <span>Zoom <u>O</u>ut</span>
              <span className="win-menu-shortcut">Ctrl+-</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onZoom100)}>
              <span>Actual Size (100%)</span>
              <span className="win-menu-shortcut">Ctrl+0</span>
            </div>
            <div className="win-menu-separator" />
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onToggleLayersPanel)}>
              <span>{layersVisible ? '✓ ' : '  '}<u>L</u>ayers Panel</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onToggleHistoryPanel)}>
              <span>{historyVisible ? '✓ ' : '  '}<u>H</u>istory Panel</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onToggleGrid)}>
              <span>{gridVisible ? '✓ ' : '  '}Pixel <u>G</u>rid</span>
            </div>
          </div>
        )}
      </div>

      {/* IMAGE MENU */}
      <div className="win-menu-item-wrapper" style={{ position: 'relative' }}>
        <div
          className={`win-menu-trigger ${activeMenu === 'image' ? 'active' : ''}`}
          onClick={() => handleTrigger('image')}
          onMouseEnter={() => handleHover('image')}
        >
          <u>I</u>mage
        </div>
        {activeMenu === 'image' && (
          <div className="win-menu-dropdown">
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onFlipH)}>
              <span>Flip <u>H</u>orizontal</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onFlipV)}>
              <span>Flip <u>V</u>ertical</span>
            </div>
            <div className="win-menu-separator" />
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onRotate90CW)}>
              <span>Rotate 90° <u>C</u>W</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onRotate90CCW)}>
              <span>Rotate 90° CC<u>W</u></span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onRotate180)}>
              <span>Rotate 180°</span>
            </div>
            <div className="win-menu-separator" />
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onResizeCanvas)}>
              <span><u>R</u>esize / Canvas Size...</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onClearImage)}>
              <span>Clear Image</span>
            </div>
          </div>
        )}
      </div>

      {/* LAYERS MENU */}
      <div className="win-menu-item-wrapper" style={{ position: 'relative' }}>
        <div
          className={`win-menu-trigger ${activeMenu === 'layers' ? 'active' : ''}`}
          onClick={() => handleTrigger('layers')}
          onMouseEnter={() => handleHover('layers')}
        >
          <u>L</u>ayers
        </div>
        {activeMenu === 'layers' && (
          <div className="win-menu-dropdown">
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onNewLayer)}>
              <span><u>N</u>ew Layer</span>
              <span className="win-menu-shortcut">Ctrl+Shift+N</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onDuplicateLayer)}>
              <span><u>D</u>uplicate Layer</span>
            </div>
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onDeleteLayer)}>
              <span>Delete Layer</span>
            </div>
            <div className="win-menu-separator" />
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onMergeDown)}>
              <span><u>M</u>erge Down</span>
              <span className="win-menu-shortcut">Ctrl+E</span>
            </div>
          </div>
        )}
      </div>

      {/* FILTERS MENU */}
      <div className="win-menu-item-wrapper" style={{ position: 'relative' }}>
        <div
          className={`win-menu-trigger ${activeMenu === 'filters' ? 'active' : ''}`}
          onClick={() => handleTrigger('filters')}
          onMouseEnter={() => handleHover('filters')}
        >
          F<u>i</u>lters
        </div>
        {activeMenu === 'filters' && (
          <div className="win-menu-dropdown">
            <div
              className="win-menu-item"
              onClick={() => runAndClose(() => handlers.onFilter('brightness-contrast'))}
            >
              <span><u>B</u>rightness / Contrast...</span>
            </div>
            <div
              className="win-menu-item"
              onClick={() => runAndClose(() => handlers.onFilter('hue-saturation'))}
            >
              <span><u>H</u>ue / Saturation...</span>
            </div>
            <div className="win-menu-separator" />
            <div
              className="win-menu-item"
              onClick={() => runAndClose(() => handlers.onFilter('invert'))}
            >
              <span><u>I</u>nvert Colors</span>
              <span className="win-menu-shortcut">Ctrl+I</span>
            </div>
            <div
              className="win-menu-item"
              onClick={() => runAndClose(() => handlers.onFilter('grayscale'))}
            >
              <span><u>G</u>rayscale</span>
            </div>
            <div className="win-menu-separator" />
            <div
              className="win-menu-item"
              onClick={() => runAndClose(() => handlers.onFilter('blur'))}
            >
              <span>Gaussian <u>B</u>lur...</span>
            </div>
            <div
              className="win-menu-item"
              onClick={() => runAndClose(() => handlers.onFilter('sharpen'))}
            >
              <span><u>S</u>harpen...</span>
            </div>
            <div
              className="win-menu-item"
              onClick={() => runAndClose(() => handlers.onFilter('noise'))}
            >
              <span>Add <u>N</u>oise...</span>
            </div>
            <div
              className="win-menu-item"
              onClick={() => runAndClose(() => handlers.onFilter('pixelate'))}
            >
              <span><u>P</u>ixelate / Mosaic...</span>
            </div>
          </div>
        )}
      </div>

      {/* COLORS MENU */}
      <div className="win-menu-item-wrapper" style={{ position: 'relative' }}>
        <div
          className={`win-menu-trigger ${activeMenu === 'colors' ? 'active' : ''}`}
          onClick={() => handleTrigger('colors')}
          onMouseEnter={() => handleHover('colors')}
        >
          <u>C</u>olors
        </div>
        {activeMenu === 'colors' && (
          <div className="win-menu-dropdown">
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onOpenColorDialog)}>
              <span><u>E</u>dit Colors...</span>
            </div>
          </div>
        )}
      </div>

      {/* HELP MENU */}
      <div className="win-menu-item-wrapper" style={{ position: 'relative' }}>
        <div
          className={`win-menu-trigger ${activeMenu === 'help' ? 'active' : ''}`}
          onClick={() => handleTrigger('help')}
          onMouseEnter={() => handleHover('help')}
        >
          <u>H</u>elp
        </div>
        {activeMenu === 'help' && (
          <div className="win-menu-dropdown">
            <div className="win-menu-item" onClick={() => runAndClose(handlers.onAbout)}>
              <span><u>A</u>bout OG Photo...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

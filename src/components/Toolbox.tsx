import React from 'react';
import { ToolSettings, ToolType } from '../core/types';
import {
  SelectionRectIcon,
  SelectEllipseIcon,
  LassoIcon,
  PolyLassoIcon,
  MagicWandIcon,
  MoveIcon,
  CropIcon,
  EraserIcon,
  FillBucketIcon,
  EyedropperIcon,
  ZoomIcon,
  PencilIcon,
  BrushIcon,
  CloneStampIcon,
  HealingBrushIcon,
  SmudgeIcon,
  DodgeBurnIcon,
  BlurSharpenIcon,
  TextIcon,
  LineIcon,
  CurveIcon,
  RectangleIcon,
  EllipseIcon,
  RoundRectIcon,
  PolygonIcon,
  GradientIcon,
  HandIcon,
} from './icons/PaintIcons';

interface ToolboxProps {
  settings: ToolSettings;
  onUpdateSettings: (updates: Partial<ToolSettings>) => void;
  onHoverTool?: (description: string) => void;
}

interface ToolDefinition {
  type: ToolType;
  name: string;
  description: string;
  icon: React.ReactNode;
  shortcut?: string;
}

const TOOLS: ToolDefinition[] = [
  {
    type: 'select-rect',
    name: 'Rectangular Select',
    description: 'Selects a rectangular area. (M)',
    icon: <SelectionRectIcon size={16} />,
    shortcut: 'M',
  },
  {
    type: 'select-ellipse',
    name: 'Elliptical Select',
    description: 'Selects an elliptical area. (Shift+M)',
    icon: <SelectEllipseIcon size={16} />,
  },
  {
    type: 'select-lasso',
    name: 'Lasso',
    description: 'Free-form selection by drawing. (L)',
    icon: <LassoIcon size={16} />,
    shortcut: 'L',
  },
  {
    type: 'select-poly-lasso',
    name: 'Polygonal Lasso',
    description: 'Click to place straight-edge selection points. (Shift+L)',
    icon: <PolyLassoIcon size={16} />,
  },
  {
    type: 'select-wand',
    name: 'Magic Wand',
    description: 'Selects contiguous similar-color pixels. (W)',
    icon: <MagicWandIcon size={16} />,
    shortcut: 'W',
  },
  {
    type: 'move',
    name: 'Move Tool',
    description: 'Moves the active layer content. (V)',
    icon: <MoveIcon size={16} />,
    shortcut: 'V',
  },
  {
    type: 'crop',
    name: 'Crop Tool',
    description: 'Drag to define crop area, Enter to confirm. (C)',
    icon: <CropIcon size={16} />,
    shortcut: 'C',
  },
  {
    type: 'eyedropper',
    name: 'Eyedropper',
    description: 'Picks a color from the canvas. (I)',
    icon: <EyedropperIcon size={16} />,
    shortcut: 'I',
  },
  {
    type: 'pencil',
    name: 'Pencil',
    description: 'Draws hard-edged 1px lines. (N)',
    icon: <PencilIcon size={16} />,
    shortcut: 'N',
  },
  {
    type: 'brush',
    name: 'Brush',
    description: 'Draws using a brush with adjustable size. (B)',
    icon: <BrushIcon size={16} />,
    shortcut: 'B',
  },
  {
    type: 'eraser',
    name: 'Eraser',
    description: 'Erases to transparency or background color. (E)',
    icon: <EraserIcon size={16} />,
    shortcut: 'E',
  },
  {
    type: 'clone-stamp',
    name: 'Clone Stamp',
    description: 'Alt+Click to set source, paint to clone. (S)',
    icon: <CloneStampIcon size={16} />,
    shortcut: 'S',
  },
  {
    type: 'healing-brush',
    name: 'Healing Brush',
    description: 'Blends surrounding texture over painted area. (J)',
    icon: <HealingBrushIcon size={16} />,
    shortcut: 'J',
  },
  {
    type: 'smudge',
    name: 'Smudge',
    description: 'Drags and smears pixels in drag direction.',
    icon: <SmudgeIcon size={16} />,
  },
  {
    type: 'blur-sharpen',
    name: 'Blur / Sharpen',
    description: 'Localized blur or sharpen with brush strokes.',
    icon: <BlurSharpenIcon size={16} />,
  },
  {
    type: 'dodge-burn',
    name: 'Dodge / Burn',
    description: 'Lighten (dodge) or darken (burn) with brush strokes. (O)',
    icon: <DodgeBurnIcon size={16} />,
    shortcut: 'O',
  },
  {
    type: 'bucket',
    name: 'Paint Bucket',
    description: 'Fills contiguous area with foreground color. (G)',
    icon: <FillBucketIcon size={16} />,
    shortcut: 'G',
  },
  {
    type: 'gradient',
    name: 'Gradient Fill',
    description: 'Drag to apply linear/radial gradient. (Shift+G)',
    icon: <GradientIcon size={16} />,
  },
  {
    type: 'text',
    name: 'Text',
    description: 'Inserts text into the picture. (T)',
    icon: <TextIcon size={16} />,
    shortcut: 'T',
  },
  {
    type: 'line',
    name: 'Line',
    description: 'Draws a straight line. (U)',
    icon: <LineIcon size={16} />,
    shortcut: 'U',
  },
  {
    type: 'curve',
    name: 'Curve',
    description: 'Draws a curved line.',
    icon: <CurveIcon size={16} />,
  },
  {
    type: 'rectangle',
    name: 'Rectangle',
    description: 'Draws a rectangle with the selected fill style.',
    icon: <RectangleIcon size={16} />,
  },
  {
    type: 'ellipse',
    name: 'Ellipse',
    description: 'Draws an ellipse with the selected fill style.',
    icon: <EllipseIcon size={16} />,
  },
  {
    type: 'round-rect',
    name: 'Rounded Rectangle',
    description: 'Draws a rounded rectangle.',
    icon: <RoundRectIcon size={16} />,
  },
  {
    type: 'polygon',
    name: 'Polygon',
    description: 'Draws a regular polygon with configurable sides.',
    icon: <PolygonIcon size={16} />,
  },
  {
    type: 'zoom',
    name: 'Magnifier',
    description: 'Click to zoom in, Alt+Click to zoom out. (Z)',
    icon: <ZoomIcon size={16} />,
    shortcut: 'Z',
  },
  {
    type: 'pan',
    name: 'Hand / Pan',
    description: 'Drag to pan around the canvas. (H / Space)',
    icon: <HandIcon size={16} />,
    shortcut: 'H',
  },
];

export const Toolbox: React.FC<ToolboxProps> = ({
  settings,
  onUpdateSettings,
  onHoverTool,
}) => {
  return (
    <div
      className="win-toolbox"
      style={{
        width: 58,
        backgroundColor: 'var(--win-gray)',
        padding: '3px 2px',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        borderRight: '1px solid var(--win-dark)',
        flexShrink: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* 2-Column Tool Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 25px)',
          gap: 2,
        }}
      >
        {TOOLS.map((tool) => {
          const isActive = settings.currentTool === tool.type;
          return (
            <button
              key={tool.type}
              className={`win-tool-btn ${isActive ? 'active' : ''}`}
              title={`${tool.name}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
              onClick={() => onUpdateSettings({ currentTool: tool.type })}
              onMouseEnter={() => onHoverTool?.(tool.description)}
              onMouseLeave={() => onHoverTool?.('')}
            >
              {tool.icon}
            </button>
          );
        })}
      </div>

      {/* Classic Inset Tool Options Box */}
      <div
        className="win-bevel-sunken"
        style={{
          marginTop: 4,
          minHeight: 68,
          padding: '4px 2px',
          backgroundColor: 'var(--win-gray)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          boxSizing: 'border-box',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* BRUSH OPTIONS */}
        {settings.currentTool === 'brush' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', width: '100%' }}>
            <div style={{ fontSize: 9 }}>Size: {settings.brushSize}px</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 20px)',
                gap: 3,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {[2, 4, 8, 16].map((sz) => (
                <div
                  key={sz}
                  onClick={() => onUpdateSettings({ brushSize: sz })}
                  title={`${sz}px`}
                  style={{
                    width: 20,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'default',
                    backgroundColor: settings.brushSize === sz ? 'var(--win-blue-start)' : 'transparent',
                    border: settings.brushSize === sz ? '1px dotted #ffffff' : '1px solid transparent',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: Math.min(12, Math.max(2, Math.round(sz / 2))),
                      height: Math.min(12, Math.max(2, Math.round(sz / 2))),
                      borderRadius: '50%',
                      backgroundColor: settings.brushSize === sz ? '#ffffff' : '#000000',
                    }}
                  />
                </div>
              ))}
              <div
                onClick={() => onUpdateSettings({ brushSize: 24 })}
                title="24px"
                style={{
                  gridColumn: 'span 2',
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'default',
                  backgroundColor: settings.brushSize === 24 ? 'var(--win-blue-start)' : 'transparent',
                  border: settings.brushSize === 24 ? '1px dotted #ffffff' : '1px solid transparent',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: settings.brushSize === 24 ? '#ffffff' : '#000000',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ERASER OPTIONS */}
        {settings.currentTool === 'eraser' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', width: '100%' }}>
            <div style={{ fontSize: 9 }}>Size: {settings.eraserSize}px</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 20px)',
                gap: 3,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {[4, 8, 16, 24].map((sz) => (
                <div
                  key={sz}
                  onClick={() => onUpdateSettings({ eraserSize: sz })}
                  title={`${sz}px`}
                  style={{
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'default',
                    backgroundColor: settings.eraserSize === sz ? 'var(--win-blue-start)' : 'transparent',
                    border: settings.eraserSize === sz ? '1px dotted #ffffff' : '1px solid transparent',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: Math.min(14, Math.max(3, Math.round(sz / 2))),
                      height: Math.min(14, Math.max(3, Math.round(sz / 2))),
                      backgroundColor: settings.eraserSize === sz ? '#ffffff' : '#000000',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PENCIL OPTIONS */}
        {settings.currentTool === 'pencil' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%' }}>
            <div style={{ fontSize: 9 }}>Size: 1px</div>
            <div
              style={{
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--win-blue-start)',
                border: '1px dotted #ffffff',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ width: 2, height: 2, backgroundColor: '#ffffff' }} />
            </div>
            <div style={{ fontSize: 8, color: 'var(--win-dark)', textAlign: 'center' }}>1px Pixel</div>
          </div>
        )}

        {/* SHAPE MODES (Outline, Both, Fill) */}
        {['rectangle', 'ellipse', 'round-rect'].includes(settings.currentTool) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
            {[
              { mode: 'outline', label: 'Outline only' },
              { mode: 'both', label: 'Outline + Fill' },
              { mode: 'fill', label: 'Fill only' },
            ].map(({ mode, label }) => (
              <div
                key={mode}
                onClick={() => onUpdateSettings({ shapeFillMode: mode as any })}
                style={{
                  height: 18,
                  backgroundColor:
                    settings.shapeFillMode === mode ? 'var(--win-blue-start)' : 'transparent',
                  color: settings.shapeFillMode === mode ? '#ffffff' : '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'default',
                  padding: '1px 2px',
                  boxSizing: 'border-box',
                  border: settings.shapeFillMode === mode ? '1px dotted #ffffff' : '1px solid transparent',
                }}
                title={label}
              >
                <div
                  style={{
                    width: 22,
                    height: 12,
                    border: mode === 'fill' ? 'none' : '1.5px solid currentColor',
                    backgroundColor:
                      mode === 'fill' || mode === 'both' ? '#808080' : 'transparent',
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* POLYGON OPTIONS */}
        {settings.currentTool === 'polygon' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[
                { mode: 'outline', label: 'Outline' },
                { mode: 'fill', label: 'Fill' },
              ].map(({ mode, label }) => (
                <div
                  key={mode}
                  onClick={() => onUpdateSettings({ shapeFillMode: mode as any })}
                  style={{
                    flex: 1,
                    padding: '2px 0',
                    cursor: 'default',
                    backgroundColor: settings.shapeFillMode === mode ? 'var(--win-blue-start)' : 'transparent',
                    color: settings.shapeFillMode === mode ? '#ffffff' : '#000000',
                    textAlign: 'center',
                    fontSize: 8,
                    border: settings.shapeFillMode === mode ? '1px dotted #ffffff' : '1px solid transparent',
                    boxSizing: 'border-box',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 9, textAlign: 'center' }}>Sides: {settings.polygonSides}</div>
            <input
              type="range"
              min="3"
              max="12"
              value={settings.polygonSides}
              onChange={(e) => onUpdateSettings({ polygonSides: Number(e.target.value) })}
              style={{ width: '100%', height: 10 }}
            />
          </div>
        )}

        {/* LINE & CURVE OPTIONS */}
        {['line', 'curve'].includes(settings.currentTool) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '92%', alignItems: 'center' }}>
            <div style={{ fontSize: 9, textAlign: 'center', marginBottom: 1 }}>Width: {settings.brushSize || 1}px</div>
            {[1, 2, 3, 5].map((w) => (
              <div
                key={w}
                onClick={() => onUpdateSettings({ brushSize: w })}
                title={`${w}px`}
                style={{
                  width: '100%',
                  height: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'default',
                  backgroundColor: (settings.brushSize || 1) === w ? 'var(--win-blue-start)' : 'transparent',
                  border: (settings.brushSize || 1) === w ? '1px dotted #ffffff' : '1px solid transparent',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: w,
                    backgroundColor: (settings.brushSize || 1) === w ? '#ffffff' : '#000000',
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* TOLERANCE FOR BUCKET & WAND */}
        {['bucket', 'select-wand'].includes(settings.currentTool) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', padding: '0 2px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: 9, textAlign: 'center' }}>Tol: {settings.tolerance}</div>
            <input
              type="range"
              min="0"
              max="150"
              value={settings.tolerance}
              onChange={(e) => onUpdateSettings({ tolerance: Number(e.target.value) })}
              style={{ width: '100%', height: 10 }}
            />
            {settings.currentTool === 'select-wand' && (
              <label style={{ fontSize: 8, display: 'flex', alignItems: 'center', gap: 2, cursor: 'default' }}>
                <input
                  type="checkbox"
                  checked={settings.contiguous}
                  onChange={(e) => onUpdateSettings({ contiguous: e.target.checked })}
                />
                Contig
              </label>
            )}
          </div>
        )}

        {/* GRADIENT OPTIONS */}
        {settings.currentTool === 'gradient' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
            {(['linear', 'radial'] as const).map((type) => (
              <div
                key={type}
                onClick={() => onUpdateSettings({ gradientType: type })}
                style={{
                  padding: '2px 2px',
                  cursor: 'default',
                  backgroundColor: settings.gradientType === type ? 'var(--win-blue-start)' : 'transparent',
                  color: settings.gradientType === type ? '#ffffff' : '#000000',
                  textAlign: 'center',
                  fontSize: 9,
                  border: settings.gradientType === type ? '1px dotted #ffffff' : '1px solid transparent',
                  boxSizing: 'border-box',
                }}
              >
                {type === 'linear' ? 'Linear' : 'Radial'}
              </div>
            ))}
            <div style={{ fontSize: 9, textAlign: 'center', marginTop: 2 }}>
              Opacity: {Math.round((settings.opacity ?? 1) * 100)}%
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round((settings.opacity ?? 1) * 100)}
              onChange={(e) => onUpdateSettings({ opacity: Number(e.target.value) / 100 })}
              style={{ width: '100%', height: 10 }}
            />
          </div>
        )}

        {/* DODGE/BURN MODE & SIZE */}
        {settings.currentTool === 'dodge-burn' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 2, width: '100%' }}>
              {(['dodge', 'burn'] as const).map((mode) => (
                <div
                  key={mode}
                  onClick={() => onUpdateSettings({ dodgeBurnMode: mode })}
                  style={{
                    flex: 1,
                    padding: '2px 0',
                    cursor: 'default',
                    backgroundColor: settings.dodgeBurnMode === mode ? 'var(--win-blue-start)' : 'transparent',
                    color: settings.dodgeBurnMode === mode ? '#ffffff' : '#000000',
                    textAlign: 'center',
                    fontSize: 8,
                    border: settings.dodgeBurnMode === mode ? '1px dotted #ffffff' : '1px solid transparent',
                    boxSizing: 'border-box',
                  }}
                >
                  {mode === 'dodge' ? 'Dodge' : 'Burn'}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 9, textAlign: 'center' }}>Size: {settings.brushSize}px</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 20px)',
                gap: 2,
                justifyContent: 'center',
              }}
            >
              {[4, 8, 16, 24].map((sz) => (
                <div
                  key={sz}
                  onClick={() => onUpdateSettings({ brushSize: sz })}
                  title={`${sz}px`}
                  style={{
                    width: 20,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'default',
                    backgroundColor: settings.brushSize === sz ? 'var(--win-blue-start)' : 'transparent',
                    border: settings.brushSize === sz ? '1px dotted #ffffff' : '1px solid transparent',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: Math.min(10, Math.max(2, Math.round(sz / 2))),
                      height: Math.min(10, Math.max(2, Math.round(sz / 2))),
                      borderRadius: '50%',
                      backgroundColor: settings.brushSize === sz ? '#ffffff' : '#000000',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BLUR/SHARPEN MODE & SIZE */}
        {settings.currentTool === 'blur-sharpen' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 2, width: '100%' }}>
              {(['blur', 'sharpen'] as const).map((mode) => (
                <div
                  key={mode}
                  onClick={() => onUpdateSettings({ blurSharpenMode: mode })}
                  style={{
                    flex: 1,
                    padding: '2px 0',
                    cursor: 'default',
                    backgroundColor: settings.blurSharpenMode === mode ? 'var(--win-blue-start)' : 'transparent',
                    color: settings.blurSharpenMode === mode ? '#ffffff' : '#000000',
                    textAlign: 'center',
                    fontSize: 8,
                    border: settings.blurSharpenMode === mode ? '1px dotted #ffffff' : '1px solid transparent',
                    boxSizing: 'border-box',
                  }}
                >
                  {mode === 'blur' ? 'Blur' : 'Sharp'}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 9, textAlign: 'center' }}>Size: {settings.brushSize}px</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 20px)',
                gap: 2,
                justifyContent: 'center',
              }}
            >
              {[4, 8, 16, 24].map((sz) => (
                <div
                  key={sz}
                  onClick={() => onUpdateSettings({ brushSize: sz })}
                  title={`${sz}px`}
                  style={{
                    width: 20,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'default',
                    backgroundColor: settings.brushSize === sz ? 'var(--win-blue-start)' : 'transparent',
                    border: settings.brushSize === sz ? '1px dotted #ffffff' : '1px solid transparent',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: Math.min(10, Math.max(2, Math.round(sz / 2))),
                      height: Math.min(10, Math.max(2, Math.round(sz / 2))),
                      borderRadius: '50%',
                      backgroundColor: settings.brushSize === sz ? '#ffffff' : '#000000',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SMUDGE / HEALING / CLONE STAMP — BRUSH SIZE */}
        {['smudge', 'healing-brush', 'clone-stamp'].includes(settings.currentTool) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', width: '100%' }}>
            <div style={{ fontSize: 9 }}>Size: {settings.brushSize}px</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 20px)',
                gap: 3,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {[4, 8, 16, 24].map((sz) => (
                <div
                  key={sz}
                  onClick={() => onUpdateSettings({ brushSize: sz })}
                  title={`${sz}px`}
                  style={{
                    width: 20,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'default',
                    backgroundColor: settings.brushSize === sz ? 'var(--win-blue-start)' : 'transparent',
                    border: settings.brushSize === sz ? '1px dotted #ffffff' : '1px solid transparent',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: Math.min(12, Math.max(2, Math.round(sz / 2))),
                      height: Math.min(12, Math.max(2, Math.round(sz / 2))),
                      borderRadius: '50%',
                      backgroundColor: settings.brushSize === sz ? '#ffffff' : '#000000',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ZOOM OPTIONS */}
        {settings.currentTool === 'zoom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', alignItems: 'center' }}>
            <div style={{ fontSize: 9, marginBottom: 1 }}>Zoom: {settings.zoom}x</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 20px)', gap: 3 }}>
              {[1, 2, 4, 8].map((z) => (
                <div
                  key={z}
                  onClick={() => onUpdateSettings({ zoom: z })}
                  style={{
                    width: 20,
                    height: 16,
                    cursor: 'default',
                    backgroundColor: settings.zoom === z ? 'var(--win-blue-start)' : 'transparent',
                    color: settings.zoom === z ? '#ffffff' : '#000000',
                    border: settings.zoom === z ? '1px dotted #ffffff' : '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    boxSizing: 'border-box',
                  }}
                >
                  {z}x
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CROP — hint */}
        {settings.currentTool === 'crop' && (
          <div style={{ color: 'var(--win-dark)', fontSize: 9, textAlign: 'center', lineHeight: '1.3' }}>
            Drag to define<br />crop region.<br />Enter = apply
          </div>
        )}

        {/* TEXT — hint */}
        {settings.currentTool === 'text' && (
          <div style={{ color: 'var(--win-dark)', fontSize: 9, textAlign: 'center', lineHeight: '1.3' }}>
            Click canvas<br />to type or<br />edit text box.
          </div>
        )}

        {/* DEFAULT FOR OTHER TOOLS */}
        {![
          'brush', 'eraser', 'rectangle', 'ellipse', 'round-rect', 'polygon',
          'line', 'curve', 'pencil', 'bucket', 'select-wand', 'zoom', 'gradient',
          'dodge-burn', 'blur-sharpen', 'smudge', 'healing-brush', 'clone-stamp',
          'crop', 'text',
        ].includes(settings.currentTool) && (
          <div style={{ color: 'var(--win-dark)', fontSize: 9, textAlign: 'center', padding: '0 2px' }}>
            No tool options
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Layer } from '../core/types';

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
  onChangeBlendMode: (id: string, mode: GlobalCompositeOperation) => void;
  onAddLayer: () => void;
  onDuplicateLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onMergeDown: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
  onRenameLayer: (id: string, newName: string) => void;
}

const BLEND_MODES: { label: string; value: GlobalCompositeOperation }[] = [
  { label: 'Normal', value: 'source-over' },
  { label: 'Multiply', value: 'multiply' },
  { label: 'Screen', value: 'screen' },
  { label: 'Overlay', value: 'overlay' },
  { label: 'Darken', value: 'darken' },
  { label: 'Lighten', value: 'lighten' },
  { label: 'Color Dodge', value: 'color-dodge' },
  { label: 'Color Burn', value: 'color-burn' },
  { label: 'Difference', value: 'difference' },
];

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onChangeOpacity,
  onChangeBlendMode,
  onAddLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onMergeDown,
  onMoveLayer,
  onRenameLayer,
}) => {
  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startRename = (l: Layer) => {
    setEditingId(l.id);
    setEditName(l.name);
  };

  const finishRename = (id: string) => {
    if (editName.trim()) {
      onRenameLayer(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 236, boxSizing: 'border-box' }}>
      {/* Top Controls: Blend Mode & Opacity */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', width: '100%' }}>
        <select
          value={activeLayer?.blendMode || 'source-over'}
          onChange={(e) =>
            activeLayer && onChangeBlendMode(activeLayer.id, e.target.value as GlobalCompositeOperation)
          }
          style={{ flex: 1, height: 20, fontSize: 10 }}
        >
          {BLEND_MODES.map((bm) => (
            <option key={bm.value} value={bm.value}>
              {bm.label}
            </option>
          ))}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, flexShrink: 0 }}>
          <span>Op:</span>
          <input
            type="number"
            min="0"
            max="100"
            value={Math.round((activeLayer?.opacity ?? 1) * 100)}
            onChange={(e) =>
              activeLayer &&
              onChangeOpacity(activeLayer.id, Math.max(0, Math.min(100, Number(e.target.value))) / 100)
            }
            style={{ width: 38, height: 20, fontSize: 10 }}
          />
          <span>%</span>
        </div>
      </div>

      {/* Layer Stack (Rendered top to bottom) */}
      <div
        className="win-bevel-well"
        style={{
          height: 140,
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {[...layers].reverse().map((layer) => {
          const isSelected = layer.id === activeLayerId;
          return (
            <div
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 4px',
                backgroundColor: isSelected ? 'var(--win-blue-start)' : 'transparent',
                color: isSelected ? '#ffffff' : '#000000',
                cursor: 'default',
                borderBottom: '1px solid #e0e0e0',
                fontSize: 11,
              }}
            >
              {/* Eye Visibility Toggle */}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(layer.id);
                }}
                style={{
                  width: 14,
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  opacity: layer.visible ? 1 : 0.3,
                }}
                title={layer.visible ? 'Hide Layer' : 'Show Layer'}
              >
                👁
              </span>

              {/* Layer Thumbnail Placeholder */}
              <div
                className="canvas-checkerboard"
                style={{
                  width: 20,
                  height: 16,
                  border: '1px solid #808080',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={layer.canvas.toDataURL()}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              {/* Layer Name */}
              {editingId === layer.id ? (
                <input
                  type="text"
                  value={editName}
                  autoFocus
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => finishRename(layer.id)}
                  onKeyDown={(e) => e.key === 'Enter' && finishRename(layer.id)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: '100%', height: 16, fontSize: 10 }}
                />
              ) : (
                <span
                  onDoubleClick={() => startRename(layer)}
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title="Double click to rename"
                >
                  {layer.name}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Layer Bottom Toolbar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, width: '100%' }}>
        <button
          className="win-button"
          onClick={onAddLayer}
          title="New Layer"
          style={{ padding: '2px 0', fontSize: 10, textAlign: 'center' }}
        >
          + New
        </button>
        <button
          className="win-button"
          disabled={!activeLayer}
          onClick={() => activeLayer && onDuplicateLayer(activeLayer.id)}
          title="Duplicate Layer"
          style={{ padding: '2px 0', fontSize: 10, textAlign: 'center' }}
        >
          Duplicate
        </button>
        <button
          className="win-button"
          disabled={!activeLayer || layers.indexOf(activeLayer) === 0}
          onClick={() => activeLayer && onMergeDown(activeLayer.id)}
          title="Merge Down"
          style={{ padding: '2px 0', fontSize: 10, textAlign: 'center' }}
        >
          Merge
        </button>
        <button
          className="win-button"
          disabled={layers.length <= 1 || !activeLayer}
          onClick={() => activeLayer && onDeleteLayer(activeLayer.id)}
          title="Delete Layer"
          style={{ padding: '2px 0', fontSize: 10, textAlign: 'center' }}
        >
          Del
        </button>
      </div>

      {/* Reorder Buttons */}
      <div style={{ display: 'flex', gap: 2 }}>
        <button
          className="win-button"
          style={{ flex: 1, fontSize: 9, padding: '1px 3px' }}
          onClick={() => activeLayer && onMoveLayer(activeLayer.id, 'up')}
        >
          ▲ Move Up
        </button>
        <button
          className="win-button"
          style={{ flex: 1, fontSize: 9, padding: '1px 3px' }}
          onClick={() => activeLayer && onMoveLayer(activeLayer.id, 'down')}
        >
          ▼ Move Down
        </button>
      </div>
    </div>
  );
};

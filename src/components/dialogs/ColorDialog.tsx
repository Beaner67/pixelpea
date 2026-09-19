import React, { useState } from 'react';

interface ColorDialogProps {
  visible: boolean;
  currentColor: string;
  onClose: () => void;
  onSelectColor: (color: string) => void;
}

export const ColorDialog: React.FC<ColorDialogProps> = ({
  visible,
  currentColor,
  onClose,
  onSelectColor,
}) => {
  const [color, setColor] = useState(currentColor);

  if (!visible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectColor(color);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div className="win-window" style={{ width: 280 }}>
        {/* Title Bar */}
        <div className="win-titlebar">
          <div className="win-titlebar-title">
            <span>Edit Colors</span>
          </div>
          <button className="win-titlebar-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ width: 50, height: 40, border: 'none', cursor: 'pointer', padding: 0 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <span>Hex Code:</span>
              <input
                type="text"
                value={color.toUpperCase()}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button type="submit" className="win-button" style={{ width: 70 }}>
              OK
            </button>
            <button type="button" className="win-button" onClick={onClose} style={{ width: 70 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

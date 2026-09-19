import React, { useState } from 'react';

interface ResizeDialogProps {
  visible: boolean;
  currentWidth: number;
  currentHeight: number;
  onClose: () => void;
  onResize: (width: number, height: number, maintainAspect: boolean) => void;
}

export const ResizeDialog: React.FC<ResizeDialogProps> = ({
  visible,
  currentWidth,
  currentHeight,
  onClose,
  onResize,
}) => {
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);
  const [maintainAspect, setMaintainAspect] = useState(true);

  if (!visible) return null;

  const aspectRatio = currentWidth / currentHeight;

  const handleWidthChange = (newW: number) => {
    setWidth(newW);
    if (maintainAspect && aspectRatio > 0) {
      setHeight(Math.round(newW / aspectRatio));
    }
  };

  const handleHeightChange = (newH: number) => {
    setHeight(newH);
    if (maintainAspect && aspectRatio > 0) {
      setWidth(Math.round(newH * aspectRatio));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResize(Math.max(16, width), Math.max(16, height), maintainAspect);
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
      <div className="win-window" style={{ width: 300 }}>
        {/* Title Bar */}
        <div className="win-titlebar">
          <div className="win-titlebar-title">
            <span>Resize / Canvas Size</span>
          </div>
          <button className="win-titlebar-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 60 }}>Width:</span>
            <input
              type="number"
              min="16"
              max="4096"
              value={width}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span>px</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 60 }}>Height:</span>
            <input
              type="number"
              min="16"
              max="4096"
              value={height}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span>px</span>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'default' }}>
            <input
              type="checkbox"
              checked={maintainAspect}
              onChange={(e) => setMaintainAspect(e.target.checked)}
            />
            Maintain aspect ratio
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="submit" className="win-button" style={{ width: 75 }}>
              OK
            </button>
            <button type="button" className="win-button" onClick={onClose} style={{ width: 75 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

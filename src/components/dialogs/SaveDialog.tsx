import React, { useState } from 'react';

interface SaveDialogProps {
  visible: boolean;
  defaultFilename: string;
  onClose: () => void;
  onSave: (filename: string, format: 'png' | 'bmp' | 'jpeg' | 'webp', quality: number) => void;
}

export const SaveDialog: React.FC<SaveDialogProps> = ({
  visible,
  defaultFilename,
  onClose,
  onSave,
}) => {
  const [filename, setFilename] = useState(defaultFilename.replace(/\.[^/.]+$/, ''));
  const [format, setFormat] = useState<'png' | 'bmp' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState(90);

  if (!visible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = filename.trim() || 'untitled';
    onSave(cleanName, format, quality / 100);
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
      <div className="win-window" style={{ width: 360 }}>
        {/* Title Bar */}
        <div className="win-titlebar">
          <div className="win-titlebar-title">
            <span>Save As</span>
          </div>
          <button className="win-titlebar-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* File Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 80 }}>File <u>n</u>ame:</span>
            <input
              type="text"
              value={filename}
              autoFocus
              onChange={(e) => setFilename(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>

          {/* Save As Type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 80 }}>Save as <u>t</u>ype:</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              style={{ flex: 1 }}
            >
              <option value="png">PNG (*.png) - Lossless with Transparency</option>
              <option value="bmp">24-bit Bitmap (*.bmp) - Classic Windows</option>
              <option value="jpeg">JPEG (*.jpg, *.jpeg) - Photographic</option>
              <option value="webp">WebP (*.webp) - Modern Compressed</option>
            </select>
          </div>

          {/* Quality Slider (for JPEG / WebP) */}
          {(format === 'jpeg' || format === 'webp') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 88 }}>
              <span>Quality:</span>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ width: 35 }}>{quality}%</span>
            </div>
          )}

          {/* Dialog Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button type="submit" className="win-button" style={{ width: 75 }}>
              <u>S</u>ave
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

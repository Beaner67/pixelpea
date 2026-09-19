import React from 'react';
import { PaintAppIcon } from '../icons/PaintIcons';

interface AboutDialogProps {
  visible: boolean;
  onClose: () => void;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ visible, onClose }) => {
  if (!visible) return null;

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
      <div className="win-window" style={{ width: 340 }}>
        {/* Title Bar */}
        <div className="win-titlebar">
          <div className="win-titlebar-title">
            <span>About OG Photo</span>
          </div>
          <button className="win-titlebar-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 16, display: 'flex', gap: 14 }}>
          <div style={{ flexShrink: 0, marginTop: 4 }}>
            <PaintAppIcon size={36} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11 }}>
            <div style={{ fontWeight: 'bold', fontSize: 13 }}>OG Photo for Windows 98</div>
            <div>Version 1.0 (Build 1998.4.1)</div>
            <div style={{ borderTop: '1px solid var(--win-dark)', paddingTop: 6, opacity: 0.85 }}>
              Photopea-grade raster image editing engine wrapped in an authentic retro Microsoft Paint interface.
            </div>
            <div style={{ fontSize: 10, color: '#404040' }}>
              Featuring multi-layer composition, blend modes, flood fill, marching ants selection, convolution filters, and 24-bit BMP binary encoding.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 12 }}>
          <button className="win-button" onClick={onClose} style={{ width: 80 }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

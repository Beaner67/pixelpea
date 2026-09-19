import React, { useState } from 'react';

interface NewDialogProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (width: number, height: number, background: 'white' | 'transparent' | 'secondary') => void;
}

const PRESETS = [
  { label: '640 x 480 (Classic VGA)', w: 640, h: 480 },
  { label: '800 x 600 (SVGA)', w: 800, h: 600 },
  { label: '1024 x 768 (XGA)', w: 1024, h: 768 },
  { label: '1280 x 720 (HD)', w: 1280, h: 720 },
  { label: '1920 x 1080 (FHD)', w: 1920, h: 1080 },
  { label: '500 x 500 (Square)', w: 500, h: 500 },
];

export const NewDialog: React.FC<NewDialogProps> = ({ visible, onClose, onCreate }) => {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [bgType, setBgType] = useState<'white' | 'transparent' | 'secondary'>('white');

  if (!visible) return null;

  const handlePreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [w, h] = val.split('x').map(Number);
    setWidth(w);
    setHeight(h);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(Math.max(16, width), Math.max(16, height), bgType);
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
      <div className="win-window" style={{ width: 340 }}>
        {/* Title Bar */}
        <div className="win-titlebar">
          <div className="win-titlebar-title">
            <span>New Canvas</span>
          </div>
          <button className="win-titlebar-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Preset Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 60 }}>Preset:</span>
            <select onChange={handlePreset} style={{ flex: 1 }}>
              <option value="">Custom Dimensions...</option>
              {PRESETS.map((p) => (
                <option key={p.label} value={`${p.w}x${p.h}`}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Width & Height */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
              <span style={{ width: 45 }}>Width:</span>
              <input
                type="number"
                min="16"
                max="4096"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <span>px</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
              <span style={{ width: 45 }}>Height:</span>
              <input
                type="number"
                min="16"
                max="4096"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <span>px</span>
            </div>
          </div>

          {/* Background Style Fieldset */}
          <fieldset
            style={{
              padding: '6px 10px',
              border: '1px solid var(--win-dark)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <legend style={{ padding: '0 4px' }}>Canvas Background</legend>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'default' }}>
              <input
                type="radio"
                name="bgType"
                checked={bgType === 'white'}
                onChange={() => setBgType('white')}
              />
              White (Classic Paint)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'default' }}>
              <input
                type="radio"
                name="bgType"
                checked={bgType === 'transparent'}
                onChange={() => setBgType('transparent')}
              />
              Transparent
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'default' }}>
              <input
                type="radio"
                name="bgType"
                checked={bgType === 'secondary'}
                onChange={() => setBgType('secondary')}
              />
              Current Background Color
            </label>
          </fieldset>

          {/* Dialog Action Buttons */}
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

import React, { useState } from 'react';
import { FilterParams, FilterType } from '../../core/types';

interface FilterDialogProps {
  filterType: FilterType | null;
  onClose: () => void;
  onApply: (type: FilterType, params: FilterParams) => void;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
  filterType,
  onClose,
  onApply,
}) => {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [lightness, setLightness] = useState(0);
  const [radius, setRadius] = useState(3);
  const [amount, setAmount] = useState(30);
  const [blockSize, setBlockSize] = useState(8);

  if (!filterType) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(filterType, {
      brightness,
      contrast,
      hue,
      saturation,
      lightness,
      radius,
      amount,
      blockSize,
    });
    onClose();
  };

  const getTitle = () => {
    switch (filterType) {
      case 'brightness-contrast':
        return 'Brightness / Contrast';
      case 'hue-saturation':
        return 'Hue / Saturation';
      case 'blur':
        return 'Gaussian Blur';
      case 'sharpen':
        return 'Sharpen';
      case 'noise':
        return 'Add Noise';
      case 'pixelate':
        return 'Pixelate / Mosaic';
      default:
        return 'Filter';
    }
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
      <div className="win-window" style={{ width: 320 }}>
        {/* Title Bar */}
        <div className="win-titlebar">
          <div className="win-titlebar-title">
            <span>{getTitle()}</span>
          </div>
          <button className="win-titlebar-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filterType === 'brightness-contrast' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Brightness:</span>
                  <span>{brightness}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Contrast:</span>
                  <span>{contrast}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                />
              </div>
            </>
          )}

          {filterType === 'hue-saturation' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Hue:</span>
                  <span>{hue}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={hue}
                  onChange={(e) => setHue(Number(e.target.value))}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Saturation:</span>
                  <span>{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Lightness:</span>
                  <span>{lightness}%</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={lightness}
                  onChange={(e) => setLightness(Number(e.target.value))}
                />
              </div>
            </>
          )}

          {filterType === 'blur' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Radius:</span>
                <span>{radius}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
            </div>
          )}

          {filterType === 'sharpen' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Amount:</span>
                <span>{amount}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          )}

          {filterType === 'noise' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Amount:</span>
                <span>{amount}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          )}

          {filterType === 'pixelate' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Block Size:</span>
                <span>{blockSize}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="32"
                value={blockSize}
                onChange={(e) => setBlockSize(Number(e.target.value))}
              />
            </div>
          )}

          {/* Action Buttons */}
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

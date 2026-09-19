import React, { useRef } from 'react';
import { ToolSettings, TextBox } from '../core/types';

interface TextOptionsBarProps {
  settings: ToolSettings;
  activeTextBox?: TextBox | null;
  onUpdateSettings: (updates: Partial<ToolSettings>) => void;
  onUpdateActiveTextBox?: (updates: Partial<TextBox>) => void;
}

const FONT_FAMILIES = [
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Impact', value: 'Impact, sans-serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Lucida Console', value: '"Lucida Console", monospace' },
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

export const TextOptionsBar: React.FC<TextOptionsBarProps> = ({
  settings,
  activeTextBox,
  onUpdateSettings,
  onUpdateActiveTextBox,
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Active values — prioritize selected text box over default settings
  const currentFontFamily = activeTextBox?.fontFamily || settings.fontFamily || 'Tahoma, sans-serif';
  const currentFontSize = activeTextBox?.fontSize || settings.fontSize || 16;
  const currentBold = activeTextBox ? activeTextBox.fontBold : settings.fontBold;
  const currentItalic = activeTextBox ? activeTextBox.fontItalic : settings.fontItalic;
  const currentUnderline = activeTextBox ? activeTextBox.fontUnderline : settings.fontUnderline;
  const currentAlign = activeTextBox ? activeTextBox.textAlign : settings.textAlign || 'left';
  const currentColor = activeTextBox ? activeTextBox.color : settings.primaryColor || '#000000';

  const handleFontFamilyChange = (fontFamily: string) => {
    onUpdateSettings({ fontFamily });
    if (activeTextBox && onUpdateActiveTextBox) {
      onUpdateActiveTextBox({ fontFamily });
    }
  };

  const handleFontSizeChange = (fontSize: number) => {
    onUpdateSettings({ fontSize });
    if (activeTextBox && onUpdateActiveTextBox) {
      onUpdateActiveTextBox({ fontSize });
    }
  };

  const handleToggleBold = () => {
    const next = !currentBold;
    onUpdateSettings({ fontBold: next });
    if (activeTextBox && onUpdateActiveTextBox) {
      onUpdateActiveTextBox({ fontBold: next });
    }
  };

  const handleToggleItalic = () => {
    const next = !currentItalic;
    onUpdateSettings({ fontItalic: next });
    if (activeTextBox && onUpdateActiveTextBox) {
      onUpdateActiveTextBox({ fontItalic: next });
    }
  };

  const handleToggleUnderline = () => {
    const next = !currentUnderline;
    onUpdateSettings({ fontUnderline: next });
    if (activeTextBox && onUpdateActiveTextBox) {
      onUpdateActiveTextBox({ fontUnderline: next });
    }
  };

  const handleAlignChange = (textAlign: 'left' | 'center' | 'right') => {
    onUpdateSettings({ textAlign });
    if (activeTextBox && onUpdateActiveTextBox) {
      onUpdateActiveTextBox({ textAlign });
    }
  };

  const handleColorChange = (color: string) => {
    onUpdateSettings({ primaryColor: color });
    if (activeTextBox && onUpdateActiveTextBox) {
      onUpdateActiveTextBox({ color });
    }
  };

  return (
    <div
      className="win-text-options-bar"
      style={{
        height: 28,
        backgroundColor: 'var(--win-gray)',
        borderBottom: '1px solid var(--win-dark)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        gap: 8,
        fontSize: 11,
        userSelect: 'none',
        flexShrink: 0,
        zIndex: 5,
      }}
    >
      <span style={{ fontWeight: 'bold', fontSize: 11, color: '#000000' }}>Text:</span>

      {/* Font Family Dropdown */}
      <select
        value={currentFontFamily}
        onChange={(e) => handleFontFamilyChange(e.target.value)}
        className="win-select"
        style={{
          height: 20,
          fontSize: 11,
          padding: '0 4px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--win-dark)',
          minWidth: 110,
        }}
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Font Size Select */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <select
          value={currentFontSize}
          onChange={(e) => handleFontSizeChange(Number(e.target.value))}
          className="win-select"
          style={{
            height: 20,
            fontSize: 11,
            width: 44,
            padding: '0 2px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--win-dark)',
          }}
        >
          {FONT_SIZES.map((sz) => (
            <option key={sz} value={sz}>
              {sz}
            </option>
          ))}
        </select>
        <span style={{ fontSize: 10, color: 'var(--win-dark)' }}>px</span>
      </div>

      <div style={{ width: 1, height: 16, backgroundColor: 'var(--win-dark)' }} />

      {/* Bold Toggle */}
      <button
        type="button"
        title="Bold"
        onClick={handleToggleBold}
        className={`win-tool-btn ${currentBold ? 'active' : ''}`}
        style={{
          width: 22,
          height: 20,
          fontWeight: 'bold',
          fontSize: 11,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'default',
        }}
      >
        B
      </button>

      {/* Italic Toggle */}
      <button
        type="button"
        title="Italic"
        onClick={handleToggleItalic}
        className={`win-tool-btn ${currentItalic ? 'active' : ''}`}
        style={{
          width: 22,
          height: 20,
          fontStyle: 'italic',
          fontSize: 11,
          fontFamily: 'Georgia, serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'default',
        }}
      >
        I
      </button>

      {/* Underline Toggle */}
      <button
        type="button"
        title="Underline"
        onClick={handleToggleUnderline}
        className={`win-tool-btn ${currentUnderline ? 'active' : ''}`}
        style={{
          width: 22,
          height: 20,
          textDecoration: 'underline',
          fontSize: 11,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'default',
        }}
      >
        U
      </button>

      <div style={{ width: 1, height: 16, backgroundColor: 'var(--win-dark)' }} />

      {/* Alignment Buttons */}
      <div style={{ display: 'flex', gap: 1 }}>
        <button
          type="button"
          title="Align Left"
          onClick={() => handleAlignChange('left')}
          className={`win-tool-btn ${currentAlign === 'left' ? 'active' : ''}`}
          style={{
            width: 22,
            height: 20,
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'default',
          }}
        >
          ⯈
        </button>
        <button
          type="button"
          title="Align Center"
          onClick={() => handleAlignChange('center')}
          className={`win-tool-btn ${currentAlign === 'center' ? 'active' : ''}`}
          style={{
            width: 22,
            height: 20,
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'default',
          }}
        >
          ≡
        </button>
        <button
          type="button"
          title="Align Right"
          onClick={() => handleAlignChange('right')}
          className={`win-tool-btn ${currentAlign === 'right' ? 'active' : ''}`}
          style={{
            width: 22,
            height: 20,
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'default',
          }}
        >
          ⯇
        </button>
      </div>

      <div style={{ width: 1, height: 16, backgroundColor: 'var(--win-dark)' }} />

      {/* Color Swatch & Native Color Picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10 }}>Color:</span>
        <button
          type="button"
          title="Choose Text Color"
          onClick={() => colorInputRef.current?.click()}
          style={{
            width: 22,
            height: 18,
            backgroundColor: currentColor,
            border: '1px solid #000000',
            boxShadow: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080',
            cursor: 'pointer',
            padding: 0,
          }}
        />
        <input
          ref={colorInputRef}
          type="color"
          value={currentColor.length === 7 ? currentColor : '#000000'}
          onChange={(e) => handleColorChange(e.target.value)}
          style={{ opacity: 0, width: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
        />
      </div>

      {activeTextBox && (
        <span style={{ fontSize: 10, color: 'var(--win-blue-start)', marginLeft: 8, fontStyle: 'italic' }}>
          Editing text box
        </span>
      )}
    </div>
  );
};

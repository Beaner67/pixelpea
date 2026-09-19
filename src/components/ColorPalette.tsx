import React from 'react';

interface ColorPaletteProps {
  primaryColor: string;
  secondaryColor: string;
  onSelectPrimary: (color: string) => void;
  onSelectSecondary: (color: string) => void;
  onOpenColorDialog: () => void;
}

const PALETTE_ROW_1 = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080',
  '#800080', '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000',
];

const PALETTE_ROW_2 = [
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff',
  '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#7f80fb', '#ff0080', '#ff8040',
];

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  primaryColor,
  secondaryColor,
  onSelectPrimary,
  onSelectSecondary,
  onOpenColorDialog,
}) => {
  const handleContextMenu = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    onSelectSecondary(color);
  };

  return (
    <div
      className="win-color-palette"
      style={{
        backgroundColor: 'var(--win-gray)',
        padding: '3px 4px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        borderTop: '1px solid var(--win-dark)',
        borderBottom: '1px solid var(--win-dark)',
      }}
    >
      {/* Current Color Indicator Box (Foreground overlapping Background) */}
      <div
        className="win-bevel-sunken"
        style={{
          width: 32,
          height: 32,
          position: 'relative',
          backgroundColor: 'var(--win-gray)',
          cursor: 'pointer',
        }}
        title="Double click to edit color"
        onDoubleClick={onOpenColorDialog}
      >
        {/* Background Color Box (bottom right) */}
        <div
          style={{
            position: 'absolute',
            right: 2,
            bottom: 2,
            width: 16,
            height: 16,
            backgroundColor: secondaryColor,
            boxShadow: 'inset -1px -1px #000, inset 1px 1px #fff, inset -2px -2px #808080, inset 2px 2px #dfdfdf',
          }}
          title={`Background: ${secondaryColor} (Right-click swatch)`}
        />
        {/* Foreground Color Box (top left) */}
        <div
          style={{
            position: 'absolute',
            left: 2,
            top: 2,
            width: 16,
            height: 16,
            backgroundColor: primaryColor,
            boxShadow: 'inset -1px -1px #000, inset 1px 1px #fff, inset -2px -2px #808080, inset 2px 2px #dfdfdf',
            zIndex: 1,
          }}
          title={`Foreground: ${primaryColor} (Left-click swatch)`}
        />
      </div>

      {/* 28 Swatches (2 Rows of 14) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Row 1 */}
        <div style={{ display: 'flex', gap: 2 }}>
          {PALETTE_ROW_1.map((c) => (
            <div
              key={`r1-${c}`}
              onClick={() => onSelectPrimary(c)}
              onContextMenu={(e) => handleContextMenu(e, c)}
              style={{
                width: 15,
                height: 15,
                backgroundColor: c,
                boxShadow:
                  'inset 1px 1px #808080, inset -1px -1px #fff, inset 1.5px 1.5px #000, inset -1.5px -1.5px #dfdfdf',
                cursor: 'default',
              }}
              title={`${c} (Left-click for FG, Right-click for BG)`}
            />
          ))}
        </div>

        {/* Row 2 */}
        <div style={{ display: 'flex', gap: 2 }}>
          {PALETTE_ROW_2.map((c) => (
            <div
              key={`r2-${c}`}
              onClick={() => onSelectPrimary(c)}
              onContextMenu={(e) => handleContextMenu(e, c)}
              style={{
                width: 15,
                height: 15,
                backgroundColor: c,
                boxShadow:
                  'inset 1px 1px #808080, inset -1px -1px #fff, inset 1.5px 1.5px #000, inset -1.5px -1.5px #dfdfdf',
                cursor: 'default',
              }}
              title={`${c} (Left-click for FG, Right-click for BG)`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

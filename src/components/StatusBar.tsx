import React from 'react';

interface StatusBarProps {
  helpText: string;
  cursorPos: { x: number; y: number } | null;
  canvasSize: { width: number; height: number };
  selectionSize?: { width: number; height: number } | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  helpText,
  cursorPos,
  canvasSize,
  selectionSize,
}) => {
  return (
    <div className="win-statusbar">
      {/* Help tooltip segment */}
      <div className="win-status-segment" style={{ flex: 1 }}>
        {helpText || 'For Help, click Help Topics on the Help Menu.'}
      </div>

      {/* Cursor coordinates segment */}
      <div className="win-status-segment" style={{ width: 90, justifyContent: 'center' }}>
        {cursorPos ? `${cursorPos.x}, ${cursorPos.y}px` : ''}
      </div>

      {/* Canvas / Selection dimensions segment */}
      <div className="win-status-segment" style={{ width: 110, justifyContent: 'center' }}>
        {selectionSize
          ? `${selectionSize.width}x${selectionSize.height}px`
          : `${canvasSize.width}x${canvasSize.height}px`}
      </div>
    </div>
  );
};

import React from 'react';
import { PaintAppIcon } from './icons/PaintIcons';

interface TitleBarProps {
  title: string;
  isMaximized: boolean;
  onMinimize?: () => void;
  onToggleMaximize?: () => void;
  onClose?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  title,
  isMaximized,
  onMinimize,
  onToggleMaximize,
  onClose,
}) => {
  return (
    <div className="win-titlebar">
      <div className="win-titlebar-title">
        <PaintAppIcon size={16} />
        <span>{title} - OG Photo</span>
      </div>
      <div className="win-titlebar-controls">
        <button
          className="win-titlebar-btn"
          title="Minimize"
          onClick={onMinimize}
        >
          _
        </button>
        <button
          className="win-titlebar-btn"
          title={isMaximized ? 'Restore' : 'Maximize'}
          onClick={onToggleMaximize}
        >
          {isMaximized ? '❐' : '□'}
        </button>
        <button
          className="win-titlebar-btn"
          title="Close"
          onClick={onClose}
          style={{ marginRight: 1 }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { HistoryEntry } from '../core/types';

interface HistoryPanelProps {
  historyStack: HistoryEntry[];
  currentIndex: number;
  onJumpTo: (index: number) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  historyStack,
  currentIndex,
  onJumpTo,
}) => {
  return (
    <div style={{ width: 170, display: 'flex', flexDirection: 'column', gap: 4, boxSizing: 'border-box' }}>
      <div
        className="win-bevel-well"
        style={{
          height: 140,
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {historyStack.map((entry, idx) => {
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={entry.id}
              onClick={() => onJumpTo(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 6px',
                backgroundColor: isCurrent ? 'var(--win-blue-start)' : 'transparent',
                color: isCurrent ? '#ffffff' : '#000000',
                cursor: 'default',
                fontSize: 10,
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <span style={{ opacity: 0.6 }}>{idx + 1}.</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.description}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 9, color: 'var(--win-dark)', textAlign: 'center' }}>
        Click any action to revert
      </div>
    </div>
  );
};

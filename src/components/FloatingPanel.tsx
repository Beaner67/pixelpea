import React, { useState, useRef, useEffect } from 'react';

interface FloatingPanelProps {
  title: string;
  initialX: number;
  initialY: number;
  width?: number | string;
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  title,
  initialX,
  initialY,
  width,
  visible,
  onClose,
  children,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: initialX,
    posY: initialY,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: Math.max(0, dragRef.current.posX + dx),
        y: Math.max(0, dragRef.current.posY + dy),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!visible) return null;

  return (
    <div
      className="win-bevel-raised"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: width ? (typeof width === 'number' ? `${width}px` : width) : 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        zIndex: 50,
        boxShadow: '2px 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* Mini Titlebar */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          background: 'linear-gradient(90deg, #000080, #1084d0)',
          color: '#ffffff',
          padding: '1px 3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'move',
          fontSize: 10,
          fontWeight: 'bold',
        }}
      >
        <span>{title}</span>
        <button
          onClick={onClose}
          style={{
            width: 12,
            height: 11,
            fontSize: 8,
            lineHeight: '9px',
            backgroundColor: 'var(--win-gray)',
            border: 'none',
            color: '#000',
            boxShadow: 'inset -1px -1px #000, inset 1px 1px #fff',
            cursor: 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: 4 }}>{children}</div>
    </div>
  );
};

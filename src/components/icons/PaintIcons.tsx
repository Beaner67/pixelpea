import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const SelectionRectIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="12" height="12" stroke="#000000" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);

export const SelectEllipseIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="8" cy="8" rx="6" ry="5" stroke="#000000" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);

export const LassoIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 3C2 5 2 9 4 11C6 13 10 13 12 11C14 9 14 5 11 3C8 1 5 2 4 3Z" stroke="#000000" strokeWidth="1" strokeDasharray="2 2" />
    <path d="M11 11L14 14" stroke="#000000" strokeWidth="1.5" />
  </svg>
);

export const PolyLassoIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12L2 4L7 2L12 3L14 8L10 13L3 12Z" stroke="#000000" strokeWidth="1" strokeDasharray="2 2" />
    <circle cx="3" cy="12" r="1.5" fill="#000000" />
    <circle cx="7" cy="2" r="1.5" fill="#000000" />
    <circle cx="14" cy="8" r="1.5" fill="#000000" />
  </svg>
);

export const MagicWandIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 14L8 8" stroke="#808080" strokeWidth="2" strokeLinecap="square" />
    <path d="M8 8L13 3" stroke="#000080" strokeWidth="2" strokeLinecap="square" />
    <path d="M12 1L12 3M14 2L12 2" stroke="#ff0000" strokeWidth="1" />
    <path d="M6 3L6 5M8 4L6 4" stroke="#008000" strokeWidth="1" />
    <path d="M13 6L13 8M15 7L13 7" stroke="#ffff00" strokeWidth="1" />
  </svg>
);

export const MoveIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1L5 4H7V7H4V5L1 8L4 11V9H7V12H5L8 15L11 12H9V9H12V11L15 8L12 5V7H9V4H11L8 1Z" fill="#000000" />
  </svg>
);

export const CropIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 1V12H15" stroke="#000000" strokeWidth="1.5" />
    <path d="M12 15V4H1" stroke="#000000" strokeWidth="1.5" />
  </svg>
);

export const EraserIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 4L11 10L8 13L2 7L5 4Z" fill="#ffb6c1" stroke="#000000" strokeWidth="1" />
    <path d="M7 6L11 10L14 7L10 3L7 6Z" fill="#ffffff" stroke="#000000" strokeWidth="1" />
    <line x1="2" y1="13" x2="8" y2="13" stroke="#000000" strokeWidth="1.5" />
  </svg>
);

export const FillBucketIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 8L8 4L12 8L8 12L4 8Z" fill="#808080" stroke="#000000" strokeWidth="1" />
    <path d="M8 4L10 2L13 5L11 7" stroke="#000000" strokeWidth="1" />
    <path d="M12 10C12 12 11 14 11 14C11 14 13 14 13 12C13 10 12 10 12 10Z" fill="#0000ff" stroke="#000080" />
  </svg>
);

export const EyedropperIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L14 3L11 6L10 5L13 2Z" fill="#000000" />
    <path d="M10 5L11 6L6 11L4 12L5 10L10 5Z" fill="#c0c0c0" stroke="#000000" strokeWidth="1" />
    <path d="M3 13L2 14L4 14L3 13Z" fill="#ff0000" />
  </svg>
);

export const ZoomIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="4.5" stroke="#000000" strokeWidth="1.5" fill="#ffffff" />
    <path d="M10.5 10.5L14 14" stroke="#000000" strokeWidth="2" strokeLinecap="square" />
  </svg>
);

export const PencilIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L14 3L5 12L2 14L4 11L13 2Z" fill="#ffff00" stroke="#000000" strokeWidth="1" />
    <path d="M2 14L4 13L3 12L2 14Z" fill="#000000" />
    <path d="M12 3L13 4" stroke="#ff0000" strokeWidth="1" />
  </svg>
);

export const BrushIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2L10 6L7 5L13 1L14 2Z" fill="#8b4513" />
    <path d="M10 6L7 9C6 10 5 12 3 13C4 11 5 10 7 9L10 6Z" fill="#808080" stroke="#000000" strokeWidth="1" />
    <path d="M3 13C2 13.5 2 15 3 15C4 15 5 14 3 13Z" fill="#000080" />
  </svg>
);

export const CloneStampIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="11" width="10" height="3" fill="#808080" stroke="#000000" strokeWidth="1" />
    <path d="M6 11V6C6 4 7 3 8 3C9 3 10 4 10 6V11" fill="#c0c0c0" stroke="#000000" strokeWidth="1" />
    <circle cx="8" cy="3" r="2" fill="#808080" stroke="#000000" strokeWidth="1" />
  </svg>
);

export const HealingBrushIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="1" width="8" height="14" rx="4" fill="#ffcccc" stroke="#cc0000" strokeWidth="1" transform="rotate(45 8 8)" />
    <line x1="8" y1="5" x2="8" y2="11" stroke="#cc0000" strokeWidth="1.5" />
    <line x1="5" y1="8" x2="11" y2="8" stroke="#cc0000" strokeWidth="1.5" />
  </svg>
);

export const SmudgeIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14L3 10L5 7L8 6L11 7L12 5L13 3" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13 3C14 2 15 2 14 3C13 4 13 3 13 3Z" fill="#000000" />
    <circle cx="4" cy="13" r="2" fill="#808080" stroke="#000000" strokeWidth="1" />
  </svg>
);

export const DodgeBurnIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="5" r="4" fill="none" stroke="#000000" strokeWidth="1.5" />
    <line x1="8" y1="9" x2="8" y2="15" stroke="#000000" strokeWidth="2" />
    <line x1="6" y1="5" x2="10" y2="5" stroke="#000000" strokeWidth="1" />
  </svg>
);

export const BlurSharpenIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2C8 2 5 5 5 9C5 12 6.5 14 8 14C9.5 14 11 12 11 9C11 5 8 2 8 2Z" fill="#87ceeb" stroke="#000080" strokeWidth="1" />
  </svg>
);

export const TextIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H13V6H11V5H9V13H11V14H5V13H7V5H5V6H3V3Z" fill="#000000" />
  </svg>
);

export const LineIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="2" y1="14" x2="14" y2="2" stroke="#000000" strokeWidth="1.5" />
  </svg>
);

export const CurveIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 13C6 13 4 3 14 3" stroke="#000000" strokeWidth="1.5" />
  </svg>
);

export const RectangleIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="12" height="10" stroke="#000000" strokeWidth="1.5" fill="none" />
  </svg>
);

export const EllipseIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="8" cy="8" rx="6" ry="4.5" stroke="#000000" strokeWidth="1.5" fill="none" />
  </svg>
);

export const RoundRectIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="12" height="10" rx="3" stroke="#000000" strokeWidth="1.5" fill="none" />
  </svg>
);

export const PolygonIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="8,1 14,5.5 12,13 4,13 2,5.5" stroke="#000000" strokeWidth="1.5" fill="none" />
  </svg>
);

export const GradientIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#000000" />
        <stop offset="100%" stopColor="#ffffff" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="12" height="12" fill="url(#gradIcon)" stroke="#000000" strokeWidth="1" />
  </svg>
);

export const HandIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2V7H7V1H8V7H9V2H10V7H11V4H12V9C12 12 10 14 7 14C4 14 3 12 3 10V8H4V6H5V7H6V2Z" fill="#ffffff" stroke="#000000" strokeWidth="1" />
  </svg>
);

export const PaintAppIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="16" height="16" fill="#c0c0c0" />
    <path d="M2 13C3 7 7 3 13 2C13 5 11 9 9 10C8 10 7 11 6 13L2 13Z" fill="#ffff00" stroke="#000000" strokeWidth="0.8" />
    <circle cx="5" cy="6" r="1.5" fill="#ff0000" />
    <circle cx="8" cy="4.5" r="1.5" fill="#0000ff" />
    <circle cx="10" cy="7" r="1.5" fill="#008000" />
  </svg>
);

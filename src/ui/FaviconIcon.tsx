import React from 'react';

interface FaviconIconProps {
  size?: number;
}

export const FaviconIcon: React.FC<FaviconIconProps> = ({ size = 32 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Simple polyomino-inspired icon */}
      <rect x="4" y="4" width="6" height="6" fill="#ff6b6b" stroke="#000" strokeWidth="1"/>
      <rect x="10" y="4" width="6" height="6" fill="#4ecdc4" stroke="#000" strokeWidth="1"/>
      <rect x="16" y="4" width="6" height="6" fill="#45b7d1" stroke="#000" strokeWidth="1"/>
      <rect x="22" y="4" width="6" height="6" fill="#f9ca24" stroke="#000" strokeWidth="1"/>
      
      <rect x="4" y="10" width="6" height="6" fill="#6c5ce7" stroke="#000" strokeWidth="1"/>
      <rect x="10" y="10" width="6" height="6" fill="#a29bfe" stroke="#000" strokeWidth="1"/>
      <rect x="16" y="10" width="6" height="6" fill="#fd79a8" stroke="#000" strokeWidth="1"/>
      <rect x="22" y="10" width="6" height="6" fill="#00b894" stroke="#000" strokeWidth="1"/>
      
      <rect x="4" y="16" width="6" height="6" fill="#e17055" stroke="#000" strokeWidth="1"/>
      <rect x="10" y="16" width="6" height="6" fill="#81ecec" stroke="#000" strokeWidth="1"/>
      <rect x="16" y="16" width="6" height="6" fill="#fab1a0" stroke="#000" strokeWidth="1"/>
      <rect x="22" y="16" width="6" height="6" fill="#55a3ff" stroke="#000" strokeWidth="1"/>
      
      <rect x="4" y="22" width="6" height="6" fill="#ff7675" stroke="#000" strokeWidth="1"/>
      <rect x="10" y="22" width="6" height="6" fill="#74b9ff" stroke="#000" strokeWidth="1"/>
      <rect x="16" y="22" width="6" height="6" fill="#00cec9" stroke="#000" strokeWidth="1"/>
      <rect x="22" y="22" width="6" height="6" fill="#fdcb6e" stroke="#000" strokeWidth="1"/>
    </svg>
  );
};
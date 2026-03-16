import React from 'react';

const Logo = ({ type = 'scheduler', className = "w-16 h-16", showText = true, textClassName = "text-4xl" }) => {
  // Amrita Theme Colors
  const maroon = "#8b1c31";
  const gold = "#d4af37";

  const renderLogo = () => {
    switch (type) {
      case 'shield': // Concept 2
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M50 5C50 5 85 15 85 45C85 75 50 95 50 95C50 95 15 75 15 45C15 15 50 5 50 5Z" fill={maroon} />
            <path d="M50 12C50 12 78 20 78 45C78 70 50 86 50 86C50 86 22 70 22 45C22 20 50 12 50 12Z" stroke={gold} strokeWidth="3" fill="transparent" />
            <circle cx="50" cy="45" r="12" stroke="white" strokeWidth="3" />
            <polyline points="50,38 50,45 56,45" stroke={gold} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'nexus': // Concept 3
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="35" cy="50" r="20" fill={maroon} opacity="0.9" />
            <circle cx="65" cy="50" r="20" fill={gold} opacity="0.9" />
            <path d="M50 35C45 45 45 55 50 65C55 55 55 45 50 35Z" fill="white" />
            <circle cx="50" cy="22" r="6" fill={maroon} />
          </svg>
        );
      case 'scheduler': // Concept 1 (Default)
      default:
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="15" y="20" width="70" height="60" rx="8" stroke={maroon} strokeWidth="6" fill="transparent" opacity="0.2" />
            <line x1="15" y1="45" x2="85" y2="45" stroke={maroon} strokeWidth="4" opacity="0.2" />
            <line x1="50" y1="20" x2="50" y2="80" stroke={maroon} strokeWidth="4" opacity="0.2" />
            <path d="M50 15L25 85H40L45 70H55L60 85H75L50 15Z" fill={maroon} />
            <path d="M45 70H55L50 55L45 70Z" fill={gold} />
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`inline-block shrink-0 ${className}`}>
        {renderLogo()}
      </div>
      {showText && (
        <div className="flex flex-col justify-center select-none">
          <span className={`font-extrabold leading-none tracking-tight ${textClassName}`}>
            <span style={{ color: maroon }}>Sched</span>
            <span style={{ color: gold }}>AI</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
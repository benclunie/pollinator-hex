import React from 'react';

interface Props {
  size?: number;
  className?: string;
}

export const BeeIcon: React.FC<Props> = ({ size = 24, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
       {/* Wings */}
       <path d="M7 6C4 6 2 9 2 11C2 13 4 15 7 15C8.5 15 9.5 14 10 13.5" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
       <path d="M17 6C20 6 22 9 22 11C22 13 20 15 17 15C15.5 15 14.5 14 14 13.5" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
       
       {/* Body */}
       <ellipse cx="12" cy="14" rx="4" ry="6" fill="currentColor" />
       
       {/* Stripes (Negative space or stroke) */}
       <path d="M10 12H14" stroke="black" strokeWidth="2" strokeLinecap="round" />
       <path d="M9.5 15H14.5" stroke="black" strokeWidth="2" strokeLinecap="round" />
       
       {/* Head */}
       <circle cx="12" cy="7" r="3" fill="currentColor" />
       
       {/* Antennae */}
       <path d="M11 5L9 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
       <path d="M13 5L15 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};
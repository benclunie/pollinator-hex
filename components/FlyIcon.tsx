import React from 'react';

interface Props {
  size?: number;
  className?: string;
}

export const FlyIcon: React.FC<Props> = ({ size = 24, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
       {/* Wings (Shorter, wider, angled back) */}
       <path d="M6 8C4 6 2 8 3 12C3.5 14 6 15 9 14" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
       <path d="M18 8C20 6 22 8 21 12C20.5 14 18 15 15 14" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
       
       {/* Body (Slimmer than bee) */}
       <ellipse cx="12" cy="13" rx="3" ry="6" fill="currentColor" />
       
       {/* Abdomen Stripes (Subtle) */}
       <path d="M10.5 12H13.5" stroke="black" strokeWidth="1.5" strokeOpacity="0.5" />
       <path d="M10.5 15H13.5" stroke="black" strokeWidth="1.5" strokeOpacity="0.5" />
       
       {/* Head (Large eyes) */}
       <circle cx="12" cy="6" r="3.5" fill="currentColor" />
       {/* Eyes */}
       <circle cx="10.5" cy="5" r="1.5" fill="#black" fillOpacity="0.3" />
       <circle cx="13.5" cy="5" r="1.5" fill="#black" fillOpacity="0.3" />
    </svg>
  );
};
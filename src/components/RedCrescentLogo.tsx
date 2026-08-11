import React from 'react';

interface RedCrescentLogoProps {
  className?: string;
  size?: number;
}

export const RedCrescentLogo: React.FC<RedCrescentLogoProps> = ({
  className = 'w-8 h-8',
  size = 32,
}) => {
  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Exact Red Crescent Emblem */}
        <path
          d="M 66 10 A 40 40 0 1 0 66 90 A 33 33 0 1 1 66 10 Z"
          fill="#D6001C"
        />
      </svg>
    </div>
  );
};


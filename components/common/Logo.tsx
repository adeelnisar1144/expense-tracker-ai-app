import React from 'react';

interface LogoProps {
  size?: 'small' | 'large';
  className?: string;
  theme?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ size = 'large', className = '', theme = 'dark' }) => {
  const isSmall = size === 'small';

  const containerClasses = isSmall ? 'flex items-center gap-3' : 'flex flex-col items-center text-center';
  const svgSize = isSmall ? 'w-10 h-10' : 'w-24 h-24';
  const titleSize = isSmall ? 'text-2xl' : 'text-5xl';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <div className={`${containerClasses} ${className}`}>
      <svg
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={svgSize}
      >
        <defs>
          <linearGradient
            id="shield-grad"
            x1="64"
            y1="0"
            x2="64"
            y2="128"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2a2a2a" />
            <stop offset="1" stopColor="#1a1a1a" />
          </linearGradient>
          <linearGradient
            id="flow-grad-primary"
            x1="0"
            y1="128"
            x2="128"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient
            id="flow-grad-accent"
            x1="0"
            y1="0"
            x2="128"
            y2="128"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#a855f7" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
          <filter
            id="flow-glow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="10"
              floodColor="#06b6d4"
              floodOpacity="0.4"
            />
          </filter>
        </defs>
        <g filter="url(#flow-glow)">
          {/* Shield representing Budget/Security */}
          <path
            d="M64 10L114 40V88L64 118L14 88V40L64 10Z"
            fill="url(#shield-grad)"
            stroke="#4b5563"
            strokeWidth="2"
          />

          {/* Stylized 'B' representing Flow */}
          <g transform="translate(4, 0)">
            <path
              d="M45 32 C 85 32, 85 64, 45 64 C 90 64, 90 96, 45 96"
              stroke="url(#flow-grad-primary)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M45 32 V 96"
              stroke="url(#flow-grad-accent)"
              strokeWidth="13"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
      <div>
        <h1 className={`${titleSize} font-bold tracking-tight ${textColor}`}>
          Budget<span className="text-brand-secondary">Flow</span>
        </h1>
        {isSmall && <p className="text-sm text-gray-500 font-medium -mt-1">Your financial hub.</p>}
      </div>
    </div>
  );
};

export default Logo;
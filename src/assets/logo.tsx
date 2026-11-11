import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32, showText = true }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      
<svg
  width={size}
  height={size}
  viewBox="0 0 48 48"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-label="Graduation Cap logo"
>
  <rect width="48" height="48" rx="10" fill="#4f46e5" />

  <path
    d="M5 19L24 10L43 19L24 28L5 19Z"
    fill="#fff"
    stroke="#fff"
    strokeWidth="1.5"
    strokeLinejoin="round"
  />

  <path
    d="M12 23V32C19 38 29 38 36 32V23L24 29L12 23Z"
    fill="#fff"
  />

  <path
    d="M43 19V34"
    stroke="#fff"
    strokeWidth="2"
    strokeLinecap="round"
  />

  <circle cx="43" cy="36" r="2" fill="#FBBF24" />
</svg>

      {showText && (
        <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Coach<span className="text-indigo-600">Desk</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
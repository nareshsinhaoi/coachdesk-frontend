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
        aria-label="CoachDesk logo"
      >
        <rect width="48" height="48" rx="10" fill="#4f46e5" />
        <path
          d="M14 32V20a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v12"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M18 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="24" r="3" fill="#fff" />
        <path d="M17 32h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
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
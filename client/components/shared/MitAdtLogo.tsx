interface MitAdtLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function MitAdtLogo({ className = "", size = 'md' }: MitAdtLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* University Shield Background */}
        <defs>
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        
        {/* Shield Shape */}
        <path
          d="M50 5 L85 20 L85 45 Q85 70 50 90 Q15 70 15 45 L15 20 Z"
          fill="url(#shieldGradient)"
          stroke="#1e3a8a"
          strokeWidth="1"
        />
        
        {/* Inner Shield Border */}
        <path
          d="M50 10 L80 22 L80 42 Q80 65 50 82 Q20 65 20 42 L20 22 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.5"
          opacity="0.3"
        />
        
        {/* MIT Letters */}
        <g transform="translate(50, 25)">
          {/* M */}
          <path
            d="M-20 0 L-20 15 L-18 15 L-18 3 L-15 12 L-13 12 L-10 3 L-10 15 L-8 15 L-8 0 L-11 0 L-14 9 L-17 0 Z"
            fill="white"
            fontWeight="bold"
          />
          {/* I */}
          <rect x="-5" y="0" width="2" height="15" fill="white" />
          <rect x="-7" y="0" width="6" height="2" fill="white" />
          <rect x="-7" y="13" width="6" height="2" fill="white" />
          {/* T */}
          <rect x="5" y="0" width="10" height="2" fill="white" />
          <rect x="9" y="0" width="2" height="15" fill="white" />
        </g>
        
        {/* Book Symbol */}
        <g transform="translate(50, 45)">
          {/* Open Book */}
          <path
            d="M-12 0 L-12 12 L-2 10 L0 12 L2 10 L12 12 L12 0 L2 2 L0 0 L-2 2 Z"
            fill="url(#bookGradient)"
            stroke="#92400e"
            strokeWidth="0.5"
          />
          {/* Book Pages */}
          <line x1="-8" y1="3" x2="-4" y2="4" stroke="#92400e" strokeWidth="0.3" />
          <line x1="-8" y1="5" x2="-4" y2="6" stroke="#92400e" strokeWidth="0.3" />
          <line x1="-8" y1="7" x2="-4" y2="8" stroke="#92400e" strokeWidth="0.3" />
          <line x1="4" y1="4" x2="8" y2="3" stroke="#92400e" strokeWidth="0.3" />
          <line x1="4" y1="6" x2="8" y2="5" stroke="#92400e" strokeWidth="0.3" />
          <line x1="4" y1="8" x2="8" y2="7" stroke="#92400e" strokeWidth="0.3" />
        </g>
        
        {/* ADT Letters */}
        <g transform="translate(50, 68)">
          {/* A */}
          <path
            d="M-15 12 L-13 8 L-11 12 L-9 12 L-12 5 L-14 5 L-17 12 Z M-13.5 10 L-12.5 10 L-13 9 Z"
            fill="white"
            fontSize="8"
          />
          {/* D */}
          <path
            d="M-5 5 L-5 12 L-2 12 Q1 12 1 8.5 Q1 5 -2 5 Z M-3 7 L-2 7 Q-1 7 -1 8.5 Q-1 10 -2 10 L-3 10 Z"
            fill="white"
          />
          {/* T */}
          <rect x="5" y="5" width="10" height="1.5" fill="white" />
          <rect x="9" y="5" width="2" height="7" fill="white" />
        </g>
        
        {/* Decorative Stars */}
        <g fill="white" opacity="0.7">
          <circle cx="25" cy="35" r="1" />
          <circle cx="75" cy="35" r="1" />
          <circle cx="30" cy="55" r="0.8" />
          <circle cx="70" cy="55" r="0.8" />
        </g>
      </svg>
    </div>
  );
}

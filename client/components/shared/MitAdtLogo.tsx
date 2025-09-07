interface MitAdtLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function MitAdtLogo({ className = "", size = 'md' }: MitAdtLogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F29f7579e8879465c816ad21e64876b85%2Fc8396d20aefa4a89b3ce34537528410f?format=webp&width=800"
        alt="MIT ADT University Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

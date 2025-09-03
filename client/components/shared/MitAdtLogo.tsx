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
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F29f7579e8879465c816ad21e64876b85%2Ffb19798581ae4e9b9e7b750c745877d0?format=webp&width=800"
        alt="MIT ADT University Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

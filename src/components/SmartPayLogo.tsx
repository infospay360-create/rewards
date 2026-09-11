import React from 'react';

interface SmartPayLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  isLight?: boolean;
  variant?: 'full' | 'iconOnly';
}

export const SmartPayLogo: React.FC<SmartPayLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  isLight = true,
  variant = 'full',
}) => {
  // Dimension configurations
  const iconDimensions = {
    sm: {
      imgSize: 'w-8 h-8',
      textMain: 'text-lg',
      subText: 'text-[8px]',
      gap: 'gap-2',
    },
    md: {
      imgSize: 'w-11 h-11',
      textMain: 'text-2xl',
      subText: 'text-[9.5px]',
      gap: 'gap-3',
    },
    lg: {
      imgSize: 'w-14 h-14 sm:w-16 sm:h-16',
      textMain: 'text-3xl sm:text-4xl',
      subText: 'text-[11px]',
      gap: 'gap-3.5',
    },
    xl: {
      imgSize: 'w-20 h-20 sm:w-24 sm:h-24',
      textMain: 'text-4xl sm:text-5xl',
      subText: 'text-xs',
      gap: 'gap-4',
    },
  }[size];

  return (
    <div className={`flex items-center ${iconDimensions.gap} ${className}`}>
      {/* Official SmartPay 360 Circular Logo Image */}
      <div
        className={`relative shrink-0 ${iconDimensions.imgSize} rounded-full overflow-hidden shadow-lg border-2 border-[#008ce3]/40 bg-white flex items-center justify-center transition-transform hover:scale-105 duration-200`}
      >
        <img
          src="/smartpay_logo.png"
          alt="SmartPay 360 Official Logo"
          className="w-full h-full object-contain p-0.5"
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>

      {/* Typography: "SmartPay 360" & "PAY • SHOP • EARN • GROW" (Hidden if iconOnly) */}
      {variant !== 'iconOnly' && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-baseline tracking-tight">
            <span
              className={`font-black ${iconDimensions.textMain} ${
                isLight ? 'text-[#0a2540]' : 'text-white'
              }`}
              style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", letterSpacing: '-0.03em' }}
            >
              SmartPay
            </span>
            <span
              className={`font-black ml-1.5 ${iconDimensions.textMain} text-[#008ce3] drop-shadow-sm`}
              style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", letterSpacing: '-0.02em' }}
            >
              360
            </span>
          </div>

          {showSubtitle && (
            <div
              className={`font-extrabold uppercase mt-1 tracking-[0.22em] ${iconDimensions.subText} ${
                isLight ? 'text-[#0b233f]' : 'text-emerald-300'
              }`}
            >
              PAY • SHOP • EARN • GROW
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React from 'react';

interface SmartPayLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  isLight?: boolean;
}

export const SmartPayLogo: React.FC<SmartPayLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  isLight = true,
}) => {
  // Dimension scale
  const iconDimensions = {
    sm: { w: 32, h: 32, textMain: 'text-lg', subText: 'text-[8px]', gap: 'gap-2' },
    md: { w: 46, h: 46, textMain: 'text-2xl', subText: 'text-[9.5px]', gap: 'gap-3' },
    lg: { w: 60, h: 60, textMain: 'text-3xl sm:text-4xl', subText: 'text-[11px]', gap: 'gap-3.5' },
    xl: { w: 76, h: 76, textMain: 'text-4xl sm:text-5xl', subText: 'text-xs', gap: 'gap-4' },
  }[size];

  return (
    <div className={`flex items-center ${iconDimensions.gap} ${className}`}>
      {/* 3D Isometric Hexagonal 'S' Logo Icon (Exact match to the uploaded image) */}
      <div
        className="relative shrink-0 flex items-center justify-center drop-shadow-md"
        style={{ width: iconDimensions.w, height: iconDimensions.h }}
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Linear gradients matching the 3D facets of the SmartPay360 hexagon */}
            <linearGradient id="spayTopLeft" x1="20" y1="15" x2="80" y2="45" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00b4d8" />
              <stop offset="60%" stopColor="#0077b6" />
              <stop offset="100%" stopColor="#023e8a" />
            </linearGradient>

            <linearGradient id="spayRightFacet" x1="60" y1="30" x2="115" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0096c7" />
              <stop offset="50%" stopColor="#0077b6" />
              <stop offset="100%" stopColor="#03045e" />
            </linearGradient>

            <linearGradient id="spayBottomRibbon" x1="15" y1="65" x2="95" y2="110" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#48cae4" />
              <stop offset="40%" stopColor="#0096c7" />
              <stop offset="100%" stopColor="#023e8a" />
            </linearGradient>

            <linearGradient id="spayCenterFold" x1="30" y1="40" x2="90" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#90e0ef" />
              <stop offset="35%" stopColor="#00b4d8" />
              <stop offset="100%" stopColor="#0077b6" />
            </linearGradient>

            <filter id="spayShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#0077b6" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Hexagonal Isometric 3D Ribbon 'S' Structure */}
          {/* Outer Left & Top Ribbon Arch */}
          <path
            d="M 58 10 
               L 98 32 
               L 98 48 
               L 68 31 
               L 38 48 
               L 38 68 
               L 58 79 
               L 58 95 
               L 22 75 
               L 22 31 
               Z"
            fill="url(#spayTopLeft)"
          />

          {/* Inner Light Bevel Highlight on Top Edge */}
          <path
            d="M 58 10 
               L 98 32 
               L 85 39 
               L 58 24 
               L 22 44 
               L 22 31 
               Z"
            fill="url(#spayCenterFold)"
            opacity="0.9"
          />

          {/* Central Connecting Diagonal Fold */}
          <path
            d="M 38 48 
               L 68 31 
               L 98 48 
               L 98 70 
               L 80 60 
               L 80 50 
               L 58 38 
               L 38 48 
               Z"
            fill="url(#spayRightFacet)"
          />

          {/* Bottom Right Ribbon Arm */}
          <path
            d="M 62 110 
               L 22 88 
               L 22 72 
               L 52 89 
               L 82 72 
               L 82 52 
               L 62 41 
               L 62 25 
               L 98 45 
               L 98 89 
               Z"
            fill="url(#spayBottomRibbon)"
          />

          {/* Bottom Highlight Facet */}
          <path
            d="M 62 110 
               L 22 88 
               L 35 81 
               L 62 96 
               L 98 76 
               L 98 89 
               Z"
            fill="url(#spayCenterFold)"
            opacity="0.85"
          />

          {/* Dynamic 3D Hex Point Overlays */}
          <circle cx="58" cy="10" r="2.5" fill="#e0f2fe" />
          <circle cx="98" cy="32" r="2.5" fill="#bae6fd" />
          <circle cx="98" cy="89" r="2.5" fill="#38bdf8" />
          <circle cx="62" cy="110" r="2.5" fill="#bae6fd" />
          <circle cx="22" cy="88" r="2.5" fill="#38bdf8" />
          <circle cx="22" cy="31" r="2.5" fill="#e0f2fe" />
        </svg>
      </div>

      {/* Typography: "SmartPay 360" & "PAY • SHOP • EARN • GROW" */}
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
    </div>
  );
};

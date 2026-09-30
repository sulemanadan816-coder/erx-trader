import React, { useState } from 'react';
import { SITE_CONFIG } from '../../config/siteConfig';

interface BrandLogoProps {
  logoUrl?: string | null;
  brandName?: string;
  variant?: 'dark' | 'light';
  showPlaceholderHint?: boolean;
}

/**
 * REX TRADERS Official Logo Component
 * - Displays the official REX TRADERS logo (/rex-traders-logo.svg or uploaded custom logo)
 * - Preserves aspect ratio (`object-contain`, never stretches)
 * - Falls back to clean monogram if image fails to load
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  logoUrl = SITE_CONFIG.logoUrl,
  brandName = SITE_CONFIG.brandName,
  variant = 'dark',
}) => {
  const [imgError, setImgError] = useState(false);

  const effectiveLogo = logoUrl || SITE_CONFIG.logoUrl;
  const hasValidLogo = Boolean(effectiveLogo && !imgError);

  if (hasValidLogo) {
    return (
      <span className="inline-flex items-center gap-2.5 select-none">
        <img
          src={effectiveLogo!}
          alt={SITE_CONFIG.logoAlt}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg object-contain shrink-0 shadow-xs"
        />
        <span
          className={`text-base sm:text-lg font-bold tracking-tight whitespace-nowrap ${
            variant === 'light' ? 'text-white' : 'text-slate-900'
          }`}
        >
          {brandName}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg font-mono text-xs font-bold shrink-0 ${
          variant === 'light'
            ? 'bg-emerald-800 text-white border border-emerald-600'
            : 'bg-emerald-900 text-white'
        }`}
      >
        $
      </span>
      <span
        className={`text-base sm:text-lg font-bold tracking-tight whitespace-nowrap ${
          variant === 'light' ? 'text-white' : 'text-slate-900'
        }`}
      >
        {brandName}
      </span>
    </span>
  );
};

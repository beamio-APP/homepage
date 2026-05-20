import React from 'react';

export const BEAMIO_BRAND_LOGO_SRC = '/beamio-brand-logo.png';

type BeamioBrandLogoProps = {
  className?: string;
  alt?: string;
};

export default function BeamioBrandLogo({
  className = 'w-8 h-8 rounded-lg object-cover shadow-sm',
  alt = 'Beamio',
}: BeamioBrandLogoProps) {
  return <img src={BEAMIO_BRAND_LOGO_SRC} alt={alt} className={className} />;
}

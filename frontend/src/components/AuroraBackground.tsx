import React from 'react';

export const AuroraBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 min-h-screen overflow-hidden"
    >
      <div className="aurora-layer aurora-layer-cyan" />
      <div className="aurora-layer aurora-layer-emerald" />
      <div className="aurora-layer aurora-layer-turquoise" />
      <div className="aurora-layer aurora-layer-deep-green" />
      <div className="aurora-layer aurora-layer-purple" />
      <div className="aurora-layer aurora-layer-shadow" />
      <svg className="aurora-grain" xmlns="http://www.w3.org/2000/svg">
        <filter id="aurora-film-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#aurora-film-grain)" />
      </svg>
    </div>
  );
};

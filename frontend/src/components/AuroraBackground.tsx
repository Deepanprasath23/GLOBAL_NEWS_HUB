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
    </div>
  );
};

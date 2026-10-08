import React, { useRef, useEffect } from 'react';

interface VideoBackgroundProps {
  videoSrc?: string;
  overlayOpacity?: string;
  blurLevel?: string;
  children?: React.ReactNode;
  className?: string;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoSrc = '/bg-highway.mp4',
  overlayOpacity = 'bg-slate-950/75',
  blurLevel = 'backdrop-blur-[1px]',
  children,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.9; // Smooth cinematic pace
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted on some devices until interaction
      });
    }
  }, []);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Background Video Layer */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 scale-105 transform"
      />

      {/* Cinematic Multi-layer Dark Gradient Overlays for High Legibility */}
      <div className={`absolute inset-0 z-[1] ${overlayOpacity} ${blurLevel} pointer-events-none`} />
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80 pointer-events-none" />

      {/* Dynamic Content on Top */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface VideoBackgroundProps {
  videoSrc?: string;
  children?: React.ReactNode;
  className?: string;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoSrc,
  children,
  className = ''
}) => {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);

  const isDark = theme === 'dark';
  const effectiveSrc = videoSrc || (isDark ? '/bg-highway.mp4' : '/bg-highway-2.mp4');

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.95;
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted on some mobile browsers
      });
    }
  }, [effectiveSrc]);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Background Video Layer */}
      <video
        key={theme}
        ref={videoRef}
        src={effectiveSrc}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 scale-105 transform opacity-60 dark:opacity-40 light:opacity-35 transition-opacity duration-300"
      />

      {/* Adaptive Theme Overlays for Contrast */}
      <div 
        className="absolute inset-0 z-[1] backdrop-blur-[1px] pointer-events-none transition-colors duration-300"
        style={{
          backgroundColor: isDark ? 'rgba(8, 13, 28, 0.70)' : 'rgba(246, 243, 238, 0.70)'
        }}
      />
      <div 
        className="absolute inset-0 z-[2] pointer-events-none transition-all duration-300"
        style={{
          background: isDark
            ? 'linear-gradient(to top, #080D1C 0%, rgba(8,13,28,0.3) 50%, #080D1C 100%)'
            : 'linear-gradient(to top, #F6F3EE 0%, rgba(246,243,238,0.3) 50%, #F6F3EE 100%)'
        }}
      />

      {/* Foreground Content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

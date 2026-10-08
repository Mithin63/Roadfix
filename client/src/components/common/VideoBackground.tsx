import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface VideoBackgroundProps {
  videoSrc?: string;
  children?: React.ReactNode;
  className?: string;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoSrc = '/bg-highway.mp4',
  children,
  className = ''
}) => {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.95;
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted on some mobile browsers
      });
    }
  }, []);

  const isDark = theme === 'dark';

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
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 scale-105 transform opacity-60 dark:opacity-40 transition-opacity duration-300"
      />

      {/* Adaptive Theme Overlays for Contrast */}
      <div 
        className="absolute inset-0 z-[1] backdrop-blur-[1px] pointer-events-none transition-colors duration-300"
        style={{
          backgroundColor: isDark ? 'rgba(8, 13, 28, 0.70)' : 'rgba(245, 247, 251, 0.75)'
        }}
      />
      <div 
        className="absolute inset-0 z-[2] pointer-events-none transition-all duration-300"
        style={{
          background: isDark
            ? 'linear-gradient(to top, #080D1C 0%, rgba(8,13,28,0.3) 50%, #080D1C 100%)'
            : 'linear-gradient(to top, #F5F7FB 0%, rgba(245,247,251,0.3) 50%, #F5F7FB 100%)'
        }}
      />

      {/* Foreground Content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

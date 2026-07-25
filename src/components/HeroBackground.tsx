import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function HeroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const src = "https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8";

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    }
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      
      <div className="absolute inset-0 bg-gradient-to-r from-[#070b0a] to-transparent z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10"></div>
      
      <div className="hidden md:block absolute inset-0 z-20">
        <div className="absolute left-[25%] top-0 bottom-0 w-[1px] bg-white/10"></div>
        <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-white/10"></div>
        <div className="absolute left-[75%] top-0 bottom-0 w-[1px] bg-white/10"></div>
      </div>

      <div className="absolute left-1/2 top-[10%] -translate-x-1/2 pointer-events-none z-30">
        <svg width="800" height="300" viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40 mix-blend-screen">
          <g filter="url(#hero-glow)">
            <ellipse cx="400" cy="150" rx="250" ry="60" fill="#0d9488" />
          </g>
          <defs>
            <filter id="hero-glow" x="0" y="0" width="800" height="300" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="25" result="effect1_foregroundBlur" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

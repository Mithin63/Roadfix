import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Shield,
  Zap,
  Navigation,
  Sparkles,
  CheckCircle2,
  Clock,
  Radio,
  ArrowRight
} from 'lucide-react';

interface RoadfixSplashScreenProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export const RoadfixSplashScreen: React.FC<RoadfixSplashScreenProps> = ({
  onComplete,
  minDurationMs = 1800
}) => {
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('Initializing Roadfix Network...');
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / minDurationMs) * 100));
      setProgress(pct);

      if (pct < 30) {
        setStageText('Initializing Roadside Assistance Core...');
      } else if (pct < 65) {
        setStageText('Connecting Verified Mechanics & Telematics...');
      } else if (pct < 95) {
        setStageText('Locating Active Dispatch Hubs...');
      } else {
        setStageText('Roadfix Operational • Ready');
      }

      if (pct >= 100) {
        clearInterval(interval);
        setIsFinishing(true);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [minDurationMs, onComplete]);

  const handleSkip = () => {
    setIsFinishing(true);
    setTimeout(onComplete, 150);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#080D1C] text-[#F1F5F9] overflow-hidden transition-opacity duration-300 ${
        isFinishing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Highway Ambient Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <video
          src="/bg-highway.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080D1C] via-[#080D1C]/80 to-[#080D1C]" />
      </div>

      {/* Top Header Bar */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111A2E] border border-[#1E2C48] text-xs text-[#94A3B8]">
          <Radio className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
          <span className="font-semibold tracking-wide text-slate-200">ROADFIX NETWORK • LIVE</span>
        </div>

        <button
          onClick={handleSkip}
          className="text-xs text-[#94A3B8] hover:text-white transition-colors flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#111A2E] border border-[#1E2C48] hover:border-[#FFB51B]/50 font-medium cursor-pointer"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Branding & Loading Content */}
      <div className="w-full max-w-xl mx-auto px-6 py-8 flex flex-col items-center text-center relative z-10">
        {/* Emblem */}
        <div className="relative mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#FFB51B] to-[#FFD166] p-0.5 shadow-xl shadow-[#FFB51B]/20">
            <div className="w-full h-full bg-[#080D1C] rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <div className="relative flex items-center justify-center">
                <Wrench className="w-10 h-10 text-[#FFB51B]" />
                <Zap className="w-5 h-5 text-[#FFD166] absolute -bottom-1 -right-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB51B]/15 border border-[#FFB51B]/30 text-[#FFB51B] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB51B]" />
            <span>24/7 Smart Roadside Assistance</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-[#F1F5F9]">
            Roadfix <span className="text-[#FFB51B]">24/7</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed">
            Emergency Vehicle Breakdown Rescue, Certified Mechanics & Smart Telematics Dispatch
          </p>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mt-6 mb-6">
          <div className="p-3 rounded-xl bg-[#111A2E] border border-[#1E2C48] text-center flex flex-col items-center gap-1 shadow-sm">
            <Clock className="w-4 h-4 text-[#FFB51B]" />
            <span className="text-[11px] font-bold text-white">15-Min Arrival</span>
            <span className="text-[10px] text-[#94A3B8]">Fast Dispatch</span>
          </div>

          <div className="p-3 rounded-xl bg-[#111A2E] border border-[#1E2C48] text-center flex flex-col items-center gap-1 shadow-sm">
            <Navigation className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-[11px] font-bold text-white">Live GPS</span>
            <span className="text-[10px] text-[#94A3B8]">Real-Time Radar</span>
          </div>

          <div className="p-3 rounded-xl bg-[#111A2E] border border-[#1E2C48] text-center flex flex-col items-center gap-1 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#FFD166]" />
            <span className="text-[11px] font-bold text-white">AI Diagnosis</span>
            <span className="text-[10px] text-[#94A3B8]">Instant Scan</span>
          </div>

          <div className="p-3 rounded-xl bg-[#111A2E] border border-[#1E2C48] text-center flex flex-col items-center gap-1 shadow-sm">
            <Shield className="w-4 h-4 text-[#10B981]" />
            <span className="text-[11px] font-bold text-white">Certified Pros</span>
            <span className="text-[10px] text-[#94A3B8]">100% Verified</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#94A3B8] font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FFB51B] animate-pulse" />
              <span className="truncate">{stageText}</span>
            </span>
            <span className="font-mono font-bold text-[#FFB51B]">{progress}%</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[#111A2E] border border-[#1E2C48] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FFB51B] to-[#FFD166] transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl mx-auto px-6 pb-6 text-center text-xs text-[#94A3B8] relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#1E2C48] pt-4">
        <div>
          <span className="font-semibold text-slate-300">Roadfix</span> © 2026 Emergency Vehicle Assistance Network
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>ISO 9001 Certified Dispatch</span>
          <span>•</span>
          <span className="text-[#10B981] font-medium">Pan-India Support</span>
        </div>
      </div>
    </div>
  );
};

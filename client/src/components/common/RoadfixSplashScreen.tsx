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
  minDurationMs = 2800
}) => {
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('Initializing Roadfix Core Engine...');
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / minDurationMs) * 100));
      setProgress(pct);

      if (pct < 25) {
        setStageText('Initializing Roadfix Core Engine...');
      } else if (pct < 55) {
        setStageText('Connecting to Roadfix Secure Fleet Database...');
      } else if (pct < 80) {
        setStageText('Syncing 24/7 Roadside Emergency Dispatch Network...');
      } else if (pct < 98) {
        setStageText('Calibrating Live GPS Telematics & Certified Mechanics...');
      } else {
        setStageText('Roadfix Operational • Welcome');
      }

      if (pct >= 100) {
        clearInterval(interval);
        setIsFinishing(true);
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [minDurationMs, onComplete]);

  const handleSkip = () => {
    setIsFinishing(true);
    setTimeout(onComplete, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 text-slate-100 overflow-hidden transition-opacity duration-500 selection:bg-amber-500 selection:text-slate-950 ${
        isFinishing ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
    >
      {/* Background Animated Glows & Radar Rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Radial ambient gradient lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-b from-amber-500/20 via-amber-600/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-10 left-10 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Concentric radar rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-amber-500/10 animate-ping opacity-20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border border-amber-500/15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-dashed border-amber-500/20 animate-spin pointer-events-none" style={{ animationDuration: '30s' }} />
      </div>

      {/* Top Header Bar */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>ROADFIX FLEET NETWORK • LIVE</span>
        </div>

        <button
          onClick={handleSkip}
          className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Branding & Loading Content */}
      <div className="w-full max-w-xl mx-auto px-6 py-8 flex flex-col items-center text-center relative z-10">
        {/* Holographic Logo Emblem with Pulse */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 p-1 shadow-2xl shadow-amber-500/30 transform hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center relative overflow-hidden">
              {/* Inner ambient shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent" />
              <div className="relative flex items-center justify-center">
                <Wrench className="w-12 h-12 text-amber-400 animate-bounce duration-1000" />
                <Zap className="w-6 h-6 text-amber-300 absolute -bottom-1 -right-1" />
              </div>
            </div>
          </div>

          {/* Animated decorative ring badge */}
          <div className="absolute -inset-2 rounded-[28px] border border-amber-500/40 animate-pulse pointer-events-none" />
        </div>

        {/* Template App Name */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>24/7 Smart Roadside Assistance</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
              Roadfix
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Emergency Vehicle Breakdown Rescue, Certified Mechanics & Smart Telematics Dispatch
          </p>
        </div>

        {/* Core Feature Badges (Template Preview) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mt-8 mb-8">
          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center gap-1 backdrop-blur-md">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-bold text-white">15-Min Arrival</span>
            <span className="text-[9px] text-slate-400">Fast Dispatch</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center gap-1 backdrop-blur-md">
            <Navigation className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] font-bold text-white">Live GPS</span>
            <span className="text-[9px] text-slate-400">Real-Time Radar</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center gap-1 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px] font-bold text-white">AI Diagnosis</span>
            <span className="text-[9px] text-slate-400">Instant Scan</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center gap-1 backdrop-blur-md">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold text-white">Certified Pros</span>
            <span className="text-[9px] text-slate-400">100% Verified</span>
          </div>
        </div>

        {/* Dynamic Loading Animation & Progress Bar */}
        <div className="w-full max-w-md space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="truncate max-w-[260px] sm:max-w-none">{stageText}</span>
            </span>
            <span className="font-mono font-bold text-amber-400">{progress}%</span>
          </div>

          {/* Progress bar container */}
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 p-0.5 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 transition-all duration-150 ease-out shadow-lg shadow-amber-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Database Secured • Real-Time Assistance Active</span>
          </div>
        </div>
      </div>

      {/* Footer Branding Info */}
      <div className="w-full max-w-5xl mx-auto px-6 pb-6 text-center text-xs text-slate-400 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-900/80 pt-4">
        <div>
          <span className="font-semibold text-slate-300">Roadfix</span> © 2026 Emergency Vehicle Assistance Network
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400">ISO 9001 Certified Dispatch</span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">Pan-India Support</span>
        </div>
      </div>
    </div>
  );
};

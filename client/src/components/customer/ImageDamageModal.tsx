import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  Sparkles,
  X,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Info,
  Wrench,
  ShieldCheck
} from 'lucide-react';

interface ImageDamageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking: (problemType: string) => void;
}

export const ImageDamageModal: React.FC<ImageDamageModalProps> = ({
  isOpen,
  onClose,
  onProceedToBooking
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Sample presets for quick demo testing
  const samplePresets = [
    {
      title: 'Flat Tyre / Tread Debris',
      type: 'flat_tyre',
      url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Discharged Battery Terminal',
      type: 'battery_dead',
      url: 'https://images.unsplash.com/photo-1588258524675-c61917b2b005?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Front Bumper / Fender Collision',
      type: 'accident_damage',
      url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'
    }
  ];

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        runAnalysis(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: typeof samplePresets[0]) => {
    setSelectedImage(preset.url);
    runAnalysis(preset.url, preset.type);
  };

  const runAnalysis = async (imgUri: string, hint?: string) => {
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await api.imageAnalysis(imgUri, hint);
      setAnalysisResult({
        ...res.analysis,
        suggestedProblem: hint || 'flat_tyre',
        estimatedCostRange: '₹450 - ₹950',
        safetyRecommendation: 'Do not continue driving on deflated or rubbing wheel assemblies.'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#080D1C]/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#111A2E] border border-[#1E2C48] rounded-3xl shadow-2xl p-6 text-left space-y-5 my-auto animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2C48]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB51B]/15 border border-[#FFB51B]/30 flex items-center justify-center text-[#FFB51B]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100 font-heading">
                Computer Vision Damage Diagnostics
              </h3>
              <p className="text-[11px] text-slate-400">AI Component Telematics & Structural Assessment</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[#1E2C48] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload or pick preset */}
        <div className="space-y-3">
          <label className="border-2 border-dashed border-[#1E2C48] hover:border-[#FFB51B]/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#080D1C]/70 hover:bg-[#080D1C] transition-all text-center group">
            <Upload className="w-8 h-8 text-[#FFB51B] mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-100 font-heading">Upload Vehicle Damage Photo</span>
            <span className="text-[10px] text-slate-400 mt-0.5 font-mono">Supports PNG, JPG, WebP</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Sample quick test presets */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">
              Or Benchmark With Diagnostic Preset:
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {samplePresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  className="p-2.5 rounded-2xl bg-[#080D1C] border border-[#1E2C48] hover:border-[#FFB51B] text-left transition-all active:scale-95 group"
                >
                  <img
                    src={p.url}
                    alt={p.title}
                    className="w-full h-16 object-cover rounded-xl mb-2 group-hover:opacity-90 transition-opacity"
                  />
                  <div className="text-[11px] font-bold text-slate-200 truncate font-heading">{p.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Image & Analysis Result */}
        {selectedImage && (
          <div className="p-4 rounded-2xl bg-[#080D1C] border border-[#1E2C48] space-y-3">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden border border-[#1E2C48] shrink-0">
                <img src={selectedImage} alt="Analysis Target" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-2 text-xs">
                {analyzing ? (
                  <div className="py-6 text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-[#FFB51B] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400 text-xs">Analyzing damage geometry and component tags...</p>
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#10B981] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        AI Telematics: {Math.round(analysisResult.confidence * 100)}% Confidence
                      </span>
                      <span className="text-[#FFB51B] font-bold font-mono">
                        {analysisResult.estimatedCostRange}
                      </span>
                    </div>

                    <p className="text-slate-100 font-medium">
                      {analysisResult.identifiedDamage}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {analysisResult.tags.map((tag: string, i: number) => (
                        <span key={i} className="text-[10px] px-2.5 py-0.5 rounded-lg bg-[#111A2E] text-[#38BDF8] border border-[#1E2C48] font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] text-[#FFD166] italic pt-1 flex items-center gap-1 font-sans">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>AI pre-dispatch assessment — certified mechanic will verify on site.</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {analysisResult && (
              <div className="pt-3 border-t border-[#1E2C48] flex justify-end gap-2">
                <button
                  onClick={() => {
                    onProceedToBooking(analysisResult.suggestedProblem);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#FFB51B] hover:bg-[#FFD166] text-[#080D1C] font-extrabold text-xs shadow-[0_0_18px_rgba(255,181,27,0.3)] transition-all active:scale-95 flex items-center gap-1.5"
                >
                  Request Dispatch for this Issue &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

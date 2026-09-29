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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-left space-y-5 my-auto animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Image-Based Damage Analysis
              </h3>
              <p className="text-[11px] text-slate-400">Computer Vision component diagnostics</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload or pick preset */}
        <div className="space-y-3">
          <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-all text-center">
            <Upload className="w-8 h-8 text-amber-400 mb-2" />
            <span className="text-xs font-bold text-white">Upload Vehicle Damage Photo</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, WebP</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Sample quick test presets */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
              Or Try A Sample Incident Photo:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {samplePresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left transition-all"
                >
                  <img
                    src={p.url}
                    alt={p.title}
                    className="w-full h-16 object-cover rounded-lg mb-1.5"
                  />
                  <div className="text-[11px] font-semibold text-white truncate">{p.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Image & Analysis Result */}
        {selectedImage && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                <img src={selectedImage} alt="Analysis Target" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-2 text-xs">
                {analyzing ? (
                  <div className="py-6 text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400 text-xs">Analyzing damage geometry and component tags...</p>
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        AI Damage Assessment: {Math.round(analysisResult.confidence * 100)}% Confidence
                      </span>
                      <span className="text-amber-400 font-bold font-mono">
                        {analysisResult.estimatedCostRange}
                      </span>
                    </div>

                    <p className="text-slate-200 font-medium">
                      {analysisResult.identifiedDamage}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {analysisResult.tags.map((tag: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] text-amber-400/90 italic pt-1 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>AI-generated assessment — mechanic confirmation required.</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {analysisResult && (
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => {
                    onProceedToBooking(analysisResult.suggestedProblem);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                >
                  Request Mechanic for this Issue &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

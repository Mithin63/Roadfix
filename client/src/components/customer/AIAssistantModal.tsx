import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  Bot,
  X,
  Send,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  Wrench,
  CheckCircle2
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatchHelp: (query: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onDispatchHelp
}) => {
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: {
        title: 'Roadfix AI Assistant',
        text: 'Hello! I am your AI roadside vehicle diagnostic assistant. Describe any unusual sound, vibration, warning light, or failure you are experiencing.',
        suggestedQueries: [
          'My bike is not starting.',
          'My car is overheating and steaming.',
          'I hear a clicking noise when I start the car.',
          'My tyre is flat.'
        ]
      }
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await api.askAssistant(query);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.response
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col h-[82vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Roadfix AI Assistant</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                  Diagnostic Copilot
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Safe roadside troubleshooting & emergency guidance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat message stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-left">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'user' ? (
                <div className="max-w-[80%] px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-medium text-xs shadow-md">
                  {m.text}
                </div>
              ) : (
                <div className="max-w-[92%] space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs text-slate-300 shadow-md">
                    {m.content.text ? (
                      <p>{m.content.text}</p>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-white text-sm">
                            {m.content.title}
                          </h4>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            m.content.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            Urgency: {m.content.severity}
                          </span>
                        </div>

                        {/* Danger Warning */}
                        {m.content.dangerWarning && (
                          <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-[11px] flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                            <span>{m.content.dangerWarning}</span>
                          </div>
                        )}

                        {/* Possible Causes */}
                        {m.content.causes && (
                          <div>
                            <span className="font-bold text-slate-200 block mb-1">Possible Causes:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
                              {m.content.causes.map((c: string, i: number) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Safe Checks */}
                        {m.content.safeChecks && (
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                            <span className="font-bold text-emerald-400 text-[11px] block">
                              Safe DIY Roadside Checks:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                              {m.content.safeChecks.map((sc: string, i: number) => (
                                <li key={i}>{sc}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recommendation */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase block">Recommended Specialist</span>
                            <span className="text-amber-400 font-bold">{m.content.suggestedMechanicType}</span>
                          </div>
                          <button
                            onClick={() => {
                              onDispatchHelp(m.content.title);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                          >
                            Dispatch Technician Now &rarr;
                          </button>
                        </div>
                      </>
                    )}

                    {/* Pre-canned suggested pills */}
                    {m.content.suggestedQueries && (
                      <div className="pt-2 space-y-1.5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                          Quick Diagnostic Prompts:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.content.suggestedQueries.map((q: string, i: number) => (
                            <button
                              key={i}
                              onClick={() => handleSend(q)}
                              className="px-2.5 py-1 rounded-lg bg-slate-850 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                            >
                              "{q}"
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>AI is evaluating vehicle failure modes...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything (e.g. Why is coolant boiling? Car battery clicking?)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

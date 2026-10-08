import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ChatMessage } from '../../types';
import {
  X,
  Send,
  MessageSquare,
  Bot,
  Image,
  CheckCheck
} from 'lucide-react';

interface ChatDrawerProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  bookingId,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchChat = async () => {
    if (!bookingId) return;
    try {
      const res = await api.getChat(bookingId);
      setMessages(res.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchChat();
      const interval = setInterval(fetchChat, 3000); // 3s polling
      return () => clearInterval(interval);
    }
  }, [isOpen, bookingId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || !user) return;

    const messageText = text;
    setText('');

    try {
      const res = await api.sendMessage(
        bookingId,
        user.id,
        user.role,
        messageText
      );
      setMessages(prev => [...prev, res.message]);
    } catch (err) {
      console.error(err);
    }
  };

  const quickReplies = [
    'Where exactly are you parked?',
    'I have turned on hazard lights.',
    'I have arrived at your vehicle.',
    'Starting diagnosis now.'
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#111A2E] border-l border-[#1E2C48] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 text-left">
      {/* Header */}
      <div className="p-4 border-b border-[#1E2C48] bg-[#080D1C]/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFB51B]/15 border border-[#FFB51B]/30 flex items-center justify-center text-[#FFB51B]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 font-heading">Roadside Incident Channel</h3>
            <span className="text-[10px] text-[#38BDF8] font-mono">Incident #{bookingId}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[#1E2C48] transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#080D1C]/40">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium">Connecting telematics channel...</div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No messages yet. Send a message or coordinate vehicle location.
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === user?.id;
            const isSystem = m.senderRole === 'system';

            if (isSystem) {
              return (
                <div key={m.id} className="text-center my-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#111A2E] border border-[#1E2C48] text-[10px] text-[#FFB51B] font-medium font-mono">
                    ⚡ {m.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-[#FFB51B] text-[#080D1C] font-semibold rounded-br-none shadow-[0_0_12px_rgba(255,181,27,0.25)]'
                      : 'bg-[#111A2E] border border-[#1E2C48] text-slate-100 rounded-bl-none shadow-md'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-mono">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Replies */}
      <div className="px-3 py-2 border-t border-[#1E2C48] bg-[#080D1C] flex gap-1.5 overflow-x-auto">
        {quickReplies.map((r, i) => (
          <button
            key={i}
            onClick={() => {
              setText(r);
            }}
            className="text-[10px] px-2.5 py-1 rounded-lg bg-[#111A2E] hover:bg-[#1E2C48] text-slate-300 hover:text-white border border-[#1E2C48] whitespace-nowrap shrink-0 transition-all active:scale-95"
          >
            {r}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3.5 border-t border-[#1E2C48] bg-[#080D1C]">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type message to mechanic / customer..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#111A2E] border border-[#1E2C48] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#FFB51B] transition-colors"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2.5 rounded-xl bg-[#FFB51B] hover:bg-[#FFD166] disabled:opacity-40 text-[#080D1C] transition-all shadow-[0_0_12px_rgba(255,181,27,0.3)] active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

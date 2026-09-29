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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 text-left">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Live Roadside Assistance Chat</h3>
            <span className="text-[10px] text-slate-400 font-mono">Incident #{bookingId}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Connecting chat room...</div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No messages yet. Send a message or update your location.
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === user?.id;
            const isSystem = m.senderRole === 'system';

            if (isSystem) {
              return (
                <div key={m.id} className="text-center my-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] text-amber-300 font-medium">
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
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs ${
                    isMe
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none'
                      : 'bg-slate-850 bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5 px-1">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Replies */}
      <div className="px-3 py-1.5 border-t border-slate-800/80 bg-slate-950/40 flex gap-1.5 overflow-x-auto">
        {quickReplies.map((r, i) => (
          <button
            key={i}
            onClick={() => {
              setText(r);
            }}
            className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap shrink-0 transition-colors"
          >
            {r}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type message to mechanic / customer..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { EmergencyContact } from '../../types';
import {
  ShieldAlert,
  X,
  PhoneCall,
  MapPin,
  Users,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  Share2
} from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose }) => {
  const { user, activeLocation } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [sosActive, setSosActive] = useState(false);
  const [sosData, setSosData] = useState<any | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: 'Family' });

  useEffect(() => {
    if (user && isOpen) {
      api.getEmergencyContacts(user.id).then(res => setContacts(res.contacts || []));
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleTriggerSOS = async () => {
    if (!user) return;
    try {
      const res = await api.triggerSOS({
        customerId: user.id,
        lat: activeLocation.lat,
        lng: activeLocation.lng,
        address: activeLocation.address
      });
      setSosData(res.sos);
      setSosActive(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newContact.name || !newContact.phone) return;
    try {
      const res = await api.addEmergencyContact({
        ...newContact,
        customerId: user.id
      });
      setContacts(prev => [...prev, res.contact]);
      setNewContact({ name: '', phone: '', relationship: 'Family' });
      setShowAddContact(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await api.deleteEmergencyContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-red-950/40 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-red-500 rounded-3xl shadow-2xl p-6 text-left space-y-5 my-auto animate-in zoom-in-95 glow-red">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Roadfix SOS & Safety Response
              </h3>
              <p className="text-[11px] text-slate-400">Emergency dispatch and contact broadcast</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SOS STATUS DISPLAY */}
        {sosActive && sosData ? (
          <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/60 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span>SOS ACTIVATED — EMERGENCY TRACKING RUNNING</span>
            </div>
            <p className="text-xs text-slate-200">
              Your exact GPS coordinates ({activeLocation.lat.toFixed(4)}, {activeLocation.lng.toFixed(4)}) have been packaged and prepared for immediate SMS broadcast to your <strong>{sosData.notifiedContactsCount} emergency contacts</strong>.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono space-y-1">
              <div>📍 Location: {activeLocation.address}</div>
              <div className="text-amber-400">🚨 Tracking ID: RF-SOS-{Date.now().toString().slice(-6)}</div>
            </div>

            <div className="text-[11px] text-slate-400 italic">
              {sosData.disclaimer}
            </div>
          </div>
        ) : (
          /* TRIGGER BUTTON */
          <div className="p-6 rounded-2xl bg-gradient-to-b from-red-950/40 to-slate-950 border border-red-500/40 text-center space-y-3">
            <button
              onClick={handleTriggerSOS}
              className="w-28 h-28 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-xl shadow-2xl shadow-red-600/50 border-4 border-red-400/80 mx-auto flex flex-col items-center justify-center gap-1 transform hover:scale-105 active:scale-95 transition-all"
            >
              <ShieldAlert className="w-8 h-8" />
              <span>SOS</span>
            </button>
            <p className="text-xs text-slate-300 font-semibold">
              Tap to broadcast live coordinates to emergency contacts
            </p>
          </div>
        )}

        {/* Verified National Helplines */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Direct Emergency Authority Helplines
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { name: 'Police / Highway Control', num: '112', desc: 'National Unified Emergency' },
              { name: 'NHAI Highway Assistance', num: '1033', desc: 'Toll-Free Expressways' },
              { name: 'Ambulance & Trauma', num: '108', desc: 'Medical Emergency' },
              { name: 'Roadfix Control Room', num: '+91 1800-ROADFIX', desc: '24/7 Incident Dispatch' },
            ].map((h, i) => (
              <a
                key={i}
                href={`tel:${h.num}`}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-white">{h.name}</div>
                  <div className="text-[10px] text-slate-400">{h.desc}</div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 font-mono">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{h.num}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Emergency Contacts Management */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              Configured Emergency Contacts ({contacts.length})
            </span>
            <button
              onClick={() => setShowAddContact(!showAddContact)}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              {showAddContact ? 'Cancel' : '+ Add Contact'}
            </button>
          </div>

          {showAddContact && (
            <form onSubmit={handleAddContact} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone (+91...)"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  required
                />
                <div className="flex gap-2">
                  <select
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-amber-500 font-bold text-slate-950"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-white">{c.name}</span>
                  <span className="text-[10px] text-slate-400 ml-2">({c.relationship})</span>
                  <div className="text-[11px] text-slate-400 font-mono">{c.phone}</div>
                </div>
                <button
                  onClick={() => handleDeleteContact(c.id)}
                  className="p-1 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Car,
  Wrench,
  Clock,
  DollarSign,
  Star,
  CheckCircle2,
  Save,
  LogOut,
  UserCheck,
  Users,
  Camera,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { Vehicle, EmergencyContact } from '../../types';

interface UserProfilePageProps {
  onOpenVehicles?: () => void;
  onOpenSos?: () => void;
  onOpenLogin?: () => void;
  onBackToDashboard?: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  onOpenVehicles,
  onOpenSos,
  onOpenLogin,
  onBackToDashboard
}) => {
  const { user, role, updateUserProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'role_details'>('profile');

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Mechanic-specific
  const [workshopName, setWorkshopName] = useState(user?.profile?.workshopName || '');
  const [hourlyRate, setHourlyRate] = useState(user?.profile?.hourlyRate || 300);
  const [baseServiceFee, setBaseServiceFee] = useState(user?.profile?.baseServiceFee || 150);

  // Stats / extra data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setAddress(user.address || '');
      setAvatar(user.avatar || '');
      if (user.profile) {
        setWorkshopName(user.profile.workshopName);
        setHourlyRate(user.profile.hourlyRate);
        setBaseServiceFee(user.profile.baseServiceFee);
      }

      if (user.role === 'customer') {
        api.getVehicles(user.id).then(r => setVehicles(r.vehicles || []));
        api.getEmergencyContacts(user.id).then(r => setContacts(r.contacts || []));
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-slate-400">Please sign in to view your account details.</p>
        <button
          onClick={onOpenLogin}
          className="px-6 py-2.5 rounded-xl bg-amber-500 font-bold text-slate-950 text-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await updateUserProfile({
        name,
        phone,
        address,
        avatar,
        workshopName,
        hourlyRate,
        baseServiceFee
      });
      setSaveMessage('Profile details updated successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setSaveMessage('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in text-left max-w-4xl mx-auto">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        {onBackToDashboard ? (
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400 hover:text-amber-300 hover:border-amber-500/40 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        ) : (
          <span className="text-xs font-bold text-slate-400">Account Overview</span>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Signed in as <strong className="text-white">{user.name}</strong></span>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-start sm:items-center gap-5 relative z-10">
          <div className="relative group">
            <img
              src={avatar || user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-amber-500/50 shadow-xl"
            />
            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white">{user.name}</h2>
              {user.role === 'customer' && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Vehicle Owner
                </span>
              )}
              {user.role === 'mechanic' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Mechanic
                </span>
              )}
              {user.role === 'admin' && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Administrator
                </span>
              )}
              {user.profile?.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Pro
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {user.email}
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                {user.phone}
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {user.address || 'Mumbai, Maharashtra'}
              </span>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="relative z-10 flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              logout();
              if (onOpenLogin) onOpenLogin();
            }}
            className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Personal Information
        </button>
        <button
          onClick={() => setActiveTab('role_details')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'role_details'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {role === 'mechanic' ? 'Workshop & Verification' : 'Vehicles & Safety Details'}
        </button>
      </div>

      {/* TAB 1: PERSONAL INFORMATION */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-extrabold text-white">Edit Personal Details</h3>
            <span className="text-[11px] text-slate-400">Account ID: {user.id}</span>
          </div>

          {saveMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              saveMessage.includes('successfully')
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Phone Number (Emergency SMS Contact)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Email address cannot be changed</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Base Address / Area</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Bandra West, Mumbai"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Quick Avatar Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs text-slate-400 block">Choose Profile Picture Avatar</label>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {presetAvatars.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatar(url)}
                  className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 transition-transform ${
                    avatar === url ? 'ring-2 ring-amber-400 scale-105' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="Preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Mechanic Workshop Fields */}
          {user.role === 'mechanic' && (
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Workshop & Billing Tariffs
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Workshop Name</label>
                  <input
                    type="text"
                    value={workshopName}
                    onChange={(e) => setWorkshopName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Base Inspection Callout (₹)</label>
                  <input
                    type="number"
                    value={baseServiceFee}
                    onChange={(e) => setBaseServiceFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Hourly Labour Rate (₹)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: ROLE-SPECIFIC DETAILS */}
      {activeTab === 'role_details' && (
        <div className="space-y-6">
          {/* CUSTOMER ROLE DETAILS */}
          {user.role === 'customer' && (
            <div className="space-y-5">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Registered Customer Vehicles ({vehicles.length})</h3>
                  </div>
                  {onOpenVehicles && (
                    <button
                      onClick={onOpenVehicles}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Manage Vehicles &rarr;
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vehicles.map((v) => (
                    <div key={v.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{v.make} {v.model}</span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">{v.type}</span>
                      </div>
                      <div className="text-amber-400 font-mono text-[11px] font-bold">{v.regNo}</div>
                      <div className="text-slate-400 text-[10px] capitalize">Fuel: {v.fuelType} • Last Service: {v.lastServiceDate || 'Recent'}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-red-400" />
                    <h3 className="text-sm font-bold text-white">Emergency Contacts ({contacts.length})</h3>
                  </div>
                  {onOpenSos && (
                    <button
                      onClick={onOpenSos}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold"
                    >
                      Configure SOS &rarr;
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {contacts.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-white">{c.name}</span>
                        <span className="text-slate-500 text-[10px] ml-2">({c.relationship})</span>
                      </div>
                      <span className="text-slate-300 font-mono">{c.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MECHANIC ROLE DETAILS */}
          {user.role === 'mechanic' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Professional Verification & Credentials
              </h3>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300">Identity & Driving Licence Verification</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase text-[10px]">
                    Status: Verified Pro
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div>Govt ID: <span className="text-white font-mono">{user.profile?.verificationDocs.idProof}</span></div>
                  <div>Commercial DL: <span className="text-amber-400 font-mono">{user.profile?.verificationDocs.drivingLicense}</span></div>
                </div>
              </div>

              {/* Skills and Equipment Badges */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {user.profile?.skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Mobile Tool Inventory</span>
                <div className="flex flex-wrap gap-1.5">
                  {user.profile?.equipment.map((eq, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      🛠️ {eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ADMIN ROLE DETAILS */}
          {user.role === 'admin' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white">Administrator Access Privileges</h3>
              <p className="text-slate-400">
                You have full operational access to manage users, verify mechanic documents, dispatch roadside requests, and monitor statutory payments.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

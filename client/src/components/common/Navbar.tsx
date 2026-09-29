import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  MapPin,
  Bell,
  Sparkles,
  Bot,
  UserCheck,
  ChevronDown,
  LogOut,
  Car,
  Wrench,
  Shield,
  X,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon
} from 'lucide-react';

interface NavbarProps {
  onOpenSos: () => void;
  onOpenAiAssistant: () => void;
  onOpenDamageAnalysis: () => void;
  onOpenLogin: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSos,
  onOpenAiAssistant,
  onOpenDamageAnalysis,
  onOpenLogin,
  currentTab,
  setCurrentTab
}) => {
  const {
    user,
    role,
    demoUsers,
    switchUser,
    logout,
    notifications,
    unreadNotifCount,
    markNotificationRead,
    activeLocation,
    detectLocation
  } = useAuth();

  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Wrench className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent">
                  Roadfix
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  24/7
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
                Emergency Breakdown Assistance
              </p>
            </div>
          </button>

          {/* Location Badge */}
          <button
            onClick={detectLocation}
            title="Click to detect current GPS location"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition-all max-w-[220px]"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span className="truncate">{activeLocation.address}</span>
          </button>
        </div>

        {/* Center / Navigation Quick Actions */}
        <div className="flex items-center gap-2">
          {/* AI Vehicle Assistant button */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 text-xs font-semibold shadow-sm transition-all hover:border-indigo-400"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Vehicle Assistant</span>
            <span className="sm:hidden">AI Helper</span>
          </button>

          {/* AI Damage Visual Scanner */}
          <button
            onClick={onOpenDamageAnalysis}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Damage Scan</span>
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={onOpenSos}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold tracking-wide shadow-lg shadow-red-600/25 border border-red-500 animate-pulse-fast transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>SOS</span>
          </button>
        </div>

        {/* Right Section: Notifications, 1-Click Role Switcher, Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center ring-2 ring-slate-950 animate-bounce">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel-glow bg-slate-900/95 border border-slate-700 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-white">Notifications</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {unreadNotifCount} unread
                  </span>
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-colors text-left border ${
                          n.read
                            ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                            : 'bg-slate-800/80 border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-slate-200">{n.title}</h4>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Direct Profile Details Button */}
          <button
            onClick={() => setCurrentTab('profile')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              currentTab === 'profile'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="View personal profile and account details"
          >
            <UserIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>My Details</span>
          </button>

            {/* Authenticated User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all text-left"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt={user?.name || 'User'}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700"
                />
                <div className="hidden md:block">
                  <div className="text-xs font-bold text-slate-200 leading-tight flex items-center gap-1.5">
                    <span className="truncate max-w-[110px]">{user?.name || 'Registered User'}</span>
                    {role === 'customer' && <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">Customer</span>}
                    {role === 'mechanic' && <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">Mechanic</span>}
                    {role === 'admin' && <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold">Admin</span>}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{user?.email}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

            {/* User Details Dropdown Menu */}
            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel-glow bg-slate-900/95 border border-slate-700 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                    Account Details
                  </div>
                  <button
                    onClick={() => setShowRoleSwitcher(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 mb-3">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt={user?.name || 'User'}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{user?.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                    <div className="text-[9px] text-amber-400 font-semibold capitalize mt-0.5">Role: {role}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setCurrentTab('profile');
                      setShowRoleSwitcher(false);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>View Profile & Registered Info</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowRoleSwitcher(false);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-red-950/50 hover:bg-red-900/50 border border-red-500/40 text-xs font-bold text-red-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Direct Logout Button */}
          <button
            onClick={logout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-400 text-xs font-semibold transition-all shadow-sm"
            title="Sign out of account and return to login page"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

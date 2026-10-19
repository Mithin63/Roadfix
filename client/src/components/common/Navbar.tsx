import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  User as UserIcon,
  Sun,
  Moon
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

  const { theme, toggleTheme } = useTheme();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E2C48] dark:border-[#1E2C48] light:border-[#111215]/25 bg-[#080D1C]/90 dark:bg-[#080D1C]/90 light:bg-[#F6F3EE]/95 backdrop-blur-md shadow-md transition-colors duration-200">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left Section: Logo and Brand Lockup */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 text-left group transition-all duration-150 shrink-0 cursor-pointer"
            aria-label="RoadFix Home"
          >
            {/* Automotive Wrench Emblem */}
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B] dark:bg-[#FFB51B] p-0.5 border-2 border-[#111215] dark:border-[#FFB51B]/40 shadow-[2px_2px_0px_#111215] dark:shadow-[0_0_12px_rgba(255,181,27,0.35)] shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#FAF5E9] dark:bg-[#080D1C] rounded-[8px] flex items-center justify-center">
                <Wrench className="w-5 h-5 text-[#111215] dark:text-[#FFB51B]" />
              </div>
            </div>

            {/* Brand Wordmark & Telematics Badge */}
            <div className="flex flex-col justify-center shrink-0">
              <div className="flex items-center gap-2 leading-none">
                <span className="font-headline text-3xl font-black tracking-wider uppercase text-[#111215] dark:text-white leading-none">
                  ROAD<span className="text-[#FF6B00] dark:text-[#FFB51B]">FIX</span>
                </span>
                <span className="px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase rounded bg-[#FACC15] dark:bg-[#FFB51B]/20 text-[#111215] dark:text-[#FFB51B] border border-[#111215]/30 dark:border-[#FFB51B]/40 leading-none shrink-0 shadow-sm">
                  24/7
                </span>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#111215]/70 dark:text-slate-400 font-bold mt-1 whitespace-nowrap block leading-none">
                Smart Telematics Rescue
              </span>
            </div>
          </button>

          {/* Location Badge with Cyan GPS Telematics */}
          <button
            onClick={detectLocation}
            title="Click to detect current GPS location"
            className="btn-auto hidden xl:flex items-center gap-2 h-10 px-3.5 rounded-xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#111215] text-xs text-slate-800 dark:text-[#F1F5F9] light:text-[#111215] hover:border-[#38BDF8]/60 light:shadow-[2px_2px_0px_#111215] max-w-[220px] shrink-0 whitespace-nowrap cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] light:bg-[#0284C7] shadow-[0_0_8px_#38bdf8]" />
            </div>
            <span className="truncate text-xs font-mono font-medium text-slate-300 dark:text-slate-200 light:text-[#111215]">{activeLocation.address}</span>
          </button>
        </div>

        {/* Right Section: Unified Toolbar with EXACT EQUAL GAP (gap-2.5) throughout & guaranteed end boundary */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* AI Vehicle Assistant button */}
          <button
            onClick={onOpenAiAssistant}
            className="btn-auto h-10 px-3.5 rounded-xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white hover:bg-[#17233D] dark:hover:bg-[#17233D] light:hover:bg-[#EFECE5] text-[#38BDF8] light:text-[#111215] border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#111215] light:shadow-[2px_2px_0px_#111215] text-xs font-bold shadow-sm flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Bot className="w-4 h-4 text-[#38BDF8] light:text-[#0284C7] shrink-0" />
            <span className="whitespace-nowrap">AI Vehicle Assistant</span>
          </button>

          {/* AI Damage Visual Scanner */}
          <button
            onClick={onOpenDamageAnalysis}
            className="btn-auto hidden lg:flex h-10 px-3.5 rounded-xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white hover:bg-[#17233D] dark:hover:bg-[#17233D] light:hover:bg-[#EFECE5] text-slate-200 dark:text-[#F1F5F9] light:text-[#111215] border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#111215] light:shadow-[2px_2px_0px_#111215] text-xs font-bold shadow-sm items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FFB51B] light:text-[#F59E0B] shrink-0" />
            <span className="whitespace-nowrap">AI Damage Scan</span>
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={onOpenSos}
            className="btn-auto h-10 px-4 rounded-xl bg-[#DC2626] light:bg-[#DC2626] text-white text-xs font-black tracking-wider shadow-md border-2 border-red-500 light:border-[#111215] light:shadow-[2px_2px_0px_#111215] hover:bg-red-700 cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-white auto-sos-indicator shrink-0" />
            <span className="font-headline text-base tracking-wider leading-none whitespace-nowrap">SOS DISPATCH</span>
          </button>

          {/* Light / Dark Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme (RoadFix Editorial)' : 'Switch to Dark Theme (Midnight Garage)'}
            aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="btn-auto w-10 h-10 rounded-xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#111215] text-[#FFB51B] dark:text-[#FFB51B] light:text-[#D97706] light:shadow-[2px_2px_0px_#111215] hover:border-[#FFB51B] hover:shadow-[0_0_14px_rgba(255,181,27,0.4)] shadow-sm flex items-center justify-center shrink-0 group focus:outline-none cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#FFB51B] group-hover:rotate-90 group-active:scale-90 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-[#D97706] group-hover:-rotate-45 group-active:scale-90 transition-transform duration-300" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded-xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#111215] text-slate-300 dark:text-slate-300 light:text-[#111215] light:shadow-[2px_2px_0px_#111215] hover:text-white dark:hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
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
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#111215] p-4 shadow-2xl light:shadow-[4px_4px_0px_#111215] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2C48] dark:border-[#1E2C48] light:border-[#111215]/20">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#FFB51B]" />
                    <span className="text-sm font-bold text-slate-100 dark:text-slate-100 light:text-[#111215] font-heading">Notifications</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {unreadNotifCount} unread
                  </span>
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-colors text-left border ${
                          n.read
                            ? 'bg-[#080D1C]/40 dark:bg-[#080D1C]/40 light:bg-[#EFECE5] border-[#1E2C48]/60 dark:border-[#1E2C48]/60 light:border-[#111215]/20 opacity-70'
                            : 'bg-[#17233D] dark:bg-[#17233D] light:bg-amber-100/70 border-[#FFB51B]/30 light:border-[#111215]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800">{n.title}</h4>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-[#FFB51B] shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-mono">
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
            className={`hidden sm:flex h-10 px-3.5 rounded-xl border text-xs font-bold transition-all items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
              currentTab === 'profile'
                ? 'bg-[#FFB51B] text-[#080D1C] border-[#FFB51B] light:border-[#111215] shadow-md light:shadow-[2px_2px_0px_#111215]'
                : 'bg-[#111A2E] dark:bg-[#111A2E] light:bg-white border-[#1E2C48] dark:border-[#1E2C48] light:border-[#111215] text-slate-300 dark:text-slate-300 light:text-[#111215] hover:text-white dark:hover:text-white light:shadow-[2px_2px_0px_#111215]'
            }`}
            title="View personal profile and account details"
          >
            <UserIcon className="w-4 h-4 text-[#FFB51B] light:text-[#D97706] shrink-0" />
            <span className="whitespace-nowrap">My Details</span>
          </button>

          {/* Authenticated User Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="h-10 px-3 rounded-xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#111215] light:shadow-[2px_2px_0px_#111215] hover:border-[#FFB51B]/50 transition-all text-left flex items-center gap-2.5 shrink-0 cursor-pointer"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                alt={user?.name || 'User'}
                className="w-6 h-6 rounded-lg object-cover ring-1 ring-[#1E2C48] shrink-0"
              />
              <div className="hidden lg:flex items-center gap-2 whitespace-nowrap leading-none">
                <span className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-[#111215] font-heading whitespace-nowrap">
                  {user?.name || 'User'}
                </span>
                {role === 'customer' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30 font-semibold font-mono leading-none">Customer</span>}
                {role === 'mechanic' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FFB51B]/20 text-[#FFB51B] border border-[#FFB51B]/30 font-semibold font-mono leading-none">Mechanic</span>}
                {role === 'admin' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold font-mono leading-none">Admin</span>}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* User Details Dropdown Menu */}
            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#111A2E] dark:bg-[#111A2E] light:bg-white border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#111215] p-4 shadow-2xl light:shadow-[4px_4px_0px_#111215] z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1E2C48] dark:border-[#1E2C48] light:border-[#111215]/20 mb-3">
                  <div className="text-xs font-bold text-slate-100 dark:text-slate-100 light:text-[#111215] uppercase tracking-wider flex items-center gap-1.5 font-heading">
                    <UserIcon className="w-3.5 h-3.5 text-[#FFB51B]" />
                    Account Details
                  </div>
                  <button
                    onClick={() => setShowRoleSwitcher(false)}
                    className="text-slate-400 hover:text-slate-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#080D1C] dark:bg-[#080D1C] light:bg-[#EFECE5] border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#111215]/20 mb-3">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt={user?.name || 'User'}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#1E2C48]"
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-100 dark:text-slate-100 light:text-[#111215] truncate font-heading">{user?.name}</div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">{user?.email}</div>
                    <div className="text-[9px] text-[#FFB51B] font-semibold capitalize mt-0.5 font-mono">Role: {role}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setCurrentTab('profile');
                      setShowRoleSwitcher(false);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#080D1C] dark:bg-[#080D1C] light:bg-[#FAF8F5] hover:bg-[#17233D] dark:hover:bg-[#17233D] light:hover:bg-[#EFECE5] border border-[#1E2C48] dark:border-[#1E2C48] light:border-[#111215] text-xs font-bold text-[#FFB51B] light:text-[#111215] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>View Profile & Telematics Info</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowRoleSwitcher(false);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-xs font-bold text-red-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
            className="h-10 px-3.5 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-[#111215] hover:border-red-500/50 light:hover:border-red-500 text-slate-400 hover:text-red-400 light:text-[#111215] light:hover:text-red-600 text-xs font-bold transition-all light:shadow-[2px_2px_0px_#111215] flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer active:scale-95"
            title="Sign out of account and return to login page"
          >
            <LogOut className="w-4 h-4 text-red-400 light:text-red-600 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

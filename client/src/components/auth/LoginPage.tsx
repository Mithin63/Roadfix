import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Wrench,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Car,
  Shield,
  ArrowRight,
  MapPin,
  Sparkles,
  Zap,
  Clock,
  Award,
  Activity,
  X,
  Database,
  Sun,
  Moon,
  AlertTriangle,
  Bot,
  Cloud,
  LogOut
} from 'lucide-react';
import { VehicleCategory } from '../../types';
import { VehicleFormFields, VehicleFormData } from '../common/VehicleFormFields';
import { triggerHaptic } from '../../utils/haptics';

interface LoginPageProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onClose }) => {
  const { user, login, register, logout, activeLocation, detectLocation } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Mobile navigation drawer toggle for editorial landing
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  // Auth modal toggle for editorial landing page
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regRole, setRegRole] = useState<'customer' | 'mechanic'>('customer');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState(activeLocation.isRealGps ? activeLocation.address : '');

  // Customer vehicle fields
  const [vehicleData, setVehicleData] = useState<VehicleFormData>({
    type: '',
    make: '',
    model: '',
    year: '',
    regNo: '',
    fuelType: ''
  });

  // Mechanic fields
  const [workshopName, setWorkshopName] = useState('');
  const [skills, setSkills] = useState<string[]>([
    'Battery Jumpstart',
    'Tyre Puncture & Replacement',
    'Brake Inspection',
    'Coolant & Hose Repair'
  ]);

  // Sync detected location address into registration address when available
  useEffect(() => {
    if (activeLocation.isRealGps && !regAddress) {
      setRegAddress(activeLocation.address);
    }
  }, [activeLocation]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await login(loginEmail.trim(), loginPassword);
      setSuccessMsg('Authentication successful! Opening Roadfix...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials or account not registered in database.');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regRole === 'customer') {
      if (!vehicleData.type || !vehicleData.make || !vehicleData.model || !vehicleData.regNo) {
        setErrorMsg('Please select vehicle type, manufacturer, model, and enter registration number.');
        return;
      }
    }

    if (regRole === 'mechanic' && !workshopName.trim()) {
      setErrorMsg('Please enter your workshop or mobile service name.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        role: regRole,
        address: regAddress.trim() || activeLocation.address,
        lat: activeLocation.lat,
        lng: activeLocation.lng,
        vehicleType: vehicleData.type || 'car',
        vehicleMake: vehicleData.make,
        vehicleModel: vehicleData.model,
        vehicleYear: vehicleData.year || new Date().getFullYear(),
        vehicleRegNo: vehicleData.regNo.toUpperCase(),
        vehicleFuelType: vehicleData.fuelType || 'petrol',
        workshopName: workshopName.trim(),
        skills
      });

      setSuccessMsg('Account registered in Roadfix database! Entering app...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your inputs.');
      setLoading(false);
    }
  };

  const openAuthWithMode = (newMode: 'login' | 'register') => {
    triggerHaptic('light');
    setMode(newMode);
    setIsAuthModalOpen(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const isLight = theme === 'light';
  const isDark = !isLight;

  return (
    <div className={`${isLight ? 'bg-[#F6F3EE] text-[#111215] paper-texture' : 'bg-[#0C0E14] text-[#F1F5F9] dark-rain-texture'} font-sans selection:bg-[#F59E0B] selection:text-[#111215] overflow-x-hidden antialiased min-h-screen flex flex-col justify-between relative transition-colors duration-200`}>
      
      {/* Top Organic Melt SVG Wave Accent */}
      <div className="w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
        <svg className="w-full h-8 sm:h-12 md:h-16 text-[#F59E0B] fill-current preserve-3d" viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 L1440,0 L1440,24 C1340,54 1210,12 1080,38 C940,66 820,18 700,44 C560,72 440,16 310,48 C180,78 90,32 0,42 Z"></path>
        </svg>
      </div>

      {/* Floating Pill Navigation Bar (Matching uploaded dark reference exactly) */}
      <header className="max-w-6xl mx-auto w-full px-3 sm:px-6 pt-1 pb-4 relative z-30">
        <div className={`w-full px-3.5 py-2 sm:py-2.5 rounded-2xl flex items-center justify-between gap-2 sm:gap-3 transition-all ${
          isDark
            ? 'bg-[#10141D]/90 border border-[#1E2638] shadow-2xl backdrop-blur-md'
            : 'bg-white/95 border-2 border-[#111215] shadow-[3px_3px_0px_#111215]'
        }`}>
          
          {/* Left: Location Pin Pill with Cyan GPS Telematics */}
          <div className="flex items-center gap-2">
            <button
              onClick={detectLocation}
              title="Click to detect current location"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#0E1626] border border-cyan-500/40 text-[#38BDF8] hover:border-cyan-400'
                  : 'bg-white border-2 border-[#111215] text-[#111215] shadow-[2px_2px_0px_#111215]'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#38BDF8]' : 'text-[#FF6B00]'}`} />
              <span className="truncate max-w-[130px] sm:max-w-[210px]">
                {activeLocation?.address || 'Gowdapalem, Chebrolu, Guntur'}
              </span>
            </button>
          </div>

          {/* Center: AI Assistant & AI Damage Tools */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => openAuthWithMode('login')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#121824] border border-[#1E2638] text-slate-300 hover:text-white hover:border-slate-600'
                  : 'bg-white border-2 border-[#111215] text-[#111215] hover:bg-[#EFECE5] shadow-[2px_2px_0px_#111215]'
              }`}
            >
              <Bot className={`w-3.5 h-3.5 ${isDark ? 'text-[#38BDF8]' : 'text-[#111215]'}`} />
              <span>AI Vehicle Assistant</span>
            </button>

            <button
              onClick={() => openAuthWithMode('login')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#121824] border border-[#1E2638] text-amber-400 hover:text-amber-300 hover:border-amber-500/50'
                  : 'bg-white border-2 border-[#111215] text-[#111215] hover:bg-[#EFECE5] shadow-[2px_2px_0px_#111215]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Damage Scan</span>
            </button>
          </div>

          {/* Right: SOS Dispatch + Weather + Theme + Profile/SignOut */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Luminous Red SOS Button */}
            <button
              onClick={() => openAuthWithMode('login')}
              className={`font-headline tracking-wider text-base sm:text-lg px-4 sm:px-6 py-1.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                isDark
                  ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white border border-red-500/60 shadow-[0_0_20px_rgba(229,57,53,0.6)]'
                  : 'btn-amber-hydraulic border-2 border-[#111215]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
              <span>SOS DISPATCH</span>
            </button>

            {/* Weather / Cloud button */}
            <button
              title="Cloud weather telematics radar"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#121824] border border-[#1E2638] text-slate-300 hover:text-white'
                  : 'bg-white border-2 border-[#111215] text-[#111215] shadow-[2px_2px_0px_#111215]'
              }`}
            >
              <Cloud className="w-4 h-4 text-slate-400" />
            </button>

            {/* Sun / Moon Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isDark
                  ? 'bg-[#121824] border border-[#1E2638] text-[#F59E0B] hover:text-[#FBBF24]'
                  : 'bg-white border-2 border-[#111215] text-[#D97706] shadow-[2px_2px_0px_#111215]'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile Pill */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl ${
                  isDark ? 'bg-[#121824] border border-[#1E2638]' : 'bg-white border-2 border-[#111215]'
                }`}>
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {user.name ? user.name[0].toUpperCase() : 'M'}
                  </div>
                  <div className="text-left font-mono text-[11px] leading-tight">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className={isDark ? 'text-slate-200' : 'text-[#111215]'}>{user.name || 'Mithin Boddepalli'}</span>
                      <span className="px-1 py-0.2 bg-blue-600/30 text-blue-400 border border-blue-500/40 text-[9px] rounded uppercase font-semibold">
                        {user.role || 'Customer'}
                      </span>
                    </div>
                    <span className={`text-[9px] truncate max-w-[120px] block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {user.email || 'mithinboddepalliag...'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className={`px-2.5 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'bg-[#121824] border border-[#1E2638] text-slate-300 hover:text-white'
                      : 'bg-white border-2 border-[#111215] text-[#111215] shadow-[2px_2px_0px_#111215]'
                  }`}
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openAuthWithMode('login')}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-xl cursor-pointer ${
                    isDark ? 'bg-[#121824] border border-[#1E2638] hover:border-slate-500' : 'bg-white border-2 border-[#111215] shadow-[2px_2px_0px_#111215]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    M
                  </div>
                  <div className="hidden sm:block text-left font-mono text-[11px] leading-tight">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className={isDark ? 'text-slate-200' : 'text-[#111215]'}>Mithin Boddepalli</span>
                      <span className="px-1 py-0.2 bg-blue-600/30 text-blue-400 border border-blue-500/40 text-[9px] rounded uppercase font-semibold">
                        Customer
                      </span>
                    </div>
                    <span className={`text-[9px] truncate max-w-[120px] block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      mithinboddepalliag...
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => openAuthWithMode('login')}
                  className={`px-2.5 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'bg-[#121824] border border-[#1E2638] text-slate-300 hover:text-white'
                      : 'bg-white border-2 border-[#111215] text-[#111215] shadow-[2px_2px_0px_#111215]'
                  }`}
                  title="Sign In"
                >
                  <LogOut className="w-3.5 h-3.5 rotate-180" />
                  <span className="hidden md:inline">Sign In</span>
                </button>
              </div>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className={`p-1.5 rounded-xl cursor-pointer ${
                  isDark ? 'bg-[#121824] border border-[#1E2638] text-slate-400 hover:text-white' : 'border-2 border-[#111215] rounded-lg bg-white text-[#111215]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-5 sm:px-8 py-6 md:py-12">
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
          
          {/* Left Editorial Column */}
          <div className="lg:col-span-7 space-y-4 text-left">
            {/* Floating handwritten sticker */}
            <div className="inline-block relative">
              <span className="inline-block bg-[#F59E0B] text-[#111215] font-hand text-2xl md:text-3xl font-bold px-4 py-1 rounded-sm shadow-[3px_3px_0px_#000000] rotate-[-2deg] select-none">
                Emergency breakdown rescue • zero panic!
              </span>
            </div>

            {/* Huge Condensed Headline (Matching Poster Reference) */}
            <h1 className="font-headline text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.88] tracking-tight uppercase select-none">
              <span className={isDark ? 'text-white' : 'text-[#111215]'}>A NEW ERA</span><br />
              <span className={isDark ? 'text-white/20' : 'text-[#111215]/30'}>IN ROADSIDE</span><br />
              <span className="relative inline-block">
                <span className={isDark ? 'text-white' : 'text-[#111215]'}>ASSISTANCE.</span>
                {/* Handwritten sub-note pinned to text */}
                <span className="font-hand text-[#FF6B00] text-3xl sm:text-4xl absolute -right-2 sm:-right-16 bottom-0 rotate-[6deg] lowercase pointer-events-none font-bold">
                  ~ 15-min arrival
                </span>
              </span>
            </h1>

            {/* Subheading row with Ask Gemini Pill */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className={`font-mono text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-[#111215]/80'} max-w-xl leading-relaxed`}>
                Emergency Vehicle Breakdown Rescue, Certified Mechanics &amp; Smart Telematics Dispatch. 
                Instant photo/audio diagnostics with Aadhaar &amp; driving-licence verified mechanics on 24/7 radar.
              </p>
              <button
                onClick={() => openAuthWithMode('login')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto ${
                  isDark
                    ? 'bg-[#161C28] hover:bg-[#1E2638] text-slate-300 border border-[#2A354C]'
                    : 'bg-white hover:bg-slate-100 text-[#111215] border-2 border-[#111215] shadow-[2px_2px_0px_#111215]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Ask Gemini</span>
              </button>
            </div>

            {/* CTA cluster with tactile hydraulics */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => openAuthWithMode('login')}
                className={`font-headline text-2xl tracking-wide px-8 py-3.5 rounded-lg flex items-center gap-3 cursor-pointer transition-transform active:translate-y-0.5 ${
                  isDark
                    ? 'bg-[#F59E0B] hover:bg-[#FBBF24] text-[#111215] font-black border-2 border-[#F59E0B] shadow-[4px_4px_0px_#000000]'
                    : 'btn-hydraulic bg-[#111215] text-white border-2 border-[#111215]'
                }`}
              >
                <span>SIGN IN &amp; OPEN ROADFIX</span>
                <span className={isDark ? 'text-[#111215]' : 'text-[#F59E0B]'}>&rarr;</span>
              </button>
              <button
                onClick={() => openAuthWithMode('register')}
                className={`px-6 py-3.5 font-mono text-xs uppercase font-bold rounded-lg active:translate-y-0.5 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#121824] hover:bg-[#1A2332] text-white border-2 border-[#1E2638] shadow-[3px_3px_0px_#000000]'
                    : 'bg-white border-2 border-[#111215] text-[#111215] hover:bg-[#EFECE5] shadow-[3px_3px_0px_#111215]'
                }`}
              >
                REGISTER NEW ACCOUNT
              </button>
            </div>

            {/* Metric Badges */}
            <div className={`pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl border-t-2 border-dashed ${
              isDark ? 'border-[#1E2638]' : 'border-[#111215]/20'
            }`}>
              <div className={`p-2.5 rounded ${
                isDark ? 'bg-[#121824] border border-[#1E2638] shadow-[2px_2px_0px_#000000]' : 'bg-white border-2 border-[#111215] shadow-[2px_2px_0px_#111215]'
              }`}>
                <span className="font-headline text-2xl text-[#FF6B00] block leading-none">15 MIN</span>
                <span className={`font-mono text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-[#111215]/70'}`}>Avg. Metro Dispatch</span>
              </div>
              <div className={`p-2.5 rounded ${
                isDark ? 'bg-[#121824] border border-[#1E2638] shadow-[2px_2px_0px_#000000]' : 'bg-white border-2 border-[#111215] shadow-[2px_2px_0px_#111215]'
              }`}>
                <span className={`font-headline text-2xl block leading-none ${isDark ? 'text-white' : 'text-[#111215]'}`}>100%</span>
                <span className={`font-mono text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-[#111215]/70'}`}>Verified Mechanics</span>
              </div>
              <div className={`p-2.5 rounded ${
                isDark ? 'bg-[#121824] border border-[#1E2638] shadow-[2px_2px_0px_#000000]' : 'bg-white border-2 border-[#111215] shadow-[2px_2px_0px_#111215]'
              }`}>
                <span className="font-headline text-2xl text-amber-500 block leading-none">ZERO</span>
                <span className={`font-mono text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-[#111215]/70'}`}>Hidden Markups</span>
              </div>
              <div className={`p-2.5 rounded ${
                isDark ? 'bg-[#121824] border border-[#1E2638] shadow-[2px_2px_0px_#000000]' : 'bg-white border-2 border-[#111215] shadow-[2px_2px_0px_#111215]'
              }`}>
                <span className="font-headline text-2xl text-emerald-500 block leading-none">24 / 7</span>
                <span className={`font-mono text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-[#111215]/70'}`}>Telematics Active</span>
              </div>
            </div>
          </div>

          {/* Right Graphic / Mascot Packaging Container */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Background organic glow */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#F59E0B]/20 filter blur-3xl -z-10"></div>
            
            {/* Mascot 3D Display Box with exact yellow offset frame */}
            <div
              onClick={() => openAuthWithMode('login')}
              className={`relative w-full max-w-md rounded-2xl p-6 transition-transform duration-300 cursor-pointer text-left ${
                isDark
                  ? 'bg-[#121824] border-2 border-[#1E293B] shadow-[8px_8px_0px_#F59E0B] transform hover:rotate-0'
                  : 'bg-white border-4 border-[#111215] shadow-[10px_10px_0px_#111215] transform rotate-[1.5deg] hover:rotate-0'
              }`}
            >
              
              {/* Top Carton Lid / Brand Badge */}
              <div className={`flex justify-between items-center pb-4 border-b-2 ${
                isDark ? 'border-[#1E2638]' : 'border-[#111215]'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF6B00] border border-[#111215]"></span>
                  <span className={`font-mono text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#111215]'}`}>
                    PACK NO. RF-9001
                  </span>
                </div>
                <span className="font-hand text-xl font-bold text-[#F59E0B]">Pure Roadside Relief</span>
              </div>

              {/* Mascot Illustration */}
              <div className="py-6 flex flex-col items-center justify-center relative">
                
                <div className="relative w-56 h-56 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="100" r="75" fill={isDark ? "#182030" : "#FAF5E9"} stroke={isDark ? "#0F172A" : "#111215"} strokeWidth="4"/>
                    <path d="M42 90 C42 55, 158 55, 158 90 Z" fill="#F59E0B" stroke={isDark ? "#0F172A" : "#111215"} strokeWidth="4"/>
                    <path d="M30 90 L170 90" stroke={isDark ? "#0F172A" : "#111215"} strokeWidth="4" strokeLinecap="round"/>
                    
                    <circle cx="75" cy="115" r="14" fill="#FFFFFF" stroke={isDark ? "#0F172A" : "#111215"} strokeWidth="3"/>
                    <circle cx="78" cy="115" r="7" fill="#111215"/>
                    <circle cx="81" cy="112" r="2.5" fill="#FFFFFF"/>

                    <circle cx="125" cy="115" r="14" fill="#FFFFFF" stroke={isDark ? "#0F172A" : "#111215"} strokeWidth="3"/>
                    <circle cx="122" cy="115" r="7" fill="#111215"/>
                    <circle cx="125" cy="112" r="2.5" fill="#FFFFFF"/>

                    <path d="M92 130 Q100 148 108 130 Z" fill="#FF6B00" stroke={isDark ? "#0F172A" : "#111215"} strokeWidth="3"/>
                    
                    <path d="M60 148 L140 148" stroke={isDark ? "#0F172A" : "#111215"} strokeWidth="5" strokeLinecap="round"/>
                    <path d="M56 142 L66 142 M56 154 L66 154" stroke={isDark ? "#0F172A" : "#111215"} strokeWidth="4"/>
                    <path d="M134 142 L144 142 M134 154 L144 154" stroke={isDark ? "#0F172A" : "#111215"} strokeWidth="4"/>
                    
                    <circle cx="100" cy="72" r="4" fill={isDark ? "#0F172A" : "#111215"}/>
                  </svg>

                  {/* Speech badge */}
                  <div className="absolute -top-3 -right-2 bg-[#F59E0B] text-black px-3 py-1 rounded-full font-mono text-[10px] font-bold tracking-widest uppercase border border-amber-600 shadow-md">
                    DISPATCH &bull;48 READY
                  </div>
                </div>

                {/* Dotted Box below mascot */}
                <div className={`w-full rounded-xl p-3 mt-4 text-center border-2 border-dashed ${
                  isDark
                    ? 'bg-[#F59E0B]/5 border-[#F59E0B]/70'
                    : 'bg-[#F59E0B]/15 border-[#FF6B00]'
                }`}>
                  <span className={`font-headline text-3xl tracking-wide block ${isDark ? 'text-white' : 'text-[#111215]'}`}>
                    ROAD RESCUE IN A TAP
                  </span>
                  <span className="font-hand text-xl text-[#F59E0B] font-bold -mt-1 block">
                    no subscriptions needed
                  </span>
                </div>
              </div>

              {/* Technical Specs Footer inside Card */}
              <div className={`pt-4 border-t-2 flex items-center justify-between ${
                isDark ? 'border-[#1E2638]' : 'border-[#111215]'
              }`}>
                <div className="space-y-1">
                  <div className={`h-6 w-36 border ${
                    isDark ? 'barcode-lines-dark border-slate-700' : 'barcode-lines border-[#111215]/20'
                  }`}></div>
                  <span className={`font-mono text-[9px] tracking-widest block font-bold ${
                    isDark ? 'text-slate-400' : 'text-[#111215]/70'
                  }`}>
                    TELEMATICS: 4820 1316 6088
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-mono text-[9px] uppercase tracking-wider block font-bold ${
                    isDark ? 'text-slate-500' : 'text-[#111215]/50'
                  }`}>
                    NETWORK REGION
                  </span>
                  <span className={`font-mono text-xs font-bold ${isDark ? 'text-white' : 'text-[#111215]'}`}>
                    PAN-INDIA 24/7
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* GIANT EDITORIAL TYPOGRAPHY WALL */}
        <section className={`mt-20 sm:mt-28 pt-10 border-t-4 relative text-left ${
          isDark ? 'border-[#1E2638]' : 'border-[#111215]'
        }`}>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-4">
            <span className={`font-hand text-3xl sm:text-5xl font-bold rotate-[-2deg] mb-2 md:mb-0 ${
              isDark ? 'text-white' : 'text-[#111215]'
            }`}>
              Ways of Rescue:
            </span>
            <span className={`font-mono text-xs uppercase tracking-widest font-bold ${
              isDark ? 'text-slate-400' : 'text-[#111215]/70'
            }`}>
              FIELD CAPABILITY SPECIFICATION // ALL-TERRAIN COVERAGE
            </span>
          </div>

          {/* Giant Stacked Typographic Block */}
          <div className="font-headline text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] leading-[0.82] uppercase tracking-tight font-black select-none">
            <div className="hover:text-[#FF6B00] transition-colors duration-200">
              FOR STRANDED
            </div>
            <div className="photo-masked-text w-full">
              MOTORISTS &bull;
            </div>
            <div className={`hover:tracking-wider transition-all duration-300 ${
              isDark ? 'text-white' : 'text-[#111215]'
            }`}>
              HIGHWAY BREAKDOWNS &bull;
            </div>
            <div className={`hover:text-[#FF6B00] transition-colors duration-200 ${
              isDark ? 'text-white/20' : 'text-[#111215]/25'
            }`}>
              COMMERCIAL FLEETS &bull;
            </div>
            <div className="text-[#F59E0B]">
              EV BATTERY JUMPS.
            </div>
          </div>
        </section>

        {/* TECHNICAL SPECIFICATION SHEET & 5-ICON ROW */}
        <section id="specs" className={`mt-16 sm:mt-24 pt-8 border-t-2 grid grid-cols-1 md:grid-cols-12 gap-8 text-left ${
          isDark ? 'border-[#1E2638]' : 'border-[#111215]/20'
        }`}>
          
          {/* Left specs list */}
          <div className="md:col-span-5 space-y-4">
            <h3 className={`font-headline text-3xl sm:text-4xl uppercase tracking-wide ${
              isDark ? 'text-white' : 'text-[#111215]'
            }`}>
              SLA &amp; DISPATCH CONDITIONS
            </h3>
            
            <p className="font-mono text-xs font-bold text-[#FF6B00]">
              AVERAGE ETA &le; 15 MINUTES IN METRO RADAR (&plusmn; 3 MIN WEATHER VARIANCE)
            </p>

            <p className={`font-mono text-xs leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-[#111215]/80'
            }`}>
              Upon SOS trigger, GPS telematics locks coordinate telemetry. Nearest certified technician is reserved exclusively. Live audio fault recording forecasts required tools prior to mechanic roll-out.
            </p>

            <p className={`font-mono text-xs italic ${
              isDark ? 'text-slate-500' : 'text-[#111215]/60'
            }`}>
              * Transparent customer approval required for spare parts prior to invoice generation.
            </p>
          </div>

          {/* Middle Barcode Stamp Block */}
          <div className="md:col-span-4 space-y-3 font-mono text-xs">
            <div>
              <span className={`block text-[10px] uppercase font-bold ${
                isDark ? 'text-slate-400' : 'text-[#111215]/50'
              }`}>BAR CODE OF SERVICE PROTOCOL</span>
              <span className="font-bold text-[#FF6B00] text-sm tracking-wider">4820 1316 6088 (ISO 9001)</span>
            </div>

            <div>
              <span className={`block text-[10px] uppercase font-bold ${
                isDark ? 'text-slate-400' : 'text-[#111215]/50'
              }`}>RADAR ENCRYPTION KEY</span>
              <span className="font-bold text-[#FF6B00] text-sm tracking-wider">SEC-ROADFIX-TLS-1.3</span>
            </div>

            <div className="pt-2">
              <span className={`block text-[10px] uppercase font-bold ${
                isDark ? 'text-slate-400' : 'text-[#111215]/50'
              }`}>DIRECT DATABASE INTEGRATION</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-[#111215]'}`}>Registered Vehicle Owners &amp; Mechanics Portal</span>
            </div>
          </div>

          {/* Right 5-Icon ISO Quality Stamps */}
          <div className="md:col-span-3 flex md:flex-col justify-end items-end gap-3">
            <div className={`inline-flex border-2 divide-x-2 rounded-md overflow-hidden ${
              isDark
                ? 'bg-[#121824] border-[#1E2638] divide-[#1E2638] shadow-[3px_3px_0px_#000000]'
                : 'bg-white border-[#111215] divide-[#111215] shadow-[3px_3px_0px_#111215]'
            }`}>
              <div className="w-10 h-10 flex items-center justify-center p-2 hover:bg-[#F59E0B] transition-colors" title="Tool Dispatch">
                <Wrench className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-[#111215]'}`} />
              </div>
              <div className="w-10 h-10 flex items-center justify-center p-2 hover:bg-[#F59E0B] transition-colors" title="Live Telematics">
                <MapPin className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-[#111215]'}`} />
              </div>
              <div className="w-10 h-10 flex items-center justify-center p-2 hover:bg-[#F59E0B] transition-colors" title="100% Certified">
                <Award className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-[#111215]'}`} />
              </div>
              <div className="w-10 h-10 flex items-center justify-center p-2 hover:bg-[#F59E0B] transition-colors" title="Emergency Rescue">
                <Car className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-[#111215]'}`} />
              </div>
              <div className="w-10 h-10 flex items-center justify-center p-2 hover:bg-[#F59E0B] transition-colors" title="Verified Guarantee">
                <Shield className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-[#111215]'}`} />
              </div>
            </div>
            <span className={`font-mono text-[9px] text-right uppercase tracking-widest block font-bold ${
              isDark ? 'text-slate-400' : 'text-[#111215]/60'
            }`}>
              MINISTRY APPROVED ASSISTANCE PROTOCOL
            </span>
          </div>

        </section>

        {/* INTERACTIVE 4-PILLAR FEATURE CARDS */}
        <section className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className={`p-5 rounded-xl transition-all ${
            isDark
              ? 'bg-[#121824] border border-[#1E2638] shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#F59E0B] hover:border-[#F59E0B]/50 hover:-translate-y-1'
              : 'bg-white border-2 border-[#111215] shadow-[4px_4px_0px_#111215] hover:shadow-[6px_6px_0px_#F59E0B] hover:-translate-y-1'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <span className={`font-headline text-3xl ${isDark ? 'text-white' : 'text-[#111215]'}`}>01</span>
              <span className="p-1.5 px-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400 font-bold text-xs font-mono">⚡ FAST</span>
            </div>
            <h4 className={`font-headline text-2xl uppercase tracking-wide ${isDark ? 'text-white' : 'text-[#111215]'}`}>15-Min Fast Arrival</h4>
            <p className={`font-mono text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-[#111215]/70'}`}>Automated dispatch assigns closest qualified mechanic via live GPS radar.</p>
          </div>

          <div className={`p-5 rounded-xl transition-all ${
            isDark
              ? 'bg-[#121824] border border-[#1E2638] shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#F59E0B] hover:border-[#F59E0B]/50 hover:-translate-y-1'
              : 'bg-white border-2 border-[#111215] shadow-[4px_4px_0px_#111215] hover:shadow-[6px_6px_0px_#F59E0B] hover:-translate-y-1'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <span className={`font-headline text-3xl ${isDark ? 'text-white' : 'text-[#111215]'}`}>02</span>
              <span className="p-1.5 px-2 bg-blue-500/20 border border-blue-500/40 rounded-lg text-blue-400 font-bold text-xs font-mono">🤖 SMART</span>
            </div>
            <h4 className={`font-headline text-2xl uppercase tracking-wide ${isDark ? 'text-white' : 'text-[#111215]'}`}>AI Diagnosis Engine</h4>
            <p className={`font-mono text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-[#111215]/70'}`}>Instant audio &amp; photo engine breakdown analysis and tool forecasting.</p>
          </div>

          <div className={`p-5 rounded-xl transition-all ${
            isDark
              ? 'bg-[#121824] border border-[#1E2638] shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#F59E0B] hover:border-[#F59E0B]/50 hover:-translate-y-1'
              : 'bg-white border-2 border-[#111215] shadow-[4px_4px_0px_#111215] hover:shadow-[6px_6px_0px_#F59E0B] hover:-translate-y-1'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <span className={`font-headline text-3xl ${isDark ? 'text-white' : 'text-[#111215]'}`}>03</span>
              <span className="p-1.5 px-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-400 font-bold text-xs font-mono">🛡️ 100% ID</span>
            </div>
            <h4 className={`font-headline text-2xl uppercase tracking-wide ${isDark ? 'text-white' : 'text-[#111215]'}`}>Certified Pros</h4>
            <p className={`font-mono text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-[#111215]/70'}`}>Aadhaar &amp; commercial driving licence verified professional technicians.</p>
          </div>

          <div className={`p-5 rounded-xl transition-all ${
            isDark
              ? 'bg-[#121824] border border-[#1E2638] shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#F59E0B] hover:border-[#F59E0B]/50 hover:-translate-y-1'
              : 'bg-white border-2 border-[#111215] shadow-[4px_4px_0px_#111215] hover:shadow-[6px_6px_0px_#F59E0B] hover:-translate-y-1'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <span className={`font-headline text-3xl ${isDark ? 'text-white' : 'text-[#111215]'}`}>04</span>
              <span className="p-1.5 px-2 bg-purple-500/20 border border-purple-500/40 rounded-lg text-purple-400 font-bold text-xs font-mono">🏷️ FAIR</span>
            </div>
            <h4 className={`font-headline text-2xl uppercase tracking-wide ${isDark ? 'text-white' : 'text-[#111215]'}`}>Zero Hidden Charges</h4>
            <p className={`font-mono text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-[#111215]/70'}`}>Clear customer pre-approval for spare parts with certified digital invoices.</p>
          </div>
        </section>

      </main>

      {/* BOTTOM WAVY DRIP ACCENT FOOTER */}
      <footer className="w-full mt-16 relative overflow-hidden select-none">
        <div className={`max-w-7xl mx-auto px-5 sm:px-8 pb-6 flex flex-col sm:flex-row items-center justify-between font-mono text-xs border-t-2 pt-6 ${
          isDark ? 'border-[#1E2638] text-slate-400' : 'border-[#111215]/20 text-[#111215]/70'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`font-bold ${isDark ? 'text-white' : 'text-[#111215]'}`}>&copy; 2026 Roadfix</span>
            <span>&bull;</span>
            <span>Emergency Breakdown &amp; Verified Mechanic Network</span>
          </div>
          <div className="flex items-center gap-4 mt-3 sm:mt-0 font-bold">
            <span>ISO 9001 Certified Dispatch</span>
            <span>&bull;</span>
            <span className="text-[#FF6B00]">Pan-India Support: 112 / 1033</span>
          </div>
        </div>

        {/* Organic Dripping Yellow Melt Border */}
        <div className="w-full leading-none fill-current text-[#F59E0B]">
          <svg className="w-full h-10 sm:h-16 md:h-20" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,45 C200,90 350,15 520,60 C700,105 880,20 1060,65 C1240,110 1380,30 1440,75 L1440,80 L0,80 Z" fill="#F59E0B"></path>
          </svg>
        </div>
        <div className="bg-[#F59E0B] h-6 w-full"></div>
      </footer>

      {/* INTERACTIVE AUTH MODAL (Connected directly to database) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D1C]/80 backdrop-blur-sm overflow-y-auto" onClick={() => setIsAuthModalOpen(false)}>
          <div className={`rounded-2xl p-6 sm:p-8 max-w-lg w-full relative text-left my-auto ${
            isDark
              ? 'bg-[#10141D] border-2 border-[#1E2638] text-white shadow-[12px_12px_0px_#000000]'
              : 'bg-[#F6F3EE] border-4 border-[#111215] text-[#111215] shadow-[12px_12px_0px_#111215]'
          }`} onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className={`absolute top-4 right-4 w-9 h-9 rounded-md flex items-center justify-center font-mono font-bold transition-all cursor-pointer ${
                isDark
                  ? 'border border-[#1E2638] bg-[#121824] text-slate-300 hover:text-white hover:border-slate-500'
                  : 'border-2 border-[#111215] bg-white text-[#111215] hover:bg-[#111215] hover:text-white shadow-[2px_2px_0px_#111215]'
              }`}
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <span className={`inline-block px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider rounded-full mb-2 ${
                isDark
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-[#FACC15] text-[#111215] border-2 border-[#111215]'
              }`}>
                CONNECTED TO ROADFIX DATABASE
              </span>
              <h2 className={`font-headline text-4xl uppercase tracking-tight ${isDark ? 'text-white' : 'text-[#111215]'}`}>
                {mode === 'login' ? 'Sign In to Roadfix' : 'Create Your Roadfix Account'}
              </h2>
              <p className={`font-mono text-xs ${isDark ? 'text-slate-400' : 'text-[#111215]/70'}`}>
                {mode === 'login'
                  ? 'Access your registered vehicles, roadside bookings & service history.'
                  : 'Register as a vehicle owner or service mechanic in the Roadfix database.'}
              </p>
            </div>

            {/* Tab Selector */}
            <div className={`grid grid-cols-2 gap-2 p-1.5 rounded-lg mb-6 font-mono text-xs font-bold uppercase ${
              isDark ? 'bg-[#0A0D14] border border-[#1E2638]' : 'bg-[#111215]/10 border-2 border-[#111215]'
            }`}>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`py-2.5 rounded-md border transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#F59E0B] text-[#111215] border-[#111215] font-black shadow-md'
                    : isDark ? 'text-slate-400 border-transparent hover:text-white' : 'text-[#111215]/70 border-transparent hover:text-[#111215]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setMode('register');
                  setErrorMsg(null);
                }}
                className={`py-2.5 rounded-md border transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-[#F59E0B] text-[#111215] border-[#111215] font-black shadow-md'
                    : isDark ? 'text-slate-400 border-transparent hover:text-white' : 'text-[#111215]/70 border-transparent hover:text-[#111215]'
                }`}
              >
                Register New Account
              </button>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 rounded-lg text-red-200 font-mono text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 font-mono text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Login Form */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className={`block font-mono text-xs uppercase font-bold mb-1 ${
                    isDark ? 'text-slate-300' : 'text-[#111215]'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. mithin@example.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg font-mono text-xs focus:outline-none ${
                        isDark
                          ? 'bg-[#121824] border border-[#1E2638] text-white focus:border-[#F59E0B]'
                          : 'bg-white border-2 border-[#111215] text-[#111215] shadow-[2px_2px_0px_#111215]'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block font-mono text-xs uppercase font-bold mb-1 ${
                    isDark ? 'text-slate-300' : 'text-[#111215]'
                  }`}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter account password"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-lg font-mono text-xs focus:outline-none ${
                        isDark
                          ? 'bg-[#121824] border border-[#1E2638] text-white focus:border-[#F59E0B]'
                          : 'bg-white border-2 border-[#111215] text-[#111215] shadow-[2px_2px_0px_#111215]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-amber-hydraulic font-headline text-2xl tracking-wider py-3.5 rounded-xl border-2 border-[#111215] font-bold flex justify-center items-center gap-2 cursor-pointer mt-2"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Roadfix →'}</span>
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <div>
                  <label className={`block font-mono text-xs uppercase font-bold mb-1 ${
                    isDark ? 'text-slate-300' : 'text-[#111215]'
                  }`}>Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setRegRole('customer');
                      }}
                      className={`py-2 px-3 rounded-lg border font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                        regRole === 'customer'
                          ? 'bg-[#F59E0B] text-[#111215] border-[#111215] shadow-sm'
                          : isDark ? 'bg-[#121824] border-[#1E2638] text-slate-400' : 'bg-white border-2 border-[#111215] text-[#111215]'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Customer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setRegRole('mechanic');
                      }}
                      className={`py-2 px-3 rounded-lg border font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                        regRole === 'mechanic'
                          ? 'bg-[#F59E0B] text-[#111215] border-[#111215] shadow-sm'
                          : isDark ? 'bg-[#121824] border-[#1E2638] text-slate-400' : 'bg-white border-2 border-[#111215] text-[#111215]'
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Mechanic</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block font-mono text-xs uppercase font-bold mb-1 ${
                    isDark ? 'text-slate-300' : 'text-[#111215]'
                  }`}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Mithin Boddepalli"
                    className={`w-full px-4 py-2 rounded-lg font-mono text-xs focus:outline-none ${
                      isDark
                        ? 'bg-[#121824] border border-[#1E2638] text-white focus:border-[#F59E0B]'
                        : 'bg-white border-2 border-[#111215] text-[#111215] shadow-[2px_2px_0px_#111215]'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className={`block font-mono text-xs uppercase font-bold mb-1 ${
                      isDark ? 'text-slate-300' : 'text-[#111215]'
                    }`}>Email</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. mithin@example.com"
                      className={`w-full px-3 py-2 rounded-lg font-mono text-xs focus:outline-none ${
                        isDark
                          ? 'bg-[#121824] border border-[#1E2638] text-white focus:border-[#F59E0B]'
                          : 'bg-white border-2 border-[#111215] text-[#111215] shadow-[2px_2px_0px_#111215]'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block font-mono text-xs uppercase font-bold mb-1 ${
                      isDark ? 'text-slate-300' : 'text-[#111215]'
                    }`}>Phone</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className={`w-full px-3 py-2 rounded-lg font-mono text-xs focus:outline-none ${
                        isDark
                          ? 'bg-[#121824] border border-[#1E2638] text-white focus:border-[#F59E0B]'
                          : 'bg-white border-2 border-[#111215] text-[#111215] shadow-[2px_2px_0px_#111215]'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block font-mono text-xs uppercase font-bold mb-1 ${
                    isDark ? 'text-slate-300' : 'text-[#111215]'
                  }`}>Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className={`w-full px-4 py-2 rounded-lg font-mono text-xs focus:outline-none ${
                      isDark
                        ? 'bg-[#121824] border border-[#1E2638] text-white focus:border-[#F59E0B]'
                        : 'bg-white border-2 border-[#111215] text-[#111215] shadow-[2px_2px_0px_#111215]'
                    }`}
                  />
                </div>

                {regRole === 'customer' && (
                  <div className={`pt-2 border-t ${isDark ? 'border-[#1E2638]' : 'border-[#111215]/20'}`}>
                    <VehicleFormFields
                      data={vehicleData}
                      onChange={(data: VehicleFormData) => setVehicleData(data)}
                    />
                  </div>
                )}

                {regRole === 'mechanic' && (
                  <div>
                    <label className={`block font-mono text-xs uppercase font-bold mb-1 ${
                      isDark ? 'text-slate-300' : 'text-[#111215]'
                    }`}>Workshop Name</label>
                    <input
                      type="text"
                      required
                      value={workshopName}
                      onChange={(e) => setWorkshopName(e.target.value)}
                      placeholder="e.g. Apex Emergency Auto Garage"
                      className={`w-full px-4 py-2.5 rounded-lg font-mono text-xs focus:outline-none ${
                        isDark
                          ? 'bg-[#121824] border border-[#1E2638] text-white focus:border-[#F59E0B]'
                          : 'bg-white border-2 border-[#111215] text-[#111215] shadow-[2px_2px_0px_#111215]'
                      }`}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-amber-hydraulic font-headline text-2xl tracking-wider py-3.5 rounded-xl border-2 border-[#111215] font-bold flex justify-center items-center gap-2 cursor-pointer mt-2"
                >
                  <span>{loading ? 'Registering...' : 'Create Account & Connect →'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

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
  AlertTriangle
} from 'lucide-react';
import { VehicleCategory } from '../../types';
import { VehicleFormFields, VehicleFormData } from '../common/VehicleFormFields';
import { triggerHaptic } from '../../utils/haptics';

interface LoginPageProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onClose }) => {
  const { login, register, activeLocation, detectLocation } = useAuth();
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

  /* =========================================================================
     LIGHT THEME: ROADFIX EDITORIAL PARCHMENT THEME
     Matches user-provided poster specifications exactly:
     Warm parchment background (#F6F3EE), organic yellow melt SVG wave,
     Bebas Neue condensed headlines, Caveat handwritten accents, Space Mono,
     and tactile hydraulic buttons with solid offset drop shadows.
     ========================================================================= */
  if (isLight) {
    return (
      <div className="bg-[#F6F3EE] text-[#111215] font-sans selection:bg-[#F59E0B] selection:text-[#111215] overflow-x-hidden antialiased min-h-screen flex flex-col justify-between relative transition-colors duration-200">
        
        {/* Top Organic Melt SVG Wave Accent */}
        <div className="w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
          <svg className="w-full h-8 sm:h-12 md:h-16 text-[#F59E0B] fill-current preserve-3d" viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0 L1440,0 L1440,24 C1340,54 1210,12 1080,38 C940,66 820,18 700,44 C560,72 440,16 310,48 C180,78 90,32 0,42 Z"></path>
          </svg>
        </div>

        {/* Editorial Top Bar */}
        <header className="max-w-7xl mx-auto w-full px-5 sm:px-8 pt-2 pb-5 flex items-center justify-between border-b-2 border-[#111215]/15">
          <div className="flex items-center gap-4">
            {/* Minimalist menu toggle button */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label="Toggle Navigation"
              className="w-11 h-11 border-2 border-[#111215] rounded-lg bg-white flex flex-col justify-center items-center gap-1.5 hover:bg-[#111215] hover:text-white transition-colors duration-150 active:scale-95 shadow-[2px_2px_0px_#111215]"
            >
              <span className="w-5 h-0.5 bg-current"></span>
              <span className="w-5 h-0.5 bg-current"></span>
            </button>

            {/* Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/90 border-2 border-[#111215] rounded-full font-mono text-xs font-bold text-[#111215] shadow-[2px_2px_0px_#111215]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              ROADFIX FLEET NETWORK &bull; <span className="text-amber-600 font-bold">LIVE (METRO)</span>
            </div>
          </div>

          {/* Center Brand Typographic Mark */}
          <button onClick={() => {}} className="text-center group cursor-pointer">
            <span className="font-headline tracking-tight text-4xl sm:text-5xl font-black uppercase block leading-none transition-transform group-hover:scale-105">
              ROAD<span className="text-[#FF6B00]">FIX</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#111215]/70 block mt-0.5 font-bold">
              24/7 Smart Telematics Rescue
            </span>
          </button>

          {/* Right SOS, Theme Toggle & Auth Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title="Switch to Dark Theme (Midnight Garage)"
              aria-label="Switch to Dark Theme (Midnight Garage)"
              className="w-10 h-10 border-2 border-[#111215] bg-white rounded-lg flex items-center justify-center text-[#F59E0B] hover:bg-[#111215] hover:text-[#FBBF24] transition-all shadow-[2px_2px_0px_#111215] active:scale-95"
            >
              <Moon className="w-4 h-4 text-[#D97706]" />
            </button>

            <button
              onClick={() => openAuthWithMode('login')}
              className="hidden md:inline-flex px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase border-2 border-[#111215] bg-white rounded-lg hover:bg-[#111215] hover:text-white transition-all shadow-[2px_2px_0px_#111215] active:scale-95 cursor-pointer"
            >
              Sign In
            </button>

            <button
              onClick={() => openAuthWithMode('login')}
              className="btn-amber-hydraulic font-headline tracking-wider text-base sm:text-lg px-4 sm:px-6 py-2 rounded-lg font-bold flex items-center gap-2 border-2 border-[#111215] cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 fill-current animate-bounce" />
              <span>SOS DISPATCH</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 border-2 border-[#111215] rounded-lg bg-white text-[#111215] hover:bg-[#111215] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Mobile Drawer / Quick Links */}
        {isMobileNavOpen && (
          <div className="max-w-7xl mx-auto w-full px-6 py-4 bg-[#EFECE5] border-b-2 border-[#111215] animate-in fade-in">
            <div className="flex flex-col gap-3 font-mono text-xs uppercase font-bold">
              <button onClick={() => openAuthWithMode('login')} className="text-left hover:text-[#FF6B00] transition-colors py-1">
                01 / Emergency Breakdown Service &amp; Sign In
              </button>
              <button onClick={() => openAuthWithMode('register')} className="text-left hover:text-[#FF6B00] transition-colors py-1">
                02 / Register Vehicle or Workshop
              </button>
              <a href="#specs" onClick={() => setIsMobileNavOpen(false)} className="hover:text-[#FF6B00] transition-colors py-1">
                03 / Telematics &amp; Arrival Specs
              </a>
              <div className="pt-2 border-t border-[#111215]/20 flex items-center justify-between">
                <span>Pan-India Emergency SOS:</span>
                <span className="font-bold text-red-600">112 / 1033</span>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto w-full px-5 sm:px-8 py-8 md:py-14">
          {/* HERO SECTION */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            
            {/* Left Editorial Column */}
            <div className="lg:col-span-7 space-y-4 text-left">
              {/* Floating handwritten sticker */}
              <div className="inline-block relative">
                <span className="inline-block bg-[#FACC15] text-[#111215] font-hand text-2xl md:text-3xl font-bold px-4 py-1 rounded-sm shadow-[3px_3px_0px_#111215] rotate-[-3deg] border-2 border-[#111215] select-none">
                  Emergency vehicle rescue, zero panic!
                </span>
              </div>

              {/* Huge Condensed Headline (Matching Poster Reference) */}
              <h1 className="font-headline text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.88] tracking-tight text-[#111215] uppercase select-none">
                A NEW ERA<br />
                <span className="text-[#111215]/30">IN ROADSIDE</span><br />
                <span className="relative inline-block">
                  ASSISTANCE.
                  {/* Small handwritten sub-note pinned to text */}
                  <span className="font-hand text-[#FF6B00] text-3xl sm:text-4xl absolute -right-2 sm:-right-16 bottom-0 rotate-[6deg] lowercase pointer-events-none font-bold">
                    ~ 15-min arrival
                  </span>
                </span>
              </h1>

              {/* Subheading Matter directly from app */}
              <p className="font-mono text-sm sm:text-base text-[#111215]/80 max-w-xl pt-2 leading-relaxed">
                Emergency Vehicle Breakdown Rescue, Certified Mechanics &amp; Smart Telematics Dispatch. 
                Instant photo/audio diagnostics with Aadhaar &amp; driving-licence verified mechanics on metro radar.
              </p>

              {/* CTA cluster with tactile hydraulics */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => openAuthWithMode('login')}
                  className="btn-hydraulic bg-[#111215] text-white font-headline text-2xl tracking-wide px-8 py-3.5 rounded-lg flex items-center gap-3 border-2 border-[#111215] cursor-pointer"
                >
                  <span>SIGN IN &amp; OPEN ROADFIX</span>
                  <span className="text-[#F59E0B]">&rarr;</span>
                </button>
                <button
                  onClick={() => openAuthWithMode('register')}
                  className="px-6 py-3.5 border-2 border-[#111215] text-[#111215] bg-white font-mono text-xs uppercase font-bold rounded-lg hover:bg-[#EFECE5] shadow-[3px_3px_0px_#111215] active:translate-y-0.5 transition-all cursor-pointer"
                >
                  REGISTER NEW ACCOUNT
                </button>
              </div>

              {/* Metric Badges matching bottom spec stamp in reference */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl border-t-2 border-dashed border-[#111215]/20">
                <div className="p-2 border-2 border-[#111215] rounded bg-white shadow-[2px_2px_0px_#111215]">
                  <span className="font-headline text-2xl text-[#FF6B00] block leading-none">15 MIN</span>
                  <span className="font-mono text-[10px] text-[#111215]/70 uppercase font-bold">Avg. Metro Dispatch</span>
                </div>
                <div className="p-2 border-2 border-[#111215] rounded bg-white shadow-[2px_2px_0px_#111215]">
                  <span className="font-headline text-2xl text-[#111215] block leading-none">100%</span>
                  <span className="font-mono text-[10px] text-[#111215]/70 uppercase font-bold">Verified Mechanics</span>
                </div>
                <div className="p-2 border-2 border-[#111215] rounded bg-white shadow-[2px_2px_0px_#111215]">
                  <span className="font-headline text-2xl text-amber-600 block leading-none">ZERO</span>
                  <span className="font-mono text-[10px] text-[#111215]/70 uppercase font-bold">Hidden Markups</span>
                </div>
                <div className="p-2 border-2 border-[#111215] rounded bg-white shadow-[2px_2px_0px_#111215]">
                  <span className="font-headline text-2xl text-emerald-600 block leading-none">24 / 7</span>
                  <span className="font-mono text-[10px] text-[#111215]/70 uppercase font-bold">Telematics Active</span>
                </div>
              </div>
            </div>

            {/* Right Graphic / Art Packaging Container (Mascot Rescue Box) */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              {/* Background organic shape */}
              <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#F59E0B]/25 filter blur-3xl -z-10"></div>
              
              {/* The Editorial "Rescue Kit / Mechanic Mascot" 3D Display Box */}
              <div
                onClick={() => openAuthWithMode('login')}
                className="relative w-full max-w-md bg-white border-4 border-[#111215] rounded-2xl p-6 shadow-[10px_10px_0px_#111215] transform rotate-[1.5deg] hover:rotate-0 transition-transform duration-300 cursor-pointer text-left"
              >
                
                {/* Top Carton Lid / Brand Badge */}
                <div className="flex justify-between items-center pb-4 border-b-2 border-[#111215]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF6B00] border border-[#111215]"></span>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">PACK NO. RF-9001</span>
                  </div>
                  <span className="font-hand text-xl font-bold text-amber-600">Pure Roadside Relief</span>
                </div>

                {/* Mascot Illustration & Emergency Wrench Character */}
                <div className="py-6 flex flex-col items-center justify-center relative">
                  
                  {/* Hand-drawn Style Illustrated Mascot SVG */}
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="100" cy="100" r="75" fill="#FAF5E9" stroke="#111215" strokeWidth="4"/>
                      <path d="M42 90 C42 55, 158 55, 158 90 Z" fill="#F59E0B" stroke="#111215" strokeWidth="4"/>
                      <path d="M30 90 L170 90" stroke="#111215" strokeWidth="4" strokeLinecap="round"/>
                      
                      <circle cx="75" cy="115" r="14" fill="#FFFFFF" stroke="#111215" strokeWidth="3"/>
                      <circle cx="78" cy="115" r="7" fill="#111215"/>
                      <circle cx="81" cy="112" r="2.5" fill="#FFFFFF"/>

                      <circle cx="125" cy="115" r="14" fill="#FFFFFF" stroke="#111215" strokeWidth="3"/>
                      <circle cx="122" cy="115" r="7" fill="#111215"/>
                      <circle cx="125" cy="112" r="2.5" fill="#FFFFFF"/>

                      <path d="M92 130 Q100 148 108 130 Z" fill="#FF6B00" stroke="#111215" strokeWidth="3"/>
                      
                      <path d="M60 148 L140 148" stroke="#111215" strokeWidth="5" strokeLinecap="round"/>
                      <path d="M56 142 L66 142 M56 154 L66 154" stroke="#111215" strokeWidth="4"/>
                      <path d="M134 142 L144 142 M134 154 L144 154" stroke="#111215" strokeWidth="4"/>
                      
                      <circle cx="100" cy="72" r="4" fill="#111215"/>
                    </svg>

                    {/* Speech badge */}
                    <div className="absolute -top-3 -right-2 bg-[#111215] text-white px-3 py-1 rounded-full font-mono text-[10px] tracking-widest uppercase border border-[#F59E0B]">
                      DISPATCH #48 READY
                    </div>
                  </div>

                  {/* Asphalt Spill Graphic below mascot */}
                  <div className="w-full bg-[#F59E0B]/15 border-2 border-dashed border-[#FF6B00] rounded-xl p-3 mt-4 text-center">
                    <span className="font-headline text-3xl text-[#111215] tracking-wide block">ROAD RESCUE IN A TAP</span>
                    <span className="font-hand text-xl text-[#FF6B00] font-bold -mt-1 block">no subscription required</span>
                  </div>
                </div>

                {/* Technical Specs Footer inside Card (Barcodes & Stamps) */}
                <div className="pt-4 border-t-2 border-[#111215] flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-6 w-36 barcode-lines border border-[#111215]/20"></div>
                    <span className="font-mono text-[9px] text-[#111215]/70 tracking-widest block font-bold">TELEMATICS: 4820 1316 6088</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[9px] uppercase tracking-wider block text-[#111215]/50 font-bold">NETWORK REGION</span>
                    <span className="font-mono text-xs font-bold text-[#111215]">PAN-INDIA 24/7</span>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* GIANT EDITORIAL TYPOGRAPHY WALL */}
          <section className="mt-20 sm:mt-28 pt-10 border-t-4 border-[#111215] relative text-left">
            <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-4">
              <span className="font-hand text-3xl sm:text-5xl text-[#111215] font-bold rotate-[-2deg] mb-2 md:mb-0">
                Ways of Rescue:
              </span>
              <span className="font-mono text-xs text-[#111215]/70 uppercase tracking-widest font-bold">
                FIELD CAPABILITY SPECIFICATION // ALL-TERRAIN COVERAGE
              </span>
            </div>

            {/* Giant Stacked Typographic Block with Masked Fill */}
            <div className="font-headline text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] leading-[0.82] uppercase tracking-tight font-black select-none">
              <div className="hover:text-[#FF6B00] transition-colors duration-200">
                FOR STRANDED
              </div>
              <div className="photo-masked-text w-full">
                MOTORISTS &bull;
              </div>
              <div className="text-[#111215] hover:tracking-wider transition-all duration-300">
                HIGHWAY BREAKDOWNS &bull;
              </div>
              <div className="text-[#111215]/25 hover:text-[#111215] transition-colors duration-200">
                COMMERCIAL FLEETS &bull;
              </div>
              <div className="text-[#F59E0B]">
                EV BATTERY JUMPS.
              </div>
            </div>
          </section>

          {/* TECHNICAL SPECIFICATION SHEET & 5-ICON ROW */}
          <section id="specs" className="mt-16 sm:mt-24 pt-8 border-t-2 border-[#111215]/20 grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            
            {/* Left specs list */}
            <div className="md:col-span-5 space-y-4">
              <h3 className="font-headline text-3xl sm:text-4xl uppercase tracking-wide text-[#111215]">
                SLA &amp; DISPATCH CONDITIONS
              </h3>
              
              <p className="font-mono text-xs font-bold text-[#FF6B00]">
                AVERAGE ETA &le; 15 MINUTES IN METRO RADAR (&plusmn; 3 MIN WEATHER VARIANCE)
              </p>

              <p className="font-mono text-xs text-[#111215]/80 leading-relaxed">
                Upon SOS trigger, GPS telematics locks coordinate telemetry. Nearest certified technician is reserved exclusively. Live audio fault recording forecasts required tools prior to mechanic roll-out.
              </p>

              <p className="font-mono text-xs text-[#111215]/60 italic">
                * Transparent customer approval required for spare parts prior to invoice generation.
              </p>
            </div>

            {/* Middle Barcode Stamp Block */}
            <div className="md:col-span-4 space-y-3 font-mono text-xs">
              <div>
                <span className="text-[#111215]/50 block text-[10px] uppercase font-bold">BAR CODE OF SERVICE PROTOCOL</span>
                <span className="font-bold text-[#FF6B00] text-sm tracking-wider">4820 1316 6088 (ISO 9001)</span>
              </div>

              <div>
                <span className="text-[#111215]/50 block text-[10px] uppercase font-bold">RADAR ENCRYPTION KEY</span>
                <span className="font-bold text-[#FF6B00] text-sm tracking-wider">SEC-ROADFIX-TLS-1.3</span>
              </div>

              <div className="pt-2">
                <span className="text-[#111215]/50 block text-[10px] uppercase font-bold">DIRECT DATABASE INTEGRATION</span>
                <span className="text-[#111215] font-bold">Registered Vehicle Owners &amp; Mechanics Portal</span>
              </div>
            </div>

            {/* Right 5-Icon ISO Quality Stamps */}
            <div className="md:col-span-3 flex md:flex-col justify-end items-end gap-3">
              <div className="inline-flex border-2 border-[#111215] divide-x-2 divide-[#111215] bg-white rounded-md shadow-[3px_3px_0px_#111215] overflow-hidden">
                <div className="w-10 h-10 flex items-center justify-center p-2 hover:bg-[#F59E0B] transition-colors" title="Tool Dispatch">
                  <Wrench className="w-5 h-5 text-[#111215]" />
                </div>
                <div className="w-10 h-10 flex items-center justify-center p-2 hover:bg-[#F59E0B] transition-colors" title="Live Telematics">
                  <MapPin className="w-5 h-5 text-[#111215]" />
                </div>
                <div className="w-10 h-10 flex items-center justify-center p-2 hover:bg-[#F59E0B] transition-colors" title="100% Certified">
                  <Award className="w-5 h-5 text-[#111215]" />
                </div>
                <div className="w-10 h-10 flex items-center justify-center p-2 hover:bg-[#F59E0B] transition-colors" title="Emergency Rescue">
                  <Car className="w-5 h-5 text-[#111215]" />
                </div>
                <div className="w-10 h-10 flex items-center justify-center p-2 hover:bg-[#F59E0B] transition-colors" title="Verified Guarantee">
                  <Shield className="w-5 h-5 text-[#111215]" />
                </div>
              </div>
              <span className="font-mono text-[9px] text-[#111215]/60 text-right uppercase tracking-widest block font-bold">
                MINISTRY APPROVED ASSISTANCE PROTOCOL
              </span>
            </div>

          </section>

          {/* INTERACTIVE 4-PILLAR FEATURE CARDS */}
          <section className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="bg-white border-2 border-[#111215] p-5 rounded-xl shadow-[4px_4px_0px_#111215] hover:shadow-[6px_6px_0px_#F59E0B] hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="font-headline text-3xl text-[#111215]">01</span>
                <span className="p-1.5 px-2 bg-amber-100 border border-[#111215] rounded-lg text-[#FF6B00] font-bold text-xs font-mono">⚡ FAST</span>
              </div>
              <h4 className="font-headline text-2xl uppercase tracking-wide">15-Min Fast Arrival</h4>
              <p className="font-mono text-xs text-[#111215]/70 mt-1">Automated dispatch assigns closest qualified mechanic via live GPS radar.</p>
            </div>

            <div className="bg-white border-2 border-[#111215] p-5 rounded-xl shadow-[4px_4px_0px_#111215] hover:shadow-[6px_6px_0px_#F59E0B] hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="font-headline text-3xl text-[#111215]">02</span>
                <span className="p-1.5 px-2 bg-blue-100 border border-[#111215] rounded-lg text-blue-800 font-bold text-xs font-mono">🤖 SMART</span>
              </div>
              <h4 className="font-headline text-2xl uppercase tracking-wide">AI Diagnosis Engine</h4>
              <p className="font-mono text-xs text-[#111215]/70 mt-1">Instant audio &amp; photo engine breakdown analysis and tool forecasting.</p>
            </div>

            <div className="bg-white border-2 border-[#111215] p-5 rounded-xl shadow-[4px_4px_0px_#111215] hover:shadow-[6px_6px_0px_#F59E0B] hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="font-headline text-3xl text-[#111215]">03</span>
                <span className="p-1.5 px-2 bg-emerald-100 border border-[#111215] rounded-lg text-emerald-800 font-bold text-xs font-mono">🛡️ 100% ID</span>
              </div>
              <h4 className="font-headline text-2xl uppercase tracking-wide">Certified Pros</h4>
              <p className="font-mono text-xs text-[#111215]/70 mt-1">Aadhaar &amp; commercial driving licence verified professional technicians.</p>
            </div>

            <div className="bg-white border-2 border-[#111215] p-5 rounded-xl shadow-[4px_4px_0px_#111215] hover:shadow-[6px_6px_0px_#F59E0B] hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="font-headline text-3xl text-[#111215]">04</span>
                <span className="p-1.5 px-2 bg-purple-100 border border-[#111215] rounded-lg text-purple-900 font-bold text-xs font-mono">🏷️ FAIR</span>
              </div>
              <h4 className="font-headline text-2xl uppercase tracking-wide">Zero Hidden Charges</h4>
              <p className="font-mono text-xs text-[#111215]/70 mt-1">Clear customer pre-approval for spare parts with certified digital invoices.</p>
            </div>
          </section>

        </main>

        {/* BOTTOM WAVY DRIP ACCENT FOOTER */}
        <footer className="w-full mt-16 relative overflow-hidden select-none">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-6 flex flex-col sm:flex-row items-center justify-between font-mono text-xs text-[#111215]/70 border-t-2 border-[#111215]/20 pt-6">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#111215]">&copy; 2026 Roadfix</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111215]/75 backdrop-blur-sm overflow-y-auto" onClick={() => setIsAuthModalOpen(false)}>
            <div className="bg-[#F6F3EE] border-4 border-[#111215] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-[12px_12px_0px_#111215] relative text-left my-auto" onClick={(e) => e.stopPropagation()}>
              
              {/* Close Button */}
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 border-2 border-[#111215] rounded-md bg-white flex items-center justify-center font-mono font-bold hover:bg-[#111215] hover:text-white transition-all shadow-[2px_2px_0px_#111215] active:scale-95"
              >
                ✕
              </button>

              {/* Modal Header */}
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-[#FACC15] font-mono text-[10px] font-bold uppercase tracking-wider border-2 border-[#111215] rounded-full mb-2">
                  CONNECTED TO ROADFIX DATABASE
                </span>
                <h2 className="font-headline text-4xl uppercase text-[#111215] tracking-tight">
                  {mode === 'login' ? 'Sign In to Roadfix' : 'Create Your Roadfix Account'}
                </h2>
                <p className="font-mono text-xs text-[#111215]/70">
                  {mode === 'login'
                    ? 'Access your registered vehicles, roadside bookings & service history.'
                    : 'Register as a vehicle owner or service mechanic in the Roadfix database.'}
                </p>
              </div>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#111215]/10 border-2 border-[#111215] rounded-lg mb-6 font-mono text-xs font-bold uppercase">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className={`py-2.5 rounded-md border transition-all ${
                    mode === 'login'
                      ? 'bg-[#F59E0B] text-[#111215] border-[#111215] shadow-[2px_2px_0px_#111215]'
                      : 'text-[#111215]/70 border-transparent hover:text-[#111215]'
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
                  className={`py-2.5 rounded-md border transition-all ${
                    mode === 'register'
                      ? 'bg-[#F59E0B] text-[#111215] border-[#111215] shadow-[2px_2px_0px_#111215]'
                      : 'text-[#111215]/70 border-transparent hover:text-[#111215]'
                  }`}
                >
                  Register New Account
                </button>
              </div>

              {/* Alerts */}
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-900 font-mono text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-100 border-2 border-emerald-500 rounded-lg text-emerald-900 font-mono text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-[#111215]/80 mb-1">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. mithunboddepalli@gmail.com"
                      className="w-full px-4 py-3 bg-white border-2 border-[#111215] rounded-lg font-mono text-sm focus:outline-none focus:border-[#FF6B00] shadow-[2px_2px_0px_#111215]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-[#111215]/80 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your registered password"
                        className="w-full px-4 py-3 bg-white border-2 border-[#111215] rounded-lg font-mono text-sm focus:outline-none focus:border-[#FF6B00] shadow-[2px_2px_0px_#111215]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-[#111215]/60 hover:text-[#111215]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FACC15]/20 border-2 border-dashed border-[#FF6B00] rounded-lg">
                    <p className="font-mono text-[11px] text-[#111215] leading-tight">
                      <strong>Direct Database Sign-In:</strong> Only registered users in the database can sign in. If you have not registered yet, switch to the <em>Register New Account</em> tab to connect.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-amber-hydraulic font-headline text-2xl tracking-wider py-3.5 rounded-xl border-2 border-[#111215] font-bold flex justify-center items-center gap-2 cursor-pointer"
                  >
                    <span>{loading ? 'Verifying with Database...' : 'Sign In & Open Roadfix →'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-[#111215]/80 mb-1">
                      Register As:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole('customer')}
                        className={`p-2.5 rounded-lg border-2 text-left flex items-center gap-2 font-mono text-xs font-bold ${
                          regRole === 'customer'
                            ? 'bg-[#38BDF8]/20 border-[#111215] shadow-[2px_2px_0px_#111215]'
                            : 'bg-white border-[#111215]/30 text-[#111215]/60'
                        }`}
                      >
                        <Car className="w-4 h-4 text-[#0284C7]" />
                        <span>Vehicle Owner</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRole('mechanic')}
                        className={`p-2.5 rounded-lg border-2 text-left flex items-center gap-2 font-mono text-xs font-bold ${
                          regRole === 'mechanic'
                            ? 'bg-[#F59E0B]/20 border-[#111215] shadow-[2px_2px_0px_#111215]'
                            : 'bg-white border-[#111215]/30 text-[#111215]/60'
                        }`}
                      >
                        <Wrench className="w-4 h-4 text-[#F59E0B]" />
                        <span>Service Mechanic</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-[#111215]/80 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Mithun Boddepalli"
                      className="w-full px-4 py-2.5 bg-white border-2 border-[#111215] rounded-lg font-mono text-xs shadow-[2px_2px_0px_#111215]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-mono text-[11px] font-bold uppercase text-[#111215]/80 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="user@domain.com"
                        className="w-full px-3 py-2 bg-white border-2 border-[#111215] rounded-lg font-mono text-xs shadow-[2px_2px_0px_#111215]"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold uppercase text-[#111215]/80 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 bg-white border-2 border-[#111215] rounded-lg font-mono text-xs shadow-[2px_2px_0px_#111215]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase text-[#111215]/80 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create secure password"
                      className="w-full px-4 py-2.5 bg-white border-2 border-[#111215] rounded-lg font-mono text-xs shadow-[2px_2px_0px_#111215]"
                    />
                  </div>

                  {regRole === 'customer' && (
                    <div className="p-3 bg-white border-2 border-[#111215] rounded-xl shadow-[3px_3px_0px_#111215]">
                      <span className="block font-mono text-[11px] font-bold uppercase mb-2 text-[#FF6B00]">
                        Vehicle Profile:
                      </span>
                      <VehicleFormFields
                        data={vehicleData}
                        onChange={setVehicleData}
                        compact={true}
                      />
                    </div>
                  )}

                  {regRole === 'mechanic' && (
                    <div>
                      <label className="block font-mono text-[11px] font-bold uppercase text-[#111215]/80 mb-1">
                        Workshop / Mobile Service Name
                      </label>
                      <input
                        type="text"
                        required
                        value={workshopName}
                        onChange={(e) => setWorkshopName(e.target.value)}
                        placeholder="e.g. Apex Emergency Auto Garage"
                        className="w-full px-4 py-2.5 bg-white border-2 border-[#111215] rounded-lg font-mono text-xs shadow-[2px_2px_0px_#111215]"
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
  }

  /* =========================================================================
     DARK THEME: MIDNIGHT GARAGE THEME
     Deep navy backgrounds (#080D1C, #111A2E), amber highlights (#FFB51B),
     cyan telematics (#38BDF8), and clear automotive typography.
     ========================================================================= */
  return (
    <div className="min-h-screen w-full bg-[#080D1C] text-[#F1F5F9] flex flex-col justify-between selection:bg-[#FFB51B] selection:text-[#080D1C] relative overflow-hidden font-sans transition-colors duration-200">
      {/* Background Highway Ambient Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <video
          src="/bg-highway.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105 opacity-40 transition-opacity duration-300"
        />
        <div 
          className="absolute inset-0 backdrop-blur-[1.5px]"
          style={{ backgroundColor: 'rgba(8, 13, 28, 0.65)' }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, #080D1C 0%, rgba(8,13,28,0.3) 50%, #080D1C 100%)'
          }}
        />
      </div>

      {/* Top Welcome / Brand Header Bar */}
      <header className="w-full border-b border-[#1E2C48] bg-[#080D1C]/85 backdrop-blur-md sticky top-0 z-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFB51B] to-[#FFD166] p-0.5 shadow-md shadow-[#FFB51B]/20">
              <div className="w-full h-full bg-[#080D1C] rounded-[10px] flex items-center justify-center">
                <Wrench className="w-5 h-5 text-[#FFB51B]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-lg tracking-tight text-[#F1F5F9]">
                  Roadfix
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-[#FFB51B]/15 text-[#FFB51B] border border-[#FFB51B]/30">
                  24/7
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8] hidden sm:block font-medium">
                24/7 Emergency Vehicle Assistance &amp; Smart Dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title="Switch to Light Theme (RoadFix Editorial)"
              aria-label="Switch to Light Theme (RoadFix Editorial)"
              className="p-2 rounded-xl bg-[#111A2E] border border-[#1E2C48] text-[#FFB51B] hover:border-[#FFB51B] transition-all shadow-sm active:scale-95 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-[#FFB51B]/40"
            >
              <Sun className="w-4 h-4 text-[#FFB51B] group-hover:rotate-45 transition-transform duration-300" />
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111A2E] border border-[#1E2C48] text-xs text-[#38BDF8] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-slate-200 font-medium">Dispatch Fleet Live</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] bg-[#111A2E] px-3 py-1.5 rounded-xl border border-[#1E2C48] shadow-sm">
              <Phone className="w-3.5 h-3.5 text-red-500" />
              <span>SOS: <strong className="text-red-400 font-mono">112 / 1033</strong></span>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-[#111A2E] border border-[#1E2C48] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area: Hero + Auth Card */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14 relative z-10">
        {/* Left Side: Product Value Propositions */}
        <div className="flex-1 max-w-xl text-left space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFB51B]/15 border border-[#FFB51B]/30 text-[#FFB51B] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB51B]" />
              <span>24/7 Roadside Assistance Network</span>
            </div>
            <span className="font-signature text-xl text-[#FFB51B] -rotate-1 font-bold tracking-wide select-none">
              "Ready when you need us."
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-black text-[#F1F5F9] tracking-tight leading-tight">
            Vehicle trouble? <br />
            <span className="bg-gradient-to-r from-[#FFB51B] via-[#FFD166] to-[#FFB51B] bg-clip-text text-transparent">
              RoadFix is on the way.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            Reliable roadside assistance, qualified mechanics, smart breakdown diagnosis, and transparent repair pricing — when you need help most.
          </p>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="font-signature text-2xl text-[#FFD166] rotate-1 font-semibold select-none">
              ~ "Back on the road in minutes."
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => {
                triggerHaptic('medium');
                setMode('register');
              }}
              className="px-6 py-3 rounded-2xl bg-[#FFB51B] hover:bg-[#FFD166] text-[#080D1C] font-extrabold text-sm shadow-xl shadow-[#FFB51B]/25 btn-primary-amber flex items-center gap-2 cursor-pointer"
            >
              <span>Get Help Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setMode('login');
              }}
              className="px-5 py-3 rounded-2xl bg-[#111A2E] hover:bg-[#17233D] border border-[#1E2C48] text-slate-200 text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Explore Services</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#111A2E] border border-[#1E2C48] flex items-start gap-3 shadow-md hover:border-[#FFB51B] transition-all">
              <div className="p-2 rounded-xl bg-[#FFB51B]/15 text-[#FFB51B] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#F1F5F9] font-heading">15-Minute Fast Arrival</h2>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Automated dispatch to closest qualified mechanic via live GPS</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111A2E] border border-[#1E2C48] flex items-start gap-3 shadow-md hover:border-[#38BDF8] transition-all">
              <div className="p-2 rounded-xl bg-[#38BDF8]/15 text-[#38BDF8] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#F1F5F9] font-heading">AI Diagnostics Engine</h2>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Instant audio/photo breakdown analysis and tool forecasting</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111A2E] border border-[#1E2C48] flex items-start gap-3 shadow-md hover:border-[#10B981] transition-all">
              <div className="p-2 rounded-xl bg-[#10B981]/15 text-[#10B981] shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#F1F5F9] font-heading">100% Certified Mechanics</h2>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Aadhaar &amp; commercial driving licence verified professionals</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111A2E] border border-[#1E2C48] flex items-start gap-3 shadow-md hover:border-[#FFD166] transition-all">
              <div className="p-2 rounded-xl bg-[#FFD166]/15 text-[#FFD166] shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#F1F5F9] font-heading">Zero Hidden Charges</h2>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Transparent customer approval for spare parts &amp; digital receipts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Auth Card (Sign In / Register) */}
        <div className="w-full max-w-md shrink-0">
          <div className="bg-[#111A2E] border border-[#1E2C48] rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl transition-all text-left">
            <div className="p-5 sm:p-6 bg-gradient-to-br from-[#080D1C] via-[#111A2E] to-[#FFB51B]/10 border-b border-[#1E2C48] text-center">
              <h2 className="text-xl font-extrabold text-[#F1F5F9] font-heading tracking-tight">
                {mode === 'login' ? 'Sign In to Roadfix' : 'Create Your Roadfix Account'}
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                {mode === 'login'
                  ? 'Access your registered vehicles, roadside bookings & service history'
                  : 'Register as a vehicle owner or service mechanic in the Roadfix database'}
              </p>

              <div className="mt-4 relative p-1 rounded-2xl bg-[#080D1C] border border-[#1E2C48] flex">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                    mode === 'login' ? 'bg-[#FFB51B] text-[#080D1C] font-black' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
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
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                    mode === 'register' ? 'bg-[#FFB51B] text-[#080D1C] font-black' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  Register New Account
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#F1F5F9] block mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. yourname@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-xs text-[#F1F5F9] placeholder-[#64748B] field-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#F1F5F9] block mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your registered password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-xs text-[#F1F5F9] placeholder-[#64748B] field-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#080D1C]/70 border border-[#1E2C48] text-[11px] text-[#94A3B8]">
                    <p className="flex items-center gap-1.5 text-[#FFB51B] font-bold mb-1">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Direct Database Sign-In</span>
                    </p>
                    <span>Only users registered in the database can sign in.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-[#FFB51B] hover:bg-[#FFD166] text-[#080D1C] font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#FFB51B]/25 btn-primary-amber cursor-pointer active:scale-95"
                  >
                    <span>{loading ? 'Verifying with Database...' : 'Sign In & Open Roadfix'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#F1F5F9] block mb-1">
                      Register As:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole('customer')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          regRole === 'customer'
                            ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8]'
                            : 'bg-[#080D1C] border-[#1E2C48] text-[#94A3B8]'
                        }`}
                      >
                        <Car className="w-4 h-4 text-[#38BDF8] shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-[#F1F5F9]">Vehicle Owner</div>
                          <div className="text-[10px] text-[#94A3B8]">Book repairs</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRole('mechanic')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          regRole === 'mechanic'
                            ? 'bg-[#FFB51B]/20 border-[#FFB51B] text-[#FFB51B]'
                            : 'bg-[#080D1C] border-[#1E2C48] text-[#94A3B8]'
                        }`}
                      >
                        <Wrench className="w-4 h-4 text-[#FFB51B] shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-[#F1F5F9]">Service Mechanic</div>
                          <div className="text-[10px] text-[#94A3B8]">Accept jobs</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#F1F5F9] block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Mithun Boddepalli"
                      className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-xs text-[#F1F5F9] field-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-[#F1F5F9] block mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="user@domain.com"
                        className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-xs text-[#F1F5F9] field-input"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#F1F5F9] block mb-1">Phone</label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-xs text-[#F1F5F9] field-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#F1F5F9] block mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create secure password"
                      className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-xs text-[#F1F5F9] field-input"
                    />
                  </div>

                  {regRole === 'customer' && (
                    <div className="p-3 bg-[#080D1C]/80 border border-[#1E2C48] rounded-2xl">
                      <VehicleFormFields
                        data={vehicleData}
                        onChange={setVehicleData}
                        compact={true}
                      />
                    </div>
                  )}

                  {regRole === 'mechanic' && (
                    <div>
                      <label className="text-[11px] font-bold text-[#F1F5F9] block mb-1">
                        Workshop / Mobile Service Name
                      </label>
                      <input
                        type="text"
                        required
                        value={workshopName}
                        onChange={(e) => setWorkshopName(e.target.value)}
                        placeholder="e.g. Apex Emergency Auto Garage"
                        className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-xs text-[#F1F5F9] field-input"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-[#FFB51B] hover:bg-[#FFD166] text-[#080D1C] font-extrabold text-sm btn-primary-amber cursor-pointer mt-1"
                  >
                    <span>{loading ? 'Registering...' : 'Create Account & Connect'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-[#1E2C48] py-4 text-center text-xs text-[#94A3B8]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 Roadfix &bull; Emergency Roadside Assistance Network</span>
          <span className="text-[#38BDF8]">Pan-India Support: 112 / 1033</span>
        </div>
      </footer>
    </div>
  );
};

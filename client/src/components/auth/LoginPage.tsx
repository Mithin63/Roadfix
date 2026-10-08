import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  Database
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

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login form state - clean inputs, no hardcoded demo bypass
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regRole, setRegRole] = useState<'customer' | 'mechanic'>('customer');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState(activeLocation.isRealGps ? activeLocation.address : '');

  // Customer vehicle fields (Starts completely blank - no hardcoded Hyundai/Creta)
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

  return (
    <div className="min-h-screen w-full bg-[#080D1C] text-[#F1F5F9] flex flex-col justify-between selection:bg-[#FFB51B] selection:text-[#080D1C] relative overflow-hidden font-sans">
      {/* Background Highway Ambient Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <video
          src="/bg-highway.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105 opacity-25 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[#080D1C]/80 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080D1C] via-transparent to-[#080D1C]/90" />
      </div>

      {/* Top Welcome / Brand Header Bar */}
      <header className="w-full border-b border-[#1E2C48] bg-[#080D1C]/85 backdrop-blur-md sticky top-0 z-20">
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
                24/7 Emergency Vehicle Assistance & Smart Dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111A2E] border border-[#1E2C48] text-xs text-[#38BDF8]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-slate-200">Verified Dispatch Fleet Live</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] bg-[#111A2E] px-3 py-1.5 rounded-xl border border-[#1E2C48]">
              <Phone className="w-3.5 h-3.5 text-red-400" />
              <span>SOS: <strong className="text-white font-mono">112 / 1033</strong></span>
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFB51B]/10 border border-[#FFB51B]/30 text-[#FFB51B] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB51B]" />
            <span>24/7 Roadside Assistance Network</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-[#F1F5F9] tracking-tight leading-tight">
            Vehicle breakdown? <br />
            <span className="bg-gradient-to-r from-[#FFB51B] via-[#FFD166] to-[#FFB51B] bg-clip-text text-transparent">
              Roadfix is on the way.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            Sign in to access 24/7 on-demand roadside assistance, smart AI fault diagnostics, real-time certified mechanic tracking, and transparent digital invoices.
          </p>

          {/* Core Feature Badges: Radar Depth Tap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div
              onClick={() => triggerHaptic('light')}
              className="p-3.5 rounded-2xl bg-[#111A2E]/90 border border-[#1E2C48] flex items-start gap-3 feature-card"
            >
              <div className="p-2 rounded-xl bg-[#FFB51B]/10 text-[#FFB51B] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#F1F5F9] font-heading">15-Minute Fast Arrival</h2>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Automated dispatch to closest qualified mechanic via live GPS</p>
              </div>
            </div>

            <div
              onClick={() => triggerHaptic('light')}
              className="p-3.5 rounded-2xl bg-[#111A2E]/90 border border-[#1E2C48] flex items-start gap-3 feature-card"
            >
              <div className="p-2 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#F1F5F9] font-heading">AI Diagnostics Engine</h2>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Instant audio/photo breakdown analysis and tool forecasting</p>
              </div>
            </div>

            <div
              onClick={() => triggerHaptic('light')}
              className="p-3.5 rounded-2xl bg-[#111A2E]/90 border border-[#1E2C48] flex items-start gap-3 feature-card"
            >
              <div className="p-2 rounded-xl bg-[#10B981]/10 text-[#10B981] shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#F1F5F9] font-heading">100% Certified Mechanics</h2>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Aadhaar & commercial driving licence verified professionals</p>
              </div>
            </div>

            <div
              onClick={() => triggerHaptic('light')}
              className="p-3.5 rounded-2xl bg-[#111A2E]/90 border border-[#1E2C48] flex items-start gap-3 feature-card"
            >
              <div className="p-2 rounded-xl bg-[#FFD166]/10 text-[#FFD166] shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#F1F5F9] font-heading">Zero Hidden Charges</h2>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Transparent customer approval for spare parts & digital receipts</p>
              </div>
            </div>
          </div>

          {/* Database Connection Status Card */}
          <div className="p-3.5 rounded-2xl bg-[#111A2E]/70 border border-[#1E2C48] flex items-center gap-3 text-xs text-[#94A3B8]">
            <div className="p-1.5 rounded-lg bg-[#10B981]/20 text-[#10B981]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[#F1F5F9] font-semibold">Roadfix Database Active:</span> Only registered vehicle owners & mechanics in the backend database can sign in.
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Auth Card (Sign In / Register) */}
        <div className="w-full max-w-md shrink-0">
          <div className="bg-[#111A2E] border border-[#1E2C48] rounded-3xl shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl">
            {/* Card Header & Tab Switcher */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-[#080D1C] via-[#111A2E] to-[#FFB51B]/10 border-b border-[#1E2C48] text-center">
              <h2 className="text-xl font-extrabold text-[#F1F5F9] font-heading tracking-tight">
                {mode === 'login' ? 'Sign In to Roadfix' : 'Create Your Roadfix Account'}
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                {mode === 'login'
                  ? 'Access your registered vehicles, roadside bookings & service history'
                  : 'Register as a vehicle owner or service mechanic in the Roadfix database'}
              </p>

              {/* Mode Switcher Tabs: Sliding Magnetic Pill */}
              <div className="mt-4 relative p-1 rounded-2xl bg-[#080D1C] border border-[#1E2C48] magnetic-pill-container flex">
                {/* Smooth spring sliding background pill */}
                <div
                  className="magnetic-pill-indicator"
                  style={{
                    left: mode === 'login' ? '4px' : 'calc(50% + 2px)',
                    width: 'calc(50% - 6px)'
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`relative z-10 flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                    mode === 'login' ? 'text-[#080D1C] font-black' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
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
                    setSuccessMsg(null);
                  }}
                  className={`relative z-10 flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                    mode === 'register' ? 'text-[#080D1C] font-black' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  Register New Account
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Feedback Alerts */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <span className="font-semibold block mb-0.5">Authentication Error</span>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 1. SIGN IN FORM */}
              {mode === 'login' && (
                <form
                  onSubmit={handleLoginSubmit}
                  className={`space-y-4 ${errorMsg ? 'animate-micro-shake' : ''}`}
                >
                  <div>
                    <label className="text-xs font-bold text-[#F1F5F9] block mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3 pointer-events-none" />
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#F1F5F9]">Password</label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3 pointer-events-none" />
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
                        onClick={() => {
                          triggerHaptic('light');
                          setShowPassword(!showPassword);
                        }}
                        className="absolute right-3.5 top-3 text-[#94A3B8] hover:text-[#F1F5F9]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#080D1C]/70 border border-[#1E2C48] text-[11px] text-[#94A3B8]">
                    <p className="flex items-center gap-1.5 text-[#FFB51B] font-medium mb-1">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Direct Database Sign-In</span>
                    </p>
                    <span>Only users registered in the database can sign in. If you have not registered yet, switch to the <strong>Register New Account</strong> tab to connect your account.</span>
                  </div>

                  {/* Primary CTA: Amber Hydraulic Press */}
                  <button
                    type="submit"
                    disabled={loading}
                    onMouseDown={() => triggerHaptic('medium')}
                    onTouchStart={() => triggerHaptic('medium')}
                    className="w-full py-3 rounded-2xl bg-[#FFB51B] hover:bg-[#FFD166] text-[#080D1C] font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#FFB51B]/25 btn-primary-amber cursor-pointer"
                  >
                    <span>{loading ? 'Verifying with Database...' : 'Sign In & Open Roadfix'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* 2. REGISTRATION FORM (CONNECTS DIRECTLY TO DATABASE) */}
              {mode === 'register' && (
                <form
                  onSubmit={handleRegisterSubmit}
                  className={`space-y-3.5 ${errorMsg ? 'animate-micro-shake' : ''}`}
                >
                  <div>
                    <label className="text-[11px] font-bold text-[#F1F5F9] block mb-1">
                      Register As:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setRegRole('customer');
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all feature-card ${
                          regRole === 'customer'
                            ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] shadow-md ring-1 ring-[#38BDF8]/40'
                            : 'bg-[#080D1C] border-[#1E2C48] text-[#94A3B8] hover:text-[#F1F5F9]'
                        }`}
                      >
                        <Car className="w-4 h-4 text-[#38BDF8] shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-[#F1F5F9] font-heading">Vehicle Owner</div>
                          <div className="text-[10px] text-[#94A3B8]">Book emergency repairs</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setRegRole('mechanic');
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all feature-card ${
                          regRole === 'mechanic'
                            ? 'bg-[#FFB51B]/20 border-[#FFB51B] text-[#FFB51B] shadow-md ring-1 ring-[#FFB51B]/40'
                            : 'bg-[#080D1C] border-[#1E2C48] text-[#94A3B8] hover:text-[#F1F5F9]'
                        }`}
                      >
                        <Wrench className="w-4 h-4 text-[#FFB51B] shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-[#F1F5F9] font-heading">Service Mechanic</div>
                          <div className="text-[10px] text-[#94A3B8]">Accept dispatch jobs</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-[#F1F5F9] block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anand Kulkarni"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-xs text-[#F1F5F9] placeholder-[#64748B] field-input"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#F1F5F9] block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98200 XXXXX"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-xs text-[#F1F5F9] placeholder-[#64748B] field-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-[#F1F5F9] block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="yourname@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-xs text-[#F1F5F9] placeholder-[#64748B] field-input"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#F1F5F9] block mb-1">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Min. 4 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-xs text-[#F1F5F9] placeholder-[#64748B] field-input"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-[#F1F5F9]">Current Location / Address</label>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          detectLocation();
                        }}
                        className="text-[10px] text-[#FFB51B] hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>📍 Auto-Detect GPS</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Enter city or roadside location (or tap Auto-Detect GPS)"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#080D1C] border border-[#1E2C48] text-xs text-[#F1F5F9] placeholder-[#64748B] field-input"
                    />
                  </div>

                  {/* Customer Vehicle Information (Searchable Suggestions & Starts Blank) */}
                  {regRole === 'customer' && (
                    <div className="p-4 rounded-2xl bg-[#080D1C]/80 border border-[#1E2C48] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-[#FFB51B] block tracking-wider font-heading">
                          Primary Vehicle Details
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">Searchable dropdowns</span>
                      </div>
                      <VehicleFormFields
                        data={vehicleData}
                        onChange={setVehicleData}
                        required={true}
                        compact={true}
                      />
                    </div>
                  )}

                  {/* Mechanic Workshop Information */}
                  {regRole === 'mechanic' && (
                    <div className="p-3 rounded-2xl bg-[#080D1C]/80 border border-[#1E2C48] space-y-2">
                      <span className="text-[10px] uppercase font-bold text-[#FFB51B] block tracking-wider font-heading">
                        Workshop Details (Verified Pro)
                      </span>
                      <input
                        type="text"
                        placeholder="Workshop / Mobile Van Name"
                        value={workshopName}
                        onChange={(e) => setWorkshopName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#080D1C] border border-[#1E2C48] text-[#F1F5F9] text-xs field-input"
                      />
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-[#080D1C]/70 border border-[#1E2C48] text-[10px] text-[#94A3B8] flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-[#FFB51B] shrink-0" />
                    <span>Your account details will be securely saved into the Roadfix backend database.</span>
                  </div>

                  {/* Primary Registration CTA: Amber Hydraulic Press */}
                  <button
                    type="submit"
                    disabled={loading}
                    onMouseDown={() => triggerHaptic('medium')}
                    onTouchStart={() => triggerHaptic('medium')}
                    className="w-full py-3 rounded-2xl bg-[#FFB51B] hover:bg-[#FFD166] text-[#080D1C] font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#FFB51B]/25 btn-primary-amber cursor-pointer"
                  >
                    <span>{loading ? 'Connecting to Database...' : 'Register to Database & Enter App'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-[#1E2C48] bg-[#080D1C]/90 py-4 px-4 text-center text-xs text-[#94A3B8] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 Roadfix — Emergency Breakdown & Verified Mechanic Network</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-[#94A3B8]">Emergency Dispatch: 24/7/365</span>
            <span className="text-[#FFB51B]">ISO 9001 Roadside Safety</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
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

interface LoginPageProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onClose }) => {
  const { login, register } = useAuth();

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
  const [regAddress, setRegAddress] = useState('Bandra West, Mumbai');

  // Customer vehicle fields
  const [vehicleMake, setVehicleMake] = useState('Hyundai');
  const [vehicleModel, setVehicleModel] = useState('Creta');
  const [vehicleType, setVehicleType] = useState<VehicleCategory>('car');
  const [vehicleRegNo, setVehicleRegNo] = useState('MH 02 EQ 8821');

  // Mechanic fields
  const [workshopName, setWorkshopName] = useState('Roadfix Rapid Mobile Garage');
  const [skills, setSkills] = useState<string[]>([
    'Battery Jumpstart',
    'Tyre Puncture & Replacement',
    'Brake Inspection',
    'Coolant & Hose Repair'
  ]);

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
    setLoading(true);

    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        role: regRole,
        address: regAddress.trim(),
        vehicleType,
        vehicleMake,
        vehicleModel,
        vehicleRegNo: vehicleRegNo.toUpperCase(),
        workshopName,
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
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Welcome / Brand Header Bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Wrench className="w-5 h-5 text-amber-400" />
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
              <p className="text-[10px] text-slate-400 hidden sm:block">
                24/7 Emergency Vehicle Assistance & Smart Dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>48 Mechanics Online in Metro Network</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <Phone className="w-3.5 h-3.5 text-red-400" />
              <span>Emergency SOS: <span className="text-white font-mono">112 / 1033</span></span>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Connected to Roadfix Fleet Database</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Vehicle breakdown? <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Roadfix is on the way.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Sign in to access 24/7 on-demand roadside assistance, smart AI fault diagnostics, real-time certified mechanic tracking, and transparent digital invoices.
          </p>

          {/* Core Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">15-Minute Fast Arrival</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Automated dispatch to closest qualified mechanic via live GPS</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">AI Diagnostics Engine</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Instant audio/photo breakdown analysis and tool forecasting</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">100% Certified Mechanics</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Aadhaar & commercial driving licence verified professionals</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Zero Hidden Charges</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Transparent customer approval for spare parts & digital receipts</p>
              </div>
            </div>
          </div>

          {/* Database Connection Status Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3 text-xs text-slate-300">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-white font-semibold">Roadfix Database Active:</span> Only registered vehicle owners & mechanics in the backend database can sign in.
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Auth Card (Sign In / Register) */}
        <div className="w-full max-w-md shrink-0">
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl">
            {/* Card Header & Tab Switcher */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 border-b border-slate-800 text-center">
              <h2 className="text-xl font-black text-white tracking-tight">
                {mode === 'login' ? 'Sign In to Roadfix' : 'Create Your Roadfix Account'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'login'
                  ? 'Access your registered vehicles, roadside bookings & service history'
                  : 'Register as a vehicle owner or service mechanic in the Roadfix database'}
              </p>

              {/* Mode Switcher Tabs */}
              <div className="mt-4 grid grid-cols-2 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    mode === 'login'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    mode === 'register'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
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
                <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 1. SIGN IN FORM */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. yourname@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-300">Password</label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your registered password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
                    <p className="flex items-center gap-1.5 text-amber-400/90 font-medium mb-1">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Direct Database Sign-In</span>
                    </p>
                    <span>Only users registered in the database can sign in. If you have not registered yet, switch to the <strong>Register New Account</strong> tab to connect your account.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-transform hover:scale-[1.01]"
                  >
                    <span>{loading ? 'Verifying with Database...' : 'Sign In & Open Roadfix'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* 2. REGISTRATION FORM (CONNECTS DIRECTLY TO DATABASE) */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Register As:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole('customer')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          regRole === 'customer'
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-md ring-1 ring-blue-500/40'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Car className="w-4 h-4 text-blue-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white">Vehicle Owner</div>
                          <div className="text-[10px] text-slate-400">Book emergency repairs</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegRole('mechanic')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          regRole === 'mechanic'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/40'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white">Service Mechanic</div>
                          <div className="text-[10px] text-slate-400">Accept dispatch jobs</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anand Kulkarni"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98200 XXXXX"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="yourname@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Min. 4 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Base Location / City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bandra West, Mumbai"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Customer Vehicle Information */}
                  {regRole === 'customer' && (
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                        Primary Vehicle (Saved to Database)
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <select
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value as any)}
                          className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] focus:outline-none focus:border-amber-400"
                        >
                          <option value="car">Car</option>
                          <option value="bike">Bike</option>
                          <option value="scooter">Scooter</option>
                          <option value="suv">SUV</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Make/Model (Creta)"
                          value={vehicleMake}
                          onChange={(e) => setVehicleMake(e.target.value)}
                          className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] focus:outline-none focus:border-amber-400"
                        />
                        <input
                          type="text"
                          placeholder="Plate No"
                          value={vehicleRegNo}
                          onChange={(e) => setVehicleRegNo(e.target.value.toUpperCase())}
                          className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Mechanic Workshop Information */}
                  {regRole === 'mechanic' && (
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                        Workshop Details (Verified Pro)
                      </span>
                      <input
                        type="text"
                        placeholder="Workshop / Mobile Van Name"
                        value={workshopName}
                        onChange={(e) => setWorkshopName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Your account details will be securely saved into the Roadfix backend database.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-transform hover:scale-[1.01]"
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
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 Roadfix — Emergency Breakdown & Verified Mechanic Network</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">Emergency Dispatch: 24/7/365</span>
            <span className="text-amber-400">ISO 9001 Roadside Safety</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

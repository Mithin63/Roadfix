import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Vehicle,
  BreakdownProblem,
  AIDiagnosis,
  MechanicMatchResult,
  VehicleCategory,
  FuelCategory
} from '../../types';
import { MapLeaflet } from '../common/MapLeaflet';
import {
  X,
  MapPin,
  Car,
  AlertTriangle,
  Sparkles,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Mic,
  MicOff,
  Upload,
  Clock,
  ShieldCheck,
  DollarSign,
  Wrench,
  Flame,
  BatteryCharging,
  Disc,
  Fuel,
  Cpu,
  Zap,
  ShieldAlert,
  Key,
  Info
} from 'lucide-react';

interface BreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProblem?: BreakdownProblem;
  onBookingCreated: (bookingId: string) => void;
}

export const BreakdownModal: React.FC<BreakdownModalProps> = ({
  isOpen,
  onClose,
  preselectedProblem,
  onBookingCreated
}) => {
  const { user, activeLocation, setActiveLocation, detectLocation } = useAuth();

  // Wizard Step: 1 (Location) | 2 (Vehicle) | 3 (Problem) | 4 (AI Diagnosis) | 5 (Mechanic Match) | 6 (Confirm)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Location
  const [locationAddress, setLocationAddress] = useState(activeLocation.address);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: activeLocation.lat,
    lng: activeLocation.lng
  });

  // Step 2: Vehicle
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    type: 'car' as VehicleCategory,
    make: '',
    model: '',
    year: 2023,
    regNo: '',
    fuelType: 'petrol' as FuelCategory,
    color: 'White'
  });

  // Step 3: Problem
  const [problemType, setProblemType] = useState<BreakdownProblem>(preselectedProblem || 'battery_dead');
  const [problemDescription, setProblemDescription] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  // Step 4: AI Diagnosis
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<AIDiagnosis | null>(null);

  // Step 5: Mechanic Matching
  const [isMatching, setIsMatching] = useState(false);
  const [matchedMechanics, setMatchedMechanics] = useState<MechanicMatchResult[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<MechanicMatchResult | null>(null);

  // Step 6: Confirmation
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Load customer's vehicles
  useEffect(() => {
    if (user && isOpen) {
      api.getVehicles(user.id).then(res => {
        setVehicles(res.vehicles || []);
        if (res.vehicles && res.vehicles.length > 0 && !selectedVehicleId) {
          setSelectedVehicleId(res.vehicles[0].id);
        }
      });
    }
    if (preselectedProblem) {
      setProblemType(preselectedProblem);
    }
  }, [user, isOpen, preselectedProblem]);

  if (!isOpen) return null;

  const handleNextToVehicle = () => {
    setCurrentStep(2);
  };

  const handleAddNewVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newVehicle.make || !newVehicle.model || !newVehicle.regNo) return;
    try {
      const res = await api.addVehicle({
        ...newVehicle,
        customerId: user.id
      });
      setVehicles(prev => [...prev, res.vehicle]);
      setSelectedVehicleId(res.vehicle.id);
      setShowAddVehicle(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVoiceToggle = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      // Simulate real-time speech-to-text recording
      setTimeout(() => {
        setIsRecordingVoice(false);
        setVoiceRecorded(true);
        if (!problemDescription) {
          setProblemDescription("The vehicle won't crank or start. All dashboard lights dim when I turn the key and there is a clicking sound.");
        }
      }, 3500);
    } else {
      setIsRecordingVoice(false);
    }
  };

  const handlePhotoUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI Diagnosis
  const handleRunDiagnosis = async () => {
    const chosenVehicle = vehicles.find(v => v.id === selectedVehicleId) || {
      type: 'car' as VehicleCategory,
      make: 'Vehicle',
      model: 'Model'
    };

    setIsDiagnosing(true);
    setCurrentStep(4);

    try {
      const res = await api.diagnose({
        problemType,
        description: problemDescription,
        vehicleType: chosenVehicle.type,
        vehicleMake: chosenVehicle.make,
        vehicleModel: chosenVehicle.model,
        imageDataUri: uploadedPhotoUrl || undefined
      });
      setDiagnosis(res.diagnosis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Run Matching
  const handleFindMechanics = async () => {
    if (!diagnosis) return;
    setIsMatching(true);
    setCurrentStep(5);

    const chosenVehicle = vehicles.find(v => v.id === selectedVehicleId);

    try {
      const res = await api.matchMechanics({
        customerLat: coords.lat,
        customerLng: coords.lng,
        vehicleType: chosenVehicle?.type || 'car',
        problemType: diagnosis.problemType,
        requiredEquipment: diagnosis.requiredEquipment
      });
      setMatchedMechanics(res.matches || []);
      if (res.matches && res.matches.length > 0) {
        setSelectedMechanic(res.matches[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMatching(false);
    }
  };

  // Submit Final Booking
  const handleConfirmBooking = async () => {
    if (!user || !selectedMechanic || !selectedVehicleId || !diagnosis) return;

    setIsSubmittingBooking(true);
    try {
      const chosenVehicle = vehicles.find(v => v.id === selectedVehicleId);
      const res = await api.createBooking({
        customerId: user.id,
        mechanicId: selectedMechanic.mechanicId,
        vehicleId: selectedVehicleId,
        problemType: diagnosis.problemType,
        problemDescription: problemDescription || diagnosis.problemTitle,
        customerLat: coords.lat,
        customerLng: coords.lng,
        customerAddress: locationAddress,
        mediaUrls: uploadedPhotoUrl ? [uploadedPhotoUrl] : [],
        aiDiagnosis: diagnosis
      });

      onBookingCreated(res.booking.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const chosenVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header with Step indicator */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Roadside Assistance Request
              </h2>
              <p className="text-[11px] text-slate-400">
                Step {currentStep} of 6: {
                  currentStep === 1 ? 'Location Detection' :
                  currentStep === 2 ? 'Select Vehicle' :
                  currentStep === 3 ? 'Problem Description' :
                  currentStep === 4 ? 'AI Diagnostics & Equipment' :
                  currentStep === 5 ? 'Select Verified Mechanic' : 'Final Booking Confirmation'
                }
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5">
          <div
            className="bg-amber-500 h-1.5 transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>

        {/* Body content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: LOCATION */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    Where are you currently stranded?
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    GPS detected coordinates are used for rapid dispatch. You can also pin directly on the map.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={detectLocation}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold self-start sm:self-auto transition-colors"
                >
                  Refresh GPS
                </button>
              </div>

              {/* Address input */}
              <div className="relative">
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="Enter current roadside location or landmark..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Leaflet map with customer marker */}
              <MapLeaflet
                center={[coords.lat, coords.lng]}
                zoom={14}
                customerPoint={{
                  lat: coords.lat,
                  lng: coords.lng,
                  title: 'Breakdown Site',
                  subtitle: locationAddress,
                  type: 'customer'
                }}
                onLocationSelect={(lat, lng) => {
                  setCoords({ lat, lng });
                  setLocationAddress(`Custom Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                }}
                height="320px"
              />

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel Request
                  </button>
                  <a
                    href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>Open in Google Maps ↗</span>
                  </a>
                </div>

                <button
                  onClick={handleNextToVehicle}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                >
                  <span>Confirm Location & Select Vehicle</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VEHICLE SELECTION */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-400" />
                    Which vehicle needs assistance?
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select your registered vehicle or add the vehicle details below.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddVehicle(!showAddVehicle)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  {showAddVehicle ? 'Cancel' : '+ Add New Vehicle'}
                </button>
              </div>

              {/* Existing vehicles cards */}
              {!showAddVehicle && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vehicles.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-4 rounded-2xl cursor-pointer border text-left transition-all ${
                        selectedVehicleId === v.id
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {v.type}
                        </span>
                        {selectedVehicleId === v.id && (
                          <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <h4 className="font-bold text-white text-base mt-2">
                        {v.make} {v.model}
                      </h4>
                      <div className="text-xs text-slate-400 font-mono mt-1">
                        {v.regNo} • {v.fuelType.toUpperCase()} ({v.year})
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Vehicle Form */}
              {showAddVehicle && (
                <form onSubmit={handleAddNewVehicle} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-amber-400">Add Vehicle Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400">Vehicle Type</label>
                      <select
                        value={newVehicle.type}
                        onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value as any })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="bike">Bike</option>
                        <option value="scooter">Scooter</option>
                        <option value="car">Car (Hatchback/Sedan)</option>
                        <option value="suv">SUV</option>
                        <option value="auto">Auto Rickshaw</option>
                        <option value="van">Van</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Manufacturer / Make</label>
                      <input
                        type="text"
                        placeholder="e.g. Hyundai, Honda, Tata"
                        value={newVehicle.make}
                        onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Model</label>
                      <input
                        type="text"
                        placeholder="e.g. Creta, Activa, Nexon"
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Registration Number</label>
                      <input
                        type="text"
                        placeholder="e.g. MH 02 AB 1234"
                        value={newVehicle.regNo}
                        onChange={(e) => setNewVehicle({ ...newVehicle, regNo: e.target.value.toUpperCase() })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Fuel Type</label>
                      <select
                        value={newVehicle.fuelType}
                        onChange={(e) => setNewVehicle({ ...newVehicle, fuelType: e.target.value as any })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric (EV)</option>
                        <option value="cng">CNG</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                      >
                        Save & Select
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                <button
                  disabled={!selectedVehicleId}
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                >
                  <span>Continue to Problem Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PROBLEM DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  What happened to your vehicle?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select the main category, describe the symptoms, or record a quick voice note.
                </p>
              </div>

              {/* Problem category pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'vehicle_wont_start', label: "Won't Start", icon: Car },
                  { id: 'flat_tyre', label: 'Flat Tyre', icon: Disc },
                  { id: 'battery_dead', label: 'Battery Dead', icon: BatteryCharging },
                  { id: 'engine_problem', label: 'Engine Problem', icon: Cpu },
                  { id: 'brake_problem', label: 'Brake Problem', icon: AlertTriangle },
                  { id: 'overheating', label: 'Overheating', icon: Flame },
                  { id: 'fuel_problem', label: 'Fuel Empty', icon: Fuel },
                  { id: 'electrical_problem', label: 'Electrical/Fuse', icon: Zap },
                  { id: 'accident_damage', label: 'Accident / Body', icon: ShieldAlert },
                  { id: 'key_lock_problem', label: 'Key / Lockout', icon: Key },
                  { id: 'other', label: 'Other Issue', icon: Wrench },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = problemType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProblemType(item.id as BreakdownProblem)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Text Description */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Describe what you see or hear:
                </label>
                <textarea
                  rows={3}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="e.g. Engine suddenly sputtered and died, smelling smoke or rapid clicking on start..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Voice & Photo Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Voice recording button */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleVoiceToggle}
                      className={`p-2.5 rounded-full transition-all ${
                        isRecordingVoice
                          ? 'bg-red-500 text-white animate-pulse'
                          : voiceRecorded
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isRecordingVoice ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {isRecordingVoice ? 'Listening...' : voiceRecorded ? 'Voice Note Transcribed' : 'Voice Description'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isRecordingVoice ? 'Speak now into microphone' : 'Tap mic to speak problem'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer w-full">
                    <div className="p-2.5 rounded-full bg-slate-800 text-slate-300 hover:text-white">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="flex-1 truncate">
                      <div className="text-xs font-bold text-white">
                        {uploadedPhotoUrl ? 'Photo Attached' : 'Upload Breakdown Photo'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {uploadedPhotoUrl ? 'Click to replace photo' : 'Damage, tyre, or engine bay'}
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUploadMock}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {uploadedPhotoUrl && (
                <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-amber-500/40">
                  <img src={uploadedPhotoUrl} alt="Breakdown" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setUploadedPhotoUrl(null)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                <button
                  onClick={handleRunDiagnosis}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Analyze with Roadfix AI</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: AI DIAGNOSIS & EQUIPMENT CHECKLIST */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in">
              {isDiagnosing ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto" />
                  <h3 className="text-base font-bold text-white">
                    Analyzing breakdown symptoms...
                  </h3>
                  <p className="text-xs text-slate-400">
                    Evaluating failure modes, estimating repair costs, and compiling equipment checklist.
                  </p>
                </div>
              ) : diagnosis ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                          AI Assessment
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                          diagnosis.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          diagnosis.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          Severity: {diagnosis.severity}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-white mt-2">
                        {diagnosis.problemTitle}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        <strong>Recommended Service:</strong> {diagnosis.recommendedService}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Estimated Cost</div>
                      <div className="text-lg font-black text-amber-400">
                        ₹{diagnosis.estimatedCost.totalMin} - ₹{diagnosis.estimatedCost.totalMax}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Est. Time: ~{diagnosis.estimatedTimeMinutes} mins
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Smart Equipment Checklist */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Required Equipment Checklist (Pre-dispatched to Mechanic)
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {diagnosis.requiredEquipment.map((eq, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 font-medium flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3 h-3 text-amber-400" />
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Possible causes & safe checks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                      <h5 className="font-bold text-slate-300">Possible Causes:</h5>
                      <ul className="space-y-1 list-disc list-inside text-slate-400">
                        {diagnosis.possibleCauses.slice(0, 3).map((cause, idx) => (
                          <li key={idx}>{cause}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                      <h5 className="font-bold text-emerald-400">Safe Roadside Actions:</h5>
                      <ul className="space-y-1 list-disc list-inside text-slate-400">
                        {diagnosis.safeChecks.slice(0, 3).map((check, idx) => (
                          <li key={idx}>{check}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {diagnosis.safetyWarning && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{diagnosis.safetyWarning}</span>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 italic flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{diagnosis.disclaimer}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        onClick={onClose}
                        className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    <button
                      onClick={handleFindMechanics}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <span>Find Suitable Nearby Mechanics</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* STEP 5: MECHANIC MATCHING & COMPARISON */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  Available Nearby Mechanics
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ranked by proximity, equipment match, rating, and verified credentials.
                </p>
              </div>

              {isMatching ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto" />
                  <h3 className="text-base font-bold text-white">Matching qualified technicians...</h3>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {matchedMechanics.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No online mechanics within range. Please expand service area or contact SOS.
                    </div>
                  ) : (
                    matchedMechanics.map((mech) => {
                      const isSelected = selectedMechanic?.mechanicId === mech.mechanicId;
                      return (
                        <div
                          key={mech.mechanicId}
                          onClick={() => setSelectedMechanic(mech)}
                          className={`p-4 rounded-2xl cursor-pointer border transition-all text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 shadow-lg'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <img
                              src={mech.avatar}
                              alt={mech.name}
                              className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-800 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-white">{mech.name}</h4>
                                {mech.isVerified && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                    <ShieldCheck className="w-3 h-3" />
                                    Verified
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">{mech.workshopName}</p>

                              <div className="flex items-center gap-3 text-xs text-slate-300 mt-1.5 flex-wrap">
                                <span className="text-amber-400 font-bold">★ {mech.rating}</span>
                                <span>({mech.reviewCount} reviews)</span>
                                <span>•</span>
                                <span>{mech.experienceYears}y exp</span>
                                <span>•</span>
                                <span className="text-cyan-400 font-medium">📍 {mech.distanceKm} km</span>
                                <span>•</span>
                                <span className="text-emerald-400 font-bold">⏱️ ~{mech.etaMinutes} mins ETA</span>
                              </div>

                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {mech.matchedEquipment.slice(0, 3).map((eq, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                    ✓ {eq}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:flex-col md:items-end w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                            <div>
                              <div className="text-[10px] text-slate-400 md:text-right">Base Service</div>
                              <div className="text-base font-extrabold text-amber-400">
                                ₹{mech.baseServiceFee}
                              </div>
                            </div>
                            <span className={`text-xs px-3 py-1 rounded-xl font-bold mt-2 ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {isSelected ? 'Selected' : 'Select'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                <button
                  disabled={!selectedMechanic}
                  onClick={() => setCurrentStep(6)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <span>Review & Confirm Booking</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: CONFIRMATION (Section 7 Booking System) */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Confirm Roadside Assistance Request
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review the breakdown details, mechanic assignment, and transparent estimated pricing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Details summary */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Incident & Vehicle Details
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Customer:</span>
                      <span className="font-semibold">{user?.name} ({user?.phone})</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Vehicle:</span>
                      <span className="font-semibold">{chosenVehicle?.make} {chosenVehicle?.model} ({chosenVehicle?.regNo})</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Problem:</span>
                      <span className="font-semibold capitalize">{problemType.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-semibold truncate max-w-[200px]">{locationAddress}</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 pt-2 border-t border-slate-800">
                    Assigned Mechanic
                  </h4>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedMechanic?.avatar}
                      alt={selectedMechanic?.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{selectedMechanic?.name}</div>
                      <div className="text-[11px] text-slate-400">{selectedMechanic?.workshopName}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">
                        ETA ~{selectedMechanic?.etaMinutes} mins • {selectedMechanic?.distanceKm} km away
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 13: Transparent Price Estimation */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Transparent Price Breakdown
                    </h4>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Base Callout & Inspection Fee</span>
                        <span className="font-mono">₹{selectedMechanic?.baseServiceFee || 150}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Travel Dispatch (~{selectedMechanic?.distanceKm} km)</span>
                        <span className="font-mono">₹{Math.round((selectedMechanic?.distanceKm || 2) * 25)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Technical Labour (Estimated)</span>
                        <span className="font-mono">₹{diagnosis?.estimatedCost.labour || 250}</span>
                      </div>
                      {diagnosis?.estimatedCost.parts ? (
                        <div className="flex justify-between text-slate-300">
                          <span>Spare Parts (Estimated)</span>
                          <span className="font-mono">₹{diagnosis.estimatedCost.parts}</span>
                        </div>
                      ) : null}
                      <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                        <span>Estimated Total</span>
                        <span className="text-amber-400 font-mono">
                          ₹{(selectedMechanic?.baseServiceFee || 150) + Math.round((selectedMechanic?.distanceKm || 2) * 25) + (diagnosis?.estimatedCost.labour || 250) + (diagnosis?.estimatedCost.parts || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 italic mt-3">
                    * The final bill will be confirmed after on-site physical inspection. Any additional parts or charges require your direct approval before being added.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSubmittingBooking}
                    onClick={handleConfirmBooking}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-amber-500/25 transition-transform hover:scale-[1.02]"
                  >
                    <CheckCircle2 className="w-5 h-5 text-slate-950" />
                    <span>{isSubmittingBooking ? 'Dispatched...' : 'Confirm Booking'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Vehicle } from '../../types';
import { VehicleFormFields, VehicleFormData } from '../common/VehicleFormFields';
import { Car, Plus, Trash2, Calendar, Gauge, Fuel, ArrowLeft } from 'lucide-react';

interface VehiclesViewProps {
  onBack?: () => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newVehicle, setNewVehicle] = useState<VehicleFormData>({
    type: '',
    make: '',
    model: '',
    year: '',
    regNo: '',
    fuelType: '',
    color: 'White'
  });

  const fetchVehicles = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.getVehicles(user.id);
      setVehicles(res.vehicles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newVehicle.type || !newVehicle.make || !newVehicle.model || !newVehicle.regNo) return;
    try {
      await api.addVehicle({
        type: newVehicle.type,
        make: newVehicle.make,
        model: newVehicle.model,
        year: newVehicle.year || new Date().getFullYear(),
        regNo: newVehicle.regNo.toUpperCase(),
        fuelType: newVehicle.fuelType || 'petrol',
        color: newVehicle.color || 'White',
        customerId: user.id
      });
      setNewVehicle({
        type: '',
        make: '',
        model: '',
        year: '',
        regNo: '',
        fuelType: '',
        color: 'White'
      });
      setShowAdd(false);
      fetchVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await api.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in text-left">
      {/* Top Back Navigation */}
      {onBack && (
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-colors shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>← Back to Dashboard</span>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Registered Vehicles</h2>
          <p className="text-xs text-slate-400">Manage cars, bikes, scooters, and fleet vehicles linked to your account</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{showAdd ? 'Cancel' : 'Add Vehicle'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="p-5 rounded-2xl bg-slate-900 border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Add New Vehicle Details</h3>
            <span className="text-[11px] text-slate-400">Searchable dropdowns • starts blank</span>
          </div>
          <VehicleFormFields
            data={newVehicle}
            onChange={setNewVehicle}
            required={true}
          />
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!newVehicle.type || !newVehicle.make || !newVehicle.model || !newVehicle.regNo}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              Save Vehicle to Garage
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading vehicles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group hover:border-slate-700 transition-all shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {v.type}
                </span>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                  title="Remove vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">
                  {v.make} {v.model}
                </h3>
                <div className="text-xs text-amber-400 font-mono mt-0.5 font-bold">
                  {v.regNo}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-slate-500" />
                  <span className="capitalize">{v.fuelType}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-slate-500" />
                  <span>{v.odometerKm?.toLocaleString() || 10000} km</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Last Service: {v.lastServiceDate || 'Recent'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

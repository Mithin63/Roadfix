import React, { useState, useEffect, useRef } from 'react';
import { VehicleCategory, FuelCategory } from '../../types';
import { VEHICLE_TYPES, FUEL_TYPES, VEHICLE_YEARS, getManufacturersByType, getModelsByMakeAndType } from '../../data/vehicleCatalog';
import { Car, ChevronDown, Check, Sparkles } from 'lucide-react';

export interface VehicleFormData {
  type: VehicleCategory | '';
  make: string;
  model: string;
  year: number | '';
  regNo: string;
  fuelType: FuelCategory | '';
  color?: string;
}

interface VehicleFormFieldsProps {
  data: VehicleFormData;
  onChange: (updated: VehicleFormData) => void;
  required?: boolean;
  compact?: boolean;
}

export const VehicleFormFields: React.FC<VehicleFormFieldsProps> = ({
  data,
  onChange,
  required = true,
  compact = false
}) => {
  const [makeQuery, setMakeQuery] = useState(data.make || '');
  const [modelQuery, setModelQuery] = useState(data.model || '');
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const makeContainerRef = useRef<HTMLDivElement>(null);
  const modelContainerRef = useRef<HTMLDivElement>(null);

  // Sync internal search input if parent data changes externally
  useEffect(() => {
    setMakeQuery(data.make || '');
  }, [data.make]);

  useEffect(() => {
    setModelQuery(data.model || '');
  }, [data.model]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (makeContainerRef.current && !makeContainerRef.current.contains(e.target as Node)) {
        setShowMakeDropdown(false);
      }
      if (modelContainerRef.current && !modelContainerRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered manufacturer suggestions based on selected type and user query
  const availableMakes = getManufacturersByType(data.type ? (data.type as VehicleCategory) : undefined);
  const filteredMakes = makeQuery.trim()
    ? availableMakes.filter(m => m.toLowerCase().includes(makeQuery.toLowerCase()))
    : availableMakes;

  // Filtered model suggestions based on selected make and user query
  const availableModels = getModelsByMakeAndType(data.make, data.type ? (data.type as VehicleCategory) : undefined);
  const filteredModels = modelQuery.trim()
    ? availableModels.filter(m => m.toLowerCase().includes(modelQuery.toLowerCase()))
    : availableModels;

  const handleTypeChange = (type: VehicleCategory | '') => {
    onChange({
      ...data,
      type
    });
  };

  const handleMakeSelect = (make: string) => {
    setMakeQuery(make);
    setShowMakeDropdown(false);
    // Reset model when make changes if model is not part of new make
    onChange({
      ...data,
      make,
      model: ''
    });
    setModelQuery('');
  };

  const handleMakeInputChange = (val: string) => {
    setMakeQuery(val);
    setShowMakeDropdown(true);
    onChange({
      ...data,
      make: val
    });
  };

  const handleModelSelect = (model: string) => {
    setModelQuery(model);
    setShowModelDropdown(false);
    onChange({
      ...data,
      model
    });
  };

  const handleModelInputChange = (val: string) => {
    setModelQuery(val);
    setShowModelDropdown(true);
    onChange({
      ...data,
      model: val
    });
  };

  const handleRegNoChange = (val: string) => {
    onChange({
      ...data,
      regNo: val.toUpperCase()
    });
  };

  const gridClass = compact
    ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs';

  return (
    <div className="space-y-3.5 text-left">
      <div className={gridClass}>
        {/* 1. Vehicle Type */}
        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
            Vehicle Type {required && <span className="text-amber-400">*</span>}
          </label>
          <select
            value={data.type}
            onChange={(e) => handleTypeChange(e.target.value as any)}
            required={required}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs field-input cursor-pointer"
          >
            <option value="" disabled>
              [ Select vehicle type ]
            </option>
            {VEHICLE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Manufacturer / Make (Searchable Dropdown) */}
        <div ref={makeContainerRef} className="relative">
          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
            Vehicle Manufacturer {required && <span className="text-amber-400">*</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="[ Select or type manufacturer ]"
              value={makeQuery}
              onChange={(e) => handleMakeInputChange(e.target.value)}
              onFocus={() => setShowMakeDropdown(true)}
              required={required}
              className="w-full px-3 py-2.5 pr-8 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs field-input"
            />
            <button
              type="button"
              onClick={() => setShowMakeDropdown(!showMakeDropdown)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Manufacturer Suggestions Dropdown */}
          {showMakeDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 divide-y divide-slate-800">
              <div className="p-2 text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1 bg-slate-950/60">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Suggestions ({filteredMakes.length})</span>
              </div>
              {filteredMakes.length === 0 ? (
                <div className="p-3 text-[11px] text-slate-400 italic">
                  No exact match. You can type custom manufacturer above.
                </div>
              ) : (
                filteredMakes.map((m) => {
                  const isSelected = data.make?.toLowerCase() === m.toLowerCase();
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleMakeSelect(m)}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        isSelected ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-200'
                      }`}
                    >
                      <span>{m}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 3. Model (Searchable Dropdown enabled after make) */}
        <div ref={modelContainerRef} className="relative">
          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
            Vehicle Model {required && <span className="text-amber-400">*</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={data.make ? `[ Select ${data.make} model ]` : '[ Select manufacturer first ]'}
              value={modelQuery}
              onChange={(e) => handleModelInputChange(e.target.value)}
              onFocus={() => {
                if (data.make) setShowModelDropdown(true);
              }}
              required={required}
              className="w-full px-3 py-2.5 pr-8 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs field-input disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => {
                if (data.make) setShowModelDropdown(!showModelDropdown);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Model Suggestions Dropdown */}
          {showModelDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 divide-y divide-slate-800">
              <div className="p-2 text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1 bg-slate-950/60">
                <Car className="w-3 h-3 text-amber-400" />
                <span>{data.make} Models ({filteredModels.length})</span>
              </div>
              {filteredModels.length === 0 ? (
                <div className="p-3 text-[11px] text-slate-400 italic">
                  Type your specific model name above if not listed.
                </div>
              ) : (
                filteredModels.map((mod) => {
                  const isSelected = data.model?.toLowerCase() === mod.toLowerCase();
                  return (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => handleModelSelect(mod)}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        isSelected ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-200'
                      }`}
                    >
                      <span>{mod}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 4. Year */}
        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
            Manufacturing Year {required && <span className="text-amber-400">*</span>}
          </label>
          <select
            value={data.year || ''}
            onChange={(e) => onChange({ ...data, year: e.target.value ? Number(e.target.value) : '' })}
            required={required}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs field-input cursor-pointer"
          >
            <option value="" disabled>
              [ Select year ]
            </option>
            {VEHICLE_YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Registration Number */}
        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
            Registration Number {required && <span className="text-amber-400">*</span>}
          </label>
          <input
            type="text"
            placeholder="e.g. AP 16 AB 1234 / MH 02 CD 5678"
            value={data.regNo || ''}
            onChange={(e) => handleRegNoChange(e.target.value)}
            required={required}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs uppercase font-mono tracking-wider field-input"
          />
        </div>

        {/* 6. Fuel Type */}
        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
            Fuel Type {required && <span className="text-amber-400">*</span>}
          </label>
          <select
            value={data.fuelType || ''}
            onChange={(e) => onChange({ ...data, fuelType: e.target.value as any })}
            required={required}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs field-input cursor-pointer"
          >
            <option value="" disabled>
              [ Select fuel type ]
            </option>
            {FUEL_TYPES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

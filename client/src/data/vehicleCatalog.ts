import { VehicleCategory, FuelCategory } from '../types';

export interface ManufacturerModels {
  make: string;
  types: VehicleCategory[];
  models: string[];
}

export const VEHICLE_TYPES: { id: VehicleCategory; label: string }[] = [
  { id: 'car', label: 'Car (Hatchback / Sedan)' },
  { id: 'suv', label: 'SUV / Compact SUV / MUV' },
  { id: 'bike', label: 'Motorcycle / Bike' },
  { id: 'scooter', label: 'Scooter / EV Scooter' },
  { id: 'auto', label: 'Auto Rickshaw' },
  { id: 'van', label: 'Van / Minivan' },
  { id: 'other', label: 'Other Commercial / Truck' }
];

export const FUEL_TYPES: { id: FuelCategory; label: string }[] = [
  { id: 'petrol', label: 'Petrol' },
  { id: 'diesel', label: 'Diesel' },
  { id: 'electric', label: 'Electric (EV)' },
  { id: 'cng', label: 'CNG' },
  { id: 'hybrid', label: 'Hybrid' }
];

export const VEHICLE_CATALOG: ManufacturerModels[] = [
  // Multi-type / Popular Car & SUV Manufacturers
  {
    make: 'Maruti Suzuki',
    types: ['car', 'suv', 'van'],
    models: ['Swift', 'Baleno', 'Dzire', 'Brezza', 'Fronx', 'Grand Vitara', 'Ertiga', 'Wagon R', 'Alto K10', 'Celerio', 'Ignis', 'Jimny', 'Eeco', 'XL6', 'Ciaz', 'Invicto']
  },
  {
    make: 'Hyundai',
    types: ['car', 'suv'],
    models: ['Creta', 'Venue', 'i20', 'Grand i10 Nios', 'Verna', 'Exter', 'Alcazar', 'Tucson', 'Ioniq 5', 'Aura', 'Santro']
  },
  {
    make: 'Tata Motors',
    types: ['car', 'suv', 'van'],
    models: ['Nexon', 'Punch', 'Harrier', 'Safari', 'Altroz', 'Tiago', 'Tigor', 'Curvv', 'Nexon EV', 'Punch EV', 'Tiago EV', 'Ace', 'Winger']
  },
  {
    make: 'Mahindra',
    types: ['suv', 'car', 'van'],
    models: ['Scorpio-N', 'Scorpio Classic', 'XUV700', 'XUV 3XO', 'Thar', 'Thar Roxx', 'Bolero', 'Bolero Neo', 'XUV400 EV', 'Marazzo']
  },
  {
    make: 'Honda',
    types: ['car', 'suv', 'bike', 'scooter'],
    models: [
      'City', 'Amaze', 'Elevate', 'Civic', 'Jazz', 'WR-V', 'CR-V',
      'Activa 6G', 'Activa 125', 'Dio', 'Dio 125', 'Shine 125', 'SP 125', 'Unicorn', 'Hornet 2.0', 'CB350', 'Hness CB350', 'CB200X', 'CBR 650R'
    ]
  },
  {
    make: 'Toyota',
    types: ['car', 'suv'],
    models: ['Innova Crysta', 'Innova Hycross', 'Fortuner', 'Urban Cruiser Hyryder', 'Glanza', 'Rumion', 'Hilux', 'Camry', 'Vellfire']
  },
  {
    make: 'Kia',
    types: ['car', 'suv'],
    models: ['Seltos', 'Sonet', 'Carens', 'EV6', 'Carnival', 'EV9']
  },
  {
    make: 'Volkswagen',
    types: ['car', 'suv'],
    models: ['Taigun', 'Virtus', 'Polo', 'Vento', 'Tiguan']
  },
  {
    make: 'Skoda',
    types: ['car', 'suv'],
    models: ['Kushaq', 'Slavia', 'Kylaq', 'Octavia', 'Superb', 'Kodiaq', 'Rapid']
  },
  {
    make: 'MG Motor',
    types: ['car', 'suv'],
    models: ['Hector', 'Hector Plus', 'Astor', 'ZS EV', 'Comet EV', 'Gloster', 'Windsor EV']
  },
  {
    make: 'Renault',
    types: ['car', 'suv'],
    models: ['Kwid', 'Kiger', 'Triber', 'Duster']
  },
  {
    make: 'Nissan',
    types: ['car', 'suv'],
    models: ['Magnite', 'Kicks', 'Sunny', 'Terrano', 'X-Trail']
  },
  {
    make: 'BMW',
    types: ['car', 'suv', 'bike'],
    models: ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'iX', 'G 310 R', 'G 310 GS', 'S 1000 RR']
  },
  {
    make: 'Mercedes-Benz',
    types: ['car', 'suv'],
    models: ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'EQE', 'EQS']
  },
  {
    make: 'Audi',
    types: ['car', 'suv'],
    models: ['A4', 'A6', 'A8 L', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron']
  },
  {
    make: 'Ford',
    types: ['car', 'suv'],
    models: ['EcoSport', 'Endeavour', 'Figo', 'Aspire', 'Freestyle', 'Mustang']
  },

  // 2-Wheelers (Bikes & Scooters)
  {
    make: 'Hero MotoCorp',
    types: ['bike', 'scooter'],
    models: ['Splendor Plus', 'Splendor Plus XTEC', 'HF Deluxe', 'Passion Plus', 'Glamour', 'Xtreme 125R', 'Xtreme 160R', 'Xpulse 200 4V', 'Mavrick 440', 'Destini 125', 'Pleasure Plus', 'Xoom 110', 'Vida V1']
  },
  {
    make: 'TVS Motor',
    types: ['bike', 'scooter'],
    models: ['Jupiter', 'Jupiter 125', 'Ntorq 125', 'iQube Electric', 'Zest 110', 'Apache RTR 160', 'Apache RTR 160 4V', 'Apache RTR 200 4V', 'Apache RR 310', 'Raider 125', 'Ronin', 'Radeon', 'Sport', 'XL100']
  },
  {
    make: 'Bajaj Auto',
    types: ['bike', 'scooter', 'auto'],
    models: ['Pulsar 150', 'Pulsar NS200', 'Pulsar N160', 'Pulsar N250', 'Pulsar 125', 'Pulsar RS200', 'Pulsar NS400Z', 'Platina 100', 'Platina 110', 'CT 110X', 'Avenger Cruise 220', 'Avenger Street 160', 'Dominar 400', 'Dominar 250', 'Chetak EV', 'Compact RE Auto', 'Maxima Auto']
  },
  {
    make: 'Royal Enfield',
    types: ['bike'],
    models: ['Classic 350', 'Hunter 350', 'Bullet 350', 'Meteor 350', 'Himalayan 450', 'Guerrilla 450', 'Continental GT 650', 'Interceptor 650', 'Super Meteor 650', 'Shotgun 650']
  },
  {
    make: 'Yamaha',
    types: ['bike', 'scooter'],
    models: ['YZF R15 V4', 'MT-15 V2', 'FZ-S FI V4', 'FZ FI', 'FZ-X', 'Aerox 155', 'RayZR 125 FI', 'Fascino 125 FI', 'R3', 'MT-03']
  },
  {
    make: 'Suzuki 2-Wheelers',
    types: ['bike', 'scooter'],
    models: ['Access 125', 'Burgman Street', 'Avenis 125', 'Gixxer 150', 'Gixxer SF 150', 'Gixxer 250', 'Gixxer SF 250', 'V-Strom SX 250', 'Hayabusa']
  },
  {
    make: 'KTM',
    types: ['bike'],
    models: ['Duke 200', 'Duke 250', 'Duke 390', 'Duke 125', 'RC 200', 'RC 390', '390 Adventure', '250 Adventure']
  },
  {
    make: 'Ather Energy',
    types: ['scooter'],
    models: ['450X', '450S', '450 Apex', 'Rizta']
  },
  {
    make: 'Ola Electric',
    types: ['scooter', 'bike'],
    models: ['S1 Pro Gen 2', 'S1 Air', 'S1 X', 'S1 X+', 'Roadster', 'Roadster Pro']
  },
  {
    make: 'Piaggio / Vespa',
    types: ['scooter', 'auto'],
    models: ['Vespa ZX 125', 'Vespa VXL 150', 'Vespa SXL 150', 'Aprilia SR 160', 'Aprilia SR 125', 'Aprilia Storm 125', 'Ape Auto Rickshaw', 'Ape E-City EV']
  },

  // Commercial / Fleet
  {
    make: 'Force Motors',
    types: ['van', 'suv', 'other'],
    models: ['Traveller', 'Trax Cruiser', 'Gurkha', 'Urbania']
  },
  {
    make: 'Ashok Leyland',
    types: ['van', 'other'],
    models: ['Dost+', 'Bada Dost', 'Partner', 'Stile']
  },
  {
    make: 'Piaggio Auto',
    types: ['auto'],
    models: ['Ape DX', 'Ape City Plus', 'Ape E-Xtra', 'Ape Auto DX']
  }
];

// Helper to filter manufacturers by vehicle type
export function getManufacturersByType(type?: VehicleCategory): string[] {
  if (!type) {
    return Array.from(new Set(VEHICLE_CATALOG.map(c => c.make)));
  }
  const matching = VEHICLE_CATALOG.filter(c => c.types.includes(type));
  return matching.length > 0
    ? matching.map(c => c.make)
    : Array.from(new Set(VEHICLE_CATALOG.map(c => c.make)));
}

// Helper to get model suggestions given make and vehicle type
export function getModelsByMakeAndType(make: string, type?: VehicleCategory): string[] {
  if (!make) return [];
  const entry = VEHICLE_CATALOG.find(c => c.make.toLowerCase() === make.toLowerCase());
  if (!entry) return [];
  return entry.models;
}

// Year dropdown range: current year down to 1995
export const VEHICLE_YEARS: number[] = Array.from({ length: 32 }, (_, i) => new Date().getFullYear() + 1 - i);

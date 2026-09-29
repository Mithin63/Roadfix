import { AIDiagnosis, BreakdownProblem, VehicleCategory } from '../types';
import { PROBLEM_CATALOG } from '../data/seeds';

export interface DiagnosisInput {
  problemType: BreakdownProblem;
  description: string;
  vehicleType: VehicleCategory;
  vehicleMake?: string;
  vehicleModel?: string;
  imageDataUri?: string;
}

export function performAIDiagnosis(input: DiagnosisInput): AIDiagnosis {
  const { problemType, description, vehicleType, vehicleMake, vehicleModel, imageDataUri } = input;
  const catalogEntry = PROBLEM_CATALOG.find(p => p.id === problemType) || PROBLEM_CATALOG[PROBLEM_CATALOG.length - 1];

  const descLower = (description || '').toLowerCase();

  // Smart equipment determination
  const requiredEquipment = [...catalogEntry.requiredEquipment];
  const safeChecks: string[] = [];
  const possibleCauses: string[] = [];
  let severity: AIDiagnosis['severity'] = catalogEntry.severity;
  let safetyWarning: string | undefined = undefined;

  let baseLabour = catalogEntry.labourEst;
  let estParts = 0;
  let estTime = catalogEntry.timeEstMinutes;

  if (problemType === 'battery_dead' || descLower.includes('battery') || descLower.includes('click')) {
    possibleCauses.push(
      'Deep discharge due to headlights, dashcam, or cabin light left on',
      'Sulfated lead-acid plates or expired battery cells (typically 2-3 years lifespan)',
      'Loose or corroded battery terminal cables inhibiting cold cranking amps',
      'Alternator voltage regulator failure failing to sustain charge under load'
    );
    safeChecks.push(
      'Turn off all electrical accessories: AC, headlights, infotainment system.',
      'Check if dashboard warning battery symbol illuminates when key is in accessory mode.',
      'Inspect if battery clamp terminals appear loose or covered in white/green sulfate powder.'
    );
    safetyWarning = 'Never attempt to jump-start a cracked or leaking battery. Do not use naked flames near lead-acid batteries.';
    estParts = descLower.includes('replace') || descLower.includes('old') ? 3500 : 0;
  } else if (problemType === 'flat_tyre' || descLower.includes('tyre') || descLower.includes('tire') || descLower.includes('puncture')) {
    possibleCauses.push(
      'Foreign object penetration (construction nail, screw, sharp glass)',
      'Valve stem failure or leaking valve core seal',
      'Bead unseating or rim deformation after high-speed pothole impact'
    );
    safeChecks.push(
      'Guide vehicle safely onto the leftmost shoulder or flat parking zone.',
      'Turn on hazard warning lights and place warning triangle 30 meters behind.',
      'Confirm whether spare wheel and jack kit are present in trunk/boot.'
    );
    safetyWarning = 'Never crawl under a vehicle supported only by a scissor jack; always ensure wheels are chocked.';
    estParts = 150; // Puncture strip or valve
  } else if (problemType === 'overheating' || descLower.includes('heat') || descLower.includes('steam') || descLower.includes('coolant')) {
    severity = 'critical';
    possibleCauses.push(
      'Radiator hose split or loosened tension clamp causing coolant loss',
      'Radiator pressure cap spring failure allowing coolant to boil over',
      'Cooling fan relay or electric motor burned out',
      'Thermostat valve stuck in closed position'
    );
    safeChecks.push(
      'Immediately turn off the engine and pull over to prevent cylinder head warpage.',
      'Pop open the bonnet latch from inside the cabin, but DO NOT touch the hot hood or cap.',
      'Look for visible puddles of brightly colored fluid (green, pink, or orange) underneath.'
    );
    safetyWarning = 'CRITICAL: NEVER open the radiator cap or coolant reservoir while engine is hot! Scalding pressurized steam can cause 3rd-degree burns.';
    estParts = 650; // Coolant + clamp
    estTime = 45;
  } else if (problemType === 'brake_problem' || descLower.includes('brake')) {
    severity = 'critical';
    possibleCauses.push(
      'Air intrusion in hydraulic brake lines causing spongy pedal feel',
      'Worn brake friction pads down to metal backing plate',
      'Brake master cylinder internal seal bypass or caliper bleed valve weep'
    );
    safeChecks.push(
      'DO NOT attempt to drive in traffic if pedal sinks to floor.',
      'Test handbrake/emergency brake hold at standstill.',
      'Inspect brake fluid reservoir level under the hood (between MIN and MAX markings).'
    );
    safetyWarning = 'Driving with compromised hydraulic brakes presents an immediate danger to life. Professional towing or on-site bleeding required.';
    estParts = 400;
  } else if (problemType === 'fuel_problem' || descLower.includes('fuel') || descLower.includes('petrol') || descLower.includes('diesel')) {
    severity = 'low';
    possibleCauses.push(
      'Fuel starvation / empty tank due to faulty fuel sender float',
      'Fuel pump relay or in-tank pump strainer clogging'
    );
    safeChecks.push(
      'Check fuel gauge indicator with ignition turned on.',
      'Look around vehicle for any strong smell of spilled fuel or ruptured lines.'
    );
    safetyWarning = 'Do not smoke, vape, or produce sparks near the fuel filler neck.';
    estParts = 300; // fuel cost
  } else {
    possibleCauses.push(
      'Mechanical component fatigue or road vibration loosening fasteners',
      'Electrical harness contact oxidation or blown fuse',
      'Fuel / air / ignition timing mismatch'
    );
    safeChecks.push(
      'Ensure vehicle is safely clear of moving road traffic with hazard flashers on.',
      'Check fluid levels (oil, coolant) if safe to open engine bay.'
    );
  }

  // Adjust for vehicle type
  if (vehicleType === 'bike' || vehicleType === 'scooter') {
    requiredEquipment.push('Motorcycle Paddock / Center Stand Tool', 'Compact Spoke / Hex Key Set');
    baseLabour = Math.round(baseLabour * 0.75);
  } else if (vehicleType === 'suv' || vehicleType === 'van') {
    requiredEquipment.push('Heavy Duty 3-Ton Hydraulic Trolley Jack', 'High-Torque Telescopic Lug Wrench');
    baseLabour = Math.round(baseLabour * 1.2);
  }

  // Image analysis tags if provided
  let imageAnalysisResult = undefined;
  if (imageDataUri) {
    imageAnalysisResult = analyzeBreakdownImage(imageDataUri, problemType);
  }

  const baseService = catalogEntry.basePrice;
  const travel = 60;
  const labour = baseLabour;
  const parts = estParts;
  const totalMin = baseService + travel + labour + parts;
  const totalMax = Math.round(totalMin * 1.35);

  return {
    id: `diag-${Date.now()}`,
    problemType,
    problemTitle: `${catalogEntry.label} on ${vehicleMake || ''} ${vehicleModel || vehicleType.toUpperCase()}`.trim(),
    possibleCauses,
    severity,
    recommendedService: catalogEntry.recommendedService,
    requiredEquipment: Array.from(new Set(requiredEquipment)),
    estimatedCost: {
      baseService,
      travel,
      labour,
      parts,
      totalMin,
      totalMax
    },
    estimatedTimeMinutes: estTime,
    safeChecks,
    safetyWarning,
    disclaimer: 'AI-generated assessment based on reported symptoms — verified on-site by certified RoadRescue mechanic.',
    imageAnalysisResult
  };
}

export function analyzeBreakdownImage(imageDataUri: string, hintProblem?: BreakdownProblem) {
  // Mock image computer-vision analysis
  const tags: string[] = ['roadside_breakdown', 'vehicle_exterior'];
  let identifiedDamage = 'Visual evidence consistent with reported mechanical breakdown';
  let confidence = 0.92;

  if (hintProblem === 'flat_tyre') {
    tags.push('tyre_sidewall', 'tread_puncture', 'low_profile_rim');
    identifiedDamage = 'Deflated tyre profile with road contact deformation. No catastrophic rim cracking detected.';
    confidence = 0.94;
  } else if (hintProblem === 'battery_dead') {
    tags.push('engine_bay', 'battery_terminal', 'lead_acid_casing');
    identifiedDamage = '12V vehicle battery compartment visible. Potential surface terminal oxidation detected.';
    confidence = 0.89;
  } else if (hintProblem === 'accident_damage') {
    tags.push('bumper_fascia', 'fender_displacement', 'crumple_zone');
    identifiedDamage = 'Impact damage to front/rear fascia with loose retaining clips. Steering tie rod clearance check advised.';
    confidence = 0.95;
  } else {
    tags.push('mechanical_assembly', 'under_bonnet_component');
    identifiedDamage = 'Engine compartment component inspection. Professional diagnostic scanner required for deep code lookup.';
    confidence = 0.88;
  }

  return {
    identifiedDamage,
    confidence,
    tags
  };
}

export function getAIAssistantResponse(query: string) {
  const q = query.toLowerCase();

  if (q.includes('bike') && (q.includes('start') || q.includes('crank'))) {
    return {
      title: 'Bike Not Starting Troubleshooting',
      severity: 'medium',
      causes: [
        'Side-stand interlock safety switch engaged or stuck',
        'Engine kill switch toggled into OFF position',
        'Weak battery voltage incapable of turning starter relay',
        'Fouled spark plug or clogged carburetor/fuel injector'
      ],
      safeChecks: [
        'Confirm kill switch is set to RUN and side stand is completely retracted.',
        'Shift bike into Neutral and pull the clutch lever in while pressing starter.',
        'Turn on headlight — if dim, battery charge is depleted.'
      ],
      dangerWarning: 'Do not push start (bump start) a bike in heavy highway traffic.',
      recommendedService: 'Two-Wheeler Mobile Ignition & Battery Diagnostics',
      suggestedMechanicType: 'Motorcycle & Scooter Mobile Specialist',
      equipmentNeeded: ['Multimeter', 'Spark plug socket', 'Portable jump starter']
    };
  }

  if (q.includes('overheat') || q.includes('smoke') || q.includes('temperature') || q.includes('steam')) {
    return {
      title: 'Vehicle Overheating Emergency',
      severity: 'critical',
      causes: [
        'Coolant leak through burst hose, cracked radiator or loose clamp',
        'Radiator cooling fan failure',
        'Stuck thermostat valve preventing coolant flow'
      ],
      safeChecks: [
        'PULL OVER SAFELY IMMEDIATELY and turn off engine to avoid blown head gasket.',
        'Turn heater to full blast if in slow traffic to pull heat off engine block.',
        'Wait minimum 25-30 minutes before popping hood open.'
      ],
      dangerWarning: 'DANGER: NEVER remove radiator cap while engine is hot! Scalding coolant will spray outward.',
      recommendedService: 'Coolant Hose Seal & High-Temp Cooling Overhaul',
      suggestedMechanicType: 'Cooling System & Engine Technician',
      equipmentNeeded: ['Infrared thermometer', 'Coolant refill can', 'Hose tension clamps']
    };
  }

  if (q.includes('click') || q.includes('clicking') || q.includes('battery')) {
    return {
      title: 'Rapid Clicking Sound On Ignition',
      severity: 'medium',
      causes: [
        'Starter solenoid chattering due to insufficient battery amperage',
        'Corroded or loose battery lead terminals',
        'Faulty starter motor ground strap'
      ],
      safeChecks: [
        'Check battery terminal clamps for white or green powdery buildup.',
        'Do not repeatedly hold the key cranked down — this can burn the starter coil.',
        'Try turning key to ACC to see if dashboard displays lit up bright.'
      ],
      dangerWarning: 'Never hammer on battery terminals or bridge terminal posts with a metal wrench.',
      recommendedService: 'High-Current Jump Start & Alternator Diagnostic',
      suggestedMechanicType: 'Auto Electrician & Roadside Battery Rescue',
      equipmentNeeded: ['Digital battery tester', '12V industrial booster pack', 'Terminal cleaner']
    };
  }

  if (q.includes('tyre') || q.includes('tire') || q.includes('puncture') || q.includes('flat')) {
    return {
      title: 'Flat Tyre / Low Pressure Alert',
      severity: 'medium',
      causes: [
        'Nail, bolt, or road debris puncture through tyre tread',
        'Damaged rubber valve stem or leaking core',
        'Alloy rim bead seat failure'
      ],
      safeChecks: [
        'Move to a firm, level paved surface away from oncoming lanes.',
        'Engage handbrake and leave vehicle in gear (or Park for automatics).',
        'Check if tyre is punctured or unseated from rim.'
      ],
      dangerWarning: 'Do not drive on a flat tyre — doing so will destroy the sidewall and bend expensive alloy rims within 200 meters.',
      recommendedService: 'Tubeless Puncture Plugging & High-CFM Inflator',
      suggestedMechanicType: 'Tyre & Wheel Roadside Specialist',
      equipmentNeeded: ['Hydraulic jack', 'Wheel spanner', 'Vulcanized plug strip kit', '12V tyre inflator']
    };
  }

  return {
    title: 'General Roadside Assistance Guidance',
    severity: 'medium',
    causes: [
      'Mechanical wear or unexpected road shock damage',
      'Electronic sensor safeguard or fuse disconnect'
    ],
    safeChecks: [
      'Ensure your safety and passenger safety first — stay outside moving traffic lanes.',
      'Deploy hazard flasher lights to make your vehicle visible to approaching motorists.',
      'Use the Roadfix "Get Help Now" button to dispatch a verified technician.'
    ],
    dangerWarning: 'Never attempt complex mechanical teardowns on high-speed road shoulders.',
    recommendedService: 'Comprehensive On-Site Diagnostics',
    suggestedMechanicType: 'Certified Roadside Mobile Technician',
    equipmentNeeded: ['Diagnostic scanner', 'Metric hand toolkit', 'Safety cones']
  };
}

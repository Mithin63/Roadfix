import { AIDiagnosis, BreakdownProblem, VehicleCategory } from '../types';
import { PROBLEM_CATALOG } from '../data/seeds';

export interface DiagnosisInput {
  problemType?: BreakdownProblem;
  problemTypes?: BreakdownProblem[];
  description: string;
  vehicleType: VehicleCategory;
  vehicleMake?: string;
  vehicleModel?: string;
  imageDataUri?: string;
}

export function performAIDiagnosis(input: DiagnosisInput): AIDiagnosis {
  const { problemType, problemTypes, description, vehicleType, vehicleMake, vehicleModel, imageDataUri } = input;
  
  // Normalize problem types array
  const selectedTypes: BreakdownProblem[] = (problemTypes && problemTypes.length > 0)
    ? problemTypes
    : [problemType || 'other'];

  const primaryProblem = selectedTypes[0] || 'other';

  // Find catalog entries for all selected problem types
  const catalogEntries = selectedTypes.map(pt =>
    PROBLEM_CATALOG.find(p => p.id === pt) || PROBLEM_CATALOG[PROBLEM_CATALOG.length - 1]
  );

  const descLower = (description || '').toLowerCase();

  // Aggregate required equipment from all selected problems
  const requiredEquipmentSet = new Set<string>();
  catalogEntries.forEach(entry => {
    entry.requiredEquipment.forEach(eq => requiredEquipmentSet.add(eq));
  });

  const safeChecks: string[] = [];
  const possibleCauses: string[] = [];
  const safetyWarnings: string[] = [];

  // Determine aggregate severity (critical > high > medium > low)
  const severityRank: Record<AIDiagnosis['severity'], number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  };

  let maxSeverityRank = 1;
  let severity: AIDiagnosis['severity'] = 'medium';

  catalogEntries.forEach(entry => {
    const rank = severityRank[entry.severity] || 2;
    if (rank > maxSeverityRank) {
      maxSeverityRank = rank;
      severity = entry.severity;
    }
  });

  let baseLabour = 0;
  let estParts = 0;
  let estTime = 0;
  let baseService = 0;

  // Aggregate pricing and details per problem type
  selectedTypes.forEach((pt, index) => {
    const entry = catalogEntries[index];
    // Apply bundled discount for additional problem types (full price for first, 60% for subsequent)
    const factor = index === 0 ? 1 : 0.6;
    baseLabour += Math.round(entry.labourEst * factor);
    baseService += index === 0 ? entry.basePrice : Math.round(entry.basePrice * 0.5);
    estTime += Math.round(entry.timeEstMinutes * factor);

    if (pt === 'battery_dead' || descLower.includes('battery') || descLower.includes('click')) {
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
      safetyWarnings.push('Never attempt to jump-start a cracked or leaking battery. Do not use naked flames near lead-acid batteries.');
      estParts += descLower.includes('replace') || descLower.includes('old') ? 3500 : 0;
    } else if (pt === 'flat_tyre' || descLower.includes('tyre') || descLower.includes('tire') || descLower.includes('puncture')) {
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
      safetyWarnings.push('Never crawl under a vehicle supported only by a scissor jack; always ensure wheels are chocked.');
      estParts += 150; // Puncture strip or valve
    } else if (pt === 'overheating' || descLower.includes('heat') || descLower.includes('steam') || descLower.includes('coolant')) {
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
      safetyWarnings.push('CRITICAL: NEVER open the radiator cap or coolant reservoir while engine is hot! Scalding pressurized steam can cause 3rd-degree burns.');
      estParts += 650; // Coolant + clamp
    } else if (pt === 'brake_problem' || descLower.includes('brake')) {
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
      safetyWarnings.push('Driving with compromised hydraulic brakes presents an immediate danger to life. Professional towing or on-site bleeding required.');
      estParts += 400;
    } else if (pt === 'fuel_problem' || descLower.includes('fuel') || descLower.includes('petrol') || descLower.includes('diesel')) {
      possibleCauses.push(
        'Fuel starvation / empty tank due to faulty fuel sender float',
        'Fuel pump relay or in-tank pump strainer clogging'
      );
      safeChecks.push(
        'Check fuel gauge indicator with ignition turned on.',
        'Look around vehicle for any strong smell of spilled fuel or ruptured lines.'
      );
      safetyWarnings.push('Do not smoke, vape, or produce sparks near the fuel filler neck.');
      estParts += 300; // fuel cost
    } else if (pt === 'vehicle_wont_start') {
      possibleCauses.push(
        'Starter motor relay or ignition coil circuit failure',
        'Fuel pump failure preventing engine combustion',
        'Neutral safety switch or clutch interlock switch sensor open'
      );
      safeChecks.push(
        'Check battery voltage and observe dashboard warning indicators.',
        'Ensure vehicle transmission is firmly in Park / Neutral.'
      );
    } else if (pt === 'electrical_problem') {
      possibleCauses.push(
        'Blown primary main fuse or fusebox relay fault',
        'Damaged or shorted wiring harness',
        'Alternator diode bridge failure'
      );
      safeChecks.push(
        'Inspect the main under-hood fuse box for blown fuses.',
        'Disconnect aftermarket accessories that may cause power draw.'
      );
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
  });

  // Adjust for vehicle type
  if (vehicleType === 'bike' || vehicleType === 'scooter') {
    requiredEquipmentSet.add('Motorcycle Paddock / Center Stand Tool');
    requiredEquipmentSet.add('Compact Spoke / Hex Key Set');
    baseLabour = Math.round(baseLabour * 0.75);
  } else if (vehicleType === 'suv' || vehicleType === 'van') {
    requiredEquipmentSet.add('Heavy Duty 3-Ton Hydraulic Trolley Jack');
    requiredEquipmentSet.add('High-Torque Telescopic Lug Wrench');
    baseLabour = Math.round(baseLabour * 1.2);
  }

  // Image analysis tags if provided
  let imageAnalysisResult = undefined;
  if (imageDataUri) {
    imageAnalysisResult = analyzeBreakdownImage(imageDataUri, primaryProblem);
  }

  const travel = 60;
  const labour = Math.max(150, baseLabour);
  const parts = estParts;
  const totalMin = baseService + travel + labour + parts;
  const totalMax = Math.round(totalMin * 1.35);

  const problemLabels = catalogEntries.map(e => e.label).join(' & ');
  const recommendedServices = catalogEntries.map(e => e.recommendedService).join(' + ');

  return {
    id: `diag-${Date.now()}`,
    problemType: primaryProblem,
    problemTypes: selectedTypes,
    problemTitle: `${problemLabels} on ${vehicleMake || ''} ${vehicleModel || vehicleType.toUpperCase()}`.trim(),
    possibleCauses: Array.from(new Set(possibleCauses)),
    severity,
    recommendedService: recommendedServices,
    requiredEquipment: Array.from(requiredEquipmentSet),
    estimatedCost: {
      baseService,
      travel,
      labour,
      parts,
      totalMin,
      totalMax
    },
    estimatedTimeMinutes: Math.max(25, estTime),
    safeChecks: Array.from(new Set(safeChecks)),
    safetyWarning: safetyWarnings.length > 0 ? safetyWarnings.join(' ') : undefined,
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

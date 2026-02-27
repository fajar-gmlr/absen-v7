/**
 * Toolbox Engineering Calculations
 * Based on PRD Section 3.4
 */

/**
 * Linear Interpolation calculation
 * Formula: y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
 */
export function linearInterpolation(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  targetX: number
): number {
  if (x2 === x1) throw new Error('x1 and x2 cannot be equal');
  return y1 + (targetX - x1) * ((y2 - y1) / (x2 - x1));
}

/**
 * Calculate Displacer output for Waterdraw Calculator
 * If Value is in mm: Output = (mm / Inside Diameter) * 100 = % of diameter
 * If Value is in %: Output = (%/100) * Inside Diameter * π = circumference in mm
 */
export function calculateDisplacer(
  nominalDiameter: number,
  wallThickness: number,
  value: number,
  valueUnit: 'mm' | '%'
): number {
  // Convert to mm if needed
  const nominalDiameterMM = nominalDiameter * 25.4; // inch to mm
  const wallThicknessMM = wallThickness * 25.4; // inch to mm
  const insideDiameter = nominalDiameterMM - (wallThicknessMM * 2);

  if (valueUnit === 'mm') {
    // mm → % of diameter: (mm / diameter) * 100
    return (value / insideDiameter) * 100;
  } else {
    // % → circumference: (%/100) * diameter * π
    return (value / 100) * insideDiameter * Math.PI;
  }
}

/**
 * CPL (Correction for Pressure Liquid) = 1 / (1 - (0.0000032 * Pressure))
 */
export function calculateCPL(pressure: number): number {
  return 1 / (1 - (0.0000032 * pressure));
}

/**
 * CTL (Correction for Temperature Liquid) - Table 54
 * CTL = exp(-alpha * (T - 15) * (1 + 0.8 * alpha * (T - 15)))
 * alpha = (K0 + (K1 * Density15)) / (Density15^2)
 */
export function calculateCTLTable54(
  density15: number,
  temperature: number,
  productType: 'LPG' | 'Gasoline' | 'JetFuel' | 'Diesel' | 'LubeOils'
): number {
  // Constants based on product type
  const constants: Record<string, [number, number]> = {
    LPG: [1144.3, 0.0],
    Gasoline: [346.4228, 0.4388],
    JetFuel: [594.5418, 0.0],
    Diesel: [186.9696, 0.4862],
    LubeOils: [0.0, 0.6278],
  };

  const [K0, K1] = constants[productType];
  const alpha = (K0 + (K1 * density15)) / Math.pow(density15, 2);
  
  // Temperature in Celsius
  const T = temperature;
  
  return Math.exp(-alpha * (T - 15) * (1 + 0.8 * alpha * (T - 15)));
}

/**
 * CTL/VCF (Volume Correction Factor) - Table 6
 * If specific gravity (SG) is provided instead of API Gravity:
 *   API Gravity = (141.5 / SG) - 131.5
 * VCF = 1 / (1 + (Alpha * (T - 60)) + (0.8 * Alpha^2 * (T - 60)^2))
 * Alpha = (K0 / (Rho^2)) + (K1 / Rho) (Rho = Density at 60°F)
 */
export function calculateVCFTable6(
  apiGravity: number,
  temperatureF: number
): number {
  // Convert API Gravity to density at 60°F
  const rho = 141.5 / (apiGravity + 131.5);
  
  // Constants for Table 6
  const K0 = 0;
  const K1 = 0.0000; // Simplified for general use
  
  const alpha = (K0 / Math.pow(rho, 2)) + (K1 / rho);
  const T = temperatureF - 60;
  
  return 1 / (1 + (alpha * T) + (0.8 * Math.pow(alpha, 2) * Math.pow(T, 2)));
}

/**
 * Calculate Master Volume
 * Master Volume = (Pulse / K-Factor) * CPL
 */
export function calculateMasterVolume(
  pulse: number,
  kFactor: number,
  cpl: number
): number {
  if (kFactor === 0) return 0;
  return (pulse / kFactor) * cpl;
}

/**
 * Calculate Reading Volume
 * Reading Volume = (Reading * (Corrected Scale / Main Scale)) / 1000
 */
export function calculateReadingVolume(
  reading: number,
  correctedScale: number,
  mainScale: number
): number {
  return (reading * (correctedScale / mainScale)) / 1000;
}

/**
 * Calculate Real Volume Bejana
 * Real Volume Bejana = Reading Volume + (Corrected Nominal * CTL)
 */
export function calculateRealVolumeBejana(
  readingVolume: number,
  correctedNominal: number,
  ctl: number
): number {
  return readingVolume + (correctedNominal * ctl);
}

/**
 * Calculate Meter Factor (MF)
 * MF = Real Volume Bejana / Master Volume
 */
export function calculateMeterFactor(
  realVolumeBejana: number,
  masterVolume: number
): number {
  if (masterVolume === 0) return 0;
  return realVolumeBejana / masterVolume;
}

/**
 * Calculate Repeatability
 * Repeatability = (Max MF - Min MF) * 100
 */
export function calculateRepeatability(meterFactors: number[]): number {
  if (meterFactors.length < 2) return 0;
  const max = Math.max(...meterFactors);
  const min = Math.min(...meterFactors);
  return (max - min) * 100;
}

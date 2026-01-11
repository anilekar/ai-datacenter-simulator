// Electricity pricing profiles with time-of-use rates

export interface ElectricityPriceProfile {
  name: string
  description: string
  basePricePerKwh: number
  // Multiplier by hour (0-23)
  hourlyMultiplier: number[]
}

export const ELECTRICITY_PROFILES: Record<string, ElectricityPriceProfile> = {
  flat_rate: {
    name: 'Flat Rate',
    description: 'No time-of-use variation',
    basePricePerKwh: 0.055,
    hourlyMultiplier: Array(24).fill(1.0)
  },

  tou_standard: {
    name: 'Standard Time-of-Use',
    description: 'Higher rates 2pm-8pm weekdays',
    basePricePerKwh: 0.055,
    hourlyMultiplier: [
      0.7, 0.7, 0.7, 0.7, 0.7, 0.7, // 12am-5am (off-peak)
      0.8, 0.9, 1.0, 1.1, 1.2, 1.3, // 6am-11am (shoulder)
      1.4, 1.5, 1.6, 1.6, 1.5, 1.5, // 12pm-5pm (peak)
      1.4, 1.3, 1.0, 0.9, 0.8, 0.7  // 6pm-11pm (shoulder to off-peak)
    ]
  },

  tou_extreme: {
    name: 'Extreme Peak Pricing',
    description: 'Very high peak rates (like ERCOT during heat)',
    basePricePerKwh: 0.05,
    hourlyMultiplier: [
      0.5, 0.5, 0.5, 0.5, 0.5, 0.6,
      0.7, 0.9, 1.2, 1.5, 1.8, 2.0,
      2.5, 3.0, 3.0, 2.8, 2.5, 2.0,
      1.5, 1.2, 1.0, 0.8, 0.6, 0.5
    ]
  },

  renewable_heavy: {
    name: 'Renewable-Heavy Grid',
    description: 'Cheap during solar hours, expensive at night',
    basePricePerKwh: 0.04,
    hourlyMultiplier: [
      1.5, 1.6, 1.6, 1.5, 1.4, 1.3, // Expensive at night (no solar)
      1.1, 0.9, 0.7, 0.5, 0.4, 0.3, // Cheap during solar peak
      0.3, 0.4, 0.5, 0.6, 0.8, 1.0, // Afternoon
      1.2, 1.4, 1.5, 1.6, 1.6, 1.5  // Evening/night (expensive)
    ]
  }
}

export function getElectricityPriceAtHour(profile: ElectricityPriceProfile, hour: number): number {
  const h = hour % 24
  return profile.basePricePerKwh * profile.hourlyMultiplier[h]
}

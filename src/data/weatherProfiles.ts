// Weather profiles that vary by hour of day

export interface HourlyWeatherProfile {
  name: string
  description: string
  // Temperature by hour of day (0-23)
  temperatureByHour: number[]
  wetBulbByHour: number[]
  humidityByHour: number[]
}

export const WEATHER_PROFILES: Record<string, HourlyWeatherProfile> = {
  typical_summer: {
    name: 'Typical Summer Day',
    description: 'Hot afternoon, cool morning/evening',
    temperatureByHour: [
      18, 17, 16, 16, 17, 18, // 12am-5am
      20, 22, 25, 28, 31, 33, // 6am-11am
      35, 36, 36, 35, 33, 30, // 12pm-5pm
      27, 24, 22, 21, 20, 19  // 6pm-11pm
    ],
    wetBulbByHour: [
      14, 13, 13, 13, 14, 15,
      16, 17, 19, 21, 23, 24,
      25, 26, 26, 25, 24, 22,
      20, 18, 17, 16, 15, 14
    ],
    humidityByHour: [
      70, 72, 75, 75, 72, 70,
      65, 60, 55, 50, 45, 42,
      40, 38, 38, 40, 42, 45,
      50, 55, 60, 65, 68, 70
    ]
  },

  hot_day: {
    name: 'Extreme Heat Day',
    description: 'Sustained high temperatures',
    temperatureByHour: [
      28, 27, 26, 26, 27, 29,
      32, 35, 38, 40, 42, 43,
      44, 44, 43, 42, 40, 38,
      35, 33, 32, 31, 30, 29
    ],
    wetBulbByHour: [
      22, 21, 21, 21, 22, 23,
      25, 26, 28, 29, 30, 31,
      31, 31, 30, 29, 28, 27,
      25, 24, 23, 23, 22, 22
    ],
    humidityByHour: [
      60, 62, 65, 65, 62, 60,
      55, 50, 45, 42, 40, 38,
      37, 37, 38, 40, 42, 45,
      48, 52, 55, 57, 58, 60
    ]
  },

  cool_day: {
    name: 'Cool Day (Ideal for Free Cooling)',
    description: 'Low temperatures, great for economizer',
    temperatureByHour: [
      8, 7, 6, 6, 7, 8,
      10, 12, 14, 16, 18, 20,
      21, 22, 22, 21, 19, 17,
      15, 13, 12, 11, 10, 9
    ],
    wetBulbByHour: [
      6, 5, 5, 5, 6, 7,
      8, 9, 11, 12, 13, 14,
      15, 15, 15, 14, 13, 12,
      11, 10, 9, 8, 7, 7
    ],
    humidityByHour: [
      75, 78, 80, 80, 78, 75,
      70, 65, 60, 55, 50, 48,
      45, 45, 45, 48, 52, 58,
      62, 68, 72, 75, 76, 75
    ]
  },

  static_baseline: {
    name: 'Static Baseline (No Variation)',
    description: 'Constant temperature for testing',
    temperatureByHour: Array(24).fill(25),
    wetBulbByHour: Array(24).fill(18),
    humidityByHour: Array(24).fill(50)
  }
}

export function getWeatherAtHour(profile: HourlyWeatherProfile, hour: number) {
  const h = hour % 24
  return {
    dry_bulb_temp_c: profile.temperatureByHour[h],
    wet_bulb_temp_c: profile.wetBulbByHour[h],
    humidity_pct: profile.humidityByHour[h]
  }
}

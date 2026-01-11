export interface LocationPreset {
  name: string
  electricity_rate: number
  carbon_intensity: number
  free_cooling_hours: number
  cooling_design_temp_c: number
  renewable_ppa_available: boolean
}

export const LOCATIONS: Record<string, LocationPreset> = {
  iowa: {
    name: 'Iowa (Wind Belt)',
    electricity_rate: 0.055,
    carbon_intensity: 350,
    free_cooling_hours: 4500,
    cooling_design_temp_c: 35,
    renewable_ppa_available: true
  },
  texas: {
    name: 'Texas (ERCOT)',
    electricity_rate: 0.05,
    carbon_intensity: 380,
    free_cooling_hours: 1500,
    cooling_design_temp_c: 40,
    renewable_ppa_available: true
  },
  oregon: {
    name: 'Oregon (Pacific NW)',
    electricity_rate: 0.06,
    carbon_intensity: 120,
    free_cooling_hours: 5500,
    cooling_design_temp_c: 30,
    renewable_ppa_available: true
  },
  virginia: {
    name: 'Virginia (Data Center Alley)',
    electricity_rate: 0.065,
    carbon_intensity: 300,
    free_cooling_hours: 3000,
    cooling_design_temp_c: 35,
    renewable_ppa_available: true
  },
  sweden: {
    name: 'Sweden (Nordic)',
    electricity_rate: 0.04,
    carbon_intensity: 20,
    free_cooling_hours: 7000,
    cooling_design_temp_c: 25,
    renewable_ppa_available: true
  }
}

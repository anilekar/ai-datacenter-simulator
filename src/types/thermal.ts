// Thermal Layer Data Models

export enum CoolingType {
  AIR_CRAC = 'AIR_CRAC',
  AIR_INROW = 'AIR_INROW',
  RDHX = 'RDHX',
  D2C = 'D2C',
  IMMERSION_SP = 'IMMERSION_SP',
  IMMERSION_TP = 'IMMERSION_TP'
}

export enum ChillerType {
  AIR_COOLED = 'AIR_COOLED',
  WATER_COOLED = 'WATER_COOLED',
  ABSORPTION = 'ABSORPTION'
}

export enum TowerType {
  WET = 'WET',
  DRY = 'DRY',
  HYBRID = 'HYBRID'
}

export interface Chiller {
  id: string
  type: ChillerType
  capacity_kw: number
  current_load_pct: number
  status: 'running' | 'standby' | 'failed' | 'maintenance'

  // Operating parameters
  chw_supply_temp_c: number
  chw_return_temp_c: number

  // COP curve: array of [ambient_temp_c, COP] tuples
  cop_curve: [number, number][]
}

export interface CoolingTower {
  id: string
  type: TowerType
  capacity_kw: number
  fan_power_kw: number
  pump_power_kw: number
  water_consumption_l_per_kwh: number

  approach_temp_c: number
  range_temp_c: number
}

export interface CDU {
  id: string
  cooling_capacity_kw: number

  // Temperatures
  facility_supply_temp_c: number
  facility_return_temp_c: number
  server_supply_temp_c: number
  server_return_temp_c: number

  // Flow rates
  facility_flow_lpm: number
  server_flow_lpm: number

  connected_racks: string[]
}

export interface CRAH {
  id: string
  cooling_capacity_kw: number
  airflow_cfm: number
  supply_air_temp_c: number
  return_air_temp_c: number
  fan_power_kw: number
  current_load_pct: number
}

export interface ThermalZone {
  id: string
  type: 'data_hall' | 'hot_aisle' | 'cold_aisle'

  // Current conditions
  current_temp_c: number
  humidity_pct: number

  // Setpoints and alarms
  target_temp_c: number
  temp_high_alarm_c: number
  temp_critical_c: number

  // Connected equipment
  rack_ids: string[]
  cooling_unit_ids: string[]

  // Physical properties
  volume_m3: number
}

export interface WeatherConditions {
  dry_bulb_temp_c: number
  wet_bulb_temp_c: number
  humidity_pct: number
}

export interface CoolingSystem {
  type: CoolingType
  chillers: Chiller[]
  cooling_towers: CoolingTower[]
  crah_units: CRAH[]
  cdus: CDU[]
  zones: ThermalZone[]

  // Economizer settings
  economizer_enabled: boolean
  economizer_setpoint_c: number
}

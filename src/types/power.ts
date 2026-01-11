// Power Layer Data Models

export enum SourceType {
  GRID = 'GRID',
  SOLAR = 'SOLAR',
  WIND = 'WIND',
  GENERATOR = 'GENERATOR',
  BATTERY = 'BATTERY'
}

export enum UPSMode {
  ONLINE = 'ONLINE',
  BYPASS = 'BYPASS',
  BATTERY = 'BATTERY',
  ECO = 'ECO'
}

export enum RedundancyMode {
  N = 'N',
  N_PLUS_1 = 'N_PLUS_1',
  TWO_N = 'TWO_N',
  TWO_N_PLUS_1 = 'TWO_N_PLUS_1'
}

export interface PowerSource {
  id: string
  type: SourceType
  capacity_kw: number
  availability: number // 0.0 - 1.0
  current_output_kw: number
  is_online: boolean

  // Cost and emissions
  cost_per_kwh: number
  carbon_intensity_g_per_kwh: number

  // Generator-specific
  startup_time_seconds?: number
  fuel_consumption_l_per_kwh?: number
  fuel_tank_liters?: number
  fuel_level_pct?: number

  // Solar/wind specific
  capacity_factor?: number

  // Battery specific
  state_of_charge?: number
  max_discharge_rate_kw?: number
  round_trip_efficiency?: number
}

export interface UPS {
  id: string
  capacity_kva: number
  current_load_kw: number
  mode: UPSMode
  redundancy_group: string
  is_healthy: boolean

  // Battery subsystem
  battery_runtime_minutes: number
  battery_health_pct: number

  // Efficiency curve: array of [load_pct, efficiency] tuples
  efficiency_curve: [number, number][]
}

export interface PDU {
  id: string
  capacity_kw: number
  voltage_in: number
  voltage_out: number
  current_load_kw: number
  efficiency: number
  redundancy_group: string
}

export interface Transformer {
  id: string
  capacity_kva: number
  voltage_primary: number
  voltage_secondary: number
  current_load_kw: number
  no_load_loss_kw: number
  full_load_loss_kw: number
}

export interface PowerPath {
  id: string
  sources: PowerSource[]
  transformers: Transformer[]
  ups_units: UPS[]
  pdus: PDU[]
}

export interface PowerSystem {
  paths: Map<string, PowerPath>
  redundancy_mode: RedundancyMode
}

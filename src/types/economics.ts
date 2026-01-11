// Economics Layer Data Models

export enum CostCategory {
  CAPEX_BUILDING = 'CAPEX_BUILDING',
  CAPEX_POWER = 'CAPEX_POWER',
  CAPEX_COOLING = 'CAPEX_COOLING',
  CAPEX_IT = 'CAPEX_IT',
  CAPEX_NETWORK = 'CAPEX_NETWORK',
  OPEX_ELECTRICITY = 'OPEX_ELECTRICITY',
  OPEX_STAFF = 'OPEX_STAFF',
  OPEX_MAINTENANCE = 'OPEX_MAINTENANCE',
  OPEX_OTHER = 'OPEX_OTHER'
}

export enum ElectricitySourceType {
  GRID = 'grid',
  RENEWABLE_PPA = 'renewable_ppa',
  ONSITE_SOLAR = 'onsite_solar',
  ONSITE_WIND = 'onsite_wind',
  BATTERY_STORAGE = 'battery_storage'
}

export interface ElectricitySource {
  type: ElectricitySourceType
  name: string
  percentage: number // 0-100
  cost_per_kwh: number
  carbon_intensity_g_per_kwh: number
  is_renewable: boolean
}

export enum OptimizationTarget {
  COST = 'cost',
  CARBON = 'carbon',
  BALANCED = 'balanced'
}

export interface ElectricityRate {
  energy_rate_per_kwh: number
  demand_rate_per_kw: number

  // Time-of-use
  tou_enabled: boolean
  tou_peak_hours: number[]
  tou_peak_multiplier: number
  tou_offpeak_multiplier: number
}

export interface CarbonAccounting {
  grid_intensity_g_per_kwh: number
  renewable_pct: number // 0.0 - 1.0

  // PPA details
  ppa_rate_per_mwh: number
  ppa_carbon_intensity: number
}

export interface CapExItem {
  category: CostCategory
  description: string
  amount_usd: number
  useful_life_years: number
}

export interface FinancialModel {
  facility_name: string
  it_capacity_mw: number

  // Cost inputs
  capex_items: CapExItem[]
  electricity_rate: ElectricityRate
  carbon: CarbonAccounting

  // Electricity supply mix (NEW)
  electricity_sources: ElectricitySource[]
  optimization_target: OptimizationTarget

  // Operating assumptions
  utilization_pct: number
  staff_count: number
  staff_cost_per_fte: number
  maintenance_pct_of_capex: number

  // Revenue assumptions
  revenue_per_gpu_hour?: number
}

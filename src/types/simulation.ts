import { PowerSystem } from './power'
import { CoolingSystem, WeatherConditions } from './thermal'
import { Cluster } from './compute'
import { Scheduler } from './workload'
import { FinancialModel } from './economics'

export interface SimulationMetrics {
  // Power metrics
  it_power_kw: number
  cooling_power_kw: number
  distribution_losses_kw: number
  total_power_kw: number
  pue: number

  // Thermal metrics
  avg_zone_temp_c: number
  cooling_capacity_used_pct: number

  // Compute metrics
  total_gpus: number
  available_gpus: number
  avg_gpu_utilization: number

  // Workload metrics
  jobs_queued: number
  jobs_running: number
  jobs_completed: number
  avg_queue_time_hours: number

  // Economics metrics
  hourly_cost_usd: number
  hourly_carbon_kg: number
  cumulative_cost_usd: number
  cumulative_carbon_kg: number
}

export interface SimulationState {
  // Current time
  current_time: Date
  time_step_hours: number

  // Layer states
  power_system: PowerSystem
  cooling_system: CoolingSystem
  cluster: Cluster
  scheduler: Scheduler
  financial_model: FinancialModel

  // External conditions
  weather: WeatherConditions
  electricity_price: number

  // Profile names for time-varying conditions
  weather_profile?: string
  workload_profile?: string
  electricity_profile?: string

  // Active failures
  active_failures: import('./failures').FailureEvent[]

  // Current metrics
  metrics: SimulationMetrics

  // History (for charting)
  history: {
    timestamps: Date[]
    it_power: number[]
    cooling_power: number[]
    total_power: number[]
    pue: number[]
    gpu_utilization: number[]
    cost_rate: number[]
    temperature: number[]
    ambient_temp: number[]
    carbon_rate: number[]
  }
}

export interface ScenarioConfig {
  id: string
  name: string
  description: string

  // Basic configuration
  location: string
  gpu_type: string
  gpu_count: number

  // Power configuration
  redundancy_mode: string
  ups_mode: string

  // Cooling configuration
  cooling_type: string
  chiller_redundancy: string
  economizer_enabled: boolean
  economizer_setpoint_c: number

  // Workload configuration
  workload_profile: string
  target_utilization: number

  // Weather scenario
  ambient_temp_c: number
  wet_bulb_temp_c: number
}

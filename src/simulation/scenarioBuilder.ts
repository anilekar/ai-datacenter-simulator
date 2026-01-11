import { SimulationState } from '../types/simulation'
import { PowerSystem, RedundancyMode, UPSMode, SourceType, PowerPath } from '../types/power'
import { CoolingSystem, CoolingType, ChillerType, TowerType, WeatherConditions } from '../types/thermal'
import { Cluster, Rack, ComputeNode, Accelerator, HealthStatus, NetworkTopology } from '../types/compute'
import { Scheduler, Priority } from '../types/workload'
import { FinancialModel, CostCategory, ElectricitySourceType, OptimizationTarget } from '../types/economics'
import { GPU_SPECS } from '../data/gpuSpecs'
import { LOCATIONS } from '../data/locations'
import { UPS_EFFICIENCY_CURVE, CHILLER_COP_CURVE } from '../data/efficiencyCurves'

export interface ScenarioParams {
  location: keyof typeof LOCATIONS
  gpuType: keyof typeof GPU_SPECS
  gpuCount: number
  targetUtilization: number
  ambientTempC: number
  wetBulbTempC: number
  redundancyMode?: RedundancyMode
  coolingType?: CoolingType
  economizerEnabled?: boolean
  // Time-varying profiles (optional)
  weatherProfile?: string
  workloadProfile?: string
  electricityProfile?: string
}

export function buildScenario(params: ScenarioParams): SimulationState {
  const location = LOCATIONS[params.location]
  const gpuSpec = GPU_SPECS[params.gpuType]

  // Calculate derived parameters
  const gpusPerNode = 8
  const nodeCount = Math.ceil(params.gpuCount / gpusPerNode)
  const nodesPerRack = 8
  const rackCount = Math.ceil(nodeCount / nodesPerRack)

  // Build Cluster
  const cluster = buildCluster(params.gpuCount, gpuSpec, params.targetUtilization, rackCount, nodesPerRack)

  // Build Power System
  const estimatedITLoadKw = (params.gpuCount * gpuSpec.tdp_watts * params.targetUtilization) / 1000
  const powerSystem = buildPowerSystem(estimatedITLoadKw, params.redundancyMode || RedundancyMode.N_PLUS_1)

  // Build Cooling System
  const coolingSystem = buildCoolingSystem(
    estimatedITLoadKw * 1.3, // Account for overhead
    params.coolingType || CoolingType.D2C,
    params.economizerEnabled ?? true
  )

  // Build Scheduler
  const scheduler = buildScheduler()

  // Build Financial Model
  const financialModel = buildFinancialModel(location, params.gpuCount, gpuSpec, estimatedITLoadKw)

  // Weather
  const weather: WeatherConditions = {
    dry_bulb_temp_c: params.ambientTempC,
    wet_bulb_temp_c: params.wetBulbTempC,
    humidity_pct: 50
  }

  return {
    current_time: new Date('2025-01-15T00:00:00'),
    time_step_hours: 1,
    power_system: powerSystem,
    cooling_system: coolingSystem,
    cluster: cluster,
    scheduler: scheduler,
    financial_model: financialModel,
    weather: weather,
    electricity_price: location.electricity_rate,
    weather_profile: params.weatherProfile,
    workload_profile: params.workloadProfile,
    electricity_profile: params.electricityProfile,
    metrics: {
      it_power_kw: 0,
      cooling_power_kw: 0,
      distribution_losses_kw: 0,
      total_power_kw: 0,
      pue: 1.0,
      avg_zone_temp_c: 20,
      cooling_capacity_used_pct: 0,
      total_gpus: params.gpuCount,
      available_gpus: params.gpuCount,
      avg_gpu_utilization: 0,
      jobs_queued: 0,
      jobs_running: 0,
      jobs_completed: 0,
      avg_queue_time_hours: 0,
      hourly_cost_usd: 0,
      hourly_carbon_kg: 0,
      cumulative_cost_usd: 0,
      cumulative_carbon_kg: 0
    },
    active_failures: [],
    history: {
      timestamps: [],
      it_power: [],
      cooling_power: [],
      total_power: [],
      pue: [],
      gpu_utilization: [],
      cost_rate: [],
      temperature: [],
      ambient_temp: [],
      carbon_rate: []
    }
  }
}

function buildCluster(
  gpuCount: number,
  gpuSpec: typeof GPU_SPECS[keyof typeof GPU_SPECS],
  targetUtilization: number,
  rackCount: number,
  nodesPerRack: number
): Cluster {
  const racks: Rack[] = []
  const gpusPerNode = 8
  let gpuIndex = 0

  for (let r = 0; r < rackCount; r++) {
    const nodes: ComputeNode[] = []

    for (let n = 0; n < nodesPerRack && gpuIndex < gpuCount; n++) {
      const accelerators: Accelerator[] = []

      for (let g = 0; g < gpusPerNode && gpuIndex < gpuCount; g++) {
        accelerators.push({
          id: `gpu-${gpuIndex}`,
          type: gpuSpec,
          node_id: `node-${r}-${n}`,
          current_utilization: targetUtilization,
          current_temperature_c: 65,
          memory_used_gb: gpuSpec.memory_gb * 0.7,
          health_status: HealthStatus.HEALTHY,
          is_throttled: false,
          throttle_factor: 1.0
        })
        gpuIndex++
      }

      nodes.push({
        id: `node-${r}-${n}`,
        node_type: 'DGX-H100',
        rack_id: `rack-${r}`,
        rack_position_u: n * 5 + 1,
        accelerators,
        cpu_count: 2,
        cpu_power_watts: 300,
        system_memory_gb: 2048,
        overhead_power_watts: 200
      })
    }

    racks.push({
      id: `rack-${r}`,
      row: String.fromCharCode(65 + Math.floor(r / 10)),
      position: r % 10,
      nodes,
      max_power_kw: 55,
      pdu_a_id: 'pdu-a',
      pdu_b_id: 'pdu-b',
      cooling_zone_id: 'zone-main',
      inlet_temp_c: 22,
      outlet_temp_c: 40
    })
  }

  return {
    id: 'cluster-main',
    racks,
    spine_switches: [
      { id: 'spine-1', type: 'spine', port_count: 64, port_speed_gbps: 400, power_watts: 3000 },
      { id: 'spine-2', type: 'spine', port_count: 64, port_speed_gbps: 400, power_watts: 3000 }
    ],
    leaf_switches: [],
    network_topology: NetworkTopology.FAT_TREE
  }
}

function buildPowerSystem(itLoadKw: number, redundancy: RedundancyMode): PowerSystem {
  const totalCapacityNeeded = itLoadKw * 1.5 // Headroom for cooling and losses

  const pathA: PowerPath = {
    id: 'path-a',
    sources: [
      {
        id: 'grid-a',
        type: SourceType.GRID,
        capacity_kw: totalCapacityNeeded,
        availability: 0.9999,
        current_output_kw: itLoadKw / 2,
        is_online: true,
        cost_per_kwh: 0.055,
        carbon_intensity_g_per_kwh: 350
      }
    ],
    transformers: [
      {
        id: 'xfmr-a',
        capacity_kva: totalCapacityNeeded,
        voltage_primary: 13800,
        voltage_secondary: 480,
        current_load_kw: itLoadKw / 2,
        no_load_loss_kw: 5,
        full_load_loss_kw: 15
      }
    ],
    ups_units: [
      {
        id: 'ups-a',
        capacity_kva: totalCapacityNeeded / 2,
        current_load_kw: itLoadKw / 2,
        mode: UPSMode.ONLINE,
        redundancy_group: 'A',
        is_healthy: true,
        battery_runtime_minutes: 15,
        battery_health_pct: 100,
        efficiency_curve: UPS_EFFICIENCY_CURVE
      }
    ],
    pdus: [
      {
        id: 'pdu-a',
        capacity_kw: totalCapacityNeeded / 2,
        voltage_in: 480,
        voltage_out: 208,
        current_load_kw: itLoadKw / 2,
        efficiency: 0.985,
        redundancy_group: 'A'
      }
    ]
  }

  const pathB: PowerPath = {
    ...pathA,
    id: 'path-b',
    sources: [{ ...pathA.sources[0], id: 'grid-b' }],
    transformers: [{ ...pathA.transformers[0], id: 'xfmr-b' }],
    ups_units: [{ ...pathA.ups_units[0], id: 'ups-b', redundancy_group: 'B' }],
    pdus: [{ ...pathA.pdus[0], id: 'pdu-b', redundancy_group: 'B' }]
  }

  return {
    paths: new Map([['A', pathA], ['B', pathB]]),
    redundancy_mode: redundancy
  }
}

function buildCoolingSystem(heatLoadKw: number, type: CoolingType, economizerEnabled: boolean): CoolingSystem {
  const chillerCapacity = heatLoadKw / 2 // N+1 redundancy

  return {
    type,
    chillers: [
      {
        id: 'chiller-1',
        type: ChillerType.WATER_COOLED,
        capacity_kw: chillerCapacity,
        current_load_pct: 0.5,
        status: 'running',
        chw_supply_temp_c: 7,
        chw_return_temp_c: 12,
        cop_curve: CHILLER_COP_CURVE
      },
      {
        id: 'chiller-2',
        type: ChillerType.WATER_COOLED,
        capacity_kw: chillerCapacity,
        current_load_pct: 0.5,
        status: 'running',
        chw_supply_temp_c: 7,
        chw_return_temp_c: 12,
        cop_curve: CHILLER_COP_CURVE
      },
      {
        id: 'chiller-3',
        type: ChillerType.WATER_COOLED,
        capacity_kw: chillerCapacity,
        current_load_pct: 0,
        status: 'standby',
        chw_supply_temp_c: 7,
        chw_return_temp_c: 12,
        cop_curve: CHILLER_COP_CURVE
      }
    ],
    cooling_towers: [
      {
        id: 'tower-1',
        type: TowerType.WET,
        capacity_kw: heatLoadKw,
        fan_power_kw: 50,
        pump_power_kw: 75,
        water_consumption_l_per_kwh: 1.8,
        approach_temp_c: 5,
        range_temp_c: 10
      }
    ],
    crah_units: [],
    cdus: [],
    zones: [
      {
        id: 'zone-main',
        type: 'data_hall',
        current_temp_c: 22,
        humidity_pct: 45,
        target_temp_c: 22,
        temp_high_alarm_c: 27,
        temp_critical_c: 32,
        rack_ids: [],
        cooling_unit_ids: ['chiller-1', 'chiller-2'],
        volume_m3: 10000
      }
    ],
    economizer_enabled: economizerEnabled,
    economizer_setpoint_c: 15
  }
}

function buildScheduler(): Scheduler {
  return {
    queues: [
      {
        id: 'queue-default',
        name: 'Default Queue',
        jobs: [],
        max_queue_depth: 1000,
        default_priority: Priority.P1_STANDARD
      }
    ],
    scheduling_algorithm: 'fifo'
  }
}

function buildFinancialModel(
  location: typeof LOCATIONS[keyof typeof LOCATIONS],
  gpuCount: number,
  _gpuSpec: typeof GPU_SPECS[keyof typeof GPU_SPECS],
  itLoadKw: number
): FinancialModel {
  // Rough CapEx estimates
  const gpuCostPerUnit = 30000 // Placeholder
  const itCapex = gpuCount * gpuCostPerUnit

  return {
    facility_name: location.name,
    it_capacity_mw: itLoadKw / 1000,
    capex_items: [
      {
        category: CostCategory.CAPEX_IT,
        description: 'GPU Servers',
        amount_usd: itCapex,
        useful_life_years: 4
      },
      {
        category: CostCategory.CAPEX_POWER,
        description: 'Power Infrastructure',
        amount_usd: itLoadKw * 500,
        useful_life_years: 20
      },
      {
        category: CostCategory.CAPEX_COOLING,
        description: 'Cooling Infrastructure',
        amount_usd: itLoadKw * 300,
        useful_life_years: 15
      }
    ],
    electricity_rate: {
      energy_rate_per_kwh: location.electricity_rate,
      demand_rate_per_kw: 10,
      tou_enabled: false,
      tou_peak_hours: [14, 15, 16, 17, 18, 19],
      tou_peak_multiplier: 1.5,
      tou_offpeak_multiplier: 0.7
    },
    carbon: {
      grid_intensity_g_per_kwh: location.carbon_intensity,
      renewable_pct: 0.2,
      ppa_rate_per_mwh: 30,
      ppa_carbon_intensity: 0
    },
    // Default electricity supply mix
    electricity_sources: [
      {
        type: ElectricitySourceType.GRID,
        name: 'Grid Power',
        percentage: 80,
        cost_per_kwh: location.electricity_rate,
        carbon_intensity_g_per_kwh: location.carbon_intensity,
        is_renewable: false
      },
      {
        type: ElectricitySourceType.RENEWABLE_PPA,
        name: 'Wind PPA',
        percentage: 20,
        cost_per_kwh: 0.03,
        carbon_intensity_g_per_kwh: 0,
        is_renewable: true
      }
    ],
    optimization_target: OptimizationTarget.BALANCED,
    utilization_pct: 85,
    staff_count: 50,
    staff_cost_per_fte: 120000,
    maintenance_pct_of_capex: 0.05
  }
}

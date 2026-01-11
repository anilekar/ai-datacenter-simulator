import { SimulationState, SimulationMetrics } from '../types/simulation'
import {
  calculateClusterPower,
  calculateAverageGPUUtilization,
  countTotalGPUs,
  countAvailableGPUs
} from './calculations/computeCalculations'
import {
  calculateTotalDistributionLosses
} from './calculations/powerCalculations'
import {
  calculateCoolingPower,
  calculatePUE
} from './calculations/thermalCalculations'
import {
  countJobsByState,
  calculateAverageQueueTime
} from './calculations/workloadCalculations'
import {
  calculateHourlyElectricityCost,
  calculateCarbonEmissions,
  calculateHourlyElectricityCostWithMix,
  calculateCarbonEmissionsWithMix
} from './calculations/economicsCalculations'
import { JobState } from '../types/workload'
import { HealthStatus } from '../types/compute'
import { WEATHER_PROFILES, getWeatherAtHour } from '../data/weatherProfiles'
import { WORKLOAD_PATTERNS, getUtilizationAtHour } from '../data/workloadProfiles'
import { ELECTRICITY_PROFILES, getElectricityPriceAtHour } from '../data/electricityProfiles'
import { FailureType } from '../types/failures'

export function simulateTimeStep(state: SimulationState): SimulationState {
  const currentHour = state.current_time.getHours()

  // Process active failures - update duration and apply effects
  state.active_failures = state.active_failures.map(failure => {
    if (!failure.isActive) return failure

    // Decrement duration
    const remainingHours = failure.durationHours - state.time_step_hours

    if (remainingHours <= 0) {
      // Failure has ended
      return { ...failure, isActive: false, durationHours: 0 }
    }

    return { ...failure, durationHours: remainingHours }
  })

  // Remove expired failures
  state.active_failures = state.active_failures.filter(f => f.isActive)

  // Apply failure effects to the system
  let coolingEfficiencyMultiplier = 1.0
  let thermalThrottleFactor = 1.0

  // First, reset all GPUs to healthy state (in case failures have cleared)
  state.cluster.racks.forEach(rack => {
    rack.nodes.forEach(node => {
      node.accelerators.forEach(gpu => {
        gpu.health_status = HealthStatus.HEALTHY
      })
    })
  })

  // Track how many GPUs to fail for GPU rack failures
  let totalGPUs = countTotalGPUs(state.cluster)
  let gpusToFail = 0

  state.active_failures.forEach(failure => {
    if (!failure.isActive) return

    switch (failure.type) {
      case FailureType.CHILLER_FAILURE:
        // Reduce cooling efficiency
        coolingEfficiencyMultiplier *= (1 - (failure.performanceDegradationPct || 0) / 100)
        break

      case FailureType.GPU_RACK_FAILURE:
        // Calculate how many GPUs to fail based on capacity reduction
        const reductionPct = failure.capacityReductionPct || 0
        gpusToFail += Math.floor((totalGPUs * reductionPct) / 100)
        break

      case FailureType.COOLING_TOWER_FAILURE:
        // Reduce cooling effectiveness
        coolingEfficiencyMultiplier *= (1 - (failure.performanceDegradationPct || 0) / 100)
        break

      case FailureType.PDU_FAILURE:
        // For 2N systems, minimal impact
        // For N+1, slight reduction
        break

      case FailureType.UPS_TRIP:
        // Temporary power quality issue
        // Battery mode - no immediate impact in this simplified model
        break
    }
  })

  // Apply GPU failures by marking GPUs as FAILED
  if (gpusToFail > 0) {
    let failedCount = 0
    outerLoop: for (const rack of state.cluster.racks) {
      for (const node of rack.nodes) {
        for (const gpu of node.accelerators) {
          if (failedCount >= gpusToFail) break outerLoop
          gpu.health_status = HealthStatus.FAILED
          gpu.current_utilization = 0
          failedCount++
        }
      }
    }
  }

  // Apply thermal throttling if cooling is degraded significantly
  if (coolingEfficiencyMultiplier < 0.8) {
    thermalThrottleFactor = 0.9  // Reduce GPU performance by 10%
  } else if (coolingEfficiencyMultiplier < 0.6) {
    thermalThrottleFactor = 0.7  // Reduce GPU performance by 30%
  }

  // 0. UPDATE TIME-VARYING CONDITIONS

  // Update weather based on profile
  if (state.weather_profile && WEATHER_PROFILES[state.weather_profile]) {
    state.weather = getWeatherAtHour(WEATHER_PROFILES[state.weather_profile], currentHour)
  }

  // Update GPU utilization based on workload profile
  if (state.workload_profile && WORKLOAD_PATTERNS[state.workload_profile]) {
    const targetUtil = getUtilizationAtHour(WORKLOAD_PATTERNS[state.workload_profile], currentHour)
    // Update all GPU utilizations with thermal throttling applied (only for healthy GPUs)
    state.cluster.racks.forEach(rack => {
      rack.nodes.forEach(node => {
        node.accelerators.forEach(gpu => {
          if (gpu.health_status === HealthStatus.HEALTHY) {
            gpu.current_utilization = targetUtil * thermalThrottleFactor
            gpu.is_throttled = thermalThrottleFactor < 1.0
            gpu.throttle_factor = thermalThrottleFactor
          }
        })
      })
    })
  }

  // Update electricity price based on profile
  if (state.electricity_profile && ELECTRICITY_PROFILES[state.electricity_profile]) {
    state.electricity_price = getElectricityPriceAtHour(
      ELECTRICITY_PROFILES[state.electricity_profile],
      currentHour
    )
  }

  // 1. COMPUTE LAYER: Calculate IT load from GPU utilization
  const itLoadKw = calculateClusterPower(state.cluster)

  // 2. POWER LAYER: Calculate distribution losses
  const distributionLossesKw = calculateTotalDistributionLosses(state.power_system)

  // 3. THERMAL LAYER: Calculate cooling requirements
  // Total heat = IT load + distribution losses (all electrical power becomes heat)
  const totalHeatKw = itLoadKw + distributionLossesKw

  // Calculate cooling power needed (with failure impact)
  let coolingPowerKw = calculateCoolingPower(
    state.cooling_system,
    totalHeatKw,
    state.weather
  )

  // Apply cooling efficiency degradation from failures
  coolingPowerKw = coolingPowerKw / coolingEfficiencyMultiplier

  // 4. Calculate total facility power (with feedback from cooling)
  const totalFacilityPowerKw = itLoadKw + coolingPowerKw + distributionLossesKw

  // 5. Calculate PUE
  const pue = calculatePUE(itLoadKw, coolingPowerKw, distributionLossesKw)

  // 6. WORKLOAD METRICS
  const jobsQueued = countJobsByState(state.scheduler, JobState.QUEUED)
  const jobsRunning = countJobsByState(state.scheduler, JobState.RUNNING)
  const jobsCompleted = countJobsByState(state.scheduler, JobState.COMPLETED)
  const avgQueueTime = calculateAverageQueueTime(state.scheduler)

  // 7. COMPUTE METRICS
  const totalGpus = countTotalGPUs(state.cluster)
  const availableGpus = countAvailableGPUs(state.cluster)
  const avgGpuUtilization = calculateAverageGPUUtilization(state.cluster)

  // 8. THERMAL METRICS
  const avgZoneTemp = state.cooling_system.zones.reduce(
    (sum, zone) => sum + zone.current_temp_c,
    0
  ) / state.cooling_system.zones.length

  const totalCoolingCapacity = state.cooling_system.chillers.reduce(
    (sum, ch) => sum + ch.capacity_kw,
    0
  )
  const coolingCapacityUsed = totalCoolingCapacity > 0
    ? (totalHeatKw / totalCoolingCapacity) * 100
    : 0

  // 9. ECONOMICS: Calculate costs using electricity supply mix
  const consumptionKwh = totalFacilityPowerKw * state.time_step_hours
  const consumptionMwh = consumptionKwh / 1000

  // Use new mix-based calculations if sources are defined
  const hourlyCostUsd = state.financial_model.electricity_sources && state.financial_model.electricity_sources.length > 0
    ? calculateHourlyElectricityCostWithMix(
        consumptionKwh,
        currentHour,
        state.financial_model.electricity_sources,
        state.financial_model.electricity_rate
      )
    : calculateHourlyElectricityCost(
        consumptionKwh,
        currentHour,
        state.financial_model.electricity_rate
      )

  const hourlyCarbonKg = state.financial_model.electricity_sources && state.financial_model.electricity_sources.length > 0
    ? calculateCarbonEmissionsWithMix(
        consumptionMwh,
        state.financial_model.electricity_sources
      )
    : calculateCarbonEmissions(
        consumptionMwh,
        state.financial_model.carbon
      )

  // 10. Build metrics object
  const metrics: SimulationMetrics = {
    it_power_kw: itLoadKw,
    cooling_power_kw: coolingPowerKw,
    distribution_losses_kw: distributionLossesKw,
    total_power_kw: totalFacilityPowerKw,
    pue,
    avg_zone_temp_c: avgZoneTemp,
    cooling_capacity_used_pct: coolingCapacityUsed,
    total_gpus: totalGpus,
    available_gpus: availableGpus,
    avg_gpu_utilization: avgGpuUtilization,
    jobs_queued: jobsQueued,
    jobs_running: jobsRunning,
    jobs_completed: jobsCompleted,
    avg_queue_time_hours: avgQueueTime,
    hourly_cost_usd: hourlyCostUsd,
    hourly_carbon_kg: hourlyCarbonKg,
    cumulative_cost_usd: (state.metrics?.cumulative_cost_usd || 0) + hourlyCostUsd,
    cumulative_carbon_kg: (state.metrics?.cumulative_carbon_kg || 0) + hourlyCarbonKg
  }

  // 11. Update history for charting
  const newHistory = {
    timestamps: [...state.history.timestamps, state.current_time],
    it_power: [...state.history.it_power, itLoadKw],
    cooling_power: [...state.history.cooling_power, coolingPowerKw],
    total_power: [...state.history.total_power, totalFacilityPowerKw],
    pue: [...state.history.pue, pue],
    gpu_utilization: [...state.history.gpu_utilization, avgGpuUtilization * 100],
    cost_rate: [...state.history.cost_rate, hourlyCostUsd],
    temperature: [...state.history.temperature, avgZoneTemp],
    ambient_temp: [...state.history.ambient_temp, state.weather.dry_bulb_temp_c],
    carbon_rate: [...state.history.carbon_rate, hourlyCarbonKg]
  }

  // Keep only last 100 data points to avoid memory issues
  if (newHistory.timestamps.length > 100) {
    Object.keys(newHistory).forEach(key => {
      newHistory[key as keyof typeof newHistory] =
        newHistory[key as keyof typeof newHistory].slice(-100) as any
    })
  }

  // 12. Advance time
  const nextTime = new Date(state.current_time)
  nextTime.setHours(nextTime.getHours() + state.time_step_hours)

  return {
    ...state,
    current_time: nextTime,
    metrics,
    history: newHistory
  }
}

export function runSimulation(
  initialState: SimulationState,
  steps: number
): SimulationState {
  let state = initialState

  for (let i = 0; i < steps; i++) {
    state = simulateTimeStep(state)
  }

  return state
}

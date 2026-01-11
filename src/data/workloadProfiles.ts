// Workload profiles that vary GPU utilization over time

export interface WorkloadPattern {
  name: string
  description: string
  // Base utilization level (0.0 - 1.0)
  baseUtilization: number
  // Multiplier by hour of day (0-23)
  hourlyMultiplier: number[]
}

export const WORKLOAD_PATTERNS: Record<string, WorkloadPattern> = {
  constant: {
    name: 'Constant Load',
    description: 'Steady 85% utilization',
    baseUtilization: 0.85,
    hourlyMultiplier: Array(24).fill(1.0)
  },

  business_hours: {
    name: 'Business Hours Pattern',
    description: 'Peak during work hours, low at night',
    baseUtilization: 0.85,
    hourlyMultiplier: [
      0.3, 0.2, 0.2, 0.2, 0.2, 0.3, // 12am-5am (low overnight)
      0.5, 0.7, 0.9, 1.0, 1.0, 1.0, // 6am-11am (ramp up)
      1.0, 1.0, 1.0, 1.0, 0.9, 0.8, // 12pm-5pm (peak)
      0.7, 0.6, 0.5, 0.4, 0.3, 0.3  // 6pm-11pm (wind down)
    ]
  },

  batch_training: {
    name: 'Batch Training Jobs',
    description: 'Spiky pattern with batch job submissions',
    baseUtilization: 0.80,
    hourlyMultiplier: [
      0.5, 0.5, 0.5, 0.5, 0.5, 0.6,
      0.7, 0.8, 1.1, 1.2, 0.9, 0.8,
      1.0, 1.3, 1.2, 0.9, 0.8, 1.1,
      1.2, 1.0, 0.8, 0.7, 0.6, 0.5
    ]
  },

  inference_heavy: {
    name: 'Inference Workload',
    description: 'Lower base, peaks during user activity',
    baseUtilization: 0.60,
    hourlyMultiplier: [
      0.4, 0.3, 0.3, 0.3, 0.4, 0.5,
      0.7, 0.9, 1.1, 1.3, 1.4, 1.4,
      1.5, 1.5, 1.4, 1.3, 1.2, 1.1,
      1.0, 0.9, 0.8, 0.7, 0.6, 0.5
    ]
  },

  weekend_light: {
    name: 'Weekend/Light Load',
    description: 'Reduced utilization overall',
    baseUtilization: 0.50,
    hourlyMultiplier: [
      0.6, 0.5, 0.5, 0.5, 0.5, 0.6,
      0.7, 0.8, 0.9, 1.0, 1.0, 1.0,
      1.0, 1.0, 0.9, 0.9, 0.8, 0.8,
      0.7, 0.7, 0.7, 0.7, 0.6, 0.6
    ]
  }
}

export function getUtilizationAtHour(pattern: WorkloadPattern, hour: number): number {
  const h = hour % 24
  const utilization = pattern.baseUtilization * pattern.hourlyMultiplier[h]
  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, utilization))
}

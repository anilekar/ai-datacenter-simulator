export enum FailureType {
  UPS_TRIP = 'ups_trip',
  CHILLER_FAILURE = 'chiller_failure',
  PDU_FAILURE = 'pdu_failure',
  GPU_RACK_FAILURE = 'gpu_rack_failure',
  COOLING_TOWER_FAILURE = 'cooling_tower_failure',
  GENERATOR_START_FAIL = 'generator_start_fail',
}

export interface FailureEvent {
  id: string
  type: FailureType
  name: string
  description: string
  startTime?: Date
  durationHours: number
  isActive: boolean

  // Impact parameters
  impactedComponentIds?: string[]
  capacityReductionPct?: number
  performanceDegradationPct?: number
}

export interface FailureScenario {
  id: string
  name: string
  description: string
  failures: FailureEvent[]
}

// Pre-defined failure scenarios
export const FAILURE_SCENARIOS: Record<string, FailureScenario> = {
  single_chiller: {
    id: 'single_chiller',
    name: 'Single Chiller Failure',
    description: 'One chiller fails, N+1 redundancy takes over',
    failures: [
      {
        id: 'chiller_1_fail',
        type: FailureType.CHILLER_FAILURE,
        name: 'Chiller 1 Failure',
        description: 'Primary chiller fails, backup engages',
        durationHours: 4,
        isActive: false,
        capacityReductionPct: 0, // N+1 covers it
        performanceDegradationPct: 10, // Slight efficiency loss
      }
    ]
  },

  ups_trip: {
    id: 'ups_trip',
    name: 'UPS Trip with Battery Ride-Through',
    description: 'Utility power loss, UPS switches to battery',
    failures: [
      {
        id: 'ups_battery_mode',
        type: FailureType.UPS_TRIP,
        name: 'UPS Battery Mode',
        description: 'Grid power lost, running on batteries',
        durationHours: 0.25, // 15 minutes
        isActive: false,
        capacityReductionPct: 0,
        performanceDegradationPct: 0,
      }
    ]
  },

  pdu_failure: {
    id: 'pdu_failure',
    name: 'PDU Failure (2N Architecture)',
    description: 'One PDU path fails, load shifts to redundant path',
    failures: [
      {
        id: 'pdu_a_fail',
        type: FailureType.PDU_FAILURE,
        name: 'PDU-A Failure',
        description: 'A-side PDU fails, all load on B-side',
        durationHours: 2,
        isActive: false,
        capacityReductionPct: 0, // 2N covers it
        performanceDegradationPct: 0,
      }
    ]
  },

  cascading_thermal: {
    id: 'cascading_thermal',
    name: 'Cascading Thermal Event',
    description: 'Multiple chillers fail during peak load',
    failures: [
      {
        id: 'chiller_1_cascade',
        type: FailureType.CHILLER_FAILURE,
        name: 'Chiller 1 Failure',
        description: 'First chiller fails',
        durationHours: 3,
        isActive: false,
        capacityReductionPct: 20,
        performanceDegradationPct: 15,
      },
      {
        id: 'chiller_2_cascade',
        type: FailureType.CHILLER_FAILURE,
        name: 'Chiller 2 Failure',
        description: 'Second chiller fails 30min later',
        durationHours: 2.5,
        isActive: false,
        capacityReductionPct: 40,
        performanceDegradationPct: 30,
      }
    ]
  },

  rack_failure: {
    id: 'rack_failure',
    name: 'GPU Rack Failure',
    description: 'Entire rack of GPUs goes offline',
    failures: [
      {
        id: 'rack_01_fail',
        type: FailureType.GPU_RACK_FAILURE,
        name: 'Rack 01 Failure',
        description: 'Complete rack failure, GPUs unavailable',
        durationHours: 6,
        isActive: false,
        capacityReductionPct: 1.25, // ~1/80 racks
        performanceDegradationPct: 0,
      }
    ]
  }
}

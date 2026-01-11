// Workload Layer Data Models

export enum JobState {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PREEMPTED = 'PREEMPTED'
}

export enum JobType {
  TRAINING = 'TRAINING',
  INFERENCE = 'INFERENCE',
  FINE_TUNING = 'FINE_TUNING',
  EVALUATION = 'EVALUATION'
}

export enum Priority {
  P0_CRITICAL = 'P0_CRITICAL',
  P1_STANDARD = 'P1_STANDARD',
  P2_PREEMPTIBLE = 'P2_PREEMPTIBLE'
}

export interface Job {
  id: string
  type: JobType
  priority: Priority
  user_id: string

  // Resource requirements
  gpu_count: number
  gpu_type: string
  memory_gb: number
  estimated_duration_hours: number

  // State tracking
  state: JobState
  submit_time: Date
  start_time?: Date
  end_time?: Date
  progress_pct: number

  // Placement
  assigned_nodes: string[]
  assigned_gpus: string[]

  // Checkpointing
  checkpoint_interval_hours: number
  last_checkpoint?: Date
}

export interface JobQueue {
  id: string
  name: string
  jobs: Job[]
  max_queue_depth: number
  default_priority: Priority
}

export interface Scheduler {
  queues: JobQueue[]
  scheduling_algorithm: 'fifo' | 'fair_share' | 'priority' | 'backfill'
}

export interface SLA {
  id: string
  name: string

  // Targets
  availability_pct: number
  max_queue_time_hours: number
  max_latency_ms?: number
  min_throughput?: number

  // Current compliance
  current_availability_pct: number
  current_avg_queue_time: number
  violations_count: number
}

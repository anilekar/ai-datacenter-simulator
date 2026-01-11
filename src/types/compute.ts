// Compute Layer Data Models

export enum Vendor {
  NVIDIA = 'NVIDIA',
  AMD = 'AMD',
  GOOGLE = 'GOOGLE',
  INTEL = 'INTEL'
}

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  FAILED = 'FAILED',
  MAINTENANCE = 'MAINTENANCE'
}

export enum NetworkTopology {
  FAT_TREE = 'FAT_TREE',
  RAIL_OPTIMIZED = 'RAIL_OPTIMIZED',
  DRAGONFLY = 'DRAGONFLY'
}

export interface AcceleratorType {
  name: string
  vendor: Vendor
  tdp_watts: number
  idle_watts: number
  memory_gb: number
  memory_bandwidth_tb_s: number
  fp16_tflops: number
  fp8_tflops: number
  interconnect_type: string
  interconnect_bw_gb_s: number
}

export interface Accelerator {
  id: string
  type: AcceleratorType
  node_id: string

  // Current state
  current_utilization: number // 0.0 - 1.0
  current_temperature_c: number
  memory_used_gb: number
  health_status: HealthStatus

  // Thermal throttling
  is_throttled: boolean
  throttle_factor: number // 1.0 = no throttle, 0.8 = 20% reduced
}

export interface ComputeNode {
  id: string
  node_type: string
  rack_id: string
  rack_position_u: number

  accelerators: Accelerator[]
  cpu_count: number
  cpu_power_watts: number
  system_memory_gb: number
  overhead_power_watts: number
}

export interface Rack {
  id: string
  row: string
  position: number

  nodes: ComputeNode[]
  max_power_kw: number

  // Power references
  pdu_a_id: string
  pdu_b_id: string

  // Cooling reference
  cooling_zone_id: string

  // Monitoring
  inlet_temp_c: number
  outlet_temp_c: number
}

export interface NetworkSwitch {
  id: string
  type: 'tor' | 'leaf' | 'spine'
  port_count: number
  port_speed_gbps: number
  power_watts: number
}

export interface Cluster {
  id: string
  racks: Rack[]
  spine_switches: NetworkSwitch[]
  leaf_switches: NetworkSwitch[]
  network_topology: NetworkTopology
}

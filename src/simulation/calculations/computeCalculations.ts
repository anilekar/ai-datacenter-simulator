import { Accelerator, ComputeNode, Rack, Cluster, HealthStatus } from '../../types/compute'

// GPU power follows: P = P_idle + (P_tdp - P_idle) × U^α
// Where α ≈ 1.2 to 1.4 for GPUs (non-linear relationship)
const POWER_EXPONENT = 1.3

export function calculateGPUPower(accelerator: Accelerator): number {
  const { idle_watts, tdp_watts } = accelerator.type
  const utilization = accelerator.current_utilization * accelerator.throttle_factor

  // P = P_idle + (P_tdp - P_idle) × U^α
  const dynamicPower = Math.pow(utilization, POWER_EXPONENT) * (tdp_watts - idle_watts)
  return idle_watts + dynamicPower
}

export function calculateNodePower(node: ComputeNode): number {
  let totalPower = 0

  // GPU power
  node.accelerators.forEach(gpu => {
    totalPower += calculateGPUPower(gpu)
  })

  // CPU power (simplified - could be more sophisticated)
  totalPower += node.cpu_power_watts

  // System overhead (NICs, fans, storage, etc.)
  totalPower += node.overhead_power_watts

  return totalPower
}

export function calculateRackPower(rack: Rack): number {
  let totalPower = 0
  rack.nodes.forEach(node => {
    totalPower += calculateNodePower(node)
  })
  return totalPower / 1000 // Convert to kW
}

export function calculateClusterPower(cluster: Cluster): number {
  let totalPower = 0

  cluster.racks.forEach(rack => {
    totalPower += calculateRackPower(rack)
  })

  // Add network switch power
  cluster.spine_switches.forEach(sw => {
    totalPower += sw.power_watts / 1000
  })
  cluster.leaf_switches.forEach(sw => {
    totalPower += sw.power_watts / 1000
  })

  return totalPower
}

export function calculateAverageGPUUtilization(cluster: Cluster): number {
  let totalUtilization = 0
  let gpuCount = 0

  cluster.racks.forEach(rack => {
    rack.nodes.forEach(node => {
      node.accelerators.forEach(gpu => {
        totalUtilization += gpu.current_utilization
        gpuCount++
      })
    })
  })

  return gpuCount > 0 ? totalUtilization / gpuCount : 0
}

export function countTotalGPUs(cluster: Cluster): number {
  let count = 0
  cluster.racks.forEach(rack => {
    rack.nodes.forEach(node => {
      count += node.accelerators.length
    })
  })
  return count
}

export function countAvailableGPUs(cluster: Cluster): number {
  let count = 0
  cluster.racks.forEach(rack => {
    rack.nodes.forEach(node => {
      node.accelerators.forEach(gpu => {
        if (gpu.health_status === HealthStatus.HEALTHY && gpu.current_utilization < 0.95) {
          count++
        }
      })
    })
  })
  return count
}

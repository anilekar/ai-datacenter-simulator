import { AcceleratorType, Vendor } from '../types/compute'

export const GPU_TYPES: Record<string, AcceleratorType> = {
  H100_SXM: {
    name: 'H100 SXM',
    vendor: Vendor.NVIDIA,
    tdp_watts: 700,
    idle_watts: 105,
    memory_gb: 80,
    memory_bandwidth_tb_s: 3.35,
    fp16_tflops: 1979,
    fp8_tflops: 3958,
    interconnect_type: 'NVLink 4',
    interconnect_bw_gb_s: 900
  },
  H200_SXM: {
    name: 'H200 SXM',
    vendor: Vendor.NVIDIA,
    tdp_watts: 700,
    idle_watts: 105,
    memory_gb: 141,
    memory_bandwidth_tb_s: 4.8,
    fp16_tflops: 1979,
    fp8_tflops: 3958,
    interconnect_type: 'NVLink 4',
    interconnect_bw_gb_s: 900
  },
  B200: {
    name: 'B200',
    vendor: Vendor.NVIDIA,
    tdp_watts: 1000,
    idle_watts: 150,
    memory_gb: 192,
    memory_bandwidth_tb_s: 8.0,
    fp16_tflops: 4500,
    fp8_tflops: 9000,
    interconnect_type: 'NVLink 5',
    interconnect_bw_gb_s: 1800
  },
  MI300X: {
    name: 'MI300X',
    vendor: Vendor.AMD,
    tdp_watts: 750,
    idle_watts: 120,
    memory_gb: 192,
    memory_bandwidth_tb_s: 5.3,
    fp16_tflops: 1307,
    fp8_tflops: 2614,
    interconnect_type: 'Infinity Fabric',
    interconnect_bw_gb_s: 896
  }
}

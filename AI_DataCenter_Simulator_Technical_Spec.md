# AI Data Center Infrastructure Simulator
## Technical Specification Document

**Version:** 1.0  
**Date:** January 2026  
**Purpose:** Complete technical specification for building an interactive web-based simulator that models the five layers of AI data center infrastructure (Power, Thermal, Compute, Workload, Economics) with full cross-layer feedback loops.

---

# Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Goals and Philosophy](#2-project-goals-and-philosophy)
3. [User Personas and Use Cases](#3-user-personas-and-use-cases)
4. [System Architecture Overview](#4-system-architecture-overview)
5. [Data Models by Layer](#5-data-models-by-layer)
6. [Cross-Layer Integration](#6-cross-layer-integration)
7. [Simulation Engine](#7-simulation-engine)
8. [User Interface Specification](#8-user-interface-specification)
9. [Visualization Requirements](#9-visualization-requirements)
10. [Scenarios and What-If Analysis](#10-scenarios-and-what-if-analysis)
11. [Technical Implementation](#11-technical-implementation)
12. [MVP Scope and Phasing](#12-mvp-scope-and-phasing)
13. [Appendix: Complete Data Model Reference](#13-appendix-complete-data-model-reference)

---

# 1. Executive Summary

## 1.1 What We're Building

An interactive web simulator that models a complete AI data center across five integrated layers:

| Layer | What It Models | Key Outputs |
|-------|----------------|-------------|
| **Power** | Utility feed → UPS → PDU → Server | kW demand, efficiency losses, redundancy state |
| **Thermal** | Heat generation → Cooling → Heat rejection | Temperatures, PUE, cooling power, free cooling |
| **Compute** | GPUs → Servers → Racks → Clusters | Utilization, available capacity, power draw |
| **Workload** | Jobs → Queues → Scheduling → Execution | Queue depth, wait times, throughput, SLA compliance |
| **Economics** | CapEx + OpEx → TCO → Revenue → ROI | Costs, margins, carbon, financial metrics |

The simulator should demonstrate how changes in one layer cascade through others—for example, how a workload spike increases GPU utilization, which increases power draw, which increases heat, which increases cooling power, which increases electricity cost, which impacts profitability.

## 1.2 Why This Matters

Process engineers transitioning to data center roles need to understand:
- How infrastructure layers interact (similar to integrated process models)
- The quantitative relationships between power, cooling, compute, and cost
- How to reason about capacity planning, efficiency optimization, and failure scenarios

This simulator serves as both a learning tool and a demonstration of systems-level infrastructure thinking.

## 1.3 Target Outcome

A user should be able to:
1. Configure a data center (size, GPU type, cooling architecture, location)
2. Define workload patterns (training jobs, inference load)
3. Run time-stepped simulation and observe cross-layer effects
4. Inject failures or changes and see cascading impacts
5. Compare scenarios (different locations, cooling types, GPU generations)
6. View financial and sustainability metrics

---

# 2. Project Goals and Philosophy

## 2.1 Core Principles

### Principle 1: Physics-Based Modeling
Every calculation should trace back to first principles:
- Power: P = V × I, efficiency = P_out / P_in
- Thermal: Q = m_dot × Cp × ΔT, COP = Q_cooling / W_input
- Compute: P_gpu = P_idle + (P_tdp - P_idle) × U^α

No "magic numbers" without clear derivation.

### Principle 2: Transparency Over Simplicity
All assumptions should be visible and adjustable. Users should see:
- Input parameters with reasonable defaults
- Formulas used for calculations
- Intermediate results, not just final outputs

### Principle 3: Cross-Layer Causality
The simulator must show HOW layers affect each other:
- Workload → Compute: Job allocation determines GPU utilization
- Compute → Power: GPU utilization determines electrical load
- Compute → Thermal: Every watt becomes a watt of heat
- Thermal → Power: Cooling systems consume power (feedback loop)
- All → Economics: Everything has a cost

### Principle 4: Time-Aware Simulation
Real systems evolve over time. The simulator should support:
- Time-stepped simulation (configurable: minutes, hours, days)
- Time-varying inputs (workload patterns, electricity prices, weather)
- State that persists across time steps (battery charge, temperatures)

### Principle 5: Failure and Degradation Modeling
Real systems fail. Users should be able to:
- Inject failures (UPS trip, chiller failure, GPU fault)
- See how redundancy responds
- Understand graceful degradation vs. hard failure

---

# 3. User Personas and Use Cases

## 3.1 Personas

| Persona | Background | Primary Interest |
|---------|------------|------------------|
| **Infrastructure Planner** | Engineering/operations | Capacity planning, what-if scenarios |
| **Process Engineer (transitioning)** | O&G/Chemical engineering | Learning DC systems, seeing familiar concepts |
| **Finance Analyst** | FP&A, capital planning | TCO modeling, ROI analysis |
| **Sustainability Lead** | ESG, environmental | Carbon accounting, PUE optimization |
| **Executive** | General management | High-level trade-offs, investment decisions |

## 3.2 Key Use Cases

### UC1: Design a New Facility
- Input: Target capacity (MW), location, GPU type, budget constraints
- Process: Configure all layers, run baseline simulation
- Output: Expected PUE, TCO, capacity, financial returns

### UC2: Optimize an Existing Facility
- Input: Current configuration, performance data
- Process: Test changes (raise chilled water setpoint, add free cooling)
- Output: Projected improvement in PUE, cost savings

### UC3: Failure Impact Analysis
- Input: Current configuration, specific failure scenario
- Process: Inject failure, observe cascade
- Output: Which systems are affected, time to recovery, capacity impact

### UC4: Workload Planning
- Input: Proposed workload (GPU-hours, job mix)
- Process: Simulate workload against available capacity
- Output: Queue times, utilization, infrastructure stress points

### UC5: Site Comparison
- Input: 2-3 potential locations with different power costs, climates
- Process: Run identical workload at each site
- Output: Comparative TCO, PUE, carbon footprint

### UC6: Technology Upgrade Analysis
- Input: Current H100 deployment, proposed B200 upgrade
- Process: Model both configurations
- Output: Power/cooling requirements, capacity gain, ROI

---

# 4. System Architecture Overview

## 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Config   │ │ Simulate │ │ Visualize│ │ Compare  │ │ Export   │  │
│  │ Panel    │ │ Controls │ │ Dashboard│ │ Scenarios│ │ Results  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SIMULATION ENGINE                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    TIME STEP LOOP                            │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│   │
│  │  │Workload │→│ Compute │→│ Power   │→│ Thermal │→│Economics││   │
│  │  │ Layer   │ │ Layer   │ │ Layer   │ │ Layer   │ │ Layer   ││   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘│   │
│  │       ↑                                              │       │   │
│  │       └──────────────── FEEDBACK ────────────────────┘       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ Scenario │ │ Time     │ │ Reference│ │ Results  │               │
│  │ Config   │ │ Series   │ │ Data     │ │ History  │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

## 4.2 Simulation Loop (Per Time Step)

```
FOR each time_step in simulation_period:
    
    1. UPDATE EXTERNAL INPUTS
       - Weather conditions (for cooling efficiency)
       - Electricity prices (for cost calculation)
       - Workload arrivals (jobs entering queue)
    
    2. WORKLOAD LAYER
       - Process job queue (scheduling decisions)
       - Assign jobs to GPUs
       - Update GPU utilization targets
    
    3. COMPUTE LAYER
       - Calculate GPU power from utilization
       - Calculate server power (GPU + CPU + overhead)
       - Aggregate to rack and cluster power
       - Check for thermal throttling (from previous step)
    
    4. POWER LAYER
       - Calculate UPS load and efficiency
       - Calculate transformer losses
       - Calculate total facility electrical demand
       - Check capacity constraints
       - Update battery state (if on backup)
    
    5. THERMAL LAYER
       - Calculate heat generation (= electrical power)
       - Calculate cooling load
       - Determine chiller power (using COP curve and ambient temp)
       - Update zone temperatures
       - Check for thermal alarms
       - Determine if thermal throttling needed
    
    6. ECONOMICS LAYER
       - Calculate electricity cost (consumption × rate)
       - Calculate demand charges (if new peak)
       - Calculate carbon emissions
       - Update cumulative metrics
    
    7. FEEDBACK EFFECTS
       - Cooling power → adds to Power Layer load
       - Thermal throttling → reduces Compute Layer performance
       - Capacity constraints → affects Workload scheduling
    
    8. RECORD STATE
       - Store all layer states for this time step
       - Update rolling averages (PUE, utilization, etc.)
    
NEXT time_step
```

---

# 5. Data Models by Layer

## 5.1 Power Layer Data Model

```typescript
// Enums
enum SourceType { GRID, SOLAR, WIND, GENERATOR, BATTERY }
enum UPSMode { ONLINE, BYPASS, BATTERY, ECO }
enum RedundancyMode { N, N_PLUS_1, TWO_N, TWO_N_PLUS_1 }

// Power Source
interface PowerSource {
  id: string;
  type: SourceType;
  capacity_kw: number;
  availability: number;           // 0.0 - 1.0
  current_output_kw: number;
  is_online: boolean;
  
  // Cost and emissions
  cost_per_kwh: number;
  carbon_intensity_g_per_kwh: number;
  
  // Generator-specific
  startup_time_seconds?: number;
  fuel_consumption_l_per_kwh?: number;
  fuel_tank_liters?: number;
  fuel_level_pct?: number;
  
  // Solar/wind specific
  capacity_factor?: number;       // Weather-dependent
  
  // Battery specific
  state_of_charge?: number;       // 0.0 - 1.0
  max_discharge_rate_kw?: number;
  round_trip_efficiency?: number;
}

// UPS
interface UPS {
  id: string;
  capacity_kva: number;
  current_load_kw: number;
  mode: UPSMode;
  redundancy_group: string;       // "A" or "B" for 2N
  is_healthy: boolean;
  
  // Battery subsystem
  battery_runtime_minutes: number;
  battery_health_pct: number;
  
  // Efficiency curve: array of [load_pct, efficiency] tuples
  efficiency_curve: [number, number][];
  
  // Methods (to be implemented)
  getEfficiency(): number;        // Interpolate from curve
  getPowerLoss(): number;         // = load × (1/eff - 1)
}

// PDU
interface PDU {
  id: string;
  capacity_kw: number;
  voltage_in: number;             // e.g., 480
  voltage_out: number;            // e.g., 208
  current_load_kw: number;
  efficiency: number;             // ~0.985
  redundancy_group: string;
}

// Transformer
interface Transformer {
  id: string;
  capacity_kva: number;
  voltage_primary: number;
  voltage_secondary: number;
  current_load_kw: number;
  no_load_loss_kw: number;        // Core losses (constant)
  full_load_loss_kw: number;      // I²R losses at rated load
  
  // Methods
  getEfficiency(): number;
  getPowerLoss(): number;         // no_load + (load%)² × full_load
}

// Power Path (one complete path, e.g., "A" or "B" in 2N)
interface PowerPath {
  id: string;
  sources: PowerSource[];
  transformers: Transformer[];
  ups_units: UPS[];
  pdus: PDU[];
  
  // Methods
  getTotalCapacity(): number;     // Min of all series components
  getCurrentLoad(): number;
  getPathEfficiency(): number;    // Product of all component efficiencies
  getTotalLosses(): number;
  isHealthy(): boolean;
}

// Power System (top-level)
interface PowerSystem {
  paths: Map<string, PowerPath>;  // {"A": pathA, "B": pathB}
  redundancy_mode: RedundancyMode;
  
  // Methods
  getTotalITLoad(): number;
  getTotalFacilityPower(): number;  // IT + cooling + losses
  getDistributionPUE(): number;     // Facility / IT
  getAvailableCapacity(): number;   // Respecting redundancy
  simulateFailure(componentId: string): FailureResult;
}
```

## 5.2 Thermal Layer Data Model

```typescript
// Enums
enum CoolingType { AIR_CRAC, AIR_INROW, RDHX, D2C, IMMERSION_SP, IMMERSION_TP }
enum ChillerType { AIR_COOLED, WATER_COOLED, ABSORPTION }
enum TowerType { WET, DRY, HYBRID }

// Chiller
interface Chiller {
  id: string;
  type: ChillerType;
  capacity_kw: number;            // Cooling capacity
  current_load_pct: number;
  status: 'running' | 'standby' | 'failed' | 'maintenance';
  
  // Operating parameters
  chw_supply_temp_c: number;
  chw_return_temp_c: number;
  
  // COP curve: array of [ambient_temp_c, COP] tuples
  cop_curve: [number, number][];
  
  // Methods
  getCOP(ambient_temp_c: number): number;
  getPowerConsumption(ambient_temp_c: number): number;
  getHeatRejected(ambient_temp_c: number): number;
}

// Cooling Tower
interface CoolingTower {
  id: string;
  type: TowerType;
  capacity_kw: number;
  fan_power_kw: number;
  pump_power_kw: number;
  water_consumption_l_per_kwh: number;  // For WUE
  
  approach_temp_c: number;        // CW temp - wet bulb temp
  range_temp_c: number;           // CW return - CW supply
  
  // Methods
  getWaterConsumption(heat_rejected_kwh: number): number;
  getTotalPower(): number;
}

// CDU (Coolant Distribution Unit for liquid cooling)
interface CDU {
  id: string;
  cooling_capacity_kw: number;
  
  // Temperatures
  facility_supply_temp_c: number;
  facility_return_temp_c: number;
  server_supply_temp_c: number;
  server_return_temp_c: number;
  
  // Flow rates
  facility_flow_lpm: number;
  server_flow_lpm: number;
  
  connected_racks: string[];
  
  // Methods
  getHeatRemoved(): number;       // Q = m_dot × Cp × ΔT
  getPumpPower(): number;
}

// CRAH (Computer Room Air Handler)
interface CRAH {
  id: string;
  cooling_capacity_kw: number;
  airflow_cfm: number;
  supply_air_temp_c: number;
  return_air_temp_c: number;
  fan_power_kw: number;
  current_load_pct: number;
  
  // Methods
  getHeatRemoved(): number;
  getTotalPower(): number;
}

// Thermal Zone
interface ThermalZone {
  id: string;
  type: 'data_hall' | 'hot_aisle' | 'cold_aisle';
  
  // Current conditions
  current_temp_c: number;
  humidity_pct: number;
  
  // Setpoints and alarms
  target_temp_c: number;
  temp_high_alarm_c: number;
  temp_critical_c: number;
  
  // Connected equipment
  rack_ids: string[];
  cooling_unit_ids: string[];
  
  // Physical properties
  volume_m3: number;
  
  // Methods
  getThermalMass(): number;       // For temperature dynamics
  getHeatLoad(): number;          // Sum of rack heat
  checkThermalStatus(): 'normal' | 'warning' | 'alarm' | 'critical';
}

// Weather Conditions (external input)
interface WeatherConditions {
  dry_bulb_temp_c: number;
  wet_bulb_temp_c: number;
  humidity_pct: number;
  
  // Methods
  freeCoolingAvailable(setpoint_c: number): boolean;
}

// Cooling System (top-level)
interface CoolingSystem {
  type: CoolingType;
  chillers: Chiller[];
  cooling_towers: CoolingTower[];
  crah_units: CRAH[];
  cdus: CDU[];
  zones: ThermalZone[];
  
  // Economizer settings
  economizer_enabled: boolean;
  economizer_setpoint_c: number;
  
  // Methods
  getTotalCoolingCapacity(): number;
  getCurrentCoolingLoad(): number;
  getCoolingPower(weather: WeatherConditions): number;
  getWaterUsage(weather: WeatherConditions, hours: number): number;
  getPUECoolingContribution(it_load_kw: number, weather: WeatherConditions): number;
}
```

## 5.3 Compute Layer Data Model

```typescript
// Enums
enum Vendor { NVIDIA, AMD, GOOGLE, INTEL }
enum HealthStatus { HEALTHY, DEGRADED, FAILED, MAINTENANCE }
enum NetworkTopology { FAT_TREE, RAIL_OPTIMIZED, DRAGONFLY }

// Accelerator Type (template/spec)
interface AcceleratorType {
  name: string;                   // "H100 SXM"
  vendor: Vendor;
  tdp_watts: number;
  idle_watts: number;
  memory_gb: number;
  memory_bandwidth_tb_s: number;
  fp16_tflops: number;
  fp8_tflops: number;
  interconnect_type: string;      // "NVLink 4"
  interconnect_bw_gb_s: number;
}

// Pre-defined accelerator types
const GPU_TYPES: Record<string, AcceleratorType> = {
  H100_SXM: {
    name: "H100 SXM", vendor: Vendor.NVIDIA, tdp_watts: 700, idle_watts: 105,
    memory_gb: 80, memory_bandwidth_tb_s: 3.35, fp16_tflops: 1979, fp8_tflops: 3958,
    interconnect_type: "NVLink 4", interconnect_bw_gb_s: 900
  },
  B200: {
    name: "B200", vendor: Vendor.NVIDIA, tdp_watts: 1000, idle_watts: 150,
    memory_gb: 192, memory_bandwidth_tb_s: 8.0, fp16_tflops: 4500, fp8_tflops: 9000,
    interconnect_type: "NVLink 5", interconnect_bw_gb_s: 1800
  },
  MI300X: {
    name: "MI300X", vendor: Vendor.AMD, tdp_watts: 750, idle_watts: 120,
    memory_gb: 192, memory_bandwidth_tb_s: 5.3, fp16_tflops: 1307, fp8_tflops: 2614,
    interconnect_type: "Infinity Fabric", interconnect_bw_gb_s: 896
  }
};

// Accelerator (instance)
interface Accelerator {
  id: string;
  type: AcceleratorType;
  node_id: string;
  
  // Current state
  current_utilization: number;    // 0.0 - 1.0
  current_temperature_c: number;
  memory_used_gb: number;
  health_status: HealthStatus;
  
  // Thermal throttling
  is_throttled: boolean;
  throttle_factor: number;        // 1.0 = no throttle, 0.8 = 20% reduced
  
  // Methods
  getPowerDraw(): number;         // P = idle + (tdp - idle) × U^α
  getAvailableFlops(): number;
  isAvailable(): boolean;
}

// Compute Node (server)
interface ComputeNode {
  id: string;
  node_type: string;              // "DGX-H100"
  rack_id: string;
  rack_position_u: number;
  
  accelerators: Accelerator[];
  cpu_count: number;
  cpu_power_watts: number;
  system_memory_gb: number;
  overhead_power_watts: number;   // NICs, fans, storage
  
  // Methods
  getTotalPower(): number;
  getAverageUtilization(): number;
  getAvailableGPUs(): Accelerator[];
  canAcceptJob(gpu_count: number): boolean;
}

// Rack
interface Rack {
  id: string;
  row: string;
  position: number;
  
  nodes: ComputeNode[];
  max_power_kw: number;
  
  // Power references
  pdu_a_id: string;
  pdu_b_id: string;
  
  // Cooling reference
  cooling_zone_id: string;
  
  // Monitoring
  inlet_temp_c: number;
  outlet_temp_c: number;
  
  // Methods
  getCurrentPower(): number;
  getAvailablePower(): number;
  getTotalGPUs(): number;
  getHeatOutput(): number;        // = power (all becomes heat)
}

// Cluster
interface Cluster {
  id: string;
  racks: Rack[];
  spine_switches: NetworkSwitch[];
  leaf_switches: NetworkSwitch[];
  network_topology: NetworkTopology;
  
  // Methods
  getTotalGPUs(): number;
  getTotalPower(): number;
  getAvailableGPUs(): number;
  getBisectionBandwidth(): number;
  findPlacement(job: Job): ComputeNode[];
}

// Network Switch
interface NetworkSwitch {
  id: string;
  type: 'tor' | 'leaf' | 'spine';
  port_count: number;
  port_speed_gbps: number;
  power_watts: number;
}
```

## 5.4 Workload Layer Data Model

```typescript
// Enums
enum JobState { PENDING, QUEUED, RUNNING, COMPLETED, FAILED, PREEMPTED }
enum JobType { TRAINING, INFERENCE, FINE_TUNING, EVALUATION }
enum Priority { P0_CRITICAL, P1_STANDARD, P2_PREEMPTIBLE }

// Job
interface Job {
  id: string;
  type: JobType;
  priority: Priority;
  user_id: string;
  
  // Resource requirements
  gpu_count: number;
  gpu_type: string;
  memory_gb: number;
  estimated_duration_hours: number;
  
  // State tracking
  state: JobState;
  submit_time: Date;
  start_time?: Date;
  end_time?: Date;
  progress_pct: number;
  
  // Placement
  assigned_nodes: string[];
  assigned_gpus: string[];
  
  // Checkpointing (for training)
  checkpoint_interval_hours: number;
  last_checkpoint?: Date;
  
  // Methods
  getQueueTime(): number;         // hours
  getRunTime(): number;           // hours
  getGPUHours(): number;          // gpu_count × run_time
}

// Job Queue
interface JobQueue {
  id: string;
  name: string;
  jobs: Job[];
  max_queue_depth: number;
  default_priority: Priority;
  
  // Methods
  addJob(job: Job): void;
  getNextJob(): Job | null;
  getPendingJobs(): Job[];
  getQueueDepth(): number;
  getAverageWaitTime(): number;
}

// Scheduler
interface Scheduler {
  queues: JobQueue[];
  scheduling_algorithm: 'fifo' | 'fair_share' | 'priority' | 'backfill';
  
  // Methods
  schedule(available_resources: ResourcePool): ScheduleResult;
  preempt(job_id: string): void;
  getUtilization(): number;
  getThroughput(): number;        // jobs/hour or GPU-hours/hour
}

// SLA Definition
interface SLA {
  id: string;
  name: string;
  
  // Targets
  availability_pct: number;       // e.g., 99.99
  max_queue_time_hours: number;   // e.g., 2
  max_latency_ms?: number;        // For inference
  min_throughput?: number;        // requests/sec for inference
  
  // Current compliance
  current_availability_pct: number;
  current_avg_queue_time: number;
  violations_count: number;
}
```

## 5.5 Economics Layer Data Model

```typescript
// Enums
enum CostCategory { 
  CAPEX_BUILDING, CAPEX_POWER, CAPEX_COOLING, CAPEX_IT, CAPEX_NETWORK,
  OPEX_ELECTRICITY, OPEX_STAFF, OPEX_MAINTENANCE, OPEX_OTHER 
}

// Electricity Rate Structure
interface ElectricityRate {
  energy_rate_per_kwh: number;    // $/kWh
  demand_rate_per_kw: number;     // $/kW/month
  
  // Time-of-use
  tou_enabled: boolean;
  tou_peak_hours: number[];       // e.g., [14, 15, 16, 17, 18, 19]
  tou_peak_multiplier: number;    // e.g., 1.5
  tou_offpeak_multiplier: number; // e.g., 0.7
  
  // Methods
  calculateHourlyCost(consumption_kwh: number, hour: number): number;
  calculateMonthlyCost(consumption_kwh: number, peak_demand_kw: number): number;
}

// Carbon Accounting
interface CarbonAccounting {
  grid_intensity_g_per_kwh: number;
  renewable_pct: number;          // 0.0 - 1.0 (contracted renewables)
  
  // PPA details
  ppa_rate_per_mwh: number;
  ppa_carbon_intensity: number;   // Usually 0 for wind/solar
  
  // Methods
  getEmissions(consumption_mwh: number): number;  // tonnes CO2
  getEffectiveCarbon(consumption_mwh: number): number;
}

// CapEx Item
interface CapExItem {
  category: CostCategory;
  description: string;
  amount_usd: number;
  useful_life_years: number;
  
  // Methods
  annualDepreciation(): number;
}

// Financial Model (top-level)
interface FinancialModel {
  facility_name: string;
  it_capacity_mw: number;
  
  // Cost inputs
  capex_items: CapExItem[];
  electricity_rate: ElectricityRate;
  carbon: CarbonAccounting;
  
  // Operating assumptions
  utilization_pct: number;
  staff_count: number;
  staff_cost_per_fte: number;
  maintenance_pct_of_capex: number;
  
  // Revenue assumptions (if applicable)
  revenue_per_gpu_hour?: number;
  
  // Methods
  totalCapex(): number;
  annualElectricityKwh(): number;
  annualElectricityCost(): number;
  annualOpex(): number;
  annualRevenue(): number;
  annualMargin(): number;
  tco(years: number): number;
  npv(discount_rate: number, years: number): number;
  irr(years: number): number;
  paybackPeriod(): number;
  costPerGpuYear(gpu_count: number): number;
}
```

---

# 6. Cross-Layer Integration

## 6.1 Dependency Matrix

| Source Layer | Target Layer | Data Flow | Timing |
|--------------|--------------|-----------|--------|
| Workload | Compute | Job GPU assignments → GPU utilization | Each time step |
| Compute | Power | GPU/server power → PDU/UPS load | Each time step |
| Compute | Thermal | Server power → Heat generation | Each time step |
| Power | Thermal | Distribution losses → Additional heat | Each time step |
| Thermal | Power | Cooling power → Facility load | Each time step |
| Thermal | Compute | High temp → Thermal throttling | Each time step |
| Power | Workload | Capacity limits → Scheduling constraints | Each time step |
| All | Economics | kWh, peaks, events → Cost calculation | Each time step |
| Economics | Workload | Cost signals → Scheduling optimization | Optional |
| External | Thermal | Weather → Chiller COP, free cooling | Hourly |
| External | Economics | Electricity prices → Cost | Hourly |

## 6.2 Key Feedback Loops

### Loop 1: Thermal-Power Feedback (Primary)
```
GPU Utilization ↑ → Power Draw ↑ → Heat ↑ → Cooling Demand ↑ → 
Cooling Power ↑ → Total Facility Power ↑ → PUE ↑ → Cost ↑
```

This is a positive feedback loop (amplifying). It explains why PUE > 1.0.

### Loop 2: Thermal Throttling (Protective)
```
Heat ↑ → Temperature ↑ → Thermal Throttle → GPU Performance ↓ → 
Power Draw ↓ → Heat ↓ → Temperature ↓ → Throttle Released
```

This is a negative feedback loop (stabilizing). It prevents thermal runaway.

### Loop 3: Capacity Constraint (Limiting)
```
Workload ↑ → GPU Demand ↑ → [Check: Demand > Capacity?] →
If Yes: Queue → Wait → Delayed Start
If No: Immediate Start
```

### Loop 4: Economic Optimization (Optional)
```
Electricity Price (current hour) → [Check: Price > Threshold?] →
If Yes: Defer low-priority jobs → Reduce load → Lower cost
If No: Process all jobs
```

## 6.3 Integration Points in Code

```typescript
// Simulation step showing layer integration
function simulateTimeStep(
  state: SimulationState, 
  dt: number, 
  weather: WeatherConditions,
  electricity_price: number
): SimulationState {
  
  // 1. WORKLOAD → COMPUTE
  const scheduled_jobs = state.scheduler.schedule(state.cluster.getAvailableResources());
  for (const job of scheduled_jobs) {
    const placement = state.cluster.findPlacement(job);
    assignJobToGPUs(job, placement);
  }
  
  // 2. COMPUTE: Calculate power from utilization
  let total_it_power_kw = 0;
  for (const rack of state.cluster.racks) {
    for (const node of rack.nodes) {
      const node_power = node.getTotalPower();
      total_it_power_kw += node_power / 1000;
    }
  }
  
  // 3. POWER: Calculate distribution losses
  state.power_system.setITLoad(total_it_power_kw);
  const distribution_losses_kw = state.power_system.getTotalLosses();
  
  // 4. THERMAL: Calculate cooling requirement
  const total_heat_kw = total_it_power_kw + distribution_losses_kw;
  state.cooling_system.setHeatLoad(total_heat_kw);
  
  // 5. THERMAL → POWER: Cooling power consumption
  const cooling_power_kw = state.cooling_system.getCoolingPower(weather);
  
  // 6. Calculate total facility power (FEEDBACK INCORPORATED)
  const total_facility_power_kw = total_it_power_kw + cooling_power_kw + distribution_losses_kw;
  
  // 7. Check for thermal issues (THERMAL → COMPUTE FEEDBACK)
  for (const zone of state.cooling_system.zones) {
    if (zone.checkThermalStatus() === 'critical') {
      applyThermalThrottling(zone.rack_ids, 0.8);  // 20% reduction
    }
  }
  
  // 8. ECONOMICS: Calculate costs
  const hourly_cost = state.financial.electricity_rate.calculateHourlyCost(
    total_facility_power_kw * dt, 
    getCurrentHour()
  );
  
  const carbon_kg = state.financial.carbon.getEmissions(
    total_facility_power_kw * dt / 1000  // MWh
  );
  
  // 9. Calculate metrics
  const pue = total_facility_power_kw / total_it_power_kw;
  
  // 10. Update state and return
  return {
    ...state,
    metrics: {
      pue,
      it_power_kw: total_it_power_kw,
      cooling_power_kw,
      total_power_kw: total_facility_power_kw,
      hourly_cost,
      carbon_kg,
      // ... more metrics
    }
  };
}
```

---

# 7. Simulation Engine

## 7.1 Time Step Configuration

```typescript
interface SimulationConfig {
  // Time settings
  start_time: Date;
  end_time: Date;
  time_step_minutes: number;      // 1, 5, 15, 60
  
  // Scenario
  scenario_id: string;
  facility_config: FacilityConfig;
  workload_profile: WorkloadProfile;
  
  // External data
  weather_data: WeatherTimeSeries;
  price_data: PriceTimeSeries;
  
  // Options
  enable_thermal_dynamics: boolean;   // False = instant equilibrium
  enable_monte_carlo: boolean;
  monte_carlo_iterations: number;
  random_seed?: number;
}
```

## 7.2 Workload Profiles

```typescript
interface WorkloadProfile {
  name: string;
  
  // Training workload
  training: {
    jobs_per_day: number;
    gpu_count_distribution: Distribution;  // e.g., {min: 8, max: 256, mode: 64}
    duration_hours_distribution: Distribution;
    arrival_pattern: 'uniform' | 'business_hours' | 'batch';
  };
  
  // Inference workload
  inference: {
    requests_per_second: TimeSeriesProfile;  // Can vary by hour
    gpus_allocated: number;
    latency_sla_ms: number;
  };
}

// Pre-defined profiles
const WORKLOAD_PROFILES: Record<string, WorkloadProfile> = {
  'ai_training_heavy': {
    name: 'AI Training Heavy',
    training: {
      jobs_per_day: 50,
      gpu_count_distribution: { min: 8, max: 512, mode: 64, type: 'lognormal' },
      duration_hours_distribution: { min: 1, max: 168, mode: 24, type: 'lognormal' },
      arrival_pattern: 'uniform'
    },
    inference: {
      requests_per_second: { base: 100, variation: 0.3 },
      gpus_allocated: 64,
      latency_sla_ms: 100
    }
  },
  'inference_focused': {
    // ... different configuration
  }
};
```

## 7.3 Monte Carlo Simulation

For uncertainty analysis, the simulator should support Monte Carlo runs:

```typescript
interface MonteCarloConfig {
  iterations: number;             // e.g., 1000
  
  // Parameters to vary
  vary_parameters: {
    workload_volume: { distribution: 'normal', mean: 1.0, std: 0.2 };
    electricity_price: { distribution: 'normal', mean: 0.06, std: 0.01 };
    equipment_failure: { distribution: 'poisson', rate_per_year: 2 };
    weather_variation: { distribution: 'historical', source: 'tmy3' };
  };
}

interface MonteCarloResult {
  // Distributions of outcomes
  pue: Distribution;              // {mean, std, p5, p50, p95}
  annual_cost: Distribution;
  availability: Distribution;
  carbon_emissions: Distribution;
  
  // Scenario-specific results for drilling down
  iterations: IterationResult[];
}
```

## 7.4 Failure Injection

```typescript
interface FailureScenario {
  id: string;
  name: string;
  failures: FailureEvent[];
}

interface FailureEvent {
  time: Date | 'random';
  component_type: 'ups' | 'chiller' | 'pdu' | 'generator' | 'gpu' | 'server';
  component_id?: string;          // Specific component, or random if not specified
  duration_hours: number | 'until_repair';
  repair_time_hours?: number;
}

// Pre-defined scenarios
const FAILURE_SCENARIOS: Record<string, FailureScenario> = {
  'chiller_failure': {
    id: 'chiller_failure',
    name: 'Single Chiller Failure',
    failures: [
      { time: 'random', component_type: 'chiller', duration_hours: 4 }
    ]
  },
  'ups_trip': {
    id: 'ups_trip',
    name: 'UPS Trip with Battery Ride-Through',
    failures: [
      { time: 'random', component_type: 'ups', duration_hours: 0.5 }
    ]
  },
  'cascading_thermal': {
    id: 'cascading_thermal',
    name: 'Multiple Chiller Failure (Stress Test)',
    failures: [
      { time: new Date('2025-07-15T14:00:00'), component_type: 'chiller', component_id: 'CH-1', duration_hours: 2 },
      { time: new Date('2025-07-15T14:30:00'), component_type: 'chiller', component_id: 'CH-2', duration_hours: 3 }
    ]
  }
};
```

---

# 8. User Interface Specification

## 8.1 Main Navigation

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏢 AI Data Center Simulator                    [Scenario ▼] [⚙️] [?]  │
├─────────────────────────────────────────────────────────────────────────┤
│  [📊 Dashboard] [⚡ Power] [❄️ Thermal] [🖥️ Compute] [📋 Workload] [💰 Economics] │
└─────────────────────────────────────────────────────────────────────────┘
```

## 8.2 Dashboard View

The main dashboard should provide an at-a-glance view of all layers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  FACILITY OVERVIEW                                   ⏱️ 2025-01-15 14:32│
├───────────────────────┬─────────────────────────────────────────────────┤
│                       │  KEY METRICS                                    │
│   ┌─────────────┐    │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│   │  SANKEY     │    │  │ PUE     │ │ IT Load │ │ GPU Util│ │ Cost/hr ││
│   │  DIAGRAM    │    │  │  1.24   │ │ 78.5 MW │ │  87%    │ │ $4,125  ││
│   │             │    │  │ ▼ 0.02  │ │ ▲ 2.1MW │ │ ▲ 3%    │ │ ▲ $150  ││
│   │  Power →    │    │  └─────────┘ └─────────┘ └─────────┘ └─────────┘│
│   │  Thermal →  │    ├─────────────────────────────────────────────────┤
│   │  Compute    │    │  POWER & THERMAL                                │
│   │             │    │  ┌─────────────────────────────────────────────┐│
│   └─────────────┘    │  │ [Stacked area: IT / Cooling / Losses]      ││
│                       │  │                                             ││
├───────────────────────┤  └─────────────────────────────────────────────┘│
│  LAYER STATUS         ├─────────────────────────────────────────────────┤
│  ⚡ Power    ✅ OK    │  WORKLOAD                                       │
│  ❄️ Thermal  ⚠️ WARN │  ┌─────────────────────────────────────────────┐│
│  🖥️ Compute  ✅ OK    │  │ [Queue depth] [Running jobs] [Throughput]  ││
│  📋 Workload ✅ OK    │  └─────────────────────────────────────────────┘│
│  💰 Economics ✅ OK   │                                                 │
└───────────────────────┴─────────────────────────────────────────────────┘
```

## 8.3 Configuration Panel

A collapsible side panel for scenario configuration:

```
┌─────────────────────────────────────┐
│  SCENARIO CONFIGURATION         [×] │
├─────────────────────────────────────┤
│  📍 LOCATION                        │
│  ┌─────────────────────────────┐   │
│  │ [Iowa (Wind Belt)]       ▼  │   │
│  └─────────────────────────────┘   │
│  Climate: Continental              │
│  Elec. cost: $0.055/kWh           │
│  Free cooling hrs: 4,500/yr       │
├─────────────────────────────────────┤
│  🖥️ COMPUTE INFRASTRUCTURE         │
│  GPU Type: [H100 SXM ▼]            │
│  GPU Count: [8,000    ]            │
│  Servers: 1,000 (8 GPU each)       │
│  Rack Density: [55 kW ▼]           │
├─────────────────────────────────────┤
│  ❄️ COOLING SYSTEM                  │
│  Type: [Direct-to-Chip ▼]          │
│  Chillers: [N+1 Water-cooled ▼]    │
│  Economizer: [✓] Enabled           │
│  Setpoint: [15°C    ]              │
├─────────────────────────────────────┤
│  ⚡ POWER SYSTEM                    │
│  Redundancy: [2N ▼]                │
│  UPS Mode: [Online ▼]              │
│  Battery Runtime: [15 min]         │
├─────────────────────────────────────┤
│  📋 WORKLOAD PROFILE                │
│  Profile: [AI Training Heavy ▼]    │
│  Utilization Target: [85%]         │
├─────────────────────────────────────┤
│  [💾 Save Scenario] [▶️ Run Simulation]│
└─────────────────────────────────────┘
```

## 8.4 Layer-Specific Views

Each layer tab should provide:

1. **Schematic Diagram** - Visual representation of the layer
2. **Key Metrics Panel** - Current values with trends
3. **Time Series Charts** - Historical and projected data
4. **Configuration Table** - Editable parameters
5. **Alerts/Events** - Recent issues or status changes

---

# 9. Visualization Requirements

## 9.1 Core Visualizations

### V1: Sankey Diagram (Energy Flow)
Shows power flow from utility through all conversion stages to IT load, with loss magnitudes visible.

```
Utility ─────────────┬──────────────────────────────────────→ IT Load (78.5 MW)
(102 MW)             │                                         
                     ├─→ Transformer Loss (2.0 MW)
                     │
                     ├─→ UPS Loss (3.5 MW)
                     │
                     └─→ Cooling (18.0 MW) ─→ [Chillers, Pumps, Towers]
```

### V2: PUE Decomposition Waterfall
Bar chart showing how each component contributes to PUE:
```
IT Load (baseline)     │████████████████████████│ 1.00
+ Distribution losses  │██                      │ +0.07
+ Cooling              │██████                  │ +0.18
+ Other                │                        │ +0.01
= Total PUE            │████████████████████████│ 1.26
```

### V3: Time Series Multi-Panel
Synchronized time series showing:
- Panel 1: Power (IT, Cooling, Total)
- Panel 2: Temperatures (Ambient, Supply, Return)
- Panel 3: GPU Utilization
- Panel 4: Cost rate ($/hr)

### V4: Efficiency Curves
Interactive curves showing:
- UPS efficiency vs load
- Chiller COP vs ambient temperature
- GPU power vs utilization

### V5: Rack Layout Heatmap
2D grid showing racks colored by:
- Power consumption (or % of capacity)
- Temperature
- Utilization

### V6: Scenario Comparison
Side-by-side or overlay comparison of 2-3 scenarios:
- PUE comparison
- Cost comparison
- Capacity comparison

### V7: Monte Carlo Distribution
Histogram or violin plot showing distribution of outcomes:
- Annual cost distribution
- PUE distribution
- Availability distribution

### V8: Failure Cascade Timeline
Gantt-style chart showing:
- When failure occurred
- Which systems were affected
- Recovery timeline
- Capacity during event

## 9.2 Interactive Features

- **Hover**: Show detailed values
- **Click**: Drill down to component detail
- **Drag**: Pan time series
- **Scroll**: Zoom time axis
- **Toggle**: Show/hide series
- **Slider**: Time scrubber for playback

---

# 10. Scenarios and What-If Analysis

## 10.1 Pre-Built Scenarios

### Scenario 1: Baseline Operation
- Location: Iowa
- GPU: 8,000 × H100
- Workload: 85% utilization training
- No failures
- Purpose: Establish baseline metrics

### Scenario 2: Hot Day Stress Test
- Same as baseline
- Weather: 40°C dry bulb, 28°C wet bulb
- Purpose: See cooling stress, PUE degradation

### Scenario 3: Technology Upgrade
- Replace H100 with B200 (higher TDP)
- Increase cooling capacity proportionally
- Purpose: Compare TCO and capacity

### Scenario 4: Location Comparison
- Compare Iowa, Texas, Oregon with identical IT
- Purpose: Understand location economics

### Scenario 5: Redundancy Trade-off
- Compare N+1 vs 2N power
- Purpose: Cost vs availability analysis

### Scenario 6: Failure Response
- Inject chiller failure during peak load
- Purpose: Understand degraded operation

## 10.2 What-If Parameters

Users should be able to modify and immediately see impact:

| Parameter | Range | Impact On |
|-----------|-------|-----------|
| Chilled water setpoint | 7-18°C | PUE, cooling power |
| UPS mode | Online/Eco | Efficiency, risk |
| Economizer setpoint | 10-20°C | Free cooling hours |
| GPU utilization target | 50-100% | Power, revenue, queue times |
| Electricity price | $0.03-0.15/kWh | OpEx |
| Renewable % | 0-100% | Carbon, cost |

---

# 11. Technical Implementation

## 11.1 Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Zustand or React Context
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts (primary) + D3.js (custom visualizations)
- **Sankey**: d3-sankey
- **Tables**: TanStack Table

### Simulation Engine
- **Option A (Browser)**: TypeScript, Web Workers for performance
- **Option B (Backend)**: Python (FastAPI) with NumPy/SciPy

Recommend Option A for MVP (simpler deployment, no server costs).

### Data Persistence
- **MVP**: LocalStorage + JSON export/import
- **Future**: Supabase or PostgreSQL for multi-user

### Deployment
- **Frontend**: Vercel or Netlify
- **Backend (if any)**: Railway or Render

## 11.2 Performance Considerations

- Simulation should run at >100 time steps/second for responsive UI
- Use Web Workers to avoid blocking main thread
- Implement progressive rendering for long simulations
- Cache intermediate calculations (efficiency curves, etc.)

## 11.3 Code Organization

```
/src
  /components
    /dashboard        # Main dashboard components
    /power            # Power layer components
    /thermal          # Thermal layer components
    /compute          # Compute layer components
    /workload         # Workload layer components
    /economics        # Economics layer components
    /shared           # Reusable components (charts, tables, etc.)
  /simulation
    /engine           # Core simulation loop
    /models           # Data models (TypeScript interfaces)
    /layers           # Layer-specific calculation logic
    /integration      # Cross-layer integration
  /data
    /scenarios        # Pre-built scenarios (JSON)
    /reference        # GPU specs, weather data, etc.
  /hooks              # Custom React hooks
  /utils              # Helper functions
  /types              # TypeScript type definitions
```

---

# 12. MVP Scope and Phasing

## 12.1 Phase 1: Core Simulation (4-6 weeks)

**Goal**: Working simulator with basic UI

**Features**:
- [ ] Data models for all 5 layers
- [ ] Basic simulation loop (hourly time step)
- [ ] Single scenario configuration
- [ ] Dashboard with key metrics
- [ ] Time series chart (power, PUE)
- [ ] 3 pre-built scenarios

**Not included**: Monte Carlo, failure injection, comparison view

## 12.2 Phase 2: Enhanced Visualization (2-4 weeks)

**Goal**: Rich visual experience

**Features**:
- [ ] Sankey diagram
- [ ] Rack layout heatmap
- [ ] Efficiency curve visualizations
- [ ] Layer-specific detail views
- [ ] Interactive parameter sliders

## 12.3 Phase 3: Advanced Analysis (2-4 weeks)

**Goal**: What-if and uncertainty analysis

**Features**:
- [ ] Scenario comparison (side-by-side)
- [ ] Monte Carlo simulation
- [ ] Failure injection
- [ ] Export to CSV/PDF
- [ ] Save/load scenarios

## 12.4 Phase 4: Polish and Extension (Ongoing)

**Features**:
- [ ] Additional GPU types
- [ ] More location presets
- [ ] Custom workload profiles
- [ ] API for external integration
- [ ] Mobile-responsive design

---

# 13. Appendix: Complete Data Model Reference

## 13.1 Reference Data: GPU Specifications

```typescript
const GPU_SPECS = {
  H100_SXM: {
    tdp_watts: 700,
    idle_watts: 105,
    memory_gb: 80,
    memory_bw_tb_s: 3.35,
    fp16_tflops: 1979,
    nvlink_bw_gb_s: 900,
    price_usd: 30000
  },
  H200_SXM: {
    tdp_watts: 700,
    idle_watts: 105,
    memory_gb: 141,
    memory_bw_tb_s: 4.8,
    fp16_tflops: 1979,
    nvlink_bw_gb_s: 900,
    price_usd: 35000
  },
  B200: {
    tdp_watts: 1000,
    idle_watts: 150,
    memory_gb: 192,
    memory_bw_tb_s: 8.0,
    fp16_tflops: 4500,
    nvlink_bw_gb_s: 1800,
    price_usd: 40000
  },
  MI300X: {
    tdp_watts: 750,
    idle_watts: 120,
    memory_gb: 192,
    memory_bw_tb_s: 5.3,
    fp16_tflops: 1307,
    if_bw_gb_s: 896,
    price_usd: 15000
  }
};
```

## 13.2 Reference Data: Location Presets

```typescript
const LOCATIONS = {
  iowa: {
    name: "Iowa (Wind Belt)",
    electricity_rate: 0.055,
    carbon_intensity: 350,
    free_cooling_hours: 4500,
    cooling_design_temp_c: 35,
    renewable_ppa_available: true
  },
  texas: {
    name: "Texas (ERCOT)",
    electricity_rate: 0.05,
    carbon_intensity: 380,
    free_cooling_hours: 1500,
    cooling_design_temp_c: 40,
    renewable_ppa_available: true
  },
  oregon: {
    name: "Oregon (Pacific NW)",
    electricity_rate: 0.06,
    carbon_intensity: 120,
    free_cooling_hours: 5500,
    cooling_design_temp_c: 30,
    renewable_ppa_available: true
  },
  virginia: {
    name: "Virginia (Data Center Alley)",
    electricity_rate: 0.065,
    carbon_intensity: 300,
    free_cooling_hours: 3000,
    cooling_design_temp_c: 35,
    renewable_ppa_available: true
  },
  sweden: {
    name: "Sweden (Nordic)",
    electricity_rate: 0.04,
    carbon_intensity: 20,
    free_cooling_hours: 7000,
    cooling_design_temp_c: 25,
    renewable_ppa_available: true
  }
};
```

## 13.3 Reference Data: Efficiency Curves

```typescript
// UPS efficiency curve (double-conversion)
const UPS_EFFICIENCY_CURVE = [
  { load_pct: 0.10, efficiency: 0.85 },
  { load_pct: 0.20, efficiency: 0.90 },
  { load_pct: 0.30, efficiency: 0.93 },
  { load_pct: 0.40, efficiency: 0.945 },
  { load_pct: 0.50, efficiency: 0.955 },
  { load_pct: 0.60, efficiency: 0.96 },
  { load_pct: 0.70, efficiency: 0.962 },
  { load_pct: 0.80, efficiency: 0.96 },
  { load_pct: 0.90, efficiency: 0.955 },
  { load_pct: 1.00, efficiency: 0.95 }
];

// Chiller COP curve (water-cooled)
const CHILLER_COP_CURVE = [
  { ambient_c: 15, cop: 7.0 },
  { ambient_c: 20, cop: 6.5 },
  { ambient_c: 25, cop: 6.0 },
  { ambient_c: 30, cop: 5.5 },
  { ambient_c: 35, cop: 5.0 },
  { ambient_c: 40, cop: 4.5 },
  { ambient_c: 45, cop: 4.0 }
];
```

---

# End of Technical Specification

This document provides the complete specification for building the AI Data Center Infrastructure Simulator. Implementation should proceed in phases as outlined in Section 12, with Phase 1 (Core Simulation) being the minimum viable product.

**Key Success Criteria**:
1. User can configure a facility and see realistic power/PUE calculations
2. Cross-layer effects are visible and intuitive
3. Scenarios can be compared quantitatively
4. Physics-based models produce defensible numbers
5. Interface is responsive and educational

**Next Steps**:
1. Review and approve this specification
2. Set up development environment
3. Implement Phase 1 core simulation
4. Iterate based on user feedback

# Data Center Simulator - Calculation Reference

This document provides a comprehensive reference for all calculations performed in the AI Data Center Simulator.

## Table of Contents
1. [Compute Layer Calculations](#compute-layer-calculations)
2. [Power Distribution Calculations](#power-distribution-calculations)
3. [Thermal/Cooling Calculations](#thermal-cooling-calculations)
4. [Economics Calculations](#economics-calculations)
5. [Workload Calculations](#workload-calculations)
6. [Key Metrics](#key-metrics)

---

## Compute Layer Calculations

### GPU Power Consumption
GPU power follows a non-linear relationship with utilization:

```
P_gpu = P_idle + (P_tdp - P_idle) × U^α
```

Where:
- `P_gpu` = Current GPU power (watts)
- `P_idle` = Idle power consumption (watts)
- `P_tdp` = Thermal Design Power - maximum power (watts)
- `U` = GPU utilization (0.0 to 1.0)
- `α` = Power exponent (1.3) - represents non-linear scaling

**Units**: Watts (W)

**Rationale**: GPUs don't scale power linearly with utilization. The exponent (α ≈ 1.3) reflects that power increases faster than linearly as utilization rises.

### Node Power Consumption
```
P_node = Σ(P_gpu) + P_cpu + P_overhead
```

Where:
- `P_gpu` = Sum of all GPU power in the node (watts)
- `P_cpu` = CPU power consumption (watts)
- `P_overhead` = System overhead (NICs, fans, storage, memory) (watts)

**Units**: Watts (W)

### Rack Power Consumption
```
P_rack = Σ(P_node) / 1000
```

**Units**: Kilowatts (kW)

**Note**: Division by 1000 converts watts to kilowatts.

### Cluster IT Load
```
P_IT = Σ(P_rack) + Σ(P_spine_switches) + Σ(P_leaf_switches)
```

Where:
- `P_rack` = Sum of all rack power (kW)
- `P_spine_switches` = Network spine switch power (kW)
- `P_leaf_switches` = Network leaf switch power (kW)

**Units**: Kilowatts (kW)

### GPU Utilization
```
U_avg = Σ(U_i) / N
```

Where:
- `U_i` = Utilization of GPU i (0.0 to 1.0)
- `N` = Total number of GPUs

**Units**: Fraction (0.0 to 1.0), displayed as percentage when multiplied by 100

---

## Power Distribution Calculations

### UPS Efficiency
```
η_ups = interpolate(efficiency_curve, load_pct)
```

Where:
- `load_pct = current_load_kw / capacity_kva`
- `efficiency_curve` = Manufacturer's efficiency curve data

**Units**: Fraction (0.0 to 1.0)

### UPS Power Loss
```
Loss_ups = P_load × (1/η_ups - 1)
```

Where:
- `P_load` = Current load through UPS (kW)
- `η_ups` = UPS efficiency (fraction)

**Units**: Kilowatts (kW)

**Example**: If load = 100 kW and efficiency = 0.95:
- Loss = 100 × (1/0.95 - 1) = 100 × 0.0526 = 5.26 kW

### Transformer Loss
```
Loss_xfmr = Loss_no_load + (load_pct)² × Loss_full_load
```

Where:
- `Loss_no_load` = No-load iron losses (kW)
- `load_pct` = current_load_kw / capacity_kva
- `Loss_full_load` = Full-load copper losses (kW)

**Units**: Kilowatts (kW)

**Rationale**: No-load losses are constant (iron/magnetic losses). Load losses scale with the square of current (I²R losses).

### Transformer Efficiency
```
η_xfmr = P_load / (P_load + Loss_xfmr)
```

**Units**: Fraction (0.0 to 1.0)

### PDU Loss
```
Loss_pdu = P_load × (1 - η_pdu)
```

Where:
- `η_pdu` = PDU efficiency (typically 0.98-0.99)

**Units**: Kilowatts (kW)

### Total Distribution Losses
```
Loss_total = Σ(Loss_ups) + Σ(Loss_xfmr) + Σ(Loss_pdu)
```

**Units**: Kilowatts (kW)

---

## Thermal/Cooling Calculations

### Chiller COP (Coefficient of Performance)
```
COP = interpolate(cop_curve, T_ambient)
```

Where:
- `cop_curve` = Manufacturer's COP vs. temperature curve
- `T_ambient` = Ambient dry bulb temperature (°C)

**Units**: Dimensionless ratio

**Typical Values**: 2.5 to 5.5 (higher is better)

### Chiller Power Consumption
```
P_chiller = Q_cooling / COP
```

Where:
- `Q_cooling` = Cooling load on this chiller (kW of heat removal)
- `COP` = Coefficient of Performance

**Units**: Kilowatts (kW)

**Example**: To remove 1000 kW of heat with COP = 4.0:
- Power = 1000 / 4.0 = 250 kW

### Free Cooling Eligibility
```
Free_cooling_available = (T_wet_bulb < T_setpoint - 5°C) AND economizer_enabled
```

Where:
- `T_wet_bulb` = Wet bulb temperature (°C)
- `T_setpoint` = Economizer setpoint temperature (°C)

**Units**: Boolean (true/false)

### Free Cooling Power
When free cooling is active:
```
P_cooling = Q_heat × 0.02
```

Where:
- `Q_heat` = Total heat load (kW)
- `0.02` = Pump and fan power as fraction of load (2%)

**Units**: Kilowatts (kW)

**Rationale**: Free cooling only requires pumps and fans (no compressor), typically 2% of heat load.

### Mechanical Cooling Power
When mechanical cooling is required:
```
P_cooling = Σ(P_chiller) + Σ(P_cooling_tower) + Σ(P_crah)
```

Where:
- `P_chiller` = Chiller compressor power (kW)
- `P_cooling_tower` = Cooling tower fan + pump power (kW)
- `P_crah` = CRAH (Computer Room Air Handler) fan power (kW)

**Units**: Kilowatts (kW)

### Heat Load
```
Q_heat = P_IT + Loss_distribution
```

Where:
- `P_IT` = IT equipment power (kW)
- `Loss_distribution` = Power distribution losses (kW)

**Units**: Kilowatts (kW)

**Rationale**: All electrical power eventually becomes heat that must be removed.

---

## Economics Calculations

### Electricity Cost (with Supply Mix)
```
Cost_hourly = Σ(Cost_source_i)

Where for each source i:
  Consumption_i = Total_consumption × (percentage_i / 100)

  If source is grid AND TOU enabled:
    Rate_i = base_rate_i × TOU_multiplier
  Else:
    Rate_i = base_rate_i

  Cost_source_i = Consumption_i × Rate_i
```

Where:
- `Total_consumption` = Total facility power consumption (kWh)
- `percentage_i` = Percentage of power from source i (0-100)
- `TOU_multiplier` = Time-of-use multiplier (peak or off-peak)

**Units**: USD ($)

**Example**:
- Total consumption = 1000 kWh/hr
- 80% grid at $0.055/kWh (off-peak × 0.9) = 800 kWh × $0.0495 = $39.60
- 20% wind PPA at $0.030/kWh = 200 kWh × $0.030 = $6.00
- **Total cost = $45.60/hr**

### Carbon Emissions (with Supply Mix)
```
Carbon_total = Σ(Carbon_source_i)

Where for each source i:
  Consumption_i = Total_consumption_MWh × (percentage_i / 100)
  Carbon_source_i = (Consumption_i × 1000 × carbon_intensity_i) / 1000
```

Where:
- `Total_consumption_MWh` = Total facility power consumption (MWh)
- `carbon_intensity_i` = Carbon intensity of source i (g CO₂/kWh)
- Conversion: MWh → kWh (×1000), then g → kg (/1000)

**Units**: Kilograms CO₂ (kg)

**Example**:
- Total consumption = 1 MWh
- 80% grid at 350 g/kWh = 0.8 MWh × 1000 × 350 / 1000 = 280 kg CO₂
- 20% wind at 0 g/kWh = 0.2 MWh × 1000 × 0 / 1000 = 0 kg CO₂
- **Total emissions = 280 kg CO₂**

### Total Capital Expenditure (CAPEX)
```
CAPEX_total = Σ(amount_i)
```

Where `amount_i` = cost of capital item i

**Units**: USD ($)

### Annual Depreciation
```
Depreciation_annual = Σ(amount_i / useful_life_i)
```

**Units**: USD ($)

### Annual Operating Expenditure (OPEX)
```
OPEX_annual = Cost_electricity + Cost_staff + Cost_maintenance

Where:
  Cost_electricity = Annual kWh × Rate_avg
  Cost_staff = staff_count × cost_per_FTE
  Cost_maintenance = CAPEX_total × maintenance_pct
```

**Units**: USD ($)

### Total Cost of Ownership (TCO)
```
TCO = CAPEX_total + (OPEX_annual × years)
```

**Units**: USD ($)

---

## Workload Calculations

### Jobs by State
Simple count of jobs in each state (QUEUED, RUNNING, COMPLETED, FAILED).

### Average Queue Time
```
Queue_time_avg = Σ(queue_time_i) / N_completed

Where for completed jobs:
  queue_time_i = (start_time - submit_time) in hours
```

**Units**: Hours

### GPU Hours
```
GPU_hours_total = Σ(gpu_count_i × runtime_i)

Where:
  runtime_i = (end_time - start_time) in hours
```

**Units**: GPU-hours

---

## Key Metrics

### Power Usage Effectiveness (PUE)
```
PUE = P_facility / P_IT

Where:
  P_facility = P_IT + P_cooling + Loss_distribution
```

**Units**: Dimensionless ratio

**Typical Values**:
- 1.0 = Perfect (impossible in practice)
- 1.2-1.3 = Excellent (hyperscale data centers)
- 1.5-1.8 = Good (modern facilities)
- 2.0+ = Poor (legacy facilities)

**Interpretation**: PUE of 1.5 means for every 1 kW of IT power, 0.5 kW is overhead.

### Cooling Capacity Utilization
```
Cooling_util = (Q_heat / Q_capacity) × 100
```

Where:
- `Q_heat` = Current heat load (kW)
- `Q_capacity` = Total chiller capacity (kW)

**Units**: Percentage (%)

**Warning Thresholds**:
- < 60%: Normal (green)
- 60-80%: Elevated (yellow)
- > 80%: Critical (red)

### Power Density
```
Density = P_total / N_gpus
```

Where:
- `P_total` = Total facility power (kW)
- `N_gpus` = Total number of GPUs

**Units**: kW/GPU

**Typical Values** (for H100 systems):
- 1.5-2.5 kW/GPU (including all overhead)

### Cooling Efficiency (COP - System Level)
```
COP_system = Q_heat / P_cooling
```

Where:
- `Q_heat` = Heat removed (kW) = IT Load
- `P_cooling` = Cooling system power consumption (kW)

**Units**: Dimensionless ratio

**Typical Values**:
- Free cooling: 20-50 (very efficient)
- Mechanical cooling: 2.5-5.5
- Poor conditions: 1.5-2.5

---

## Unit Conversions

### Power
- 1 kW = 1,000 W
- 1 MW = 1,000 kW = 1,000,000 W

### Energy
- 1 kWh = 1 kW × 1 hour
- 1 MWh = 1,000 kWh

### Carbon
- Intensity: g CO₂/kWh
- Emissions: kg CO₂ (divide g by 1,000)
- Tonnes CO₂ = kg CO₂ / 1,000

### Time
- Milliseconds to hours: ms / (1000 × 60 × 60)
- Hours to milliseconds: hours × 60 × 60 × 1000

---

## Validation Checks

### Energy Conservation
The sum of all power consumption should equal the sum of all power generation/supply:
```
P_facility = P_IT + P_cooling + Loss_distribution
```

This is the basis of PUE calculation and must always hold true.

### Heat Balance
All electrical power becomes heat:
```
Q_heat = P_IT + Loss_distribution
```

Cooling system must remove at least this amount of heat.

### Efficiency Bounds
All efficiencies must be between 0.0 and 1.0 (0% to 100%):
- UPS efficiency: typically 0.92-0.98
- Transformer efficiency: typically 0.97-0.99
- PDU efficiency: typically 0.98-0.99

### COP Bounds
Coefficient of Performance must be > 0:
- Mechanical cooling: typically 2.5-5.5
- Free cooling effective COP: 20-50
- Values below 1.5 indicate very poor performance
- Values above 10 indicate free cooling is active

---

## Common Pitfalls

1. **Unit Mixing**: Always verify units are consistent (kW vs MW, kWh vs MWh)
2. **Efficiency vs Loss**: Efficiency = useful/total. Loss = total - useful = total × (1 - efficiency)
3. **Power vs Energy**: Power (kW) is instantaneous. Energy (kWh) is power × time
4. **COP Direction**: COP = heat_removed / power_consumed (higher is better)
5. **Percentage Representation**: Store as fraction (0.0-1.0), display as percentage (multiply by 100)

---

## References

- ASHRAE TC 9.9 - Data Center Thermal Guidelines
- The Green Grid - PUE Measurement Protocols
- Energy Star - UPS and Transformer Efficiency Standards
- DOE - Data Center Energy Efficiency Best Practices

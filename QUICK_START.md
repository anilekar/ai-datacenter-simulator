# Quick Start Guide

## Installation & Running

```bash
# Install dependencies (already done)
npm install

# Start the development server
npm run dev
```

The application will be available at **http://localhost:3000**

## First Steps

1. **The application will automatically load** with the "Baseline Operation" scenario when you first open it
2. **Select a scenario** from the dropdown in the configuration panel:
   - **Baseline Operation**: 8,000 H100 GPUs in Iowa under normal conditions
   - **Hot Day Stress Test**: Same setup with 40°C ambient temperature
   - **B200 Technology Upgrade**: Higher power B200 GPUs for comparison

3. **Run the simulation**:
   - Click **"Run"** to start the automatic simulation (updates every second)
   - Click **"Pause"** to stop
   - Use **"Step +1h"** to advance one hour at a time
   - Use **"Step +24h"** to fast-forward a full day
   - Click **"Reset"** to return to the scenario's initial state

4. **Observe the metrics**:
   - **PUE**: Power Usage Effectiveness (lower is better, aim for <1.3)
   - **IT Load**: Total power consumed by compute equipment
   - **GPU Utilization**: Percentage of GPU capacity being used
   - **Cost Rate**: Dollar cost per hour of operation

## Understanding the Dashboard

### Key Metrics (Top Row)
- Real-time values for the most important facility metrics
- PUE, IT Load, GPU Utilization, and Cost Rate

### Power Distribution (Left Column)
- Shows how power is distributed across IT, Cooling, and Losses
- Visual progress bars showing relative proportions
- Total facility power at the bottom

### Thermal Status (Right Column)
- Average zone temperature
- Cooling capacity utilization
- Current weather conditions

### Compute Resources
- Total and available GPUs
- GPU utilization percentage
- Job queue status (Queued, Running, Done)

### Economics & Sustainability
- Cost rate ($/hour)
- Carbon emission rate (kg/hour)
- Cumulative totals since simulation start

### Power & PUE Over Time Chart
- Line chart showing historical data
- IT Power and Cooling Power on the left axis
- PUE on the right axis
- Automatically updates as simulation runs

## What to Look For

### Baseline Scenario
- PUE should be around **1.20-1.25** (good efficiency)
- IT Load around **78-80 MW** for 8,000 H100 GPUs at 85% utilization
- Cooling power around **15-20 MW**

### Hot Day Scenario
- PUE will increase to **1.30-1.35** due to reduced chiller efficiency
- Cooling power increases significantly (chillers work harder in heat)
- Demonstrates importance of location/climate selection

### B200 Upgrade Scenario
- Higher IT load (**~110 MW**) due to 1000W TDP vs 700W
- Increased cooling requirements
- Higher costs but more compute capacity

## Physics Behind the Simulation

### Power Flow
```
IT Load → Heat Generation → Cooling Required → Cooling Power →
Total Facility Power = IT + Cooling + Losses
```

### PUE Calculation
```
PUE = Total Facility Power / IT Load
```

A PUE of 1.20 means for every 1 kW of IT power, the facility uses 1.20 kW total (0.20 kW overhead).

### GPU Power Model
```
P_gpu = P_idle + (P_tdp - P_idle) × Utilization^1.3
```

Power consumption is non-linear with utilization!

### Chiller Efficiency
- COP (Coefficient of Performance) decreases as ambient temperature increases
- Free cooling is used when possible (wet bulb temp < setpoint - 5°C)

## Troubleshooting

### Application won't start
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### No data in charts
- Make sure you've clicked "Run" or used the Step buttons
- Charts only populate after simulation has run for at least 2 time steps

### Build errors
```bash
# Rebuild from scratch
npm run build
```

## Next Steps

Once you're comfortable with the pre-built scenarios:
1. Study the code in `src/simulation/` to understand the physics models
2. Review `src/data/scenarios.ts` to see how scenarios are configured
3. Add your own GPU types in `src/data/gpuSpecs.ts`
4. Create custom scenarios with different configurations
5. Explore the calculation functions in `src/simulation/calculations/`

Happy simulating! 🏢⚡❄️

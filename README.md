# AI Data Center Infrastructure Simulator

An interactive web-based simulator that models the five layers of AI data center infrastructure (Power, Thermal, Compute, Workload, Economics) with full cross-layer feedback loops.

## Features

### 🏗️ Five Integrated Layers

1. **Power Layer** - Models power distribution from utility feed through UPS, transformers, and PDUs
2. **Thermal Layer** - Calculates cooling requirements, chiller performance, and free cooling opportunities
3. **Compute Layer** - Tracks GPU utilization, server power consumption, and cluster resources
4. **Workload Layer** - Manages job queues and resource allocation
5. **Economics Layer** - Computes real-time costs, carbon emissions, and TCO

### 🔄 Cross-Layer Feedback

- Workload drives GPU utilization
- GPU utilization determines IT power draw
- IT power becomes heat that must be cooled
- Cooling systems consume power (feedback loop)
- All layers impact economics and sustainability

### 📊 Key Metrics

- **PUE (Power Usage Effectiveness)** - Facility efficiency metric
- **Power Distribution** - IT load, cooling power, and losses
- **GPU Utilization** - Real-time compute resource usage
- **Cost & Carbon** - Hourly rates and cumulative totals

### 🎯 Pre-Built Scenarios

1. **Baseline Operation** - 8,000 H100 GPUs in Iowa under normal conditions
2. **Hot Day Stress Test** - Same setup with extreme heat (40°C) to test cooling limits
3. **B200 Technology Upgrade** - Higher TDP GPUs (1000W vs 700W) for performance analysis

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Visualizations**: Recharts
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:3000`

## Usage

1. **Select a Scenario** - Choose from pre-built scenarios or configure your own
2. **Run Simulation** - Click "Run" to start the time-stepped simulation
3. **Observe Metrics** - Watch real-time updates to power, thermal, and economic metrics
4. **Analyze Results** - Review charts showing power consumption and PUE over time

### Simulation Controls

- **Run/Pause** - Start or stop the automatic simulation
- **Step +1h** - Advance simulation by one hour
- **Step +24h** - Fast-forward by one day
- **Reset** - Return to initial scenario state

## Architecture

### Simulation Engine

The core simulation loop (`src/simulation/engine.ts`) executes these steps each time period:

1. Calculate IT load from GPU utilization
2. Compute power distribution losses
3. Determine cooling requirements (heat = IT + losses)
4. Calculate cooling power consumption
5. Compute total facility power (with feedback)
6. Track workload and economics metrics
7. Update time series history

### Data Models

All five layers have TypeScript interfaces defined in `src/types/`:
- `power.ts` - Power sources, UPS, transformers, PDUs
- `thermal.ts` - Chillers, cooling towers, thermal zones
- `compute.ts` - GPUs, servers, racks, clusters
- `workload.ts` - Jobs, queues, scheduler
- `economics.ts` - Costs, carbon accounting, CapEx

### Physics-Based Calculations

- **GPU Power**: `P = P_idle + (P_tdp - P_idle) × U^1.3`
- **UPS/Transformer Losses**: Efficiency curves based on load
- **Chiller COP**: Temperature-dependent performance
- **PUE**: `(IT + Cooling + Losses) / IT`

📖 **See [CALCULATIONS.md](./CALCULATIONS.md) for comprehensive calculation documentation including unit conversions, formulas, and validation checks.**

## Customization

### Adding New GPU Types

Edit `src/data/gpuSpecs.ts`:

```typescript
NEW_GPU: {
  name: 'New GPU',
  vendor: Vendor.NVIDIA,
  tdp_watts: 800,
  idle_watts: 120,
  // ... other specs
}
```

### Adding New Locations

Edit `src/data/locations.ts`:

```typescript
new_location: {
  name: 'New Location',
  electricity_rate: 0.05,
  carbon_intensity: 300,
  // ... other properties
}
```

### Creating Custom Scenarios

Edit `src/data/scenarios.ts` to add new pre-built scenarios with specific configurations.

## Project Structure

```
src/
├── components/          # React components
│   ├── dashboard/      # Dashboard and charts
│   ├── config/         # Configuration panel
│   └── ui/             # Reusable UI components
├── simulation/          # Simulation engine
│   ├── calculations/   # Layer-specific calculations
│   ├── engine.ts       # Main simulation loop
│   └── scenarioBuilder.ts  # Scenario generation
├── types/              # TypeScript type definitions
├── data/               # Reference data (GPUs, locations, scenarios)
├── store/              # Zustand state management
└── App.tsx             # Main application component
```

## Key Design Principles

1. **Physics-Based Modeling** - All calculations trace back to first principles
2. **Transparency** - Assumptions are visible and adjustable
3. **Cross-Layer Causality** - Shows how layers affect each other
4. **Time-Aware** - Time-stepped simulation with state persistence
5. **Real-World Accuracy** - Uses actual GPU specs and efficiency curves

## Recent Updates

### ✅ Implemented Features
- **Failure Injection** - Simulate chiller failures, GPU rack failures, cooling tower failures, PDU issues, and UPS trips
- **Multiple Simultaneous Failures** - Support for complex failure scenarios with overlapping events
- **Electricity Supply Mix** - Configure custom mixes of grid power, renewable PPAs, on-site solar/wind, and battery storage
- **Cost vs Carbon Optimization** - Choose optimization targets for electricity sourcing
- **Multi-Variable Analysis** - Plot up to 5 Y-axis variables against any X-axis metric with dual Y-axes
- **Historical Data Tracking** - Ambient temperature and carbon rate tracked throughout simulation
- **Dynamic Time Profiles** - Weather, workload, and electricity pricing patterns that vary by hour

### 🔜 Future Enhancements

- Monte Carlo uncertainty analysis
- Side-by-side scenario comparison
- CSV/PDF export capabilities
- More GPU types and cooling architectures
- Custom workload profile builder
- Water usage effectiveness (WUE) tracking

## License

MIT

## Acknowledgments

Built following the comprehensive technical specification for modeling AI data center infrastructure. Based on real-world data center physics and engineering principles.

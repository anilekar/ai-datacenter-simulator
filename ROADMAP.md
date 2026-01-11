# Development Roadmap - Path to Full Tech Spec

## ✅ Phase 1: MVP (COMPLETE)
- [x] All 5 layer data models
- [x] Physics-based calculations
- [x] Cross-layer integration
- [x] Basic UI with dashboard
- [x] Time-series visualization
- [x] 3 static scenarios

## ✅ Phase 1.5: Dynamic Behavior (COMPLETE)
- [x] Time-varying weather profiles
- [x] Workload variation patterns
- [x] Time-of-use electricity pricing
- [x] 4 new dynamic scenarios
- [x] Hourly profile application in engine

## 🚧 Phase 2: Interactive Configuration (NEXT - High Priority)

### 2A. Parameter Controls UI
**Effort: 2-3 hours | Impact: HIGH**

Add interactive controls to ConfigPanel:

```typescript
// New component: src/components/config/ParameterControls.tsx

<Card>
  <CardTitle>Facility Configuration</CardTitle>

  {/* GPU Configuration */}
  <label>GPU Count</label>
  <input type="range" min="1000" max="20000" step="1000" />
  <span>{gpuCount.toLocaleString()} GPUs</span>

  <label>GPU Type</label>
  <select>
    <option>H100 SXM (700W)</option>
    <option>H200 SXM (700W)</option>
    <option>B200 (1000W)</option>
    <option>MI300X (750W)</option>
  </select>

  {/* Location */}
  <label>Location</label>
  <select>
    {Object.entries(LOCATIONS).map(...)}
  </select>

  {/* Profiles */}
  <label>Weather Pattern</label>
  <select>
    <option>Static</option>
    <option>Typical Summer</option>
    <option>Extreme Heat</option>
    <option>Cool Day</option>
  </select>

  <label>Workload Pattern</label>
  <select>
    <option>Constant 85%</option>
    <option>Business Hours</option>
    <option>Batch Training</option>
    <option>Inference Heavy</option>
  </select>

  <label>Electricity Pricing</label>
  <select>
    <option>Flat Rate</option>
    <option>Standard TOU</option>
    <option>Extreme Peak</option>
    <option>Renewable Heavy</option>
  </select>

  <button onClick={applyCustomConfig}>Apply Custom Configuration</button>
</Card>
```

**Benefits:**
- Users can experiment without editing code
- Real-time "what-if" analysis
- See impact of location choice instantly

### 2B. Current Conditions Display
**Effort: 1 hour | Impact: MEDIUM**

Show what's happening NOW:

```typescript
<Card>
  <CardTitle>Current Conditions (Hour {currentHour})</CardTitle>
  <div>🌡️ Temperature: {weather.dry_bulb_temp_c}°C</div>
  <div>💻 GPU Utilization: {avgUtilization}%</div>
  <div>⚡ Electricity Price: ${electricityPrice}/kWh</div>
  <div>❄️ Free Cooling: {freeCoolingActive ? 'Active' : 'Inactive'}</div>
</Card>
```

## 📊 Phase 3: Enhanced Visualizations (High Value)

### 3A. Sankey Diagram for Power Flow
**Effort: 4-5 hours | Impact: HIGH**

```
Grid (102 MW) ──┬─→ IT Load (78.5 MW)
                 ├─→ Cooling (18.0 MW)
                 │   ├─→ Chillers (15 MW)
                 │   ├─→ Pumps (2 MW)
                 │   └─→ Towers (1 MW)
                 └─→ Losses (5.5 MW)
                     ├─→ UPS (3.5 MW)
                     └─→ Transformers (2.0 MW)
```

Use `react-sankey` or `d3-sankey` (already in package.json).

### 3B. PUE Decomposition Waterfall Chart
**Effort: 2 hours | Impact: MEDIUM**

```
IT (1.00) ──> +Cooling (0.23) ──> +Losses (0.07) ──> Total PUE (1.30)
```

### 3C. Rack Layout Heatmap
**Effort: 3-4 hours | Impact: MEDIUM**

2D grid showing each rack colored by:
- Power consumption (% of capacity)
- Temperature
- Utilization

### 3D. Additional Time Series Charts
**Effort: 2 hours | Impact: MEDIUM**

Separate charts for:
- Temperature timeline (ambient vs zone)
- Cost accumulation (cumulative)
- Carbon emissions over time

## 🎲 Phase 4: Failure Scenarios (Tech Spec Required)

### 4A. Failure Injection UI
**Effort: 4-5 hours | Impact: HIGH**

```typescript
<Card>
  <CardTitle>Failure Injection</CardTitle>

  <select>
    <option>Single Chiller Failure</option>
    <option>UPS Trip (Battery Ride-Through)</option>
    <option>GPU Rack Failure</option>
    <option>PDU Failure</option>
    <option>Cascading Thermal Event</option>
  </select>

  <label>Duration</label>
  <input type="number" /> hours

  <button>Inject Failure at Current Time</button>
</Card>
```

### 4B. Failure Response Logic
**Effort: 6-8 hours | Impact: HIGH**

Implement in engine:
- Chiller failure → N+1 kicks in → higher load on remaining
- UPS trip → switch to battery → countdown timer
- Thermal runaway → throttle GPUs → reduce load
- PDU failure → half of racks offline (if 2N)

### 4C. Redundancy Visualization
**Effort: 2 hours | Impact: MEDIUM**

Show which systems are active/standby/failed.

## 🔬 Phase 5: Advanced Analysis (Tech Spec Future)

### 5A. Scenario Comparison View
**Effort: 5-6 hours | Impact: HIGH**

Side-by-side comparison:
```
| Metric           | Baseline | Hot Day | Difference |
|------------------|----------|---------|------------|
| Avg PUE          | 1.24     | 1.35    | +0.11      |
| Daily Cost       | $98K     | $112K   | +$14K      |
| Annual Savings   | -        | -       | -$5.1M     |
```

### 5B. Monte Carlo Simulation
**Effort: 8-10 hours | Impact: MEDIUM**

Run 100-1000 variations:
- Vary workload (±20%)
- Vary weather (historical data)
- Vary equipment failure rates
- Show distribution of outcomes

### 5C. Export & Reporting
**Effort: 3-4 hours | Impact: MEDIUM**

- Export chart data to CSV
- Generate PDF report
- Save/load custom scenarios from JSON

## 🎯 Phase 6: Workload Realism (Complex)

### 6A. Actual Job Scheduling
**Effort: 10-12 hours | Impact: MEDIUM**

Currently GPU utilization is set directly. Add:
- Job submission with arrival times
- Queue dynamics (FIFO, priority, backfill)
- Job placement onto GPUs
- Completion and new arrivals

### 6B. SLA Tracking
**Effort: 2-3 hours | Impact: LOW**

- Queue time SLAs
- Availability tracking
- Violations counter

## 🌡️ Phase 7: Thermal Dynamics (Advanced)

### 7A. Thermal Mass Modeling
**Effort: 6-8 hours | Impact: LOW**

Instead of instant temperature changes:
```
dT/dt = (Q_in - Q_out) / (m × Cp)
```

Temperature changes gradually over time.

### 7B. Zone-Level Detail
**Effort: 5-6 hours | Impact: LOW**

Model hot aisle / cold aisle separately.

## 🎨 Phase 8: UX Polish

### 8A. Dark Mode Toggle
**Effort: 2 hours | Impact: LOW**

### 8B. Mobile Responsive Design
**Effort: 4-5 hours | Impact: MEDIUM**

### 8C. Guided Tour / Tutorial
**Effort: 3-4 hours | Impact: MEDIUM**

First-time user walkthrough.

### 8D. Keyboard Shortcuts
**Effort: 1 hour | Impact: LOW**

- Space: Play/Pause
- S: Step forward
- R: Reset

## 📊 Recommended Priority Order

### Immediate (This Week)
1. **Parameter Controls UI** (2-3 hrs) - Highest user value
2. **Current Conditions Display** (1 hr) - Easy win
3. **Sankey Diagram** (4-5 hrs) - Tech spec highlight

### Short Term (This Month)
4. **Failure Injection UI + Logic** (10-13 hrs) - Core spec feature
5. **Scenario Comparison View** (5-6 hrs) - High utility
6. **Additional Time Series Charts** (2 hrs) - Easy value add

### Medium Term (Next 2 Months)
7. **Monte Carlo Simulation** (8-10 hrs)
8. **Export/Reporting** (3-4 hrs)
9. **PUE Waterfall Chart** (2 hrs)
10. **Rack Heatmap** (3-4 hrs)

### Long Term (Future)
11. **Actual Job Scheduling** (10-12 hrs)
12. **Thermal Dynamics** (6-8 hrs)
13. **Mobile Responsive** (4-5 hrs)
14. **UX Polish** (dark mode, tour, etc.)

## 🎁 Quick Wins (Can Do in <2 Hours Each)

1. **Show profile names in dashboard** - "Weather: Typical Summer"
2. **Add "Reset to Default" button** - Quickly return to baseline
3. **Highlight metric changes** - Flash green/red when values change significantly
4. **Add tooltips** - Explain what each metric means
5. **Current hour indicator** - Show time of day visually
6. **Cost projections** - "At this rate: $X/day, $Y/year"
7. **PUE gauge** - Visual indicator with good/bad zones
8. **Peak demand tracker** - Show highest power demand seen

## 📈 Metrics to Track

As you build, measure:
- Time to implement each feature
- User engagement (which features get used)
- Performance (simulation speed)
- Bundle size (keep it reasonable)

## 🎯 Success Criteria (From Tech Spec)

- [x] User can configure a facility ✅
- [ ] User can adjust parameters interactively
- [x] See realistic power/PUE calculations ✅
- [x] Cross-layer effects are visible ✅
- [ ] Scenarios can be compared quantitatively
- [x] Physics-based models produce defensible numbers ✅
- [x] Interface is responsive and educational ✅

**Current Progress: 60% of tech spec requirements met**
**With Phase 2-3: 85% of core requirements met**

## 🚀 Get Started

**Next 3 steps:**

1. Implement parameter controls (ConfigPanel.tsx)
2. Add current conditions display
3. Create Sankey diagram component

Then you'll have a truly interactive simulator that's 85% spec-complete!

# Excel Export Feature

## Overview
The AI Data Center Simulator now includes comprehensive Excel export functionality, allowing you to export complete simulation results to a multi-sheet Excel workbook.

## How to Use

1. **Run a Simulation**: Start a simulation scenario and let it run for some time steps
2. **Export**: Click the green "Export to Excel" button at the top of the Dashboard
3. **Save**: The Excel file will automatically download to your browser's download folder

## Excel File Structure

The exported workbook contains **6 comprehensive sheets**:

### 1. **Summary Sheet**
Current snapshot of all key metrics:
- **Scenario Information**: Name, dates, time step, data points
- **Power Metrics**: IT load, cooling power, distribution losses, total power, PUE
- **Thermal Metrics**: Zone temperature, cooling capacity usage, ambient conditions
- **Compute Metrics**: GPU counts, utilization
- **Workload Metrics**: Jobs by state, queue times
- **Economics Metrics**: Hourly and cumulative costs and carbon emissions

### 2. **Time Series Sheet**
Complete historical data for every time step:
- Timestamp
- Hour (elapsed)
- IT Power (kW)
- Cooling Power (kW)
- Total Power (kW)
- Distribution Losses (kW)
- PUE
- GPU Utilization (%)
- Zone Temperature (°C)
- Ambient Temperature (°C)
- Cost Rate ($/hr)
- Carbon Rate (kg/hr)

**Perfect for**: Creating charts, trend analysis, statistical analysis

### 3. **Configuration Sheet**
Complete system configuration:
- **Facility**: Name, capacity
- **Compute Layer**: Racks, nodes, GPUs, GPU specs, network switches
- **Power Layer**: UPS units, transformers, PDUs with capacities
- **Thermal Layer**: Chillers, cooling towers, CRAH units, economizer settings
- **Economics Layer**: Electricity rates, TOU settings
- **Electricity Supply Mix**: Each source with type, percentage, cost, carbon intensity
- **Dynamic Profiles**: Weather, workload, and electricity profiles

### 4. **Failures Sheet** (if applicable)
Active failures during simulation:
- Failure ID
- Type (Chiller, GPU Rack, Cooling Tower, PDU, UPS)
- Name
- Active status
- Start time
- Duration
- Capacity reduction
- Performance degradation

### 5. **Power Breakdown Sheet**
Component-level power analysis:
- IT Load (kW and % of total)
- Cooling System (kW and % of total)
- Distribution Losses (kW and % of total)
- Total Facility Power

**Perfect for**: Understanding where power is consumed

### 6. **Calculated Metrics Sheet**
Advanced derived metrics:
- **Efficiency Metrics**: PUE, infrastructure overhead %, component percentages
- **Power Density**: kW per GPU, kW per rack
- **Utilization**: GPU utilization, available capacity, cooling capacity used
- **Economics**: Cost per kWh, cost per GPU-hour, carbon intensity, carbon per GPU-hour
- **Cooling Efficiency**: System-level COP

**Perfect for**: Benchmarking, optimization analysis

## File Naming

Exported files are automatically named with:
```
DataCenter_Simulation_{ScenarioName}_{Timestamp}.xlsx
```

Example: `DataCenter_Simulation_Baseline_Operation_2026-01-11T01-42-17.xlsx`

## Use Cases

### 1. **Performance Analysis**
- Export multiple scenarios
- Compare PUE, costs, and carbon emissions
- Identify optimization opportunities

### 2. **Reporting**
- Present results to stakeholders
- Include in technical documentation
- Support business cases

### 3. **Further Analysis**
- Import into Python/R for advanced analysis
- Create custom visualizations
- Perform statistical analysis

### 4. **Archival**
- Keep records of simulation runs
- Track changes over time
- Document configuration decisions

### 5. **Compliance**
- Carbon reporting
- Energy efficiency documentation
- SLA tracking

## Data Accuracy

All exported data is:
- ✅ Directly from the simulation engine
- ✅ Unit-consistent (see CALCULATIONS.md)
- ✅ Validated for energy conservation
- ✅ Timestamped for traceability

## Tips

1. **Run Sufficient Steps**: Export after running at least 24 hours (one full day) to capture daily patterns
2. **Compare Scenarios**: Export baseline vs. optimized scenarios for side-by-side comparison
3. **Document Failures**: Failure injection scenarios include detailed failure information
4. **Time Series Analysis**: Use the Time Series sheet for trend analysis and forecasting
5. **Custom Charts**: Excel can create custom charts from the time series data

## Technical Details

- **Library**: Uses `xlsx` (SheetJS) library
- **Format**: .xlsx (Excel 2007+)
- **Compatibility**: Opens in Excel, Google Sheets, LibreOffice Calc
- **Size**: Typically < 1 MB for 100 time steps
- **Performance**: Instant export, no server processing required

## Limitations

- Export includes the last 100 data points maximum (memory management)
- File downloads to browser's default download location
- Requires JavaScript enabled in browser

## Future Enhancements

Potential additions for future versions:
- [ ] CSV export option
- [ ] PDF report generation
- [ ] Custom sheet selection
- [ ] Multi-scenario comparison export
- [ ] Automated charting in Excel
- [ ] Export templates

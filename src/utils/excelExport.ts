import * as XLSX from 'xlsx'
import { SimulationState } from '../types/simulation'

export function exportSimulationToExcel(state: SimulationState, scenarioName: string) {
  try {
    console.log('Starting Excel export...', { scenarioName, dataPoints: state.history.timestamps.length })

    if (!state.metrics) {
      throw new Error('No metrics available. Please run the simulation first.')
    }

    // Create a new workbook
    const wb = XLSX.utils.book_new()

  // 1. SUMMARY SHEET
  const summaryData = [
    ['AI Data Center Simulation Export'],
    [''],
    ['Scenario', scenarioName],
    ['Export Date', new Date().toLocaleString()],
    ['Simulation Start', state.start_time?.toLocaleString() || 'N/A'],
    ['Simulation End', state.current_time?.toLocaleString() || 'N/A'],
    ['Time Step', `${state.time_step_hours} hours`],
    ['Data Points', state.history.timestamps.length],
    [''],
    ['=== CURRENT METRICS ==='],
    [''],
    ['Power Metrics'],
    ['IT Load (kW)', state.metrics.it_power_kw],
    ['IT Load (MW)', state.metrics.it_power_kw / 1000],
    ['Cooling Power (kW)', state.metrics.cooling_power_kw],
    ['Distribution Losses (kW)', state.metrics.distribution_losses_kw],
    ['Total Facility Power (kW)', state.metrics.total_power_kw],
    ['Total Facility Power (MW)', state.metrics.total_power_kw / 1000],
    ['PUE', state.metrics.pue],
    [''],
    ['Thermal Metrics'],
    ['Average Zone Temperature (°C)', state.metrics.avg_zone_temp_c],
    ['Cooling Capacity Used (%)', state.metrics.cooling_capacity_used_pct],
    ['Ambient Temperature (°C)', state.weather.dry_bulb_temp_c],
    ['Wet Bulb Temperature (°C)', state.weather.wet_bulb_temp_c],
    [''],
    ['Compute Metrics'],
    ['Total GPUs', state.metrics.total_gpus],
    ['Available GPUs', state.metrics.available_gpus],
    ['Average GPU Utilization (%)', state.metrics.avg_gpu_utilization * 100],
    [''],
    ['Workload Metrics'],
    ['Jobs Queued', state.metrics.jobs_queued],
    ['Jobs Running', state.metrics.jobs_running],
    ['Jobs Completed', state.metrics.jobs_completed],
    ['Average Queue Time (hours)', state.metrics.avg_queue_time_hours],
    [''],
    ['Economics Metrics'],
    ['Hourly Cost ($/hr)', state.metrics.hourly_cost_usd],
    ['Hourly Carbon (kg CO₂/hr)', state.metrics.hourly_carbon_kg],
    ['Cumulative Cost ($)', state.metrics.cumulative_cost_usd],
    ['Cumulative Carbon (kg CO₂)', state.metrics.cumulative_carbon_kg],
    ['Cumulative Carbon (tonnes CO₂)', state.metrics.cumulative_carbon_kg / 1000],
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

  // 2. TIME SERIES DATA SHEET
  const timeSeriesData = [
    [
      'Timestamp',
      'Hour',
      'IT Power (kW)',
      'Cooling Power (kW)',
      'Total Power (kW)',
      'Distribution Losses (kW)',
      'PUE',
      'GPU Utilization (%)',
      'Zone Temperature (°C)',
      'Ambient Temperature (°C)',
      'Cost Rate ($/hr)',
      'Carbon Rate (kg/hr)',
    ]
  ]

  state.history.timestamps.forEach((timestamp, i) => {
    const distributionLoss =
      (state.history.total_power[i] || 0) -
      (state.history.it_power[i] || 0) -
      (state.history.cooling_power[i] || 0)

    timeSeriesData.push([
      timestamp.toLocaleString(),
      i * state.time_step_hours,
      state.history.it_power[i] || 0,
      state.history.cooling_power[i] || 0,
      state.history.total_power[i] || 0,
      distributionLoss,
      state.history.pue[i] || 0,
      state.history.gpu_utilization[i] || 0,
      state.history.temperature[i] || 0,
      state.history.ambient_temp[i] || 0,
      state.history.cost_rate[i] || 0,
      state.history.carbon_rate[i] || 0,
    ])
  })
  const wsTimeSeries = XLSX.utils.aoa_to_sheet(timeSeriesData)
  XLSX.utils.book_append_sheet(wb, wsTimeSeries, 'Time Series')

  // 3. CONFIGURATION SHEET
  const racks = Array.isArray(state.cluster?.racks) ? state.cluster.racks : []
  const spineSwitches = Array.isArray(state.cluster?.spine_switches) ? state.cluster.spine_switches : []
  const leafSwitches = Array.isArray(state.cluster?.leaf_switches) ? state.cluster.leaf_switches : []
  const paths = Array.isArray(state.power_system?.paths) ? state.power_system.paths : []

  const configData = [
    ['=== FACILITY CONFIGURATION ==='],
    [''],
    ['Facility Name', state.financial_model?.facility_name || 'N/A'],
    ['IT Capacity (MW)', state.financial_model?.it_capacity_mw || 'N/A'],
    [''],
    ['=== COMPUTE LAYER ==='],
    [''],
    ['Total Racks', racks.length],
    ['Total Nodes', racks.reduce((sum, r) => sum + (r.nodes?.length || 0), 0)],
    ['Total GPUs', state.metrics.total_gpus],
    ['GPU Type', racks[0]?.nodes?.[0]?.accelerators?.[0]?.type?.name || 'N/A'],
    ['GPU TDP (W)', racks[0]?.nodes?.[0]?.accelerators?.[0]?.type?.tdp_watts || 'N/A'],
    ['Spine Switches', spineSwitches.length],
    ['Leaf Switches', leafSwitches.length],
    [''],
    ['=== POWER LAYER ==='],
    [''],
    ['Power Paths', paths.length],
  ]

  // Add UPS info
  const totalUPS = paths.reduce((sum, p) => sum + (p.ups_units?.length || 0), 0)
  const totalUPSCapacity = paths.reduce(
    (sum, p) => sum + (p.ups_units?.reduce((s, u) => s + (u.capacity_kva || 0), 0) || 0), 0
  )
  configData.push(
    ['Total UPS Units', totalUPS],
    ['Total UPS Capacity (kVA)', totalUPSCapacity]
  )

  // Add Transformer info
  const totalXfmrs = paths.reduce((sum, p) => sum + (p.transformers?.length || 0), 0)
  configData.push(['Total Transformers', totalXfmrs])

  // Add PDU info
  const totalPDUs = paths.reduce((sum, p) => sum + (p.pdus?.length || 0), 0)
  configData.push(['Total PDUs', totalPDUs], [''])

  // Cooling info
  const chillers = Array.isArray(state.cooling_system.chillers) ? state.cooling_system.chillers : []
  const coolingTowers = Array.isArray(state.cooling_system.cooling_towers) ? state.cooling_system.cooling_towers : []
  const crahUnits = Array.isArray(state.cooling_system.crah_units) ? state.cooling_system.crah_units : []
  const zones = Array.isArray(state.cooling_system.zones) ? state.cooling_system.zones : []

  configData.push(
    ['=== THERMAL LAYER ==='],
    [''],
    ['Chillers', chillers.length],
    ['Total Chiller Capacity (kW)', chillers.reduce((s, c) => s + (c.capacity_kw || 0), 0)],
    ['Cooling Towers', coolingTowers.length],
    ['CRAH Units', crahUnits.length],
    ['Thermal Zones', zones.length],
    ['Economizer Enabled', state.cooling_system.economizer_enabled ? 'Yes' : 'No'],
    ['Economizer Setpoint (°C)', state.cooling_system.economizer_setpoint_c],
    ['']
  )

  // Economics info
  configData.push(
    ['=== ECONOMICS LAYER ==='],
    [''],
    ['Base Electricity Rate ($/kWh)', state.financial_model.electricity_rate.energy_rate_per_kwh],
    ['TOU Enabled', state.financial_model.electricity_rate.tou_enabled ? 'Yes' : 'No'],
  )

  if (state.financial_model.electricity_rate.tou_enabled) {
    configData.push(
      ['TOU Peak Multiplier', state.financial_model.electricity_rate.tou_peak_multiplier],
      ['TOU Off-Peak Multiplier', state.financial_model.electricity_rate.tou_offpeak_multiplier],
      ['TOU Peak Hours', state.financial_model.electricity_rate.tou_peak_hours.join(', ')]
    )
  }

  configData.push([''])

  // Electricity sources
  if (state.financial_model.electricity_sources && state.financial_model.electricity_sources.length > 0) {
    configData.push(
      ['=== ELECTRICITY SUPPLY MIX ==='],
      [''],
      ['Optimization Target', state.financial_model.optimization_target],
      ['']
    )

    state.financial_model.electricity_sources.forEach((source, idx) => {
      configData.push(
        [`Source ${idx + 1}: ${source.name}`],
        ['  Type', source.type],
        ['  Percentage (%)', source.percentage],
        ['  Cost ($/kWh)', source.cost_per_kwh],
        ['  Carbon Intensity (g/kWh)', source.carbon_intensity_g_per_kwh],
        ['  Renewable', source.is_renewable ? 'Yes' : 'No'],
        ['']
      )
    })
  }

  // Profiles
  configData.push(
    ['=== DYNAMIC PROFILES ==='],
    [''],
    ['Weather Profile', state.weather_profile || 'Static'],
    ['Workload Profile', state.workload_profile || 'Static'],
    ['Electricity Profile', state.electricity_profile || 'Static'],
  )

  const wsConfig = XLSX.utils.aoa_to_sheet(configData)
  XLSX.utils.book_append_sheet(wb, wsConfig, 'Configuration')

  // 4. ACTIVE FAILURES SHEET
  if (state.active_failures && state.active_failures.length > 0) {
    const failuresData = [
      ['=== ACTIVE FAILURES ==='],
      [''],
      ['ID', 'Type', 'Name', 'Active', 'Start Time', 'Duration (hrs)', 'Capacity Reduction (%)', 'Performance Degradation (%)']
    ]

    state.active_failures.forEach(failure => {
      failuresData.push([
        failure.id,
        failure.type,
        failure.name,
        failure.isActive ? 'Yes' : 'No',
        failure.startTime.toLocaleString(),
        failure.durationHours,
        failure.capacityReductionPct || 0,
        failure.performanceDegradationPct || 0
      ])
    })

    const wsFailures = XLSX.utils.aoa_to_sheet(failuresData)
    XLSX.utils.book_append_sheet(wb, wsFailures, 'Failures')
  }

  // 5. DETAILED POWER BREAKDOWN
  const powerBreakdownData = [
    ['=== POWER BREAKDOWN BY COMPONENT ==='],
    [''],
    ['Component', 'Power (kW)', 'Percentage of Total (%)']
  ]

  const totalPower = state.metrics.total_power_kw
  powerBreakdownData.push(
    ['IT Load', state.metrics.it_power_kw, (state.metrics.it_power_kw / totalPower * 100).toFixed(2)],
    ['Cooling System', state.metrics.cooling_power_kw, (state.metrics.cooling_power_kw / totalPower * 100).toFixed(2)],
    ['Distribution Losses', state.metrics.distribution_losses_kw, (state.metrics.distribution_losses_kw / totalPower * 100).toFixed(2)],
    [''],
    ['Total Facility Power', totalPower, '100.00']
  )

  const wsPowerBreakdown = XLSX.utils.aoa_to_sheet(powerBreakdownData)
  XLSX.utils.book_append_sheet(wb, wsPowerBreakdown, 'Power Breakdown')

  // 6. CALCULATED METRICS SHEET
  const calculatedData = [
    ['=== CALCULATED METRICS ==='],
    [''],
    ['Metric', 'Value', 'Unit'],
    [''],
    ['Efficiency Metrics'],
    ['PUE', state.metrics.pue.toFixed(3), ''],
    ['Infrastructure Overhead (%)', ((state.metrics.pue - 1) * 100).toFixed(2), '%'],
    ['IT Load as % of Total', (state.metrics.it_power_kw / totalPower * 100).toFixed(2), '%'],
    ['Cooling Load as % of Total', (state.metrics.cooling_power_kw / totalPower * 100).toFixed(2), '%'],
    [''],
    ['Power Density'],
    ['kW per GPU', (totalPower / state.metrics.total_gpus).toFixed(3), 'kW/GPU'],
    ['kW per Rack', (state.metrics.it_power_kw / state.cluster.racks.length).toFixed(2), 'kW/rack'],
    [''],
    ['Utilization'],
    ['Average GPU Utilization', (state.metrics.avg_gpu_utilization * 100).toFixed(2), '%'],
    ['Available GPU Capacity', ((state.metrics.available_gpus / state.metrics.total_gpus) * 100).toFixed(2), '%'],
    ['Cooling Capacity Used', state.metrics.cooling_capacity_used_pct.toFixed(2), '%'],
    [''],
    ['Economics'],
    ['Cost per kWh (avg)', (state.metrics.hourly_cost_usd / totalPower).toFixed(4), '$/kWh'],
    ['Cost per GPU-hour', (state.metrics.hourly_cost_usd / state.metrics.total_gpus).toFixed(4), '$/GPU-hr'],
    ['Carbon Intensity', (state.metrics.hourly_carbon_kg / (totalPower / 1000)).toFixed(2), 'kg CO₂/MWh'],
    ['Carbon per GPU-hour', (state.metrics.hourly_carbon_kg / state.metrics.total_gpus).toFixed(4), 'kg CO₂/GPU-hr'],
  ]

  // Calculate cooling efficiency (COP)
  if (state.metrics.cooling_power_kw > 0) {
    const cop = state.metrics.it_power_kw / state.metrics.cooling_power_kw
    calculatedData.push(
      [''],
      ['Cooling Efficiency'],
      ['System COP', cop.toFixed(2), '']
    )
  }

  const wsCalculated = XLSX.utils.aoa_to_sheet(calculatedData)
  XLSX.utils.book_append_sheet(wb, wsCalculated, 'Calculated Metrics')

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const filename = `DataCenter_Simulation_${scenarioName.replace(/\s+/g, '_')}_${timestamp}.xlsx`

    console.log('Writing Excel file:', filename)

  // Write file
    XLSX.writeFile(wb, filename)

    console.log('Excel export completed successfully!')
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    alert(`Error exporting to Excel: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

import { FinancialModel, ElectricityRate, CarbonAccounting, ElectricitySource } from '../../types/economics'

export function calculateHourlyElectricityCostWithMix(
  consumptionKwh: number,
  hour: number,
  sources: ElectricitySource[],
  rate: ElectricityRate
): number {
  // Calculate weighted average cost based on source mix
  let totalCost = 0

  sources.forEach(source => {
    const sourceConsumption = consumptionKwh * (source.percentage / 100)
    let sourceCost = source.cost_per_kwh

    // Apply TOU multipliers for grid power
    if (source.type === 'grid' && rate.tou_enabled) {
      if (rate.tou_peak_hours.includes(hour)) {
        sourceCost *= rate.tou_peak_multiplier
      } else {
        sourceCost *= rate.tou_offpeak_multiplier
      }
    }

    totalCost += sourceConsumption * sourceCost
  })

  return totalCost
}

// Legacy function for backward compatibility
export function calculateHourlyElectricityCost(
  consumptionKwh: number,
  hour: number,
  rate: ElectricityRate
): number {
  let effectiveRate = rate.energy_rate_per_kwh

  if (rate.tou_enabled) {
    if (rate.tou_peak_hours.includes(hour)) {
      effectiveRate *= rate.tou_peak_multiplier
    } else {
      effectiveRate *= rate.tou_offpeak_multiplier
    }
  }

  return consumptionKwh * effectiveRate
}

export function calculateCarbonEmissionsWithMix(
  consumptionMwh: number,
  sources: ElectricitySource[]
): number {
  // Calculate weighted average carbon intensity based on source mix
  let totalCarbon = 0

  sources.forEach(source => {
    const sourceConsumption = consumptionMwh * (source.percentage / 100)
    const sourceCarbon = (sourceConsumption * 1000 * source.carbon_intensity_g_per_kwh) / 1000
    totalCarbon += sourceCarbon
  })

  return totalCarbon
}

// Legacy function for backward compatibility
export function calculateCarbonEmissions(
  consumptionMwh: number,
  carbon: CarbonAccounting
): number {
  // Effective carbon = grid carbon × (1 - renewable%) + PPA carbon × renewable%
  const gridPortion = 1 - carbon.renewable_pct
  const renewablePortion = carbon.renewable_pct

  const effectiveIntensity =
    carbon.grid_intensity_g_per_kwh * gridPortion +
    carbon.ppa_carbon_intensity * renewablePortion

  // Convert to kg
  return (consumptionMwh * 1000 * effectiveIntensity) / 1000
}

export function calculateTotalCapex(financialModel: FinancialModel): number {
  return financialModel.capex_items.reduce((sum, item) => sum + item.amount_usd, 0)
}

export function calculateAnnualDepreciation(financialModel: FinancialModel): number {
  return financialModel.capex_items.reduce((sum, item) => {
    return sum + (item.amount_usd / item.useful_life_years)
  }, 0)
}

export function calculateAnnualElectricityCost(
  avgPowerKw: number,
  hoursPerYear: number,
  rate: ElectricityRate
): number {
  const annualKwh = avgPowerKw * hoursPerYear

  // Simplified: use average rate
  let avgRate = rate.energy_rate_per_kwh
  if (rate.tou_enabled) {
    // Rough average between peak and off-peak
    avgRate = rate.energy_rate_per_kwh *
      (rate.tou_peak_multiplier * 0.3 + rate.tou_offpeak_multiplier * 0.7)
  }

  return annualKwh * avgRate
}

export function calculateAnnualOpex(
  financialModel: FinancialModel,
  annualElectricityCost: number
): number {
  const totalCapex = calculateTotalCapex(financialModel)

  const staffCost = financialModel.staff_count * financialModel.staff_cost_per_fte
  const maintenanceCost = totalCapex * financialModel.maintenance_pct_of_capex

  return annualElectricityCost + staffCost + maintenanceCost
}

export function calculateTCO(
  financialModel: FinancialModel,
  years: number,
  avgPowerKw: number
): number {
  const totalCapex = calculateTotalCapex(financialModel)
  const annualElectricity = calculateAnnualElectricityCost(avgPowerKw, 8760, financialModel.electricity_rate)
  const annualOpex = calculateAnnualOpex(financialModel, annualElectricity)

  return totalCapex + (annualOpex * years)
}

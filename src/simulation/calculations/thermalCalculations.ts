import { CoolingSystem, Chiller, WeatherConditions } from '../../types/thermal'
import { interpolate } from '../../data/efficiencyCurves'

export function calculateChillerCOP(chiller: Chiller, ambientTempC: number): number {
  return interpolate(chiller.cop_curve, ambientTempC)
}

export function calculateChillerPower(
  chiller: Chiller,
  coolingLoadKw: number,
  ambientTempC: number
): number {
  const cop = calculateChillerCOP(chiller, ambientTempC)
  if (cop === 0) return 0

  // Power = Cooling Load / COP
  const chillerLoad = coolingLoadKw * chiller.current_load_pct
  return chillerLoad / cop
}

export function canUseFreeCooling(
  weather: WeatherConditions,
  setpointC: number
): boolean {
  // Free cooling available if wet bulb temp is significantly below setpoint
  return weather.wet_bulb_temp_c < (setpointC - 5)
}

export function calculateCoolingPower(
  coolingSystem: CoolingSystem,
  heatLoadKw: number,
  weather: WeatherConditions
): number {
  let totalCoolingPower = 0

  // Check for free cooling
  const freeCooling = coolingSystem.economizer_enabled &&
    canUseFreeCooling(weather, coolingSystem.economizer_setpoint_c)

  if (freeCooling) {
    // Only pump and fan power for free cooling (rough estimate: 2% of load)
    totalCoolingPower = heatLoadKw * 0.02
  } else {
    // Mechanical cooling
    coolingSystem.chillers.forEach(chiller => {
      if (chiller.status === 'running') {
        const chillerPower = calculateChillerPower(
          chiller,
          heatLoadKw / coolingSystem.chillers.filter(c => c.status === 'running').length,
          weather.dry_bulb_temp_c
        )
        totalCoolingPower += chillerPower
      }
    })

    // Add cooling tower power
    coolingSystem.cooling_towers.forEach(tower => {
      totalCoolingPower += tower.fan_power_kw + tower.pump_power_kw
    })

    // Add CRAH/CDU power
    coolingSystem.crah_units.forEach(crah => {
      totalCoolingPower += crah.fan_power_kw
    })
  }

  return totalCoolingPower
}

export function calculatePUE(
  itLoadKw: number,
  coolingPowerKw: number,
  distributionLossesKw: number
): number {
  if (itLoadKw === 0) return 1.0
  const totalFacilityPower = itLoadKw + coolingPowerKw + distributionLossesKw
  return totalFacilityPower / itLoadKw
}

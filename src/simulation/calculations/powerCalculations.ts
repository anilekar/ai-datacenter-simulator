import { PowerSystem, UPS, Transformer } from '../../types/power'
import { interpolate } from '../../data/efficiencyCurves'

export function calculateUPSEfficiency(ups: UPS): number {
  const loadPct = ups.current_load_kw / ups.capacity_kva
  return interpolate(ups.efficiency_curve, loadPct)
}

export function calculateUPSLoss(ups: UPS): number {
  const efficiency = calculateUPSEfficiency(ups)
  if (efficiency === 0) return 0
  return ups.current_load_kw * (1 / efficiency - 1)
}

export function calculateTransformerLoss(transformer: Transformer): number {
  const loadPct = transformer.current_load_kw / transformer.capacity_kva
  // Loss = no_load_loss + (load%)² × full_load_loss
  return transformer.no_load_loss_kw + Math.pow(loadPct, 2) * transformer.full_load_loss_kw
}

export function calculateTransformerEfficiency(transformer: Transformer): number {
  if (transformer.current_load_kw === 0) return 0
  const loss = calculateTransformerLoss(transformer)
  return transformer.current_load_kw / (transformer.current_load_kw + loss)
}

export function calculateTotalDistributionLosses(powerSystem: PowerSystem): number {
  let totalLosses = 0

  powerSystem.paths.forEach(path => {
    // UPS losses
    path.ups_units.forEach(ups => {
      totalLosses += calculateUPSLoss(ups)
    })

    // Transformer losses
    path.transformers.forEach(transformer => {
      totalLosses += calculateTransformerLoss(transformer)
    })

    // PDU losses (simple efficiency model)
    path.pdus.forEach(pdu => {
      const loss = pdu.current_load_kw * (1 - pdu.efficiency)
      totalLosses += loss
    })
  })

  return totalLosses
}

export function calculateDistributionPUE(itLoadKw: number, distributionLossesKw: number): number {
  if (itLoadKw === 0) return 1.0
  return (itLoadKw + distributionLossesKw) / itLoadKw
}

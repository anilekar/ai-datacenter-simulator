// UPS efficiency curve (double-conversion)
export const UPS_EFFICIENCY_CURVE: [number, number][] = [
  [0.10, 0.85],
  [0.20, 0.90],
  [0.30, 0.93],
  [0.40, 0.945],
  [0.50, 0.955],
  [0.60, 0.96],
  [0.70, 0.962],
  [0.80, 0.96],
  [0.90, 0.955],
  [1.00, 0.95]
]

// Chiller COP curve (water-cooled)
export const CHILLER_COP_CURVE: [number, number][] = [
  [15, 7.0],
  [20, 6.5],
  [25, 6.0],
  [30, 5.5],
  [35, 5.0],
  [40, 4.5],
  [45, 4.0]
]

// Helper function to interpolate efficiency curves
export function interpolate(curve: [number, number][], value: number): number {
  if (value <= curve[0][0]) return curve[0][1]
  if (value >= curve[curve.length - 1][0]) return curve[curve.length - 1][1]

  for (let i = 0; i < curve.length - 1; i++) {
    const [x1, y1] = curve[i]
    const [x2, y2] = curve[i + 1]

    if (value >= x1 && value <= x2) {
      const t = (value - x1) / (x2 - x1)
      return y1 + t * (y2 - y1)
    }
  }

  return curve[curve.length - 1][1]
}

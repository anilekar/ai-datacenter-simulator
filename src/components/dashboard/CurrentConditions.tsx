import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { SimulationState } from '../../types/simulation'

interface CurrentConditionsProps {
  state: SimulationState
}

export function CurrentConditions({ state }: CurrentConditionsProps) {
  const currentHour = state.current_time.getHours()
  const avgUtilization = state.cluster.racks.reduce((sum, rack) => {
    const rackUtil = rack.nodes.reduce((nodeSum, node) => {
      const nodeUtil = node.accelerators.reduce((gpuSum, gpu) =>
        gpuSum + gpu.current_utilization, 0) / node.accelerators.length
      return nodeSum + nodeUtil
    }, 0) / rack.nodes.length
    return sum + rackUtil
  }, 0) / state.cluster.racks.length

  const freeCoolingActive = state.weather.dry_bulb_temp_c < 15

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Conditions (Hour {currentHour})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">🌡️ Temperature</span>
          <span className="font-mono font-medium">{state.weather.dry_bulb_temp_c.toFixed(1)}°C</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">💧 Wet Bulb</span>
          <span className="font-mono font-medium">{state.weather.wet_bulb_temp_c.toFixed(1)}°C</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">💻 GPU Utilization</span>
          <span className="font-mono font-medium">{(avgUtilization * 100).toFixed(1)}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">⚡ Electricity Price</span>
          <span className="font-mono font-medium">${state.electricity_price.toFixed(4)}/kWh</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">❄️ Free Cooling</span>
          <span className={`font-medium ${freeCoolingActive ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
            {freeCoolingActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Electricity Mix Summary */}
        {state.financial_model.electricity_sources && state.financial_model.electricity_sources.length > 0 && (
          <div className="pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Electricity Supply Mix:</div>
            <div className="space-y-1">
              {state.financial_model.electricity_sources.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    {source.is_renewable && <span className="text-green-600 dark:text-green-400">🌱</span>}
                    {source.name}
                  </span>
                  <span className="font-mono">{source.percentage.toFixed(0)}%</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-border text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Optimization:</span>
                <span className="font-medium capitalize">{state.financial_model.optimization_target}</span>
              </div>
            </div>
          </div>
        )}

        {state.weather_profile && (
          <div className="pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground">Active Profiles:</div>
            {state.weather_profile && (
              <div className="text-xs mt-1">🌡️ {state.weather_profile.replace(/_/g, ' ')}</div>
            )}
            {state.workload_profile && (
              <div className="text-xs mt-1">💼 {state.workload_profile.replace(/_/g, ' ')}</div>
            )}
            {state.electricity_profile && (
              <div className="text-xs mt-1">⚡ {state.electricity_profile.replace(/_/g, ' ')}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

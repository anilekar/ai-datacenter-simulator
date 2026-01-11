import { useSimulationStore } from '../../store/simulationStore'
import { MetricCard } from '../ui/MetricCard'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import PowerChart from './PowerChart'
import { CurrentConditions } from './CurrentConditions'
import { SankeyDiagram } from '../visualizations/SankeyDiagram'
import { MultiVariablePlot } from '../visualizations/MultiVariablePlot'
import { Zap, Thermometer, Cpu, DollarSign, Cloud, TrendingUp, Download } from 'lucide-react'
import { useEffect } from 'react'
import { exportSimulationToExcel } from '../../utils/excelExport'

export default function Dashboard() {
  const { state, loadScenario, currentScenario } = useSimulationStore()

  // Load default scenario on mount
  useEffect(() => {
    if (!state) {
      loadScenario('baseline')
    }
  }, [state, loadScenario])

  const handleExport = () => {
    console.log('Export button clicked', { state: !!state, currentScenario: currentScenario?.name })
    if (state) {
      const scenarioName = currentScenario?.name || 'Custom'
      console.log('Calling exportSimulationToExcel with:', scenarioName)
      exportSimulationToExcel(state, scenarioName)
    } else {
      console.error('No state available for export')
    }
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to AI Data Center Simulator</h2>
          <p className="text-muted-foreground">Select a scenario from the configuration panel to begin</p>
        </div>
      </div>
    )
  }

  const { metrics } = state

  return (
    <div className="space-y-6">
      {/* Export Button */}
      {state.history.timestamps.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        </div>
      )}

      {/* Key Metrics and Current Conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <h2 className="text-xl font-bold mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="PUE"
              value={metrics.pue}
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <MetricCard
              title="IT Load"
              value={(metrics.it_power_kw / 1000).toFixed(2)}
              unit="MW"
              icon={<Zap className="w-5 h-5" />}
            />
            <MetricCard
              title="GPU Utilization"
              value={(metrics.avg_gpu_utilization * 100).toFixed(1)}
              unit="%"
              icon={<Cpu className="w-5 h-5" />}
            />
            <MetricCard
              title="Cost Rate"
              value={metrics.hourly_cost_usd.toFixed(0)}
              unit="$/hr"
              icon={<DollarSign className="w-5 h-5" />}
            />
          </div>
        </div>
        <div>
          <CurrentConditions state={state} />
        </div>
      </div>

      {/* Power & Thermal Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Power Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>IT Load</span>
                  <span className="font-medium">{metrics.it_power_kw.toFixed(1)} kW</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(metrics.it_power_kw / metrics.total_power_kw) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cooling</span>
                  <span className="font-medium">{metrics.cooling_power_kw.toFixed(1)} kW</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full"
                    style={{ width: `${(metrics.cooling_power_kw / metrics.total_power_kw) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Distribution Losses</span>
                  <span className="font-medium">{metrics.distribution_losses_kw.toFixed(1)} kW</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${(metrics.distribution_losses_kw / metrics.total_power_kw) * 100}%` }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between font-semibold">
                  <span>Total Facility Power</span>
                  <span>{metrics.total_power_kw.toFixed(1)} kW</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thermal Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Avg Zone Temp</span>
              </div>
              <span className="text-2xl font-bold">{metrics.avg_zone_temp_c.toFixed(1)}°C</span>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Cooling Capacity Used</span>
                <span className="font-medium">{metrics.cooling_capacity_used_pct.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metrics.cooling_capacity_used_pct > 80
                      ? 'bg-red-500'
                      : metrics.cooling_capacity_used_pct > 60
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(metrics.cooling_capacity_used_pct, 100)}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-border text-sm text-muted-foreground">
              Ambient: {state.weather.dry_bulb_temp_c}°C / Wet Bulb: {state.weather.wet_bulb_temp_c}°C
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workload & Economics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compute Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total GPUs</div>
                <div className="text-2xl font-bold">{metrics.total_gpus.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Available</div>
                <div className="text-2xl font-bold">{metrics.available_gpus.toLocaleString()}</div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>GPU Utilization</span>
                <span className="font-medium">{(metrics.avg_gpu_utilization * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${metrics.avg_gpu_utilization * 100}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center p-2 bg-muted rounded">
                <div className="text-muted-foreground">Queued</div>
                <div className="font-medium">{metrics.jobs_queued}</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="text-muted-foreground">Running</div>
                <div className="font-medium">{metrics.jobs_running}</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="text-muted-foreground">Done</div>
                <div className="font-medium">{metrics.jobs_completed}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Economics & Sustainability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4 inline" /> Cost Rate
                </div>
                <div className="text-2xl font-bold">${metrics.hourly_cost_usd.toFixed(0)}/hr</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  <Cloud className="w-4 h-4 inline" /> Carbon Rate
                </div>
                <div className="text-2xl font-bold">{metrics.hourly_carbon_kg.toFixed(1)} kg/hr</div>
              </div>
            </div>
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cumulative Cost</span>
                <span className="font-medium">${metrics.cumulative_cost_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cumulative Carbon</span>
                <span className="font-medium">{(metrics.cumulative_carbon_kg / 1000).toFixed(2)} tonnes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Power Flow Sankey Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Power Flow Diagram</CardTitle>
        </CardHeader>
        <CardContent>
          <SankeyDiagram metrics={metrics} />
        </CardContent>
      </Card>

      {/* Time Series Chart */}
      {state.history.timestamps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Power & PUE Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <PowerChart history={state.history} />
          </CardContent>
        </Card>
      )}

      {/* Multi-Variable Analysis */}
      {state.history.timestamps.length > 0 && (
        <MultiVariablePlot state={state} />
      )}
    </div>
  )
}

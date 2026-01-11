import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { ElectricitySource, ElectricitySourceType, OptimizationTarget } from '../../types/economics'
import { Zap, Plus, Trash2, Target } from 'lucide-react'

interface ElectricityMixConfigProps {
  sources: ElectricitySource[]
  optimizationTarget: OptimizationTarget
  onSourcesChange: (sources: ElectricitySource[]) => void
  onOptimizationChange: (target: OptimizationTarget) => void
}

const SOURCE_TYPE_LABELS: Record<ElectricitySourceType, string> = {
  [ElectricitySourceType.GRID]: 'Grid Power',
  [ElectricitySourceType.RENEWABLE_PPA]: 'Renewable PPA',
  [ElectricitySourceType.ONSITE_SOLAR]: 'On-site Solar',
  [ElectricitySourceType.ONSITE_WIND]: 'On-site Wind',
  [ElectricitySourceType.BATTERY_STORAGE]: 'Battery Storage'
}

export function ElectricityMixConfig({
  sources,
  optimizationTarget,
  onSourcesChange,
  onOptimizationChange
}: ElectricityMixConfigProps) {
  const [editingSources, setEditingSources] = useState<ElectricitySource[]>(sources)

  const handleAddSource = () => {
    const newSource: ElectricitySource = {
      type: ElectricitySourceType.GRID,
      name: 'New Source',
      percentage: 0,
      cost_per_kwh: 0.05,
      carbon_intensity_g_per_kwh: 400,
      is_renewable: false
    }
    const updated = [...editingSources, newSource]
    setEditingSources(updated)
    onSourcesChange(updated)
  }

  const handleRemoveSource = (index: number) => {
    const updated = editingSources.filter((_, i) => i !== index)
    setEditingSources(updated)
    onSourcesChange(updated)
  }

  const handleUpdateSource = (index: number, field: keyof ElectricitySource, value: any) => {
    const updated = editingSources.map((source, i) => {
      if (i === index) {
        const updatedSource = { ...source, [field]: value }

        // Auto-update renewable flag based on type
        if (field === 'type') {
          updatedSource.is_renewable = [
            ElectricitySourceType.RENEWABLE_PPA,
            ElectricitySourceType.ONSITE_SOLAR,
            ElectricitySourceType.ONSITE_WIND
          ].includes(value)

          // Set default carbon intensity for renewables
          if (updatedSource.is_renewable) {
            updatedSource.carbon_intensity_g_per_kwh = 0
          }
        }

        return updatedSource
      }
      return source
    })
    setEditingSources(updated)
    onSourcesChange(updated)
  }

  const totalPercentage = editingSources.reduce((sum, s) => sum + s.percentage, 0)
  const isValid = Math.abs(totalPercentage - 100) < 0.01

  const avgCost = editingSources.reduce((sum, s) => sum + (s.cost_per_kwh * s.percentage / 100), 0)
  const avgCarbon = editingSources.reduce((sum, s) => sum + (s.carbon_intensity_g_per_kwh * s.percentage / 100), 0)
  const renewablePercentage = editingSources
    .filter(s => s.is_renewable)
    .reduce((sum, s) => sum + s.percentage, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Electricity Supply Mix
        </CardTitle>
        <CardDescription>
          Configure your electricity sources and optimize for cost or carbon
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Optimization Target */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Optimization Target
          </label>
          <select
            value={optimizationTarget}
            onChange={(e) => onOptimizationChange(e.target.value as OptimizationTarget)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value={OptimizationTarget.COST}>Minimize Cost</option>
            <option value={OptimizationTarget.CARBON}>Minimize Carbon</option>
            <option value={OptimizationTarget.BALANCED}>Balanced</option>
          </select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-muted rounded-md text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Avg Cost</div>
            <div className="font-semibold">${avgCost.toFixed(4)}/kWh</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Avg Carbon</div>
            <div className="font-semibold">{avgCarbon.toFixed(0)} g/kWh</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Renewable</div>
            <div className="font-semibold text-green-600 dark:text-green-400">
              {renewablePercentage.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Sources List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Electricity Sources</label>
            <button
              onClick={handleAddSource}
              className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Source
            </button>
          </div>

          {editingSources.map((source, index) => (
            <div key={index} className="p-3 border border-border rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <select
                  value={source.type}
                  onChange={(e) => handleUpdateSource(index, 'type', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background"
                >
                  {Object.entries(SOURCE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleRemoveSource(index)}
                  className="ml-2 text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Percentage</label>
                  <input
                    type="number"
                    value={source.percentage}
                    onChange={(e) => handleUpdateSource(index, 'percentage', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="1"
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Cost ($/kWh)</label>
                  <input
                    type="number"
                    value={source.cost_per_kwh}
                    onChange={(e) => handleUpdateSource(index, 'cost_per_kwh', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.001"
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Carbon (g/kWh)</label>
                  <input
                    type="number"
                    value={source.carbon_intensity_g_per_kwh}
                    onChange={(e) => handleUpdateSource(index, 'carbon_intensity_g_per_kwh', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="1"
                    disabled={source.is_renewable}
                    className="w-full px-2 py-1 text-sm border border-border rounded bg-background disabled:opacity-50"
                  />
                </div>
              </div>

              {source.is_renewable && (
                <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Renewable Energy Source
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Validation Warning */}
        {!isValid && (
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
            <strong>Warning:</strong> Total percentage is {totalPercentage.toFixed(1)}%. Must equal 100%.
          </div>
        )}

        {isValid && editingSources.length > 0 && (
          <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs text-green-900 dark:text-green-100">
            ✓ Configuration valid
          </div>
        )}
      </CardContent>
    </Card>
  )
}

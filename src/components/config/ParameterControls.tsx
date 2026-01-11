import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { LOCATIONS } from '../../data/locations'
import { GPU_TYPES } from '../../data/gpuTypes'
import { WEATHER_PROFILES } from '../../data/weatherProfiles'
import { WORKLOAD_PATTERNS } from '../../data/workloadProfiles'
import { ELECTRICITY_PROFILES } from '../../data/electricityProfiles'
import { ScenarioParams } from '../../simulation/scenarioBuilder'
import { ElectricitySource, ElectricitySourceType, OptimizationTarget } from '../../types/economics'
import { Zap, Plus, Trash2, Target } from 'lucide-react'

interface ParameterControlsProps {
  onApply: (params: ScenarioParams & {
    electricitySources?: ElectricitySource[]
    optimizationTarget?: OptimizationTarget
  }) => void
}

export function ParameterControls({ onApply }: ParameterControlsProps) {
  const [gpuCount, setGpuCount] = useState(8000)
  const [gpuType, setGpuType] = useState<keyof typeof GPU_TYPES>('H100_SXM')
  const [location, setLocation] = useState('iowa')
  const [targetUtilization, setTargetUtilization] = useState(0.85)
  const [ambientTempC, setAmbientTempC] = useState(25)
  const [wetBulbTempC, setWetBulbTempC] = useState(18)
  const [weatherProfile, setWeatherProfile] = useState<string | undefined>('typical_summer')
  const [workloadProfile, setWorkloadProfile] = useState<string | undefined>('business_hours')
  const [electricityProfile, setElectricityProfile] = useState<string | undefined>('tou_standard')
  const [economizerEnabled, setEconomizerEnabled] = useState(true)

  // Electricity mix state
  const [electricitySources, setElectricitySources] = useState<ElectricitySource[]>([
    {
      type: ElectricitySourceType.GRID,
      name: 'Grid Power',
      percentage: 80,
      cost_per_kwh: 0.055,
      carbon_intensity_g_per_kwh: 350,
      is_renewable: false
    },
    {
      type: ElectricitySourceType.RENEWABLE_PPA,
      name: 'Wind PPA',
      percentage: 20,
      cost_per_kwh: 0.03,
      carbon_intensity_g_per_kwh: 0,
      is_renewable: true
    }
  ])
  const [optimizationTarget, setOptimizationTarget] = useState<OptimizationTarget>(OptimizationTarget.BALANCED)

  const SOURCE_TYPE_LABELS: Record<ElectricitySourceType, string> = {
    [ElectricitySourceType.GRID]: 'Grid Power',
    [ElectricitySourceType.RENEWABLE_PPA]: 'Renewable PPA',
    [ElectricitySourceType.ONSITE_SOLAR]: 'On-site Solar',
    [ElectricitySourceType.ONSITE_WIND]: 'On-site Wind',
    [ElectricitySourceType.BATTERY_STORAGE]: 'Battery Storage'
  }

  const handleAddSource = () => {
    const newSource: ElectricitySource = {
      type: ElectricitySourceType.GRID,
      name: 'New Source',
      percentage: 0,
      cost_per_kwh: 0.05,
      carbon_intensity_g_per_kwh: 400,
      is_renewable: false
    }
    setElectricitySources([...electricitySources, newSource])
  }

  const handleRemoveSource = (index: number) => {
    setElectricitySources(electricitySources.filter((_, i) => i !== index))
  }

  const handleUpdateSource = (index: number, field: keyof ElectricitySource, value: any) => {
    const updated = electricitySources.map((source, i) => {
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
    setElectricitySources(updated)
  }

  const totalPercentage = electricitySources.reduce((sum, s) => sum + s.percentage, 0)
  const isValid = Math.abs(totalPercentage - 100) < 0.01
  const avgCost = electricitySources.reduce((sum, s) => sum + (s.cost_per_kwh * s.percentage / 100), 0)
  const avgCarbon = electricitySources.reduce((sum, s) => sum + (s.carbon_intensity_g_per_kwh * s.percentage / 100), 0)
  const renewablePercentage = electricitySources.filter(s => s.is_renewable).reduce((sum, s) => sum + s.percentage, 0)

  const handleApply = () => {
    const params = {
      location,
      gpuType,
      gpuCount,
      targetUtilization,
      ambientTempC,
      wetBulbTempC,
      economizerEnabled,
      weatherProfile: weatherProfile === 'none' ? undefined : weatherProfile,
      workloadProfile: workloadProfile === 'none' ? undefined : workloadProfile,
      electricityProfile: electricityProfile === 'none' ? undefined : electricityProfile,
      electricitySources,
      optimizationTarget
    }
    onApply(params)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Configuration</CardTitle>
        <CardDescription>Adjust parameters to create your own scenario</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-2">📍 Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          >
            {Object.entries(LOCATIONS).map(([key, loc]) => (
              <option key={key} value={key}>
                {loc.name}
              </option>
            ))}
          </select>
          <div className="mt-1 text-xs text-muted-foreground">
            Elec: ${LOCATIONS[location as keyof typeof LOCATIONS].electricity_rate}/kWh •
            Free cooling: {LOCATIONS[location as keyof typeof LOCATIONS].free_cooling_hours} hrs/yr
          </div>
        </div>

        {/* GPU Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">🖥️ GPU Type</label>
            <select
              value={gpuType}
              onChange={(e) => setGpuType(e.target.value as keyof typeof GPU_TYPES)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              {Object.entries(GPU_TYPES).map(([key, gpu]) => (
                <option key={key} value={key}>
                  {gpu.name} ({gpu.tdp_watts}W TDP)
                </option>
              ))}
            </select>
            <div className="mt-1 text-xs text-muted-foreground">
              Memory: {GPU_TYPES[gpuType].memory_gb}GB •
              FP16: {GPU_TYPES[gpuType].fp16_tflops} TFLOPS
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              GPU Count: <span className="font-mono">{gpuCount.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min="1000"
              max="20000"
              step="1000"
              value={gpuCount}
              onChange={(e) => setGpuCount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1,000</span>
              <span>20,000</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Target Utilization: <span className="font-mono">{(targetUtilization * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={targetUtilization}
              onChange={(e) => setTargetUtilization(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Weather Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">🌡️ Weather Pattern</label>
            <select
              value={weatherProfile || 'none'}
              onChange={(e) => setWeatherProfile(e.target.value === 'none' ? undefined : e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="none">Static (use values below)</option>
              {Object.entries(WEATHER_PROFILES).map(([key, profile]) => (
                <option key={key} value={key}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>

          {!weatherProfile && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ambient Temperature: <span className="font-mono">{ambientTempC}°C</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="1"
                  value={ambientTempC}
                  onChange={(e) => setAmbientTempC(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5°C</span>
                  <span>45°C</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Wet Bulb Temperature: <span className="font-mono">{wetBulbTempC}°C</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="1"
                  value={wetBulbTempC}
                  onChange={(e) => setWetBulbTempC(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0°C</span>
                  <span>35°C</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Workload Pattern */}
        <div>
          <label className="block text-sm font-medium mb-2">💼 Workload Pattern</label>
          <select
            value={workloadProfile || 'none'}
            onChange={(e) => setWorkloadProfile(e.target.value === 'none' ? undefined : e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="none">Constant (use target above)</option>
            {Object.entries(WORKLOAD_PATTERNS).map(([key, pattern]) => (
              <option key={key} value={key}>
                {pattern.name}
              </option>
            ))}
          </select>
        </div>

        {/* Electricity Pricing */}
        <div>
          <label className="block text-sm font-medium mb-2">⚡ Electricity Pricing</label>
          <select
            value={electricityProfile || 'none'}
            onChange={(e) => setElectricityProfile(e.target.value === 'none' ? undefined : e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="none">Flat Rate</option>
            {Object.entries(ELECTRICITY_PROFILES).map(([key, profile]) => (
              <option key={key} value={key}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cooling Settings */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={economizerEnabled}
              onChange={(e) => setEconomizerEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">❄️ Enable Free Cooling (Economizer)</span>
          </label>
          <div className="mt-1 text-xs text-muted-foreground ml-6">
            Uses outside air for cooling when temperature permits
          </div>
        </div>

        {/* Electricity Supply Mix */}
        <div className="border-t border-border pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <h3 className="text-sm font-semibold">Electricity Supply Mix</h3>
          </div>

          {/* Optimization Target */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Optimization Target
            </label>
            <select
              value={optimizationTarget}
              onChange={(e) => setOptimizationTarget(e.target.value as OptimizationTarget)}
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
                type="button"
                onClick={handleAddSource}
                className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Source
              </button>
            </div>

            {electricitySources.map((source, index) => (
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
                    type="button"
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
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={!isValid}
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ▶️ Apply Custom Configuration
        </button>
      </CardContent>
    </Card>
  )
}

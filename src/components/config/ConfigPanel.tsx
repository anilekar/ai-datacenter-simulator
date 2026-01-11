import { useSimulationStore } from '../../store/simulationStore'
import { SCENARIOS } from '../../data/scenarios'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { ParameterControls } from './ParameterControls'
import { FailureInjection } from './FailureInjection'
import { ScenarioParams } from '../../simulation/scenarioBuilder'
import { FailureEvent } from '../../types/failures'
import { ElectricitySource, OptimizationTarget } from '../../types/economics'
import { useState } from 'react'

export default function ConfigPanel() {
  const { currentScenario, isRunning, loadScenario, loadCustomScenario, injectFailure, start, stop, reset, step, runSteps, state } = useSimulationStore()
  const [showCustom, setShowCustom] = useState(false)
  const [showFailures, setShowFailures] = useState(false)

  const handleCustomApply = (params: ScenarioParams & {
    electricitySources?: ElectricitySource[]
    optimizationTarget?: OptimizationTarget
  }) => {
    loadCustomScenario(params)

    // Apply electricity sources and optimization if provided
    if (params.electricitySources && state) {
      state.financial_model.electricity_sources = params.electricitySources
    }
    if (params.optimizationTarget && state) {
      state.financial_model.optimization_target = params.optimizationTarget
    }

    setShowCustom(false)
  }

  const handleFailureInject = (failure: FailureEvent) => {
    injectFailure(failure)
  }

  return (
    <div className="space-y-6">
      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Scenario</label>
            <select
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              value={currentScenario?.id || ''}
              onChange={(e) => loadScenario(e.target.value)}
            >
              <option value="">Choose a scenario...</option>
              {SCENARIOS.map(scenario => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </div>

          {currentScenario && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              {currentScenario.description}
            </div>
          )}

          <button
            onClick={() => setShowCustom(!showCustom)}
            className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted text-sm font-medium"
          >
            {showCustom ? '▲ Hide' : '▼ Show'} Custom Configuration
          </button>
        </CardContent>
      </Card>

      {/* Custom Configuration */}
      {showCustom && (
        <ParameterControls onApply={handleCustomApply} />
      )}

      {/* Simulation Controls */}
      {state && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={isRunning ? stop : start}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run
                  </>
                )}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={step}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted"
              >
                <SkipForward className="w-4 h-4" />
                Step +1h
              </button>
              <button
                onClick={() => runSteps(24)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted"
              >
                Step +24h
              </button>
            </div>

            <div className="text-xs text-muted-foreground">
              Current Time: {state.current_time.toLocaleString()}
            </div>

            <button
              onClick={() => setShowFailures(!showFailures)}
              className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted text-sm font-medium"
            >
              {showFailures ? '▲ Hide' : '▼ Show'} Failure Injection
            </button>
          </CardContent>
        </Card>
      )}

      {/* Failure Injection */}
      {state && showFailures && (
        <FailureInjection
          onInjectFailure={handleFailureInject}
          activeFailures={state.active_failures}
        />
      )}

      {/* Configuration Summary */}
      {state && currentScenario && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{state.financial_model.facility_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GPU Type:</span>
              <span className="font-medium">{currentScenario.params.gpuType.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GPU Count:</span>
              <span className="font-medium">{currentScenario.params.gpuCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target Util:</span>
              <span className="font-medium">{(currentScenario.params.targetUtilization * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ambient Temp:</span>
              <span className="font-medium">{currentScenario.params.ambientTempC}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Economizer:</span>
              <span className="font-medium">{currentScenario.params.economizerEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

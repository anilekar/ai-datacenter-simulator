import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { FAILURE_SCENARIOS, FailureEvent } from '../../types/failures'
import { AlertTriangle } from 'lucide-react'

interface FailureInjectionProps {
  onInjectFailure: (failure: FailureEvent) => void
  activeFailures: FailureEvent[]
}

export function FailureInjection({ onInjectFailure, activeFailures }: FailureInjectionProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>('single_chiller')

  const handleInject = () => {
    const scenario = FAILURE_SCENARIOS[selectedScenario]
    if (!scenario) return

    // Inject ALL failures in the scenario simultaneously
    scenario.failures.forEach(failureTemplate => {
      const failure = { ...failureTemplate }
      failure.startTime = new Date()
      failure.isActive = true
      // Generate unique ID for each injection instance
      failure.id = `${failureTemplate.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      onInjectFailure(failure)
    })
  }

  const activeCount = activeFailures.filter(f => f.isActive).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Failure Injection
        </CardTitle>
        <CardDescription>Simulate infrastructure failures and observe system response</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Failures */}
        {activeCount > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="font-medium text-red-900 dark:text-red-100 mb-2">
              Active Failures: {activeCount}
            </div>
            {activeFailures.filter(f => f.isActive).map(failure => (
              <div key={failure.id} className="text-sm text-red-800 dark:text-red-200">
                • {failure.name} ({failure.durationHours}h remaining)
              </div>
            ))}
          </div>
        )}

        {/* Scenario Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Failure Scenario</label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          >
            {Object.entries(FAILURE_SCENARIOS).map(([key, scenario]) => (
              <option key={key} value={key}>
                {scenario.name}
              </option>
            ))}
          </select>
          {selectedScenario && (
            <div className="mt-2 text-xs text-muted-foreground">
              {FAILURE_SCENARIOS[selectedScenario].description}
            </div>
          )}
        </div>

        {/* Scenario Details */}
        {selectedScenario && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Scenario Impact:</div>
            {FAILURE_SCENARIOS[selectedScenario].failures.map((failure, idx) => (
              <div key={idx} className="text-sm bg-muted p-2 rounded">
                <div className="font-medium">{failure.name}</div>
                <div className="text-xs text-muted-foreground">
                  Duration: {failure.durationHours} hours •
                  {failure.capacityReductionPct ? ` Capacity: -${failure.capacityReductionPct}%` : ''}
                  {failure.performanceDegradationPct ? ` Performance: -${failure.performanceDegradationPct}%` : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inject Button */}
        <button
          onClick={handleInject}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Inject Failure Now
        </button>

        {/* Warning */}
        <div className="text-xs text-muted-foreground p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <strong>Note:</strong> Failures will affect system performance, capacity, and metrics.
          Monitor PUE, temperature, and throttling indicators.
        </div>
      </CardContent>
    </Card>
  )
}

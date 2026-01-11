import { create } from 'zustand'
import { SimulationState } from '../types/simulation'
import { buildScenario, ScenarioParams } from '../simulation/scenarioBuilder'
import { simulateTimeStep } from '../simulation/engine'
import { SCENARIOS, ScenarioDefinition } from '../data/scenarios'
import { FailureEvent } from '../types/failures'

interface SimulationStore {
  // Current state
  state: SimulationState | null
  currentScenario: ScenarioDefinition | null
  isRunning: boolean

  // Actions
  loadScenario: (scenarioId: string) => void
  loadCustomScenario: (params: ScenarioParams) => void
  injectFailure: (failure: FailureEvent) => void
  step: () => void
  runSteps: (count: number) => void
  start: () => void
  stop: () => void
  reset: () => void
}

let intervalId: ReturnType<typeof setInterval> | null = null

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  state: null,
  currentScenario: null,
  isRunning: false,

  loadScenario: (scenarioId: string) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId)
    if (!scenario) return

    const state = buildScenario(scenario.params)
    set({ state, currentScenario: scenario, isRunning: false })

    // Stop any running simulation
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  },

  loadCustomScenario: (params: ScenarioParams) => {
    const state = buildScenario(params)
    set({
      state,
      currentScenario: {
        id: 'custom',
        name: 'Custom Scenario',
        description: 'User-defined configuration',
        params
      },
      isRunning: false
    })

    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  },

  injectFailure: (failure: FailureEvent) => {
    const { state } = get()
    if (!state) return

    // Add the failure to the active failures list
    const updatedState = {
      ...state,
      active_failures: [...state.active_failures, failure]
    }

    set({ state: updatedState })
  },

  step: () => {
    const { state } = get()
    if (!state) return

    const newState = simulateTimeStep(state)
    set({ state: newState })
  },

  runSteps: (count: number) => {
    const { state } = get()
    if (!state) return

    let currentState = state
    for (let i = 0; i < count; i++) {
      currentState = simulateTimeStep(currentState)
    }
    set({ state: currentState })
  },

  start: () => {
    set({ isRunning: true })

    intervalId = setInterval(() => {
      const { state, isRunning } = get()
      if (!state || !isRunning) {
        if (intervalId) clearInterval(intervalId)
        return
      }

      const newState = simulateTimeStep(state)
      set({ state: newState })
    }, 1000) // 1 second per time step
  },

  stop: () => {
    set({ isRunning: false })
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  },

  reset: () => {
    const { currentScenario } = get()
    if (!currentScenario) return

    const state = buildScenario(currentScenario.params)
    set({ state, isRunning: false })

    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }
}))

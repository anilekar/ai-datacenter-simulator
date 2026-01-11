import { useState } from 'react'
import Dashboard from './components/dashboard/Dashboard'
import ConfigPanel from './components/config/ConfigPanel'
import { HelpModal } from './components/ui/HelpModal'
import { useSimulationStore } from './store/simulationStore'
import { HelpCircle } from 'lucide-react'

function App() {
  const [showConfig, setShowConfig] = useState(true)
  const [showHelp, setShowHelp] = useState(false)
  const { currentScenario } = useSimulationStore()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🏢</div>
            <h1 className="text-2xl font-bold">AI Data Center Simulator</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Scenario: <span className="font-medium text-foreground">{currentScenario?.name || 'None'}</span>
            </div>
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 hover:bg-muted rounded-md"
              title="Help & Documentation"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {showConfig ? 'Hide' : 'Show'} Config
            </button>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Main Content */}
      <div className="flex">
        {/* Configuration Panel */}
        {showConfig && (
          <aside className="w-96 border-r border-border bg-card p-6 overflow-y-auto" style={{ height: 'calc(100vh - 73px)' }}>
            <ConfigPanel />
          </aside>
        )}

        {/* Dashboard */}
        <main className="flex-1 p-6 overflow-y-auto" style={{ height: 'calc(100vh - 73px)' }}>
          <Dashboard />
        </main>
      </div>
    </div>
  )
}

export default App

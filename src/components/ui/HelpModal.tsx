import { X } from 'lucide-react'
import { useEffect } from 'react'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  // Handle Escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">AI Data Center Simulator - Help Guide</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md"
            aria-label="Close help"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Quick Start */}
          <section>
            <h3 className="text-xl font-bold mb-3 text-primary">🚀 Quick Start</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><strong>Select a scenario</strong> from the dropdown in the Configuration Panel (left sidebar)</li>
              <li><strong>Click "Run"</strong> to start automatic simulation (updates every second)</li>
              <li><strong>Watch the metrics</strong> update in real-time on the dashboard</li>
              <li><strong>Use "Step +1h" or "Step +24h"</strong> to advance time manually</li>
              <li><strong>Click "Reset"</strong> to return to the scenario's initial state</li>
            </ol>
          </section>

          {/* Understanding the Dashboard */}
          <section>
            <h3 className="text-xl font-bold mb-3 text-primary">📊 Understanding the Dashboard</h3>

            <div className="space-y-3 text-sm">
              <div className="bg-muted p-3 rounded">
                <h4 className="font-bold mb-1">PUE (Power Usage Effectiveness)</h4>
                <p>Total Facility Power ÷ IT Load. Lower is better!</p>
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>1.00 = Perfect (theoretical minimum)</li>
                  <li>1.20-1.30 = Excellent (best-in-class data centers)</li>
                  <li>1.30-1.50 = Good</li>
                  <li>1.50+ = Needs improvement</li>
                </ul>
              </div>

              <div className="bg-muted p-3 rounded">
                <h4 className="font-bold mb-1">IT Load</h4>
                <p>Total power consumed by GPUs, CPUs, and compute equipment (measured in MW or kW)</p>
              </div>

              <div className="bg-muted p-3 rounded">
                <h4 className="font-bold mb-1">GPU Utilization</h4>
                <p>Percentage of GPU capacity being used. Higher = more work being done, but also more power and heat.</p>
              </div>

              <div className="bg-muted p-3 rounded">
                <h4 className="font-bold mb-1">Cost Rate</h4>
                <p>Electricity cost per hour at current power consumption. Varies with time-of-use pricing.</p>
              </div>

              <div className="bg-muted p-3 rounded">
                <h4 className="font-bold mb-1">Power Distribution</h4>
                <p>Shows how power is split between:</p>
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li><strong>IT Load</strong> - Actual compute work</li>
                  <li><strong>Cooling</strong> - Chillers, pumps, fans to remove heat</li>
                  <li><strong>Losses</strong> - UPS, transformers, PDUs (efficiency losses)</li>
                </ul>
              </div>

              <div className="bg-muted p-3 rounded">
                <h4 className="font-bold mb-1">Cooling Capacity Used</h4>
                <p>Percentage of total cooling system capacity being utilized.</p>
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>&lt;60% = Comfortable headroom</li>
                  <li>60-80% = Normal operation</li>
                  <li>&gt;80% = High utilization, limited headroom</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Scenarios Explained */}
          <section>
            <h3 className="text-xl font-bold mb-3 text-primary">🎯 Scenarios Explained</h3>
            <div className="space-y-2 text-sm">
              <div className="border-l-4 border-blue-500 pl-3">
                <h4 className="font-bold">Baseline Operation</h4>
                <p className="text-xs">Static scenario with constant conditions. Good for understanding baseline metrics.</p>
              </div>

              <div className="border-l-4 border-orange-500 pl-3">
                <h4 className="font-bold">🌡️ Dynamic Summer Day (RECOMMENDED)</h4>
                <p className="text-xs">Temperature varies throughout the day (16-36°C), workload follows business hours, electricity pricing has peak/off-peak rates. <strong>Run this for 24 hours to see the full cycle!</strong></p>
              </div>

              <div className="border-l-4 border-red-500 pl-3">
                <h4 className="font-bold">🔥 Extreme Heat + Peak Pricing</h4>
                <p className="text-xs">Worst-case scenario with sustained high temps (44°C), spiky workload, and extreme electricity pricing (3x during peak).</p>
              </div>

              <div className="border-l-4 border-cyan-500 pl-3">
                <h4 className="font-bold">❄️ Cool Day - Free Cooling</h4>
                <p className="text-xs">Best-case scenario with low temperatures enabling economizer (free cooling). Watch PUE drop to ~1.05!</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-3">
                <h4 className="font-bold">🤖 Inference-Heavy Workload</h4>
                <p className="text-xs">Lower base utilization (60%) with peaks during user activity. Different pattern than training workloads.</p>
              </div>
            </div>
          </section>

          {/* How to Change Parameters */}
          <section>
            <h3 className="text-xl font-bold mb-3 text-primary">⚙️ How to Customize</h3>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded text-sm">
              <h4 className="font-bold mb-2">✅ Interactive Parameter Controls (NOW AVAILABLE!):</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Show Custom Configuration" in the Scenario Configuration panel</li>
                <li>Adjust any parameters using sliders and dropdowns:</li>
              </ol>
              <ul className="list-disc list-inside text-xs mt-2 ml-4">
                <li><strong>GPU Count:</strong> 1,000 - 20,000 (slider)</li>
                <li><strong>GPU Type:</strong> H100 SXM, H200 SXM, B200, MI300X</li>
                <li><strong>Location:</strong> Iowa, Texas, Oregon, Virginia, Sweden</li>
                <li><strong>Target Utilization:</strong> 50% - 100%</li>
                <li><strong>Weather Pattern:</strong> Static or dynamic (Typical Summer, Hot Day, Cool Day)</li>
                <li><strong>Workload Pattern:</strong> Constant, Business Hours, Batch Training, Inference Heavy</li>
                <li><strong>Electricity Pricing:</strong> Flat Rate, Standard TOU, Extreme TOU, Renewable Heavy</li>
                <li><strong>Economizer:</strong> Enable/disable free cooling</li>
              </ul>
              <p className="text-xs mt-2"><strong>3.</strong> Click "Apply Custom Configuration" to create your custom scenario</p>

              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                <p className="font-bold">📍 Quick Method:</p>
                <p className="text-xs mt-1">Choose from 7 pre-built scenarios in the dropdown for instant exploration!</p>
              </div>
            </div>
          </section>

          {/* New Features */}
          <section>
            <h3 className="text-xl font-bold mb-3 text-primary">✨ Advanced Features</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-muted p-3 rounded">
                <h4 className="font-bold mb-1">🔥 Failure Injection</h4>
                <p className="text-xs">Test system resilience by injecting infrastructure failures:</p>
                <ul className="list-disc list-inside text-xs mt-1 ml-2">
                  <li>Click "Show Failure Injection" in Simulation Controls</li>
                  <li>Select a failure scenario (chiller failure, UPS trip, cascading thermal event, etc.)</li>
                  <li>Click "Inject Failure Now" and watch system response</li>
                  <li>Observe PUE increases, thermal throttling, and automatic recovery</li>
                </ul>
              </div>

              <div className="bg-muted p-3 rounded">
                <h4 className="font-bold mb-1">📊 Power Flow Visualization</h4>
                <p className="text-xs">Sankey diagram shows power flow from grid through all components:</p>
                <ul className="list-disc list-inside text-xs mt-1 ml-2">
                  <li>Visual representation of Grid → Transformer → UPS → PDU → IT/Cooling</li>
                  <li>Flow width proportional to power (kW)</li>
                  <li>Hover over flows to see exact values</li>
                  <li>Updates in real-time as simulation runs</li>
                </ul>
              </div>

              <div className="bg-muted p-3 rounded">
                <h4 className="font-bold mb-1">🎯 Current Conditions Panel</h4>
                <p className="text-xs">Real-time monitoring of key conditions:</p>
                <ul className="list-disc list-inside text-xs mt-1 ml-2">
                  <li>Current temperature (dry bulb & wet bulb)</li>
                  <li>Live GPU utilization</li>
                  <li>Current electricity price</li>
                  <li>Free cooling status (Active when temp &lt; 15°C)</li>
                  <li>Active dynamic profiles</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Key Concepts */}
          <section>
            <h3 className="text-xl font-bold mb-3 text-primary">🧠 Key Concepts</h3>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-bold">Free Cooling (Economizer)</h4>
                <p className="text-xs">When outside air is cold enough, the facility can cool without running chillers—just using pumps and fans. This dramatically reduces cooling power and improves PUE.</p>
              </div>

              <div>
                <h4 className="font-bold">Time-of-Use (TOU) Pricing</h4>
                <p className="text-xs">Electricity costs more during peak demand hours (typically 2pm-8pm). Smart data centers can shift workloads to off-peak hours to save money.</p>
              </div>

              <div>
                <h4 className="font-bold">Cross-Layer Effects</h4>
                <p className="text-xs">Everything is connected:</p>
                <ul className="list-disc list-inside text-xs ml-4 mt-1">
                  <li>Higher GPU utilization → More power → More heat → More cooling needed</li>
                  <li>Higher temperature → Lower chiller efficiency → Higher cooling power → Higher PUE</li>
                  <li>More cooling power → Higher total facility power → Higher costs</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold">Thermal Throttling</h4>
                <p className="text-xs">If temperatures get too high, GPUs automatically reduce performance to prevent damage. This is a protective measure but reduces computing capacity.</p>
              </div>
            </div>
          </section>

          {/* What to Look For */}
          <section>
            <h3 className="text-xl font-bold mb-3 text-primary">👀 What to Look For</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-muted p-3 rounded">
                <h4 className="font-bold mb-1">Dynamic Summer Day Scenario</h4>
                <ul className="list-disc list-inside text-xs space-y-1">
                  <li><strong>Morning (6am-9am):</strong> Temperature rises, workload ramps up, costs start increasing</li>
                  <li><strong>Midday (12pm-3pm):</strong> Peak temperature (35-36°C), full GPU utilization, highest electricity prices</li>
                  <li><strong>Afternoon (3pm-6pm):</strong> PUE peaks at ~1.28-1.30 due to reduced chiller efficiency</li>
                  <li><strong>Evening (6pm-12am):</strong> Everything cools down, utilization drops, costs decrease</li>
                  <li><strong>Night (12am-6am):</strong> Low utilization (30%), cool temps, cheap electricity</li>
                </ul>
              </div>

              <div className="bg-muted p-3 rounded">
                <h4 className="font-bold mb-1">Cool Day Scenario</h4>
                <ul className="list-disc list-inside text-xs space-y-1">
                  <li>Watch cooling power drop to just ~2% of IT load</li>
                  <li>PUE stays low all day (~1.05-1.10)</li>
                  <li>This shows the huge advantage of cold climate locations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Simulation Controls */}
          <section>
            <h3 className="text-xl font-bold mb-3 text-primary">🎮 Simulation Controls</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="border border-border p-3 rounded">
                <h4 className="font-bold mb-1">▶️ Run</h4>
                <p className="text-xs">Starts automatic simulation. Updates every 1 second (1 simulated hour per real second).</p>
              </div>
              <div className="border border-border p-3 rounded">
                <h4 className="font-bold mb-1">⏸️ Pause</h4>
                <p className="text-xs">Stops the automatic simulation. Resume with Run button.</p>
              </div>
              <div className="border border-border p-3 rounded">
                <h4 className="font-bold mb-1">Step +1h</h4>
                <p className="text-xs">Advances simulation by 1 hour. Useful for examining changes step-by-step.</p>
              </div>
              <div className="border border-border p-3 rounded">
                <h4 className="font-bold mb-1">Step +24h</h4>
                <p className="text-xs">Fast-forward by 1 day. Great for seeing a full daily cycle quickly.</p>
              </div>
              <div className="border border-border p-3 rounded">
                <h4 className="font-bold mb-1">🔄 Reset</h4>
                <p className="text-xs">Returns to the scenario's starting point. All metrics reset to initial values.</p>
              </div>
            </div>
          </section>

          {/* Tips & Tricks */}
          <section>
            <h3 className="text-xl font-bold mb-3 text-primary">💡 Tips & Tricks</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Compare scenarios:</strong> Run one scenario for 24 hours, note the metrics, then switch to another and compare</li>
              <li><strong>Watch the chart:</strong> The time-series chart at the bottom shows historical trends—patterns become clear after running for a while</li>
              <li><strong>Look for crossover points:</strong> Notice when PUE starts climbing (usually when temperature peaks)</li>
              <li><strong>Check cumulative costs:</strong> Even small PUE differences add up over time</li>
              <li><strong>Observe free cooling:</strong> In cool scenarios, cooling power is minimal—this is economizer in action</li>
            </ul>
          </section>

          {/* Technical Details */}
          <section>
            <h3 className="text-xl font-bold mb-3 text-primary">🔬 Technical Details</h3>
            <div className="bg-muted p-4 rounded text-xs space-y-2">
              <div>
                <strong>GPU Power Model:</strong> P = P_idle + (P_tdp - P_idle) × U^1.3
                <p className="text-muted-foreground">Power consumption is non-linear with utilization</p>
              </div>
              <div>
                <strong>PUE Calculation:</strong> PUE = (IT + Cooling + Losses) / IT
                <p className="text-muted-foreground">Industry standard efficiency metric</p>
              </div>
              <div>
                <strong>Chiller COP:</strong> Coefficient of Performance decreases as ambient temperature increases
                <p className="text-muted-foreground">Hot days require more power to remove the same amount of heat</p>
              </div>
              <div>
                <strong>Time Step:</strong> 1 hour per simulation step
                <p className="text-muted-foreground">All metrics updated each hour based on conditions and profiles</p>
              </div>
            </div>
          </section>

          {/* Need More Help */}
          <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded">
            <h3 className="text-lg font-bold mb-2">📚 Additional Resources</h3>
            <p className="text-sm mb-2">For more detailed information, check these files in the project directory:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li><strong>README.md</strong> - Full project documentation</li>
              <li><strong>QUICK_START.md</strong> - Getting started guide</li>
              <li><strong>DYNAMIC_FEATURES.md</strong> - Explanation of time-varying profiles</li>
              <li><strong>ROADMAP.md</strong> - Future features and development plan</li>
              <li><strong>AI_DataCenter_Simulator_Technical_Spec.md</strong> - Complete technical specification</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Got it, let's simulate!
          </button>
        </div>
      </div>
    </div>
  )
}

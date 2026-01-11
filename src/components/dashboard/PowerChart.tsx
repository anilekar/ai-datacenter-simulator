import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PowerChartProps {
  history: {
    timestamps: Date[]
    it_power: number[]
    cooling_power: number[]
    total_power: number[]
    pue: number[]
  }
}

export default function PowerChart({ history }: PowerChartProps) {
  const data = history.timestamps.map((timestamp, index) => ({
    time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    'IT Power (kW)': history.it_power[index],
    'Cooling Power (kW)': history.cooling_power[index],
    'Total Power (kW)': history.total_power[index],
    PUE: history.pue[index]
  }))

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data yet. Run the simulation to see charts.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="time" stroke="#888" />
        <YAxis yAxisId="left" stroke="#888" />
        <YAxis yAxisId="right" orientation="right" stroke="#888" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="linear"
          dataKey="IT Power (kW)"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="left"
          type="linear"
          dataKey="Cooling Power (kW)"
          stroke="#06b6d4"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="right"
          type="linear"
          dataKey="PUE"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

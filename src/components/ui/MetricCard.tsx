import { Card, CardContent } from './Card'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
}

export function MetricCard({ title, value, unit, change, trend, icon }: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUp className="w-4 h-4 text-green-500" />
    if (trend === 'down') return <ArrowDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString(undefined, { maximumFractionDigits: 2 })
    }
    return val
  }

  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold">{formatValue(value)}</p>
          {unit && <p className="text-sm text-muted-foreground">{unit}</p>}
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-sm">
            {getTrendIcon()}
            <span className="text-muted-foreground">
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

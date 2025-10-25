interface BarChartProps {
    label: string
    value: number
    max: number
    color: string
  }
  
  export function BarChart({ label, value, max, color }: BarChartProps) {
    const percentage = (value / max) * 100
  
    return (
      <div className="flex items-center gap-4">
        <div className="w-24 text-sm text-gray-400">{label}</div>
        <div className="flex-1">
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${color}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <div className="w-12 text-sm text-white text-right">{value}</div>
      </div>
    )
  }
  
  
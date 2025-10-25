import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Metric {
  name: string
  value: number
  change: number
}

interface DetailedMetricsProps {
  metrics: Metric[]
}

export function DetailedMetrics({ metrics }: DetailedMetricsProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">
          Detailed Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-4 px-4 py-2">
            <div className="text-sm font-medium text-gray-400">METRIC</div>
            <div className="text-sm font-medium text-gray-400">VALUE</div>
            <div className="text-sm font-medium text-gray-400">CHANGE</div>
          </div>
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="grid grid-cols-3 gap-4 px-4 py-3 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <div className="text-sm font-medium text-white">{metric.name}</div>
              <div className="text-sm text-white">{metric.value}</div>
              <div
                className={`text-sm ${
                  metric.change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {metric.change >= 0 ? "+" : ""}
                {metric.change}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


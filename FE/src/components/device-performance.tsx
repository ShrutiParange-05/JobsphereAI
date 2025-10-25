'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DevicePerformanceProps {
  primaryDevice: string
  percentage: number
}

export function DevicePerformance({ primaryDevice, percentage }: DevicePerformanceProps) {
  const radius = 85
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">
          Device Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <div className="relative w-[200px] h-[200px]">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="stroke-gray-800"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="stroke-purple-500"
              strokeWidth="12"
              fill="none"
              strokeDasharray={strokeDasharray}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-white">{primaryDevice}</span>
            <span className="text-sm text-gray-400">Primary Device</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


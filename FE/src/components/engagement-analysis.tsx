"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface TimeSeriesData {
  value: number
  date: string
}

interface EngagementMetric {
  label: string
  value: number
}

interface EngagementAnalysisProps {
  timeSeriesData: TimeSeriesData[]
  currentRate: string
  metrics: EngagementMetric[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-blue-900/80 backdrop-blur-sm p-3 rounded-lg border border-blue-500 shadow-xl">
        <p className="font-semibold text-blue-100">{`Date: ${label}`}</p>
        <p className="text-blue-300">{`Engagement: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

const metricColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']; // Blue, Emerald, Amber, Red

export function EngagementAnalysis({ timeSeriesData, currentRate, metrics }: EngagementAnalysisProps) {
  const [timeframe, setTimeframe] = useState('Day');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex flex-col space-y-1.5">
            <CardTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Engagement Rate Over Time
            </CardTitle>
            <p className="text-sm bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full w-fit">
              Current Rate: <span className="font-bold">{currentRate}</span>
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            {['Day', 'Week', 'Month'].map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(period)}
                className={
                  timeframe === period
                    ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }
              >
                {period}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timeSeriesData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8' }}
                />
                <YAxis 
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Engagement Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics} layout="vertical">
                <XAxis 
                  type="number"
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8' }}
                />
                <YAxis 
                  type="category"
                  dataKey="label"
                  stroke="#64748B"
                  tick={{ fill: '#94A3B8' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  className="hover:opacity-90 transition-opacity"
                  fill={metricColors[0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 flex flex-col items-center justify-center border border-slate-700 hover:border-blue-400 transition-colors"
              >
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  {metric.value}%
                </div>
                <div className="text-sm mt-1 text-slate-400">{metric.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EngagementAnalysis;
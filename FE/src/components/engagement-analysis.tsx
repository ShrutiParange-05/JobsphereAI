"use client"
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, useInView } from "framer-motion";
import { TrendingUp, Activity } from "lucide-react";

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-md p-3 rounded-xl border border-blue-500/30 shadow-2xl">
        <p className="font-bold text-white mb-1">{label}</p>
        <p className="text-blue-400 text-sm font-semibold">{`Engagement: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

const metricColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];

export function EngagementAnalysis({ timeSeriesData, currentRate, metrics }: EngagementAnalysisProps) {
  const [timeframe, setTimeframe] = useState('Week');
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <Card className="lg:col-span-2 bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 shadow-2xl rounded-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                <Activity className="w-5 h-5 text-blue-500" />
                Learning Engagement Rate
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <TrendingUp className="w-3 h-3" />
                  Current Rate: {currentRate}
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-1 bg-gray-800/50 rounded-xl border border-gray-700/30 w-fit">
              {['Day', 'Week', 'Month'].map((period) => (
                <Button
                  key={period}
                  variant="ghost"
                  size="sm"
                  onClick={() => setTimeframe(period)}
                  className={`rounded-lg h-8 px-4 text-xs font-bold uppercase transition-all duration-300 ${
                    timeframe === period
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timeSeriesData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorEngagement)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 shadow-2xl rounded-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white tracking-tight">
            Performance Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-2">
          {/* Custom animated bar rows */}
          <div className="space-y-5">
            {metrics.map((metric, idx) => {
              const isCorrect = metric.label.toLowerCase().includes('correct') && !metric.label.toLowerCase().includes('incorrect');
              const color = isCorrect ? 'from-emerald-500 to-emerald-400' : 'from-red-500 to-red-400';
              const glowColor = isCorrect ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)';
              const textColor = isCorrect ? 'text-emerald-400' : 'text-red-400';
              const borderColor = isCorrect ? 'border-emerald-500/20' : 'border-red-500/20';
              const bgColor = isCorrect ? 'bg-emerald-500/5' : 'bg-red-500/5';
              return (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-sm font-semibold text-gray-300">{metric.label}</span>
                    <span className={`text-lg font-black ${textColor}`} style={{ textShadow: `0 0 12px ${glowColor}` }}>
                      {metric.value}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-800/70 rounded-full overflow-hidden border border-gray-700/40">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${metric.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: idx * 0.15 }}
                      className={`h-full rounded-full bg-gradient-to-r ${color} relative`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary tiles */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {metrics.map((metric, idx) => {
              const isCorrect = metric.label.toLowerCase().includes('correct') && !metric.label.toLowerCase().includes('incorrect');
              return (
                <motion.div
                  key={metric.label}
                  whileHover={{ scale: 1.04, y: -2 }}
                  className={`rounded-2xl p-4 flex flex-col items-center justify-center text-center border ${
                    isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]'
                      : 'bg-red-500/10 border-red-500/30 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]'
                  } transition-all duration-300`}
                >
                  <div className={`text-2xl font-black mb-1 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}
                    style={{ textShadow: isCorrect ? '0 0 16px rgba(16,185,129,0.5)' : '0 0 16px rgba(239,68,68,0.5)' }}
                  >
                    {metric.value}%
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {metric.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default EngagementAnalysis;
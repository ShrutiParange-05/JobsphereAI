"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface SkillDistributionProps {
  scoreThresholds: {
    label: string;
    percentage: number;
    color: string;
  }[];
  percentile: number;
}

function AnimatedCounter({ value, duration = 1500 }: { value: number, duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(easing * value));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [value, isInView, duration]);

  return <span ref={ref} className="tabular-nums font-bold">{count}</span>;
}

export function Demographics({ scoreThresholds, percentile }: SkillDistributionProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Card className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 shadow-2xl overflow-hidden relative group rounded-2xl h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <CardContent className="p-8 relative z-10">
          <h3 className="text-xl font-bold text-white mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Cohort Analysis
          </h3>
          
          <div className="space-y-10">
            {/* Percentile */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Your Percentile</p>
                <div className="flex gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" /> Top bracket</span>
                </div>
              </div>
              
              <div className="flex gap-1.5 h-3 items-center">
                <div className="flex-1 h-3 bg-gray-800/50 rounded-full overflow-hidden relative border border-gray-700/30 flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${percentile}%` } : { width: 0 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    className="h-full bg-cyan-500 relative z-10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                  </motion.div>
                </div>
              </div>
              
              <div className="flex justify-between px-1">
                <span className="text-sm text-gray-400">Top <AnimatedCounter value={100 - percentile} />% of Candidates</span>
                <span className="text-sm text-cyan-400"><AnimatedCounter value={percentile} />th Percentile</span>
              </div>
            </div>

            {/* Score Distribution */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Score Distribution</p>
              <div className="space-y-4">
                {scoreThresholds.map((threshold, i) => (
                  <div key={threshold.label} className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-sm font-medium text-gray-300">{threshold.label}</span>
                      <span className={`text-sm font-bold ${threshold.color.replace('bg-', 'text-')}`}><AnimatedCounter value={threshold.percentage} />%</span>
                    </div>
                    <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/30">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${threshold.percentage}%` } : { width: 0 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.1 }}
                        className={`h-full ${threshold.color} bg-opacity-80`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

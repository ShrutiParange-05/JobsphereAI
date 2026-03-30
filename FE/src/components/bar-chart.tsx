"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from "framer-motion";

interface BarChartProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

export function BarChart({ label, value, max, color }: BarChartProps) {
  const percentage = (value / max) * 100;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 1500;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        
        setDisplayValue(Math.floor(easeProgress * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="flex items-center gap-4 group">
      <div className="w-32 text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors uppercase tracking-tight">
        {label}
      </div>
      <div className="flex-1 relative">
        <div className="h-4 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/30">
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className={`h-full ${color} relative`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
          </motion.div>
        </div>
      </div>
      <div className="w-16 text-sm font-bold text-white text-right tabular-nums">
        {displayValue}
        <span className="text-gray-500 text-[10px] ml-1">/ {max}</span>
      </div>
    </div>
  );
}
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  className?: string;
}

function AnimatedNumber({ value }: { value: string | number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let target = 0;
    
    if (typeof value === "number") {
      target = value;
    } else if (typeof value === "string") {
      const match = value.match(/^([^\d]*)(\d+)(.*)$/);
      if (match) {
        target = parseInt(match[2], 10);
      } else {
        return; // Non-numeric string
      }
    }

    if (isNaN(target)) return;

    const duration = 2000;
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value]);

  if (typeof value === "string" && !value.match(/\d+/)) {
    return <>{value}</>;
  }

  let suffix = "";
  let prefix = "";
  if (typeof value === "string") {
    const match = value.match(/^([^\d]*)(\d+)(.*)$/);
    if (match) {
      prefix = match[1];
      suffix = match[3];
    }
  }

  return (
    <>
      {prefix}
      {count}
      {suffix}
    </>
  );
}

export function MetricCard({
  title,
  value,
  change,
  className = "",
}: MetricCardProps) {
  const isPositive = change > 0;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className={`bg-gray-900/40 backdrop-blur-xl border-gray-800/60 shadow-xl overflow-hidden relative group ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors uppercase tracking-wider">{title}</p>
            <div
              className={`flex items-center text-sm font-semibold px-2.5 py-1 rounded-full ${
                isPositive ? "text-green-400 bg-green-400/10 shadow-[0_0_10px_rgba(74,222,128,0.2)]" : "text-red-400 bg-red-400/10 shadow-[0_0_10px_rgba(248,113,113,0.2)]"
              }`}
            >
              {isPositive ? (
                <ArrowUpIcon className="w-3.5 h-3.5 mr-1" />
              ) : (
                <ArrowDownIcon className="w-3.5 h-3.5 mr-1" />
              )}
              <AnimatedNumber value={Math.abs(change)} />%
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-4 tracking-tight drop-shadow-md group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">
            <AnimatedNumber value={value} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

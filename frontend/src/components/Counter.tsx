"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";

export default function Counter({ value, duration = 2 }: { value: string | number, duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.5 });
  const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
  
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (inView && !isNaN(numValue)) {
      animate(count, numValue, { duration, ease: "easeOut" });
    } else {
      count.set(0);
    }
  }, [inView, numValue, count, duration]);

  if (isNaN(numValue)) return <span>{value}</span>;

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

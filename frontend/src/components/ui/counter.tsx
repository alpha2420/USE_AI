"use client";

import { useState, useEffect } from "react";
import { useInView } from "framer-motion";
import { useRef } from "react";

export function Counter({ target, duration = 1500, suffix = "" }: { target: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = target;
    const totalDuration = duration;
    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / totalDuration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      
      setCount(Math.floor(easedProgress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

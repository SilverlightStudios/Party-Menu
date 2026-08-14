"use client";

import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback } from "react";

import { cn } from "@/lib/utils";
import {
  type AnimatedIconHandle,
  useAnimatedIcon,
} from "./useAnimatedIcon";

export type HourglassIconHandle = AnimatedIconHandle;

interface HourglassIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

const HourglassIcon = forwardRef<HourglassIconHandle, HourglassIconProps>(
  ({ className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const startAnimation = useCallback(() => {
      void controls.start("animate");
    }, [controls]);
    const stopAnimation = useCallback(() => {
      void controls.start("normal");
    }, [controls]);
    const iconRef = useAnimatedIcon({
      durationMs: 1000,
      ref,
      start: startAnimation,
      stop: stopAnimation,
    });

    return (
      <span ref={iconRef} className={cn(className)} {...props}>
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.g
            animate={controls}
            style={{
              transformOrigin: "12px 12px",
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              mass: 1,
            }}
            variants={{
              normal: {
                rotate: 0,
              },
              animate: {
                rotate: 180,
              },
            }}
          >
            <path d="M5 22h14" />
            <path d="M5 2h14" />
            <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
            <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
          </motion.g>
        </svg>
      </span>
    );
  }
);

HourglassIcon.displayName = "HourglassIcon";

export { HourglassIcon };

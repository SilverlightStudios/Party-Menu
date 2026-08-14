"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback } from "react";

import { cn } from "@/lib/utils";
import {
  type AnimatedIconHandle,
  useAnimatedIcon,
} from "./useAnimatedIcon";

export type CircleCheckIconHandle = AnimatedIconHandle;

interface CircleCheckIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

const PATH_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: {
      duration: 0.3,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
};

const CircleCheckIcon = forwardRef<CircleCheckIconHandle, CircleCheckIconProps>(
  ({ className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const startAnimation = useCallback(() => {
      void controls.start("animate");
    }, [controls]);
    const stopAnimation = useCallback(() => {
      void controls.start("normal");
    }, [controls]);
    const iconRef = useAnimatedIcon({
      durationMs: 450,
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
          <circle cx="12" cy="12" r="10" />
          <motion.path
            animate={controls}
            d="m9 12 2 2 4-4"
            initial="normal"
            variants={PATH_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

CircleCheckIcon.displayName = "CircleCheckIcon";

export { CircleCheckIcon };

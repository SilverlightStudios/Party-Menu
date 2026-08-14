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

export type CoffeeIconHandle = AnimatedIconHandle;

interface CoffeeIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

const PATH_VARIANTS: Variants = {
  normal: {
    y: 0,
    opacity: 1,
  },
  animate: (custom: number) => ({
    y: -3,
    opacity: [0, 1, 0],
    transition: {
      repeat: Number.POSITIVE_INFINITY,
      duration: 1.5,
      ease: "easeInOut",
      delay: 0.2 * custom,
    },
  }),
};

const CoffeeIcon = forwardRef<CoffeeIconHandle, CoffeeIconProps>(
  ({ className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const startAnimation = useCallback(() => {
      void controls.start("animate");
    }, [controls]);
    const stopAnimation = useCallback(() => {
      void controls.start("normal");
    }, [controls]);
    const iconRef = useAnimatedIcon({
      durationMs: 1600,
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
          style={{ overflow: "visible" }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            animate={controls}
            custom={0.2}
            d="M10 2v2"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={0.4}
            d="M14 2v2"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            custom={0}
            d="M6 2v2"
            variants={PATH_VARIANTS}
          />
          <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
        </svg>
      </span>
    );
  }
);

CoffeeIcon.displayName = "CoffeeIcon";

export { CoffeeIcon };

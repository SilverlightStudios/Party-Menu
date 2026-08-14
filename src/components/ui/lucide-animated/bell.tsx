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

export type BellIconHandle = AnimatedIconHandle;

interface BellIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

const SVG_VARIANTS: Variants = {
  normal: { rotate: 0 },
  animate: {
    rotate: [0, -10, 10, -10, 0],
    transition: { type: "tween", duration: 0.5, ease: "easeInOut" },
  },
};

const BellIcon = forwardRef<BellIconHandle, BellIconProps>(
  ({ className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const startAnimation = useCallback(() => {
      void controls.start("animate");
    }, [controls]);
    const stopAnimation = useCallback(() => {
      void controls.start("normal");
    }, [controls]);
    const iconRef = useAnimatedIcon({
      durationMs: 500,
      ref,
      start: startAnimation,
      stop: stopAnimation,
    });
    return (
      <span ref={iconRef} className={cn(className)} {...props}>
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          variants={SVG_VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </motion.svg>
      </span>
    );
  }
);

BellIcon.displayName = "BellIcon";

export { BellIcon };

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

export type SparklesIconHandle = AnimatedIconHandle;

interface SparklesIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

const SPARKLE_VARIANTS: Variants = {
  initial: {
    y: 0,
    fill: "none",
  },
  hover: {
    y: [0, -1, 0, 0],
    fill: "currentColor",
    transition: {
      type: "tween",
      duration: 1,
      ease: "easeInOut",
    },
  },
};

const STAR_VARIANTS: Variants = {
  initial: {
    opacity: 1,
    x: 0,
    y: 0,
  },
  blink: () => ({
    opacity: [0, 1, 0, 0, 0, 0, 1],
    transition: {
      type: "tween",
      duration: 2,
      ease: "easeInOut",
    },
  }),
};

const SparklesIcon = forwardRef<SparklesIconHandle, SparklesIconProps>(
  ({ className, size = 28, ...props }, ref) => {
    const starControls = useAnimation();
    const sparkleControls = useAnimation();
    const startAnimation = useCallback(() => {
      void sparkleControls.start("hover");
      void starControls.start("blink");
    }, [sparkleControls, starControls]);
    const stopAnimation = useCallback(() => {
      void sparkleControls.start("initial");
      void starControls.start("initial");
    }, [sparkleControls, starControls]);
    const iconRef = useAnimatedIcon({
      durationMs: 2000,
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
          <motion.path
            animate={sparkleControls}
            d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
            variants={SPARKLE_VARIANTS}
          />
          <motion.path
            animate={starControls}
            d="M20 3v4"
            variants={STAR_VARIANTS}
          />
          <motion.path
            animate={starControls}
            d="M22 5h-4"
            variants={STAR_VARIANTS}
          />
          <motion.path
            animate={starControls}
            d="M4 17v2"
            variants={STAR_VARIANTS}
          />
          <motion.path
            animate={starControls}
            d="M5 18H3"
            variants={STAR_VARIANTS}
          />
        </svg>
      </span>
    );
  }
);

SparklesIcon.displayName = "SparklesIcon";

export { SparklesIcon };

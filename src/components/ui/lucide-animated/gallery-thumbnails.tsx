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

export type GalleryThumbnailsIconHandle = AnimatedIconHandle;

interface GalleryThumbnailsIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

const PATH_VARIANTS: Variants = {
  normal: { opacity: 1 },
  animate: (i: number) => ({
    opacity: [0, 1],
    transition: { delay: i * 0.15, duration: 0.2 },
  }),
};

const GalleryThumbnailsIcon = forwardRef<
  GalleryThumbnailsIconHandle,
  GalleryThumbnailsIconProps
>(({ className, size = 28, ...props }, ref) => {
  const controls = useAnimation();
  const startAnimation = useCallback(() => {
    void controls.start("animate");
  }, [controls]);
  const stopAnimation = useCallback(() => {
    void controls.start("normal");
  }, [controls]);
  const iconRef = useAnimatedIcon({
    durationMs: 800,
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
        <rect height="14" rx="2" width="18" x="3" y="3" />
        {["M4 21h1", "M9 21h1", "M14 21h1", "M19 21h1"].map((d, index) => (
          <motion.path
            animate={controls}
            custom={index + 1}
            d={d}
            key={d}
            variants={PATH_VARIANTS}
          />
        ))}
      </svg>
    </span>
  );
});

GalleryThumbnailsIcon.displayName = "GalleryThumbnailsIcon";

export { GalleryThumbnailsIcon };

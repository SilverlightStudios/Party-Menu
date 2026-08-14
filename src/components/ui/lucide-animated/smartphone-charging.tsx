"use client";

import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback } from "react";

import { cn } from "@/lib/utils";
import {
  type AnimatedIconHandle,
  useAnimatedIcon,
} from "./useAnimatedIcon";

export type SmartphoneChargingIconHandle = AnimatedIconHandle;

interface SmartphoneChargingIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

const SmartphoneChargingIcon = forwardRef<
  SmartphoneChargingIconHandle,
  SmartphoneChargingIconProps
>(({ className, size = 28, ...props }, ref) => {
  const controls = useAnimation();
  const startAnimation = useCallback(() => {
    void controls.start("animate");
  }, [controls]);
  const stopAnimation = useCallback(() => {
    void controls.start("normal");
  }, [controls]);
  const iconRef = useAnimatedIcon({
    durationMs: 1100,
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
        <rect height="20" rx="2" ry="2" width="14" x="5" y="2" />
        <motion.path
          animate={controls}
          d="M12.667 8 10 12h4l-2.667 4"
          initial="normal"
          variants={{
            normal: { opacity: 1 },
            animate: {
              opacity: [1, 0.4, 1],
              transition: {
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            },
          }}
        />
      </svg>
    </span>
  );
});

SmartphoneChargingIcon.displayName = "SmartphoneChargingIcon";

export { SmartphoneChargingIcon };

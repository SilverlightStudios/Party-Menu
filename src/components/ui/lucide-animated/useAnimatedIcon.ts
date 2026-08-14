"use client";

import { useReducedMotion } from "motion/react";
import type { Ref } from "react";
import { useCallback, useEffect, useImperativeHandle, useRef } from "react";

const INTERACTIVE_ICON_PARENT_SELECTOR = [
  "button",
  "a[href]",
  "input:not([type='hidden'])",
  "select",
  "textarea",
  "summary",
  "label",
  "[role='button']",
  "[role='link']",
  "[role='menuitem']",
  "[role='tab']",
  "[role='switch']",
  "[role='checkbox']",
  "[role='radio']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const IDLE_REPLAY_INTERVAL_MS = 5000;

export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface UseAnimatedIconOptions {
  durationMs: number;
  ref: Ref<AnimatedIconHandle>;
  start: () => void | Promise<unknown>;
  stop: () => void | Promise<unknown>;
}

function getInteractiveTriggerTarget(element: HTMLSpanElement) {
  return element.closest<HTMLElement>(INTERACTIVE_ICON_PARENT_SELECTOR);
}

export function useAnimatedIcon({
  durationMs,
  ref,
  start,
  stop,
}: UseAnimatedIconOptions) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const resetTimeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(false);

  const clearResetTimeout = useCallback(() => {
    if (resetTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = null;
  }, []);

  const stopAnimation = useCallback(() => {
    clearResetTimeout();
    if (mountedRef.current) void stop();
  }, [clearResetTimeout, stop]);

  const playAnimation = useCallback(() => {
    clearResetTimeout();

    if (!mountedRef.current) return;

    if (reducedMotion) {
      void stop();
      return;
    }

    void start();

    resetTimeoutRef.current = window.setTimeout(() => {
      resetTimeoutRef.current = null;
      if (mountedRef.current) void stop();
    }, durationMs);
  }, [clearResetTimeout, durationMs, reducedMotion, start, stop]);

  useImperativeHandle(
    ref,
    () => ({
      startAnimation: () => {
        clearResetTimeout();
        if (mountedRef.current) void start();
      },
      stopAnimation,
    }),
    [clearResetTimeout, start, stopAnimation]
  );

  useEffect(() => {
    mountedRef.current = true;

    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const interactiveTarget = getInteractiveTriggerTarget(container);
    const triggerTarget = interactiveTarget ?? container;
    const handleTrigger = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      playAnimation();
    };

    let intervalId: number | null = null;

    if (reducedMotion) {
      void stop();
    } else {
      handleTrigger();

      triggerTarget.addEventListener("pointerenter", handleTrigger);
      triggerTarget.addEventListener("pointerdown", handleTrigger);
      triggerTarget.addEventListener("focusin", handleTrigger);

      if (!interactiveTarget) {
        intervalId = window.setInterval(handleTrigger, IDLE_REPLAY_INTERVAL_MS);
      }
    }

    return () => {
      mountedRef.current = false;
      clearResetTimeout();
      triggerTarget.removeEventListener("pointerenter", handleTrigger);
      triggerTarget.removeEventListener("pointerdown", handleTrigger);
      triggerTarget.removeEventListener("focusin", handleTrigger);

      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [clearResetTimeout, playAnimation, reducedMotion, stop]);

  return containerRef;
}

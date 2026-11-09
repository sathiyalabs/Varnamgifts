"use client";

import { forwardRef, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

import { safeAnchorProps } from "../lib/safe-links";

const magneticSpring = { stiffness: 275, damping: 23, mass: 0.45 };
const pressSpring = { type: "spring", stiffness: 410, damping: 28 };

const Tactile = forwardRef(function Tactile(
  { as = "button", magnetic = false, className = "", children, href, target, rel, ...props },
  ref,
) {
  const Control = as === "a" ? motion.a : motion.button;
  const reduced = useReducedMotion();
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, magneticSpring);
  const y = useSpring(targetY, magneticSpring);
  const [ripple, setRipple] = useState(null);
  const rippleKey = useRef(0);

  function move(event) {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    targetX.set(Math.max(-6, Math.min(6, (event.clientX - rect.left - rect.width / 2) * 0.16)));
    targetY.set(Math.max(-5, Math.min(5, (event.clientY - rect.top - rect.height / 2) * 0.16)));
  }

  function reset() {
    targetX.set(0);
    targetY.set(0);
  }

  function press(event) {
    if (reduced || event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    const radius = Math.hypot(Math.max(left, rect.width - left), Math.max(top, rect.height - top));
    setRipple({ id: ++rippleKey.current, left, top, diameter: radius * 2 });
  }

  return (
    <Control
      {...(as === "button" ? { type: "button" } : {})}
      {...props}
      {...(as === "a" ? safeAnchorProps(href) : {})}
      ref={ref}
      className={`tactile ${className}`}
      whileTap={reduced ? undefined : { scale: 0.95 }}
      transition={pressSpring}
      onPointerMove={magnetic ? move : undefined}
      onPointerLeave={magnetic ? reset : undefined}
      onPointerDown={press}
    >
      {magnetic ? <motion.span className="tactile-content" style={reduced ? undefined : { x, y }}>{children}</motion.span> : children}
      {ripple && <motion.span
        key={ripple.id}
        aria-hidden="true"
        className="tap-ripple"
        style={{ left: ripple.left - ripple.diameter / 2, top: ripple.top - ripple.diameter / 2, width: ripple.diameter, height: ripple.diameter }}
        initial={{ scale: 0, opacity: 0.15 }}
        animate={{ scale: 1, opacity: 0 }}
        transition={{ duration: 0.46, ease: "easeOut" }}
        onAnimationComplete={() => setRipple((current) => current?.id === ripple.id ? null : current)}
      />}
    </Control>
  );
});

export default Tactile;

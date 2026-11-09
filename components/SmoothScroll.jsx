"use client";

import { useEffect, useState } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { gsap, ScrollTrigger } from "../lib/scroll-motion";

const scrollOptions = {
  autoRaf: false,
  smoothWheel: true,
  syncTouch: true,
  lerp: 0.05,
  syncTouchLerp: 0.05,
  anchors: true,
};

function ScrollTicker() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    // Use one animation clock for both smooth scrolling and ScrollTrigger.
    const tick = (seconds) => lenis.raf(seconds * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update);
    };
  }, [lenis]);
  return null;
}

export default function SmoothScroll({ children }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  // Mount the document scroller beside the page so preference changes keep
  // the catalogue, focus and carousel state intact.
  return (
    <>
      {enabled && <ReactLenis root options={scrollOptions}><ScrollTicker /></ReactLenis>}
      {children}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/scroll-motion";
import SplitHeading from "./SplitHeading";
import Tactile from "./Tactile";
import Icon from "./Icon";

const slides = [
  { title: "Thoughtful Gifts. Lasting Moments.", eyebrow: "THE FESTIVE GIFT EDIT", copy: "Celebrate life’s special occasions with gifts chosen with care.", image: "/images/hero.webp", link: "#catalogue", action: "Explore gifts" },
  { title: "Gifts for a brighter tomorrow", eyebrow: "ROOTED IN TRADITION", copy: "Warm brass, timeless pieces and meaningful gifts for every celebration.", image: "/images/2-2.webp", link: "#brass", action: "Discover brass" },
  { title: "Make every milestone memorable.", eyebrow: "CORPORATE & BULK GIFTING", copy: "Curated hampers and executive gifts for teams, clients and milestones.", image: "/images/4-1.webp", link: "#corporate", action: "Explore corporate gifts" },
];

gsap.registerPlugin(useGSAP);

function CinematicSlide({ slide, index, playing, onBrowse }) {
  const root = useRef(null);
  const zoom = useRef(null);
  const isPresent = useIsPresent();
  const reduced = useReducedMotion();

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline()
        .from("[data-split-character]", { yPercent: 112, duration: 0.95, stagger: 0.018, ease: "power4.out" })
        .from("[data-hero-detail]", { y: 15, opacity: 0, duration: 0.62, stagger: 0.11, ease: "power3.out" }, 0.25);

      const animation = gsap.fromTo(".hero-photo", { scale: 1.04, xPercent: -1, yPercent: 0.6 }, {
        scale: 1.1, xPercent: 1.5, yPercent: -1.15, duration: 20, repeat: -1, yoyo: true, ease: "sine.inOut", paused: true,
      });
      zoom.current = animation;
      return () => { zoom.current = null; };
    });
    return () => media.revert();
  }, { scope: root });

  useEffect(() => {
    function syncZoom() {
      zoom.current?.paused(!playing || !isPresent || document.hidden);
    }
    syncZoom();
    document.addEventListener("visibilitychange", syncZoom);
    return () => document.removeEventListener("visibilitychange", syncZoom);
  }, [playing, isPresent, reduced]);

  return (
    <motion.div ref={root} className="hero-slide" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.72 }}
      role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`}
      inert={!isPresent} aria-hidden={!isPresent}>
      <img className="hero-photo" src={slide.image} alt="" fetchPriority={index === 0 ? "high" : "auto"} />
      <div className="hero-shade" aria-hidden="true" />
      <div className="shell hero-layout">
        <div className="hero-copy">
          <p data-hero-detail className="eyebrow hero-eyebrow">{slide.eyebrow}</p>
          <SplitHeading as="h1" text={slide.title} />
          <p data-hero-detail className="hero-description">{slide.copy}</p>
          <div data-hero-detail>
            <Tactile as="a" className="gold-button" href={slide.link} onClick={onBrowse}>
              {slide.action} <Icon name="arrow" size={16} />
            </Tactile>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HeroCinematic({ onBrowse }) {
  const hero = useRef(null);
  const [inView, setInView] = useState(true);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();
  const slide = slides[index];

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.15 });
    observer.observe(hero.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !playing || hovered || focused || !inView) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((current) => (current + 1) % slides.length);
    }, 7200);
    return () => window.clearInterval(timer);
  }, [focused, hovered, inView, playing, reduced]);

  function move(step) {
    setIndex((current) => (current + step + slides.length) % slides.length);
  }

  return (
    <section ref={hero} className="hero" aria-label="Featured gift collections" aria-roledescription="carousel"
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <AnimatePresence initial={false}>
        <CinematicSlide key={index} slide={slide} index={index} playing={playing && inView} onBrowse={onBrowse} />
      </AnimatePresence>
      <div className="shell hero-controls">
        <div className="hero-dots">
          {slides.map(({ eyebrow }, position) => <Tactile key={eyebrow} type="button" className={position === index ? "dot current" : "dot"} aria-label={`Show slide ${position + 1}: ${eyebrow}`} aria-pressed={position === index} onClick={() => setIndex(position)} />)}
          {!reduced && <Tactile type="button" className="pause" onClick={() => setPlaying((value) => !value)}>{playing ? "Pause" : "Play"}</Tactile>}
        </div>
        <div className="hero-arrows">
          <Tactile type="button" onClick={() => move(-1)} aria-label="Previous slide"><Icon name="left" /></Tactile>
          <Tactile type="button" onClick={() => move(1)} aria-label="Next slide"><Icon name="right" /></Tactile>
        </div>
      </div>
    </section>
  );
}

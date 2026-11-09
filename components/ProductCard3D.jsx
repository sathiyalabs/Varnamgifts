"use client";

import { useState } from "react";
import { motion, useMotionTemplate, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { minimumQuantity, placeholder, productOrderUrl } from "../lib/catalog";
import Tactile from "./Tactile";
import Icon from "./Icon";

const tiltSpring = { stiffness: 190, damping: 24, mass: 0.65 };
const drawerSpring = { type: "spring", stiffness: 200, damping: 20 };

export default function ProductCard3D({ product, collection }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();
  const rotateX = useSpring(0, tiltSpring);
  const rotateY = useSpring(0, tiltSpring);
  const glareX = useSpring(50, tiltSpring);
  const glareY = useSpring(50, tiltSpring);
  const photoX = useTransform(rotateY, [-6, 6], [4, -4]);
  const photoY = useTransform(rotateX, [-6, 6], [-4, 4]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,249,218,0.42), rgba(212,175,55,0.10) 32%, transparent 60%)`;
  const active = hovered || focused;
  const whatsappUrl = productOrderUrl(product);
  const image = process.env.NEXT_PUBLIC_USE_UNSPLASH_PLACEHOLDERS === "1" ? placeholder : product.image || placeholder;

  function track(event) {
    if (reduced || event.pointerType !== "mouse") return;
    // Measure the stable hit area rather than the rotating card.
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    rotateX.set((0.5 - y) * 12);
    rotateY.set((x - 0.5) * 12);
    glareX.set(x * 100);
    glareY.set(y * 100);
  }

  function reset() {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  }

  return (
    <div className="product-perspective" onPointerMove={track} onPointerLeave={reset} onPointerCancel={reset}>
      <motion.div className="product-plane" style={reduced ? undefined : { rotateX, rotateY }}>
        <Tactile as="a" className="product-card" href={whatsappUrl}
          aria-label={`Order ${product.name} on WhatsApp. Minimum order: ${minimumQuantity} items.`}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => { setHovered(false); reset(); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}>
          <div className="product-media">
            <motion.img src={image} alt="" loading="lazy" decoding="async"
              style={reduced ? undefined : { x: photoX, y: photoY }}
              onError={(event) => {
                if (event.currentTarget.getAttribute("src") !== placeholder) event.currentTarget.src = placeholder;
              }}
              animate={{ scale: active && !reduced ? 1.065 : 1 }}
              transition={{ duration: reduced ? 0 : 0.6, ease: "easeOut" }} />
            {!reduced && <motion.span aria-hidden="true" className="product-glare" style={{ background: glare }}
              initial={false} animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.25 }} />}
            <motion.span className="product-overlay" aria-hidden="true" initial={false}
              animate={{ y: active ? "0%" : "100%" }}
              transition={reduced ? { duration: 0 } : drawerSpring}>
              <Icon name="chat" size={17} /> Order on WhatsApp <Icon name="arrow" size={15} />
            </motion.span>
          </div>
          <div className="product-details">
            <p className="eyebrow">{collection}</p>
            <h3>{product.name}</h3>
            <span className="product-cap">Minimum order: {minimumQuantity}</span>
            <span className="product-order"><Icon name="chat" size={17} /> Order on WhatsApp <Icon name="arrow" size={14} /></span>
          </div>
        </Tactile>
      </motion.div>
    </div>
  );
}

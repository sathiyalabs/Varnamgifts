"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { collections, productOrderUrl, whatsappContact } from "../lib/catalog";
import Tactile from "./Tactile";
import Icon from "./Icon";
import BrandMark from "./BrandMark";

export default function Navbar({ query, setQuery, onBrowse }) {
  const [open, setOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const reduced = useReducedMotion();
  const menu = useRef(null);
  const trigger = useRef(null);
  const hidden = !atTop;

  useEffect(() => {
    let previous;
    function syncWithViewport() {
      // Native scrollY includes Lenis updates, touch, anchors and restoration.
      const next = window.scrollY === 0;
      if (next === previous) return;
      previous = next;
      setAtTop(next);
      if (!next) setOpen(false);
    }
    window.addEventListener("scroll", syncWithViewport, { passive: true });
    window.addEventListener("pageshow", syncWithViewport);
    syncWithViewport();
    return () => {
      window.removeEventListener("scroll", syncWithViewport);
      window.removeEventListener("pageshow", syncWithViewport);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function outside(event) {
      if (!menu.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  function resetNavigation(event) {
    onBrowse(event);
    setOpen(false);
  }

  return (
    <motion.header initial={false} animate={{ y: hidden ? "-100%" : 0 }}
      transition={{ duration: hidden || reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      data-navbar-hidden={hidden ? "true" : "false"}
      inert={hidden}
      className="relative z-40 border-b border-brass/25 bg-cream/95 shadow-sm backdrop-blur-md">
      <div className="bg-maroon px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[.2em] text-cream">
        Gifts for celebrations, return gifts &amp; bulk orders
      </div>
      <div className="shell header-main">
        <Tactile as="a" magnetic href="#" onClick={resetNavigation} className="brand" aria-label="Varnam Gifts home">
          <BrandMark />
          <span>Varnam<small>G I F T S</small></span>
        </Tactile>
        <form role="search" className="search" onSubmit={(event) => {
          event.preventDefault();
          document.getElementById("catalogue")?.focus();
        }}>
          <input maxLength={100} type="search" aria-label="Search gifts" placeholder="Search gifts, collections and more" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Tactile magnetic type="submit" aria-label="Show search results"><Icon name="search" /></Tactile>
        </form>
        <Tactile as="a" magnetic className="whatsapp-contact" href={whatsappContact} aria-label="Contact Varnam Gifts on WhatsApp">
          <Icon name="chat" size={23} /><span>WhatsApp us</span>
        </Tactile>
      </div>
      <nav className="border-t border-gold/20 bg-cream/70" aria-label="Main navigation">
        <div className="shell nav-row">
          <div ref={menu} className="menu-anchor" onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
          }} onKeyDown={(event) => {
            if (event.key === "Escape" && open) {
              event.stopPropagation();
              setOpen(false);
              trigger.current?.focus();
            }
          }}>
            <Tactile ref={trigger} type="button" className="nav-link font-semibold" aria-expanded={open} aria-controls="collection-menu" onClick={() => setOpen((value) => !value)}>
              <span className="md:hidden"><Icon name={open ? "close" : "menu"} size={16} /></span>
              Shop collections
              <span className="hidden md:inline-flex"><Icon name="down" size={14} /></span>
            </Tactile>
            <AnimatePresence initial={false}>
              {open && !hidden && <motion.div id="collection-menu" data-lenis-prevent className="mega-menu" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: reduced ? 0 : 0.18 }}>
                {collections.map((collection) => <div key={collection.id}>
                  <Tactile as="a" magnetic className="mega-title" href={`#${collection.id}`} onClick={resetNavigation}>{collection.title}</Tactile>
                  <ul>{collection.products.map((product) => <li key={product.name}>
                    <Tactile as="a" magnetic href={productOrderUrl(product)} aria-label={`Order ${product.name} on WhatsApp`}>{product.name}</Tactile>
                  </li>)}</ul>
                </div>)}
              </motion.div>}
            </AnimatePresence>
          </div>
          {collections.map(({ id, title }) => <Tactile as="a" magnetic key={id} className="nav-link nav-category" href={`#${id}`} onClick={resetNavigation}>{title}</Tactile>)}
          <Tactile as="a" magnetic href="#contact" className="nav-link ml-auto">Contact <Icon name="arrow" size={14} /></Tactile>
        </div>
      </nav>
    </motion.header>
  );
}

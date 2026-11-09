"use client";

import { useEffect, useRef, useState } from "react";
import { motion, MotionConfig, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { collections, whatsappContact } from "../lib/catalog";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/scroll-motion";
import Tactile from "./Tactile";
import Navbar from "./Navbar";
import HeroCinematic from "./HeroCinematic";
import CategorySection from "./CategorySection";
import CustomCursor from "./CustomCursor";
import Footer from "./Footer";
import Icon from "./Icon";

gsap.registerPlugin(useGSAP);

export default function HomePage() {
  const main = useRef(null);
  const browseFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(browseFrame.current), []);
  const [query, setQuery] = useState("");
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 25 });
  const term = query.trim().toLowerCase();
  const results = collections.map((collection) => ({
    ...collection,
    products: collection.products.filter(({ name }) => `${collection.title} ${name}`.toLowerCase().includes(term)),
  })).filter(({ products }) => products.length);
  const count = results.reduce((sum, { products }) => sum + products.length, 0);

  const searching = Boolean(term);
  useGSAP(() => {
    if (searching) return;
    const media = gsap.matchMedia();
    media.add({
      desktop: "(min-width: 768px)",
      mobile: "(max-width: 767px)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, ({ conditions }) => {
      if (conditions.reduced) return;

      function reveal(items, trigger) {
        gsap.from(items, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger, start: "top 94%", once: true },
        });
      }

      main.current.querySelectorAll("[data-reveal-heading]").forEach((heading) => {
        reveal(heading.children, heading);
      });
      main.current.querySelectorAll("[data-collection-heading]").forEach((heading) => {
        gsap.timeline({ scrollTrigger: { trigger: heading, start: "top 92%", once: true } })
          .from(heading.querySelectorAll("[data-split-character]"), {
            yPercent: 110, duration: 0.78, stagger: 0.025, ease: "power4.out",
          })
          .from(heading.querySelectorAll("[data-heading-detail]"), {
            y: 22, opacity: 0, duration: 0.58, stagger: 0.08, ease: "power4.out",
          }, 0.12);
      });

      main.current.querySelectorAll("[data-section-atmosphere]").forEach((layer) => {
        const amplitude = conditions.desktop ? 6 : 3;
        gsap.fromTo(layer, { yPercent: -amplitude }, {
          yPercent: amplitude, ease: "none",
          scrollTrigger: { trigger: layer.parentElement, start: "top bottom", end: "bottom top", scrub: 0.7 },
        });
      });

      const columns = conditions.desktop ? 4 : 2;
      main.current.querySelectorAll("[data-reveal-grid]").forEach((grid) => {
        const cells = Array.from(grid.children);
        for (let index = 0; index < cells.length; index += columns) {
          const row = cells.slice(index, index + columns);
          reveal(row, row[0]);
        }
      });
    });
    return () => media.revert();
  }, { scope: main, dependencies: [searching], revertOnUpdate: true });

  function browse(event) {
    if (!term || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const fragment = event.currentTarget.hash;
    setQuery("");
    if (fragment) {
      // A filtered-out target returns when React applies the cleared search.
      cancelAnimationFrame(browseFrame.current);
      browseFrame.current = requestAnimationFrame(() => document.getElementById(fragment.slice(1))?.scrollIntoView());
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <CustomCursor />
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar query={query} setQuery={(value) => setQuery(value.replace(/[\x00-\x1f\x7f]/g, "").slice(0, 100))} onBrowse={browse} />
      {!reduced && <motion.div className="scroll-progress" aria-hidden="true" style={{ scaleX: progress }} />}
      <main ref={main} id="main" tabIndex={-1}>
        <HeroCinematic onBrowse={browse} />
        <section className="shell collection-overview" aria-labelledby="browse-title">
          <div data-reveal-heading className="section-intro">
            <p className="eyebrow">THE VARNAM COLLECTIONS</p>
            <h2 id="browse-title">Find a gift for every occasion.</h2>
            <p>From festive keepsakes to thoughtful gifts for your team.</p>
          </div>
          <div className="category-grid" data-reveal-grid>
            {collections.map((collection) => <div key={collection.id}>
              <Tactile as="a" className="category-card" href={`#${collection.id}`} onClick={browse}>
                <img src={collection.products[0].image} alt="" loading="lazy" />
                <div><h3>{collection.title}</h3><Icon name="arrow" size={17} /></div>
              </Tactile>
            </div>)}
          </div>
        </section>
        <section className="catalogue" id="catalogue" tabIndex={-1} aria-label="Product catalogue">
          <div className="shell catalogue-status">
            <p role="status" className={term ? "search-status" : "sr-only"}>{term ? `${count} ${count === 1 ? "gift" : "gifts"} found` : "All gifts"}</p>
            {!count && <div className="no-results"><h2>No gifts match your search.</h2><Tactile className="gold-button" onClick={() => setQuery("")}>Show all gifts</Tactile></div>}
          </div>
          {results.map((collection) => (
            <CategorySection key={collection.id} collection={collection} showBulk={!searching} />
          ))}
        </section>
      </main>
      <Footer onBrowse={browse} />
      <Tactile as="a" className="floating-chat" href={whatsappContact} aria-label="Chat with Varnam Gifts on WhatsApp"><Icon name="chat" size={26} /></Tactile>
    </MotionConfig>
  );
}

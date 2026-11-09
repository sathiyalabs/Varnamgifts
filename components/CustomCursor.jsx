"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/scroll-motion";
import Icon from "./Icon";

gsap.registerPlugin(useGSAP);

const interactive = "a[href], button:not(:disabled), summary, [role=button]";
const nativeCursor = "input, textarea, select, [contenteditable]:not([contenteditable=false]), [data-native-cursor]";

export default function CustomCursor() {
  const cursor = useRef(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const root = document.documentElement;
      const element = cursor.current;
      const gift = element.firstElementChild;
      const follow = { duration: 0.22, ease: "power3.out" };
      const hover = { duration: 0.28, ease: "power3.out" };
      const moveX = gsap.quickTo(element, "x", follow);
      const moveY = gsap.quickTo(element, "y", follow);
      const scaleX = gsap.quickTo(gift, "scaleX", hover);
      const scaleY = gsap.quickTo(gift, "scaleY", hover);
      const rotate = gsap.quickTo(gift, "rotation", hover);
      let visible = false;
      let hovering = false;

      function hide() {
        if (!visible) return;
        visible = false;
        delete root.dataset.giftCursor;
      }

      function move(event) {
        const target = event.target;
        if (event.pointerType !== "mouse" || !(target instanceof Element) || target.closest(nativeCursor)) {
          hide();
          return;
        }

        if (!visible) {
          moveX(event.clientX, event.clientX);
          moveY(event.clientY, event.clientY);
          root.dataset.giftCursor = "active";
          visible = true;
        } else {
          moveX(event.clientX);
          moveY(event.clientY);
        }

        const next = Boolean(target.closest(interactive));
        if (next !== hovering) {
          hovering = next;
          scaleX(next ? 1.5 : 1);
          scaleY(next ? 1.5 : 1);
          rotate(next ? 15 : 0);
        }
      }

      function leave(event) {
        if (!event.relatedTarget) hide();
      }

      window.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerout", leave);
      window.addEventListener("blur", hide);
      window.addEventListener("keydown", hide);
      return () => {
        hide();
        window.removeEventListener("pointermove", move);
        document.removeEventListener("pointerout", leave);
        window.removeEventListener("blur", hide);
        window.removeEventListener("keydown", hide);
      };
    });

    return () => media.revert();
  }, { scope: cursor });

  return (
    <div ref={cursor} className="gift-cursor" aria-hidden="true">
      <span className="gift-cursor-icon"><Icon name="gift" size={22} /></span>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const glyphs = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghkmnpqrstuvwxyz₹#%&";

/** Decodes `text` left to right on mount. Screen readers get the plain text. */
export default function ScrambleText({ text, delay = 300, duration = 1100 }: { text: string; delay?: number; duration?: number }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const progress = Math.max(0, Math.min(1, (now - start) / duration));
      const settled = Math.floor(progress * text.length);
      setDisplay(
        text
          .split("")
          .map((char, index) => (index < settled || char === " " ? char : glyphs[Math.floor(Math.random() * glyphs.length)]))
          .join(""),
      );
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, delay, duration]);

  return (
    <>
      <span aria-hidden="true">{display}</span>
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{text}</span>
    </>
  );
}

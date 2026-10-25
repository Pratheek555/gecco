"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CreditCard, LayoutGrid, Target, Users } from "lucide-react";
import styles from "./landing.module.css";

const views = [
  { id: "overview", label: "Overview", icon: LayoutGrid, src: "/product/dashboard.png", alt: "Gecco overview with active memberships, expiring plans, collections and outstanding dues" },
  { id: "leads", label: "Leads", icon: Target, src: "/product/leads.png", alt: "Gecco leads desk listing enquiries to reply to and the trial agenda" },
  { id: "members", label: "Members", icon: Users, src: "/product/members.png", alt: "Gecco member directory with memberships, expiry dates and outstanding balances" },
  { id: "payments", label: "Payments", icon: CreditCard, src: "/product/payments.png", alt: "Gecco payments with a collection chart and payment method breakdown" },
] as const;

const CYCLE_MS = 6000;

export default function HeroShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // The active tab's progress bar is the timer: pausing the animation pauses the cycle.
  const advance = () => setActive((index) => (index + 1) % views.length);

  return (
    <div
      id="product"
      className={styles.showcase}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={styles.tabs} role="tablist" aria-label="Dashboard views">
        {views.map((view, index) => {
          const Icon = view.icon;
          const selected = index === active;
          return (
            <button
              key={view.id}
              type="button"
              role="tab"
              id={`tab-${view.id}`}
              aria-selected={selected}
              aria-controls="hero-stage"
              className={styles.tab}
              onClick={() => setActive(index)}
            >
              <Icon />
              {view.label}
              {selected && !reduceMotion && (
                <i
                  key={active}
                  className={styles.tabProgress}
                  data-paused={paused}
                  style={{ animationDuration: `${CYCLE_MS}ms` }}
                  onAnimationEnd={advance}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.stageWrap}>
        <div className={styles.stage}>
          <div className={styles.window} id="hero-stage" role="tabpanel" aria-labelledby={`tab-${views[active].id}`}>
            <div className={styles.windowBar} aria-hidden="true">
              <span /><span /><span />
              <b>dashboard.gecco.in/{views[active].id === "overview" ? "dashboard" : views[active].id}</b>
            </div>
            <div className={styles.screens}>
              {views.map((view, index) => (
                <Image
                  key={view.id}
                  src={view.src}
                  alt={view.alt}
                  width={2880}
                  height={1800}
                  quality={90}
                  sizes="(max-width: 860px) 860px, 1400px"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  aria-hidden={index !== active}
                  data-active={index === active}
                  className={styles.screen}
                />
              ))}
            </div>
          </div>

          <figure className={`${styles.float} ${styles.floatLeft}`} aria-hidden="true">
            <Image src="/product/card-methods.png" alt="" width={686} height={396} quality={90} sizes="340px" />
          </figure>
          <figure className={`${styles.float} ${styles.floatRight}`} aria-hidden="true">
            <Image src="/product/card-trials.png" alt="" width={660} height={910} quality={90} sizes="300px" />
          </figure>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { GeccoMark } from "../components/gecco-mark";
import GrowthSection from "./growth-section";
import HeroPulse from "./hero-pulse";
import HeroShowcase from "./hero-showcase";
import ScrambleText from "./scramble-text";
import styles from "./landing.module.css";

const navItems = [
  ["Product", "#product"],
  ["Leads", "#product"],
  ["Payments", "#product"],
  ["Contact", "mailto:support@gecco.in"],
] as const;

const dashboardUrl =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://dashboard.gecco.in";

const demoUrl = "mailto:support@gecco.in?subject=Gecco%20demo";

function Brand() {
  return (
    <span className={styles.brand}>
      <i className={styles.brandMark}><GeccoMark size={20} /></i>
      gecco
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" aria-label="Gecco home"><Brand /></Link>
          <nav className={styles.nav} aria-label="Primary">
            {navItems.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
          </nav>
          <div className={styles.headerActions}>
            <a href={dashboardUrl} className={styles.loginLink}>Log in</a>
            <a href={demoUrl} className={styles.headerCta}>Book a demo</a>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.backdrop} aria-hidden="true">
            <div className={styles.grid} />
            <div className={styles.gridSpot} />
            <div className={styles.beam} />
            <div className={styles.glow} />
          </div>

          <div className={styles.heroTop}>
            <div className={styles.copy}>
              <a href="#product" className={`${styles.announce} ${styles.reveal}`}>
                <b>New</b>
                <span>Leads desk<span className={styles.announceDetail}> — reply before enquiries go cold</span></span>
                <ArrowRight />
              </a>
              <h1 id="hero-title" className={styles.reveal}>
                Know every member,<br />
                <em>
                  <ScrambleText text="lead and rupee." delay={350} />
                  <svg className={styles.swoosh} viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M4 17 C 70 7, 170 4, 296 12" pathLength={100} />
                  </svg>
                </em>
              </h1>
              <p className={styles.reveal}>
                Gecco is the workspace for growing gyms. Reply to enquiries first, renew
                memberships before they lapse, and see exactly who still owes you.
              </p>
              <div className={`${styles.ctas} ${styles.reveal}`}>
                <a href={demoUrl} className={styles.primaryCta}>
                  Book a demo <ArrowRight />
                </a>
                <a href={dashboardUrl} className={styles.secondaryCta}>
                  Open dashboard <ArrowUpRight />
                </a>
              </div>
            </div>
            <HeroPulse />
          </div>

          <HeroShowcase />
        </section>

        <GrowthSection />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link href="/" aria-label="Gecco home"><Brand /></Link>
          <p>The workspace for growing gyms.</p>
          <nav aria-label="Footer">
            <a href={dashboardUrl}>Dashboard</a>
            <a href="mailto:support@gecco.in">support@gecco.in</a>
          </nav>
          <small>© {new Date().getFullYear()} Gecco</small>
        </div>
      </footer>
    </div>
  );
}

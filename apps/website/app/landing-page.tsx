import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Dumbbell,
  HeartPulse,
  Menu,
  MessageSquareText,
  Play,
  Plus,
  Search,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import styles from "./landing.module.css";
import LandingThemeToggle from "./landing-theme-toggle";

const navItems = [
  ["Services", "#features"],
  ["Platform", "#solutions"],
  ["Results", "#resources"],
  ["Pricing", "#pricing"],
] as const;

const dashboardUrl =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001";

function Brand() {
  return <span className={styles.brand}><b>Gecco</b></span>;
}

function HeroNote() {
  return (
    <div className={`${styles.floatGroup} ${styles.noteGroup}`} aria-hidden="true">
      <div className={styles.notePin} />
      <div className={styles.stickyNote}>
        Website refresh approved. Build the new SEO pages next.
      </div>
      <div className={styles.paperLayer} />
      <div className={styles.checkTile}><Check /></div>
    </div>
  );
}

function HeroReminder() {
  return (
    <div className={`${styles.floatGroup} ${styles.reminderGroup}`} aria-hidden="true">
      <div className={styles.clockTile}><Clock3 /></div>
      <div className={styles.reminderCard}>
        <span>Reminders</span>
        <small>New website enquiry</small>
        <p>Strategy call</p>
        <em><Clock3 /> 10:30 - 11:15</em>
      </div>
      <div className={styles.reminderPaper} />
    </div>
  );
}

function HeroTasks() {
  return (
    <div className={`${styles.floatGroup} ${styles.tasksCard}`} aria-hidden="true">
      <strong>Today&apos;s tasks</strong>
      <div><i className={styles.taskOrange} /><span>Publish service page</span><b>6/8</b></div>
      <div className={styles.progress}><i /><em /></div>
      <div><i className={styles.taskBlue} /><span>Review SEO keywords</span><b>12/15</b></div>
      <div className={styles.progress}><i /><em /></div>
    </div>
  );
}

function HeroIntegrations() {
  return (
    <div className={`${styles.floatGroup} ${styles.integrationCard}`} aria-hidden="true">
      <strong>100+ integrations</strong>
      <div>
        <i><MessageSquareText /></i>
        <i><CreditCard /></i>
        <i><CalendarDays /></i>
      </div>
    </div>
  );
}

function ProductPreview() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return (
    <div className={styles.productWindow}>
      <aside>
        <Brand />
        <nav>
          <span className={styles.previewActive}><BarChart3 /> Overview</span>
          <span><Users /> Members</span>
          <span><CalendarDays /> Schedule</span>
          <span><MessageSquareText /> Messages</span>
        </nav>
        <div className={styles.previewProfile}><i>PF</i><span><b>Pulse Fitness</b><small>Team workspace</small></span></div>
      </aside>
      <main>
        <header><div><small>Good morning, Priya</small><b>Here&apos;s your gym today.</b></div><button><Plus /> Add member</button></header>
        <div className={styles.previewStats}>
          <article><span><Users /> Active members</span><strong>1,284</strong><small>+8.2% this month</small></article>
          <article><span><Dumbbell /> Check-ins today</span><strong>186</strong><small>74% of daily goal</small></article>
          <article><span><HeartPulse /> Retention rate</span><strong>92.4%</strong><small>+3.1% this quarter</small></article>
        </div>
        <div className={styles.previewGrid}>
          <section className={styles.attendanceChart}>
            <header><b>Weekly attendance</b><span>This week</span></header>
            <div>{[55, 78, 67, 91, 74].map((height, index) => <i key={days[index]}><em style={{ height: `${height}%` }} /><small>{days[index]}</small></i>)}</div>
          </section>
          <section className={styles.todayList}>
            <header><b>Coming up</b><span>View all</span></header>
            <p><i>09:00</i><span><b>Morning yoga</b><small>18 members</small></span></p>
            <p><i>11:30</i><span><b>Strength basics</b><small>12 members</small></span></p>
            <p><i>17:00</i><span><b>HIIT express</b><small>20 members</small></span></p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.siteFrame}>
        <header className={styles.navbar}>
          <Link href="/" aria-label="Gecco home"><Brand /></Link>
          <nav>
            {navItems.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
          </nav>
          <div className={styles.navActions}>
            <LandingThemeToggle />
            <a href={dashboardUrl} className={styles.dashboardButton}>Open dashboard</a>
            <a href="mailto:support@gecco.in?subject=Start%20a%20project" className={styles.demoButton}>Start a project</a>
          </div>
          <details className={styles.mobileNavigation}>
            <summary className={styles.menuButton} aria-label="Toggle navigation"><Menu /></summary>
            <div className={styles.mobileMenu}>
              <LandingThemeToggle mobile />
              {navItems.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
              <a href="mailto:support@gecco.in?subject=Start%20a%20project">Start a project</a>
              <a href={dashboardUrl}>Open dashboard</a>
            </div>
          </details>
        </header>

        <main>
          <section className={styles.hero}>
            <HeroNote />
            <HeroReminder />
            <HeroTasks />
            <HeroIntegrations />
            <div className={styles.heroMark} aria-hidden="true"><Sparkles /></div>
            <div className={styles.heroCopy}>
              <span><Sparkles /> The growth system for ambitious fitness brands</span>
              <h1>Design, automate, and grow<br /><em>all in one place</em></h1>
              <p>Websites, SEO, smart automations and one dashboard—built to work together.</p>
              <div>
                <a href="mailto:support@gecco.in?subject=Free%20growth%20strategy%20call">Book a free strategy call <ArrowRight /></a>
                <a href="#features"><Play /> Explore services</a>
              </div>
            </div>
          </section>

          <section className={styles.trustBar} aria-label="Gecco services">
            <span><Sparkles /> Conversion-led websites</span>
            <span><Search /> SEO built in</span>
            <span><Zap /> Smart automations</span>
            <span><BarChart3 /> Unified dashboard</span>
          </section>

          <section className={styles.features} id="features">
            <div className={styles.flowHeading}>
              <span>One connected growth system</span>
              <h2>Turn more attention into<br /><em>long-term members.</em></h2>
              <p>Website, search, follow-up and operations designed as one seamless customer journey.</p>
            </div>

            <div className={styles.flowComposition}>
              <svg className={styles.flowLines} viewBox="0 0 1200 420" preserveAspectRatio="none" aria-hidden="true">
                <g className={styles.flowTrack}>
                  <path d="M190 55H310C335 55 345 70 345 92V145H500" />
                  <path d="M190 155H500" />
                  <path d="M1010 55H890C865 55 855 70 855 92V145H700" />
                  <path d="M1010 155H700" />
                  <path d="M600 178V275" />
                  <path d="M600 260H205C185 260 175 275 175 295V340" />
                  <path d="M600 260V340" />
                  <path d="M600 260H995C1015 260 1025 275 1025 295V340" />
                </g>
                <g className={styles.flowPulse}>
                  <path d="M190 55H310C335 55 345 70 345 92V145H500" />
                  <path d="M190 155H500" />
                  <path d="M1010 55H890C865 55 855 70 855 92V145H700" />
                  <path d="M1010 155H700" />
                  <path d="M600 178V275" />
                  <path d="M600 260H205C185 260 175 275 175 295V340" />
                  <path d="M600 260V340" />
                  <path d="M600 260H995C1015 260 1025 275 1025 295V340" />
                </g>
              </svg>

              <div className={styles.systemFlow} aria-label="Services connected by the Gecco growth system">
                <div className={`${styles.serviceNode} ${styles.flowWeb}`}><i><Sparkles /></i><b>Website design</b></div>
                <div className={`${styles.serviceNode} ${styles.flowSeo}`}><i><Search /></i><b>SEO &amp; content</b></div>
                <div className={`${styles.serviceNode} ${styles.flowAutomation}`}><i><Zap /></i><b>Smart automations</b></div>
                <div className={`${styles.serviceNode} ${styles.flowDashboard}`}><i><BarChart3 /></i><b>Unified dashboard</b></div>
                <div className={styles.geccoNode}><b>Gecco</b><span>growth system</span></div>
              </div>

              <div className={styles.journeyCards}>
                <article className={styles.journeyCard}>
                  <header><i><Sparkles /></i><span><small>01 / ATTRACT</small><h3>Bring in the right audience.</h3></span></header>
                  <p>A standout website and search strategy that turn high-intent visitors into real enquiries.</p>
                  <div className={`${styles.journeyVisual} ${styles.attractVisual}`} aria-hidden="true">
                    <div className={styles.miniBrowser}><i /><i /><i /><span>gecco.site</span></div>
                    <div className={styles.searchMetric}><small>ORGANIC VISIBILITY</small><strong>+46%</strong><em>last 90 days</em></div>
                    <div className={styles.miniRank}><b>1</b><span><i /><i /></span><small>yourbusiness.com</small></div>
                    <div className={styles.miniRank}><b>2</b><span><i /><i /></span><small>competitor.com</small></div>
                    <div className={styles.miniRank}><b>3</b><span><i /><i /></span><small>directory.com</small></div>
                  </div>
                </article>

                <article className={styles.journeyCard}>
                  <header><i><Zap /></i><span><small>02 / CONVERT</small><h3>Move every lead forward.</h3></span></header>
                  <p>Instant follow-up and simple pipelines keep every enquiry warm until they are ready to book.</p>
                  <div className={`${styles.journeyVisual} ${styles.pipelineVisual}`} aria-hidden="true">
                    <div><span>New lead <b>4</b></span><p><i>AP</i><strong>Arjun Patel<small>Website enquiry</small></strong></p><p><i>MK</i><strong>Maya Kapoor<small>Trial requested</small></strong></p></div>
                    <div><span>Following up <b>3</b></span><p><i>RS</i><strong>Rohan Shah<small>Message sent</small></strong></p><p><i>NV</i><strong>Nisha Verma<small>Call tomorrow</small></strong></p></div>
                    <div><span>Booked <b>2</b></span><p><i>SA</i><strong>Sana Ali<small>Tour confirmed</small></strong></p><p><i>VM</i><strong>Vikram Mehta<small>Joined today</small></strong></p></div>
                  </div>
                </article>

                <article className={styles.journeyCard}>
                  <header><i><BarChart3 /></i><span><small>03 / RETAIN</small><h3>See what keeps people growing.</h3></span></header>
                  <p>One live view of members, activity and opportunities gives your team a clearer next move.</p>
                  <div className={`${styles.journeyVisual} ${styles.retentionVisual}`} aria-hidden="true">
                    <div className={styles.retentionStat}><span>Active members</span><strong>1,284</strong><em>+8.2%</em></div>
                    <div className={styles.retentionStat}><span>Retention</span><strong>92.4%</strong><em>+3.1%</em></div>
                    <div className={styles.retentionChart}>
                      <span>Member activity</span>
                      <div>{[44, 68, 55, 82, 64, 91, 76, 96].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section className={styles.productSection} id="solutions">
            <div className={styles.sectionHeading}>
              <span>One connected dashboard</span>
              <h2>Your website, leads and members<br />working in sync.</h2>
              <p>See what is driving growth, what needs attention and what is already handled.</p>
            </div>
            <ProductPreview />
          </section>

          <section className={styles.results} id="resources">
            <div>
              <span>Built for growth</span>
              <h2>One partner from first click<br />to long-term member.</h2>
              <p>Stop stitching together agencies and disconnected tools. We design the journey and connect the systems behind it.</p>
              <a href="mailto:support@gecco.in?subject=Plan%20my%20growth%20system">Plan your growth system <ArrowRight /></a>
            </div>
            <div className={styles.resultGrid}>
              <article><strong>1 team</strong><span>from brand strategy to backend systems</span></article>
              <article><strong>4 pillars</strong><span>website, SEO, automation and operations</span></article>
              <article><strong>24/7</strong><span>automated lead and member follow-up</span></article>
              <article><strong>1 view</strong><span>for leads, members and performance</span></article>
            </div>
          </section>

          <section className={styles.pricingSection} id="pricing">
            <div className={styles.sectionHeading}>
              <span>Simple, transparent pricing</span>
              <h2>Choose the support your<br />next stage needs.</h2>
              <p>Every plan starts with a three-month commitment so we have enough time to build, improve and create measurable momentum.</p>
            </div>

            <div className={styles.pricingGrid}>
              <article className={styles.priceCard}>
                <header><span>Starter</span><small>For a strong foundation</small></header>
                <div className={styles.monthlyPrice}><sup>₹</sup><strong>1,899</strong><span>/ month</span></div>
                <div className={styles.planIncludes}><i><Check /></i><span><small>What&apos;s included</small><strong>Website + SEO</strong></span></div>
                <div className={styles.termPrices}>
                  <span><small>3 months</small><strong>₹5,697</strong></span>
                  <span><small>6 months</small><strong>₹9,999</strong></span>
                  <span><small>12 months</small><strong>₹18,999</strong></span>
                </div>
                <small className={styles.commitment}>Minimum 3-month commitment</small>
                <a href="mailto:support@gecco.in?subject=Gecco%20Starter%20plan">Choose Starter <ArrowRight /></a>
              </article>

              <article className={`${styles.priceCard} ${styles.priceFeatured}`}>
                <div className={styles.popularTag}>Most popular</div>
                <header><span>Plus</span><small>For connected growth</small></header>
                <div className={styles.monthlyPrice}><sup>₹</sup><strong>3,299</strong><span>/ month</span></div>
                <div className={styles.planIncludes}><i><Check /></i><span><small>What&apos;s included</small><strong>Website + SEO + Dashboard</strong></span></div>
                <div className={styles.termPrices}>
                  <span><small>3 months</small><strong>₹8,999</strong></span>
                  <span><small>6 months</small><strong>₹18,999</strong></span>
                  <span><small>12 months</small><strong>₹34,999</strong></span>
                </div>
                <small className={styles.commitment}>Minimum 3-month commitment</small>
                <a href="mailto:support@gecco.in?subject=Gecco%20Plus%20plan">Choose Plus <ArrowRight /></a>
              </article>

              <article className={styles.priceCard}>
                <header><span>Pro</span><small>For ambitious teams</small></header>
                <div className={styles.monthlyPrice}><sup>₹</sup><strong>4,499</strong><span>/ month</span></div>
                <div className={styles.planIncludes}><i><Check /></i><span><small>What&apos;s included</small><strong>Website + SEO + Dashboard + automation</strong></span></div>
                <div className={styles.termPrices}>
                  <span><small>3 months</small><strong>₹12,499</strong></span>
                  <span><small>6 months</small><strong>₹25,499</strong></span>
                  <span><small>12 months</small><strong>₹49,999</strong></span>
                </div>
                <small className={styles.commitment}>Minimum 3-month commitment</small>
                <a href="mailto:support@gecco.in?subject=Gecco%20Pro%20plan">Choose Pro <ArrowRight /></a>
              </article>
            </div>
          </section>

          <section className={styles.cta} id="contact">
            <div className={styles.ctaMark} aria-hidden="true"><Sparkles /></div>
            <span>Build your growth system</span>
            <h2>Make your website and operations<br />work as one.</h2>
            <p>Tell us where you want to grow. We&apos;ll map the website, SEO and automation plan to get you there.</p>
            <a href="mailto:support@gecco.in?subject=Free%20growth%20strategy%20call">Book your free strategy call <ArrowRight /></a>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerTop}>
            <div className={styles.footerContact}>
              <div className={styles.footerSocials} aria-label="Gecco social channels">
                <span aria-label="Instagram">ig</span>
                <span aria-label="LinkedIn">in</span>
                <span aria-label="X">X</span>
              </div>
              <a href="mailto:support@gecco.in">hello@gecco.in</a>
              <p>Built in India.<br />Working with ambitious fitness brands everywhere.</p>
            </div>

            <div className={styles.footerStage}>
              <div className={styles.footerDots} aria-hidden="true" />
              <a href="mailto:support@gecco.in?subject=Start%20a%20project">
                Start a project <small>FREE CALL</small><ArrowRight />
              </a>
            </div>

            <nav className={styles.footerNav} aria-label="Footer navigation">
              {navItems.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
              <a href={dashboardUrl}>Dashboard</a>
            </nav>
          </div>

          <div className={styles.footerLegal}>
            <span>Terms &amp; conditions</span>
            <p>© 2026 Gecco. All rights reserved.</p>
            <span>Privacy policy</span>
          </div>
          <div className={styles.footerWord} aria-hidden="true">gecco</div>
        </footer>
      </div>
    </div>
  );
}

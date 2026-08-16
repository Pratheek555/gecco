"use client";

import { Moon, Sun } from "lucide-react";
import styles from "./landing.module.css";

export default function LandingThemeToggle({ mobile = false }: { mobile?: boolean }) {
  function toggleTheme() {
    const nextDark = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
    localStorage.setItem("gecco-theme", nextDark ? "dark" : "light");
  }

  return (
    <button
      type="button"
      className={`${styles.themeToggle} ${mobile ? styles.mobileThemeToggle : ""}`}
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <Moon className={styles.themeMoon} aria-hidden="true" />
      <Sun className={styles.themeSun} aria-hidden="true" />
      {mobile && <span>Appearance</span>}
    </button>
  );
}

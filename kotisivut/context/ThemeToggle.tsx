"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaRegMoon } from "react-icons/fa";
import { FiSun } from "react-icons/fi";

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Tärkeä: renderöi nappi vasta asiakaspuolella,
  // muuten serveri ja selain eriävät ikonista (hydration-virhe)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Paikanvaraaja samoilla mitoilla, ettei layout hyppää
    return <div className="h-10 w-10" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full border border-black/10 bg-white/60 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/80 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/20"
      aria-label={isDark ? "Vaihda vaaleaan teemaan" : "Vaihda tummaan teemaan"}
      title={theme === "dark" || theme === "light" ? undefined : "Järjestelmän teema käytössä"}
    >
      {isDark ? (
        // Aurinko (painetaan, kun ollaan tummassa)
        <FiSun />
      ) : (
        // Kuu (näytetään, kun ollaan valoisassa)
        <FaRegMoon />
      )}
    </button>
  );
}
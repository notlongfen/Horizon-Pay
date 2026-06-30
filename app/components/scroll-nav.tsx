"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type ScrollNavProps = {
  children: ReactNode;
};

export function ScrollNav({ children }: ScrollNavProps) {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let ticking = false;
    let prevScrollY = window.scrollY;

    const syncNav = () => {
      const currentY = window.scrollY;

      // Determine scroll direction and update classes
      const isScrollingDown = currentY > prevScrollY && currentY > 60;
      const isScrollingUp = currentY < prevScrollY;

      // Always track scrolled state for styling
      header.classList.toggle("is-scrolled", currentY > 16);

      // Hide only when scrolling down past threshold
      if (isScrollingDown) {
        header.classList.add("is-hidden");
      } else if (isScrollingUp) {
        header.classList.remove("is-hidden");
      }

      prevScrollY = currentY;
      ticking = false;
    };

    const requestSync = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(syncNav);
      }
    };

    const showOnFocus = () => {
      header.classList.remove("is-hidden");
    };

    syncNav();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);
    header.addEventListener("focusin", showOnFocus);

    return () => {
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
      header.removeEventListener("focusin", showOnFocus);
    };
  }, []);

  return (
    <header ref={headerRef} className="sticky-nav-shell px-4 pt-4">
      {children}
    </header>
  );
}

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

    const syncNav = () => {
      const currentY = window.scrollY;

      header.classList.toggle("is-scrolled", currentY > 16);

      // We removed the hide-on-scroll-down logic to keep the nav sticky at all times
      header.classList.remove("is-hidden");

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

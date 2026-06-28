"use client";

import { useEffect } from "react";

export function ScrollParallax() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup = () => {};
    let cancelled = false;
    let initGeneration = 0;

    const resetParallax = () => {
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((node) => {
        node.style.setProperty("--parallax-y", "0px");
      });
    };

    const init = async () => {
      const generation = initGeneration + 1;
      initGeneration = generation;
      cleanup();
      cleanup = () => {};
      resetParallax();

      if (mediaQuery.matches) return;

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled || generation !== initGeneration) return;

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        const parallaxElements =
          gsap.utils.toArray<HTMLElement>("[data-parallax]");

        parallaxElements.forEach((node, index) => {
          const speed = Number(node.dataset.parallaxSpeed ?? "-0.08");
          const desktopDistance = Math.min(
            150,
            Math.max(34, Math.abs(speed) * 1500),
          );
          const compactDistance = desktopDistance * 0.48;
          const direction = speed < 0 ? -1 : 1;

          gsap.fromTo(
            node,
            {
              "--parallax-y": () =>
                `${direction * (window.innerWidth < 768 ? compactDistance : desktopDistance)}px`,
            },
            {
              "--parallax-y": () =>
                `${direction * -(window.innerWidth < 768 ? compactDistance : desktopDistance)}px`,
              ease: "none",
              scrollTrigger: {
                trigger: node.closest(".parallax-section") ?? node,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.85,
                invalidateOnRefresh: true,
                refreshPriority: index,
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>(".parallax-section").forEach((section) => {
          const target = section.querySelector<HTMLElement>(
            ".glass-panel, .architecture-stage, .traction-orb",
          );

          if (!target) return;

          gsap.fromTo(
            target,
            { y: 34, opacity: 0.82 },
            {
              y: 0,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 84%",
                end: "top 44%",
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            },
          );
        });

        ScrollTrigger.refresh();
      });

      cleanup = () => {
        context.revert();
        resetParallax();
        ScrollTrigger.refresh();
      };
    };

    const handleMotionChange = () => {
      void init();
    };

    void init();
    mediaQuery.addEventListener("change", handleMotionChange);

    return () => {
      cancelled = true;
      initGeneration += 1;
      cleanup();
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return null;
}

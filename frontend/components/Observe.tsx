"use client";

import { useEffect } from "react";
import {
  reveal,
  setActiveSection,
  setHeaderCondensed,
  type SectionId,
} from "@/store/landingSlice";
import { useAppDispatch } from "@/store/hooks";

const SECTIONS: SectionId[] = ["signal", "method", "evidence"];

export function Observe() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onScroll = () => {
      dispatch(setHeaderCondensed(window.scrollY > 12));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dispatch]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      dispatch(reveal("method"));
      dispatch(reveal("evidence"));
      return;
    }

    const nodes = SECTIONS.map((id) => document.getElementById(id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible?.target.id;
        if (id === "signal" || id === "method" || id === "evidence") {
          dispatch(setActiveSection(id));
        }
      },
      { rootMargin: "-42% 0px -48% 0px", threshold: [0, 0.2, 0.45, 0.7] },
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          if (id === "method" || id === "evidence") {
            dispatch(reveal(id));
          }
        });
      },
      { threshold: 0.22 },
    );

    nodes.forEach((node) => {
      sectionObserver.observe(node);
      if (node.id === "method" || node.id === "evidence") {
        revealObserver.observe(node);
      }
    });

    return () => {
      sectionObserver.disconnect();
      revealObserver.disconnect();
    };
  }, [dispatch]);

  return null;
}

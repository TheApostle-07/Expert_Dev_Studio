// app/page.tsx
"use client";

// Clean, maintainable homepage composed from section components.
// Assumes you've added the files from our previous step:
// - components/home/Hero.tsx
// - components/home/Services.tsx
// - components/home/Packages.tsx
// - components/home/Testimonials.tsx
// - components/home/CTA.tsx
// - components/ui/motion.tsx (shared Framer Motion helpers)

import Hero from "../components/home/Hero";
import Services from "../components/home/Services";
import Packages from "../components/home/Packages";
import Testimonials from "../components/home/Testimonials";
import CTA from "../components/home/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Packages />
      <Testimonials />
      <CTA />
    </>
  );
}
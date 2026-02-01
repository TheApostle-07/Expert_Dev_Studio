export type Testimonial = {
  name: string;
  role: string;
  city: string;
  quote: string;
  outcome?: string;
  metric?: string;
  timeframe?: string;
  verified?: boolean;
};

export const testimonials: Testimonial[] = [
  {
    name: "Ritika Sharma",
    role: "Clinic Owner",
    city: "Gurugram",
    quote:
      "The funnel feels premium and the WhatsApp CTA makes it easy for patients to reach us without drop-off.",
    outcome: "Smoother appointment requests",
    verified: true,
  },
  {
    name: "Siddharth Mehta",
    role: "Fitness Coach",
    city: "Pune",
    quote:
      "We finally have a single page that explains the offer and captures leads cleanly. It’s simple and fast.",
    timeframe: "First week",
  },
  {
    name: "Ananya Kapoor",
    role: "Real Estate Consultant",
    city: "Mumbai",
    quote:
      "Great structure and a solid close kit. The WhatsApp flow feels natural for high-intent leads.",
  },
];

export const proofAssets = [
  {
    title: "Live demo link",
    description: "A sample funnel with WhatsApp-first flow.",
  },
  {
    title: "Performance screenshot",
    description: "Mobile LCP and speed snapshot placeholder.",
  },
  {
    title: "Event tracking map",
    description: "CTA click events + UTM attribution view.",
  },
];

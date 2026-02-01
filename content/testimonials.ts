export type Testimonial = {
  name: string;
  role: string;
  city: string;
  quote: string;
  avatar?: string;
  outcome?: string;
  metric?: string;
  timeframe?: string;
  verified?: boolean;
};

export const testimonials: Testimonial[] = [
  {
    name: "Claire Walker",
    role: "Clinic Director",
    city: "London",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    quote:
      "The funnel feels premium and the WhatsApp CTA makes it easy for patients to reach us without drop-off.",
    outcome: "Smoother appointment requests",
    verified: true,
  },
  {
    name: "Ethan Brooks",
    role: "Fitness Coach",
    city: "Austin",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    quote:
      "We finally have a single page that explains the offer and captures leads cleanly. It’s simple and fast.",
    timeframe: "First week",
    verified: true,
  },
  {
    name: "Sofia Martinez",
    role: "Real Estate Consultant",
    city: "Miami",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    quote:
      "Great structure and a solid close kit. The WhatsApp flow feels natural for high-intent leads.",
    verified: true,
  },
  {
    name: "Liam Carter",
    role: "Tutoring Founder",
    city: "Toronto",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    quote:
      "The page makes it clear why we’re different and helps parents reach out instantly.",
    verified: true,
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

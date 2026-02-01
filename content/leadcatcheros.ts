export const leadCatcherOSCopy = {
  hero: {
    title: "Lead Catcher OS",
    subhead:
      "A WhatsApp-first conversion system that turns interest into booked calls and paid deposits.",
    primaryCta: "Get Demo + Pricing",
    secondaryCta: "See what you get",
    metrics: [
      "Mobile LCP < 1.5s",
      "Razorpay-ready",
      "SEO-ready",
      "WhatsApp-first",
    ],
  },
  whatYouGet: [
    {
      title: "Premium landing page",
      body: "A clean, high-trust page built for WhatsApp conversion.",
      icon: "sparkles",
    },
    {
      title: "WhatsApp click-to-chat CTA",
      body: "Instant conversations with a frictionless tap.",
      icon: "message",
    },
    {
      title: "Lead form → Google Sheet CRM",
      body: "Every lead captured reliably in your sheet.",
      icon: "sheet",
    },
    {
      title: "Payment-ready",
      body: "Razorpay link or deposit flow integration.",
      icon: "card",
    },
    {
      title: "Close Kit",
      body: "Scripts + follow-up flow to speed decisions.",
      icon: "script",
    },
    {
      title: "Tracking",
      body: "CTA click events and UTM attribution.",
      icon: "track",
    },
  ],
  steps: [
    {
      title: "10-min intake",
      body: "Share your offer, audience, and preferred WhatsApp number.",
    },
    {
      title: "48h install",
      body: "We design, build, and wire the entire funnel.",
    },
    {
      title: "Handoff + support",
      body: "Launch checklist, scripts, and 7-day support.",
    },
  ],
  pricing: {
    price: "₹50,000",
    headline: "All-inclusive install",
    inclusions: [
      "Domain install support",
      "1 revision round",
      "7-day post-launch support",
      "Close Kit scripts pack",
    ],
  },
  guarantee: [
    "Install Guarantee: live within 48 hours after intake, or we keep working free until it’s live.",
    "No lead guarantees; we guarantee delivery + conversion-focused structure.",
  ],
  finalCta: {
    headline: "Ready for a WhatsApp-first funnel?",
    subhead: "Share a few details and we’ll send the demo + pricing on WhatsApp.",
  },
  whatsappPrefill:
    "Lead Catcher OS — I submitted the form. Lead ID: {leadId}. My business: {businessType}. City: {city}.",
};

export const leadCatcherBusinessTypes = [
  "coach",
  "clinic",
  "salon",
  "tuition",
  "real-estate",
  "other",
] as const;

export type Prize = {
  code: string;
  label: string;
  priceInr: number;
  weight: number;
  bonusLabel?: string;
};

export const ANCHOR_PRICE_INR = 49999;
export const DEPOSIT_INR = 9999;

export const PRIZES: Prize[] = [
  { code: "JACKPOT_19999", label: "₹19,999 Founder Build", priceInr: 19999, weight: 2 },
  { code: "OFFER_24999", label: "₹24,999 Founder Build", priceInr: 24999, weight: 8 },
  { code: "OFFER_29999", label: "₹29,999 Founder Build", priceInr: 29999, weight: 15 },
  { code: "OFFER_34999", label: "₹34,999 Founder Build", priceInr: 34999, weight: 25 },
  {
    code: "AUDIT_34999",
    label: "Free Audit + ₹34,999 Build",
    priceInr: 34999,
    weight: 50,
    bonusLabel: "Free Audit Included",
  },
];

export function selectPrize(slotsLeftToday: number) {
  const available = slotsLeftToday > 0 ? PRIZES : PRIZES.filter((p) => p.code !== "JACKPOT_19999");
  const total = available.reduce((sum, prize) => sum + prize.weight, 0);
  const roll = Math.random() * total;
  let acc = 0;
  for (const prize of available) {
    acc += prize.weight;
    if (roll <= acc) {
      return { prize, index: PRIZES.findIndex((p) => p.code === prize.code) };
    }
  }
  const fallback = available[available.length - 1];
  return { prize: fallback, index: PRIZES.findIndex((p) => p.code === fallback.code) };
}

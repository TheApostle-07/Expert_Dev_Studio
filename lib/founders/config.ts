export const SPIN_ATTEMPTS_PER_WINDOW = 2;
export const SPIN_WINDOW_MS = 24 * 60 * 60 * 1000;
export const OFFER_EXPIRY_MS = 5 * 60 * 1000;
export const COOLDOWN_MS = 24 * 60 * 60 * 1000;

const parseIntSafe = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const DAILY_SLOTS = parseIntSafe(process.env.DAILY_SLOTS, 0);

export const SPIN_PACK_PRICE_INR = parseIntSafe(
  process.env.SPIN_PACK_PRICE_INR,
  9
);

export const SPIN_PACK_SPINS = parseIntSafe(
  process.env.SPIN_PACK_SPINS,
  3
);

export const SESSION_COOKIE = "eds_founders_session";

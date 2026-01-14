export const SPIN_ATTEMPTS_PER_WINDOW = 2;
export const SPIN_WINDOW_MS = 24 * 60 * 60 * 1000;
export const OFFER_EXPIRY_MS = 5 * 60 * 1000;
export const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const DAILY_SLOTS = Number.parseInt(
  process.env.DAILY_SLOTS || "3",
  10
);

export const SESSION_COOKIE = "eds_founders_session";

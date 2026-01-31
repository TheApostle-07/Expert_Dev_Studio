export const SPRINT_STATUSES = [
  "CREATED",
  "LOCKED",
  "ORDER_CREATED",
  "PAID_PENDING_VERIFY",
  "CONFIRMED",
  "INTAKE_SUBMITTED",
  "IN_PROGRESS",
  "DRAFT_SENT",
  "CLIENT_APPROVED",
  "COMPLETED",
  "STALE",
  "RESCHEDULED",
  "REFUND_REQUESTED",
  "REFUNDED",
  "DISPUTED",
  "NO_SHOW_USER",
  "NO_SHOW_STUDIO",
] as const;

export type SprintStatus = (typeof SPRINT_STATUSES)[number];

export const SPRINT_PRICE_TOTAL = 9999;
export const SPRINT_START_FEE = 999;
export const SPRINT_BALANCE_DUE = 9000;
export const SLOT_LOCK_TTL_MS = 10 * 60 * 1000;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_PER_WINDOW = 5;
export const OTP_WINDOW_MS = 60 * 60 * 1000;

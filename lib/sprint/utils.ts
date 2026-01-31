import crypto from "crypto";

export const generateBookingCode = () => {
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `EDS-SPRINT-${suffix}`;
};

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const hashValue = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

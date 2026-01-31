import { z } from "zod";

export const emailSchema = z.string().email();

export const otpRequestSchema = z.object({
  email: emailSchema,
});

export const otpVerifySchema = z.object({
  email: emailSchema,
  code: z.string().min(4).max(8),
});

export const lockSchema = z.object({
  slotId: z.string().min(12),
});

export const orderSchema = z.object({
  slotId: z.string().min(12),
});

export const verifySchema = z.object({
  bookingId: z.string().min(12),
  razorpay_order_id: z.string().min(3),
  razorpay_payment_id: z.string().min(3),
  razorpay_signature: z.string().min(3),
});

export const intakeSchema = z.object({
  bookingId: z.string().min(12),
  brandName: z.string().min(2),
  offerHeadline: z.string().min(4),
  packagesPricing: z.string().min(2),
  whatsappNumber: z.string().min(6),
  benefits: z.array(z.string().min(2)).min(1).max(6),
  testimonials: z.string().optional().nullable(),
  brandColors: z.string().optional().nullable(),
  links: z.string().optional().nullable(),
});

export const adminStatusSchema = z.object({
  status: z.string().min(2),
  notes: z.string().optional(),
});

export const rescheduleSchema = z.object({
  slotId: z.string().min(12),
});

## Expert Dev Studio

### Founders Slot setup

Add the following to `.env.local` (see `.env.example`):

- `MONGODB_URI`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `DAILY_SLOTS` (default `3`)
- `ADMIN_TOKEN` (required for `/admin/leads`)
- `WHATSAPP_NUMBER` (for the Client Success CTA)
- `NEXT_PUBLIC_FOUNDERS_VSL_URL` (VSL embed)
- `NEXT_PUBLIC_FOUNDERS_SCRATCH` (optional feature flag)

#### Admin access

Visit `/admin/leads?token=YOUR_ADMIN_TOKEN`.

#### Razorpay webhook

Configure Razorpay webhook to:

`/api/pay/webhook`

### Sprint Funnel Setup & Testing

Add these to `.env.local`:

- `MONGODB_URI`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `BASE_URL`
- `RESEND_API_KEY` (optional, for OTP)
- `OTP_EMAIL_FROM` (optional)
- `ADMIN_GATE_PASSWORD`
- `SESSION_SECRET`

#### Seed slots

```
node scripts/seed-sprint-slots.ts
```

#### Webhooks

Configure Razorpay webhook to:

`/api/webhooks/razorpay`

#### Local flow test

1) Visit `/lead-catcher-sprint` and click Book.
2) Request OTP, verify email, select slot.
3) Complete Razorpay test payment.
4) Confirm redirect to `/lead-catcher-sprint/thanks`.
5) Submit intake at `/lead-catcher-sprint/intake`.
6) Access admin at `/admin/sprint-bookings` (password gate).

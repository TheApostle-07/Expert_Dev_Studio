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

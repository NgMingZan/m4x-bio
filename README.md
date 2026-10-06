# M4X BIO
Next.js + Supabase + SePay integration.

## Required Render environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `NEXT_PUBLIC_SITE_URL=https://m4x-bio.onrender.com`
- `ADMIN_EMAIL` (the email allowed to open `/admin`)
- `SEPAY_SECRET_KEY` (test gateway secret currently available)
- `SEPAY_WEBHOOK_API_KEY` (preferred when a dedicated SePay webhook API key is configured)

Never commit real secrets.

## Admin
`/admin` is protected server-side: the signed-in email must exactly match `ADMIN_EMAIL`. It can view users/orders, grant/revoke Shop, lock/unlock accounts, and manually confirm/cancel pending Shop orders.

## Existing Supabase project
The registration trigger has already been added during setup. `supabase/production-upgrade.sql` is included as a reference/one-time migration; do not rerun the `create policy` line if that policy already exists.

## Shop payment
A user creates a pending 50,000 VND order and receives a unique `M4X...` transfer code. `/api/sepay/webhook` only accepts authenticated incoming-transfer callbacks, checks the unique code and amount, prevents reuse of a transaction id, marks the order paid, then enables `profiles.shop_enabled`.

For production, configure SePay's actual webhook/IPN authentication method to match the server endpoint. Do not treat possession of a Payment Gateway test secret as proof that production IPN is enabled.

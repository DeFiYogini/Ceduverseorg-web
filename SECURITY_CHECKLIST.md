# Ceduverse Security Checklist

Use this checklist for ongoing security management of ceduverse.org.

---

## Before Every Deploy

- [ ] No secrets in code (grep for passwords, API keys, tokens)
- [ ] `.env` is NOT tracked in git (`git ls-files .env` should return nothing)
- [ ] `npm audit` shows no critical/high vulnerabilities
- [ ] Build completes without errors (`npm run build`)

## Weekly Checks

- [ ] Review server logs for suspicious auth attempts (repeated OTP failures, brute force)
- [ ] Check Cloudflare dashboard for unusual traffic spikes or blocked requests
- [ ] Verify Supabase database is accessible and healthy
- [ ] Confirm Cloudflare Tunnel is connected (site responds at ceduverse.org)

## Monthly Checks

- [ ] Run `npm audit` and upgrade any packages with known vulnerabilities
- [ ] Review admin accounts — remove any that are no longer needed
- [ ] Rotate `SESSION_SECRET` if compromised or as preventive measure
- [ ] Check R2 bucket access — ensure no public listing is enabled
- [ ] Review Resend email logs for delivery failures or abuse
- [ ] Verify SSL certificate is valid (Cloudflare handles this automatically)

## Quarterly Checks

- [ ] Rotate all API keys and secrets:
  - `SESSION_SECRET`
  - `SUPERADMIN_PASSWORD`
  - `RESEND_API_KEY`
  - `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY`
  - `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
  - Supabase database password
- [ ] Review user roles — ensure no unauthorized superadmin/admin accounts
- [ ] Update all npm dependencies (`npm update`)
- [ ] Review Stripe webhook logs for failed verifications
- [ ] Backup database (Supabase has automatic backups, verify they're running)

---

## Security Controls in Place

### Authentication
- [x] OTP-based login with 8-digit codes (10M combinations)
- [x] Progressive lockout: delays after 3 failed attempts (30s, 60s, 5min, 10min)
- [x] OTP expires after 10 minutes
- [x] Max 3 verification attempts per code
- [x] Admin login with bcrypt-hashed passwords
- [x] JWT tokens with expiry

### HTTP Security
- [x] Helmet.js security headers (HSTS, CSP, X-Frame-Options, etc.)
- [x] HTTPS enforced via Cloudflare
- [x] Content-Security-Policy restricts script/style/connect sources
- [x] File downloads force `Content-Disposition: attachment`

### Data Protection
- [x] Database queries use Drizzle ORM (parameterized, no raw SQL injection)
- [x] DOMPurify sanitizes all user-generated HTML
- [x] Input validation on all admin import endpoints (length limits, type checking)
- [x] File uploads validate both MIME type and extension

### Payments
- [x] Stripe webhook signature verification mandatory
- [x] Prices calculated server-side from database (not from client)

### Admin
- [x] Admin API key is separate from session secret (no fallback)
- [x] Rate limiting on admin endpoints
- [x] Admin actions logged to console (upgrade to database audit log recommended)

---

## Known Limitations (Accept or Plan to Fix)

| Item | Risk | Status | Plan |
|------|------|--------|------|
| JWT stored in localStorage | XSS can steal tokens | Accepted for now | Move to httpOnly cookies |
| No CSRF tokens | Cross-site request forgery | Medium risk | Add csurf middleware |
| 7-day JWT expiry | Long token lifetime | Accepted | Reduce to 1 hour + refresh tokens |
| No database audit log | No admin action history | Low risk | Add audit_log table |
| Demo accounts bypass OTP | Auth bypass if enabled | Safe (not set in prod) | Keep DEMO_ACCOUNTS unset |
| Server on personal Mac | Availability depends on uptime | Accepted for now | Move to VPS/cloud hosting |

---

## Emergency Response

### If secrets are exposed:
1. Immediately rotate ALL secrets listed in Quarterly Checks
2. Reset Supabase database password
3. Generate new R2 API tokens in Cloudflare
4. Generate new Resend API key
5. Generate new Stripe keys
6. Update `.env` and restart server
7. Review logs for unauthorized access during exposure window

### If site is compromised:
1. Kill the server process: `lsof -ti :3000 | xargs kill -9`
2. Stop the tunnel: `cloudflared tunnel cleanup ceduverse`
3. Review server logs and Cloudflare analytics
4. Rotate all credentials
5. Check database for unauthorized changes
6. Redeploy from known-good git commit

### If database is compromised:
1. Disable the server immediately
2. Contact Supabase support
3. Restore from latest backup
4. Rotate database password
5. Audit all user accounts for unauthorized changes
6. Reset all user passwords/sessions

---

## Environment Variables Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `DB_URL` | Yes | PostgreSQL connection (Supabase) |
| `SESSION_SECRET` | Yes | JWT signing (min 32 chars, random) |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase public key |
| `RESEND_API_KEY` | Yes* | OTP emails (* users can't login without it) |
| `SUPERADMIN_PASSWORD` | No | Creates admin account on first boot |
| `STRIPE_SECRET_KEY` | No | Store payments |
| `STRIPE_WEBHOOK_SECRET` | No | Webhook verification (required if Stripe is active) |
| `R2_ACCOUNT_ID` | No | Cloudflare R2 storage |
| `R2_ACCESS_KEY_ID` | No | R2 API access |
| `R2_SECRET_ACCESS_KEY` | No | R2 API secret |
| `R2_BUCKET_NAME` | No | R2 bucket (default: ceduverse) |
| `ADMIN_API_KEY` | No | Separate key for admin import/export endpoints |
| `ANTHROPIC_API_KEY` | No | AI content generation |
| `OPENAI_API_KEY` | No | TTS audio generation (optional) |
| `BANK_CLABE` | No | Real CLABE for SAM payments |

---

*Last updated: 2026-04-18*
*Next quarterly review due: 2026-07-18*

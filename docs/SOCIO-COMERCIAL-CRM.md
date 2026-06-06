# Socio Comercial CRM — Prospect Pipeline

Reference for the `socio_comercial` CRM (the **Prospectos** tab on `/partner`).
Reworked from a shared org-wide prospect pool into a **hybrid "own + claim"** model.

- **Shipped:** PR #1 → `main` merge `859f127` (core), follow-up `51c3e0f` (test-data tagging).
- **Live:** ceduverse.org (Render auto-deploy from `main`).
- **Rollback baseline:** `d524cb4` (the deploy immediately before this work).

---

## 1. The model: hybrid own + claim

| Actor | Sees | Can do |
|---|---|---|
| **Socio comercial** | Their own prospects (`partner_id = them`) **+ unassigned** (`partner_id IS NULL`) | Claim available prospects, work their own, release back to pool, add manually |
| **Admin / superadmin / director** | **Everything** | All of the above + reassign to any socio, bulk-assign, see the socio roster |

Rules:
- Writing to an **unassigned** prospect (stage change, edit, interaction) **auto-claims** it to the actor.
- Touching a prospect owned by **another** socio → `403`.
- **Reassign-to-a-specific-socio** and the **socio roster** (`/api/denue/partners`, returns `[]` for socios) are **admin-only**.
- **Bulk-delete**: socios can delete only their own rows; admins any.
- Stats for socios are computed off a **scoped** query (not the global materialized view) so they see their numbers, not the whole pool.

Stages: `nuevo → contactado → demo → propuesta → negociacion → cliente` (+ `perdido`).
(`perdido` existed in the DB enum but was rejected by every endpoint pre-fix; now centralized in `DENUE_VALID_STAGES`.)

---

## 2. What a socio does (UI walkthrough)

1. Log in → lands on `/partner` → **Prospectos** tab.
2. **Scope toggle** (top): *Míos + disponibles* (default) · *Solo míos* · *Disponibles*.
3. Three views of the same data: **Tabla** (sortable, per-row "Reclamar", "Mío" badges) · **Kanban** (advance stages) · **Mapa**.
4. **Claim** an available prospect (or just edit/advance it → auto-claims).
5. Work it: change stage, log interactions (llamada/email/reunión/visita), edit contact fields.
6. **Release** back to the pool if not pursuing.
7. **Agregar** button → add a prospect manually (leads not in the DENUE database).

**Value overview card** ("value if you close"): open-pipeline value, won value, and a probability-weighted forecast (monthly + annualized), from each prospect's `potencialAportacionMensual` weighted by stage probability:
`nuevo .1 · contactado .2 · demo .4 · propuesta .6 · negociacion .8 · cliente 1 · perdido 0`.

---

## 3. Endpoints (`server/routes/crm.ts`)

Ownership helpers: `getProspectActor`, `prospectVisibility(actor, scope)`, `prospectWriteDecision(actor, ownerId)`, `writableIdFilter`. Scope query param: `mine` | `available` | `""` (both).

| Method | Path | Notes |
|---|---|---|
| GET | `/api/denue/prospectos` | List, visibility-scoped; `partnerId` filter admin-only |
| GET | `/api/denue/prospectos/stats` | Scoped (socios forced off global MV) |
| GET | `/api/denue/prospectos/map` | Scoped; cache key per viewer |
| GET | `/api/denue/prospectos/pipeline-value` | "Value if you close" for own book |
| GET | `/api/denue/prospectos/:id` | 403 if owned by another socio |
| POST | `/api/denue/prospectos` | **Manual add** (auto-claimed); `test:true` tags it |
| POST | `/api/denue/prospectos/:id/claim` | Claim an unassigned prospect (can't steal) |
| POST | `/api/denue/prospectos/:id/release` | Return own prospect to pool |
| PATCH | `/api/denue/prospectos/:id/stage` | Auto-claims if unassigned |
| PATCH | `/api/denue/prospectos/:id/assign` | **Admin-only** reassignment |
| POST | `/api/denue/prospectos/:id/interaccion` | Auto-claims if unassigned |
| POST | `/api/denue/prospectos/bulk-stage` | Scoped to writable rows |
| POST | `/api/denue/prospectos/bulk-assign` | **Admin-only** |
| POST | `/api/denue/prospectos/bulk-delete` | Socios: own rows only |
| GET | `/api/denue/partners` | Roster; `[]` for socios |

Files changed: `server/routes/crm.ts`, `client/src/pages/denue-tab.tsx`, `client/src/pages/partner-dashboard.tsx`, `client/public/materiales/*.pdf`, `scripts/cleanup-test-prospects.mjs`.

---

## 4. Testing on production

There is only **one Supabase database** — there is no staging. Render has no preview
environments. So testing happens against production data; keep test actions reversible.

**Tester login (recommended, no config):** real socio account
`ggonzaleznavarroaries@gmail.com` → log in at `ceduverse.org/auth` → OTP code by email →
Socio Comercial dashboard. (That account owns the only 5 pre-assigned prospects.)

Blast radius at deploy (2026-06-06): 5 socio/partner/director accounts, 5 admins,
796,010 prospects of which only 5 were pre-assigned — near-zero disruption; admins unchanged.

Safe no-risk walkthrough: log in → scope "Disponibles" → **Reclamar** one → watch the value
card update → advance stage / log interaction → **Liberar**.

---

## 5. Cleanup: delete test data with one command

Test prospects added via the **🧪 Prospecto de prueba** checkbox are tagged
`import_batch_id = 'TEST-DATA'` (never collides with real CSV batches). Untagged manual
adds are never touched.

```bash
cd ~/Downloads/Ceduverseorg-web

# 1. Preview (read-only — lists what would be removed)
node --env-file=.env scripts/cleanup-test-prospects.mjs

# 2. Delete tagged test prospects (interactions cascade)
node --env-file=.env scripts/cleanup-test-prospects.mjs --confirm

# 3. (Optional) release a tester's claims on REAL prospects back to the pool
node --env-file=.env scripts/cleanup-test-prospects.mjs --reset-claims-for ggonzaleznavarroaries@gmail.com --confirm
```

Script defaults to dry-run and lists names before any deletion.

---

## 6. Deploy & rollback

- Push/merge to `main` → Render auto-deploys (Docker, `render.yaml`). Build: `npm run build` (verified passing).
- Watch a deploy: poll the commit status — `gh api repos/DeFiYogini/Ceduverseorg-web/commits/<sha>/status -q .state` (pending → success/failure), or watch the client bundle hash change at `ceduverse.org`.
- **Rollback:** Render dashboard → service `ceduverse` → Deploys → roll back to `d524cb4`. One click, no data impact (pure code, no schema migration).

---

## 7. Open items

- Sales materials: **Brand kit** and **Sales script** downloads still show "Próximamente" — no source files exist yet. Deck + Medios de Pago PDFs are wired (`client/public/materiales/`).
- Local `.env` has a demo `socio_comercial` in `DEMO_ACCOUNTS`, but that is **not** in `render.yaml` — demo OTP-bypass may not be active in prod.
- Side effect of local testing against the prod DB: a `demosociocomercial@ceduverse.org` account now exists in prod (harmless).

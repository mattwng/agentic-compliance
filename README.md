# Agentic AI Compliance Evaluator

> AI governance and compliance platform for evaluating agentic AI systems across 10 frameworks simultaneously — with live threat intelligence and gap correlation.

**Production URL:** https://compliance.illuminait.io
**Auth:** Basic Auth (`illuminait` / `riskybusiness`)
**Port (local dev):** 3005

---

## Overview

The Agentic AI Compliance Evaluator helps security and governance teams:

- **Assess** agentic AI systems against 10 frameworks (NIST AI RMF, EU AI Act, OWASP LLM Top 10, MITRE ATLAS, and more) across 48 evidence controls
- **Track** compliance scores over time with RAG (Red/Amber/Green) risk ratings
- **Map** live threat intelligence from CISA KEV, AI Incident Database, MITRE ATLAS, ENISA, IBM X-Force, Mandiant, and Verizon DBIR to assessment gaps
- **Alert** proactively on critical/high threats that match open controls in the latest assessment

---

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — summary cards, threat alert, all assessments |
| `/tracker` | Assessment Tracker — 48-control evaluation form with JSON import |
| `/matrix` | Evidence Matrix — frameworks vs domains heat map |
| `/threats` | Threat Intelligence — 7 sources, gap correlation, severity filters |
| `/scores` | Risk Scores — framework scores, trend chart, domain weight calibration |

---

## Tech Stack

- **Framework:** Next.js 15 (App Router), TypeScript
- **Styling:** Tailwind CSS, shadcn/ui components
- **Data:** Prisma ORM + SQLite (persistent Docker volume)
- **State:** TanStack React Query
- **Charts:** Recharts
- **Auth:** Next.js middleware (Basic Auth via env vars)

---

## Local Development

```bash
cp .env.development .env
npm install
npm run dev
# App at http://localhost:3005
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite path (e.g. `file:/tmp/compliance.db`) |
| `BASIC_AUTH_USER` | Basic auth username |
| `BASIC_AUTH_PASS` | Basic auth password |

---

## Production Deployment

```bash
# 1. Commit and push
git add . && git commit -m "message" && git push origin main

# 2. Deploy to server (git pull + rebuild)
ssh root@192.168.68.108 "cd /opt/agentic-compliance && git pull && docker compose down && docker compose build --no-cache && docker compose up -d"

# 3. Verify
curl -I https://compliance.illuminait.io
```

Docker volume `agentic-compliance_compliance_db` persists the SQLite database and threat cache across rebuilds.

---

## Key Architecture Decisions

### Threat Intelligence
- **Stale-while-revalidate:** Cache is always served immediately; background refresh triggers when age > TTL (5min dev / 1hr prod)
- **7 sources:** 3 live (CISA KEV, AI Incident Database, MITRE ATLAS) + 4 static (ENISA, IBM X-Force, Mandiant, Verizon DBIR)
- **Gap correlation:** `lib/threat-alerts.ts` maps threat tags to compliance domains, so threats are marked "Relevant to gaps" when they match failing controls

### Assessment JSON Import
The tracker accepts discovery tool output as JSON. Two supported formats:

```json
[{"evidence_id": "AC-01", "status": "compliant", "notes": "..."}]
```
or
```json
{"AC-01": {"status": "compliant", "notes": "..."}}
```

Download a template from the tracker page to see all 48 control IDs.

### Domain Weight Calibration
Risk scores are weighted by domain. Import a threat CSV from threats.illuminait.io to auto-calibrate weights based on live severity data (Critical=4, High=3, Medium=2, Low=1, Info=0.5).

---

## Project Structure

```
app/
  page.tsx              # Dashboard
  tracker/page.tsx      # Assessment form + JSON import
  matrix/page.tsx       # Framework × domain heat map
  threats/page.tsx      # Threat intelligence
  scores/page.tsx       # Risk scores + domain weights
  api/                  # REST endpoints
    assessments/        # CRUD for assessments
    scores/trend/       # Historical trend data
    threats/            # Threat feed + alert count
    weights/            # Domain weight config
components/
  Navbar.tsx            # Site navigation with threat alert badge
  ui/                   # shadcn/ui components
lib/
  evidence-data.ts      # 48 controls, 10 frameworks, 8 domains
  threat-fetch.ts       # Threat aggregation + caching
  threat-alerts.ts      # Gap correlation shared logic
  threat-weights.ts     # CSV → domain weights computation
  static-threats.ts     # ENISA, X-Force, Mandiant, Verizon DBIR data
  rag.ts                # RAG color/label helper
  score.ts              # Score computation
middleware.ts           # Basic Auth enforcement
```

---

## Recent Changes (March 2026)

- Added JSON import to Assessment Tracker (supports discovery tool output)
- Threat Intelligence: real timestamps, static sources on initial load, default Critical filter, gap mapping with "Relevant to gaps" badge
- Proactive Threat Alert card on Dashboard (critical/high threats matched to latest assessment)
- Red badge on Navbar Threat Intelligence link showing live critical count
- Pulsing indicators on live feed source pills (CISA KEV, AIID, MITRE ATLAS)
- IlluminAIT lightbulb logo in Navbar (replacing Shield icon)
- Basic Auth via Next.js middleware
- Live feed TTL: 1hr (aligned with CISA KEV actual update cadence)
- Full responsive design audit across all pages

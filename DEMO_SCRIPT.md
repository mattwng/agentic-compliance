# Agentic AI Compliance Evaluator — Customer Demo Script

**Audience:** Security, Risk, or AI governance stakeholders at a prospect or customer organization
**Duration:** 25–35 minutes
**Goal:** Demonstrate how the platform surfaces compliance gaps, maps live threat intelligence to assessment findings, and proactively alerts on threats that match your specific risk posture
**Pre-loaded demo:** "AI Sales Assistant — Enterprise Edition" at 60% Medium Risk

---

## Before You Start

- Open the app in a browser: `https://compliance.illuminait.io`
- Land on the **Dashboard** page — this is your opening view
- Confirm the red **Threat Alert** card is visible below the summary cards

---

## Act 1 — Setting the Scene (2 min)

> **Talking Point:**
> *"One of the fastest-evolving challenges in AI security right now is that the frameworks for evaluating agentic AI systems are fragmented — you've got NIST AI RMF, EU AI Act, OWASP LLM Top 10, MITRE ATLAS, CSA Agentic IAM, and more. Most organizations are trying to track compliance across all of these in spreadsheets. This platform consolidates that into a single structured evaluation that produces a scored, auditable result — and connects it to live threat intelligence."*

**Action:** Let the Dashboard load and pause on the summary cards at the top.

**Point out:**
- **Total Assessments** — the platform tracks all assessments over time, not just the latest
- **Latest Risk Score: 60% — Medium Risk** — this amber badge is the headline; it tells you immediately where you stand
- **10 Frameworks Evaluated** — simultaneously, in one pass
- **Last Assessment date** — creates an audit trail showing when the evaluation was performed

---

## Act 2 — The Threat Alert: Proactive Intelligence (3 min)

> **This is the new opening hook — lead with it.**

**Action:** Point to the red **Threat Alert** card on the Dashboard.

> **Talking Point:**
> *"The first thing the dashboard does is tell you about threats that are active right now — and that match gaps in your specific assessment. This isn't a generic alert feed. These are threats from CISA, MITRE ATLAS, ENISA, and IBM X-Force that map directly to the controls this system failed."*

**Point out:**
- The **Critical** and **High** badge counts
- The top 3 threat titles listed under the alert
- *"These are real entries from CISA's Known Exploited Vulnerabilities feed and MITRE ATLAS. The platform matched them to this system's gaps automatically."*
- Click **"View all in Threat Intelligence →"** to transition to the next act

---

## Act 3 — Threat Intelligence: The Live Feed (4 min)

**Action:** Click **Threat Intelligence** in the top nav. Notice the **red badge** on the nav link — that's the critical threat count persisting across every page.

> **Talking Point:**
> *"The Threat Intelligence page aggregates AI-specific threats from seven sources: CISA KEV, MITRE ATLAS, the AI Incident Database, ENISA's annual threat landscape, IBM X-Force, Google Mandiant, and Verizon DBIR. The page opens filtered to Critical by default so you're always looking at the highest-priority items first."*

### What to Show

1. **Source status pills** — green pills show each active source with a live count. Point to the variety: live feeds (CISA, MITRE) and curated static sources (ENISA, Mandiant).

2. **Timestamp** — point to "Updated [date/time]". *"Data is cached for 8 hours, then re-fetched automatically. You can force a refresh at any time."*

3. **Assessment context — the key feature:**
   - Open the **"No assessment context"** dropdown in the filters row
   - Select **AI Sales Assistant — Enterprise Edition**
   - The amber **"Relevant to gaps (N)"** button appears
   - *"The platform just mapped every threat in the feed against the Non-Compliant and Partial controls in this assessment. These aren't random threats — they're the ones that exploit the specific gaps this system has."*
   - Click **"Relevant to gaps (N)"** to filter
   - Walk through 2–3 cards that have the amber **"Relevant to gaps"** badge

4. **The banner** — point to the amber context banner listing the gapped domains.
   - *"You can see exactly which domains are exposed — Security Controls, Human Oversight, Monitoring. Those are the domains with open controls, and these are the threats that target them."*

5. **A threat card in detail:**
   - Click through to one threat (external link icon)
   - *"Every card links to the primary source — CISA advisory, MITRE ATLAS technique, or the original report. Full provenance."*

> **Talking Point:**
> *"Most threat intel platforms give you a feed. This gives you a feed filtered to your posture. The difference is signal versus noise."*

---

## Act 4 — Evidence Matrix: The Methodology (3 min)

> **Talking Point:**
> *"Before we look at the full score, let me show you what's actually being evaluated — because credibility starts with the evidence model."*

**Action:** Click **Evidence Matrix** in the top nav.

### What to Show

1. **The breadth statement:** Point to the header — *"48 evidence items × 10 frameworks × 8 domains."* This is what's under the hood of the score.

2. **Filter by framework:** Click the **OWASP Agentic AI** pill.
   - *"Every column is a security domain. OWASP Agentic AI maps evidence requirements across all of them."*
   - Click **Clear** to reset.

3. **Filter by domain:** Click the **Security Controls & Threat Mitigations** domain pill.
   - *"This domain carries the highest weight in the scoring model — 20%. Every framework that has something to say about security controls is represented here."*
   - Click **Clear** to reset.

4. **Export:** Click **Export CSV**.
   - *"Customers can pull this matrix as a CSV to share with audit or legal teams."*

---

## Act 5 — The Tracker: How an Assessment Is Conducted (4 min)

> **Talking Point:**
> *"Now let's look at how an assessment gets populated. In practice, your automated discovery tool outputs a JSON file. The platform ingests it directly."*

**Action:** Click **Assessment Tracker** in the top nav, then click **New Assessment**.

### What to Show

1. **Import JSON button** — point to it in the header.
   - *"Your discovery tool runs against the AI system and produces a JSON file mapping each of the 48 evidence IDs to a compliance status and a finding note. You import that here. The form populates instantly — no manual entry."*
   - Click **Template** to download the schema.
   - *"This is the schema we publish to the discovery tool team. They output to this format, we ingest it."*

2. **Manual editing** — after import, show a dropdown and notes field.
   - *"The assessor can review and override any finding. The import is a starting point, not a locked result. Human judgment stays in the loop."*

3. **Click back to Dashboard**, then Edit the **AI Sales Assistant** assessment to show a completed example.

4. **Evidence table walkthrough — pick 2–3 items to narrate:**

   **Item 1 — Security Controls (sec-03): Sandboxing** *(Non-Compliant)*
   > *"The agent runs in a shared AWS ECS task with no process-level isolation. Non-Compliant — the frameworks are clear that agentic tool invocations should be sandboxed."*

   **Item 2 — Human Oversight (human-04): Transparency** *(Compliant)*
   > *"The chat widget displays an AI disclosure banner on every session, reviewed by legal. Required under EU AI Act. They got this one right."*

   **Item 3 — Monitoring (mon-06): SIEM integration** *(Non-Compliant)*
   > *"Agent events are not forwarded to the SIEM. Security ops has no visibility. This is one of the gaps the threat intelligence just flagged — and it's exactly why the Mandiant threat about AI recon appears as Relevant."*

---

## Act 6 — Risk Scores: The Findings (5 min)

**Action:** Click **Risk Scores** in the top nav, select the AI Sales Assistant assessment.

### What to Show

#### Overall Score Card

- Land on the **60% — Medium Risk** amber score card.

> **Talking Point:**
> *"60% is amber — Medium Risk. This org has done real governance work, but the operational security controls aren't there yet. The threshold for Low Risk is 75%. That 15-point gap is the remediation roadmap."*

#### Framework Scores Breakdown

**Top performers:**
- **CSA Agentic IAM — 73%** → *"IAM fundamentals are solid. Okta SSO, MFA, AWS Secrets Manager."*
- **EU AI Act — 70%** → *"Strong policy layer — risk register, acceptable use policy, CISO sign-off."*

**Biggest gaps:**
- **OWASP Agentic AI — 48%** → *"Most operationally demanding framework. Sandboxing, tool output validation, dynamic scoping — all gaps."*
- **MITRE ATLAS — 42%** → *"No adversarial testing, no anomaly detection, no explainability. If someone targets this agent, there's no detection capability."*

> **Talking Point:**
> *"The spread from 73% to 42% tells you this isn't uniform unprepared-ness. The governance is there. The runtime operational security is not. That's exactly where the threat intelligence is pointing too — the same gaps."*

#### Export

Click **Export CSV** — *"Drops straight into an executive report or remediation tracker."*

---

## Act 7 — Intelligence Layer: Threat-Driven Weight Recalibration (3 min)

**Action:** Scroll down to **Domain Weight Configuration** on the Scores page.

> **Talking Point:**
> *"The domain weights that drive scoring — Security Controls at 20%, Human Oversight at 18% — are based on published framework guidance. But threats move faster than frameworks. The Import Threat CSV feature lets you recalibrate those weights based on where attacks are actually concentrated right now."*

1. Click **Import Threat CSV** — import a CSV exported from the Threat Intelligence page.
2. Point to the amber preview values.
   - *"Amber values changed from the defaults. These reflect the current threat distribution — more weight to the domains under active attack."*
3. Click **Confirm Import**.
   - *"Every assessment now scores against these live-calibrated weights."*
4. Point to **Reset Defaults** — *"Always reversible."*

---

## Act 8 — Closing (2 min)

> **Talking Point:**
> *"What we've walked through today is the full lifecycle: discover → assess → score → connect to live threats. The platform tells you your risk posture across 10 frameworks, which specific controls are open, and which active threats in the wild target those exact gaps — proactively, on the dashboard, before you even open the threat feed.*
>
> *The output is an audit record: timestamped, scored, with assessor notes on every item, connected to the threat intelligence that was active at the time of the assessment.*
>
> *What AI systems in your environment would you want to run through this first?"*

---

## Quick Reference: Key Numbers for the Demo

| Metric | Value |
|--------|-------|
| Evidence items | 48 |
| Security frameworks | 10 |
| Security domains | 8 |
| Threat sources | 7 (CISA KEV, MITRE ATLAS, AIID, ENISA, IBM X-Force, Mandiant, Verizon DBIR) |
| Demo system overall score | 60% (Medium Risk) |
| Highest framework score | CSA Agentic IAM — 73% |
| Lowest framework score | MITRE ATLAS — 42% |
| Low Risk threshold | ≥ 75% |
| Medium Risk range | 50–74% |
| High Risk threshold | < 50% |

---

## Common Customer Questions

**"How are the framework weights decided?"**
> The default weights are calibrated to reflect the risk emphasis in published framework guidance — Security Controls is highest at 20%. You can override them using the threat CSV import, or manually reset to defaults.

**"How does the threat-to-assessment mapping work?"**
> Each threat has tags (e.g., `prompt-injection`, `credential-theft`, `autonomous-agents`). Each compliance domain has a set of tags that indicate exposure. The platform checks if any threat tag matches the tags for a domain that has Non-Compliant or Partial controls. If yes, the threat is flagged as relevant to that assessment.

**"How current is the threat intelligence?"**
> CISA KEV, MITRE ATLAS, and the AI Incident Database are fetched live and cached for 8 hours. ENISA, IBM X-Force, Mandiant, and Verizon DBIR are curated entries from their most recent published reports. Hit Refresh to force a live update at any time.

**"How long does an assessment take?"**
> With the discovery tool JSON import, the base data populates instantly. Human review and notes typically take 1–2 hours for a knowledgeable assessor. Without the tool, a full manual assessment takes 2–4 hours.

**"Can we assess multiple AI systems?"**
> Yes. The dashboard supports unlimited assessments across different systems with independent scoring and trend history per system.

**"What about fine-grained controls — can we add custom evidence items?"**
> The current evidence model is based on the published frameworks. Custom evidence items and domain customization are planned features. The 48 items cover the critical surface area that the major frameworks agree on.

**"What happens when a system scores below 50%?"**
> Flagged High Risk (red). The framework breakdown immediately shows which standards are driving the score down so the remediation path is clear. Re-run after remediations to track improvement.

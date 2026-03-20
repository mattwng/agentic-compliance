# Agentic AI Compliance Evaluator — Customer Demo Script

**Audience:** Security, Risk, or AI governance stakeholders at a prospect or customer organization
**Duration:** 20–30 minutes
**Goal:** Demonstrate how the platform surfaces compliance gaps across the major agentic AI security frameworks and shows how live threat intelligence can dynamically recalibrate risk priorities
**Pre-loaded demo:** "AI Sales Assistant — Enterprise Edition" at 60% Medium Risk

---

## Before You Start

- Open the app in a browser: `http://compliance.illuminait.io` (or `http://192.168.68.108:3005`)
- Have the threats CSV export ready: `~/Desktop/threats_export.csv`
- Land on the **Dashboard** page — this is your opening view

---

## Act 1 — Setting the Scene (2 min)

> **Talking Point:**
> *"One of the fastest-evolving challenges in AI security right now is that the frameworks for evaluating agentic AI systems are fragmented — you've got NIST AI RMF, EU AI Act, OWASP LLM Top 10, MITRE ATLAS, CSA Agentic IAM, and more. Most organizations are trying to track compliance across all of these in spreadsheets. This platform consolidates that into a single structured evaluation that produces a scored, auditable result."*

**Action:** Let the Dashboard load and pause on the summary cards at the top.

**Point out:**
- **Total Assessments** — the platform tracks all assessments over time, not just the latest
- **Latest Risk Score: 60% — Medium Risk** — this amber badge is the headline; it tells you immediately where you stand
- **10 Frameworks Evaluated** — simultaneously, in one pass
- **Last Assessment date** — creates an audit trail showing when the evaluation was performed

---

## Act 2 — Evidence Matrix: The Methodology (4 min)

> **Talking Point:**
> *"Before we look at the score, let me show you what's actually being evaluated — because credibility starts with the evidence model."*

**Action:** Click **Evidence Matrix** in the sidebar.

### What to Show

1. **The breadth statement:** Point to the header — *"48 evidence items × 10 frameworks × 8 domains."* This is what's under the hood of the score.

2. **Filter by framework:** Click the **OWASP Agentic AI** pill.
   - The table dims every row except that framework.
   - Walk across the columns: *"Every column is a security domain — Identity, Security Controls, Human Oversight. OWASP Agentic AI maps evidence requirements across all of them."*
   - Click **Clear** to reset.

3. **Filter by domain:** Click the **Security Controls & Threat Mitigations** domain pill.
   - *"This domain carries the highest weight in the scoring model — 20%. Every framework that has something to say about security controls is represented here: sandboxing, prompt injection defenses, output validation, adversarial ML."*
   - Click **Clear** to reset.

4. **The export:** Click **Export CSV**.
   - *"Customers can pull this matrix as a CSV to share with their audit or legal teams. It gives them the full evidence inventory with framework mappings pre-done."*

> **Talking Point:**
> *"The important thing here is that this isn't our opinion of what should be evaluated — these 48 items are derived directly from the published frameworks. NIST AI RMF, EU AI Act, Google SAIF. We've done the mapping work so you don't have to."*

---

## Act 3 — The Tracker: How an Assessment Is Conducted (5 min)

> **Talking Point:**
> *"Now let's look at how an assessment gets done. Our pre-loaded demo is an AI sales assistant — a customer-facing chatbot that helps sales reps qualify leads and pull pricing. Exactly the kind of system that's being deployed rapidly right now without a clear security evaluation process."*

**Action:** Click **Tracker** in the sidebar. Then click the **Edit** button on the "AI Sales Assistant — Enterprise Edition" row from the Dashboard, or navigate to `/tracker?assessmentId=<id>`.

### What to Show

1. **Assessment metadata:** Point to the System Name, Assessment Name, and Notes fields.
   - *"Every assessment is tied to a specific AI system and a specific review cycle. This one is a pre-deployment review for Q1 2025."*

2. **Progress bar:**
   - *"Out of 48 items, 48 have been rated. The progress bar gives the assessor a real-time completion signal."*

3. **Evidence table walkthrough — pick 3 items to narrate:**

   **Item 1 — Security Controls (sec-03): Sandboxing** *(Non-Compliant)*
   > *"The agent runs in a shared AWS ECS task with no process-level isolation. When it calls the CRM or generates email drafts, those happen in the same execution context. The assessor rated this Non-Compliant — the frameworks are clear that agentic tool invocations should be sandboxed."*

   **Item 2 — Human Oversight (human-04): Transparency to end users** *(Compliant)*
   > *"Here's a green — the chat widget displays an AI disclosure banner on every session, reviewed by legal. This is a required transparency control under EU AI Act. They got this one right."*

   **Item 3 — Governance (gov-01): AI risk register** *(Compliant)*
   > *"Risk register entry AIR-2025-003 was created, reviewed, and signed off by the CISO. This is the governance foundation — without it, nothing else in the assessment has organizational backing."*

4. **Filters:**
   - Use the **Domain** dropdown to filter to `Security Controls & Threat Mitigations`.
   - *"An assessor can work through one domain at a time, which is useful when you have a subject matter expert for each area."*
   - Clear the filter.

5. **Framework filter:**
   - Filter to `EU AI Act`.
   - *"If your primary concern is EU AI Act compliance — maybe you have European customers — you can scope the assessment to just those items. Same evidence data, different lens."*
   - Clear the filter.

> **Talking Point:**
> *"The notes field on every item is key. This isn't just a checkbox — it's an evidence record. 'How do we know this is Compliant? Here's the specific control, document, or test result.' That's what holds up in an audit."*

---

## Act 4 — Risk Scores: The Findings (6 min)

**Action:** Click **Calculate Scores** (or navigate to **Scores** in the sidebar and select the AI Sales Assistant assessment from the dropdown).

### What to Show

#### Overall Score Card

- Land on the **60% — Medium Risk** amber score card.

> **Talking Point:**
> *"60% puts this system in the Medium Risk zone. Amber. This organization has done real work — they have governance, their model provenance is documented, they understand what the AI is and where it came from. But the security controls and observability are not where they need to be before this system goes in front of customers."*

> *"The threshold is 75% for Low Risk. They're 15 points away. That gap is the roadmap."*

#### Framework Scores Breakdown

Scroll down to the **Framework Scores** bar chart. Walk through the top and bottom scores:

**Top performers:**
- **CSA Agentic IAM — 73%** → *"Identity and access are well-managed. Okta SSO, MFA, AWS Secrets Manager with rotation. The IAM fundamentals are there."*
- **EU AI Act — 70% / NIST AI 600-1 — 70%** → *"The governance frameworks score highest. Risk register, acceptable use policy, vendor assessments, change management. These are policy controls and this org has strong policy."*
- **NIST AI RMF — 66%** → *"Model provenance is strong — full model card, version pinning, red team results on file. NIST AI RMF rewards that."*

**Biggest gaps:**
- **OWASP Agentic AI — 48%** → *"OWASP Agentic AI is the most operationally demanding framework. It requires sandboxing, tool output validation, dynamic permission scoping, kill-switch with rollback. This system has gaps in all of those."*
- **NIST SP 800-207/A — 47%** → *"Zero Trust for AI. No microsegmentation on agent traffic, no runtime privilege reduction, no SIEM integration. Classic infrastructure security debt."*
- **MITRE ATLAS — 42%** → *"The adversarial ML framework. No adversarial testing, no anomaly detection, no explainability layer. If someone actively tries to abuse this agent, there's no detection and no forensic capability."*

> **Talking Point:**
> *"What's interesting here is the spread — 73% down to 42%. This organization isn't uniformly unprepared. They've invested in governance and identity. The gap is in the operational security layer — the runtime controls, the observability, the adversarial hardening. That tells you exactly where to focus."*

#### Show Trend (if multiple assessments exist)

Click **Show Trend** button.
- *"As assessments are conducted over time, the platform builds a compliance trend line. This is how you show the board that the risk posture is improving — or flag that it isn't."*

#### Export

Click **Export** (CSV button).
- *"Every assessment result is exportable to CSV for reporting. Framework scores and risk levels in a format that drops straight into an executive report or a remediation tracker."*

---

## Act 5 — The Intelligence Layer: Threat-Driven Weight Recalibration (6 min)

> **This is the differentiating moment of the demo.**

> **Talking Point:**
> *"Here's where this platform goes beyond a static checklist. The domain weights that drive the scoring model — Security Controls at 20%, Human Oversight at 18%, and so on — those defaults are based on published framework guidance. But the actual threat landscape changes. What if we could tie the weights directly to observed attacks against AI systems right now?"*

**Action:** Stay on the **Scores** page, scroll down to **Domain Weight Configuration**.

1. Point out the current weights as a bar chart.
   - *"Security Controls is currently weighted at 20% — the highest. But is that still right given what's happening in the threat landscape this week?"*

2. Click **Import Threat CSV**.
   - Select `~/Desktop/threats_export.csv`.
   - *"This is a live export from our AI threat intelligence feed — threats.illuminait.io. 236 threats aggregated from CISA, MITRE, CVE databases, and AI security research. Each threat has a severity rating: Critical, High, Medium, Low."*

3. Wait for the **amber preview** to appear.
   - Point to any domain that changed.
   - *"The platform reads through each threat's title, description, tags, and summary and maps it to the relevant security domain using keyword matching. Then it weights by severity — Critical threats count 4x more than Low threats. The result is a weight distribution that reflects where attacks are actually concentrated in the current threat landscape."*

4. Point to the amber values.
   - *"Amber values are weights that changed from the current configuration. These aren't just our opinion — they're derived from 236 real-world threat entries."*

5. Click **Confirm Import**.
   - *"Now every existing and future assessment scores against these recalibrated weights. If the threat data shows AI monitoring and observability are being actively exploited — that domain's weight goes up, and a system with gaps there takes a harder hit on its score."*

> **Talking Point:**
> *"Most compliance frameworks are updated annually at best. Threats move daily. The ability to recalibrate your compliance weights from live threat intelligence is what keeps the scoring model from becoming stale. You're not measuring against where risks were two years ago — you're measuring against where they are today."*

6. **Reset Defaults** button — point to it.
   - *"You can always reset back to the framework-guided defaults with one click. Nothing is permanent."*

---

## Act 6 — Starting a New Assessment (2 min, optional)

> **Use this section if the customer wants to see the full workflow from scratch.**

**Action:** Click **New Assessment** from the Dashboard.

1. Fill in System Name: *"Let's say we're evaluating an AI code review assistant."*
2. Fill in Assessment Name: *"Q2 2025 Initial Review"*
3. Show how the progress bar starts at 0 / 48.
4. Rate 2–3 items to show the real-time color coding (green/amber/red dropdown).
5. Show **Save** to persist a draft without calculating.
6. Show **Calculate Scores** to immediately produce a scored result.
   - *"You don't have to rate all 48 items before seeing a score. Rate 20 items, calculate, and you already have a directional view."*

---

## Act 7 — Closing (2 min)

> **Talking Point:**
> *"What we've walked through today is the full evaluation lifecycle for an agentic AI system. You intake a system, rate it against 48 evidence items derived from 10 major security and AI governance frameworks, get a scored result broken down by framework and domain, and then connect it to live threat intelligence to keep the weights current.*
>
> *The output is actionable: you know your overall risk posture, you know which frameworks you're strongest and weakest in, and you know which specific evidence items to remediate first. And every assessment creates an audit record — timestamped, scored, with assessor notes attached to every item.*
>
> *What AI systems in your environment would you want to run through this first?"*

---

## Quick Reference: Key Numbers for the Demo

| Metric | Value |
|--------|-------|
| Evidence items | 48 |
| Security frameworks | 10 |
| Security domains | 8 |
| Demo system overall score | 60% (Medium Risk) |
| Highest framework score | CSA Agentic IAM — 73% |
| Lowest framework score | MITRE ATLAS — 42% |
| Threat CSV rows | 236 threats |
| Low Risk threshold | ≥ 75% |
| Medium Risk range | 50–74% |
| High Risk threshold | < 50% |

---

## Common Customer Questions

**"How are the framework weights decided?"**
> The default weights are calibrated to reflect the risk emphasis in published framework guidance — Security Controls is highest at 20% because it appears in the most frameworks and carries the most controls. You can override them at any time using the threat CSV import, or manually reset to defaults.

**"How long does an assessment take?"**
> A thorough assessment with evidence notes takes 2–4 hours for a single AI system with a knowledgeable subject matter expert. A rapid pass — just statuses, no notes — can be done in under an hour. The filters let you divide the work by domain so different team members can own their area.

**"What happens when a system scores below 50%?"**
> The system is flagged High Risk (red). The framework score breakdown immediately shows which standards are driving the score down so the remediation path is clear. You can re-run the assessment after remediations to track progress.

**"Can we assess multiple AI systems?"**
> Yes. The dashboard supports unlimited assessments across different systems. The trend view and historical records are per-assessment, so each system has its own compliance trajectory.

**"Is this connected to threats.illuminait.io automatically?"**
> Currently the threat CSV is imported on-demand — you export from threats.illuminait.io and import here. An automated sync is on the roadmap.

**"What about fine-grained controls — can we add custom evidence items?"**
> The current evidence model is based on the published frameworks. Custom evidence items and domain customization are planned features. For now, the 48 items cover the critical surface area that the major frameworks agree on.

# Agentic AI Compliance Evaluator — Customer Demo Script

**Audience:** Security, Risk, or AI governance stakeholders at a prospect or customer organization
**Duration:** 40–50 minutes
**Goal:** Demonstrate how the platform surfaces compliance gaps using automated discovery, maps live threat intelligence to assessment findings, and proactively alerts on threats that match your specific risk posture
**Pre-loaded demo:** "AI Sales Assistant — Phase 3: Automated Complete Assessment" at ~65% Medium Risk

---

## Act Timing at a Glance

| Act | Topic | Time |
|-----|-------|------|
| 1 | Setting the Scene — Dashboard | 2 min |
| 2 | Threat Alert — Proactive Intelligence | 3 min |
| 3 | **Threat Intelligence — Pipeline + Posture Mapping** | **6 min** |
| 4 | Evidence Matrix — The Methodology | 3 min |
| 5 | **Automated Discovery Workflow — Phases 1/2/3** | **8 min** |
| 6 | Risk Scores — The Findings | 5 min |
| 7 | Threat-Driven Weight Recalibration | 3 min |
| 8 | **Topology Threat Map — Intel Meets Architecture** | **5 min** |
| 9 | Closing | 2 min |
| | **Total** | **~37–47 min** |

---

## Before You Start

- Open the app in a browser: `https://compliance.illuminait.io`
- Land on the **Dashboard** page — this is your opening view
- Confirm the red **Threat Alert** card is visible below the summary cards
- Have the four demo JSON files ready in your Downloads folder:
  - `demo-phase1-topology-scan.json`
  - `demo-phase2-cloudapi-scan.json`
  - `demo-phase3-automated-complete.json`
  - `demo-phase3b-full-audit.json`

---

## Act 1 — Setting the Scene (2 min)

> **Talking Point:**
> *"One of the fastest-evolving challenges in AI security right now is that the frameworks for evaluating agentic AI systems are fragmented — you've got NIST AI RMF, EU AI Act, OWASP LLM Top 10, MITRE ATLAS, CSA Agentic IAM, and more. Most organizations are trying to track compliance across all of these in spreadsheets. This platform consolidates that into a single structured evaluation that produces a scored, auditable result — and connects it to live threat intelligence."*

**Action:** Let the Dashboard load and pause on the summary cards at the top.

**Point out:**
- **Total Assessments** — the platform tracks all assessments over time, not just the latest
- **Latest Risk Score: ~65% — Medium Risk** — this amber badge is the headline; it tells you immediately where you stand
- **10 Frameworks Evaluated** — simultaneously, in one pass
- **Last Assessment date** — creates an audit trail showing when the evaluation was performed

---

## Act 2 — The Threat Alert: Proactive Intelligence (3 min)

> **This is the opening hook — lead with it.**

**Action:** Point to the red **Threat Alert** card on the Dashboard.

> **Talking Point:**
> *"The first thing the dashboard does is tell you about threats that are active right now — and that match gaps in your specific assessment. This isn't a generic alert feed. These are threats from CISA, MITRE ATLAS, ENISA, and IBM X-Force that map directly to the controls this system failed."*

**Point out:**
- The **Critical** and **High** badge counts
- The top 3 threat titles listed under the alert
- *"These are real entries from CISA's Known Exploited Vulnerabilities feed and MITRE ATLAS. The platform matched them to this system's gaps automatically."*
- Click **"View all in Threat Intelligence →"** to transition to the next act

---

## Act 3 — Threat Intelligence: How It's Gathered and Why It's Different (6 min)

**Action:** Click **Threat Intelligence** in the top nav. Notice the **red badge** on the nav link — that's the critical threat count persisting across every page.

> **Talking Point:**
> *"Most security platforms give you a threat feed from one or two sources and leave you to figure out what's relevant. This platform aggregates from seven AI-specific sources — and then automatically connects what it finds to your specific compliance posture. Let me show you how that works."*

### Part A — The Intelligence Pipeline

**Action:** Point to the source status pills at the top of the page.

> **Talking Point:**
> *"The seven sources split into two tiers: live and curated."*

**Live sources (fetched automatically, cached 1 hour):**
- **CISA KEV** — the U.S. government's Known Exploited Vulnerabilities catalog. If a CVE is in this list, it has been confirmed exploited in the wild. *"This is the highest-urgency signal — not theoretical risk, confirmed exploitation."*
- **MITRE ATLAS** — the adversarial ML companion to ATT&CK. Covers AI-specific techniques: prompt injection, model inversion, data poisoning, supply chain compromise. *"Where ATT&CK covers enterprise IT, ATLAS covers AI systems specifically."*
- **AI Incident Database** — a structured record of real-world AI failure incidents. Runaway agents, poisoned knowledge bases, bias-driven decisions with real consequences. *"These aren't CVEs — they're case studies. Pattern matching against what's already happened."*

**Curated static sources (updated from published annual reports):**
- **ENISA** — the EU Agency for Cybersecurity's AI threat landscape
- **IBM X-Force** — threat actor TTPs and active campaign intelligence
- **Mandiant** — real-time threat group activity and AI-targeting campaigns
- **Verizon DBIR** — statistical breach patterns across industries

*"The live sources catch what's emerging right now. The curated sources provide the broader threat landscape context — attacker behavior, statistical baselines, geopolitical campaigns."*

**Action:** Point to the timestamp and the **Refresh** button.

> *"On first load, the platform fetches CISA, MITRE, and AIID live — takes about 30–60 seconds. After that, it caches for one hour and re-fetches in the background. You can force a refresh at any time. The static sources load instantly — they're always available even before the live fetch completes."*

**Action:** Point to the severity filter chips — show the counts by severity.

> *"Everything is pre-classified by severity. Critical and High are the default view because that's where your attention should be. But the full feed is always one click away."*

---

### Part B — Mapping Threats to Your Assessment Posture

> **Talking Point:**
> *"Here's where it goes from intelligence to action. The feed is valuable on its own — but the real capability is connecting these threats to your specific compliance gaps."*

**Action:** Open the **"No assessment context"** dropdown, select **AI Sales Assistant — Phase 3: Automated Complete Assessment**.

The amber **"Relevant to gaps (N)"** button appears.

> *"The platform just did something that would take an analyst hours to do manually. It looked at every Non-Compliant and Partial control in that assessment, identified which security domains those gaps live in, and cross-referenced every threat in the feed against those domains. The result is a filtered view of exactly which active threats exploit the specific weaknesses in this system."*

**Action:** Click **"Relevant to gaps (N)"** to filter.

**Walk through these specific cards:**

1. **A MITRE ATLAS prompt injection card** — *"This technique maps to the Security Controls domain — prompt injection defenses are a Partial in this assessment. The platform flagged it because ATLAS AML.T0051 targets the exact gap."*

2. **A CISA KEV card** (if present) — *"This CVE is actively exploited. The platform connected it to the supply chain documentation control — arch-06 — which is also incomplete. An assessor reviewing this would know: patch this CVE, and close the supply chain documentation gap in the same remediation sprint."*

3. **An AI Incident Database card** — *"This isn't a CVE — it's a real incident. An AI email agent entered a runaway loop and sent mass unsolicited messages. That incident maps to the Human Oversight domain, where this assessment has open HITL controls. Same failure pattern, different system."*

**Action:** Point to the amber context banner.

> *"The banner names the gapped domains driving these results — Security Controls, Human Oversight, Monitoring. That's the attack surface the threats are targeting. Now we're going to see those same domains rendered on the actual system topology."*

**Action:** Click one threat's external link icon.

> *"Every card links to the primary source — CISA advisory, MITRE ATLAS technique page, or the original incident record. Full provenance, one click."*

> **Closing Talking Point for Act 3:**
> *"What we've built here is a closed loop. The intelligence feed knows what's being attacked in the wild. The assessment knows where this specific system is vulnerable. The mapping step connects them. The output is a prioritized remediation list tied to real active threats — not a generic checklist."*

---

## Act 4 — Evidence Matrix: The Methodology (3 min)

> **Talking Point:**
> *"Before we look at how the assessment gets populated, let me show you what's actually being evaluated — because credibility starts with the evidence model."*

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

## Act 5 — The Automated Discovery Workflow (8 min)

> **This is the new centerpiece of the demo — the three-phase automated workflow.**

**Action:** Click **Assessment Tracker** in the top nav, then click **New Assessment**.

> **Talking Point:**
> *"Here's where the workflow changes the conversation. Historically, a compliance assessment like this takes 2–4 hours of manual assessor time. What we're about to show you replaces most of that with automated discovery — your infrastructure doing the work."*

### Phase 1 — AI Topology Scan

**Action:** Point to the **Discovery Phases** callout bar and click it to expand.

> **Talking Point:**
> *"The platform recognizes three discovery phases. Phase 1 is the AI Topology Scan — an automated graph traversal of your deployed AI system. It maps agent nodes, tool edges, memory stores, and trust boundaries at runtime."*

**Point out the callout:**
- *"Phase 1 covers 30 of the 48 controls with automated or signal-level confidence. It runs in minutes with no human input."*

**Action:** Click **Import JSON**, select `demo-phase1-topology-scan.json`.

> *"Watch what happens."*

The form populates with 30 responses.

- Point to the **assessment name** auto-filled: "AI Sales Assistant — Phase 1: AI Topology Scan"
- Click the **⬡ AI Topology** tab in the source filter. *"These are the controls the topology scan covers. Each one has a discovery chip showing whether it was auto-confirmed or detected at signal strength — meaning topology sees it, but needs a second source to verify."*
- Click on a row to show the note: *"'Topology scan confirmed agent identity tokens on all 3 sub-agent nodes. Node ID: topology://... Full IAM role bindings require Cloud API scan.' — the system already knows what the next step needs to verify."*

> *"30 controls populated. Zero manual entry. But we're not done — topology only sees what's running. The cloud layer tells us how it's configured."*

---

### Phase 2 — Cloud Infrastructure API Scan

**Action:** Click **Import JSON** again, select `demo-phase2-cloudapi-scan.json`.

The form updates — now 40 controls are populated. Point to the **banner**: *"Imported 40/48 responses."*

- Click the **☁ Cloud API** tab. *"Cloud APIs enumerate IAM roles, Secrets Manager, VPC policies, CloudWatch, S3 — the configuration layer that topology can't see."*
- Find a control that was `Partial` after Phase 1 and is now `Compliant` — *"See how this control upgraded? Topology detected the agent identity token. The Cloud API scan confirmed the IAM role ARN, the rotation policy, and the least-privilege simulation. Two sources, one result."*
- Point to a `Partial` note from Phase 2: *"Some controls are still partial after both scans — they've told us what they can see, and they're pointing at exactly what a human needs to verify."*

> *"40 controls. Fully automated. Fully scoreable. No assessor time spent yet."*

---

### The Manual Input Controls — Known and Bounded

**Action:** Click the **✎ Manual Input (8)** tab.

> *"Here's what I want to show you: the platform is explicit about what it can't automate. These 8 controls require human-authored documentation — governance docs, red-team results, conformity assessments."*

**Point out the amber badge** on each row: `⚑ Manual input required for full audit`

> *"This is a feature, not a limitation. The platform knows exactly what's out of scope for automated discovery — and it tells you. Your assessor isn't hunting through 48 controls wondering what's left. They open this tab and see 8 items with precise descriptions of what's needed. That's a scoped, bounded task."*

> *"Critically — these 8 controls do not block scoring. Let me show you."*

---

### Phase 3 — Automated Complete Assessment

**Action:** Clear the current draft (refresh the page) and import `demo-phase3-automated-complete.json`.

> *"This is the Phase 3 automated complete. All 40 automated controls in a single file — the combined output of both scans. No manual input."*

**Action:** Click **Calculate Scores**.

You land on the **Scores** page with a full scored assessment.

> *"A complete, scored, 40-control compliance assessment. Zero human input required to get here. The 8 manual controls are tracked as outstanding — they'll surface when the assessor is ready — but they don't block the result."*

---

### Optional: The Full Audit (30 seconds)

> *"For customers who need a complete 48-control audit record — governance docs and all — we have a fourth file."*

- Mention `demo-phase3b-full-audit.json` briefly — *"This includes governance document references, red-team notes, conformity assessment status. The automated baseline plus the human layer. This is what goes to an auditor."*

---

## Act 6 — Risk Scores: The Findings (5 min)

**Action:** You should already be on the **Risk Scores** page from the Calculate Scores action above.

### What to Show

#### Overall Score Card

- Land on the **~65% — Medium Risk** amber score card.

> **Talking Point:**
> *"65% is amber — Medium Risk. This org has done real governance work, but the operational security controls aren't there yet. The threshold for Low Risk is 75%. That 10-point gap is the remediation roadmap — and the platform has already told us which 8 manual controls, if addressed, could close it."*

#### Framework Scores Breakdown

**Top performers:**
- **CSA Agentic IAM — ~73%** → *"IAM fundamentals are solid. Okta SSO, MFA, AWS Secrets Manager — all confirmed by Cloud API scan."*
- **EU AI Act — ~70%** → *"Strong policy layer — the automated scan found the change management pipeline and audit trail. The gap is the conformity assessment documentation, which is one of the 8 manual controls."*

**Biggest gaps:**
- **OWASP Agentic AI — ~48%** → *"Most operationally demanding framework. Sandboxing, tool output validation, dynamic permission scoping — these require runtime configuration that the scans found partially implemented."*
- **MITRE ATLAS — ~42%** → *"No adversarial testing results, incomplete anomaly detection, no explainability outputs. If someone targets this agent, there's limited detection capability."*

> **Talking Point:**
> *"The spread tells you this isn't uniform unpreparedness. The governance layer and the IAM layer are in decent shape — the automated scans confirmed that. The runtime operational security is where the gaps are. That's also exactly where the threat intelligence is pointing."*

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

## Act 8 — Topology Threat Map: Where Intel Meets Architecture (5 min)

> **This act closes the loop from Act 3. The threats you just showed in the intel feed are now rendered on the actual system architecture. Do not skip this act.**

**Action:** Click **Topology Map** in the nav.

> **Talking Point:**
> *"Everything we saw in the threat feed — CISA KEV CVEs, MITRE ATLAS techniques, AI Incident Database patterns — those threats don't exist in the abstract. They target specific components of a deployed AI system. This view puts them back where they belong: on the architecture."*

**Action:** Let the map load. Point to the canvas zones left to right.

> *"Five zones, left to right: Human Interface, Orchestration Layer, AI Inference and Tools, External Integrations, Internal Data. This is the runtime topology of the AI Sales Assistant — the same graph the Phase 1 topology scan traversed to populate the compliance assessment."*

**Point out the edge colors:**
> *"Red dashed edges are threatened connections — the platform has flagged them based on the threat intelligence we just reviewed. Gray edges are clean. You can see immediately that the connections from the orchestrator outward are almost entirely red — the AI agent is the highest-exposure component in the graph."*

---

### Walking the Nodes: Intelligence → Architecture → Compliance Control

**Action:** Click the **AI Sales Agent** node (Critical — red ring).

> *"This is the orchestrator. Critical severity — three active threat findings."*

Walk through the side panel findings one by one:

**Finding 1 — CISA KEV (CVE-2024-3568):**
> *"This is the same CVE class we saw in the threat feed a moment ago. LangChain 0.1.20 is in the Known Exploited Vulnerabilities catalog — arbitrary code execution via the tool call handler. The compliance control it maps to is arch-06: supply chain documentation. That control is incomplete in this assessment — the automated scan found the container image but no SBOM. The threat is active, the control is open, and the topology shows you exactly which component is the entry point."*

**Finding 2 — MITRE ATLAS AML.T0051 (Prompt Injection):**
> *"Prompt injection on the orchestrator's input pipeline — the same ATLAS technique we flagged as relevant to this assessment in the threat feed. The compliance control: sec-01, prompt injection defenses. The automated cloud API scan found the WAF and request validator, but the topology shows the orchestrator itself as the target. Two views of the same gap."*

**Finding 3 — MITRE ATLAS AML.T0010 (Supply Chain Compromise):**
> *"The SDK dependency edge from the agent to the OpenAI API is an active supply chain attack surface. Same domain — arch-06. Topology surfaces it as a structural risk on the graph rather than a configuration finding."*

---

**Action:** Click the **MCP Tool Server** node (High — orange ring).

> *"The tool server is where the agent's actions hit the real world — CRM writes, emails, web searches. Two findings here:"*

**Finding 1 — Tool Hijacking via Prompt Injection:**
> *"A compromised LLM output can trigger unauthorized tool invocations. Control: sec-06, insecure plugin/tool use mitigations. The cloud API scan confirmed schema validation is active — but the topology shows the attack path clearly. Prompt injection on the orchestrator flows downstream to every tool the MCP server controls."*

**Finding 2 — AI Incident Database AIID #642:**
> *"This is the runaway email loop incident we mentioned in the threat feed. An AI agent entered a loop and sent mass unsolicited messages via a transactional email API. This architecture — MCP server with an email tool — is an exact pattern match. The relevant control is human-01: HITL checkpoints on high-risk actions. The automated assessment found the Step Functions HITL gate — but incidents like AIID #642 are why that control exists."*

---

**Action:** Click the **Salesforce CRM** node (High).

> *"The CRM integration is high severity for two distinct reasons — point to both:"*

- **IBM X-Force finding:** *"FIN7, an active threat actor group, is targeting Salesforce OAuth flows for credential theft. This is live campaign intelligence from the IBM X-Force feed. The compliance control is iam-01, agent identity mechanisms — confirmed by the Cloud API scan, but highlighted here because the CRM integration is the specific target."*
- **Prompt Injection via inbound data:** *"CRM records can contain adversarial content. When the agent reads a contact record to draft an email, any embedded instruction in that record gets processed by the LLM. The attack flows from the CRM inward — the threat map makes that bidirectional risk visible."*

---

**Action:** Step back from the detail panel and point to the full canvas.

> **Closing Talking Point for Act 8:**
> *"This is the connection the platform makes that no other tool makes. The threat intelligence feed knows what's being exploited. The compliance assessment knows which controls are open. The topology map shows you where those open controls live in your actual running system — which component, which connection, which attack path. You're not looking at a spreadsheet of findings. You're looking at your architecture with the threat landscape overlaid on it.*
>
> *And the topology scan — Phase 1 of the automated discovery workflow — is what built this graph. It traversed these nodes at runtime. So the same scan that populated 30 compliance controls is also the data model behind this threat map."*

---

## Act 9 — Closing (2 min)

> **Talking Point:**
> *"What we've walked through today is a workflow that didn't exist before. Three automated scans — topology graph traversal, cloud infrastructure API enumeration — and 40 of 48 compliance controls populate themselves. The platform tells you which 8 still need human input and exactly what those 8 need. You get a scored, auditable compliance result in the time it takes to run two discovery scans.*
>
> *The full audit path — adding the 8 manual controls — gives you a complete 48-control record ready for an auditor, a board, or a regulator. And the threat intelligence layer connects your compliance posture to what's actively being exploited right now.*
>
> *What AI systems in your environment would you want to run through this first?"*

---

## Quick Reference: Key Numbers for the Demo

| Metric | Value |
|--------|-------|
| Evidence items (total) | 48 |
| Automated via topology scan (Phase 1) | 30 |
| Automated via cloud API scan (Phase 2) | 40 |
| Require manual input | 8 |
| Security frameworks | 10 |
| Security domains | 8 |
| Threat sources (total) | 7 |
| — Live (auto-fetched, 1hr cache) | CISA KEV, MITRE ATLAS, AI Incident Database |
| — Curated static (published reports) | ENISA, IBM X-Force, Mandiant, Verizon DBIR |
| Topology nodes in demo system | 9 (across 5 architecture zones) |
| Topology edges (total / threatened) | 8 / 7 |
| Demo system automated score | ~65% (Medium Risk) |
| Low Risk threshold | ≥ 75% |
| Medium Risk range | 50–74% |
| High Risk threshold | < 50% |

---

## Demo File Reference

| File | Controls | Use in demo |
|------|----------|-------------|
| `demo-phase1-topology-scan.json` | 30 | Show Phase 1 graph traversal populating topology controls |
| `demo-phase2-cloudapi-scan.json` | 40 | Show Phase 2 cloud API scan merging and upgrading Phase 1 results |
| `demo-phase3-automated-complete.json` | 40 | Single-file automated complete — score without any manual input |
| `demo-phase3b-full-audit.json` | 48 | Full audit with all 8 manual controls completed — auditor-ready |

---

## Common Customer Questions

**"Where does the threat intelligence come from? Is it really live?"**
> Three sources are fetched live on demand: CISA's Known Exploited Vulnerabilities API, MITRE ATLAS (adversarial ML techniques), and the AI Incident Database. These are cached for one hour and refreshed automatically. Four additional sources — ENISA AI threat landscape, IBM X-Force, Mandiant, and Verizon DBIR — are curated static datasets derived from their most recent published annual reports. Static sources load instantly even before live fetches complete, so the feed is never empty. The live/static split is visible on the source status pills at the top of the Threat Intelligence page.

**"How does the threat-to-topology mapping work?"**
> The Topology Threat Map is a static demonstration of the reference AI Sales Assistant architecture with threat findings pre-annotated on each node. In production, the topology scan output (Phase 1 of the discovery workflow) generates the node and edge graph — each node corresponds to a deployed component, and threat findings from the live intel feed are matched to those nodes based on component type, technology stack, and the compliance controls associated with each node. The result is the same threat intelligence you see in the feed, anchored to the specific components of the running system rather than displayed as an abstract list.

**"How does the automated discovery work technically?"**
> The topology scan performs runtime graph traversal of the deployed AI system — it maps agent containers, tool API edges, memory stores, and trust boundaries using the system's own telemetry. The cloud API scan runs against AWS (or equivalent) APIs: IAM, Secrets Manager, VPC, CloudWatch, ECR. Both scans output a JSON file in the standard import format. The platform ingests them in any order and merges results.

**"What are the 8 manual controls?"**
> They're the controls that require human-authored documentation that no automated scan can produce: system architecture diagrams (`arch-01`), AI risk register (`gov-01`), acceptable use policy (`gov-02`), EU AI Act risk classification (`gov-03`), conformity assessment (`gov-04`), incident response plan (`gov-06`), adversarial ML test results (`sec-05`), and bias/red-team results (`model-05`). The platform surfaces them in the Manual Input filter tab with the exact evidence description of what's needed.

**"Do the 8 manual controls affect scoring if not completed?"**
> No. The scoring engine excludes controls with no response. A 40-control automated assessment scores correctly across all 10 frameworks. The manual controls are additive — adding them can only improve the score, never block it.

**"How are the framework weights decided?"**
> The default weights are calibrated to reflect the risk emphasis in published framework guidance — Security Controls is highest at 20%. You can override them using the threat CSV import, or manually reset to defaults.

**"How does the threat-to-assessment mapping work?"**
> Each threat has tags (e.g., `prompt-injection`, `credential-theft`, `autonomous-agents`). Each compliance domain has a set of tags that indicate exposure. The platform checks if any threat tag matches the tags for a domain that has Non-Compliant or Partial controls. If yes, the threat is flagged as relevant to that assessment.

**"How current is the threat intelligence?"**
> CISA KEV, MITRE ATLAS, and the AI Incident Database are fetched live and cached for one hour. ENISA, IBM X-Force, Mandiant, and Verizon DBIR are curated entries from their most recent published reports. Hit Refresh to force a live update at any time.

**"How long does a full assessment take?"**
> The automated portion — topology scan + cloud API scan + import — takes minutes. Review of the 40 automated findings with assessor notes typically adds 30–60 minutes for a knowledgeable reviewer. The 8 manual controls require additional time to gather documentation — typically 2–4 hours of document collection, not assessment work. The platform tells you exactly what documents are needed so there's no hunting.

**"Can we assess multiple AI systems?"**
> Yes. The dashboard supports unlimited assessments across different systems with independent scoring and trend history per system.

**"What about fine-grained controls — can we add custom evidence items?"**
> The current evidence model is based on the published frameworks. Custom evidence items and domain customization are planned features. The 48 items cover the critical surface area that the major frameworks agree on.

**"What happens when a system scores below 50%?"**
> Flagged High Risk (red). The framework breakdown immediately shows which standards are driving the score down so the remediation path is clear. Re-run after remediations to track improvement.

**"What if we only have the topology scan and not the cloud API scan yet?"**
> Import Phase 1 and the platform scores against the 30 controls it covers. You get a partial but real assessment — scored, timestamped, with notes on what the cloud scan will add. The platform never forces you to have a complete picture before giving you a result.

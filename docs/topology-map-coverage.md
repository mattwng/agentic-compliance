# Evidence Matrix — AI Services Topology/Map Coverage Analysis

> How much of the 48-control compliance assessment can be auto-populated from an AI Services Topology/Map (agent inventory, model connections, tool graphs, data flows, orchestration relationships, and pipeline structure).
>
> Generated: 2026-03-20

---

## Question

How much of the JSON import can be answered with an AI Services Topology / Map?

---

## What an AI Services Topology/Map Contains

```
Agent inventory       → frameworks (LangChain, AutoGen, CrewAI), runtime environments
Model connections     → which LLM each agent calls, API endpoints, model IDs/versions
Tool/function graph   → every tool each agent can invoke, call patterns
Agent-to-agent graph  → orchestrator → sub-agent relationships, message passing
Memory topology       → vector stores, knowledge bases, short/long-term context stores
Data connections      → what DBs, S3 buckets, APIs each agent reads/writes
Input/output pipeline → validation layers, filters, guardrails in the processing chain
Identity surface      → which credentials/service accounts each agent uses
Runtime placement     → container, lambda, pod — where each agent runs
```

---

## Answer: ~60% of the JSON — but a different 60% than cloud infrastructure APIs

| Tier | Controls | % |
|------|---------|---|
| **Auto** — topology directly answers | 14 | 29% |
| **Signal** — topology provides strong evidence, human validates | 16 | 33% |
| **Limited** — topology has little to offer | 18 | 38% |

> **Key insight:** The AI Topology Map and cloud infrastructure APIs are **complementary, not overlapping**.
> Infrastructure APIs are strong on IAM, monitoring config, and data classification.
> The topology map is strong on architecture, model identity, tool inventory, and pipeline structure —
> the controls where infrastructure APIs previously produced zero signal (the Architecture domain was 0% auto from cloud APIs alone).

---

## Where Topology is the Primary Source (14 Auto Controls)

These controls are answered almost entirely by reading the topology map — cloud APIs cannot provide this:

| ID | Control | What topology provides |
|----|---------|----------------------|
| `arch-01` | System architecture diagrams | Topology map **is** the diagram — auto-generates it |
| `arch-02` | Agent topology (single vs multi-agent) | Directly visible: agent count, orchestration relationships |
| `arch-03` | Tool/function inventory | Every tool node in the graph with call frequency |
| `arch-04` | Agent memory architecture | Memory nodes: Redis TTL, vector store index, DynamoDB table |
| `arch-05` | Inter-agent communication protocols | Edge types in the graph: REST, gRPC, message queue, mTLS |
| `arch-06` | Supply chain (model providers, SDKs) | Model provider nodes + SDK dependency edges |
| `model-01` | Model cards | Model nodes identified → model card auto-fetched from provider API |
| `model-03` | Fine-tuning detection | Base model vs fine-tuned model node properties |
| `model-04` | Model versioning | Model version pinned in every agent→model edge |
| `sec-01` | Prompt injection defenses | Input validation layer visible as a pipeline node |
| `sec-02` | Output validation controls | Output filter/guardrail nodes in processing pipeline |
| `sec-06` | Plugin/tool use mitigations | Validation nodes between agent and tool call edges |
| `human-01` | HITL checkpoints | Approval gate nodes in the agent workflow graph |
| `human-03` | Autonomous action scope limits | Guardrail nodes, rate limit annotations on tool edges |

---

## Where Topology Adds Strong Signal (16 Signal Controls)

Topology provides evidence but a human validates completeness:

| ID | Control | What topology surfaces |
|----|---------|----------------------|
| `iam-01` | Agent identity mechanisms | Which credential type each agent uses (token, cert, API key) |
| `iam-03` | Privilege inventory | What resources each agent connects to → cross-reference with IAM policies |
| `iam-05` | Secrets management | Which secret store each agent references (Vault, Secrets Manager) |
| `model-02` | Training data provenance | Model provider identified → known training data policies can be referenced |
| `model-06` | Model access controls | Access points to the model endpoint visible in the graph |
| `sec-03` | Sandboxing and isolation | Runtime node type (container, lambda) → isolation posture inferred |
| `sec-04` | Network segmentation | Network edges between components → segmentation inferred |
| `sec-07` | Sensitive data exposure controls | Exactly which data sources each agent connects to |
| `human-02` | Override and kill-switch | Control plane connection (kill-switch endpoint node) |
| `human-05` | Escalation paths | Escalation routing nodes (Slack, PagerDuty edges) |
| `mon-01` | Agent action logs | Log sink nodes visible (CloudWatch, Datadog, LangSmith edges) |
| `mon-03` | Anomaly detection coverage | Monitoring tool connections in the graph |
| `mon-05` | Explainability / interpretability | Tracing framework nodes (LangSmith, OpenTelemetry) |
| `mon-06` | SIEM / SOAR integration | SIEM event forwarding edges |
| `data-02` | Data minimization evidence | Exactly what data nodes each agent reads — minimization directly visible |
| `data-05` | Cross-border data transfer controls | Geographic placement of all nodes → cross-border flows visible |

---

## Where Topology Has Little Value (18 Controls)

These require human identity systems, governance documents, test results, or storage configuration — none of which live in the AI topology layer:

| Domain | Controls | Why topology can't help |
|--------|---------|------------------------|
| Identity, Access & Privilege | `iam-02`, `iam-04`, `iam-06` | Human MFA, token expiry, revocation policies — identity provider territory |
| AI Model & Training Provenance | `model-05` | Bias/red-team test results — require running tests |
| Security Controls | `sec-05` | Adversarial ML controls — require security testing |
| Human Oversight & Control | `human-04` | User-facing disclosure — UI/UX layer |
| Governance, Risk & Policy | `gov-01`–`gov-07` (6 of 7) | Documents, legal classifications, policies — not in infrastructure |
| Monitoring, Logging & Observability | `mon-02`, `mon-04` | Immutable log config, drift thresholds — storage/monitoring APIs |
| Data Governance & Privacy | `data-01`, `data-03`, `data-04` | Classification labels, PII compliance, retention rules — data catalog/DLP |

---

## Combined Coverage: Topology + Cloud Infrastructure APIs

When combined with the cloud infrastructure API analysis (see `discovery-api-mapping.md`), the two sources are strongly complementary:

| Source | Strongest domains | Controls covered |
|--------|------------------|-----------------|
| AI Services Topology | Architecture, models, tools, pipelines | 30 (Auto or Signal) |
| Cloud Infrastructure APIs | IAM, monitoring config, data classification, network | 41 (Auto or Signal) |
| **Combined** | **Everything except governance docs and test outcomes** | **~44 of 48 (92%)** |
| Permanently manual | Gov docs, EU AI Act classification, bias/adversarial testing | **4–7 controls** |

### The 4 Controls No Automation Can Ever Fully Answer

These require human expertise by definition — no combination of discovery tools changes this:

| Control | Why |
|---------|-----|
| `gov-03` EU AI Act risk classification | Legal determination requiring regulatory counsel |
| `gov-04` Conformity assessment / CE marking | Formal certification process |
| `model-05` Bias, fairness, and red-team testing | Requires running tests and expert interpretation |
| `sec-05` Adversarial ML controls | Requires security testing against specific attack vectors |

---

## Discovery Tool Design: Three-Phase Architecture

The combined analysis across both topology and cloud APIs suggests a natural three-phase product design:

### Phase 1 — AI Services Topology Scan
*Run first — establishes the AI layer map*

- Enumerate all AI agents, models, tools, memory stores, and data connections
- Auto-fill the 14 Architecture + pipeline controls (`arch-*`, `sec-01`, `sec-02`, `sec-06`, `human-01`, `human-03`)
- Identify model providers → fetch model cards, version pins, supply chain deps
- Output: topology graph + partial JSON with all `arch-*` and pipeline controls populated

### Phase 2 — Cloud Infrastructure API Scan
*Run second — fills IAM, monitoring, data, and network controls*

- Query IAM APIs (AWS, Okta, Entra ID) → fill `iam-*` controls
- Query logging/monitoring APIs (CloudTrail, Datadog, Splunk) → fill `mon-*` controls
- Query data APIs (Macie, Lake Formation, S3 lifecycle) → fill `data-*` controls
- Query network APIs (Security Groups, NetworkPolicy) → fill `sec-03`, `sec-04`, `sec-07`
- Output: merged JSON with ~40+ controls at Compliant/Partial status with evidence notes

### Phase 3 — Guided Human Review
*Assessor reviews pre-populated form, validates Signal controls, completes Manual controls*

- 16 Signal controls: reviewer sees what was detected, upgrades Partial → Compliant after validation
- 7 Manual controls: reviewer prompted with specific document requests:
  - `gov-01` → "Attach AI risk register (owner, last reviewed date, risk count)"
  - `gov-02` → "Attach Acceptable Use Policy (version, approval date)"
  - `gov-03` → "Provide EU AI Act risk classification determination"
  - `gov-04` → "Provide conformity assessment status or planned timeline"
  - `gov-06` → "Attach Incident Response Plan (AI-specific scenarios coverage)"
  - `model-05` → "Attach bias/fairness test results and red-team report"
  - `sec-05` → "Attach adversarial ML testing results (model inversion, poisoning, evasion)"

**Outcome:** A full 48-control assessment completed in ~30 minutes of human review time, with machine-collected evidence notes for every auto-detected control.

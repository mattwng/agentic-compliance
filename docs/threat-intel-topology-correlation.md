# Threat Intelligence → AI Topology Vulnerability Correlation

> Can the Threat Intelligence gathering highlight security vulnerabilities in the AI Inventory and AI Map, and if so how would it work?
>
> Generated: 2026-03-20

---

## Answer

Yes — and this is one of the most powerful capabilities possible. The threat intelligence sources the platform already aggregates are structured specifically to do this. The AI Inventory/Map exposes **what exists** (components, versions, connections, node types). Threat intelligence describes **what attackers do to things like that**. Joining the two produces a vulnerability heat map of the topology — not just compliance gaps, but active threat exposure per node.

---

## Five Correlation Mechanisms

### 1. CVE Matching Against Component Versions
**Source:** CISA KEV

The inventory contains component versions — `langchain==0.1.20`, `openai-sdk==1.3.8`, `torch==2.1.0`, `python:3.11-slim` base image. CISA KEV is a database of CVEs being actively exploited in the wild, filtered for AI/ML components.

```
Inventory node:  LangChain 0.1.20
                 ↓
CISA KEV lookup: CVE-2024-XXXXX — Arbitrary code execution via tool call handler
                 ↓
Output:          ⚠ CRITICAL — This tool orchestration layer has a known exploited CVE
```

Every component node in the topology gets scanned against the KEV feed. Nodes running unpatched AI/ML library versions light up immediately. This is the most direct correlation — no inference required, just a version string match.

---

### 2. MITRE ATLAS Technique Mapping Against Node Types
**Source:** MITRE ATLAS

ATLAS describes adversarial ML attack techniques. Each technique targets a **specific type of node** in the topology. The mapping is structural — you don't need a CVE, just a node type:

| ATLAS Technique | Targets this topology node |
|----------------|--------------------------|
| Prompt Injection (AML.T0051) | LLM input pipeline node |
| Model Inversion (AML.T0024) | Model inference endpoint |
| Data Poisoning (AML.T0020) | Vector store / training data connection |
| Supply Chain Compromise (AML.T0010) | Model provider edge, SDK dependency |
| Exfiltration via Inference API (AML.T0040) | Any internet-exposed model endpoint |
| Adversarial Examples (AML.T0043) | Computer vision / classification model nodes |
| Spearphishing for Model Access (AML.T0012) | Agent identity / credential nodes |

The topology map defines node types. ATLAS defines which techniques apply to each type. The join is automatic — every node in the map gets a list of applicable ATLAS techniques, severity-weighted by how many controls are failing in that area.

> **Key insight:** MITRE ATLAS techniques don't require a known CVE — they describe attack *classes* against *node types*. This means the topology map can be annotated with threat exposure even for components with no known vulnerabilities, purely based on their function in the system (e.g., "any exposed LLM inference endpoint is susceptible to model inversion regardless of version").

---

### 3. Incident Pattern Matching Against Use Case and System Type
**Source:** AI Incident Database (AIID)

AIID incidents describe real-world AI system failures, searchable by system type, capability, and harm type. The topology map exposes use case context — a sales AI agent, a hiring screening agent, a financial advisory agent.

```
Topology:    AI Sales Assistant → outbound email tool → CRM write tool
              ↓
AIID match:  "AI email system sent mass unsolicited messages due to runaway agent loop"
             "AI CRM system corrupted records after prompt injection via inbound email"
              ↓
Output:      ⚠ HIGH — 3 similar-architecture incidents documented.
                       Review HITL coverage on email and CRM tool nodes.
```

This surfaces risks that aren't in any CVE database — they're operational failure patterns from systems with similar architecture. The enhancement is matching incident descriptions to topology node types and use cases rather than just compliance domain categories.

---

### 4. Threat Actor TTP Correlation Against Tool Integrations
**Sources:** IBM X-Force, Mandiant, Verizon DBIR

These sources track threat actor campaigns and TTPs (Tactics, Techniques, Procedures), including which **specific integrations and APIs** threat actors are actively targeting.

```
Topology:    Agent → Salesforce API tool node
              ↓
X-Force:     "FIN7 actively targeting Salesforce OAuth flows for credential theft"
              ↓
Output:      ⚠ HIGH — Active threat actor campaign targets this specific integration.
                       Review iam-01 (agent identity) and iam-05 (secrets management).
```

```
Topology:    Agent → SendGrid email tool
              ↓
Mandiant:    "Business Email Compromise campaigns exploiting transactional email APIs"
              ↓
Output:      ⚠ MEDIUM — BEC techniques applicable to this tool node.
                         Review human-01 (HITL on email sends) and sec-06 (tool validation).
```

---

### 5. Supply Chain Risk Propagation Along Dependency Edges
**Sources:** CISA KEV, MITRE ATLAS AML.T0010, ENISA

The topology map has edges for model provider dependencies and SDK libraries. Supply chain threats propagate along these edges:

```
Topology edge:  Agent → [LangChain SDK] → [OpenAI API] → [GPT-4o model]
                 ↓
CISA KEV:       CVE in LangChain version X (known exploited)
ATLAS T0010:    Supply chain compromise — applies to any SDK dependency edge
ENISA:          "AI model supply chain attacks increasing; focus on fine-tuned model injection"
                 ↓
Output:          ⚠ CRITICAL on LangChain edge (CVE)
                 ⚠ HIGH on model provider edge (ATLAS technique applicable)
                 ℹ  MEDIUM on fine-tuned model nodes (ENISA trend)
```

---

## How It Works End-to-End

```
Step 1 — Topology ingested
  AI Inventory → parse component versions, node types, edge types, use case

Step 2 — Threat intel enrichment per node
  For each node:
    → CVE lookup (CISA KEV) by component name + version
    → ATLAS technique lookup by node type
    → AIID incident lookup by system type + tool combination
    → TTP lookup (X-Force, Mandiant) by integration/API type
    → ENISA/DBIR trend lookup by industry + AI capability type

Step 3 — Risk scoring per node
  Each node gets a threat score:
    Critical CVE present          → Critical
    Active TTP campaign targeted  → High
    ATLAS technique applicable    → Medium (escalates if no mitigating control)
    AIID incident pattern match   → Medium
    ENISA trend warning           → Info

Step 4 — Control gap amplification
  Cross-reference with assessment responses:
    Node has CVE + sec-01 is Non-Compliant  → escalate to Critical
    Node has ATLAS technique + mon-01 is Non-Compliant → flag as blind spot

Step 5 — Output
  Topology map with threat heat map overlay
  Per-node threat cards
  Prioritized remediation list: "Fix these 3 nodes first"
```

---

## Threat Sources and Their Role

| Source | Type | Correlation method |
|--------|------|--------------------|
| CISA KEV | Live CVE feed | Component version → CVE lookup |
| MITRE ATLAS | Technique catalog | Node type → applicable technique mapping |
| AI Incident Database | Real-world incidents | System type + tool combo → incident pattern match |
| IBM X-Force | Threat actor TTPs | Integration/API type → active campaign targeting |
| Mandiant | Threat actor TTPs | Integration/API type → active campaign targeting |
| ENISA | Annual threat landscape | AI capability type → trend-based risk signal |
| Verizon DBIR | Breach patterns | Industry + system type → statistical risk baseline |

---

## What This Produces That the Current Platform Doesn't

| Current platform | With topology + threat intel correlation |
|-----------------|----------------------------------------|
| "Security Controls domain has gaps" | "This specific LangChain tool call handler node has CVE-2024-XXXX AND no output validation" |
| "3 Critical threats match your assessment" | "Node X has 2 active CVEs, 4 applicable ATLAS techniques, and 1 AIID incident analogue" |
| Domain-level RAG score | Per-node vulnerability score across the topology graph |
| Threats matched to compliance gaps | Threats matched to specific components regardless of compliance status |

The key upgrade is moving from **domain-level** to **node-level** correlation — giving a security team a prioritized list of exactly which components in their AI deployment to patch, harden, or monitor first, with evidence from multiple threat intelligence sources backing each recommendation.

---

## Relationship to the Compliance Assessment

The threat-to-topology correlation amplifies the compliance assessment in two directions:

**Threat intel informs assessment priority:**
A node with an active CVE and a failing `sec-01` control is more urgent than a node with a failing `sec-01` and no known threats. The threat layer provides risk-based prioritization on top of the binary pass/fail compliance result.

**Assessment gaps amplify threat severity:**
A topology node exposed to an ATLAS technique becomes Critical (not Medium) when the corresponding compliance control is Non-Compliant. No prompt injection defenses (`sec-01 = Non-Compliant`) + ATLAS Prompt Injection technique applicable to that node = Critical finding, not theoretical risk.

---

## Related Documents

- [`discovery-api-mapping.md`](./discovery-api-mapping.md) — Cloud infrastructure API coverage of all 48 controls
- [`topology-map-coverage.md`](./topology-map-coverage.md) — AI Services Topology/Map coverage of all 48 controls

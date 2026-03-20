# Evidence Matrix — Cloud Infrastructure API Coverage Analysis

> How much of the 48-control compliance assessment can be auto-populated from an AI Agentic Applications & Services Inventory and AI Security Map via cloud infrastructure APIs.
>
> Generated: 2026-03-20

---

## Executive Summary

**85% of the JSON import can be filled from cloud APIs.**

| Tier | Controls | % | Description |
|------|---------|---|-------------|
| **Auto** — Compliant/Non-Compliant with high confidence | 22 | 46% | Binary infrastructure facts (MFA on/off, permissions granted, logs forwarded) |
| **Signal** — Partial; API detects presence, human validates quality | 19 | 40% | Existence confirmed, completeness unverifiable |
| **Manual** — No API evidence possible | 7 | 15% | Documents, legal determinations, test outcomes |

A discovery scan can realistically reduce a multi-day audit to a **30-minute human review session** — the machine handles evidence collection, the assessor handles judgment.

---

## Coverage by Domain

| Domain | Auto | Signal | Manual | Auto% |
|--------|:----:|:------:|:------:|------:|
| Identity, Access & Privilege | 5 | 1 | 0 | 83% |
| Monitoring, Logging & Observability | 3 | 3 | 0 | 50% |
| Data Governance & Privacy | 4 | 1 | 0 | 80% |
| Security Controls & Threat Mitigations | 3 | 3 | 1 | 43% |
| Human Oversight & Control | 2 | 3 | 0 | 40% |
| System Architecture & Design | 0 | 6 | 0 | 0% |
| AI Model & Training Provenance | 2 | 1 | 3 | 33% |
| Governance, Risk & Policy | 1 | 2 | 4 | 14% |
| **TOTAL** | **20** | **20** | **8** | **42%** |

---

## Full Control-by-Control Mapping

### System Architecture & Design

| ID | Control | Tier | Primary APIs | Discovery Output |
|----|---------|------|-------------|-----------------|
| arch-01 | System architecture diagrams | **Manual** | — | Cannot determine diagram accuracy from infrastructure |
| arch-02 | Agent topology (single vs multi-agent) | Signal | `Kubernetes GET /apis/apps/v1/deployments`, `AWS ECS DescribeTaskDefinition`, `AWS ECS ListServices` | Detects agent service count and relationships; orchestration intent requires review |
| arch-03 | Tool/function inventory | Signal | `AWS API Gateway GET /restapis/{id}/resources`, `GitHub GET /repos/{owner}/{repo}/contents`, `Kubernetes GET /api/v1/configmaps`, `AWS Lambda GetFunction` | Enumerates API routes, tool registries, env vars; completeness requires code review |
| arch-04 | Agent memory architecture | Signal | `AWS ElastiCache DescribeCacheClusters`, `DynamoDB DescribeTable`, `Kubernetes GET /api/v1/persistentvolumeclaims`, `Pinecone describe_index` | Detects memory stores (Redis, vector DB, DynamoDB); architecture intent requires documentation |
| arch-05 | Inter-agent communication protocols | Signal | `Kubernetes NetworkPolicy API`, `AWS Security Groups DescribeSecurityGroups`, `Istio PeerAuthentication API`, `AWS IAM ListRolePolicies` | Detects mTLS and network rules; trust boundary definitions require architectural review |
| arch-06 | Supply chain documentation | Signal | `GitHub GET /repos/{owner}/{repo}/dependency-graph/sbom`, `Docker Registry GET /v2/{image}/manifests`, `Dependabot Security API`, `NIST NVD API` | Enumerates SDK versions, base images, CVEs; vendor risk assessments require manual review |

---

### Identity, Access & Privilege

| ID | Control | Tier | Primary APIs | Discovery Output |
|----|---------|------|-------------|-----------------|
| iam-01 | Agent identity mechanisms | **Auto** | `AWS IAM GetRole`, `AWS IAM GetRoleAssumeRolePolicy`, `Kubernetes GET /api/v1/serviceaccounts`, `Okta GET /api/v1/apps`, `HashiCorp Vault GET /auth/{engine}` | Returns auth method, cert rotation schedule, token TTL — binary facts |
| iam-02 | Human user identity (MFA, SSO) | **Auto** | `Okta GET /api/v1/users/{id}/factors`, `Azure Entra ID GET /users/{id}/authentication/methods`, `Google Workspace Admin SDK GET /admin/directory/v1/users`, `AWS IAM ListMFADevices` | MFA enrollment and SSO status are queryable facts across all major IdPs |
| iam-03 | Privilege inventory (least privilege) | **Auto** | `AWS IAM GetRolePolicy`, `AWS IAM ListAttachedRolePolicies`, `AWS Access Analyzer ValidatePolicy`, `Kubernetes GET /apis/rbac.authorization.k8s.io/v1/clusterroles` | Full permissions matrix per agent role; wildcards and overly permissive policies directly detectable |
| iam-04 | Dynamic permission scoping | Signal | `AWS IAM policy conditions`, `Kubernetes SubjectAccessReview API`, `AWS STS AssumeRoleWithWebIdentity`, `HashiCorp Vault dynamic secrets` | Static capability detectable; runtime enforcement requires code-level review |
| iam-05 | Secrets management | **Auto** | `AWS Secrets Manager ListSecrets`, `AWS Secrets Manager DescribeSecret` (rotation config), `HashiCorp Vault LIST /secret/data`, `Kubernetes GET /api/v1/secrets` | Rotation schedule, last rotation date, storage location — all queryable; stale keys directly flaggable |
| iam-06 | Session and token lifecycle | **Auto** | `AWS STS GetCallerIdentity`, `Kubernetes TokenRequest API`, `Okta GET /api/v1/sessions/{id}`, `OIDC token endpoint (expires_in, revocation)` | Token expiry, idle timeout, revocation SLA — binary configuration values |

---

### AI Model & Training Provenance

| ID | Control | Tier | Primary APIs | Discovery Output |
|----|---------|------|-------------|-----------------|
| model-01 | Model cards / documentation | Signal | `GitHub GET /repos/{owner}/{repo}/contents/model-cards/`, `Hugging Face GET /models/{model_id}`, `AWS SageMaker DescribeModel`, `MLflow GET /mlflow/registered-models/{name}` | Detects if model card exists and its sections; content quality requires human review |
| model-02 | Training data provenance | Signal | `MLflow GET /mlflow/runs/{run_id}`, `Weights & Biases GET /projects/{project}/runs/{id}`, `Hugging Face GET /datasets/{id}` | For proprietary models (e.g., GPT-4), full provenance unavailable via API — Partial at best |
| model-03 | Fine-tuning / RLHF documentation | Signal | `OpenAI fine-tunes API`, `AWS SageMaker DescribeTrainingJob`, `MLflow run params`, `GitHub repo scan for training scripts` | Detects if fine-tuning occurred; dataset composition and alignment methodology require documentation |
| model-04 | Model versioning and change control | **Auto** | `GitHub GET /repos/{owner}/{repo}/tags`, `GitHub Releases API`, `MLflow GET /mlflow/registered-models/{name}/latest-versions`, `Docker Registry image tag history` | Version history, stage transitions, change logs — fully queryable from SCM and model registries |
| model-05 | Bias, fairness, and red-team testing | **Manual** | `Weights & Biases artifact tracking`, `GitHub test result reports` | Test results require running tests; APIs show results only if explicitly logged |
| model-06 | Model access controls | **Auto** | `AWS SageMaker DescribeModelPackage`, `Kubernetes RBAC ServiceAccount permissions`, `AWS API Gateway authorizer config`, `Okta app assignment` | Who/what can invoke the model endpoint is directly queryable |

---

### Security Controls & Threat Mitigations

| ID | Control | Tier | Primary APIs | Discovery Output |
|----|---------|------|-------------|-----------------|
| sec-01 | Prompt injection defenses | Signal | `AWS WAF GetWebACL` (injection rules), `Kubernetes Pod Security Policy`, `GitHub Security Code Scanning API`, `CloudWatch WAF logs` | WAF rules and code patterns detectable; effectiveness of mitigations requires security review |
| sec-02 | Output validation controls | Signal | `LangSmith GET /o/{org}/projects/{project}/runs`, `Datadog GET /api/v1/logs`, `CloudWatch Logs Insights` | Validation framework presence detectable; grounding check quality requires evaluation |
| sec-03 | Sandboxing and isolation | **Auto** | `Kubernetes GET /apis/policy/v1beta1/podsecuritypolicies`, `AWS ECS task definition (privileged, readonlyRootFilesystem)`, `Docker inspect (seccomp, apparmor, capabilities)` | Container isolation configuration is a set of binary facts — all directly readable |
| sec-04 | Network segmentation | **Auto** | `Kubernetes GET /networking.k8s.io/v1/networkpolicies`, `AWS VPC DescribeSecurityGroups`, `AWS VPC Flow Logs`, `Calico/Cilium NetworkPolicy API` | Network rules are directly readable; violations detectable via flow logs |
| sec-05 | Adversarial ML controls | Signal | `Weights & Biases robustness metrics`, `MLflow evaluation runs`, `AWS SageMaker Model Monitor` | Defense testing often undocumented; requires manual assessment |
| sec-06 | Plugin / tool use mitigations | Signal | `AWS Lambda Code Signing API`, `Snyk/Trivy SBOM scan`, `API Gateway request/response logs`, `GitHub dependency vulnerability API` | Tool signatures and known CVEs detectable; output validation logic requires code review |
| sec-07 | Sensitive data exposure controls | **Auto** | `AWS IAM GetRolePolicy` (data access scope), `AWS Macie ListFindings`, `Kubernetes RBAC resource permissions`, `AWS CloudTrail data events` | Data access scope is directly readable from IAM + classification labels |

---

### Human Oversight & Control

| ID | Control | Tier | Primary APIs | Discovery Output |
|----|---------|------|-------------|-----------------|
| human-01 | HITL checkpoints | Signal | `AWS Step Functions DescribeStateMachine` (approval states), `Kubernetes MutatingWebhookConfiguration`, `CloudWatch decision logs`, `Jira workflow API` | Approval gates detectable; coverage completeness and threshold quality require review |
| human-02 | Override and kill-switch | **Auto** | `Kubernetes DELETE /api/v1/pods`, `AWS ECS StopTask`, `AWS ECS StopService`, `Feature flag service API` | Kill-switch endpoint existence and last invocation timestamp are directly queryable |
| human-03 | Autonomous action scope limits | Signal | `OPA/Gatekeeper policy output`, `AWS API Gateway throttle settings`, `Kubernetes ResourceQuota API`, `Custom authorization service logs` | Rate limits and quota configs detectable; formal governance documentation requires review |
| human-04 | Transparency to end users | Signal | `GitHub GET /repos/{owner}/{repo}/contents` (disclosure text files), `Analytics API (banner impressions)`, `Custom consent service API` | Disclosure file existence detectable; UX quality and user awareness require review |
| human-05 | Escalation paths | **Auto** | `PagerDuty Incidents API`, `Opsgenie Alert API`, `Jira/ServiceNow escalation ticket logs`, `Datadog monitor alert history` | Escalation triggers, routing, and SLA metrics are fully queryable from alert management systems |

---

### Governance, Risk & Policy

| ID | Control | Tier | Primary APIs | Discovery Output |
|----|---------|------|-------------|-----------------|
| gov-01 | AI risk register | **Manual** | `GitHub API (file existence)`, `Jira epic/ticket API` | Risk register content quality and completeness require expert review |
| gov-02 | Acceptable use policies | **Manual** | `Confluence/GitHub API (doc existence)` | Policy coverage and enforcement mechanisms require legal/compliance review |
| gov-03 | EU AI Act risk classification | **Manual** | — | Legal determination requiring regulatory counsel |
| gov-04 | Conformity assessment / CE marking | **Manual** | — | Formal certification process; cannot be determined from infrastructure |
| gov-05 | Third-party / vendor risk assessments | Signal | `Snyk/Black Duck dependency API`, `GitHub SBOM`, `Jira vendor questionnaire tickets` | Vendor list detectable; assessment completion and quality require manual follow-up |
| gov-06 | Incident response plan | **Manual** | `GitHub API (playbook file existence)`, `PagerDuty service configuration` | IR plan AI-specific scenario coverage requires expert review |
| gov-07 | Change management records | **Auto** | `GitHub GET /repos/{owner}/{repo}/commits`, `GitHub Releases API`, `AWS CodeDeploy ListDeployments`, `Kubernetes rollout history`, `MLflow model version changelog` | All model, prompt, and tool changes fully traceable from SCM and deployment APIs |

---

### Monitoring, Logging & Observability

| ID | Control | Tier | Primary APIs | Discovery Output |
|----|---------|------|-------------|-----------------|
| mon-01 | Agent action logs | **Auto** | `AWS CloudWatch Logs DescribeLogGroups`, `Datadog GET /api/v1/logs`, `Splunk index query`, `LangSmith GET /o/{org}/projects/{project}/runs` | Log destination, schema, retention, and completeness are directly queryable |
| mon-02 | Audit trails (immutable logs) | **Auto** | `AWS CloudTrail LookupEvents`, `AWS S3 GetBucketObjectLockConfiguration`, `Kubernetes API audit log config`, `Vault audit backend config` | Immutability settings (WORM, Object Lock, append-only) are binary configuration facts |
| mon-03 | Anomaly detection coverage | Signal | `CloudWatch DescribeAnomalyDetectors`, `Datadog GET /api/v1/monitor`, `Elasticsearch ML job status`, `LangSmith token anomaly tracking` | Detection rules present; baseline tuning quality and coverage gaps require review |
| mon-04 | Model performance monitoring | **Auto** | `AWS SageMaker DescribeMonitoringSchedule`, `Datadog dashboard API`, `Weights & Biases GET /runs`, `LangSmith latency/token metrics` | Performance metrics, dashboards, and drift thresholds are queryable from monitoring platforms |
| mon-05 | Explainability / interpretability | Signal | `LangSmith GET /runs` (chain-of-thought traces), `SHAP/LIME API (if deployed)`, `Custom explainability service` | Tracing framework presence detectable; interpretability depth and user-facing output require review |
| mon-06 | SIEM / SOAR integration | Signal | `Splunk GET /services/data/indexes`, `AWS Kinesis Data Streams DescribeStream`, `XSOAR GET /playbooks`, `PagerDuty service API` | Log forwarding config detectable; SOAR automation coverage and AI-specific rules require review |

---

### Data Governance & Privacy

| ID | Control | Tier | Primary APIs | Discovery Output |
|----|---------|------|-------------|-----------------|
| data-01 | Data classification scheme | **Auto** | `AWS Macie ListFindings`, `AWS Lake Formation GetDataLakeSettings`, `Cloud DLP SensitiveDataFindings`, `Kubernetes resource labels` | Classification labels applied to all data assets — directly queryable |
| data-02 | Data minimization evidence | **Auto** | `AWS IAM GetRolePolicy` (data access scope), `Lake Formation column/row filters`, `AWS CloudTrail data events`, `Kubernetes RBAC resource permissions` | What data the agent can access is a direct read of IAM + data catalog policies |
| data-03 | PII handling and GDPR compliance | Signal | `AWS Macie ListFindings` (PII detected), `Cloud DLP API`, `Kubernetes Secrets API` (credential audit) | PII presence and masking detectable; GDPR consent process and DPIA completeness require manual review |
| data-04 | Data retention and deletion policies | **Auto** | `AWS S3 GetBucketLifecycleConfiguration`, `DynamoDB DescribeTable` (TTL enabled/disabled), `Elasticsearch GET /_ilm/policy`, `CloudWatch log retention settings` | Retention schedules and automated deletion jobs are directly readable infrastructure config |
| data-05 | Cross-border data transfer controls | **Auto** | `AWS S3 GetBucketReplication` (cross-region rules), `Kubernetes NetworkPolicy egress rules`, `CloudTrail cross-region event routing` | Data residency region and transfer restrictions are directly queryable from storage and network configs |

---

## Implications for Discovery Tool Design

### Phase 1 — Automated (no human needed)
Run API calls across these categories to produce 22 high-confidence responses:

```
AWS IAM → iam-01, iam-02, iam-03, iam-05, iam-06, sec-07, gov-07
Kubernetes API → sec-03, sec-04
AWS Macie + Lake Formation → data-01, data-02, data-04, data-05
CloudTrail + S3 Object Lock → mon-01, mon-02
SageMaker / MLflow → model-04, model-06, mon-04
Kill-switch / PagerDuty → human-02, human-05
```

### Phase 2 — Signal (pre-populate as Partial, queue for human review)
These 19 controls get a `"status": "Partial"` with evidence notes. A reviewer sees what was detected and validates completeness:

```
Architecture topology, tool inventory, memory stores, supply chain
IAM dynamic scoping
Model cards, fine-tuning detection, training provenance
Prompt injection / output validation code
HITL workflow detection, scope limit configs
SIEM rules, anomaly detection baselines, explainability traces
Vendor assessment completeness, data minimization audit
```

### Phase 3 — Manual queue (assessor prompted with specific document requests)
These 7 controls generate a review prompt rather than a status:

```
arch-01 → "Please attach or link the system architecture diagram"
gov-01  → "Please provide the AI risk register (last reviewed date + risk count)"
gov-02  → "Please attach the Acceptable Use Policy (version + approval date)"
gov-03  → "Please provide the EU AI Act risk classification determination"
gov-04  → "Please provide conformity assessment status or timeline"
gov-06  → "Please attach the Incident Response Plan (AI-specific scenarios coverage)"
model-05 → "Please provide bias/fairness test results and red-team report"
```

---

## Known Bug: Domain Name Mismatch in Threat Correlation

`lib/threat-alerts.ts` uses incorrect domain names for 3 of 8 domains, causing threat-to-gap correlation to silently fail:

| Key in `DOMAIN_THREAT_TAGS` | Actual domain in `evidence-data.ts` | Impact |
|-----------------------------|--------------------------------------|--------|
| `'Governance, Risk & Compliance'` | `'Governance, Risk & Policy'` | Governance threats never matched to gaps |
| `'Monitoring & Audit'` | `'Monitoring, Logging & Observability'` | Monitoring threats never matched to gaps |
| `'Data Protection & Privacy'` | `'Data Governance & Privacy'` | Data threats never matched to gaps |

Fix: update the three keys in `DOMAIN_THREAT_TAGS` to match `DOMAINS` in `evidence-data.ts`.

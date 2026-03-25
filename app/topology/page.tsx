'use client'
import { useState } from 'react'
import { AlertTriangle, Shield, Info, ChevronRight, X, Cpu, Database, Bot, Server, User, Globe, Mail, Search } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'clean'

interface ThreatFinding {
  source: string
  technique?: string
  description: string
  control?: string
}

interface TopologyNode {
  id: string
  label: string
  sublabel: string
  type: 'user' | 'agent' | 'llm' | 'mcp' | 'vectorstore' | 'database' | 'crm' | 'email' | 'websearch'
  x: number
  y: number
  severity: Severity
  threats: ThreatFinding[]
}

interface TopologyEdge {
  from: string
  to: string
  label?: string
  threatened: boolean
  bidirectional?: boolean
}

// ─── Node Data ────────────────────────────────────────────────────────────────

const NODES: TopologyNode[] = [
  {
    id: 'user',
    label: 'Human Operator',
    sublabel: 'Sales Rep / End User',
    type: 'user',
    x: 40,
    y: 240,
    severity: 'clean',
    threats: [],
  },
  {
    id: 'agent',
    label: 'AI Sales Agent',
    sublabel: 'LangChain 0.1.20',
    type: 'agent',
    x: 240,
    y: 240,
    severity: 'critical',
    threats: [
      {
        source: 'CISA KEV',
        technique: 'CVE-2024-3568',
        description: 'Arbitrary code execution via LangChain tool call handler. This version is in the Known Exploited Vulnerabilities catalog.',
        control: 'arch-06 (supply chain docs)',
      },
      {
        source: 'MITRE ATLAS',
        technique: 'AML.T0051',
        description: 'Prompt Injection — LLM input pipeline node is susceptible to adversarial instruction injection through user-controlled inputs.',
        control: 'sec-01 (prompt injection defenses) — Non-Compliant',
      },
      {
        source: 'MITRE ATLAS',
        technique: 'AML.T0010',
        description: 'Supply Chain Compromise — SDK dependency edge (LangChain → OpenAI API) is an active supply chain attack surface.',
        control: 'arch-06 (supply chain docs)',
      },
      {
        source: 'GitHub Advisory',
        technique: 'GHSA-h59x-p739-982c',
        description: 'GitHub Advisory: LangChain ≤0.1.20 — arbitrary code execution via unsafe deserialization in the tool-call response parser. Affects this exact pinned version. Patch available in 0.1.21+.',
        control: 'arch-06 (supply chain docs) — Not Started',
      },
    ],
  },
  {
    id: 'llm',
    label: 'GPT-4o',
    sublabel: 'OpenAI API · gpt-4o-2024-08',
    type: 'llm',
    x: 450,
    y: 100,
    severity: 'high',
    threats: [
      {
        source: 'MITRE ATLAS',
        technique: 'AML.T0051',
        description: 'Prompt Injection — Model inference endpoint processes untrusted user content. No output validation layer detected in pipeline.',
        control: 'sec-02 (output validation) — Partial',
      },
      {
        source: 'MITRE ATLAS',
        technique: 'AML.T0040',
        description: 'Exfiltration via Inference API — Internet-exposed model endpoint may be used to extract sensitive context from prompts.',
        control: 'sec-07 (sensitive data exposure)',
      },
      {
        source: 'MITRE ATLAS',
        technique: 'AML.T0024',
        description: 'Model Inversion — Repeated queries to inference API can reconstruct proprietary data embedded in system prompt context.',
        control: 'mon-01 (agent action logs) — Partial',
      },
    ],
  },
  {
    id: 'mcp',
    label: 'MCP Tool Server',
    sublabel: 'FastMCP · 12 tools registered',
    type: 'mcp',
    x: 450,
    y: 380,
    severity: 'high',
    threats: [
      {
        source: 'MITRE ATLAS',
        technique: 'AML.T0051',
        description: 'Tool Hijacking via Prompt Injection — A compromised LLM output can trigger unauthorized tool invocations on this MCP server.',
        control: 'sec-06 (plugin/tool mitigations) — Non-Compliant',
      },
      {
        source: 'AI Incident Database',
        description: 'AIID #642: AI email system entered runaway loop sending mass unsolicited messages via transactional API. Architecture matches this deployment.',
        control: 'human-01 (HITL checkpoints) — Partial',
      },
      {
        source: 'GitHub Advisory',
        technique: 'GHSA-3wgr-7772-25jx',
        description: 'GitHub Advisory: FastMCP transitive dependency (anyio ≤4.3.0) — resource exhaustion via uncapped task spawning in tool dispatch loop. Can be triggered by malformed LLM output.',
        control: 'sec-06 (plugin/tool mitigations) — Non-Compliant',
      },
    ],
  },
  {
    id: 'vectorstore',
    label: 'Pinecone Vector Store',
    sublabel: 'Index: sales-knowledge-v2',
    type: 'vectorstore',
    x: 680,
    y: 60,
    severity: 'medium',
    threats: [
      {
        source: 'MITRE ATLAS',
        technique: 'AML.T0020',
        description: 'Data Poisoning — Vector store / training data connection. Adversarial documents inserted into the knowledge base can corrupt retrieval results.',
        control: 'data-02 (data minimization) — Partial',
      },
      {
        source: 'AI Incident Database',
        description: 'AIID #891: Indirect prompt injection via poisoned documents in RAG knowledge base led to data exfiltration.',
        control: 'sec-01 (prompt injection defenses) — Non-Compliant',
      },
    ],
  },
  {
    id: 'crm',
    label: 'Salesforce CRM',
    sublabel: 'OAuth 2.0 · read/write scope',
    type: 'crm',
    x: 680,
    y: 260,
    severity: 'high',
    threats: [
      {
        source: 'IBM X-Force',
        description: 'FIN7 threat actor actively targeting Salesforce OAuth flows for credential theft. This integration\'s read/write scope creates high-value target.',
        control: 'iam-01 (agent identity) — Partial',
      },
      {
        source: 'MITRE ATLAS',
        technique: 'AML.T0051',
        description: 'Prompt injection via inbound Salesforce data — CRM records can contain adversarial content that manipulates agent behavior on read.',
        control: 'iam-03 (privilege inventory) — over-privileged write scope',
      },
    ],
  },
  {
    id: 'email',
    label: 'SendGrid',
    sublabel: 'Transactional Email API',
    type: 'email',
    x: 680,
    y: 390,
    severity: 'medium',
    threats: [
      {
        source: 'Mandiant',
        description: 'Business Email Compromise campaigns actively exploiting transactional email APIs for mass phishing distribution via compromised AI agents.',
        control: 'human-01 (HITL on email sends) — Partial',
      },
      {
        source: 'MITRE ATLAS',
        technique: 'AML.T0040',
        description: 'Exfiltration via email — Sensitive context from system prompt or CRM data may be leaked into outbound email content.',
        control: 'sec-06 (tool use mitigations) — Non-Compliant',
      },
    ],
  },
  {
    id: 'websearch',
    label: 'Web Search API',
    sublabel: 'Bing Search · unrestricted',
    type: 'websearch',
    x: 680,
    y: 490,
    severity: 'medium',
    threats: [
      {
        source: 'MITRE ATLAS',
        technique: 'AML.T0051',
        description: 'Indirect Prompt Injection — Adversarial content on indexed web pages can inject instructions into the agent when search results are processed.',
        control: 'sec-01 (prompt injection defenses) — Non-Compliant',
      },
      {
        source: 'ENISA',
        description: 'AI model supply chain attacks increasing — unassessed third-party API vendor with no security questionnaire on file.',
        control: 'arch-06 (supply chain docs) — Partial',
      },
    ],
  },
  {
    id: 'postgres',
    label: 'PostgreSQL',
    sublabel: 'Internal · CRM audit log',
    type: 'database',
    x: 880,
    y: 200,
    severity: 'low',
    threats: [
      {
        source: 'Verizon DBIR',
        description: 'Statistical baseline risk: lateral movement from compromised CRM integration to internal database. DBIR shows 38% of AI breach incidents involve internal data store access after initial compromise.',
        control: 'sec-04 (network segmentation) — Partial',
      },
    ],
  },
]

// ─── Edge Data ────────────────────────────────────────────────────────────────

const EDGES: TopologyEdge[] = [
  { from: 'user',        to: 'agent',       threatened: false, label: 'chat input' },
  { from: 'agent',       to: 'llm',         threatened: true,  label: 'LLM call' },
  { from: 'agent',       to: 'mcp',         threatened: true,  label: 'tool dispatch' },
  { from: 'llm',         to: 'vectorstore', threatened: true,  label: 'RAG retrieval', bidirectional: true },
  { from: 'mcp',         to: 'crm',         threatened: true,  label: 'CRM write' },
  { from: 'mcp',         to: 'email',       threatened: true,  label: 'send email' },
  { from: 'mcp',         to: 'websearch',   threatened: true,  label: 'web search' },
  { from: 'crm',         to: 'postgres',    threatened: false, label: 'audit log' },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const NODE_W = 154
const NODE_H = 68
const CANVAS_W = 1060
const CANVAS_H = 580

// ─── Helpers ──────────────────────────────────────────────────────────────────

function severityColor(s: Severity) {
  if (s === 'critical') return { ring: 'ring-rose-500',    bg: 'bg-rose-500/10',   badge: 'bg-rose-500',    text: 'text-rose-400',   label: 'CRITICAL' }
  if (s === 'high')     return { ring: 'ring-orange-400',  bg: 'bg-orange-400/10', badge: 'bg-orange-400',  text: 'text-orange-400', label: 'HIGH' }
  if (s === 'medium')   return { ring: 'ring-yellow-400',  bg: 'bg-yellow-400/10', badge: 'bg-yellow-400',  text: 'text-yellow-400', label: 'MEDIUM' }
  if (s === 'low')      return { ring: 'ring-blue-400',    bg: 'bg-blue-400/10',   badge: 'bg-blue-400',    text: 'text-blue-400',   label: 'LOW' }
  return                       { ring: 'ring-slate-700',   bg: 'bg-slate-800',     badge: 'bg-slate-600',   text: 'text-slate-400',  label: 'CLEAN' }
}

function nodeIcon(type: TopologyNode['type']) {
  const cls = 'h-4 w-4 flex-shrink-0'
  if (type === 'user')        return <User className={cls} />
  if (type === 'agent')       return <Bot className={cls} />
  if (type === 'llm')         return <Cpu className={cls} />
  if (type === 'mcp')         return <Server className={cls} />
  if (type === 'vectorstore') return <Database className={cls} />
  if (type === 'crm')         return <Database className={cls} />
  if (type === 'email')       return <Mail className={cls} />
  if (type === 'websearch')   return <Search className={cls} />
  return                             <Database className={cls} />
}

function sourceColor(source: string) {
  if (source === 'CISA KEV')             return 'text-rose-400 bg-rose-500/10 border-rose-500/30'
  if (source === 'MITRE ATLAS')          return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
  if (source === 'AI Incident Database') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
  if (source === 'IBM X-Force')          return 'text-purple-400 bg-purple-500/10 border-purple-500/30'
  if (source === 'Mandiant')             return 'text-red-400 bg-red-500/10 border-red-500/30'
  if (source === 'ENISA')                return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
  if (source === 'Verizon DBIR')         return 'text-slate-300 bg-slate-700/50 border-slate-600/30'
  if (source === 'GitHub Advisory')      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  return 'text-slate-400 bg-slate-800 border-slate-700'
}

function sourceDotColor(source: string) {
  if (source === 'CISA KEV')             return 'bg-rose-400'
  if (source === 'MITRE ATLAS')          return 'bg-orange-400'
  if (source === 'AI Incident Database') return 'bg-yellow-400'
  if (source === 'IBM X-Force')          return 'bg-purple-400'
  if (source === 'Mandiant')             return 'bg-red-400'
  if (source === 'ENISA')                return 'bg-blue-400'
  if (source === 'Verizon DBIR')         return 'bg-slate-400'
  if (source === 'GitHub Advisory')      return 'bg-emerald-400'
  return 'bg-slate-500'
}

// ─── Edge SVG path (center-to-center bezier) ─────────────────────────────────

function getNodeCenter(node: TopologyNode) {
  return { x: node.x + NODE_W / 2, y: node.y + NODE_H / 2 }
}

function buildPath(from: TopologyNode, to: TopologyNode) {
  const f = getNodeCenter(from)
  const t = getNodeCenter(to)
  const dx = t.x - f.x
  const dy = t.y - f.y
  const cx1 = f.x + dx * 0.45
  const cy1 = f.y
  const cx2 = t.x - dx * 0.15
  const cy2 = t.y
  return `M ${f.x} ${f.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${t.x} ${t.y}`
}

// ─── Components ───────────────────────────────────────────────────────────────

function SeverityIcon({ s }: { s: Severity }) {
  if (s === 'critical' || s === 'high') return <AlertTriangle className="h-3 w-3" />
  if (s === 'medium' || s === 'low')    return <Info className="h-3 w-3" />
  return <Shield className="h-3 w-3" />
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TopologyPage() {
  const [selected, setSelected] = useState<TopologyNode | null>(null)

  const counts = {
    critical: NODES.filter(n => n.severity === 'critical').length,
    high:     NODES.filter(n => n.severity === 'high').length,
    medium:   NODES.filter(n => n.severity === 'medium').length,
    low:      NODES.filter(n => n.severity === 'low').length,
  }

  const nodeById = Object.fromEntries(NODES.map(n => [n.id, n]))

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-[1400px]">

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">AI Topology Threat Map</h1>
              <p className="text-slate-400 text-sm mt-1">
                AI Sales Assistant — Enterprise Edition · Threat intelligence overlaid on live system topology
              </p>
            </div>
            {/* Severity summary pills */}
            <div className="flex flex-wrap gap-2">
              {counts.critical > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-sm font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {counts.critical} Critical
                </span>
              )}
              {counts.high > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-400/15 border border-orange-400/30 text-orange-400 text-sm font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {counts.high} High
                </span>
              )}
              {counts.medium > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 text-sm font-semibold">
                  <Info className="h-3.5 w-3.5" />
                  {counts.medium} Medium
                </span>
              )}
              {counts.low > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-400/15 border border-blue-400/30 text-blue-400 text-sm font-semibold">
                  <Info className="h-3.5 w-3.5" />
                  {counts.low} Low
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Main layout ── */}
        <div className="flex gap-4 items-start">

          {/* ── Canvas ── */}
          <div className="flex-1 min-w-0">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-x-auto">
              <div
                style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, minWidth: CANVAS_W }}
              >
                {/* SVG edges */}
                <svg
                  width={CANVAS_W}
                  height={CANVAS_H}
                  style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
                >
                  <defs>
                    <marker id="arrow-clean"    markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <path d="M0,0 L8,3 L0,6 Z" fill="#475569" />
                    </marker>
                    <marker id="arrow-threatened" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <path d="M0,0 L8,3 L0,6 Z" fill="#f87171" />
                    </marker>
                    <marker id="arrow-threatened-start" markerWidth="8" markerHeight="6" refX="1" refY="3" orient="auto-start-reverse">
                      <path d="M0,0 L8,3 L0,6 Z" fill="#fb923c" />
                    </marker>
                  </defs>

                  {EDGES.map((edge, i) => {
                    const fromNode = nodeById[edge.from]
                    const toNode   = nodeById[edge.to]
                    if (!fromNode || !toNode) return null
                    const d = buildPath(fromNode, toNode)
                    const threatened = edge.threatened
                    return (
                      <g key={i}>
                        <path
                          d={d}
                          fill="none"
                          stroke={threatened ? '#ef4444' : '#334155'}
                          strokeWidth={threatened ? 1.5 : 1}
                          strokeDasharray={threatened ? '6 3' : undefined}
                          markerEnd={`url(#arrow-${threatened ? 'threatened' : 'clean'})`}
                          markerStart={edge.bidirectional ? 'url(#arrow-threatened-start)' : undefined}
                          opacity={threatened ? 0.7 : 0.5}
                        />
                      </g>
                    )
                  })}

                  {/* Edge labels */}
                  {EDGES.map((edge, i) => {
                    const fromNode = nodeById[edge.from]
                    const toNode   = nodeById[edge.to]
                    if (!fromNode || !toNode || !edge.label) return null
                    const f = getNodeCenter(fromNode)
                    const t = getNodeCenter(toNode)
                    const mx = (f.x + t.x) / 2
                    const my = (f.y + t.y) / 2 - 8
                    return (
                      <text key={`lbl-${i}`} x={mx} y={my} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="monospace">
                        {edge.label}
                      </text>
                    )
                  })}
                </svg>

                {/* Nodes */}
                {NODES.map(node => {
                  const c = severityColor(node.severity)
                  const isSelected = selected?.id === node.id
                  const threatCount = node.threats.length
                  const uniqueSources = [...new Set(node.threats.map(t => t.source))]
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelected(isSelected ? null : node)}
                      style={{
                        position: 'absolute',
                        left: node.x,
                        top: node.y,
                        width: NODE_W,
                        height: NODE_H,
                        cursor: 'pointer',
                      }}
                      className={`
                        rounded-lg border ring-1 px-3 py-2 flex flex-col justify-between
                        transition-all duration-150 select-none
                        ${c.ring} ${c.bg}
                        ${isSelected ? 'border-indigo-400 shadow-lg shadow-indigo-500/20 scale-105' : 'border-slate-700 hover:border-slate-500'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className={c.text}>{nodeIcon(node.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-100 truncate leading-tight">{node.label}</div>
                          <div className="text-[9px] text-slate-300 truncate leading-tight">{node.sublabel}</div>
                        </div>
                        {threatCount > 0 && (
                          <span className={`flex-shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white ${c.badge}`}>
                            {threatCount}
                          </span>
                        )}
                      </div>
                      {uniqueSources.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {uniqueSources.map(src => (
                            <span
                              key={src}
                              title={src}
                              className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${sourceDotColor(src)}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Zone labels */}
                <div style={{ position: 'absolute', left: 40, top: 16 }} className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Human Interface</div>
                <div style={{ position: 'absolute', left: 240, top: 16 }} className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Orchestration Layer</div>
                <div style={{ position: 'absolute', left: 440, top: 16 }} className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">AI Inference + Tools</div>
                <div style={{ position: 'absolute', left: 670, top: 16 }} className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">External Integrations</div>
                <div style={{ position: 'absolute', left: 870, top: 16 }} className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Internal Data</div>

                {/* Zone divider lines */}
                {[230, 440, 665, 860].map(x => (
                  <div key={x} style={{ position: 'absolute', left: x, top: 30, width: 1, height: CANVAS_H - 60 }} className="bg-slate-800/60" />
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <svg width="28" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" /><polygon points="20,2 28,5 20,8" fill="#ef4444"/></svg>
                <span>Threatened connection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="28" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#475569" strokeWidth="1" /><polygon points="20,2 28,5 20,8" fill="#475569"/></svg>
                <span>Clean connection</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>Critical
                <span className="inline-block w-2 h-2 rounded-full bg-orange-400"></span>High
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>Medium
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>Low
                <span className="inline-block w-2 h-2 rounded-full bg-slate-600"></span>Clean
              </div>
              <span className="text-slate-300">Click a node to see threat details →</span>
            </div>
          </div>

          {/* ── Threat Detail Panel ── */}
          {selected ? (
            <div className="w-80 flex-shrink-0">
              <div className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden">
                {/* Panel header */}
                <div className={`px-4 py-3 flex items-start justify-between gap-2 ${severityColor(selected.severity).bg} border-b border-slate-700`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={severityColor(selected.severity).text}>{nodeIcon(selected.type)}</span>
                      <span className="text-sm font-bold text-slate-100">{selected.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{selected.sublabel}</div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 mt-0.5">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Severity badge */}
                <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-white ${severityColor(selected.severity).badge}`}>
                    <SeverityIcon s={selected.severity} />
                    {severityColor(selected.severity).label}
                  </span>
                  <span className="text-xs text-slate-300">{selected.threats.length} finding{selected.threats.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Threats */}
                {selected.threats.length === 0 ? (
                  <div className="px-4 py-6 text-center text-slate-300 text-sm">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                    No threat intelligence findings for this node.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800 max-h-[520px] overflow-y-auto">
                    {selected.threats.map((t, i) => (
                      <div key={i} className="px-4 py-3 space-y-2">
                        <div className="flex items-start gap-2 flex-wrap">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold border ${sourceColor(t.source)}`}>
                            {t.source}
                          </span>
                          {t.technique && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                              {t.technique}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{t.description}</p>
                        {t.control && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                            <ChevronRight className="h-3 w-3 flex-shrink-0" />
                            <span>Related control: <span className="text-slate-200 font-mono">{t.control}</span></span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Placeholder panel when nothing selected */
            <div className="w-80 flex-shrink-0">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-10 text-center text-slate-300 text-sm">
                <Bot className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="font-medium text-slate-200">Select a node</p>
                <p className="text-xs mt-1">Click any component to view threat intelligence findings</p>
              </div>
            </div>
          )}

        </div>

        {/* ── Threat Sources Summary ── */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Threat Intelligence Sources Active</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'CISA KEV',             desc: 'Known Exploited Vulnerabilities',    color: 'text-rose-400   bg-rose-500/10   border-rose-500/30' },
              { name: 'MITRE ATLAS',           desc: 'Adversarial ML Techniques',          color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
              { name: 'AI Incident Database',  desc: 'Real-world AI failure patterns',     color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
              { name: 'IBM X-Force',           desc: 'Threat actor TTPs',                  color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
              { name: 'Mandiant',              desc: 'Active campaign intelligence',       color: 'text-red-400    bg-red-500/10    border-red-500/30' },
              { name: 'ENISA',                 desc: 'AI threat landscape trends',         color: 'text-blue-400   bg-blue-500/10   border-blue-500/30' },
              { name: 'Verizon DBIR',          desc: 'Breach pattern statistics',          color: 'text-slate-300  bg-slate-700/50  border-slate-600/30' },
              { name: 'GitHub Advisory',       desc: 'OSS dependency vulnerability DB',     color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
            ].map(s => (
              <div key={s.name} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${s.color}`}>
                <span className="font-semibold">{s.name}</span>
                <span className="opacity-70">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

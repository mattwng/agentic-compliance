export type RAGStatus = { bg: string; text: string; label: string; dot: string }

export function getRAG(score: number): RAGStatus {
  if (score >= 75) return { bg: 'bg-green-900/40', text: 'text-green-400', label: 'Low Risk', dot: '#22c55e' }
  if (score >= 50) return { bg: 'bg-amber-900/40', text: 'text-amber-400', label: 'Medium Risk', dot: '#f59e0b' }
  return { bg: 'bg-red-900/40', text: 'text-red-400', label: 'High Risk', dot: '#ef4444' }
}

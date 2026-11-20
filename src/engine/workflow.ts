import type { ConditionWorkflow, DecisionNode } from '@/types/workflow'

/**
 * Walks a workflow's diagnostic graph from its entry node, following the
 * branches the clinician has chosen. Returns the path taken and the node the
 * clinician is currently standing at — which is either a question with
 * branches still open, or a terminal action.
 */
export interface WalkResult {
  path: DecisionNode[]
  current: DecisionNode
  /** True when `current` carries an action and no unresolved branches. */
  terminal: boolean
}

export function walk(wf: ConditionWorkflow, choices: Record<string, string>): WalkResult {
  const byId = new Map(wf.diagnostic.nodes.map((n) => [n.id, n]))
  const path: DecisionNode[] = []
  let node = byId.get(wf.diagnostic.entry)
  if (!node) throw new Error(`Workflow ${wf.id}: entry node ${wf.diagnostic.entry} not found`)

  // Guard against cycles: a workflow may legitimately loop (empiric → biopsy
  // on no response), but never through the same node twice in one walk.
  const seen = new Set<string>()
  while (node && !seen.has(node.id)) {
    seen.add(node.id)
    path.push(node)
    const chosen = choices[node.id]
    const next = node.branches?.find((b) => b.to === chosen)
    if (!next) break
    node = byId.get(next.to)
  }

  const current = path[path.length - 1]
  return { path, current, terminal: Boolean(current.action) && !choices[current.id] }
}

/**
 * Pleural TB ADA rule, as a direct calculator. Mirrors the diagnostic graph in
 * content/workflows/pleural.ts, but takes the numbers rather than the clicks,
 * so the page can pre-select the branch from the value entered.
 */
export function pleuralAdaBranch(adaUL: number | undefined): 'below-40' | '40-69' | '70-plus' | undefined {
  if (adaUL == null || !Number.isFinite(adaUL)) return undefined
  if (adaUL < 40) return 'below-40'
  if (adaUL < 70) return '40-69'
  return '70-plus'
}

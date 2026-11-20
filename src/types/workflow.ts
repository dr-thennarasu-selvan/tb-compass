import type { Provenance, Severity, Statement } from '@/types/content'
import type { TbSite } from '@/types/patient'

/**
 * A condition-specific workflow, in the shape the ICMR Standard Treatment
 * Workflows use for every condition:
 *
 *   When to suspect → Investigations → Diagnostic pathway → Management
 *
 * Adopting the national template rather than inventing one means every
 * condition page reads the same way, and the source document maps onto the
 * screen section by section — which is what makes the citation checkable.
 */

export interface WorkflowSection {
  heading: string
  items: string[]
}

export interface DecisionNode {
  id: string
  /** The question or finding at this node. */
  text: string
  /** Branches out of this node. Terminal nodes have none. */
  branches?: { label: string; to: string }[]
  /** Terminal action, when this node ends the pathway. */
  action?: string
  severity?: Severity
}

export interface ConditionWorkflow {
  id: string
  site: TbSite
  title: string
  icd10: string
  whenToSuspect: {
    history: string[]
    examination: string[]
  }
  investigations: {
    essential: string[]
    desirable: string[]
  }
  /** The diagnostic flowchart as a node graph, entry at `entry`. */
  diagnostic: {
    entry: string
    nodes: DecisionNode[]
  }
  management: {
    treatment: string[]
    whenToRefer: string[]
    followUp: string[]
  }
  /**
   * Where this workflow disagrees with another source. Rendered prominently
   * rather than folded into the management text, because a conflict the
   * clinician does not see is worse than no content.
   */
  conflicts?: Statement[]
  /** Complications to watch for, each with the presentation that signals it. */
  complications?: {
    items: { name: string; presentation: string }[]
    provenance: Provenance
  }
  /** Comparison tables the source provides, e.g. CSF profiles by aetiology. */
  tables?: {
    title: string
    columns: string[]
    rows: string[][]
    provenance: Provenance
  }[]
  provenance: Provenance
}

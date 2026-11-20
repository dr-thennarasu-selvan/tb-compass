/**
 * Content schema.
 *
 * Design rule for this app: a clinical assertion cannot exist without provenance.
 * `Provenance` is a required field on every statement, threshold and action —
 * not an optional annotation. If you cannot cite it, you cannot ship it.
 */

/**
 * Which national or international guideline a piece of content belongs to.
 *
 * The same clinical question has different correct answers in different
 * programmes. Content is tagged rather than merged, and the UI shows the
 * active pack's answer with the other pack's answer available alongside —
 * never averaged into a single invented consensus.
 */
export type GuidelinePack = 'who' | 'ntep'

export const PACK_LABEL: Record<GuidelinePack, string> = {
  who: 'WHO',
  ntep: 'India NTEP / PMDT',
}

export type SourceId = string

export interface Source {
  id: SourceId
  pack: GuidelinePack | 'shared'
  /**
   * Set when a newer edition replaces this one. Content still citing a
   * superseded source is not automatically wrong, but it must be re-checked
   * against the successor before it can be marked verified.
   */
  supersededBy?: SourceId
  title: string
  publisher: string
  year: number
  /** Short label shown inline in the UI, e.g. "WHO DS-TB 2022". */
  short: string
  url?: string
}

export interface Citation {
  source: SourceId
  /**
   * Where in the source. Be honest here: a descriptive pointer
   * ("Hepatotoxicity management section") is better than a fabricated
   * section number. Replace with the exact locator during review.
   */
  locator: string
}

/**
 * Review state of a clinical assertion.
 *
 * Three states, and the middle one matters:
 *
 * - `needs-review`  Authored without reading the source at that locator —
 *                   extrapolated, remembered, or carried over from another
 *                   guideline. Treat as a draft.
 * - `source-checked` The text was read out of the cited document at the cited
 *                   locator, so the content matches the source. This is NOT
 *                   clinical sign-off: the source may be superseded, the
 *                   locator may be imprecise, and applying it to this patient
 *                   is still a judgement.
 * - `verified`      A clinician has confirmed it and accepts it for use.
 * - `disputed`      Cited sources genuinely disagree; the UI surfaces the
 *                   conflict rather than silently picking a winner.
 */
export type ReviewStatus = 'needs-review' | 'source-checked' | 'verified' | 'disputed'

export interface Provenance {
  citations: Citation[]
  status: ReviewStatus
  /** Initials or name of the clinician who verified it. */
  verifiedBy?: string
  /** ISO date of verification. */
  verifiedOn?: string
  /** Where guidelines diverge, say so explicitly rather than averaging them. */
  divergence?: string
}

/** A single citable clinical assertion. */
export interface Statement {
  id: string
  text: string
  /** Optional expansion shown when the clinician opens the reasoning. */
  detail?: string
  provenance: Provenance
}

export type ActionKind =
  | 'stop'
  | 'start'
  | 'continue'
  | 'withhold'
  | 'investigate'
  | 'monitor'
  | 'refer'
  | 'counsel'

export interface Action extends Statement {
  kind: ActionKind
  /** Drives ordering and visual weight. */
  urgency: 'immediate' | 'same-day' | 'routine'
}

/**
 * A numeric decision threshold expressed as data so it can be audited and
 * swapped per guideline pack without touching engine code.
 */
export interface Threshold {
  id: string
  label: string
  /** Multiple of upper limit of normal, or an absolute value — see `unit`. */
  value: number
  unit: 'xULN' | 'x-baseline' | 'mg/dL' | 'umol/L' | 'days' | 'ratio'
  provenance: Provenance
}

export type Severity = 'critical' | 'warning' | 'caution' | 'info' | 'ok'

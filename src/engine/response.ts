import type { PatientContext } from '@/types/patient'
import type { Severity, Statement } from '@/types/content'
import {
  CAUSES,
  DEAD_BACILLI,
  FAILURE_DEFINITION,
  FAILURE_M4,
  NOT_FAILURE_YET,
  SYMPTOMS,
  type Cause,
  type Trigger,
} from '@/content/response'

/**
 * Not improving on treatment. Pure: no React, no I/O.
 *
 * Two outputs: whether what the physician sees already meets a failure
 * definition, and the causes to work through — ordered so the ones the
 * sources tie to this finding, and to this patient, come first.
 */
export interface ResponseAssessment {
  verdict?: { statement: Statement; severity: Severity }
  causes: { cause: Cause; boosted: string | undefined }[]
}

export function assessResponse(ctx: PatientContext): ResponseAssessment {
  const t = new Set((ctx.responseTriggers ?? []) as Trigger[])

  let verdict: ResponseAssessment['verdict']
  if (t.has('culture-pos-m4')) verdict = { statement: FAILURE_M4, severity: 'critical' }
  else if (t.has('reversion')) verdict = { statement: FAILURE_DEFINITION, severity: 'warning' }
  else if (t.has('smear-pos-culture-neg') && t.size === 1) verdict = { statement: DEAD_BACILLI, severity: 'ok' }
  else if (t.has('smear-pos-m2')) verdict = { statement: NOT_FAILURE_YET, severity: 'caution' }
  else if (t.has('symptoms') || t.has('cxr-worse')) verdict = { statement: SYMPTOMS, severity: 'caution' }

  const hasDiabetes = Boolean(ctx.diabetes) || (ctx.labs.hba1c ?? 0) >= 6.5
  const reasonFor = (c: Cause): string | undefined => {
    if (c.id === 'comorbidity' && hasDiabetes) return 'diabetes recorded'
    if (c.id === 'paradoxical' && ctx.hivPositive && ctx.onArt) return 'HIV, on ART'
    if (c.id === 'absorption' && (hasDiabetes || ctx.hivPositive)) return hasDiabetes ? 'diabetes recorded' : 'HIV recorded'
    if (c.id === 'resistance' && ctx.classification === 'unknown') return 'resistance status not settled'
    return undefined
  }

  // Causes tied to what the physician selected come first, in CAUSES order;
  // with nothing selected, the whole list is shown in that order. `boosted`
  // marks a reason specific to this patient and does not reorder.
  const matches = (c: Cause) => c.for.length === 0 || c.for.some((f) => t.has(f))
  const causes = CAUSES
    .filter((c) => t.size === 0 || matches(c) || c.for.length === 0)
    .map((cause) => ({ cause, boosted: reasonFor(cause) }))

  return { verdict, causes }
}

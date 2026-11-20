import type { PatientContext } from '@/types/patient'
import type { Severity } from '@/types/content'
import { SCREEN_RBS_CUTOFF, TRIAGE_GLUCOSE } from '@/content/diabetes'

/**
 * Where this patient is in NTEP's diabetes screening. Pure: no React, no I/O.
 *
 * RBS ≥200 is a triage sign only "with diabetes symptoms", which the context
 * does not carry, so an RBS in that range asks for confirmation rather than
 * being counted on its own.
 */
export type GlycaemiaStep =
  | 'known-diabetes'
  | 'not-screened'
  | 'screen-negative'
  | 'follow-up-needed'
  | 'diabetic-range'

export interface DiabetesAssessment {
  step: GlycaemiaStep
  headline: string
  detail: string
  severity: Severity
  /** Which triage criteria the entered values meet, in the source's words. */
  triageHits: string[]
  /** RBS ≥200 — counts only with symptoms, which the physician must confirm. */
  rbsNeedsSymptoms: boolean
  applies: boolean
}

export function assessDiabetes(ctx: PatientContext): DiabetesAssessment {
  const { rbs, fbs, ppbs, hba1c } = ctx.labs
  const t = TRIAGE_GLUCOSE
  const triageHits = [
    fbs != null && fbs >= t.fbs && `fasting ${fbs} mg/dL (≥${t.fbs})`,
    ppbs != null && ppbs >= t.ppbs && `post-prandial ${ppbs} mg/dL (≥${t.ppbs})`,
    hba1c != null && hba1c >= t.hba1c && `HbA1c ${hba1c}% (≥${t.hba1c})`,
  ].filter(Boolean) as string[]
  const rbsNeedsSymptoms = rbs != null && rbs >= t.rbsWithSymptoms
  const followUpDone = fbs != null || ppbs != null || hba1c != null

  if (ctx.diabetes) {
    return {
      step: 'known-diabetes',
      headline: 'Known diabetes',
      detail: hba1c != null ? `HbA1c ${hba1c}%.` : 'No HbA1c recorded — needed to judge control.',
      severity: triageHits.length ? 'warning' : 'info',
      triageHits,
      rbsNeedsSymptoms,
      applies: true,
    }
  }
  if (triageHits.length > 0) {
    return {
      step: 'diabetic-range',
      headline: 'Glucose in the diabetic range',
      detail: `Meets the NTEP triage glucose criterion: ${triageHits.join('; ')}. Refer for comprehensive assessment and start diabetes care.`,
      severity: 'warning',
      triageHits,
      rbsNeedsSymptoms,
      applies: true,
    }
  }
  if (rbs == null) {
    return {
      step: 'not-screened',
      headline: 'Not yet screened',
      detail: 'NTEP screens every person with TB with a random blood sugar.',
      severity: 'caution',
      triageHits,
      rbsNeedsSymptoms,
      applies: false,
    }
  }
  if (rbs >= SCREEN_RBS_CUTOFF && !followUpDone) {
    return {
      step: 'follow-up-needed',
      headline: `RBS ${rbs} mg/dL — confirmatory tests needed`,
      detail: `At or above ${SCREEN_RBS_CUTOFF}: send fasting and post-prandial glucose and HbA1c.${rbsNeedsSymptoms ? ` RBS ≥${t.rbsWithSymptoms} with diabetes symptoms is itself a triage sign.` : ''}`,
      severity: 'warning',
      triageHits,
      rbsNeedsSymptoms,
      applies: true,
    }
  }
  return {
    step: 'screen-negative',
    headline: followUpDone ? 'Confirmatory tests below the diabetic range' : `RBS ${rbs} mg/dL — below the screening cut-off`,
    detail: 'Reassess an abnormal baseline value during the first month of follow-up.',
    severity: 'ok',
    triageHits,
    rbsNeedsSymptoms,
    applies: false,
  }
}

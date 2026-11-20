import type { PatientContext } from '@/types/patient'

/**
 * Which parts of the airways module apply. Pure: no React, no I/O.
 *
 * The module's content is almost entirely statements; what the engine decides
 * is which of them lead, so the physician sees the one that matters for this
 * patient first.
 */
export interface AirwaysAssessment {
  applies: boolean
  /** On an ICS with COPD, or COPD with TB risk factors: GOLD's caution leads. */
  icsCaution: boolean
  /** Asthma present: ICS is essential, and the caution must not read as "stop". */
  icsEssential: boolean
  onTbTreatment: boolean
}

export function assessAirways(ctx: PatientContext): AirwaysAssessment {
  const applies = Boolean(ctx.copd || ctx.asthma)
  const onTbTreatment = ctx.currentDrugs.length > 0
  return {
    applies,
    icsCaution: Boolean(ctx.copd && (ctx.onInhaledSteroid || !ctx.asthma)),
    icsEssential: Boolean(ctx.asthma),
    onTbTreatment,
  }
}

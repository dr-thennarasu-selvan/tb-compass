import type { PatientContext } from '@/types/patient'
import type { Severity } from '@/types/content'
import {
  NTEP_OPTIONS,
  PREGNANCY_DRUGS,
  type PregnancyDrugNote,
  type RegimenOption,
} from '@/content/pregnancy'

/**
 * Pregnancy and breastfeeding assessment. Pure: no React, no I/O.
 *
 * Walks the NTEP "Duration of pregnancy" flowchart (DR-TB 2024, p. 41) and
 * flags any drug the patient is on that the sources bar at this gestation.
 */

/**
 * Gestational band, as the NTEP flowchart splits it.
 *
 * The source's cut-off is "<20 or <24 weeks … as per latest MTP gazette
 * notification". It does not say which applies to whom, so 20–24 weeks is its
 * own band rather than being rounded to either side.
 */
export type GestationBand = 'unknown' | 'under-20' | '20-to-24' | '24-plus'

export function gestationBand(weeks: number | undefined): GestationBand {
  if (weeks == null) return 'unknown'
  if (weeks < 20) return 'under-20'
  if (weeks < 24) return '20-to-24'
  return '24-plus'
}

export interface PathwayStep {
  /** The flowchart branch this patient is on, stated as the source states it. */
  branch: string
  /** Regimens in the source's order of preference. */
  options: RegimenOption[]
  /** What would change the branch, if anything is unresolved. */
  pending?: string
  severity: Severity
}

export interface DrugFlag {
  note: PregnancyDrugNote
  /** Why this drug, for this patient, now. */
  reason: string
  severity: Severity
}

/**
 * Which half of the module applies. Classification is derived by the cascade;
 * where it is not settled, the prescribed drugs are the next best evidence,
 * and where neither says, both halves are shown.
 */
export type PregnancyTrack = 'ds' | 'dr' | 'both'

const DR_CLASSES = ['rr-tb', 'mdr-tb', 'pre-xdr-tb', 'xdr-tb']

export function pregnancyTrack(ctx: PatientContext): PregnancyTrack {
  if (ctx.classification && DR_CLASSES.includes(ctx.classification)) return 'dr'
  if (ctx.classification === 'ds-tb' || ctx.classification === 'hr-tb') return 'ds'
  if (ctx.currentDrugs.includes('rifampicin')) return 'ds'
  if (['bedaquiline', 'pretomanid', 'linezolid'].some((d) => ctx.currentDrugs.includes(d))) return 'dr'
  return 'both'
}

export interface PregnancyAssessment {
  applies: boolean
  track: PregnancyTrack
  band: GestationBand
  pathway?: PathwayStep
  /** Drugs the patient is currently on that the sources bar or restrict. */
  flags: DrugFlag[]
  ethionamideAllowed: boolean
}

/** NTEP flowchart, p. 41. */
export function ntepPathway(ctx: PatientContext): PathwayStep | undefined {
  if (!ctx.pregnant) return undefined
  const band = gestationBand(ctx.gestationWeeks)
  const { bpalm, shorterLzd, longer } = NTEP_OPTIONS

  if (band === 'unknown') {
    return {
      branch: 'Gestational age not recorded',
      options: [shorterLzd, longer],
      pending:
        'Enter the gestation. Below 20/24 weeks, and if she opts for MTP, BPaLM becomes available after termination. The linezolid shorter regimen is open at any gestation.',
      severity: 'caution',
    }
  }

  if (band === '24-plus' || ctx.mtpDecision === 'declined') {
    return {
      branch:
        band === '24-plus'
          ? `${ctx.gestationWeeks} weeks — beyond the MTP window`
          : 'Declined MTP after counselling',
      options: [shorterLzd, longer],
      severity: 'warning',
    }
  }

  // Below 24 weeks and not declined.
  const grey =
    band === '20-to-24'
      ? ' Between 20 and 24 weeks, whether termination is permitted depends on her category under the MTP notification — confirm with the obstetrician.'
      : ''

  if (ctx.mtpDecision === 'willing') {
    return {
      branch: `${ctx.gestationWeeks} weeks — opted for MTP`,
      options: [bpalm, shorterLzd, longer],
      pending: `BPaLM applies once the MTP is done.${grey}`,
      severity: 'info',
    }
  }

  return {
    branch: `${ctx.gestationWeeks} weeks — within the MTP window`,
    options: [shorterLzd, longer],
    pending: `Advise and counsel on MTP. If she opts for it, BPaLM becomes the first option after the MTP; if she declines, this branch stands.${grey}`,
    severity: 'caution',
  }
}

export function assessPregnancy(ctx: PatientContext): PregnancyAssessment {
  const applies = Boolean(ctx.pregnant || ctx.breastfeeding)
  const band = gestationBand(ctx.gestationWeeks)
  const weeks = ctx.gestationWeeks
  const ethionamideAllowed = !ctx.pregnant || (weeks != null && weeks >= 32)

  const flags: DrugFlag[] = []
  for (const note of PREGNANCY_DRUGS) {
    if (!ctx.currentDrugs.includes(note.drugId)) continue

    if (ctx.pregnant) {
      if (note.stance === 'barred') {
        flags.push({ note, reason: 'Barred in pregnancy.', severity: 'critical' })
      } else if (note.stance === 'conditional' && note.allowedFrom === 'postpartum') {
        flags.push({ note, reason: 'Contraindicated throughout pregnancy — post partum only.', severity: 'critical' })
      } else if (note.stance === 'conditional' && typeof note.allowedFrom === 'number') {
        if (weeks == null) {
          flags.push({
            note,
            reason: `Barred before ${note.allowedFrom} weeks, and the gestation is not recorded.`,
            severity: 'warning',
          })
        } else if (weeks < note.allowedFrom) {
          flags.push({
            note,
            reason: `Barred before ${note.allowedFrom} weeks; she is at ${weeks}.`,
            severity: 'critical',
          })
        }
      } else if (note.stance === 'caution') {
        flags.push({ note, reason: note.pregnancy, severity: 'caution' })
      }
    }

    if (ctx.breastfeeding && note.breastfeeding && note.stance !== 'preferred' && note.stance !== 'usable') {
      flags.push({
        note,
        reason: note.breastfeeding,
        // The source allows pretomanid if she replaces breastfeeding with
        // formula — a decision for her, not a stop.
        severity: note.drugId === 'pretomanid' ? 'warning' : 'caution',
      })
    }
  }

  return {
    applies,
    track: pregnancyTrack(ctx),
    band,
    pathway: ntepPathway(ctx),
    flags,
    ethionamideAllowed,
  }
}

import type { PatientContext } from '@/types/patient'
import { QT_GRADES, QT_PROLONGING_DRUGS, type QtGrade } from '@/content/qt'

/**
 * Fridericia correction: QTcF = QT / cbrt(RR), with RR in seconds.
 *
 * Fridericia rather than Bazett because that is what NTEP specifies, and
 * because Bazett over-corrects at high heart rates — which is exactly the
 * situation (febrile, unwell TB patient) where the difference decides whether
 * a drug gets stopped.
 */
export function qtcFridericia(qtMs: number | undefined, heartRate: number | undefined): number | undefined {
  if (qtMs == null || heartRate == null) return undefined
  if (!Number.isFinite(qtMs) || !Number.isFinite(heartRate) || heartRate <= 0) return undefined
  const rrSeconds = 60 / heartRate
  return qtMs / Math.cbrt(rrSeconds)
}

/** Bazett, for comparison only — shows how much the correction choice matters. */
export function qtcBazett(qtMs: number | undefined, heartRate: number | undefined): number | undefined {
  if (qtMs == null || heartRate == null) return undefined
  if (!Number.isFinite(qtMs) || !Number.isFinite(heartRate) || heartRate <= 0) return undefined
  return qtMs / Math.sqrt(60 / heartRate)
}

export interface QtAssessment {
  qtcf: number | undefined
  grade: QtGrade | undefined
  /** Why a grade could not be assigned. */
  blocked?: string
  /** QT-prolonging drugs in the current regimen. */
  offendingDrugs: { id: string; name: string; note?: string }[]
  /** Whether NTEP requires ECG monitoring for this regimen. */
  ecgRequired: boolean
  ecgReason: string
  /** Electrolytes that are low or not recorded, which change the action. */
  electrolyteFlags: string[]
}

export function assessQt(
  ctx: PatientContext,
  opts: { symptomaticArrhythmia: boolean; confirmedOnTwoEcgs: boolean; lifeThreatening: boolean },
): QtAssessment {
  const qtcf = ctx.labs.qtc
  const offendingDrugs = QT_PROLONGING_DRUGS.filter((d) => ctx.currentDrugs.includes(d.id))

  // NTEP: monitoring required with bedaquiline, or with any two QT-prolonging drugs.
  const hasBdq = ctx.currentDrugs.includes('bedaquiline')
  const ecgRequired = hasBdq || offendingDrugs.length >= 2
  const ecgReason = hasBdq
    ? 'Bedaquiline is in the regimen — ECG monitoring is required on its own.'
    : offendingDrugs.length >= 2
      ? `Two or more QT-prolonging drugs combined: ${offendingDrugs.map((d) => d.name).join(', ')}.`
      : offendingDrugs.length === 1
        ? `Only one QT-prolonging drug (${offendingDrugs[0].name}) and no bedaquiline — NTEP does not require routine ECG monitoring on this basis alone.`
        : 'No QT-prolonging drug in the current regimen.'

  const electrolyteFlags: string[] = []
  if (ctx.labs.potassium == null) electrolyteFlags.push('Potassium not recorded')
  else if (ctx.labs.potassium < 3.5) electrolyteFlags.push(`Potassium ${ctx.labs.potassium} mmol/L is low`)

  let grade: QtGrade | undefined
  let blocked: string | undefined

  if (qtcf == null) {
    blocked = 'QTcF not entered. Enter it in the patient context, or compute it below from QT and heart rate.'
  } else if (ctx.sex !== 'male' && ctx.sex !== 'female') {
    blocked = 'Sex not recorded — the normal and Grade 1 thresholds differ between males and females.'
  } else {
    const lowerNormal = ctx.sex === 'male' ? 450 : 470
    if (opts.lifeThreatening && qtcf > 500) grade = QT_GRADES[4]
    else if (qtcf > 500 && (opts.confirmedOnTwoEcgs || opts.symptomaticArrhythmia)) grade = QT_GRADES[3]
    else if (qtcf > 500) {
      // Above 500 but not yet confirmed on a second ECG. NTEP's Grade 3 needs
      // two ECGs, so say what is missing rather than grading on one tracing.
      grade = QT_GRADES[2]
      blocked =
        'QTcF is above 500 ms but Grade 3 requires confirmation on TWO separate ECGs. Repeat the ECG. Grade 2 actions apply meanwhile.'
    } else if (qtcf >= 481) grade = QT_GRADES[2]
    else if (qtcf >= lowerNormal) grade = QT_GRADES[1]
    else grade = QT_GRADES[0]
  }

  return { qtcf, grade, blocked, offendingDrugs, ecgRequired, ecgReason, electrolyteFlags }
}

import type { Action, GuidelinePack, Severity } from '@/types/content'
import type { Labs, LabReferenceRanges, PatientContext } from '@/types/patient'
import { DRUGS, type Drug } from '@/content/drugs'
import {
  ALARM_FEATURES,
  ALTERNATIVE_CAUSES,
  DILI_ACTIONS,
  thresholdsFor,
  type DiliThresholds,
  HEPATITIS_SYMPTOMS,
  type AlarmId,
  type SymptomId,
} from '@/content/playbooks/dili'

export type InjuryPattern = 'hepatocellular' | 'mixed' | 'cholestatic'

export interface DiliInput {
  symptoms: SymptomId[]
  alarms: AlarmId[]
  /** Alternative-cause statement ids the clinician has actively excluded. */
  excludedCauses: string[]
}

export interface DiliAssessment {
  /** Human-readable names of context fields needed but absent. */
  missing: string[]

  altX?: number
  astX?: number
  alpX?: number
  bilirubinX?: number

  rRatio?: number
  pattern?: InjuryPattern

  hysLaw: { met: boolean; explanation: string }

  /** Whether the withdrawal threshold is crossed, and why. */
  withdrawal: { indicated: boolean; reason: string }

  severity: Severity
  alarmsPresent: string[]
  symptomatic: boolean

  /** Drugs in the current regimen that would be withdrawn. */
  culprits: Drug[]
  /** Drugs in the current regimen that can be continued on hepatic grounds. */
  retained: Drug[]

  actions: Action[]

  /** Cause ids the clinician has ticked off, passed through for order building. */
  excludedCauseIds: string[]
  /** Jaundice on rifampicin with no direct bilirubin entered yet. */
  needsBilirubinSplit: boolean

  /** True when labs have recovered enough to begin sequential reintroduction. */
  readyForRechallenge: boolean
  rechallengeBlockers: string[]
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export function xUln(value: number | undefined, uln: number): number | undefined {
  if (value == null || !Number.isFinite(value) || uln <= 0) return undefined
  return value / uln
}

/**
 * CIOMS R ratio = (ALT / ALT ULN) / (ALP / ALP ULN).
 * Classifies the pattern of injury, which narrows the differential and changes
 * which alternative causes are worth chasing.
 */
export function rRatio(labs: Labs, ranges: LabReferenceRanges): number | undefined {
  const alt = xUln(labs.alt, ranges.altUln)
  const alp = xUln(labs.alp, ranges.alpUln)
  if (alt == null || alp == null || alp === 0) return undefined
  return alt / alp
}

export function patternFromR(
  r: number | undefined,
  t: DiliThresholds,
): InjuryPattern | undefined {
  if (r == null) return undefined
  if (r >= t.rRatioHepatocellular.value) return 'hepatocellular'
  if (r <= t.rRatioCholestatic.value) return 'cholestatic'
  return 'mixed'
}

/**
 * Hy's Law, operational definition: hepatocellular injury (ALT or AST at or
 * above 3x ULN) with total bilirubin at or above 2x ULN, in the absence of
 * significant cholestasis (ALP below 2x ULN), and with no better explanation.
 *
 * The final clause is a clinical judgement this function cannot make — the UI
 * states it explicitly rather than implying the calculation settles it.
 */
export function evaluateHysLaw(
  labs: Labs,
  ranges: LabReferenceRanges,
  t: DiliThresholds,
): { met: boolean; explanation: string } {
  const alt = xUln(labs.alt, ranges.altUln)
  const ast = xUln(labs.ast, ranges.astUln)
  const alp = xUln(labs.alp, ranges.alpUln)
  const bili = xUln(labs.bilirubinTotal, ranges.bilirubinUln)

  const transaminase = Math.max(alt ?? 0, ast ?? 0)
  if ((alt == null && ast == null) || bili == null) {
    return { met: false, explanation: 'Needs ALT or AST plus total bilirubin to evaluate.' }
  }

  const tOk = transaminase >= t.hysLawAlt.value
  const bOk = bili >= t.hysLawBilirubin.value
  const cholestasisExcluded = alp == null || alp < t.hysLawAlpCeiling.value

  if (tOk && bOk && cholestasisExcluded) {
    return {
      met: true,
      explanation:
        alp == null
          ? "Transaminase and bilirubin criteria are met. ALP was not entered, so cholestasis has not been formally excluded — enter ALP to complete the assessment."
          : 'Transaminase and bilirubin criteria are met with ALP below 2x ULN, so this is not explained by cholestasis.',
    }
  }

  const failures: string[] = []
  if (!tOk) failures.push(`peak transaminase ${transaminase.toFixed(1)}x ULN is below 3x`)
  if (!bOk) failures.push(`bilirubin ${bili.toFixed(1)}x ULN is below 2x`)
  if (!cholestasisExcluded) failures.push(`ALP ${alp!.toFixed(1)}x ULN indicates cholestasis`)
  return { met: false, explanation: `Not met: ${failures.join('; ')}.` }
}

// ---------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------

export function assessDili(
  ctx: PatientContext,
  input: DiliInput,
  pack: GuidelinePack,
): DiliAssessment {
  const t = thresholdsFor(pack)
  const { labs, ranges } = ctx
  const missing: string[] = []
  if (labs.alt == null && labs.ast == null) missing.push('ALT (or AST)')
  if (labs.bilirubinTotal == null) missing.push('total bilirubin')
  if (labs.alp == null) missing.push('ALP (needed for injury pattern and Hy’s Law)')

  const altX = xUln(labs.alt, ranges.altUln)
  const astX = xUln(labs.ast, ranges.astUln)
  const alpX = xUln(labs.alp, ranges.alpUln)
  const bilirubinX = xUln(labs.bilirubinTotal, ranges.bilirubinUln)

  const r = rRatio(labs, ranges)
  const pattern = patternFromR(r, t)
  const hysLaw = evaluateHysLaw(labs, ranges, t)

  const symptomLabels: string[] = input.symptoms.flatMap((id) => {
    const label = HEPATITIS_SYMPTOMS.find((s) => s.id === id)?.label
    return label ? [label as string] : []
  })
  const symptomatic = symptomLabels.length > 0
  const alarmsPresent: string[] = input.alarms.flatMap((id) => {
    const label = ALARM_FEATURES.find((a) => a.id === id)?.label
    return label ? [label as string] : []
  })

  const withdrawal = evaluateWithdrawal(altX, astX, bilirubinX, symptomatic, symptomLabels, t)
  const severity = gradeSeverity(withdrawal.indicated, hysLaw.met, alarmsPresent.length > 0, altX)

  // Present drugs in the canonical registry order (H, R, Z, E, ...), not the
  // order the clinician happened to tick them in — HRZE is read as a fixed set.
  const regimen = DRUGS.filter((d) => ctx.currentDrugs.includes(d.id))
  const culprits = regimen.filter((d) => d.withdrawInDili)
  const retained = regimen.filter((d) => !d.withdrawInDili)

  const needsBilirubinSplit =
    input.symptoms.includes('jaundice') &&
    ctx.currentDrugs.includes('rifampicin') &&
    labs.bilirubinDirect == null

  const actions = buildActions({
    withdrawalIndicated: withdrawal.indicated,
    alarms: alarmsPresent.length > 0,
    needsBilirubinSplit,
    allCausesExcluded: input.excludedCauses.length >= ALTERNATIVE_CAUSES.length,
  })

  const { ready, blockers } = evaluateRechallengeReadiness(ctx, input, t)

  return {
    missing,
    altX,
    astX,
    alpX,
    bilirubinX,
    rRatio: r,
    pattern,
    hysLaw,
    withdrawal,
    severity,
    alarmsPresent,
    symptomatic,
    culprits,
    retained,
    actions,
    excludedCauseIds: input.excludedCauses,
    needsBilirubinSplit,
    readyForRechallenge: ready,
    rechallengeBlockers: blockers,
  }
}

function evaluateWithdrawal(
  altX: number | undefined,
  astX: number | undefined,
  bilirubinX: number | undefined,
  symptomatic: boolean,
  symptomLabels: string[],
  t: DiliThresholds,
): { indicated: boolean; reason: string } {
  const peak = Math.max(altX ?? 0, astX ?? 0)
  if (altX == null && astX == null) {
    return { indicated: false, reason: 'No transaminase value entered — cannot assess.' }
  }
  const sym = t.stopSymptomatic.value
  const asym = t.stopAsymptomatic.value

  // NTEP's flowchart adds a combined criterion that ATS does not have:
  // transaminase at or above 3x ULN TOGETHER WITH bilirubin at or above 2x.
  // Either limb alone does not trigger it.
  if (t.stopWithBilirubin && bilirubinX != null) {
    const combined = t.stopWithBilirubin.value
    if (peak >= combined && bilirubinX >= 2) {
      return {
        indicated: true,
        reason: `Peak transaminase ${peak.toFixed(1)}x ULN together with bilirubin ${bilirubinX.toFixed(1)}x ULN meets the combined criterion (transaminase at or above ${combined}x WITH bilirubin at or above 2x).`,
      }
    }
  }

  if (symptomatic && peak >= sym) {
    return {
      indicated: true,
      reason:
        sym === 0
          ? `Symptoms are present (${symptomLabels.join(', ').toLowerCase()}), which this guideline treats as an independent trigger to withhold regardless of the transaminase level. Peak transaminase is ${peak.toFixed(1)}x ULN.`
          : `Peak transaminase ${peak.toFixed(1)}x ULN is at or above the ${sym}x threshold that applies when symptoms are present (${symptomLabels.join(', ').toLowerCase()}).`,
    }
  }
  if (peak >= asym) {
    return {
      indicated: true,
      reason: `Peak transaminase ${peak.toFixed(1)}x ULN is at or above the ${asym}x threshold that applies without symptoms.`,
    }
  }
  if (symptomatic) {
    return {
      indicated: false,
      reason: `Peak transaminase ${peak.toFixed(1)}x ULN is below the ${sym}x symptomatic threshold. Symptoms are present, so repeat the panel rather than treating this as resolved.`,
    }
  }
  return {
    indicated: false,
    reason: `Peak transaminase ${peak.toFixed(1)}x ULN is below the ${asym}x asymptomatic threshold.`,
  }
}

function gradeSeverity(
  withdrawalIndicated: boolean,
  hysLaw: boolean,
  alarms: boolean,
  altX: number | undefined,
): Severity {
  if (alarms || hysLaw) return 'critical'
  if (withdrawalIndicated) return 'warning'
  if ((altX ?? 0) > 1) return 'caution'
  return 'ok'
}

function buildActions(f: {
  withdrawalIndicated: boolean
  alarms: boolean
  needsBilirubinSplit: boolean
  allCausesExcluded: boolean
}): Action[] {
  const out: Action[] = []
  if (f.alarms) out.push(DILI_ACTIONS.referUrgent)
  if (f.withdrawalIndicated) {
    out.push(DILI_ACTIONS.stopHepatotoxic)
    out.push(DILI_ACTIONS.bridgeRegimen)
  }
  if (f.needsBilirubinSplit) out.push(DILI_ACTIONS.checkBilirubinSplit)
  if (!f.allCausesExcluded) out.push(DILI_ACTIONS.excludeOther)
  out.push(DILI_ACTIONS.monitorSerial)
  out.push(DILI_ACTIONS.counselReport)

  const rank = { immediate: 0, 'same-day': 1, routine: 2 } as const
  return out.sort((a, b) => rank[a.urgency] - rank[b.urgency])
}

function evaluateRechallengeReadiness(
  ctx: PatientContext,
  input: DiliInput,
  t: DiliThresholds,
): { ready: boolean; blockers: string[] } {
  const blockers: string[] = []
  const altX = xUln(ctx.labs.alt, ctx.ranges.altUln)
  const bilirubinX = xUln(ctx.labs.bilirubinTotal, ctx.ranges.bilirubinUln)
  const limit = t.rechallengeAlt.value

  if (altX == null) blockers.push('ALT not entered.')
  else if (altX >= limit) blockers.push(`ALT is ${altX.toFixed(1)}x ULN — must fall below ${limit}x ULN.`)

  if (bilirubinX == null) blockers.push('Total bilirubin not entered.')
  else if (bilirubinX > 1) blockers.push(`Bilirubin is ${bilirubinX.toFixed(1)}x ULN — should normalise first.`)

  if (input.symptoms.length > 0) blockers.push('Hepatitis symptoms have not resolved.')
  if (input.alarms.length > 0) blockers.push('Alarm features are present — do not rechallenge.')

  return { ready: blockers.length === 0, blockers }
}

/** Drugs not present in the regimen but worth flagging as hepatotoxic if added. */
export function hepatotoxicDrugList(): Drug[] {
  return DRUGS.filter((d) => d.hepatotoxicity === 'high' || d.hepatotoxicity === 'moderate')
}

import type { Severity } from '@/types/content'
import type { PatientContext } from '@/types/patient'
import {
  ART_TIMING,
  INSHI_ANTECEDENTS,
  INSHI_MAJOR,
  INSHI_MINOR,
  IRIS_LADDER,
  IRIS_ONSET_WINDOW_DAYS,
  IRIS_RISK_FACTORS,
  type ArtTimingRule,
  type IrisSeverity,
  type IrisTreatment,
} from '@/content/iris'

export interface IrisInput {
  /** Antecedent criterion ids the clinician confirms. */
  antecedents: string[]
  major: string[]
  minor: string[]
  /** Alternative-cause ids actively excluded. */
  excluded: string[]
  severity: IrisSeverity | null
  /** Kaposi sarcoma suspected or confirmed — a hard steroid contraindication. */
  kaposiSuspected: boolean
}

export interface IrisAssessment {
  /** Whether all three antecedent requirements are confirmed. */
  antecedentsMet: boolean
  missingAntecedents: string[]
  /** Clinical criteria: at least 1 major OR at least 2 minor. */
  clinicalMet: boolean
  clinicalReason: string
  /** Onset within the 3-month window. */
  onsetInWindow: boolean | undefined
  onsetReason: string
  /** All mandatory exclusions ticked off. */
  exclusionsComplete: boolean
  outstandingExclusions: number
  /** Overall: does this meet the INSHI case definition? */
  verdict: 'meets' | 'does-not-meet' | 'incomplete'
  verdictReason: string
  severity: Severity
  /** Supporting signature from the labs, where recorded. */
  signature: { present: boolean | undefined; text: string }
  riskScore: number
  riskFactorsPresent: string[]
  treatment: IrisTreatment | null
  /** Blocks the steroid recommendation regardless of severity. */
  steroidBlockers: string[]
  artTiming: ArtTimingRule | null
  prophylaxisIndicated: boolean
}

export function assessIris(ctx: PatientContext, input: IrisInput): IrisAssessment {
  // --- antecedents -------------------------------------------------------
  const missingAntecedents = INSHI_ANTECEDENTS.filter(
    (a) => !input.antecedents.includes(a.id),
  ).map((a) => a.label)
  const antecedentsMet = missingAntecedents.length === 0

  // --- clinical criteria: >=1 major OR >=2 minor -------------------------
  const nMajor = input.major.length
  const nMinor = input.minor.length
  const clinicalMet = nMajor >= 1 || nMinor >= 2
  const clinicalReason = clinicalMet
    ? nMajor >= 1
      ? `${nMajor} major criteri${nMajor === 1 ? 'on' : 'a'} present.`
      : `${nMinor} minor criteria present.`
    : `Needs 1 major or 2 minor — currently ${nMajor} major, ${nMinor} minor.`

  // --- onset window ------------------------------------------------------
  let onsetInWindow: boolean | undefined
  let onsetReason: string
  if (ctx.daysSinceArt == null) {
    onsetInWindow = undefined
    onsetReason = 'Days since ART not entered — the 3-month onset window cannot be checked.'
  } else if (ctx.daysSinceArt <= IRIS_ONSET_WINDOW_DAYS) {
    onsetInWindow = true
    onsetReason = `Day ${ctx.daysSinceArt} of ART — within the ${IRIS_ONSET_WINDOW_DAYS}-day window.`
  } else {
    onsetInWindow = false
    onsetReason = `Day ${ctx.daysSinceArt} of ART — beyond the ${IRIS_ONSET_WINDOW_DAYS}-day window. Reconsider the differential.`
  }

  // --- mandatory exclusions ---------------------------------------------
  const outstandingExclusions = 6 - input.excluded.length
  const exclusionsComplete = outstandingExclusions <= 0

  // --- verdict -----------------------------------------------------------
  let verdict: IrisAssessment['verdict']
  let verdictReason: string
  if (!antecedentsMet || !clinicalMet || onsetInWindow === false) {
    verdict = 'does-not-meet'
    verdictReason = !antecedentsMet
      ? 'Antecedent requirements not all met.'
      : !clinicalMet
        ? clinicalReason
        : onsetReason
  } else if (onsetInWindow === undefined || !exclusionsComplete) {
    verdict = 'incomplete'
    verdictReason = !exclusionsComplete
      ? `${outstandingExclusions} mandatory exclusion${outstandingExclusions === 1 ? '' : 's'} outstanding — IRIS is a diagnosis of exclusion.`
      : onsetReason
  } else {
    verdict = 'meets'
    verdictReason = 'Antecedents, clinical criteria, onset window and exclusions all satisfied.'
  }

  // --- diagnostic signature from labs ------------------------------------
  let signature: IrisAssessment['signature']
  if (ctx.cd4Rising == null && ctx.viralLoadFalling == null) {
    signature = {
      present: undefined,
      text: 'CD4 trend and viral load trend not recorded — the diagnostic signature cannot be checked.',
    }
  } else if (ctx.cd4Rising && ctx.viralLoadFalling) {
    signature = {
      present: true,
      text: 'Rising CD4 with falling viral load, alongside clinical deterioration — the diagnostic signature of IRIS.',
    }
  } else {
    signature = {
      present: false,
      text: 'The signature is incomplete. Deterioration WITHOUT immune reconstitution points away from IRIS and towards failure, resistance or a second process.',
    }
  }

  // --- risk stratification ----------------------------------------------
  const riskFactorsPresent: string[] = []
  let riskScore = 0
  const add = (id: string) => {
    const f = IRIS_RISK_FACTORS.find((x) => x.id === id)
    if (f) {
      riskFactorsPresent.push(f.label)
      riskScore += f.weight
    }
  }
  if (ctx.cd4 != null && ctx.cd4 < 50) add('cd4-50')
  if (ctx.viralLoad != null && ctx.viralLoad > 100000) add('vl-high')
  if (ctx.sites.some((s) => ['cns', 'miliary-disseminated', 'lymph-node'].includes(s)))
    add('disseminated')
  if (ctx.attToArtIntervalDays != null && ctx.attToArtIntervalDays < 28) add('short-interval')

  // --- treatment ---------------------------------------------------------
  const treatment = input.severity
    ? (IRIS_LADDER.find((t) => t.severity === input.severity) ?? null)
    : null

  // --- steroid blockers --------------------------------------------------
  const steroidBlockers: string[] = []
  if (input.kaposiSuspected) steroidBlockers.push('Kaposi sarcoma suspected — steroids worsen KS and may be fatal.')
  if (!input.excluded.includes('iris.alt.second-oi'))
    steroidBlockers.push('A second opportunistic infection has not been excluded.')
  if (!input.excluded.includes('iris.alt.mdr'))
    steroidBlockers.push('Drug-resistant TB has not been excluded.')
  if (ctx.classification && ['rr-tb', 'mdr-tb', 'pre-xdr-tb', 'xdr-tb'].includes(ctx.classification))
    steroidBlockers.push(
      `Patient is classified ${ctx.classification.toUpperCase()} — treat the resistance, not the inflammation.`,
    )

  // --- ART timing --------------------------------------------------------
  let artTiming: ArtTimingRule | null = null
  if (ctx.sites.includes('cns')) artTiming = ART_TIMING.find((r) => r.id === 'art.tbm') ?? null
  else if (ctx.hivPositive) artTiming = ART_TIMING.find((r) => r.id === 'art.tb') ?? null

  const prophylaxisIndicated =
    ctx.cd4 != null &&
    ctx.cd4 <= 100 &&
    ctx.attToArtIntervalDays != null &&
    ctx.attToArtIntervalDays <= 30

  const severity: Severity =
    verdict === 'meets' && input.severity === 'life-threatening'
      ? 'critical'
      : verdict === 'meets'
        ? 'warning'
        : verdict === 'incomplete'
          ? 'caution'
          : 'info'

  return {
    antecedentsMet,
    missingAntecedents,
    clinicalMet,
    clinicalReason,
    onsetInWindow,
    onsetReason,
    exclusionsComplete,
    outstandingExclusions,
    verdict,
    verdictReason,
    severity,
    signature,
    riskScore,
    riskFactorsPresent,
    treatment,
    steroidBlockers,
    artTiming,
    prophylaxisIndicated,
  }
}

export function riskBand(score: number): { label: string; severity: Severity } {
  if (score >= 4) return { label: 'High', severity: 'critical' }
  if (score >= 2) return { label: 'Moderate', severity: 'warning' }
  if (score >= 1) return { label: 'Low-moderate', severity: 'caution' }
  return { label: 'No recorded risk factors', severity: 'ok' }
}

export { INSHI_MAJOR, INSHI_MINOR }

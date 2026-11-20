import type { PatientContext } from '@/types/patient'
import type { GuidelinePack } from '@/types/content'
import { regimensFor, regimensForOtherPacks, type Regimen } from '@/content/regimens'

/**
 * Drug-susceptible TB: regimen selection and weight-band dosing.
 *
 * Weight bands are from the NTEP Standard Treatment Workflow for DS-TB
 * (March 2022). Adult FDCs: 4-FDC in the intensive phase is HRZE
 * 75/150/400/275; 3-FDC in the continuation phase is HRE 75/150/275.
 */

export interface WeightBand {
  min: number
  max: number | null
  label: string
  intensiveTablets: number
  continuationTablets: number
}

export const ADULT_WEIGHT_BANDS: WeightBand[] = [
  { min: 25, max: 34, label: '25–34 kg', intensiveTablets: 2, continuationTablets: 2 },
  { min: 35, max: 49, label: '35–49 kg', intensiveTablets: 3, continuationTablets: 3 },
  { min: 50, max: 64, label: '50–64 kg', intensiveTablets: 4, continuationTablets: 4 },
  { min: 65, max: 75, label: '65–75 kg', intensiveTablets: 5, continuationTablets: 5 },
  { min: 76, max: null, label: 'Over 75 kg', intensiveTablets: 6, continuationTablets: 6 },
]

export function bandFor(weightKg: number | undefined): WeightBand | undefined {
  if (weightKg == null || !Number.isFinite(weightKg)) return undefined
  return ADULT_WEIGHT_BANDS.find((b) => weightKg >= b.min && (b.max == null || weightKg <= b.max))
}

/** mg/kg dosing, for checking a weight-band FDC against the intended dose. */
export interface DrugDose {
  drug: string
  perKg: string
  computed?: string
}

export function mgPerKgDoses(weightKg: number | undefined): DrugDose[] {
  const at = (low: number, high: number) =>
    weightKg == null ? undefined : `${Math.round(low * weightKg)}–${Math.round(high * weightKg)} mg`
  return [
    { drug: 'Isoniazid (H)', perKg: '5 mg/kg daily (4–6)', computed: at(4, 6) },
    { drug: 'Rifampicin (R)', perKg: '10 mg/kg daily (8–12)', computed: at(8, 12) },
    { drug: 'Pyrazinamide (Z)', perKg: '25 mg/kg daily (20–30)', computed: at(20, 30) },
    { drug: 'Ethambutol (E)', perKg: '15 mg/kg daily (12–18)', computed: at(12, 18) },
    { drug: 'Streptomycin (S)', perKg: '15 mg/kg daily (15–20)', computed: at(15, 20) },
  ]
}

/**
 * Sites that extend the continuation phase. The STW extends CP to 24 weeks in
 * CNS and skeletal TB, and leaves disseminated disease to clinical judgement.
 */
export interface DurationAdjustment {
  applies: boolean
  text: string
  severity: 'warning' | 'caution' | 'info'
}

export function durationAdjustment(ctx: PatientContext): DurationAdjustment {
  if (ctx.sites.includes('cns')) {
    return {
      applies: true,
      text: 'CNS TB — extend the continuation phase. The STW extends CP to 24 weeks; the TBM workflows run 10 months of continuation for a 12-month total. See the TBM condition workflow, where the sources disagree on the third drug.',
      severity: 'warning',
    }
  }
  if (ctx.sites.includes('bone-joint')) {
    return {
      applies: true,
      text: 'Skeletal TB — extend the continuation phase to 24 weeks. Musculoskeletal workflows run a 12-month regimen; stop only when clinical, laboratory and radiological parameters have normalised.',
      severity: 'warning',
    }
  }
  if (ctx.sites.includes('miliary-disseminated')) {
    return {
      applies: true,
      text: 'Disseminated TB — the treating physician may extend on a case-by-case basis.',
      severity: 'caution',
    }
  }
  return { applies: false, text: 'Standard duration applies on the recorded sites.', severity: 'info' }
}

export function dsRegimens(pack: GuidelinePack): { mine: Regimen[]; others: Regimen[] } {
  return { mine: regimensFor([], pack), others: regimensForOtherPacks([], pack) }
}

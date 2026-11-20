import type { PatientContext, TbSite } from '@/types/patient'

/**
 * What a module still needs before it can answer.
 *
 * `engine/moduleStatus.ts` returns undefined when a module has nothing to say,
 * which is right for a home card but leaves the clinician inside the module
 * looking at silence. The type contract in types/patient.ts is explicit that a
 * module must "tell the clinician which missing field is blocking a conclusion,
 * rather than guessing or refusing to run" — this is that list, and the UI
 * renders it as inline entry so the answer appears without leaving the module.
 *
 * Pure: no React, no I/O. The severity of the gap is not modelled, because
 * every field here is equally blocking — a partial answer from a partial
 * context is the failure mode this exists to prevent.
 */

/**
 * `here` — entered inside the module itself (a search, a picker). The home
 * card names it; the in-module bar does not repeat what is already on screen.
 */
export type NeedKind = 'number' | 'toggle' | 'choice' | 'sites' | 'navigate' | 'here'

export interface Need {
  /** Dotted path into the context, or a view id when kind is 'navigate'. */
  id: string
  label: string
  /**
   * Noun for the home card's "needs …" hint. Separate from `label` because the
   * label is an instruction on a button ("Work through the diagnostic pathway")
   * where the hint needs a thing ("classification") — and because lower-casing
   * a label to fit the sentence turns ALT into alt.
   */
  short: string
  unit?: string
  kind: NeedKind
  /** Why this field changes the answer — shown on the chip, not hidden. */
  why: string
  /** For kind 'choice': boolean fields, any one of which answers the need. */
  choices?: { id: string; label: string }[]
}

const NEED: Record<string, Need> = {
  ageYears: { id: 'ageYears', label: 'Age', short: 'age', unit: 'years', kind: 'number', why: 'Cockcroft-Gault' },
  weightKg: { id: 'weightKg', label: 'Weight', short: 'weight', unit: 'kg', kind: 'number', why: 'weight band' },
  creatinine: {
    id: 'labs.creatinine',
    label: 'Creatinine',
    short: 'creatinine',
    unit: 'mg/dL',
    kind: 'number',
    why: 'creatinine clearance',
  },
  alt: { id: 'labs.alt', label: 'ALT', short: 'ALT', unit: 'U/L', kind: 'number', why: 'withdrawal threshold' },
  qtc: { id: 'labs.qtc', label: 'QTcF', short: 'QTcF', unit: 'ms', kind: 'number', why: 'NTEP grading' },
  pregnancy: {
    id: 'pregnancy',
    label: 'Pregnant or breastfeeding',
    short: 'pregnancy status',
    kind: 'choice',
    choices: [
      { id: 'pregnant', label: 'Pregnant' },
      { id: 'breastfeeding', label: 'Breastfeeding' },
    ],
    why: 'the regimen and drug rules turn on pregnancy or breastfeeding',
  },
  rbs: {
    id: 'labs.rbs',
    label: 'Random blood sugar',
    short: 'blood sugar',
    unit: 'mg/dL',
    kind: 'number',
    why: 'NTEP screens every person with TB for diabetes',
  },
  airways: {
    id: 'airways',
    label: 'Airways disease',
    short: 'COPD or asthma status',
    kind: 'choice',
    choices: [
      { id: 'copd', label: 'COPD' },
      { id: 'asthma', label: 'Asthma' },
    ],
    why: 'the inhaled-steroid advice differs between COPD and asthma',
  },
  gestation: {
    id: 'gestationWeeks',
    label: 'Gestation',
    short: 'gestation',
    unit: 'weeks',
    kind: 'number',
    why: 'the regimen pathway splits at 20/24 and 32 weeks',
  },
  coMedications: {
    id: 'coMedications',
    label: 'Other medicines',
    short: 'other medicines',
    kind: 'here',
    why: 'interactions are checked against what else the patient takes',
  },
  hiv: { id: 'hivPositive', label: 'HIV positive', short: 'HIV status', kind: 'toggle', why: 'IRIS applies only in HIV' },
  sites: { id: 'sites', label: 'Site of disease', short: 'site of disease', kind: 'sites', why: 'selects the workflow' },
  classification: {
    id: 'cascade',
    label: 'Work through the diagnostic pathway',
    short: 'classification',
    kind: 'navigate',
    why: 'classification is derived from results, never entered directly',
  },
}

/**
 * Sites that have an ICMR condition workflow. Pulmonary alone is not one —
 * the extrapulmonary module has nothing to show for it.
 */
const EPTB_SITES: TbSite[] = [
  'pleural',
  'lymph-node',
  'cns',
  'bone-joint',
  'abdominal',
  'pericardial',
  'genitourinary',
  'miliary-disseminated',
]

export function moduleNeeds(view: string, ctx: PatientContext): Need[] {
  const missing: Need[] = []

  switch (view) {
    case 'dstb':
      if (ctx.weightKg == null) missing.push(NEED.weightKg)
      break

    case 'drtb':
      if (!ctx.classification || ctx.classification === 'unknown') missing.push(NEED.classification)
      break

    case 'dili':
      if (ctx.labs.alt == null && ctx.labs.ast == null) missing.push(NEED.alt)
      break

    case 'renal':
      if (ctx.ageYears == null) missing.push(NEED.ageYears)
      if (ctx.weightKg == null) missing.push(NEED.weightKg)
      if (ctx.labs.creatinine == null) missing.push(NEED.creatinine)
      break

    case 'qt':
      if (ctx.labs.qtc == null) missing.push(NEED.qtc)
      break

    case 'iris':
      if (!ctx.hivPositive) missing.push(NEED.hiv)
      break

    case 'interactions':
      if (ctx.coMedications.length === 0) missing.push(NEED.coMedications)
      break

    case 'diabetes':
      if (!ctx.diabetes && ctx.labs.rbs == null && ctx.labs.hba1c == null && ctx.labs.fbs == null) missing.push(NEED.rbs)
      break

    case 'airways':
      if (!ctx.copd && !ctx.asthma) missing.push(NEED.airways)
      break

    case 'pregnancy':
      if (!ctx.pregnant && !ctx.breastfeeding) missing.push(NEED.pregnancy)
      else if (ctx.pregnant && ctx.gestationWeeks == null) missing.push(NEED.gestation)
      break

    case 'eptb':
      if (!ctx.sites.some((s) => EPTB_SITES.includes(s))) missing.push(NEED.sites)
      break

    // The cascade and the hypersensitivity module are answered by what the
    // clinician selects inside them, not by the stored context. Nothing to ask for.
    default:
      break
  }

  return missing
}

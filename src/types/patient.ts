/**
 * Patient context.
 *
 * Entered once, then drives every module. Nothing here leaves the device:
 * the context lives in memory and (optionally) localStorage, and there is no
 * network layer in this app at all. Keep it that way — it is the reason this
 * carries no meaningful data-protection burden.
 *
 * Every field is optional. Modules must degrade gracefully and tell the
 * clinician which missing field is blocking a conclusion, rather than
 * guessing or refusing to run.
 */

export type TbClassification =
  | 'ds-tb'
  | 'hr-tb'            // isoniazid-resistant, rifampicin-susceptible
  | 'rr-tb'            // rifampicin-resistant
  | 'mdr-tb'
  | 'pre-xdr-tb'
  | 'xdr-tb'
  | 'poly-resistant'
  | 'unknown'

export type TbSite =
  | 'pulmonary'
  | 'pleural'
  | 'lymph-node'
  | 'cns'              // meningitis / tuberculoma
  | 'bone-joint'
  | 'abdominal'
  | 'pericardial'
  | 'genitourinary'
  | 'miliary-disseminated'
  | 'other'

export type Sex = 'female' | 'male' | 'other' | 'unspecified'

export interface Labs {
  /** Alanine aminotransferase, U/L. */
  alt?: number
  /** Aspartate aminotransferase, U/L. */
  ast?: number
  /** Alkaline phosphatase, U/L. */
  alp?: number
  /** Total bilirubin, mg/dL. */
  bilirubinTotal?: number
  /** Direct/conjugated bilirubin, mg/dL. */
  bilirubinDirect?: number
  albumin?: number
  inr?: number
  platelets?: number
  creatinine?: number
  potassium?: number
  /** Random blood sugar, mg/dL. */
  rbs?: number
  /** Fasting blood sugar, mg/dL. */
  fbs?: number
  /** Post-prandial blood sugar, mg/dL. */
  ppbs?: number
  /** Glycated haemoglobin, %. */
  hba1c?: number
  /** Corrected QT interval, ms — store the method used alongside. */
  qtc?: number
  qtcMethod?: 'fridericia' | 'bazett' | 'unspecified'
  /** ISO date the panel was drawn. */
  drawnOn?: string
}

/** Laboratory upper limits of normal. Site-specific; do not hard-code. */
export interface LabReferenceRanges {
  altUln: number
  astUln: number
  alpUln: number
  bilirubinUln: number
}

export const DEFAULT_LAB_RANGES: LabReferenceRanges = {
  altUln: 40,
  astUln: 40,
  alpUln: 120,
  bilirubinUln: 1.2,
}

import { emptyDiagnosis, type DiagnosticState } from '@/types/diagnosis'

export interface PatientContext {
  /** Local-only label, e.g. bed number or initials. Never transmitted. */
  label?: string
  ageYears?: number
  sex?: Sex
  weightKg?: number

  /**
   * DERIVED from `diagnosis` by engine/cascade.ts, then written back here so
   * the complication modules can read it without knowing about the cascade.
   * Treat it as a cache, not a source of truth.
   */
  classification?: TbClassification
  diagnosis: DiagnosticState
  sites: TbSite[]
  /** Day of treatment at the time of the current query. */
  treatmentDay?: number

  /** Drug ids currently prescribed — see content/drugs.ts. */
  currentDrugs: string[]
  /**
   * Non-TB medicines, for the interaction checker: ids from
   * content/interactions.ts (CO_MEDS or UNSOURCED), or `free:<text>` for a
   * name the checker does not recognise.
   */
  coMedications: string[]

  hivPositive?: boolean
  onArt?: boolean
  artRegimen?: string
  /** CD4 count, cells/uL. The strongest single predictor of TB-IRIS. */
  cd4?: number
  /** HIV viral load, copies/mL. */
  viralLoad?: number
  /** Direction of travel since baseline — IRIS requires immune reconstitution. */
  cd4Rising?: boolean
  viralLoadFalling?: boolean
  /** Days since antiretroviral therapy was started, restarted or changed. */
  daysSinceArt?: number
  /** Days between starting anti-TB treatment and starting ART. */
  attToArtIntervalDays?: number
  /** Did the patient improve or stabilise on ATT before ART started? */
  improvedBeforeArt?: boolean
  pregnant?: boolean
  /** Completed weeks of gestation. Drives the NTEP regimen pathway (<20/<24, 32 weeks). */
  gestationWeeks?: number
  /**
   * The patient's decision on medical termination, after counselling. Recorded
   * because NTEP makes BPaLM conditional on it below 20/24 weeks — never
   * inferred, and never defaulted.
   */
  mtpDecision?: 'willing' | 'declined'
  breastfeeding?: boolean

  /** What the physician is seeing that prompted the "not improving" module. */
  responseTriggers?: string[]
  /** Known diabetes. Screening results live in `labs`. */
  diabetes?: boolean
  /** Airways comorbidity — drives the COPD/asthma module. */
  copd?: boolean
  asthma?: boolean
  /** Currently on an inhaled corticosteroid (alone or in combination). */
  onInhaledSteroid?: boolean
  smoker?: boolean

  /** Pre-existing chronic liver disease, cirrhosis, or chronic viral hepatitis. */
  chronicLiverDisease?: boolean
  alcoholUse?: 'none' | 'moderate' | 'heavy' | 'unknown'
  /** Other hepatotoxic agents in use (co-trimoxazole, azoles, paracetamol, etc.). */
  otherHepatotoxins: string[]

  labs: Labs
  /** Pre-treatment baseline panel, for x-baseline comparisons. */
  baselineLabs?: Labs
  ranges: LabReferenceRanges
}

export function emptyContext(): PatientContext {
  return {
    diagnosis: emptyDiagnosis(),
    sites: [],
    currentDrugs: [],
    coMedications: [],
    otherHepatotoxins: [],
    labs: {},
    ranges: { ...DEFAULT_LAB_RANGES },
  }
}

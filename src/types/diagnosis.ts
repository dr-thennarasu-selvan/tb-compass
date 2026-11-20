import type { TbClassification } from '@/types/patient'

/**
 * The diagnostic cascade.
 *
 * Classification is NOT a fact you record once. It is a provisional state that
 * changes as laboratory results arrive, and the regimen changes with it. NTEP
 * says this explicitly in the footnotes to its integrated diagnostic algorithm:
 * "Start treatment based on NAAT for H, FQ resistance detection / LPA and
 * modify based on LC-DST results whenever available."
 *
 * So every test carries three possible states, and `pending` is the one that
 * matters most — it is what tells the clinician which escalation is still
 * possible and what would change when the result lands.
 */

export type ResultState = 'not-sent' | 'pending' | 'resulted'

/** Which diagnostic track the patient is on. These behave differently. */
export type DiagnosticTrack =
  | 'presumptive'            // symptoms, not yet worked up
  | 'microbiologically-confirmed'
  | 'clinically-radiologically-diagnosed'

export interface NaatResult {
  state: ResultState
  /** M. tuberculosis detected on CBNAAT / Truenat / other NAAT. */
  mtbDetected?: boolean
  /** Rifampicin resistance: the first and most consequential fork. */
  rifResistance?: 'detected' | 'not-detected' | 'indeterminate'
  /** Specimen type — extrapulmonary specimens route differently. */
  specimen?: string
}

export interface LpaResult {
  state: ResultState
  /** First-line LPA: isoniazid (katG / inhA) and rifampicin. */
  isoniazidResistance?: 'detected' | 'not-detected'
  katG?: boolean
  inhA?: boolean
  rifResistance?: 'detected' | 'not-detected'
}

export interface SecondLineLpaResult {
  state: ResultState
  /** Fluoroquinolone resistance — the pre-XDR determinant. */
  fqResistance?: 'detected' | 'not-detected'
  /** Second-line injectable (amikacin/kanamycin/capreomycin). */
  sliResistance?: 'detected' | 'not-detected'
}

export interface DstResult {
  state: ResultState
  /** Group A drugs. Resistance here, on top of FQ resistance, defines XDR. */
  bedaquiline?: 'resistant' | 'susceptible'
  linezolid?: 'resistant' | 'susceptible'
  /** Other drugs commonly reported, used for salvage regimen design. */
  moxifloxacin?: 'resistant' | 'susceptible'
  pyrazinamide?: 'resistant' | 'susceptible'
  clofazimine?: 'resistant' | 'susceptible'
  delamanid?: 'resistant' | 'susceptible'
  pretomanid?: 'resistant' | 'susceptible'
}

export interface DiagnosticState {
  track: DiagnosticTrack
  /** Constitutional symptoms recorded at first presentation. */
  constitutionalSymptoms: string[]
  /** A trial of antibiotics was given before TB workup. */
  antibioticTrialGiven?: boolean
  /** CRITICAL: was that antibiotic a fluoroquinolone? */
  antibioticWasFluoroquinolone?: boolean
  /** Chest X-ray abnormal. */
  cxrAbnormal?: boolean
  /** CT done and supportive. */
  ctSupportive?: boolean
  /** Histopathology supportive (for the clinically diagnosed track). */
  histopathologySupportive?: boolean

  naat: NaatResult
  flLpa: LpaResult
  slLpa: SecondLineLpaResult
  dst: DstResult
}

export function emptyDiagnosis(): DiagnosticState {
  return {
    track: 'presumptive',
    constitutionalSymptoms: [],
    naat: { state: 'not-sent' },
    flLpa: { state: 'not-sent' },
    slLpa: { state: 'not-sent' },
    dst: { state: 'not-sent' },
  }
}

/** What the cascade currently supports, and how firmly. */
export interface DerivedClassification {
  classification: TbClassification
  /** True while a pending result could still change this. */
  provisional: boolean
  /** Plain statement of what the classification rests on. */
  basis: string
  /** Tests still outstanding that could change it. */
  pending: string[]
}

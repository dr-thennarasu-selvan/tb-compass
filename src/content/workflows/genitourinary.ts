import type { ConditionWorkflow } from '@/types/workflow'

/** Genitourinary tuberculosis — ICMR STW, ICD-10 A18.10. Source p. 10. */
export const GENITOURINARY_TB: ConditionWorkflow = {
  id: 'genitourinary',
  site: 'genitourinary',
  title: 'Genitourinary tuberculosis',
  icd10: 'A18.10',
  whenToSuspect: {
    history: [
      'With or without systemic symptoms: fever, weight loss, night sweats',
      'URINARY TB: lower urinary tract symptoms — frequency, urgency, nocturia — with dysuria and/or haematuria for at least 2 weeks',
      'URINARY TB: not responding to a 3–7 day course of antibiotics',
      'MALE GENITAL TB: scrotal pain or swelling for 2 weeks or more',
      'MALE GENITAL TB: not responding to a 7–14 day course of antibiotics',
      'MALE GENITAL TB: discharging sinuses in the scrotum',
      'MALE GENITAL TB: rarely, infertility',
    ],
    examination: ['Scrotal swelling, sinuses', 'Suprapubic tenderness'],
  },
  investigations: {
    essential: [
      'CBC, KFT, LFT, ESR',
      'Chest X-ray',
      'Urine routine/microscopy and culture',
      'Urine for AFB, 3–5 days, early morning first void',
      'Urine culture for MTB, 3–5 days, early morning first void',
      'NAAT assay — GeneXpert MTB/RIF',
      'USG KUB',
      'USG scrotum for male genital TB only',
    ],
    desirable: [
      'If renal function is normal: IVP or CT urography',
      'If renal function is deranged: MR urogram, retrograde pyelography, nephrostogram',
      'If other tests are inconclusive with high suspicion: FNAC or biopsy from accessible mass lesions or fluid collections',
      'Cystoscopic biopsy of the genitourinary tract',
    ],
  },
  diagnostic: {
    entry: 'renal-function',
    nodes: [
      {
        id: 'renal-function',
        text: 'Baseline workup — check renal function and USG KUB',
        branches: [
          { label: 'Deranged renal function, or hydronephrosis / hydroureteronephrosis', to: 'refer-urology' },
          { label: 'Normal renal function', to: 'urography' },
        ],
      },
      {
        id: 'refer-urology',
        text: 'Deranged renal function or obstructive uropathy',
        action:
          'Refer to a higher centre or urologist. Specific imaging: MR urogram, retrograde pyelography, or nephrostogram.',
        severity: 'critical',
      },
      {
        id: 'urography',
        text: 'Normal renal function — IVP or CT urography',
        action:
          'If tests remain inconclusive with a high suspicion of genitourinary TB, obtain tissue: FNAC or biopsy from accessible mass lesions or fluid collections, or cystoscopic biopsy.',
        severity: 'caution',
      },
    ],
  },
  management: {
    treatment: [
      'Drug-susceptible TB: 2 months HRZE then 4 months HRE.',
      'Duration can be increased to 9–12 months where extension criteria apply.',
      'Extension criteria: extensive pockets of infection, concurrent smear-positive cavitary pulmonary disease, CNS involvement, or delay in positive cultures converting to negative.',
      'MDR/RR or XDR-TB: treatment as per NTEP guidelines.',
    ],
    whenToRefer: [
      'Deranged renal function',
      'Hydronephrosis or hydroureteronephrosis',
      'Severe LUTS suggestive of a small capacity bladder',
      'Deteriorating renal function',
    ],
    followUp: [
      'At 8 weeks: resolution of systemic symptoms, improved urinary symptoms, repeat culture if the baseline culture was positive.',
      'After completion of ATT: repeat culture if the baseline culture was positive.',
      'Repeat imaging if there is a partial or impending ureteric stricture.',
      'At each visit watch for: severe LUTS suggestive of a small capacity bladder, and deteriorating renal function.',
    ],
  },
  provenance: {
    citations: [{ source: 'icmr-stw', locator: 'Genitourinary tuberculosis workflow, ICD-10 A18.10, p. 10' }],
    status: 'source-checked',
  },
}

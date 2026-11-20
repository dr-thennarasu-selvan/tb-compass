import type { Provenance, Statement } from '@/types/content'

/**
 * Microbiological work-up for adult extrapulmonary TB — ICMR STW, p. 12.
 *
 * Not a condition workflow: this is the specimen-handling layer that every
 * extrapulmonary workflow depends on. A correctly reasoned diagnostic pathway
 * still fails if the sample is rejected, so these belong in the app.
 */

const stw = (locator: string): Provenance => ({
  citations: [{ source: 'icmr-stw', locator }],
  status: 'source-checked',
})

export interface SpecimenSpec {
  site: string
  sample: string
  amount: string
  note?: string
}

export const SPECIMEN_REQUIREMENTS: SpecimenSpec[] = [
  {
    site: 'Osteoarticular / musculoskeletal',
    sample: 'Tissue, pus, synovial fluid',
    amount: 'Biopsy 1 cm × 1 cm. Optimum fluid or pus 2–3 mL.',
    note: 'Sample any caseous area. Add 0.5–2 mL sterile saline to the biopsy depending on size, to stop the tissue drying. SWABS ARE SUB-OPTIMAL.',
  },
  { site: 'Pleural', sample: 'Pleural fluid', amount: '10–15 mL' },
  { site: 'Meningitis', sample: 'CSF', amount: '3–5 mL' },
  {
    site: 'Lymphadenitis',
    sample: 'FNA or biopsy',
    amount: 'Biopsy 1 cm × 1 cm. Optimum FNA sample 2 mL.',
    note: 'Add 0.5–2 mL sterile saline to the biopsy depending on size.',
  },
  { site: 'Urogenital', sample: 'Urine', amount: 'Entire early morning urine sample, 3–5 days' },
  {
    site: 'Female genital',
    sample: 'Endometrial curettage or biopsy',
    amount: 'Biopsy 1 cm × 1 cm',
    note: 'Sample any caseous area. Add 0.5–2 mL sterile saline.',
  },
  {
    site: 'Gastrointestinal',
    sample: 'Tissue, pus, peritoneal fluid',
    amount: 'At least 6 biopsies for microbiological diagnosis, including any caseous area. Optimum fluid or pus 5–10 mL.',
  },
]

export const SPECIMEN_PROVENANCE = stw('Microbiological work-up for adult EPTB, specimen table, p. 12')

export const COLLECTION_RULES: Statement[] = [
  {
    id: 'micro.before-treatment',
    text: 'Collect samples in sterile containers BEFORE treatment is started',
    detail: 'Record the date and time of collection.',
    provenance: stw('Logistics involved in sample collection and transportation, p. 12'),
  },
  {
    id: 'micro.saline',
    text: 'Send specimens in sterile SALINE, not formalin',
    detail:
      'Formalin destroys the sample for culture and molecular testing. This single error wastes an invasive procedure.',
    provenance: stw('Logistics involved in sample collection and transportation, p. 12'),
  },
  {
    id: 'micro.cold-chain',
    text: 'Transport at 2–8 °C; maximum 5 days in cold chain from collection',
    provenance: stw('Logistics involved in sample collection and transportation, p. 12'),
  },
  {
    id: 'micro.quantity',
    text: 'The stated quantities are for microbiology ONLY',
    detail:
      'Histopathology, cytology, ADA, glucose and protein all require additional sample. Plan the volume before the needle goes in.',
    provenance: stw('Logistics involved in sample collection and transportation, p. 12'),
  },
  {
    id: 'micro.small-sample',
    text: 'If the sample is under 500 µL, refer directly to a tertiary centre, medical college or IRL',
    detail: 'The residual sample in the needle and syringe can still be used for a smear.',
    provenance: stw('Logistics involved in sample collection and transportation, p. 12'),
  },
  {
    id: 'micro.mgit',
    text: 'Use MGIT for culture; if MGIT is unavailable, use LJ medium',
    provenance: stw('Logistics involved in sample collection and transportation, p. 12'),
  },
  {
    id: 'micro.processing',
    text: 'Process preferably immediately',
    detail:
      'If the sample is adequate, attempt molecular testing at that site. If biopsy is not possible or the site is inaccessible, refer the patient immediately to the next higher centre. If the sample obtained is inadequate, send it directly to the nearest tertiary centre, medical college or IRL.',
    provenance: stw('Processing, p. 12'),
  },
]

/** Why samples get rejected — each one wastes a procedure the patient underwent. */
export const REJECTION_CRITERIA: string[] = [
  'Unlabelled — all specimens MUST be labelled with a unique patient identifier',
  'No collection date indicated',
  'Insufficient quantity, or no specimen in the container',
  'Damaged — leaked or broken in transit',
  'Over 3 days old at room temperature, or over 5 days in refrigeration',
]

export const REJECTION_PROVENANCE = stw('Rejection of samples, p. 12')

export const PRECIOUS_SAMPLES: Statement = {
  id: 'micro.precious',
  text: 'Precious samples should be transported to the IRL',
  detail:
    'A CSF or a bone biopsy cannot simply be repeated. Route it to the intermediate reference laboratory rather than risk a local failure.',
  provenance: stw('Rejection of samples, p. 12'),
}

export const MICRO_PROCEDURES: string[] = [
  'AFB smear microscopy — except in gastrointestinal TB',
  'NAAT',
  'Culture — MGIT, or LJ medium if MGIT is unavailable',
  'Drug susceptibility testing, if culture is positive',
]

export const MICRO_PROCEDURES_PROVENANCE = stw('Microbiological procedures, p. 12')

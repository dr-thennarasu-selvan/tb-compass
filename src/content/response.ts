import type { Provenance, Statement } from '@/types/content'
import type { View } from '@/components/Home'

/**
 * Not improving on treatment.
 *
 * The backbone is the WHO operational handbook M4 2025, Section 9 "Monitoring
 * treatment response" (pp. 41–43; printed page = PDF page minus 16), whose
 * list of reasons for a positive 2-month smear becomes the differential here.
 * Failure definitions come from NTEP DR-TB 2024 Chapter 5 (pp. 49–50) and
 * ATS/CDC/IDSA 2016.
 */

const hb = (locator: string): Provenance => ({ citations: [{ source: 'who-handbook-m4-2025', locator }], status: 'source-checked' })
const ats = (locator: string): Provenance => ({ citations: [{ source: 'ats-dstb-2016', locator }], status: 'source-checked' })
const ntep = (locator: string): Provenance => ({ citations: [{ source: 'ntep-drtb-2024', locator }], status: 'source-checked' })
const cite = (cs: [string, string][]): Provenance => ({
  citations: cs.map(([source, locator]) => ({ source, locator })),
  status: 'source-checked',
})

// ---------------------------------------------------------------------------
// What the physician is seeing
// ---------------------------------------------------------------------------

export type Trigger =
  | 'smear-pos-m2'
  | 'culture-pos-m4'
  | 'reversion'
  | 'symptoms'
  | 'cxr-worse'
  | 'smear-pos-culture-neg'

export const TRIGGERS: { id: Trigger; label: string }[] = [
  { id: 'smear-pos-m2', label: 'Smear or culture still positive at end of month 2' },
  { id: 'culture-pos-m4', label: 'Culture positive at month 4 or later' },
  { id: 'reversion', label: 'Turned positive again after converting' },
  { id: 'symptoms', label: 'Persistent fever, weight loss, or symptoms returning' },
  { id: 'cxr-worse', label: 'Chest X-ray worse' },
  { id: 'smear-pos-culture-neg', label: 'Smear positive but culture negative' },
]

// ---------------------------------------------------------------------------
// Verdicts: is this failure yet?
// ---------------------------------------------------------------------------

export const FAILURE_M4: Statement = {
  id: 'resp.fail.m4',
  text: 'A positive culture from month 4 onwards means treatment has failed',
  detail:
    'Manage as treatment failure. For BPaLM, NTEP’s failure definition includes a positive culture from a sample collected at month 4 or later, amplification of resistance to B, Pa or L, or no clinical response.',
  provenance: cite([
    ['ats-dstb-2016', 'Monitoring — "patients who have M. tuberculosis isolated in culture from sputum obtained after 4 months of treatment are considered as having failed treatment"'],
    ['ntep-drtb-2024', 'Section 5.2.1, treatment failed; failure definitions for BPaLM, pp. 49–50'],
  ]),
}

export const FAILURE_DEFINITION: Statement = {
  id: 'resp.fail.def',
  text: 'NTEP: treatment has failed when the regimen must be changed permanently',
  detail:
    'Because of no clinical and/or radiological response; no bacteriological response (no conversion, or reversion in the continuation phase); adverse drug reactions; or additional resistance to drugs in the regimen. Reversion means two consecutive positive cultures (or smears, for DS-TB) at least 7 days apart after conversion.',
  provenance: ntep('Sections 5.1.2 and 5.2.1, pp. 49–50'),
}

export const NOT_FAILURE_YET: Statement = {
  id: 'resp.m2',
  text: 'A positive smear at month 2 is not failure — it has several explanations',
  detail:
    'The bacilli seen may be non-viable despite a good response; resolution may be slow after extensive cavitation and a heavy initial load; or the response may be genuinely poor. Work through the causes below. Culture separates the first from the rest: a positive culture means viable bacilli.',
  provenance: hb('Section 9.3, sputum smear and culture, pp. 42–43'),
}

export const DEAD_BACILLI: Statement = {
  id: 'resp.dead',
  text: 'Smear positive but culture negative usually means dead organisms — not failure',
  detail:
    'Seen most often with far-advanced cavitary disease after the first few months. Dead organisms can also keep molecular tests positive, so Xpert and other molecular tests are not used to monitor response.',
  provenance: cite([
    ['ats-dstb-2016', 'Monitoring — smear-positive, culture-negative sputa'],
    ['who-handbook-m4-2025', 'Section 9.3, p. 43'],
  ]),
}

export const SYMPTOMS: Statement = {
  id: 'resp.symptoms',
  text: 'Symptoms usually improve within the first few weeks; most patients improve within 1–2 months',
  detail:
    'Cough and sputum can outlast conversion when lung damage is extensive. Persistent fever, weight loss or the return of any classic symptom should prompt investigation for failure, undetected resistance or an untreated comorbidity. Recurrence after conversion may be the first sign of failure. Fever from TB itself may persist 2 months or longer.',
  provenance: cite([
    ['who-handbook-m4-2025', 'Section 9.1, clinical examination, p. 41'],
    ['ats-dstb-2016', 'Adverse effects — drug fever'],
  ]),
}

export const CXR: Statement = {
  id: 'resp.cxr',
  text: 'The X-ray may look unchanged in the first months',
  detail:
    'Take one at baseline, end of month 2 and end of treatment for comparison. Judge response on clinical and radiological findings together; some changes never return to baseline.',
  provenance: hb('Section 9.2, chest radiography, p. 42'),
}

// ---------------------------------------------------------------------------
// The differential — WHO handbook p. 42, with actions
//
// Order is a presentation choice, not the source's: undetected resistance
// leads because it is the cause that changes the regimen, and WHO says DST
// should be repeated for anyone who remains smear and culture positive
// (p. 43). The rest follow WHO's list.
// ---------------------------------------------------------------------------

export interface Cause {
  id: string
  label: string
  check: string
  goTo?: View
  goToLabel?: string
  /** Triggers this cause is most relevant to. Empty = all. */
  for: Trigger[]
  provenance: Provenance
}

export const CAUSES: Cause[] = [
  {
    id: 'resistance',
    label: 'Undetected drug resistance',
    check:
      'Send culture and DST: at minimum isoniazid, rifampicin and moxifloxacin if used, and rapid second-line DST where possible. Repeat DST on any culture taken after 3 or more months; there is usually no need to repeat it within 2–3 months of the last one. On BPaLM, a patient who deteriorates or shows no improvement at month 2 needs a specimen sent to the C&DST lab to test for amplified resistance.',
    goTo: 'cascade',
    goToLabel: 'Diagnostic pathway',
    for: ['smear-pos-m2', 'culture-pos-m4', 'reversion', 'symptoms', 'cxr-worse'],
    provenance: cite([
      ['who-handbook-m4-2025', 'Section 9.3, p. 43'],
      ['ats-dstb-2016', 'Monitoring — DST repeated after ≥3 months'],
      ['ntep-drtb-2024', 'Table 3.4 footnote @, p. 31'],
    ]),
  },
  {
    id: 'adherence',
    label: 'Poor adherence or unsupervised intensive phase',
    check:
      'Ask the patient and treatment supporter about missed doses and the intensive phase supervision. Discuss difficulties at every visit.',
    for: ['smear-pos-m2', 'culture-pos-m4', 'reversion', 'symptoms', 'cxr-worse'],
    provenance: hb('Section 9.3, p. 42; Section 9.1, p. 42'),
  },
  {
    id: 'dose',
    label: 'Doses below the recommended range',
    check: 'Re-weigh the patient. Weight should be recorded monthly and doses adjusted when weight changes.',
    goTo: 'dstb',
    goToLabel: 'Weight-band dosing',
    for: ['smear-pos-m2', 'culture-pos-m4', 'reversion', 'symptoms', 'cxr-worse'],
    provenance: hb('Section 9.3, p. 42; Section 9, monitoring, p. 41'),
  },
  {
    id: 'comorbidity',
    label: 'A comorbidity interfering with response or adherence',
    check: 'Diabetes and cancer are the examples given. Check glucose control and HIV status.',
    goTo: 'diabetes',
    goToLabel: 'Diabetes',
    for: ['smear-pos-m2', 'culture-pos-m4', 'reversion', 'symptoms', 'cxr-worse'],
    provenance: hb('Section 9.3, p. 42; Section 9.1, p. 41'),
  },
  {
    id: 'absorption',
    label: 'Poor absorption of one or more drugs (rare)',
    check:
      'More likely with HIV, diabetes, critical illness or interacting drugs. Therapeutic drug monitoring, where available, helps when sputum conversion is delayed without nonadherence or resistance to explain it.',
    goTo: 'interactions',
    goToLabel: 'Drug interactions',
    for: ['smear-pos-m2', 'culture-pos-m4', 'reversion'],
    provenance: cite([
      ['who-handbook-m4-2025', 'Section 3.5, p. 15; Section 9.3, pp. 42–43'],
      ['ats-dstb-2016', 'Table 9, conditions in which therapeutic drug monitoring may be helpful'],
    ]),
  },
  {
    id: 'quality',
    label: 'Anti-TB drugs of suboptimal quality',
    check: 'Check the source and storage of the drugs the patient has been taking.',
    for: ['smear-pos-m2', 'culture-pos-m4', 'reversion', 'symptoms', 'cxr-worse'],
    provenance: hb('Section 9.3, p. 42'),
  },
  {
    id: 'load',
    label: 'Slow resolution from extensive cavitation and a heavy initial load',
    check:
      'Often after late diagnosis, and the response may still be good. With cavitation on the first X-ray and a positive culture at month 2, ATS extends the continuation phase to 7 months (9 months in all).',
    for: ['smear-pos-m2'],
    provenance: cite([
      ['who-handbook-m4-2025', 'Section 9.3, p. 42'],
      ['ats-dstb-2016', 'Duration of therapy — cavitation and positive 2-month culture'],
    ]),
  },
  {
    id: 'ntm',
    label: 'Non-tuberculous mycobacteria in a damaged lung',
    check:
      'When smears and cultures stay persistently positive, assess for NTM; colonisation or infection secondary to TB is not uncommon. Consider further imaging and bronchoscopy.',
    for: ['smear-pos-m2', 'culture-pos-m4', 'reversion'],
    provenance: hb('Section 9.3, p. 43'),
  },
  {
    id: 'paradoxical',
    label: 'Paradoxical reaction or IRIS',
    check: 'Especially in people living with HIV starting ART. It can be mistaken for clinical failure.',
    goTo: 'iris',
    goToLabel: 'IRIS module',
    for: ['symptoms', 'cxr-worse'],
    provenance: ats('HIV infection — paradoxical reactions that may be interpreted as clinical worsening'),
  },
  {
    id: 'drug-fever',
    label: 'Drug fever or superinfection',
    check:
      'Drug fever is a diagnosis of exclusion: exclude TB itself, paradoxical reaction and superinfection first. Patients with drug fever generally feel well despite temperatures of 39°C or more; stopping drugs usually settles it within 24 hours.',
    goTo: 'hypersensitivity',
    goToLabel: 'Drug reactions',
    for: ['symptoms'],
    provenance: ats('Adverse effects — drug fever'),
  },
]

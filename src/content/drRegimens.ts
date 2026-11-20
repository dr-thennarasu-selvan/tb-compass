import type { Provenance } from '@/types/content'

/**
 * NTEP drug-resistant TB regimens (National Guidelines for Management of
 * Drug Resistant TB, November 2024).
 *
 * Criteria are declared here as data — id, label, provenance, and any numeric
 * threshold. Evaluating them against a patient lives in engine/drtb.ts, so the
 * clinical statements stay auditable and the control flow stays testable.
 */

export type CriterionKind = 'inclusion' | 'exclusion' | 'relative'

export interface Criterion {
  id: string
  kind: CriterionKind
  label: string
  /** Shown when the criterion needs explanation beyond its label. */
  detail?: string
  provenance: Provenance
}

const ntep = (locator: string, divergence?: string): Provenance => ({
  citations: [{ source: 'ntep-drtb-2024', locator }],
  status: 'source-checked',
  divergence,
})

export interface DrRegimen {
  id: string
  name: string
  shorthand: string
  /** Weeks, where the source states weeks; otherwise months in `durationText`. */
  durationText: string
  drugs: string[]
  dosing: { drug: string; text: string }[]
  criteria: Criterion[]
  notes: string[]
  /** Lower number = try first. NTEP states an explicit preference order. */
  preference: number
  provenance: Provenance
}

export const DR_REGIMENS: DrRegimen[] = [
  {
    id: 'bpalm',
    name: 'BPaLM',
    shorthand: 'Bdq + Pa + Lzd + Mfx',
    durationText: '26 weeks, extendable to 39 weeks',
    preference: 1,
    drugs: ['bedaquiline', 'pretomanid', 'linezolid', 'moxifloxacin'],
    dosing: [
      { drug: 'Bedaquiline', text: '400 mg once daily weeks 1–2, then 200 mg three times a week to week 26/39' },
      { drug: 'Pretomanid', text: '200 mg daily, weeks 1–26/39' },
      { drug: 'Linezolid', text: '600 mg once daily, weeks 1–26/39' },
      { drug: 'Moxifloxacin', text: '400 mg once daily, weeks 1–26/39' },
      { drug: 'Pyridoxine', text: '50 mg (16–29 kg) or 100 mg (>30 kg)' },
    ],
    criteria: [
      {
        id: 'age14',
        kind: 'inclusion',
        label: 'Age 14 years or above',
        provenance: ntep('Section 3.3.1, inclusion criterion i, p. 23'),
      },
      {
        id: 'mdr-rr',
        kind: 'inclusion',
        label: 'Microbiologically confirmed MDR/RR-TB, or probable MDR-TB after failing H mono/poly treatment',
        provenance: ntep('Section 3.3.1, inclusion criterion i, p. 23'),
      },
      {
        id: 'liver-ok',
        kind: 'exclusion',
        label: 'Significant liver dysfunction: AST/ALT >3× ULN AND total bilirubin >2× ULN',
        detail:
          'Both limbs must be crossed for this exclusion to apply — the source states them with AND, not OR. A raised transaminase alone does not exclude.',
        provenance: ntep('Section 3.3.1, exclusion criterion iii, p. 24'),
      },
      {
        id: 'severe-eptb',
        kind: 'exclusion',
        label: 'Severe extrapulmonary MDR-TB: CNS, spinal/skeletal, miliary, disseminated or multiorgan',
        provenance: ntep('Section 3.3.1, exclusion criterion iv, p. 24'),
      },
      {
        id: 'qtcf',
        kind: 'exclusion',
        label: 'QTcF >450 ms (male) or >470 ms (female) with normal electrolytes, or still raised after correction',
        detail:
          'Correct hypokalaemia, hypomagnesaemia and hypocalcaemia before any QT-prolonging drug, then repeat the ECG.',
        provenance: ntep('Section 3.3.1, exclusion criterion v(iii), p. 24'),
      },
      {
        id: 'cardiac',
        kind: 'exclusion',
        label: 'Significant cardiac conduction abnormality, structural heart disease, syncope, long QT, AV block',
        provenance: ntep('Section 3.3.1, exclusion criterion v, p. 24'),
      },
      {
        id: 'drug-resistance',
        kind: 'exclusion',
        label: 'Documented resistance to bedaquiline, linezolid or pretomanid',
        provenance: ntep('Section 3.3.1, exclusion criterion ii, p. 24'),
      },
      {
        id: 'pregnancy',
        kind: 'relative',
        label: 'Pregnancy — eligibility is restricted and gestation dependent',
        detail:
          'Non-pregnant, non-lactating, or lactating but not breastfeeding. Pregnant women only at <20 or <24 weeks gestation and willing to undergo medical termination, per the current MTP notification.',
        provenance: ntep('Section 3.3.1, inclusion criterion iv, p. 23'),
      },
    ],
    notes: [
      'First choice in eligible patients aged 14 and above with MDR/RR-TB, regardless of fluoroquinolone resistance or HIV status.',
      'Moxifloxacin is continued for the full course irrespective of FQ resistance at baseline or during treatment.',
      'Can be started while awaiting baseline DST to Bdq/Pa/Lzd, because resistance to these is currently low in India.',
      'If baseline DST later shows resistance to Bdq, Pa or Lzd: declare "treatment regimen changed" and reassess at N/DDR-TBC for the longer oral regimen.',
      'Take with food. Avoid magnesium supplements or antacids for 2 hours either side — they bind fluoroquinolones.',
      'Linezolid 600 mg must be maintained. If grade 3/4 toxicity prevents this within the first 9 weeks, declare treatment failed. Dose reduction to 300 mg is only permitted after 9 weeks, and extends the regimen to 39 weeks.',
    ],
    provenance: ntep('Section 3.3, BPaLM regimen, pp. 23–30'),
  },

  {
    id: 'shorter-9-11',
    name: '9–11 month shorter oral MDR/RR-TB regimen',
    shorthand: '(2) Lzd (4–6) Lfx Cfz Z E Hh (6–9) Bdq / (5) Lfx Cfz Z E',
    durationText: '9–11 months',
    preference: 2,
    drugs: ['linezolid', 'levofloxacin', 'clofazimine', 'pyrazinamide', 'ethambutol', 'isoniazid', 'bedaquiline'],
    dosing: [
      { drug: 'Linezolid', text: '600 mg for age 14 and above; weight-banded below 14' },
      { drug: 'High-dose isoniazid (Hh)', text: 'Part of the intensive phase' },
    ],
    criteria: [
      {
        id: 'rif-resistant',
        kind: 'inclusion',
        label: 'Rifampicin resistance detected',
        provenance: ntep('Section 3.4.1, criterion i, p. 32'),
      },
      {
        id: 'fq-susceptible',
        kind: 'inclusion',
        label: 'Fluoroquinolone resistance NOT detected',
        detail: 'This is the criterion that separates this regimen from BPaLM, which is given regardless of FQ status.',
        provenance: ntep('Section 3.4.1, criterion ii, p. 32'),
      },
      {
        id: 'no-sld-exposure',
        kind: 'inclusion',
        label: 'No prior second-line exposure over 1 month (Bdq, Lfx, Cfz, Lzd), unless susceptibility confirmed',
        provenance: ntep('Section 3.4.1, criterion iii, p. 32'),
      },
      {
        id: 'not-extensive',
        kind: 'exclusion',
        label: 'Extensive TB disease',
        provenance: ntep('Section 3.4.1, criterion iv, p. 32'),
      },
      {
        id: 'severe-eptb-2',
        kind: 'exclusion',
        label: 'Severe extrapulmonary MDR-TB: CNS, spinal/skeletal, miliary, disseminated or multiorgan',
        provenance: ntep('Section 3.4.1, criterion v, p. 32'),
      },
    ],
    notes: [
      'The linezolid-containing version can be given to pregnant women at any gestation, with safety monitoring — unlike BPaLM and unlike the ethionamide version.',
      'If pyrazinamide resistance is detected during the intensive phase, switch to the longer oral regimen.',
      'The linezolid version can be used even when both KatG and InhA mutations are present. The ethionamide version cannot.',
      'Thyroid function testing is not required in pre-treatment evaluation for the linezolid version.',
    ],
    provenance: ntep('Section 3.4, 9–11 month shorter oral regimen, pp. 32–33'),
  },

  {
    id: 'longer-18-20',
    name: '18–20 month longer oral M/XDR-TB regimen',
    shorthand: '(6 or longer) Bdq (18–20) Lfx Lzd Cfz Cs',
    durationText: '18–20 months; 20 months for XDR-TB',
    preference: 3,
    drugs: ['bedaquiline', 'levofloxacin', 'linezolid', 'clofazimine', 'cycloserine'],
    dosing: [{ drug: 'Bedaquiline', text: 'Limited to 6 months; extension only where an effective regimen cannot otherwise be designed' }],
    criteria: [
      {
        id: 'ineligible-others',
        kind: 'inclusion',
        label: 'Not eligible for BPaLM or the 9–11 month regimen, or additional resistance, intolerance, or drug unavailability',
        provenance: ntep('Section 3.5, p. 34'),
      },
    ],
    notes: [
      'Maximum duration 20 months. For XDR-TB the duration is 20 months.',
      'Linezolid taper to 300 mg after month 6 is decided on the month 5 culture (or month 4 if unavailable).',
      'If the month 8 culture is positive, declare treatment failed and send the isolate for FL-LPA, SL-LPA and C&DST.',
      'In children under 5, bedaquiline is replaced by delamanid until Bdq is approved for that age group in India.',
    ],
    provenance: ntep('Section 3.5, 18–20 month longer oral regimen, pp. 34–35'),
  },

  {
    id: 'hr-tb',
    name: 'H mono/poly drug-resistant TB regimen',
    shorthand: '(06) LfxREZ',
    durationText: '6 months, extendable directly to 9',
    preference: 4,
    drugs: ['levofloxacin', 'rifampicin', 'ethambutol', 'pyrazinamide'],
    dosing: [
      { drug: 'Rifampicin', text: '300 mg (16–29 kg) / 450 mg (30–45 kg) / 600 mg (46–70 kg)' },
      { drug: 'Ethambutol', text: '400 / 800 / 1200 mg' },
      { drug: 'Pyrazinamide', text: '750 / 1250 / 1750 mg' },
      { drug: 'Levofloxacin', text: '250 / 750 / 1000 mg' },
    ],
    criteria: [
      {
        id: 'h-resistant',
        kind: 'inclusion',
        label: 'Isoniazid resistance with rifampicin susceptibility',
        provenance: ntep('Section 3.6, p. 38'),
      },
    ],
    notes: [
      'No separate intensive and continuation phase.',
      'Extend directly to 9 months — never monthly — for extensive disease, uncontrolled comorbidity, extrapulmonary TB, positive smear at end of month 4, or if the regimen is modified.',
      'CAUTION: contains pyrazinamide. Unusable if pyrazinamide caused a previous drug-induced liver injury.',
      'Non-responders without additional R resistance are treated as probable MDR-TB and reassessed for BPaLM, the 9–11 month regimen, or the longer oral regimen.',
    ],
    provenance: ntep('Section 3.6 and Table 3.8, p. 38'),
  },
]

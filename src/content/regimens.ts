import type { GuidelinePack, Provenance } from '@/types/content'

/**
 * Replacement regimens after a first-line drug is permanently lost.
 *
 * Keyed by the SET of excluded drugs, because the combination matters and the
 * answers do not compose: losing pyrazinamide alone has a clean answer, losing
 * isoniazid alone has a different clean answer, and losing both lands somewhere
 * neither entry covers.
 *
 * Nothing here is merged across guidelines. WHO and NTEP entries sit side by
 * side under the same key, and where a branch has not been authored for a pack
 * the UI says so instead of falling back to the other pack's answer.
 */

export interface RegimenPhase {
  label: string
  months: number
  /** Drug ids — see content/drugs.ts. */
  drugs: string[]
}

export interface Regimen {
  id: string
  pack: GuidelinePack
  /** Conventional shorthand, e.g. "2HRE / 7HR". */
  shorthand: string
  totalMonths: number | null
  phases: RegimenPhase[]
  /** Short clinical notes. Keep each under about 20 words. */
  notes: string[]
  /** True when this must not be prescribed without specialist/committee input. */
  specialistRequired?: boolean
  provenance: Provenance
}

const p = (source: string, locator: string, divergence?: string): Provenance => ({
  citations: [{ source, locator }],
  status: 'needs-review',
  divergence,
})

/** Canonical key for a set of excluded drug ids. */
export function exclusionKey(excluded: string[]): string {
  return [...excluded].sort().join('+') || 'none'
}

/**
 * REVIEWER: every entry below is unverified and the durations in particular
 * must be read off the source document, not accepted as written.
 */
export const REGIMENS: Record<string, Regimen[]> = {
  none: [
    {
      id: 'who.ds.standard',
      pack: 'who',
      shorthand: '2HRZE / 4HR',
      totalMonths: 6,
      phases: [
        { label: 'Intensive', months: 2, drugs: ['isoniazid', 'rifampicin', 'pyrazinamide', 'ethambutol'] },
        { label: 'Continuation', months: 4, drugs: ['isoniazid', 'rifampicin'] },
      ],
      notes: [
        'Standard regimen for new patients with drug-susceptible pulmonary TB. Strong recommendation, high certainty of evidence.',
        'Daily dosing throughout. Thrice-weekly dosing is not recommended in either phase.',
        'If the sputum smear is still positive at the end of the intensive phase, do NOT extend the intensive phase.',
        'Fixed-dose combinations are preferred over separate formulations.',
      ],
      provenance: {
        citations: [{ source: 'who-m4-2025', locator: 'Recommendation 1.1-1.5, Treatment of DS-TB using a 6-month regimen' }],
        status: 'source-checked',
      },
    },
    {
      id: 'who.ds.4mo.hpmz',
      pack: 'who',
      shorthand: '2HPMZ / 2HPM',
      totalMonths: 4,
      phases: [
        { label: 'Intensive', months: 2, drugs: ['isoniazid', 'rifapentine', 'moxifloxacin', 'pyrazinamide'] },
        { label: 'Continuation', months: 2, drugs: ['isoniazid', 'rifapentine', 'moxifloxacin'] },
      ],
      notes: [
        'Alternative for people aged 12 years or older. Conditional recommendation, moderate certainty of evidence.',
        'Contains moxifloxacin — check QT, especially alongside other QT-prolonging drugs.',
        'Contains pyrazinamide, so this is NOT an option when pyrazinamide must be avoided.',
      ],
      provenance: {
        citations: [{ source: 'who-m4-2025', locator: 'Recommendation 2.1, 4-month regimens' }],
        status: 'source-checked',
      },
    },
    {
      id: 'who.ds.4mo.paeds',
      pack: 'who',
      shorthand: '2HRZ(E) / 2HR',
      totalMonths: 4,
      phases: [
        { label: 'Intensive', months: 2, drugs: ['isoniazid', 'rifampicin', 'pyrazinamide', 'ethambutol'] },
        { label: 'Continuation', months: 2, drugs: ['isoniazid', 'rifampicin'] },
      ],
      notes: [
        'Children and adolescents from 3 months to 16 years with NON-SEVERE TB, without suspicion or evidence of MDR/RR-TB. Strong recommendation, moderate certainty of evidence.',
        'Ethambutol is optional, per the source notation 2HRZ(E).',
      ],
      provenance: {
        citations: [{ source: 'who-m4-2025', locator: 'Recommendation 2.2, 4-month regimens' }],
        status: 'source-checked',
      },
    },
    {
      id: 'ntep.ds.standard',
      pack: 'ntep',
      shorthand: '2HRZE / 4HRE',
      totalMonths: 6,
      phases: [
        { label: 'Intensive', months: 2, drugs: ['isoniazid', 'rifampicin', 'pyrazinamide', 'ethambutol'] },
        { label: 'Continuation', months: 4, drugs: ['isoniazid', 'rifampicin', 'ethambutol'] },
      ],
      notes: [
        'Intensive phase 8 weeks (56 doses); continuation phase 16 weeks (112 doses). Only pyrazinamide is stopped in CP.',
        'Extend CP to 24 weeks in CNS TB and skeletal TB. In disseminated TB or slow response, extend case by case.',
        'Daily FDC by weight band under direct observation. Pyridoxine 10 mg/day.',
      ],
      provenance: {
        citations: [
          { source: 'ntep-stw-dstb-2022', locator: 'Regimen for Drug-Sensitive TB cases: 2HRZE/4HRE' },
        ],
        status: 'source-checked',
        divergence:
          'NTEP continues ethambutol through the continuation phase (4HRE). WHO does not (4HR). This is a real divergence, not an edition artefact.',
      },
    },
  ],

  // WHO 2025 also offers two 4-month alternatives for the unexcluded case.
  // Both retain pyrazinamide, so neither is a route around pyrazinamide loss.
  pyrazinamide: [
    {
      id: 'ntep.ds.no-z',
      pack: 'ntep',
      shorthand: '9 HRE  —or—  2 HRE / 7 HR',
      totalMonths: 9,
      phases: [{ label: 'Full course', months: 9, drugs: ['isoniazid', 'rifampicin', 'ethambutol'] }],
      notes: [
        'The ICMR workflow gives this as the two-hepatotoxic-drug regimen for stable liver disease (Child A), and it is the pyrazinamide-free option.',
        'Two presentations of the same 9 months: HRE throughout, or 2 months HRE then 7 months HR.',
        'Count duration only from when full ATT is started — days on a bridge or on partial reintroduction do not count.',
      ],
      provenance: {
        citations: [
          { source: 'icmr-stw', locator: 'ATT-related hepatitis workflow, "ATT selection for underlying liver disease", Child A' },
        ],
        status: 'source-checked',
        divergence:
          'Cited for CHILD A CIRRHOSIS / STABLE LIVER DISEASE. Applying it to a patient who simply lost pyrazinamide to drug-induced hepatitis is a reasonable read — it is the pyrazinamide-free regimen the same workflow endorses — but the workflow does not state it for that indication. Confirm before relying on it.',
      },
    },
    {
      id: 'who.ds.no-z',
      pack: 'who',
      shorthand: '2HRE / 7HR',
      totalMonths: 9,
      phases: [
        { label: 'Intensive', months: 2, drugs: ['isoniazid', 'rifampicin', 'ethambutol'] },
        { label: 'Continuation', months: 7, drugs: ['isoniazid', 'rifampicin'] },
      ],
      notes: [
        'Losing pyrazinamide removes the sterilising activity that permits 6 months.',
        'Total duration extends to 9 months.',
      ],
      provenance: p(
        'who-dstb-2022',
        'Regimens when pyrazinamide cannot be used',
        'Verify the extension to 9 months against the current module before prescribing.',
      ),
    },
  ],

  isoniazid: [
    {
      id: 'ntep.hr.lfx',
      pack: 'ntep',
      shorthand: '(06) LfxREZ',
      totalMonths: 6,
      phases: [
        {
          label: 'Full course',
          months: 6,
          drugs: ['levofloxacin', 'rifampicin', 'ethambutol', 'pyrazinamide'],
        },
      ],
      notes: [
        'No separate intensive and continuation phase.',
        'Extend directly to 9 months for extensive disease, uncontrolled comorbidity, extrapulmonary TB, smear positive at end of month 4, or if the regimen is modified. There are no monthly extensions.',
        'CAUTION: contains pyrazinamide. Unusable if pyrazinamide caused the index injury.',
        'Non-responders with no additional R resistance are treated as probable MDR-TB and reassessed for BPaLM, the 9-11 month shorter oral regimen, or the longer oral regimen.',
      ],
      provenance: p(
        'ntep-drtb-2024',
        'Section 3.6 and Table 3.8, p. 38',
        'Written for isoniazid RESISTANCE. Applying it to isoniazid INTOLERANCE after DILI is an extrapolation — confirm your programme intends it.',
      ),
    },
    {
      id: 'who.hr.lfx',
      pack: 'who',
      shorthand: '6 (R)EZ-Lfx',
      totalMonths: 6,
      phases: [
        {
          label: 'Full course',
          months: 6,
          drugs: ['rifampicin', 'ethambutol', 'pyrazinamide', 'levofloxacin'],
        },
      ],
      notes: [
        'WHO addresses isoniazid loss under Hr-TB: rifampicin, ethambutol, pyrazinamide plus levofloxacin.',
        'CAUTION: this regimen contains pyrazinamide. If the index injury implicated pyrazinamide, this regimen is not usable — see the H+Z branch.',
        'Check prior fluoroquinolone exposure and QT before adding levofloxacin.',
      ],
      provenance: p(
        'who-drtb-2022',
        'Treatment of isoniazid-resistant tuberculosis (Hr-TB)',
        'This entry is written for isoniazid RESISTANCE. Using it for isoniazid INTOLERANCE after DILI is an extrapolation — confirm it is what your programme intends.',
      ),
    },
  ],

  'isoniazid+pyrazinamide': [
    {
      id: 'ntep.no-hz',
      pack: 'ntep',
      shorthand: 'Not covered — reassess at N/DDR-TBC',
      totalMonths: null,
      phases: [],
      notes: [
        'NTEP defines the H mono/poly regimen as (06) LfxREZ, which contains pyrazinamide.',
        'With pyrazinamide also lost, that regimen is unusable and no NTEP table covers the remainder.',
        'NTEP routes non-responders and regimen failures to clinical review at the N/DDR-TBC — take this there.',
      ],
      specialistRequired: true,
      provenance: p(
        'ntep-drtb-2024',
        'Section 3.6, H mono/poly drug-resistant TB regimen, p. 38',
        'The referral pathway is cited; the replacement regimen is NOT, because NTEP does not state one for this combination.',
      ),
    },
    {
      id: 'who.no-hz',
      pack: 'who',
      shorthand: 'R + E + Lfx (duration to confirm)',
      totalMonths: null,
      phases: [
        { label: 'Full course', months: 0, drugs: ['rifampicin', 'ethambutol', 'levofloxacin'] },
      ],
      notes: [
        'Both sterilising companions to rifampicin are gone, so duration extends well beyond 6 months.',
        'No single guideline table covers this combination cleanly.',
      ],
      specialistRequired: true,
      provenance: p(
        'who-drtb-2022',
        'No direct table — extrapolated from the Hr-TB regimen with pyrazinamide removed',
        'DELIBERATE STUB. The duration is not stated here because it should not be guessed. Discuss with a DR-TB specialist and record your programme’s answer.',
      ),
    },
  ],

  rifampicin: [
    {
      id: 'ntep.no-r',
      pack: 'ntep',
      shorthand: 'Rifampicin-free — N/DDR-TBC decision',
      totalMonths: null,
      phases: [],
      notes: [
        'NTEP DR-TB 2024 addresses rifampicin RESISTANCE (BPaLM, 9-11 month shorter oral, 18-20 month longer oral).',
        'Rifampicin INTOLERANCE after drug-induced liver injury is a different problem and is not covered by those regimens.',
        'Refer to the N/DDR-TBC rather than adopting an RR-TB regimen by analogy.',
      ],
      specialistRequired: true,
      provenance: p(
        'ntep-drtb-2024',
        'Chapter 3 regimens address rifampicin resistance, not intolerance',
        'DELIBERATE STUB. Do not substitute an RR-TB regimen here: those regimens are selected on resistance, and this patient is rifampicin-susceptible but cannot take it.',
      ),
    },
    {
      id: 'who.no-r',
      pack: 'who',
      shorthand: 'Rifampicin-free — specialist decision',
      totalMonths: null,
      phases: [],
      notes: [
        'The most consequential first-line loss.',
        'Rifampicin-free regimens are substantially longer and more complex.',
        'Do not construct this on a standard pathway — refer to a DR-TB specialist or programme committee.',
      ],
      specialistRequired: true,
      provenance: p(
        'who-drtb-2022',
        'Rifampicin-free regimens',
        'DELIBERATE STUB. Rifampicin intolerance after DILI is distinct from rifampicin resistance, and the regimens differ. Author this branch only from your source document.',
      ),
    },
  ],
}

/** Regimens authored for this exclusion set, filtered to the active pack. */
export function regimensFor(excluded: string[], pack: GuidelinePack): Regimen[] {
  const all = REGIMENS[exclusionKey(excluded)] ?? []
  return all.filter((r) => r.pack === pack)
}

/** Regimens authored under the OTHER pack, so divergence stays visible. */
export function regimensForOtherPacks(excluded: string[], pack: GuidelinePack): Regimen[] {
  const all = REGIMENS[exclusionKey(excluded)] ?? []
  return all.filter((r) => r.pack !== pack)
}

import type { Provenance, Severity, Statement } from '@/types/content'

/**
 * Treatment safety thresholds, from NTEP DR-TB 2024 Table 3.2 (relative
 * contraindications for BPaLM, pp. 24–25) and the endTB screening criteria
 * reported in WHO Module 4 (2025).
 *
 * Renal DOSE adjustment lives in content/renalDosing.ts. This file covers the
 * thresholds that make a regimen relatively contraindicated, which is a
 * different question from how much drug to give.
 */

const ntep = (locator: string): Provenance => ({
  citations: [{ source: 'ntep-drtb-2024', locator }],
  status: 'source-checked',
})

export interface SafetyThreshold {
  id: string
  label: string
  /** Numeric trigger, where the source gives one. */
  test: (v: Record<string, number | undefined>) => boolean | undefined
  describe: string
  severity: Severity
  provenance: Provenance
}

export const SAFETY_THRESHOLDS: SafetyThreshold[] = [
  {
    id: 'creatinine',
    label: 'Serum creatinine above 3.0 × ULN',
    test: (v) => (v.creatinineXuln == null ? undefined : v.creatinineXuln > 3),
    describe:
      'A relative contraindication to BPaLM. Caution is advised in severe renal failure because experience with the regimen is limited.',
    severity: 'critical',
    provenance: ntep('Table 3.2, relative contraindications for BPaLM, p. 25'),
  },
  {
    id: 'haemoglobin',
    label: 'Haemoglobin below 8.0 g/dL',
    test: (v) => (v.haemoglobin == null ? undefined : v.haemoglobin < 8),
    describe:
      'Severe anaemia is a relative contraindication. Linezolid causes myelosuppression, which sets in earlier than its peripheral neuropathy.',
    severity: 'warning',
    provenance: ntep('Table 3.2, relative contraindications for BPaLM, p. 25'),
  },
  {
    id: 'platelets',
    label: 'Platelet count below 75,000/mm³',
    test: (v) => (v.platelets == null ? undefined : v.platelets < 75000),
    describe: 'Relative contraindication — thrombocytopenia.',
    severity: 'warning',
    provenance: ntep('Table 3.2, relative contraindications for BPaLM, p. 25'),
  },
  {
    id: 'anc',
    label: 'Absolute neutrophil count below 1000/mm³',
    test: (v) => (v.anc == null ? undefined : v.anc < 1000),
    describe: 'Relative contraindication — leukopenia.',
    severity: 'warning',
    provenance: ntep('Table 3.2, relative contraindications for BPaLM, p. 25'),
  },
  {
    id: 'potassium',
    label: 'Serum potassium below 3.2 mmol/L',
    test: (v) => (v.potassium == null ? undefined : v.potassium < 3.2),
    describe:
      'Correct before giving any QT-prolonging drug. Low potassium, calcium and magnesium all prolong the QT interval.',
    severity: 'warning',
    provenance: {
      citations: [{ source: 'who-m4-2025', locator: 'endTB screening laboratory criteria' }],
      status: 'source-checked',
    },
  },
]

export const RELATIVE_CONTRAINDICATIONS: Statement[] = [
  {
    id: 'rc.cyp',
    text: 'Strong inhibitors or inducers of cytochrome P450',
    provenance: ntep('Table 3.2, notes, p. 25'),
  },
  {
    id: 'rc.qt',
    text: 'Other QT-prolonging drugs — antifungals, antiarrhythmics, antipsychotics',
    provenance: ntep('Table 3.2, notes, p. 25'),
  },
  {
    id: 'rc.serotonin',
    text: 'Serotonergic drugs, MAO inhibitors within 2 weeks, or serotonergic/tricyclic antidepressants within 3 days',
    detail: 'Linezolid is an MAO inhibitor — the interaction risk is serotonin syndrome.',
    provenance: {
      citations: [
        { source: 'ntep-drtb-2024', locator: 'Table 3.2, notes, p. 25' },
        { source: 'who-handbook-m4-2025', locator: 'Annex 1, linezolid sheet, p. 278 — "linezolid is an MAO inhibitor"' },
      ],
      status: 'source-checked',
    },
  },
  {
    id: 'rc.myelo',
    text: 'Any drug known to induce myelosuppression',
    provenance: ntep('Table 3.2, notes, p. 25'),
  },
  {
    id: 'rc.magnesium',
    text: 'Oral magnesium-containing substances must be dosed 2 hours apart from the fluoroquinolone',
    detail: 'Magnesium binds fluoroquinolones and makes them ineffective.',
    provenance: ntep('Table 3.2, notes, p. 25'),
  },
  {
    id: 'rc.neuropathy',
    text: 'Severe neuropathy — grade 3 or 4 peripheral neuropathy',
    provenance: ntep('Table 3.2, relative contraindications, p. 25'),
  },
]

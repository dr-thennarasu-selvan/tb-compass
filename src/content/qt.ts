import type { Provenance, Severity, Statement } from '@/types/content'

/**
 * QT prolongation on DR-TB treatment.
 * NTEP DR-TB 2024, Annexure 4, pp. 64-65.
 */

const ntep = (locator: string): Provenance => ({
  citations: [{ source: 'ntep-drtb-2024', locator }],
  status: 'source-checked',
})

/** Drugs that prolong QTcF, with relative weight where the source states it. */
export interface QtDrug {
  id: string
  name: string
  note?: string
}

export const QT_PROLONGING_DRUGS: QtDrug[] = [
  { id: 'bedaquiline', name: 'Bedaquiline', note: 'Its use alone mandates ECG monitoring.' },
  { id: 'moxifloxacin', name: 'Moxifloxacin', note: 'Greatest QTcF prolongation among the fluoroquinolones.' },
  { id: 'clofazimine', name: 'Clofazimine' },
  { id: 'pretomanid', name: 'Pretomanid' },
  { id: 'delamanid', name: 'Delamanid' },
  { id: 'levofloxacin', name: 'Levofloxacin', note: 'Lower risk than moxifloxacin.' },
]

export const QT_AGENTS_PROVENANCE = ntep('Annexure 4, QT Prolongation, suspected agents, p. 64')

/**
 * When ECG monitoring is required at all. NTEP is specific and narrower than
 * "monitor everyone": bedaquiline alone, or any two QT-prolonging drugs.
 */
export const ECG_MONITORING_RULE: Statement = {
  id: 'qt.monitoring',
  text: 'ECG before starting and during treatment is required only with bedaquiline, or when two QT-prolonging drugs are combined',
  detail:
    'The two-drug trigger counts moxifloxacin, clofazimine, pretomanid and delamanid. Levofloxacin carries lower risk than moxifloxacin but still counts as QT-prolonging.',
  provenance: ntep('Annexure 4, QT Prolongation, p. 64'),
}

export interface QtGrade {
  grade: 0 | 1 | 2 | 3 | 4
  label: string
  /** Threshold description as the source states it. */
  range: string
  condition: string
  actions: string[]
  severity: Severity
  provenance: Provenance
}

export const QT_GRADES: QtGrade[] = [
  {
    grade: 0,
    label: 'Normal',
    range: 'QTcF below 450 ms (male) or below 470 ms (female)',
    condition: 'Asymptomatic',
    actions: ['No QT-specific action. Continue the regimen.'],
    severity: 'ok',
    provenance: ntep('Annexure 4, QT table, Normal Value, p. 65'),
  },
  {
    grade: 1,
    label: 'Grade 1 — mild',
    range: 'Male 450–480 ms; female 470–480 ms',
    condition: 'Asymptomatic',
    actions: ['Check electrolytes and correct them as necessary.', 'Monitor ECG more closely.'],
    severity: 'caution',
    provenance: ntep('Annexure 4, QT table, Grade 1, p. 65'),
  },
  {
    grade: 2,
    label: 'Grade 2 — moderate',
    range: '481–500 ms',
    condition: 'Asymptomatic, transient rhythm abnormality',
    actions: [
      'Check electrolytes.',
      'If electrolytes are abnormal: HOLD all QTcF-prolonging drugs and correct the electrolytes before restarting them.',
      'Monitor ECG more closely.',
    ],
    severity: 'warning',
    provenance: ntep('Annexure 4, QT table, Grade 2, p. 65'),
  },
  {
    grade: 3,
    label: 'Grade 3 — severe',
    range: 'Above 500 ms on TWO separate ECGs',
    condition: 'Recurrent, persistent, symptomatic arrhythmia',
    actions: [
      'Consider hospitalisation.',
      'Hold QTcF-prolonging drugs.',
      'Correct electrolytes as necessary.',
      'Repeat ECG after 24 hours and reintroduce the drugs if QTcF remains below 500 ms.',
    ],
    severity: 'critical',
    provenance: ntep('Annexure 4, QT table, Grade 3, p. 65'),
  },
  {
    grade: 4,
    label: 'Grade 4 — life-threatening',
    range: 'Above 500 ms WITH life-threatening consequences',
    condition: 'Unstable dysrhythmia',
    actions: [
      'Hospitalise.',
      'Replete electrolytes as necessary.',
      'STOP the offending drug.',
      'Repeat ECG after 24 hours.',
    ],
    severity: 'critical',
    provenance: ntep('Annexure 4, QT table, Grade 4, p. 65'),
  },
]

export const QT_SUPPORTING_MEASURES: Statement[] = [
  {
    id: 'qt.electrolytes',
    text: 'Keep potassium, calcium and magnesium in the normal range',
    detail:
      'Low levels of all three are associated with QT prolongation. Correct them in any patient with an elevated QT interval.',
    provenance: ntep('Annexure 4, QT Prolongation, p. 64'),
  },
  {
    id: 'qt.other-drugs',
    text: 'Avoid other drugs that prolong the QT interval',
    provenance: ntep('Annexure 4, QT Prolongation, p. 64'),
  },
  {
    id: 'qt.organ-function',
    text: 'Monitor renal and hepatic function',
    detail: 'Both affect clearance of the QT-prolonging drugs.',
    provenance: ntep('Annexure 4, QT Prolongation, p. 64'),
  },
  {
    id: 'qt.risk',
    text: 'Prolonged QTcF risks torsades de pointes and sudden death',
    detail:
      'This is why serial ECG monitoring is not optional while these drugs are in use.',
    provenance: ntep('Annexure 4, QT Prolongation, p. 64'),
  },
]

export const QTCF_FORMULA_PROVENANCE: Provenance = {
  citations: [{ source: 'ntep-drtb-2024', locator: 'Annexure 4: QT corrected for heart rate using Fridericia correction, p. 64' }],
  status: 'source-checked',
}

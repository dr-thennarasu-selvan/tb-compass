import type { ConditionWorkflow } from '@/types/workflow'

/** Paediatric tubercular meningitis — ICMR STW, ICD-10 A17.0. Source p. 19. */
export const PAED_TBM: ConditionWorkflow = {
  id: 'paed-tbm',
  site: 'cns',
  title: 'Paediatric tubercular meningitis',
  icd10: 'A17.0',
  whenToSuspect: {
    history: [
      'Fever with one or more of: headache, vomiting, seizures, irritability/lethargy/drowsiness',
      'Loss of function — recent onset deviation of eyes or mouth, weakness of arm or leg, altered mentation',
      'Malaise, anorexia, weight loss',
      'Symptoms usually of 5–7 days duration with insidious onset, particularly with a history of exposure to infectious TB in the past 2 years',
    ],
    examination: [
      'Assessment of sensorium using a standardised scale — Glasgow Coma Scale or AVPU',
      'Full or bulging anterior fontanelle',
      'Meningeal irritation — neck stiffness, Kernig’s and Brudzinski’s signs',
      'Eye examination if feasible for papilloedema, choroid tubercles, optic atrophy',
      'Cranial nerves',
      'Motor system including power, reflexes and plantar responses',
      'Peripheral lymph nodes',
      'Chest examination for signs of pulmonary involvement',
    ],
  },
  investigations: {
    essential: [
      'CBC',
      'CSF: cell count and differential, sugar with a simultaneous blood sugar, protein, NAAT (ICMR/NTEP approved, use 3–5 mL CSF if possible), MGIT culture, bacterial culture',
      'HIV',
      'Contrast enhanced CT scan of head',
      'Chest X-ray',
      'Gastric lavage or induced sputum where the CXR is abnormal and CSF NAAT is negative',
    ],
    desirable: ['MRI brain with contrast when CECT is not contributory'],
  },
  diagnostic: {
    entry: 'suspected',
    nodes: [
      {
        id: 'suspected',
        text: 'Suspected TBM — immediate investigations: CBC, HIV, CECT head, CSF panel, CXR',
        branches: [
          { label: 'AFB seen or CSF NAAT positive — microbiologically confirmed', to: 'start' },
          { label: 'Not microbiologically confirmed — apply the criteria', to: 'criteria' },
        ],
      },
      {
        id: 'criteria',
        text: 'Apply criteria 1, 2 and 3 (see the table below). Are 2 or more criteria met?',
        branches: [
          { label: 'Yes — 2 or more criteria met', to: 'start' },
          { label: 'No', to: 'bacterial' },
        ],
      },
      {
        id: 'start',
        text: 'Criteria met, or microbiologically confirmed',
        action: 'Start treatment: 2 HRZE and 10 HRE, with steroids.',
        severity: 'ok',
      },
      {
        id: 'bacterial',
        text: 'Criteria not met — continue investigation and management for partially treated bacterial meningitis',
        branches: [
          { label: 'Improving', to: 'continue-eval' },
          { label: 'NOT better', to: 'repeat' },
        ],
      },
      {
        id: 'repeat',
        text: 'Not better: repeat LP after 48–72 hours, expand the search for TB elsewhere, consider contrast MRI if not done earlier',
        branches: [
          { label: 'Re-review criteria — now more than 2 fulfilled', to: 'start' },
          { label: 'Still not fulfilled', to: 'deterioration' },
        ],
      },
      {
        id: 'deterioration',
        text: 'Falling CSF glucose, dropping sensorium, or a new focal deficit?',
        branches: [
          { label: 'Yes — any of these', to: 'start' },
          { label: 'No', to: 'continue-eval' },
        ],
      },
      {
        id: 'continue-eval',
        text: 'No criteria met and no deterioration',
        action: 'Continue evaluation.',
        severity: 'info',
      },
    ],
  },
  management: {
    treatment: [
      'Anti-TB regimen: 2 HRZE and 10 HRE in appropriate paediatric doses.',
      'Pyridoxine 10 mg/day.',
      'Corticosteroids: prednisolone 2 mg/kg/day for 4 weeks, then taper over 4 weeks. A slower taper is needed in some patients. An equivalent dose of another steroid formulation may be used, injectable or oral.',
      'Supportive: care of the unconscious child, nasogastric feeding if indicated, anti-oedema measures (mannitol, hypertonic saline, glycerol, acetazolamide), anticonvulsants if seizures.',
      'Surgical therapy if indicated: external ventricular drain, ventriculoperitoneal shunt.',
    ],
    whenToRefer: [
      'Cases should be managed at least at a district hospital.',
      'Unresponsive child or rapid deterioration indicating need for intensive care',
      'No diagnosis after initial evaluation',
      'Surgical treatment needed',
      'MDR TB meningitis',
      'No improvement or deterioration after 2–4 weeks of treatment',
      'Need for ICU care',
    ],
    followUp: ['Follow up as per NTEP guidelines.'],
  },
  tables: [
    {
      title: 'Diagnostic criteria — 2 or more criteria met means start treatment',
      columns: ['Criterion', 'Content'],
      rows: [
        [
          'Criterion 1 — more than 3 of these',
          'Over 5 days of symptoms; TLC below 15,000/cumm; CSF WBC 10–500/cumm; CSF sugar below 50% of blood sugar; CSF lymphocytes above 50%; neuroimaging showing one or more of basal exudates, hydrocephalus, infarct, tuberculoma',
        ],
        [
          'Criterion 2 — 2 or more risk factors',
          'HIV infection; severe acute malnutrition; recent contact with infectious TB',
        ],
        ['Criterion 3', 'Evidence of TB elsewhere'],
      ],
      provenance: {
        citations: [{ source: 'icmr-stw', locator: 'Paediatric TBM workflow, diagnostic algorithm criteria, p. 19' }],
        status: 'source-checked',
      },
    },
    {
      title: 'CECT findings in TB',
      columns: ['Finding', ''],
      rows: [
        ['Hydrocephalus', 'Ventricular dilatation'],
        ['Thick basal exudates', ''],
        ['Tuberculoma', ''],
      ],
      provenance: {
        citations: [{ source: 'icmr-stw', locator: 'Paediatric TBM workflow, neuroimaging in TB, p. 19' }],
        status: 'source-checked',
      },
    },
  ],
  provenance: {
    citations: [{ source: 'icmr-stw', locator: 'Paediatric tubercular meningitis workflow, ICD-10 A17.0, p. 19' }],
    status: 'source-checked',
  },
}

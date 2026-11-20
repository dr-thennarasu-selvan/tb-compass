import type { ConditionWorkflow } from '@/types/workflow'
import type { Statement } from '@/types/content'

/**
 * Adult tubercular meningitis — ICMR Standard Treatment Workflow, ICD-10 A17.0.
 * Transcribed from docs/ICMR-STW-TB-Workflows.pdf, p. 5.
 */
/**
 * The continuation-phase drug for TBM differs between national sources, and
 * the difference is consequential: pyrazinamide for ten months is a very
 * different hepatotoxicity exposure from ethambutol, and the two differ in CSF
 * penetration. Not resolved here.
 */
export const TBM_CONTINUATION_CONFLICT: Statement = {
  id: 'tbm.continuation.conflict',
  text: 'Sources disagree on the third continuation-phase drug: RHZ or RHE',
  detail:
    'The ICMR TBM workflow (p. 5) says RHZ for at least 10 months. The ICMR DS-TB workflow (March 2022) says RHE for at least 10 months, as do the author’s HIV-TB notes. Pyrazinamide penetrates CSF well but adds ten further months of hepatotoxic exposure; ethambutol penetrates CSF poorly. Decide which your centre follows and record it.',
  provenance: {
    citations: [
      { source: 'icmr-stw', locator: 'TBM workflow, Management, p. 5 — "Continuation phase: 3 drugs: RHZ for at least 10 months"' },
      { source: 'ntep-stw-dstb-2022', locator: 'Special considerations for Adult TB Meningitis — "Continuation phase: 3 drugs-RHE for at least 10 months"' },
      { source: 'icmr-stw', locator: 'Paediatric TBM workflow, Treatment, p. 19 — "2 HRZE and 10 HRE"' },
    ],
    status: 'disputed',
    divergence:
      'Three current Indian national sources, and the adult TBM page disagrees with the other two — including the paediatric TBM page in the SAME document. Not an edition artefact.',
  },
}

/** Complications to watch for, each with the presentation that signals it. */
export const TBM_COMPLICATIONS: { name: string; presentation: string }[] = [
  {
    name: 'Hydrocephalus and raised intracranial pressure',
    presentation: 'Worsening headache with vomiting and/or altered sensorium',
  },
  {
    name: 'Optico-chiasmatic arachnoiditis',
    presentation: 'Vision loss in one or both eyes, with or without headache',
  },
  {
    name: 'Myelitis and/or arachnoiditis',
    presentation: 'Paraparesis or quadriparesis, with or without sensory disturbance and bladder involvement',
  },
  {
    name: 'Epidural abscess / Pott’s spine',
    presentation: 'Back pain and/or weakness in one or both lower limbs, bladder or bowel disturbance',
  },
  {
    name: 'Tuberculoma',
    presentation: 'Seizures, new onset focal deficits, worsening headache',
  },
  {
    name: 'Seizures',
    presentation: 'Consider tuberculoma, electrolyte or metabolic imbalance, or cerebral infarction',
  },
  {
    name: 'Cerebral infarction and stroke',
    presentation: 'Sudden onset hemiparesis, new onset confusion, altered mental status, seizures',
  },
  {
    name: 'Hyponatraemia, SIADH',
    presentation: 'Persistent or worsening mental status',
  },
]

export const TBM_COMPLICATIONS_PROVENANCE = {
  citations: [{ source: 'icmr-stw', locator: 'TBM workflow, "Suspect common complications", p. 5' }],
  status: 'source-checked' as const,
}

/** CSF profile comparison — the table that actually makes the diagnosis. */
export const CSF_PROFILES = [
  {
    type: 'Tubercular',
    cellCount: 'Usually below 500',
    cellType: 'Lymphocytic; neutrophilic in some acute cases',
    protein: 'High',
    sugar: 'Low',
    tests: 'AFB smear and culture, Xpert/TrueNat',
  },
  {
    type: 'Pyogenic',
    cellCount: 'In thousands',
    cellType: 'Neutrophilic',
    protein: 'Moderately high',
    sugar: 'Very low',
    tests: 'Gram stain, culture',
  },
  {
    type: 'Fungal',
    cellCount: 'Variable',
    cellType: 'Lymphocytic',
    protein: 'High',
    sugar: 'Low',
    tests: 'India ink, fungal culture, cryptococcal antigen',
  },
  {
    type: 'Viral',
    cellCount: '50–500',
    cellType: 'Lymphocytic',
    protein: 'Normal to marginally high',
    sugar: 'Normal',
    tests: 'PCR for specific virus',
  },
]

export const CSF_PROFILES_PROVENANCE = {
  citations: [{ source: 'icmr-stw', locator: 'TBM workflow, "CSF findings in TBM and other meningitis", p. 5' }],
  status: 'source-checked' as const,
}

export const TBM: ConditionWorkflow = {
  id: 'tbm',
  site: 'cns',
  title: 'Adult tubercular meningitis',
  icd10: 'A17.0',
  whenToSuspect: {
    history: [
      'Fever of 5 days or more — duration can be days to weeks to months',
      'Headache',
      'Vomiting',
      'Altered sensorium',
      'Cranial nerve palsy',
      'Hemiparesis or any limb weakness',
      'Seizures',
      'Neck pain and stiffness',
      'Always enquire: constitutional symptoms, active TB elsewhere, past TB and ATT, TB contact, HIV, low socio-economic status, high endemic area',
    ],
    examination: [
      'Neck rigidity, Kernig’s sign',
      'Cranial nerve palsy',
      'Focal neurological deficits',
      'Fundus examination for papilloedema',
    ],
  },
  investigations: {
    essential: [
      'CSF is MANDATORY — send for essential analysis',
      'CSF essential panel: cell count and type, protein, sugar with a corresponding blood sugar, GeneXpert/TrueNat, Gram stain, bacterial culture, AFB stain, AFB culture and sensitivity, India ink, cryptococcal antigen',
      'NCCT/CECT head — preferred initial investigation',
      'CBC, ESR, CRP',
      'LFT, RFT, electrolytes',
      'Blood sugar',
      'HIV',
      'Chest X-ray PA view',
      'USG whole abdomen',
    ],
    desirable: [
      'MRI brain, and spine if indicated, in selected cases',
      'CSF fungal smear and culture',
      'CSF cytopathology — to exclude carcinomatous meningitis',
      'CSF wet mount, VDRL, toxoplasma PCR (especially in HIV), viral PCR',
      'Mantoux (optional)',
    ],
  },
  diagnostic: {
    entry: 'suspected',
    nodes: [
      {
        id: 'suspected',
        text: 'TBM suspected on clinical features',
        branches: [
          { label: 'Papilloedema and/or focal deficits present', to: 'ct-first' },
          { label: 'No papilloedema or focal deficits', to: 'lp' },
        ],
      },
      {
        id: 'ct-first',
        text: 'CT head BEFORE lumbar puncture',
        action: 'Perform CT head first. It is prudent to image before CSF sampling when there is papilloedema or a focal deficit.',
        severity: 'warning',
        branches: [{ label: 'Imaging done, safe to proceed', to: 'lp' }],
      },
      {
        id: 'lp',
        text: 'Lumbar puncture — send the essential CSF panel',
        branches: [
          { label: 'Xpert/TrueNat POSITIVE', to: 'confirmed' },
          { label: 'Xpert/TrueNat NEGATIVE', to: 'negative-xpert' },
        ],
      },
      {
        id: 'confirmed',
        text: 'Microbiologically confirmed TBM',
        action: 'Start ATT and steroids. Check the rifampicin resistance result before committing to the regimen.',
        severity: 'ok',
      },
      {
        id: 'negative-xpert',
        text: 'A negative Xpert/TrueNat does NOT rule out TBM',
        action:
          'Decide on ATT from the clinical features and the CSF profile, not from the molecular result. A lymphocytic CSF with high protein and low sugar supports TBM even with a negative Xpert.',
        severity: 'critical',
      },
    ],
  },
  management: {
    treatment: [
      'Intensive phase: 2 months of RHZE or RHZS.',
      'Continuation phase: 3 drugs, RHZ, for at least 10 months. SEE THE CONFLICT NOTE BELOW — two other national sources say RHE.',
      'Steroids: preferably dexamethasone 0.4 mg/kg/day intravenously in 3–4 divided doses during the hospital stay.',
      'If IV is not feasible: oral dexamethasone 0.4 mg/kg/day in divided doses, or oral prednisolone 1 mg/kg/day as a single morning dose.',
      'Discharge on tapering oral steroids for a total duration of 8–12 weeks.',
      'Treatment duration may be increased in some cases per clinical decision.',
      'HIV changes the strength of the steroid recommendation: in HIV-NEGATIVE people steroids are a STRONG recommendation on high quality evidence, for at least 4 weeks with tapering. In HIV-POSITIVE people they are only CONDITIONAL, on very low quality evidence, and only where other life-threatening opportunistic infections are absent (INDEX-TB 2016).',
    ],
    whenToRefer: [
      'TBM suspected but the centre lacks lumbar puncture or CT facilities — refer before working up.',
      'Any complication below.',
    ],
    followUp: [
      'Review monthly for at least the first 3 months, then at increasing intervals until treatment stops.',
      'Monitor liver function tests and watch for other drug toxicity — this regimen runs 12 months.',
      'Observe for clinical improvement or deterioration.',
      'Watch specifically for the complications listed below.',
    ],
  },
  conflicts: [TBM_CONTINUATION_CONFLICT],
  complications: { items: TBM_COMPLICATIONS, provenance: TBM_COMPLICATIONS_PROVENANCE },
  tables: [
    {
      title: 'CSF findings in TBM and other meningitis',
      columns: ['Type', 'Cell count', 'Predominant cell', 'Protein', 'Sugar', 'Confirmatory tests'],
      rows: CSF_PROFILES.map((p) => [p.type, p.cellCount, p.cellType, p.protein, p.sugar, p.tests]),
      provenance: CSF_PROFILES_PROVENANCE,
    },
  ],
  provenance: {
    citations: [{ source: 'icmr-stw', locator: 'Adult tubercular meningitis workflow, ICD-10 A17.0, p. 5' }],
    status: 'source-checked',
  },
}


import type { ConditionWorkflow } from '@/types/workflow'

/**
 * Adult pleural tuberculosis — ICMR Standard Treatment Workflow, ICD-10 A15.6.
 * Transcribed from the rendered page (docs/ICMR-STW-TB-Workflows.pdf, p. 3).
 */
export const PLEURAL_TB: ConditionWorkflow = {
  id: 'pleural',
  site: 'pleural',
  title: 'Adult pleural tuberculosis',
  icd10: 'A15.6',
  whenToSuspect: {
    history: [
      'Fever',
      'Pleuritic chest pain',
      'Cough',
      'Breathlessness',
      'Anorexia',
      'Weight loss',
      'History of TB contact',
    ],
    examination: ['Dullness to percussion', 'Decreased or absent breath sounds'],
  },
  investigations: {
    essential: [
      'CXR to confirm pleural effusion',
      'Sputum for AFB / NAAT',
      'Refer immediately for pleural tap',
      'Thoracentesis, ultrasound-assisted',
      'Pleural fluid: cell count (total and differential), protein, glucose, Gram stain, bacterial culture, AFB stain, ADA, NAAT, cytology',
    ],
    desirable: [
      'CT chest before pleural biopsy',
      'Pleural biopsy — image-guided or thoracoscopic — if diagnosis is uncertain',
      'Histopathology',
      'MGIT culture',
    ],
  },
  diagnostic: {
    entry: 'effusion',
    nodes: [
      {
        id: 'effusion',
        text: 'Pleural effusion → sputum examination and thoracentesis',
        branches: [
          { label: 'Alternate aetiology — transudate, or exudate from bacterial infection or malignancy', to: 'alternate' },
          { label: 'Sputum or pleural fluid positive for AFB or NAAT', to: 'micro-positive' },
          { label: 'Sputum and pleural fluid negative', to: 'ada' },
        ],
      },
      { id: 'alternate', text: 'Alternate aetiology established', action: 'Treat accordingly.', severity: 'info' },
      {
        id: 'micro-positive',
        text: 'Microbiologically confirmed',
        action: 'Start anti-TB treatment.',
        severity: 'ok',
      },
      {
        id: 'ada',
        text: 'Pleural fluid ADA',
        branches: [
          { label: 'Below 40 U/L', to: 'biopsy' },
          { label: '40–69 U/L', to: 'intermediate' },
          { label: '70 U/L or above', to: 'empiric' },
        ],
      },
      {
        id: 'intermediate',
        text: 'Age under 40, fever, non-smoker, and alternate aetiology unlikely?',
        branches: [
          { label: 'Yes — all four', to: 'empiric' },
          { label: 'No', to: 'biopsy' },
        ],
      },
      {
        id: 'empiric',
        text: 'Initiate empiric anti-TB therapy',
        action: 'Start ATT. If there is no response in 4 weeks, proceed to pleural biopsy.',
        severity: 'warning',
        branches: [{ label: 'No response in 4 weeks', to: 'biopsy' }],
      },
      {
        id: 'biopsy',
        text: 'Pleural biopsy',
        action: 'Treat based on the results of biopsy and microbiological examination.',
        severity: 'caution',
      },
    ],
  },
  management: {
    treatment: [
      'Treat as per NTEP.',
      'Steroids are NOT routinely recommended in pleural TB (INDEX-TB 2016, conditional recommendation, low quality evidence).',
      'Therapeutic pleural tap under ultrasound if the effusion is large and the patient is breathless.',
    ],
    whenToRefer: [
      'Facility for ultrasound assistance not available',
      'Diagnosis not established after thoracentesis, and no facility for pleural biopsy',
      'Drug-resistant TB detected — manage per NTEP',
      'Worsening pleural effusion on follow-up',
    ],
    followUp: [
      'Most responders improve in general condition by 2 weeks, with significant improvement in the effusion by 4–8 weeks.',
      'Disappearance of constitutional symptoms with a shrinking effusion indicates response.',
      'An INCREASING effusion suggests a paradoxical reaction, drug-resistant TB, or an alternative aetiology — three different problems with three different actions.',
      'Follow-up CXR at 4–8 weeks after starting ATT.',
    ],
  },
  provenance: {
    citations: [
      { source: 'icmr-stw', locator: 'Adult pleural tuberculosis workflow, ICD-10 A15.6, p. 3' },
      { source: 'index-tb-2016', locator: 'Recommendations: adjunctive steroids in EPTB — pleural TB' },
    ],
    status: 'source-checked',
  },
}

import type { ConditionWorkflow } from '@/types/workflow'
import type { Provenance } from '@/types/content'

const stw: Provenance = {
  citations: [{ source: 'icmr-stw', locator: 'Paediatric intrathoracic TB workflow, ICD-10 A15, p. 16' }],
  status: 'source-checked',
}

/** Paediatric intrathoracic TB (pulmonary, pleural, mediastinal) — ICMR STW, A15. Source p. 16. */
export const PAED_INTRATHORACIC: ConditionWorkflow = {
  id: 'paed-intrathoracic',
  site: 'pulmonary',
  title: 'Paediatric intrathoracic TB (pulmonary, pleural, mediastinal)',
  icd10: 'A15',
  whenToSuspect: {
    history: [
      'Documented, persistent unexplained fever for 2 weeks or more',
      'Unremitting cough for 2 weeks or more',
      'Unexplained documented weight loss of 5% or more in the last 3 months',
      'No weight gain despite adequate nutrition',
      'Unexplained loss of appetite',
      'Chest pain — specific to pleural effusion',
      'Contact with a TB patient in the past 2 years',
    ],
    examination: [
      'Temperature, weight, mid-arm circumference',
      'Lymphadenopathy, cold abscess, discharging sinus',
      'Chest findings depend on the underlying pathology — consolidation, pleural effusion',
    ],
  },
  investigations: {
    essential: [
      'Chest X-ray. TB-suggestive: hilar/paratracheal lymph nodes, fibrocavitary disease, miliary pattern. Non-specific: effusion, consolidation, bronchopneumonia',
      'Sputum, induced sputum, gastric lavage or aspirate, or pleural fluid for NAAT',
      'Smear examination only if NAAT is unavailable',
      'If facilities exist, send an aliquot for culture when NAAT is negative for MTB',
      'Pleural tap: gross appearance, cytology, biochemistry, NAAT, MGIT/LJ, ZN if NAAT not available',
      'HIV testing for ALL cases with TB',
    ],
    desirable: [
      'Chest X-ray of family members',
      'Pleural biopsy — caseating granulomas with Langerhans giant cells, epithelioid cells and lymphocytes (institutions only)',
      'Image-guided mediastinal lymph node biopsy (USG/CT)',
      'CECT scan',
      'Bronchoscopy and BAL',
    ],
  },
  diagnostic: {
    entry: 'cxr',
    nodes: [
      {
        id: 'cxr',
        text: 'Chest X-ray',
        branches: [
          { label: 'CXR suggestive of TB', to: 'naat' },
          { label: 'CXR shows non-specific shadows', to: 'antibiotics' },
          { label: 'Pleural effusion', to: 'pleural' },
          { label: 'CXR normal', to: 'eptb' },
        ],
      },
      {
        id: 'antibiotics',
        text: 'Non-specific shadows — give antibiotics (amoxyclav or co-trimoxazole). AVOID quinolones and linezolid. Skip if already taken.',
        branches: [
          { label: 'Persistent shadow and symptoms', to: 'naat' },
          { label: 'Resolved', to: 'resolved' },
        ],
      },
      { id: 'resolved', text: 'Shadow and symptoms resolved', action: 'Not TB. No ATT.', severity: 'info' },
      {
        id: 'naat',
        text: 'Sputum, gastric aspirate or induced sputum for approved NAAT',
        branches: [
          { label: 'MTB positive', to: 'confirmed' },
          { label: 'MTB negative', to: 'mtb-neg' },
        ],
      },
      {
        id: 'confirmed',
        text: 'Microbiologically confirmed TB case',
        action:
          'If rifampicin resistance POSITIVE, follow the DR-TB pathway. If rifampicin resistance NEGATIVE, give first-line ATT.',
        severity: 'ok',
      },
      {
        id: 'mtb-neg',
        text: 'MTB negative',
        action:
          'Look for a significantly enlarged peripheral lymph node and test the aspirate for MTB. Repeat NAAT with a good sample or alternative sample (BAL, aspirate) as feasible. May seek review from a higher centre. If MTB remains negative or repeat testing is not feasible, treat as a clinically diagnosed probable TB case.',
        severity: 'caution',
      },
      {
        id: 'pleural',
        text: 'Pleural effusion — pleural fluid for NAAT, cytology, biochemistry, plus sputum/GA/IS for NAAT',
        branches: [
          { label: 'MTB positive', to: 'confirmed' },
          { label: 'MTB negative, straw-coloured exudative effusion', to: 'clinical-pleural' },
        ],
      },
      {
        id: 'clinical-pleural',
        text: 'Straw-coloured exudative effusion, MTB negative',
        action: 'No alternative diagnosis — treat as a clinically diagnosed probable TB case.',
        severity: 'caution',
      },
      {
        id: 'eptb',
        text: 'CXR normal — check for extrapulmonary TB',
        action:
          'Needs detailed investigation for TB or an alternate diagnosis. May need CECT chest or other investigations as per symptoms. Consider referral to a higher centre.',
        severity: 'info',
      },
    ],
  },
  management: {
    treatment: [
      'Microbiologically confirmed RS pulmonary TB, clinically diagnosed pulmonary TB, and drug-sensitive previously treated TB: 2HRZE + 4HRE.',
      'Isoniazid 7–15 mg/kg (max 300 mg/day); rifampicin 10–20 mg/kg (max 600 mg/day); pyrazinamide 30–40 mg/kg (max 2000 mg/day); ethambutol 15–25 mg/kg (max 1500 mg/day).',
      'Pyridoxine 10 mg/day for 6 months.',
      'Consider steroids in miliary TB with hypoxia, endobronchial TB, and disseminated TB: prednisone 2 mg/kg/day or dexamethasone 0.6 mg/kg/day for 4 weeks, reduced gradually over the next 4 weeks before stopping.',
      'Nutritional support. Treat co-morbid conditions: HIV, severe acute malnutrition.',
    ],
    whenToRefer: [
      'Rifampicin resistance detected — DR-TB pathway',
      'No response in 4 weeks — reinvestigate for DR-TB',
      'Pleural tap not possible at primary level',
      'MTB negative with persistent suspicion — review from a higher centre',
    ],
    followUp: [
      'Assess on day 15 for adherence, correct dose, combination and tolerance; then every month until completion.',
      'NAAT is NOT an appropriate follow-up tool for monitoring progress of disease.',
      'Smear examination at end of treatment, to declare the outcome.',
      'Repeat microbiological testing (smear, MGIT, NAAT) at end of intensive phase and end of therapy if still symptomatic, or on deterioration or failure to respond.',
      'X-ray at end of therapy; also if worsening at any time, slow resolution, or persistent symptoms at end of the intensive phase.',
      'After treatment completion, follow up clinically at 6, 12, 18 and 24 months.',
    ],
  },
  tables: [
    {
      title: 'Weight-band dosing — dispersible FDCs, number of tablets per day',
      columns: ['Weight band', 'Intensive HRZ 50/75/150', 'Intensive E 100', 'Continuation HR 50/75', 'Continuation E 100'],
      rows: [
        ['4–7 kg', '1', '1', '1', '1'],
        ['8–11 kg', '2', '2', '2', '2'],
        ['12–15 kg', '3', '3', '3', '3'],
        ['16–24 kg', '4', '4', '4', '4'],
        ['25–29 kg', '3 + 1 adult FDC', '3', '3 + 1 adult FDC', '3'],
        ['30–39 kg', '2 + 2 adult FDC', '2', '2 + 2 adult FDC', '2'],
      ],
      provenance: {
        citations: [
          { source: 'icmr-stw', locator: 'Paediatric intrathoracic TB workflow, treatment table, p. 16. Adult FDC = HRZE 75/150/400/275; HRE 75/150/275' },
        ],
        status: 'source-checked',
      },
    },
    {
      title: 'DO NOT DO — tests that must not drive the diagnosis',
      columns: ['Test', 'Why not'],
      rows: [
        [
          'TST / Mantoux',
          'Overemphasised and supportive only. Do NOT diagnose TB or start ATT on the basis of a positive TST alone.',
        ],
        ['Serological tests — IGRA, Quantiferon, Quantiferon-Gold', 'Not to be used for diagnosis.'],
        ['Pleural fluid ADA', 'Not to be used for diagnosis in this setting.'],
      ],
      provenance: {
        citations: [{ source: 'icmr-stw', locator: 'Paediatric intrathoracic TB workflow, "DO NOT DO", p. 16' }],
        status: 'source-checked',
      },
    },
    {
      title: 'Managing treatment interruptions (non-adherence)',
      columns: ['Interruption', 'Action'],
      rows: [
        ['Up to 4 weeks', 'Resume therapy. Restart if doses were missed within the first 4 weeks.'],
        ['Over 4 weeks', 'Reinvestigate for DR-TB before resuming.'],
        ['Over 4 weeks, rifampicin resistance NOT detected', 'Retreat with first-line drugs; check for isoniazid resistance and treat accordingly.'],
        ['Over 4 weeks, rifampicin resistance detected', 'Treat as MDR-TB.'],
        [
          'Interruption in continuation phase, no active disease on retrieval, DR-TB tests negative',
          'Complete the remaining treatment course.',
        ],
        ['Any interruption', 'Always evaluate and address the reason — educate, address myths, fear or intolerance.'],
      ],
      provenance: {
        citations: [{ source: 'icmr-stw', locator: 'Paediatric intrathoracic TB workflow, managing treatment interruptions, p. 16' }],
        status: 'source-checked',
      },
    },
  ],
  provenance: stw,
}

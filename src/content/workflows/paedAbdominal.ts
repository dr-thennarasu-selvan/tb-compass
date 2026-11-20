import type { ConditionWorkflow } from '@/types/workflow'

/** Paediatric abdominal TB — ICMR STW, ICD-10 A18.31. Source p. 15. */
export const PAED_ABDOMINAL: ConditionWorkflow = {
  id: 'paed-abdominal',
  site: 'abdominal',
  title: 'Paediatric abdominal tuberculosis',
  icd10: 'A18.31',
  whenToSuspect: {
    history: [
      'Fever over 2 weeks',
      'Anorexia',
      'Unexplained weight loss or no weight gain in the last 3 months',
      'History of contact with a TB patient',
      'Recurrent or chronic abdominal pain in the presence of red flag signs',
      'Abdominal distension or mass',
      'Altered bowel habits',
      'Constitutional symptoms may or may not be present in suspected abdominal TB',
      'RED FLAGS: pain waking the child from sleep; chronic, severe or nocturnal diarrhoea; gastrointestinal blood loss; localised distension or mass',
    ],
    examination: [
      'Anthropometry',
      'General physical and systemic examination',
      'Peripheral lymphadenopathy, ascites, hepatosplenomegaly, doughy feel of the abdomen, palpable abdominal lump, visible peristalsis',
    ],
  },
  investigations: {
    essential: [
      'Ultrasound abdomen. SPECIFIC findings: abdominal lymph node over 15 mm in short axis, conglomerate and/or with central necrosis; omental or mesenteric thickening over 15 mm with increased echogenicity; ileocaecal wall thickening',
      'Non-specific findings: intra-abdominal fluid free or loculated, inter-loop ascites, ascitic fluid with multiple septations, abdominal lymphadenopathy with short axis under 15 mm in the absence of red flag signs',
      'Chest X-ray',
      'Sputum, gastric aspirate or induced sputum if CXR abnormal — NAAT and culture',
      'Ascitic fluid if present — cytology, protein and albumin',
      'Peripheral lymph node FNA if over 2 cm — cytology, NAAT, culture',
      'Exudative ascites: ascitic fluid for NAAT and culture. NO ROLE FOR ADA.',
    ],
    desirable: [
      'Enlarged abdominal lymph node with short axis over 15 mm: USG-guided abdominal LN-FNA for cytology, NAAT, culture',
      'Ileocaecal thickening with enlarged nearby nodes: USG-guided LN-FNA',
      'Isolated ileocaecal thickening or LN sampling not feasible: CECT abdomen or CT enterography',
      'Ileocolonoscopy with tissue biopsy for histopathology, NAAT, culture',
      'Laparoscopy with tissue biopsy',
    ],
  },
  diagnostic: {
    entry: 'suspected',
    nodes: [
      {
        id: 'suspected',
        text: 'Abdominal TB suspected — look for peripheral nodes, get CXR and abdominal ultrasound',
        branches: [
          { label: 'USG suggestive of TB', to: 'usg-suggestive' },
          { label: 'USG normal', to: 'usg-normal' },
        ],
      },
      {
        id: 'usg-normal',
        text: 'Ultrasound normal',
        action: 'Evaluate for other causes, or refer to a higher centre.',
        severity: 'info',
      },
      {
        id: 'usg-suggestive',
        text: 'Ultrasound suggestive — which route to tissue?',
        branches: [
          { label: 'CXR abnormal', to: 'sputum' },
          { label: 'Peripheral nodes present', to: 'fna' },
          { label: 'No peripheral nodes, CXR normal', to: 'no-nodes' },
        ],
      },
      {
        id: 'sputum',
        text: 'Sputum, gastric aspirate or induced sputum for NAAT/MGIT',
        branches: [
          { label: 'Positive', to: 'treat' },
          { label: 'Negative', to: 'no-nodes' },
        ],
      },
      {
        id: 'fna',
        text: 'FNA for NAAT, MGIT, cytopathology',
        branches: [
          { label: 'Positive', to: 'treat' },
          { label: 'Negative', to: 'no-nodes' },
        ],
      },
      {
        id: 'no-nodes',
        text: 'No peripheral nodes and normal CXR — what does the ultrasound show?',
        branches: [
          { label: 'Ascites', to: 'ascites' },
          { label: 'Lymphadenopathy', to: 'ln-fna' },
          { label: 'Ileocaecal TB', to: 'cect' },
        ],
      },
      {
        id: 'ascites',
        text: 'Ascitic fluid aspiration — cytology, protein, sugar',
        action:
          'If exudative with lymphocytic predominance, send ascitic fluid for NAAT/MGIT. If positive, start treatment.',
        severity: 'caution',
      },
      {
        id: 'ln-fna',
        text: 'USG-guided abdominal LN-FNA for NAAT, MGIT, cytopathology',
        action: 'If positive, start treatment. Refer to a higher centre if FNA is not available or feasible.',
        severity: 'caution',
      },
      {
        id: 'cect',
        text: 'CECT abdomen or CT enterography',
        action:
          'Consider where there is isolated ileocaecal thickening or LN sampling is not feasible. Refer to a higher centre if unavailable.',
        severity: 'caution',
      },
      { id: 'treat', text: 'Microbiologically positive', action: 'Start treatment: 2 HRZE + 4 HRE for 6 months.', severity: 'ok' },
    ],
  },
  management: {
    treatment: [
      'Start treatment and follow up as per NTEP.',
      'ATT for 6 months: 2 HRZE + 4 HRE.',
      'Pyridoxine 10 mg/day.',
      'STEROIDS ARE NOT USEFUL AND NOT RECOMMENDED.',
      'Supportive: management of severe acute malnutrition as per national guidelines.',
      'Surgical treatment for acute intestinal obstruction or bowel perforation, and for persistence of obstructive symptoms despite conservative management and ATT.',
      'DO NOT start empirical ATT for recurrent or chronic abdominal pain WITHOUT red flag signs, or for chronic diarrhoea without proper evaluation.',
    ],
    whenToRefer: [
      'Diagnosis uncertain and additional investigations are required',
      'Acute intestinal obstruction or bowel perforation',
      'Drug-resistant TB',
      'No response to appropriate treatment',
      'Oral drug intolerance, or ATT cannot be given',
    ],
    followUp: [
      'Clinical follow-up every month during treatment, and after treatment every 3 months.',
      'Radiological by ultrasound at the end of treatment, or if worsening or not responding.',
      'Microbiological if worsening or not responding.',
      'Pointers towards DR-TB investigation: non-response, or worsening or deterioration of constitutional symptoms after initial improvement.',
      'Obstructive symptoms may persist or worsen despite ATT — this alone is not treatment failure.',
      'Monitor adherence and for ATT-induced adverse drug reactions.',
    ],
  },
  provenance: {
    citations: [{ source: 'icmr-stw', locator: 'Paediatric abdominal tuberculosis workflow, ICD-10 A18.31, p. 15' }],
    status: 'source-checked',
  },
}

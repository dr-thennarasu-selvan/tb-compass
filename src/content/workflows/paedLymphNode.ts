import type { ConditionWorkflow } from '@/types/workflow'

/** Paediatric lymph node TB — ICMR STW, ICD-10 A18.2. Source p. 17. */
export const PAED_LYMPH_NODE: ConditionWorkflow = {
  id: 'paed-lymph-node',
  site: 'lymph-node',
  title: 'Paediatric lymph node tuberculosis',
  icd10: 'A18.2',
  whenToSuspect: {
    history: [
      'Persistent enlargement of a lymph node for over 2 weeks in one or more of the cervical, axillary or inguinal regions',
      'Over 2 cm in size, or matted nodes, with or without a chronic sinus',
      'With or without systemic symptoms: fever, cough, poor appetite, weight loss',
      'No evidence of recent scalp or skin lesions in the draining area',
      'TB is UNLIKELY if the nodes are few, small (under 2 cm), and have persisted for months to years without systemic symptoms',
    ],
    examination: ['Node size, site, matting, cold abscess, sinus'],
  },
  investigations: {
    essential: [
      'Lymph node aspirate: send for NAAT (with or without MGIT)',
      'Smear for AFB',
      'Cytopathology',
    ],
    desirable: [
      'Lymph node cytopathology if NAAT and smear are negative',
      'Lymph node biopsy — core or excision',
      'Chest X-ray',
      'Haemogram with peripheral smear',
    ],
  },
  diagnostic: {
    entry: 'node',
    nodes: [
      {
        id: 'node',
        text: 'Peripheral lymph node over 2 cm in one or more sites — look for matting, cold abscess or sinus',
        branches: [
          { label: 'Matted node, cold abscess or sinus present', to: 'aspirate' },
          { label: 'None of these', to: 'antibiotics' },
          { label: 'Chest X-ray abnormal', to: 'cxr-route' },
        ],
      },
      {
        id: 'cxr-route',
        text: 'Chest X-ray abnormal — sputum or gastric aspirate for NAAT and AFB',
        branches: [
          { label: 'Any one positive', to: 'treat' },
          { label: 'Negative', to: 'aspirate' },
        ],
      },
      {
        id: 'aspirate',
        text: 'Aspirate pus from the sinus or from a fluctuating node. If no pus, do FNAC. Send for NAAT, AFB smear and cytopathology; send MGIT if indicated.',
        branches: [
          { label: 'AFB on smear, NAAT positive, or caseous granuloma', to: 'treat' },
          { label: 'None of these', to: 'biopsy' },
        ],
      },
      {
        id: 'antibiotics',
        text: 'No matting, abscess or sinus — antibiotics (co-trimoxazole or amoxicillin-clavulanate). AVOID linezolid and quinolones. Review after 2 weeks.',
        branches: [
          { label: 'No response after 2 weeks', to: 'biopsy' },
          { label: 'Responded', to: 'not-tb' },
        ],
      },
      { id: 'not-tb', text: 'Responded to antibiotics', action: 'Not TB. No ATT.', severity: 'info' },
      {
        id: 'biopsy',
        text: 'Excision or core biopsy if the facility is available — send for NAAT, AFB smear and histopathology',
        branches: [
          { label: 'AFB on smear, NAAT positive, or caseous granuloma', to: 'treat' },
          { label: 'None of these', to: 'alternative' },
        ],
      },
      { id: 'treat', text: 'Evidence of TB', action: 'Treat for TB: 2 HRZE + 4 HRE at standard paediatric doses.', severity: 'ok' },
      {
        id: 'alternative',
        text: 'No evidence of TB on tissue',
        action: 'Consider an alternative diagnosis.',
        severity: 'info',
      },
    ],
  },
  management: {
    treatment: [
      'Treatment and follow-up as per NTEP guidelines.',
      '2 HRZE + 4 HRE at standard doses.',
      'DO NOT treat for TB on the basis of a positive Mantoux test alone, or an FNAC suggestive of a reactive lymph node with negative NAAT/AFB on smear.',
    ],
    whenToRefer: [
      'Diagnosis not established with FNAC or NAAT',
      'No surgical facility for excision or core biopsy',
      'Drug resistance suspected for any reason including non-response, and DR-TB testing not available',
      'Any pointer towards possible malignancy — skin or mucosal bleed, significant pallor, or generalised adenopathy irrespective of size, or associated hepatosplenomegaly',
    ],
    followUp: [
      'Disappearance of constitutional symptoms with a decrease or no increase in node size suggests response.',
      'INCREASE in node size WITH disappearance of constitutional symptoms may suggest a paradoxical reaction — provided drug resistance has been ruled out.',
      'INCREASE in node size WITHOUT disappearance of constitutional symptoms suggests drug-resistant TB or an alternate cause.',
      'Children whose constitutional symptoms have gone and whose node size has not increased at the end of 6 months therapy can be kept in follow-up.',
    ],
  },
  tables: [
    {
      title: 'BCG lymphadenitis',
      columns: ['Feature', 'Detail'],
      rows: [
        ['Age', 'Usually under 2 years'],
        ['Site', 'Axillary and/or supraclavicular node on the same side as BCG vaccination, usually left'],
        ['Systemic symptoms', 'Absent in immunocompetent children'],
        ['Treatment — small', 'Wait and watch'],
        ['Treatment — large or suppurative', 'Repeated aspiration; rarely incision and drainage'],
        ['Caution', 'NAAT or AFB smear positivity CANNOT differentiate BCG from M. tuberculosis'],
      ],
      provenance: {
        citations: [{ source: 'icmr-stw', locator: 'Paediatric lymph node TB workflow, BCG lymphadenitis, p. 17' }],
        status: 'source-checked',
      },
    },
  ],
  provenance: {
    citations: [{ source: 'icmr-stw', locator: 'Paediatric lymph node tuberculosis workflow, ICD-10 A18.2, p. 17' }],
    status: 'source-checked',
  },
}

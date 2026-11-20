import type { ConditionWorkflow } from '@/types/workflow'

/** Cutaneous tuberculosis — ICMR STW, ICD-10 A18.4. Source p. 8. */
export const CUTANEOUS_TB: ConditionWorkflow = {
  id: 'cutaneous',
  site: 'other',
  title: 'Cutaneous tuberculosis',
  icd10: 'A18.4',
  whenToSuspect: {
    history: [
      'Ulcer or discharging sinus over a lymph node, bone or joint',
      'Persistent asymptomatic reddish or reddish-brown lesion of over 6 months, which may show scarring',
      'Persistent warty or verrucous lesion of over 6 months',
      'Aetiology: M. tuberculosis, M. bovis, rarely BCG',
    ],
    examination: [
      'Extracutaneous involvement',
      'Lymph node and lung involvement',
      'Other organ systems — bone, gastrointestinal tract, CNS',
    ],
  },
  investigations: {
    essential: [
      'Chest X-ray',
      'FNAC from the indurated part of the lesion',
      'Lymph node examination with FNAC',
    ],
    desirable: [
      'Histopathology — granulomas with epithelioid histiocytes and Langerhans-type giant cells',
      'Culture from a BIOPSY sample, not a swab',
    ],
  },
  diagnostic: {
    entry: 'suspected',
    nodes: [
      {
        id: 'suspected',
        text: 'Suspected cutaneous TB — skin biopsy for histopathology, with or without culture, plus CXR',
        branches: [
          { label: 'Strong clinical suspicion', to: 'start-att' },
          { label: 'Proceed with biopsy result', to: 'histology' },
        ],
      },
      {
        id: 'start-att',
        text: 'Strong clinical suspicion',
        action: 'Start ATT.',
        severity: 'ok',
      },
      {
        id: 'histology',
        text: 'Refer to a dermatologist with expertise in cutaneous TB — interpret the histology',
        branches: [
          { label: 'Histology diagnostic and/or culture positive', to: 'treat' },
          { label: 'Histology equivocal and culture negative', to: 'equivocal' },
          { label: 'Histology negative and culture negative', to: 'do-not-treat' },
        ],
      },
      { id: 'treat', text: 'Histology diagnostic or culture positive', action: 'Treat for cutaneous TB.', severity: 'ok' },
      {
        id: 'equivocal',
        text: 'Equivocal',
        action:
          'Correlate with the Mantoux result and clinical picture. A positive reading above 22 mm supports treatment; below 5 mm argues against it.',
        severity: 'caution',
      },
      {
        id: 'do-not-treat',
        text: 'Histology and culture both negative',
        action: 'Do not treat. Reconsider the diagnosis.',
        severity: 'info',
      },
    ],
  },
  management: {
    treatment: [
      'As in pulmonary TB. Extend duration if needed.',
      'Drug-resistant TB to be kept in mind.',
      'NO role for steroids, oral or topical, in the management of cutaneous TB.',
    ],
    whenToRefer: [
      'No response after 8 weeks',
      'No response suggests an alternate diagnosis or drug-resistant TB — refer to a higher centre',
      'Refer to a dermatologist with expertise in cutaneous TB for histology interpretation',
    ],
    followUp: [
      'First follow-up after 4–6 weeks. The majority improve; look for adverse drug reactions.',
      'If no response after 8 weeks, reconsider.',
    ],
  },
  tables: [
    {
      title: 'Case definition',
      columns: ['Category', 'Criteria'],
      rows: [
        [
          'Confirmed case',
          'M. tuberculosis complex identified by culture or PCR, or histology shows typical morphology; OR a full course of ATT which led to complete clearance of lesions',
        ],
        ['Probable case', 'Typical skin lesion with none of the positive features or investigations above'],
      ],
      provenance: {
        citations: [{ source: 'icmr-stw', locator: 'Cutaneous TB workflow, Case definition, p. 8' }],
        status: 'source-checked',
      },
    },
  ],
  provenance: {
    citations: [{ source: 'icmr-stw', locator: 'Cutaneous tuberculosis workflow, ICD-10 A18.4, p. 8' }],
    status: 'source-checked',
  },
}

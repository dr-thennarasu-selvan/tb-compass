import type { ConditionWorkflow } from '@/types/workflow'

/** Adult peripheral lymphadenopathy — ICMR STW, ICD-10 A18.2. Source p. 2. */
export const LYMPHADENOPATHY: ConditionWorkflow = {
  id: 'lymph-node',
  site: 'lymph-node',
  title: 'Adult peripheral lymphadenopathy',
  icd10: 'A18.2',
  whenToSuspect: {
    history: [
      'Swelling over 1 cm in neck or armpit, or over 2 cm in groin, with or without redness, fluctuation or sinus discharge',
      'May or may not be associated with fever, weight loss, night sweats or cough',
      'History of similar swelling in the past, or past history of tuberculosis',
      'Contact with a patient diagnosed with TB',
    ],
    examination: [
      'Node size, site, tenderness, fluctuation',
      'Matting, sinus formation, overlying skin changes',
    ],
  },
  investigations: {
    essential: [
      'FNAC or lymph node aspirate if peripheral and accessible',
      'Send aspirate for NAAT — Xpert/TrueNat or another ICMR/CTD approved test',
      'Sputum or induced sputum if the nodes are abdominal or mediastinal and inaccessible',
    ],
    desirable: [
      'Lymph node biopsy if NAAT is negative — refer if indicated',
      'LN tissue for NAAT and cultures (MGIT/LJ) or LPA',
      'FNAB for inaccessible nodes, tissue for NAAT and cultures/LPA',
    ],
  },
  diagnostic: {
    entry: 'enlargement',
    nodes: [
      {
        id: 'enlargement',
        text: 'Lymph node enlargement over 1 cm, with or without systemic symptoms',
        branches: [
          { label: 'Peripheral — accessible', to: 'fnac' },
          { label: 'Abdominal or mediastinal — inaccessible', to: 'sputum' },
        ],
      },
      {
        id: 'fnac',
        text: 'FNAC / LN aspirate — send for NAAT',
        branches: [
          { label: 'NAAT positive', to: 'treat' },
          { label: 'NAAT negative', to: 'biopsy' },
        ],
      },
      {
        id: 'sputum',
        text: 'Sputum or induced sputum — send for NAAT',
        branches: [
          { label: 'NAAT positive', to: 'treat' },
          { label: 'NAAT negative', to: 'fnab' },
        ],
      },
      { id: 'treat', text: 'NAAT positive', action: 'Treat as lymph node TB, per NTEP.', severity: 'ok' },
      {
        id: 'biopsy',
        text: 'NAAT negative on aspirate',
        action:
          'Lymph node biopsy — refer if indicated. Send LN tissue for NAAT and for cultures (MGIT/LJ) or LPA.',
        severity: 'caution',
      },
      {
        id: 'fnab',
        text: 'NAAT negative on sputum',
        action: 'Refer for FNAB. Send tissue for NAAT and cultures or LPA.',
        severity: 'caution',
      },
    ],
  },
  management: {
    treatment: [
      'Treatment as per NTEP guidelines.',
      'Six months of standard first-line ATT is recommended for peripheral lymph node TB (INDEX-TB 2016, strong recommendation, low quality evidence).',
      'Assess response to therapy at 3–4 months.',
      'Resolution: decrease in node size with settling of systemic symptoms — continue ATT.',
    ],
    whenToRefer: [
      'Non-responders',
      'Needs treatment for drug resistance — refer to DOTS Plus centre',
      'Large nodal mass or abscess requiring surgical intervention',
    ],
    followUp: [
      'At 3 months, if nodes increase in size or new signs of inflammation appear: check the old culture report, and send new cultures if none available.',
      'If cultures show SUSCEPTIBLE TB, the worsening is likely paradoxical — may need anti-inflammatory agents for inaccessible nodes, or surgical removal for accessible ones.',
      'If cultures show DRUG-RESISTANT TB, refer to a DOTS Plus centre.',
      'Consider therapeutic drug monitoring to confirm adequate drug levels.',
      'If constitutional symptoms persist, rule out an alternate diagnosis.',
      'Paradoxical reaction: increase in node size or new inflammation up to 3 months after starting treatment, or a new node at the same or another site.',
    ],
  },
  complications: {
    items: [
      { name: 'Abscess formation', presentation: 'Fluctuant, tender node' },
      { name: 'Sinus formation', presentation: 'Rupture of an abscess leading to a discharging sinus' },
    ],
    provenance: {
      citations: [{ source: 'icmr-stw', locator: 'Adult peripheral lymphadenopathy workflow, Complications, p. 2' }],
      status: 'source-checked',
    },
  },
  tables: [
    {
      title: 'BCG lymphadenitis — distinguishing features',
      columns: ['Feature', 'Detail'],
      rows: [
        ['Age', 'Usually under 2 years'],
        ['Site', 'Axillary and/or supraclavicular node on the same side as BCG vaccination, usually left'],
        ['Systemic symptoms', 'Absent in immunocompetent children'],
        ['Treatment — small', 'Wait and watch'],
        ['Treatment — large or suppurative', 'Repeated aspiration; rarely incision and drainage'],
        ['Caution', 'NAAT/AFB smear positivity CANNOT differentiate BCG from M. tuberculosis'],
      ],
      provenance: {
        citations: [{ source: 'icmr-stw', locator: 'Adult peripheral lymphadenopathy workflow, BCG lymphadenitis, p. 2' }],
        status: 'source-checked',
      },
    },
  ],
  provenance: {
    citations: [{ source: 'icmr-stw', locator: 'Adult peripheral lymphadenopathy workflow, ICD-10 A18.2, p. 2' }],
    status: 'source-checked',
  },
}

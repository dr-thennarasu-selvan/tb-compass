import type { ConditionWorkflow } from '@/types/workflow'

/** Adult musculoskeletal tuberculosis — ICMR STW, ICD-10 A18.0. Source p. 7. */
export const MUSCULOSKELETAL_TB: ConditionWorkflow = {
  id: 'bone-joint',
  site: 'bone-joint',
  title: 'Adult musculoskeletal tuberculosis',
  icd10: 'A18.0',
  whenToSuspect: {
    history: [
      'SPINE: persistent localised spinal pain over 6 weeks, night pains',
      'SPINE: recent onset deformity in the back',
      'SPINE: recent neurological deficit — better to refer',
      'SPINE: persistent heaviness around the waist, girdle pain',
      'OTHER JOINTS/BONES: persistent localised pain and swelling over 6 weeks',
      'OTHER JOINTS/BONES: mono-articular joint involvement',
      'OTHER JOINTS/BONES: discharging sinus',
      'Fever, cough, weight loss and night pains',
      'History of close contact with TB',
    ],
    examination: [
      'Local tenderness, cold abscess',
      'Fluctuant swelling with or without inflammation',
      'Painful restriction of involved joint movements',
      'Wasting around the area',
    ],
  },
  investigations: {
    essential: [
      'ESR, CRP, LFT, KFT, HIV',
      'X-rays of spine and chest',
      'Send samples for: Gram staining and culture sensitivity, AFB staining, histopathology, NAAT, solid and liquid mycobacterial culture, LPA if feasible',
    ],
    desirable: [
      'MRI if feasible',
      'USG-guided biopsy for psoas or soft tissue abscess',
      'Bone or joint biopsy, open or percutaneous',
    ],
  },
  diagnostic: {
    entry: 'presumptive',
    nodes: [
      {
        id: 'presumptive',
        text: 'Presumptive musculoskeletal TB — bloods and imaging (X-rays spine and chest, MRI if feasible)',
        branches: [
          { label: 'Features suggestive of TB', to: 'biopsy-route' },
          { label: 'No suggestive features', to: 'suspicion' },
        ],
      },
      {
        id: 'biopsy-route',
        text: 'Features suggestive of TB — obtain tissue',
        branches: [
          { label: 'Psoas or soft tissue abscess — USG-guided or bone/joint biopsy available', to: 'samples' },
          { label: 'Biopsy facilities unavailable, or lesion not accessible', to: 'refer-biopsy' },
        ],
      },
      {
        id: 'refer-biopsy',
        text: 'Cannot obtain tissue locally',
        action: 'Refer to a higher centre with advanced diagnostic and therapeutic facilities.',
        severity: 'caution',
      },
      {
        id: 'samples',
        text: 'Samples sent for staining, culture, histopathology, NAAT and LPA',
        branches: [
          { label: 'MTB positive', to: 'start-att' },
          { label: 'MTB negative', to: 'refer-neg' },
        ],
      },
      {
        id: 'start-att',
        text: 'MTB positive',
        action:
          'Start ATT. If NAAT is rifampicin-sensitive, start the 4-drug first-line regimen. If GeneXpert shows rifampicin resistance, refer and send culture for sensitivity to other drugs.',
        severity: 'ok',
      },
      {
        id: 'refer-neg',
        text: 'MTB negative on tissue',
        action: 'Refer to a higher centre.',
        severity: 'caution',
      },
      {
        id: 'suspicion',
        text: 'TB negative on all tests — how strong is the suspicion?',
        branches: [
          { label: 'High suspicion, ESR and CRP raised', to: 'refer-high' },
          { label: 'Low suspicion, CRP normal', to: 'reassure' },
        ],
      },
      { id: 'refer-high', text: 'High index of suspicion', action: 'Refer to a higher centre.', severity: 'warning' },
      { id: 'reassure', text: 'Low index of suspicion, CRP normal', action: 'Reassurance.', severity: 'info' },
    ],
  },
  management: {
    treatment: [
      'Standard 12-month regimen if clinical symptoms improve and CRP is decreasing.',
      'Intensive 4-drug regimen for NOT MORE than 4 months.',
      'Stop ATT after 12 months if all three parameters — clinical, laboratory (ESR, CRP) and radiological — have returned to normal.',
      'In spine disease, the decision to stop ATT is taken by evaluating healed status on contrast MRI.',
      'Mildly elevated ESR and CRP are non-specific and can be ignored.',
    ],
    whenToRefer: [
      'Recent neurological deficit',
      'GeneXpert rifampicin-resistant',
      'Clinical symptoms not improving with rising ESR/CRP — suspected drug resistance',
      'Any aberrance in course, such as appearance of a neural deficit',
      'Refer where advanced diagnostic and therapeutic facilities including surgery are available',
    ],
    followUp: [
      'Monthly with CRP and LFT during the intensive phase.',
      'Every 3 months with CRP and LFT during the continuation phase.',
      'Worsening of symptoms EARLY, under 3 months, suggests a paradoxical reaction.',
      'Worsening of symptoms LATE, beyond 4 months, raises the question of drug resistance.',
    ],
  },
  tables: [
    {
      title: 'Radiological findings suggestive of TB',
      columns: ['Modality', 'Findings'],
      rows: [
        ['X-ray — spine', 'Regional osteopenia; decreased or obliterated disc space; vertebral erosions with or without reduced vertebral height; paravertebral shadow'],
        ['MRI — spine', 'Contiguous vertebral body involvement with relatively preserved disc; pre- and paravertebral septate collection (abscess); epidural encroachment with or without intraosseous abscess'],
        ['Extraspinal', 'Regional osteoporosis with bone destruction on X-ray; inflammation of bone on T1WI and T2WI with or without abscess on MRI'],
      ],
      provenance: {
        citations: [{ source: 'icmr-stw', locator: 'Musculoskeletal TB workflow, "Findings s/o TB", p. 7' }],
        status: 'source-checked',
      },
    },
  ],
  provenance: {
    citations: [{ source: 'icmr-stw', locator: 'Adult musculoskeletal tuberculosis workflow, ICD-10 A18.0, p. 7' }],
    status: 'source-checked',
  },
}

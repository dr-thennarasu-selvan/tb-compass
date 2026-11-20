import type { ConditionWorkflow } from '@/types/workflow'

/** Paediatric osteoarticular TB — ICMR STW, ICD-10 A18.0. Source p. 18. */
export const PAED_OSTEOARTICULAR: ConditionWorkflow = {
  id: 'paed-osteoarticular',
  site: 'bone-joint',
  title: 'Paediatric osteoarticular tuberculosis',
  icd10: 'A18.0',
  whenToSuspect: {
    history: [
      "POTT'S SPINE (commonest, 50% of osteoarticular TB): insidious onset back pain for over 6 weeks, thoracic more than lumbar more than cervical",
      "POTT'S SPINE: localised or referred root pain; CNS complications such as paraparesis (20–50%), cauda equina syndrome, paraspinal muscle wasting, severe pain",
      'DACTYLITIS (short bones): swelling of short tubular bones of hands and feet — proximal phalanx of index, middle and ring fingers commonly affected',
      'DACTYLITIS: in children multiple or consecutive bones are involved, compared to a single bone in adults; may present without pyrexia or signs of inflammation',
      'ARTHRITIS (large joints, hip and knee commonest): insidious onset joint pain and swelling; monoarticular; commonly associated with pulmonary or lymph node TB',
      'TB symptoms: persistent fever, anorexia, weight loss over 5% in the last 3 months',
      'Risk factors: contact history with a TB case, immunocompromised, HIV',
    ],
    examination: ['Local tenderness and deformity', 'Spine deformity, kyphoscoliosis, gibbus, paraplegia, sensory loss, autonomic dysfunction'],
  },
  investigations: {
    essential: [
      'X-ray spine (AP/lateral): may show end plate erosions, joint space narrowing or collapse, decreased vertebral height, paravertebral soft tissue shadow. EARLY STAGE X-RAY MAY BE NORMAL.',
      'MRI spine preferred — 100% sensitive, indicated in all cases. If not feasible, do CT. Shows marrow oedema; destruction of intervertebral disc, adjacent vertebral bodies and opposing end plates; pre/paravertebral or epidural abscess',
      'Arthritis — plain X-ray: Phemister’s triad of peri-articular osteoporosis, peripherally located osseous erosion, gradual joint space narrowing',
      'Dactylitis — plain X-ray of involved parts: diaphyseal expansile lesion; periosteal reaction uncommon; healing by sclerosis, usually gradual',
      'Chest X-ray, ESR, blood sugar, HIV',
      'Sputum or gastric aspirate for NAAT and MGIT/LJ if CXR abnormal',
      'FNAC if peripheral lymph nodes enlarged — cytology, NAAT and MGIT/LJ',
      'USG abdomen for iliopsoas abscess; USG joints for effusion and diagnostic aspiration',
    ],
    desirable: [
      'Image-guided (USG/CT) aspiration of abscess if feasible, for NAAT and MGIT/LJ. NO NEED FOR BIOPSY.',
      'Image-guided aspirate from involved bones (dactylitis) or joint fluid (arthritis) for NAAT and MGIT/LJ',
    ],
  },
  diagnostic: {
    entry: 'suspect',
    nodes: [
      {
        id: 'suspect',
        text: 'Suspect if symptoms of spinal TB or TB arthritis are present, with or without constitutional symptoms, and/or risk factors',
        branches: [{ label: 'Proceed to imaging', to: 'imaging' }],
      },
      {
        id: 'imaging',
        text: 'X-ray and MRI (MRI indicated in all cases; 100% sensitive)',
        branches: [
          { label: 'Radiological findings suggestive of osteoarticular TB, and/or TB at an additional site', to: 'clinically-diagnosed' },
          { label: 'Not suggestive', to: 'reconsider' },
        ],
      },
      {
        id: 'clinically-diagnosed',
        text: 'Clinically diagnosed osteoarticular TB',
        action:
          'Refer to a higher centre for biopsy — percutaneous CT-guided preferred, or open biopsy — for NAAT and culture, to confirm the diagnosis and obtain DST, and to rule out other diseases. The risks and benefits of obtaining a biopsy must be considered. CONFIRM MICROBIOLOGICALLY IN ALL CASES IF POSSIBLE, BEFORE ATT.',
        severity: 'warning',
      },
      {
        id: 'reconsider',
        text: 'Imaging not suggestive',
        action: 'Reconsider the diagnosis and evaluate for other causes.',
        severity: 'info',
      },
    ],
  },
  management: {
    treatment: [
      'Start treatment for microbiologically or laboratory confirmed TB, and for probable TB.',
      'Regimen: 2 HRZE + 10 HRE at standard doses, plus pyridoxine 10 mg/day.',
      'Surgical indications in Pott’s spine: progressive neurological deficit; paraplegia of recent onset or severe paraplegia; persistent pain with spinal instability; severe kyphotic deformity at presentation, or in children under 10 years at high risk of progression of kyphosis with growth after healing.',
    ],
    whenToRefer: [
      'Suspected osteoarticular disease where essential investigations are not available',
      'Diagnosis, microbiological or probable, not established by investigations',
      'Surgery needed — imaging suggests compressive myelopathy or motor deficits',
      'No improvement with appropriate treatment',
      'DR-TB diagnosed or highly suspected',
    ],
    followUp: [
      'Every month during treatment, then every 3 months.',
      'Pott’s spine: X-ray or MRI. Tubercular dactylitis or arthritis: plain X-ray.',
      'Monitor at each visit: symptomatic improvement, weight gain, side effects of medicines.',
      'Microbiology: sputum/GA if CXR abnormal at end of intensive phase. Site samples such as aspiration of pus from lesions including psoas abscess if worsening symptoms or poor response.',
      'Imaging: MRI/CT/X-ray of affected parts at end of treatment, or earlier if worsening.',
    ],
  },
  tables: [
    {
      title: 'Aspirating synovial fluid or a cold abscess — send three ways',
      columns: ['Preparation', 'Purpose'],
      rows: [
        ['Two dry slides', 'Demonstration of AFB, ZN staining'],
        ['Two samples in formalin', 'Histopathological examination'],
        ['Two samples in saline', 'Culture (MGIT/LJ) followed by DST and/or NAAT'],
        ['Aspiration direction', 'Aspirate against gravity'],
        ['Confirmed cases', 'HIV and blood sugar testing, plus parent counselling'],
      ],
      provenance: {
        citations: [{ source: 'icmr-stw', locator: 'Paediatric osteoarticular TB workflow, Other information, p. 18' }],
        status: 'source-checked',
      },
    },
  ],
  provenance: {
    citations: [{ source: 'icmr-stw', locator: 'Paediatric osteoarticular tuberculosis workflow, ICD-10 A18.0, p. 18' }],
    status: 'source-checked',
  },
}

import type { Provenance, Statement } from '@/types/content'

/**
 * TB with diabetes.
 *
 *   dtc   NTEP National Guidance on Differentiated TB Care 2025 — printed pages.
 *   ntep  NTEP DR-TB 2024, Section 3.9.7, p. 43.
 *   hb    WHO operational handbook M4 2025 — printed page = PDF page minus 16.
 *   ats   ATS/CDC/IDSA 2016 — HTML, locators name the table or section.
 *
 * Thresholds are data. The NTEP screening cut-off (RBS ≥110) and the triage
 * glucose criteria (Box 4.3) are the only numbers the engine acts on.
 */

const dtc = (locator: string): Provenance => ({ citations: [{ source: 'ntep-dtc-2025', locator }], status: 'source-checked' })
const hb = (locator: string): Provenance => ({ citations: [{ source: 'who-handbook-m4-2025', locator }], status: 'source-checked' })
const ats = (locator: string): Provenance => ({ citations: [{ source: 'ats-dstb-2016', locator }], status: 'source-checked' })
const cite = (cs: [string, string][], divergence?: string): Provenance => ({
  citations: cs.map(([source, locator]) => ({ source, locator })),
  status: divergence ? 'disputed' : 'source-checked',
  divergence,
})

// ---------------------------------------------------------------------------
// Screening — thresholds as data
// ---------------------------------------------------------------------------

export const SCREEN_RBS_CUTOFF = 110

export const SCREENING: Statement = {
  id: 'dm.screen',
  text: 'Screen every person with TB: random blood sugar at diagnosis',
  detail:
    'If RBS is 110 mg/dL or more, follow with fasting and post-prandial glucose and HbA1c. Reassess an abnormal baseline RBS during the first month of follow-up. WHO’s DR-TB schedule also takes fasting sugar and/or HbA1c at baseline.',
  provenance: cite(
    [
      ['ntep-dtc-2025', 'comprehensive assessment, laboratory investigations — blood sugar screening, p. 32; Table 6.1, monthly follow-up, p. 39'],
      ['who-handbook-m4-2025', 'Annex 2, DR-TB monitoring schedule, p. 166'],
      ['ats-dstb-2016', 'Figure 2, baseline evaluations, footnote 11'],
    ],
    'NTEP screens everyone. ATS screens only those with diabetes risk factors (age >45, BMI >25, family history, or high-risk ethnicity, which includes Asian).',
  ),
}

/** NTEP DTC Box 4.3 — blood glucose among the signs that make a patient triage-positive. */
export const TRIAGE_GLUCOSE = {
  rbsWithSymptoms: 200,
  fbs: 126,
  ppbs: 200,
  hba1c: 6.5,
  statement: {
    id: 'dm.triage',
    text: 'Glucose in the diabetic range is an NTEP triage sign for referral assessment',
    detail:
      'Random ≥200 mg/dL with diabetes symptoms, fasting ≥126, post-prandial ≥200, or HbA1c ≥6.5%. A triage-positive patient gets a comprehensive assessment at the referral facility.',
    provenance: dtc('Box 4.3, DTC evaluation, triaging and management, p. 28'),
  } satisfies Statement,
}

export const UNCONTROLLED: Statement = {
  id: 'dm.uncontrolled',
  text: 'Uncontrolled diabetes is a listed reason for inpatient care',
  detail: 'WHO lists it with severe malnutrition and untreated HIV as a comorbidity that may need hospitalisation until it stabilises.',
  provenance: cite([
    ['ntep-dtc-2025', 'Annexure 2, reasons for severe illness, p. 70'],
    ['who-handbook-m4-2025', 'hospitalisation for serious comorbidities, p. 223'],
  ]),
}

// ---------------------------------------------------------------------------
// Regimen and duration
// ---------------------------------------------------------------------------

export const REGIMEN_DS: Statement[] = [
  {
    id: 'dm.ds.standard',
    text: 'Drug-susceptible TB: the standard daily 6-month regimen',
    detail: 'Duration can be individualised by severity, organs involved and response.',
    provenance: ats('Treatment in special situations — other conditions'),
  },
  {
    id: 'dm.ds.extend',
    text: 'Some experts extend treatment to 9 months in poorly controlled diabetes',
    detail:
      'Based on higher recurrence. Separately, ATS lists diabetes among the factors that favour extending treatment when the patient has either cavitation or a positive 2-month culture (with both, the continuation phase is extended regardless).',
    provenance: cite(
      [['ats-dstb-2016', 'Treatment in special situations — other conditions; duration of therapy (cavitation and 2-month culture)']],
      'This is ATS expert opinion. The NTEP documents on file do not address extending treatment for diabetes.',
    ),
  },
  {
    id: 'dm.ds.4month',
    text: 'The 4-month HPMZ regimen may be considered, with close hepatotoxicity monitoring',
    detail: 'Evidence in diabetes is modest. Consider therapeutic drug monitoring if malabsorption is suspected (from diabetes itself or interactions with hypoglycaemics).',
    provenance: hb('Section 4.4, subgroups — people with diabetes, p. 20'),
  },
]

export const REGIMEN_DR: Statement = {
  id: 'dm.dr',
  text: 'Drug-resistant TB: no regimen changes specific to diabetes',
  detail:
    'The 9-month all-oral and the modified 9-month regimens can be used, though there are no dedicated safety data. Type 2 diabetes is associated with liver disorders, so monitor closely for hepatotoxicity.',
  provenance: hb('9-month regimen, diabetes, p. 110; modified 9-month regimens, pp. 120–121; longer regimens, Section 6.3.4, p. 138'),
}

// ---------------------------------------------------------------------------
// Glycaemic control
// ---------------------------------------------------------------------------

export const CONTROL: Statement[] = [
  {
    id: 'dm.control',
    text: 'Good glycaemic control is essential throughout TB treatment',
    detail: 'It optimises the chance of cure and limits complications. With MDR-TB, bring HbA1c towards normal alongside TB treatment. Problems described in diabetes reduce when diabetes is well controlled.',
    provenance: hb('Section 8.1, p. 35; p. 121; Section 6.3.4, p. 138'),
  },
  {
    id: 'dm.insulin',
    text: 'Insulin may be needed, and has no interactions with TB drugs',
    detail:
      'Blood sugar can be hard to control on MDR-TB treatment. Because insulin is not metabolised, some authors recommend starting it at the beginning of TB treatment to speed sputum conversion and avoid interactions.',
    provenance: cite([
      ['ntep-drtb-2024', 'Section 3.9.7, p. 43'],
      ['who-handbook-m4-2025', 'Section 8.1, p. 35; p. 110'],
    ]),
  },
  {
    id: 'dm.oha',
    text: 'On rifampicin: sulfonylurea levels fall; metformin’s effect may rise',
    detail: 'DPP-4 inhibitors are slightly affected; no effect on GLP-1 agonists is known. The interaction checker has each class.',
    provenance: hb('Section 8.1, p. 35'),
  },
]

// ---------------------------------------------------------------------------
// Toxicity that diabetes makes worse
// ---------------------------------------------------------------------------

export const TOXICITY: { verb: string; drugIds: string[]; s: Statement }[] = [
  {
    verb: 'NEURO',
    drugIds: ['isoniazid', 'linezolid', 'cycloserine'],
    s: {
      id: 'dm.neuro',
      text: 'Peripheral neuropathy: more frequent and more severe',
      detail:
        'From isoniazid, and in DR-TB from linezolid, high-dose isoniazid and cycloserine. Counsel the patient to report symptoms early. On linezolid, keep a low threshold for lowering the dose or stopping it.',
      provenance: cite([
        ['who-handbook-m4-2025', 'Section 8.1, p. 35; p. 121; Section 6.3.4, p. 138'],
        ['ntep-drtb-2024', 'Section 3.9.7, p. 43'],
      ]),
    },
  },
  {
    verb: 'B6',
    drugIds: ['isoniazid'],
    s: {
      id: 'dm.b6',
      text: 'Pyridoxine with isoniazid',
      detail: 'ATS gives 25–50 mg/day to everyone at risk of neuropathy, naming diabetes.',
      provenance: cite(
        [
          ['ats-dstb-2016', 'Table 2, footnote d'],
          ['icmr-stw', 'DS-TB treatment workflow, p. 14 — "Pyridoxine may be given at a dosage of 10 mg per day"'],
        ],
        'ICMR/NTEP gives 10 mg/day as a general dose; ATS gives 25–50 mg/day for people at risk of neuropathy.',
      ),
    },
  },
  {
    verb: 'EYES',
    drugIds: ['ethambutol', 'linezolid'],
    s: {
      id: 'dm.eyes',
      text: 'Eyes: ethambutol optic neuropathy is more common; linezolid can worsen retinopathy or maculopathy',
      detail: 'Evaluate the eyes before and during linezolid.',
      provenance: cite([
        ['who-handbook-m4-2025', 'Section 8.1, p. 35; Section 6.3.4, p. 138'],
        ['ntep-drtb-2024', 'Section 3.9.7, p. 43'],
      ]),
    },
  },
  {
    verb: 'KIDNEY',
    drugIds: ['amikacin', 'streptomycin'],
    s: {
      id: 'dm.kidney',
      text: 'Kidneys: diabetes is a risk factor for renal disease — use amikacin or streptomycin with caution',
      provenance: cite([
        ['who-handbook-m4-2025', 'p. 121; Section 6.3.4, p. 138'],
        ['ntep-drtb-2024', 'Section 3.9.7, p. 43'],
      ]),
    },
  },
  {
    verb: 'LACTATE',
    drugIds: ['linezolid'],
    s: {
      id: 'dm.lactic',
      text: 'High-dose metformin with linezolid may increase the risk of lactic acidosis',
      provenance: cite([
        ['ntep-drtb-2024', 'Section 3.9.7, p. 43'],
        ['who-handbook-m4-2025', 'Section 6.3.4, p. 138'],
      ]),
    },
  },
  {
    verb: 'ECG',
    drugIds: ['bedaquiline', 'moxifloxacin', 'clofazimine', 'pretomanid', 'delamanid'],
    s: {
      id: 'dm.qt',
      text: 'Diabetes is a risk factor for QT prolongation — closer ECG monitoring',
      provenance: hb('QT monitoring, p. 99'),
    },
  },
]

export const ABSORPTION: Statement = {
  id: 'dm.tdm',
  text: 'Poor response despite adherence: think of malabsorption and drug levels',
  detail:
    'Malabsorption and interactions are more likely in diabetes (gastroparesis is one cause). Therapeutic drug monitoring, where available, can help. Diabetes is also listed among comorbidities that interfere with treatment response.',
  provenance: cite([
    ['who-handbook-m4-2025', 'Section 3.5, treatment monitoring, p. 15; reasons for poor response to treatment, p. 42'],
    ['ats-dstb-2016', 'Table 9, conditions in which therapeutic drug monitoring may be helpful'],
  ]),
}

import type { Provenance, Severity, Statement } from '@/types/content'

/**
 * Immune reconstitution inflammatory syndrome (IRIS) and paradoxical reactions.
 *
 * PROVENANCE NOTE. This content is transcribed from clinician-authored teaching
 * notes supplied by the app author. That is a different kind of source from the
 * guideline PDFs: it is expert-authored rather than published consensus.
 *
 * Where the notes cite an upstream trial or consensus definition, the locator
 * names it — but only the notes have actually been read. A citation reading
 * "Section 5 (notes cite INSHI 2008)" means: transcribed faithfully from the
 * notes, upstream reference NOT independently verified. Do not upgrade any of
 * these to `verified` without reading the primary paper.
 */

const notes = (locator: string, divergence?: string): Provenance => ({
  citations: [{ source: 'author-notes', locator }],
  status: 'source-checked',
  divergence,
})

// ---------------------------------------------------------------------------
// INSHI case definition — paradoxical TB-IRIS
// ---------------------------------------------------------------------------

export interface InshiCriterion {
  id: string
  label: string
  detail?: string
}

/** All three must hold before the clinical criteria are even considered. */
export const INSHI_ANTECEDENTS: InshiCriterion[] = [
  { id: 'tb-before-art', label: 'TB diagnosed BEFORE ART was started' },
  {
    id: 'improved-before-art',
    label: 'Initial improvement or stabilisation on anti-TB treatment before ART',
    detail: 'Absence of any initial improvement points towards treatment failure rather than IRIS.',
  },
  { id: 'art-started', label: 'ART started, restarted, or the regimen changed' },
]

export const INSHI_MAJOR: InshiCriterion[] = [
  { id: 'nodes', label: 'New or enlarging lymph nodes, cold abscess, or other focal tissue involvement' },
  { id: 'radiology', label: 'New or worsening radiological features' },
  { id: 'cns', label: 'New or worsening CNS TB — meningitis, tuberculoma, focal deficit' },
  { id: 'serositis', label: 'New or worsening serositis — pleural effusion, ascites, pericardial effusion' },
]

export const INSHI_MINOR: InshiCriterion[] = [
  { id: 'constitutional', label: 'New or worsening constitutional symptoms — fever, night sweats, weight loss' },
  { id: 'respiratory', label: 'New or worsening respiratory symptoms — cough, dyspnoea, stridor' },
  { id: 'abdominal', label: 'New or worsening abdominal pain with hepatomegaly, splenomegaly or adenopathy' },
]

export const INSHI_PROVENANCE = notes(
  'Section 5, INSHI case definition (notes cite INSHI 2008)',
)

/** Onset window for the clinical criteria. */
export const IRIS_ONSET_WINDOW_DAYS = 90
export const IRIS_ONSET_PROVENANCE = notes(
  'Section 5B, onset within 3 months of ART (notes cite INSHI 2008)',
)

// ---------------------------------------------------------------------------
// Mandatory exclusions — IRIS is a diagnosis of exclusion
// ---------------------------------------------------------------------------

export interface IrisAlternative extends Statement {
  /** How to tell it apart. Short — this is read at the bedside. */
  discriminator: string
  tests: string[]
  /** True where mislabelling as IRIS is actively dangerous. */
  critical?: boolean
}

export const IRIS_ALTERNATIVES: IrisAlternative[] = [
  {
    id: 'iris.alt.mdr',
    text: 'Drug-resistant TB — true treatment failure',
    critical: true,
    discriminator:
      'Culture remains positive; CBNAAT shows rifampicin resistance; no initial improvement before ART.',
    tests: ['Repeat CBNAAT/Truenat', 'LPA', 'Culture + DST'],
    detail:
      'Never label IRIS without excluding drug resistance. Treating resistance as inflammation, with steroids and an unchanged regimen, allows the resistant organism to progress.',
    provenance: notes('Section 8, differential diagnosis'),
  },
  {
    id: 'iris.alt.adherence',
    text: 'Non-adherence',
    discriminator: 'Pill count, urine rifampicin test, adherence record.',
    tests: ['Pill count', 'Urine rifampicin', 'Ni-kshay / 99DOTS record'],
    provenance: notes('Section 8, differential diagnosis'),
  },
  {
    id: 'iris.alt.second-oi',
    text: 'A second opportunistic infection',
    critical: true,
    discriminator: 'PCP, cryptococcus, bacterial pneumonia.',
    tests: ['Serum CrAg', 'Urine TB-LAM', 'BAL'],
    detail:
      'Also a steroid contraindication until excluded — steroids into an undiagnosed cryptococcal infection are harmful.',
    provenance: notes('Section 8, differential diagnosis'),
  },
  {
    id: 'iris.alt.drug-reaction',
    text: 'Drug reaction',
    discriminator:
      'Rifampicin hypersensitivity, co-trimoxazole rash, eosinophilia, temporal link to a dose.',
    tests: ['Eosinophil count', 'Drug-timing history'],
    provenance: notes('Section 8, differential diagnosis'),
  },
  {
    id: 'iris.alt.malignancy',
    text: 'Malignancy',
    critical: true,
    discriminator: 'Lymphoma, Kaposi sarcoma.',
    tests: ['Biopsy if a node persists beyond 6 weeks'],
    detail:
      'Kaposi sarcoma matters twice over: it is a mimic, AND steroids worsen KS-IRIS and may be fatal.',
    provenance: notes('Sections 8 and 10d'),
  },
  {
    id: 'iris.alt.malabsorption',
    text: 'Drug malabsorption',
    discriminator: 'Low serum rifampicin levels in HIV enteropathy.',
    tests: ['Serum rifampicin level'],
    provenance: notes('Section 8, differential diagnosis'),
  },
]

// ---------------------------------------------------------------------------
// Supporting investigations — the diagnostic signature
// ---------------------------------------------------------------------------

export const IRIS_SIGNATURE: Statement = {
  id: 'iris.signature',
  text: 'Clinical deterioration WITH falling viral load and rising CD4',
  detail:
    'This is the diagnostic signature. The patient worsens because the immune system is recovering. A falling viral load argues against ART failure; a rising CD4 confirms reconstitution actually occurred.',
  provenance: notes('Sections 3 and 14'),
}

export const IRIS_INVESTIGATIONS: { test: string; expected: string; why: string }[] = [
  { test: 'CD4 count', expected: 'Rising from baseline', why: 'Confirms immune reconstitution occurred' },
  { test: 'HIV viral load', expected: 'Falling by 1–2 log or more', why: 'Confirms ART is working — argues against failure' },
  { test: 'Sputum CBNAAT / Truenat', expected: 'Negative, or MTB rifampicin-SENSITIVE with falling burden', why: 'Rifampicin resistance detected means this is NOT IRIS' },
  { test: 'Culture + LPA/DST', expected: 'Sterile or converting', why: 'Persistent culture positivity at 2 months indicates failure' },
  { test: 'CXR / CECT chest', expected: 'Enlarging nodes with central necrosis and rim enhancement', why: 'Necrotic nodes are the imaging hallmark' },
  { test: 'Lymph node FNAC / biopsy', expected: 'Necrotising granuloma; AFB may be seen but culture sterile', why: 'Dead bacilli with brisk inflammation is the tissue signature' },
  { test: 'CSF if CNS involvement', expected: 'Raised cells and protein, culture negative', why: 'Excludes a new pathogen' },
]

export const IRIS_INVESTIGATIONS_PROVENANCE = notes('Section 9, investigations')

// ---------------------------------------------------------------------------
// Management
// ---------------------------------------------------------------------------

export type IrisSeverity = 'mild' | 'moderate-severe' | 'life-threatening' | 'refractory'

export interface IrisTreatment {
  severity: IrisSeverity
  label: string
  definition: string
  treatment: string
  uiSeverity: Severity
  provenance: Provenance
}

export const IRIS_LADDER: IrisTreatment[] = [
  {
    severity: 'mild',
    label: 'Mild',
    definition: 'Symptoms only, no organ threat.',
    treatment: 'Reassurance and NSAIDs (ibuprofen). Continue ART and anti-TB treatment unchanged.',
    uiSeverity: 'ok',
    provenance: notes('Section 10b, severity ladder'),
  },
  {
    severity: 'moderate-severe',
    label: 'Moderate to severe',
    definition: 'Hospitalisation needed, organ dysfunction, or mass effect.',
    treatment:
      'Prednisolone 1.5 mg/kg/day for 2 weeks, then 0.75 mg/kg/day for 2 weeks, then taper.',
    uiSeverity: 'warning',
    provenance: notes('Section 10b (notes cite Meintjes, AIDS 2010, as the source of this schedule)'),
  },
  {
    severity: 'life-threatening',
    label: 'Life-threatening',
    definition: 'Airway obstruction, tamponade, raised intracranial pressure, or ARDS.',
    treatment: 'Steroids PLUS drainage or decompression PLUS ICU support. Do not rely on steroids alone.',
    uiSeverity: 'critical',
    provenance: notes('Section 10b, severity ladder'),
  },
  {
    severity: 'refractory',
    label: 'Steroid-refractory',
    definition: 'No response at 2–4 weeks. Around half relapse on tapering.',
    treatment:
      'Extend the taper over 8–12 weeks. Beyond that: anti-TNF-alpha (infliximab, adalimumab), thalidomide, montelukast, hydroxychloroquine — case-series evidence only.',
    uiSeverity: 'caution',
    provenance: notes('Section 10b, prolonged/relapsing and steroid-refractory rows'),
  },
]

/** Rules that hold regardless of severity. Violating these causes harm. */
export const IRIS_HARD_RULES: Statement[] = [
  {
    id: 'iris.rule.art',
    text: 'CONTINUE ART — do not stop it',
    detail:
      'Stopping ART causes viral rebound, resistance, and worse deterioration. The only exception is life-threatening CNS IRIS with refractory raised intracranial pressure.',
    provenance: notes('Section 10a, core principles'),
  },
  {
    id: 'iris.rule.att',
    text: 'CONTINUE the same anti-TB regimen — do not change or add drugs',
    detail: 'IRIS is not treatment failure. Changing the regimen treats a problem the patient does not have.',
    provenance: notes('Section 10a, core principles'),
  },
  {
    id: 'iris.rule.target',
    text: 'Treat the inflammation, not the organism',
    provenance: notes('Section 10a, core principles'),
  },
]

export const STEROID_CONTRAINDICATIONS: Statement[] = [
  {
    id: 'iris.steroid.ks',
    text: 'Kaposi sarcoma IRIS',
    detail: 'Steroids worsen KS and may be fatal.',
    provenance: notes('Section 10d, steroid cautions'),
  },
  {
    id: 'iris.steroid.oi',
    text: 'Undiagnosed cryptococcal or other opportunistic infection',
    detail: 'Exclude it first.',
    provenance: notes('Section 10d, steroid cautions'),
  },
  {
    id: 'iris.steroid.dr',
    text: 'Confirmed drug-resistant TB',
    detail: 'Treat the resistance, not the inflammation.',
    provenance: notes('Section 10d, steroid cautions'),
  },
  {
    id: 'iris.steroid.other',
    text: 'Uncontrolled diabetes, active CMV, strongyloides hyperinfection risk',
    provenance: notes('Section 10d, steroid cautions'),
  },
]

export const RIFAMPICIN_STEROID_INTERACTION: Statement = {
  id: 'iris.rif.steroid',
  text: 'Rifampicin induces CYP3A4 and halves the prednisolone AUC',
  detail:
    'The doses above look high but are effectively normal doses in a patient on rifampicin. Do not reduce them on the assumption that they are excessive.',
  provenance: notes('Section 10b, footnote'),
}

// ---------------------------------------------------------------------------
// ART timing — prevention, and the most consequential decision
// ---------------------------------------------------------------------------

export interface ArtTimingRule {
  id: string
  condition: string
  rule: string
  rationale: string
  uiSeverity: Severity
  provenance: Provenance
}

export const ART_TIMING: ArtTimingRule[] = [
  {
    id: 'art.tb',
    condition: 'TB, non-CNS',
    rule: 'Start ART within 2 weeks of anti-TB treatment, irrespective of CD4',
    rationale:
      'Early ART reduces mortality even though it produces more IRIS. Treat the IRIS; do not delay the ART.',
    uiSeverity: 'ok',
    provenance: notes('Section 11.2 (notes cite CAMELIA, STRIDE, SAPiT)'),
  },
  {
    id: 'art.tbm',
    condition: 'TB meningitis',
    rule: 'DEFER ART by 4–8 weeks',
    rationale:
      'Immediate ART gave no survival benefit and more grade 4 adverse events. CNS IRIS carries the highest mortality of any subtype.',
    uiSeverity: 'critical',
    provenance: notes('Section 11.2 (notes cite Torok, Clin Infect Dis 2011)'),
  },
  {
    id: 'art.crypto',
    condition: 'Cryptococcal meningitis',
    rule: 'DEFER ART by 4–6 weeks',
    rationale: 'Early ART increases mortality — 45% versus 30% in the cited trial.',
    uiSeverity: 'critical',
    provenance: notes('Section 11.2 (notes cite COAT, NEJM 2014)'),
  },
]

export const IRIS_PROPHYLAXIS: Statement = {
  id: 'iris.prophylaxis',
  text: 'Prophylactic prednisone for CD4 ≤100 starting ART within 30 days of anti-TB treatment',
  detail:
    'Prednisone 40 mg/day for 14 days, then 20 mg/day for 14 days, begun WITH ART. Reduced paradoxical TB-IRIS from 46.7% to 32.5%, with no excess severe infection or malignancy.',
  provenance: notes('Section 11.3 (notes cite PredART, NEJM 2018)'),
}

export const IRIS_COUNSELLING: Statement = {
  id: 'iris.counsel',
  text: 'Warn the patient in advance that transient worsening is expected',
  detail:
    'Unwarned patients interpret deterioration as treatment failure and self-interrupt ART or anti-TB treatment, which causes resistance and long-term failure. This is prevention, not reassurance.',
  provenance: notes('Sections 7 and 11.4'),
}

// ---------------------------------------------------------------------------
// Risk stratification
// ---------------------------------------------------------------------------

export interface RiskFactor {
  id: string
  label: string
  /** Weight for the risk summary — 2 marks the strongest predictors. */
  weight: 1 | 2
}

export const IRIS_RISK_FACTORS: RiskFactor[] = [
  { id: 'cd4-50', label: 'CD4 below 50/µL', weight: 2 },
  { id: 'vl-high', label: 'Viral load above 100 000 copies/mL', weight: 1 },
  { id: 'disseminated', label: 'Disseminated or extrapulmonary TB — miliary, nodal, CNS', weight: 2 },
  { id: 'short-interval', label: 'Under 4 weeks between starting anti-TB treatment and ART', weight: 2 },
  { id: 'low-albumin', label: 'Low haemoglobin, BMI or albumin — markers of advanced disease', weight: 1 },
]

export const IRIS_RISK_PROVENANCE = notes('Section 4, risk factors')

/** Non-HIV triggers. IRIS is not exclusive to HIV. */
export const NON_HIV_TRIGGERS: Statement = {
  id: 'iris.non-hiv',
  text: 'Paradoxical reaction occurs in HIV-negative TB too — roughly 10–25%, highest in nodal and pleural disease',
  detail:
    'Other triggers: neutrophil recovery after chemotherapy, withdrawal of anti-TNF-alpha agents, post-partum immune rebound, and tapering of post-transplant immunosuppression.',
  provenance: notes('Sections 1 and 2'),
}

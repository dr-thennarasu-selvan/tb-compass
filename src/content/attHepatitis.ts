import type { Provenance, Statement } from '@/types/content'

/**
 * ATT-related hepatitis, from the ICMR Standard Treatment Workflow.
 *
 * This is the DRUG-SUSCEPTIBLE TB protocol for India, and it is a different
 * document from the NTEP DR-TB annexure the DR-TB thresholds come from. The two
 * do not agree on everything — NTEP's DR-TB flowchart treats "symptomatic" as
 * an independent trigger, while this workflow pairs symptoms with a 3x rise.
 * Both are cited where they apply; neither is edited to match the other.
 */

const stw = (locator: string): Provenance => ({
  citations: [{ source: 'icmr-stw', locator }],
  status: 'source-checked',
})

// ---------------------------------------------------------------------------
// Diagnosis
// ---------------------------------------------------------------------------

export const ATT_HEPATITIS_DEFINITION: Statement[] = [
  {
    id: 'stw.dx.symptomatic',
    text: 'With clinical symptoms: AST/ALT at or above 3× baseline or ULN',
    detail:
      'Symptoms are abdominal pain, vomiting, unexplained fatigue, yellowing of sclera, or altered sensorium.',
    provenance: stw('ATT-related hepatitis workflow, "Diagnosis of ATT hepatitis"'),
  },
  {
    id: 'stw.dx.jaundice',
    text: 'Jaundice with bilirubin at or above 2× ULN',
    provenance: stw('ATT-related hepatitis workflow, "Diagnosis of ATT hepatitis"'),
  },
  {
    id: 'stw.dx.asymptomatic',
    text: 'Without clinical symptoms: AST/ALT at or above 5× baseline or ULN',
    provenance: stw('ATT-related hepatitis workflow, "Diagnosis of ATT hepatitis"'),
  },
]

export const ATT_HEPATITIS_RISK_FACTORS: string[] = [
  'History of underlying liver disease (jaundice, ascites, GI bleeding)',
  'Physical findings of liver disease (splenomegaly, ascites, icterus, oedema)',
  'Alcoholism',
  'Hypoalbuminaemia and malnutrition',
  'Elevated aminotransferases at baseline',
  'HIV',
  'Intravenous drug use',
  'Elderly age',
]

export const ATT_HEPATITIS_RISK_PROVENANCE = stw('Workflow, "Risk factors for ATT Hepatitis"')

export const VIRAL_EXCLUSION_PANEL = [
  'HBsAg',
  'Anti-HCV',
  'IgM anti-HAV',
  'IgM anti-HEV',
  'PT/INR',
  'Ultrasound liver',
]

export const VIRAL_EXCLUSION_PROVENANCE = stw('Workflow, "Exclude viral hepatitis"')

// ---------------------------------------------------------------------------
// Does this patient need treatment continued through the hepatitis?
// ---------------------------------------------------------------------------

/**
 * The question the earlier version of this app could only pose. The workflow
 * answers it with two explicit lists.
 */
export const URGENT_ATT_INDICATIONS: string[] = [
  'Sputum-positive pulmonary TB',
  'TB meningitis or CNS TB',
  'Pericardial TB',
  'Any life-threatening form, e.g. intestinal TB with intestinal obstruction',
  'Ocular TB',
  'Joint or spinal TB',
]

export const NON_URGENT_ATT: string[] = [
  'Sputum-negative pulmonary TB',
  'TB lymphadenitis',
  'Tubercular pleural effusion',
  'Tubercular ascites',
  'Intestinal TB',
  'Genitourinary TB',
  'Bone TB',
]

export const URGENCY_PROVENANCE = stw(
  'Workflow, "Urgent ATT: life or organ threatening" and "No need for Urgent ATT"',
)

export const NON_HEPATOTOXIC_BRIDGE: Statement = {
  id: 'stw.bridge',
  text: 'Fluoroquinolone + ethambutol + aminoglycoside',
  detail:
    'The non-hepatotoxic combination to use when ATT cannot wait. Where ATT can wait, repeat the LFT after a week and reintroduce instead.',
  provenance: stw('Workflow, "Stop all hepatotoxic drugs — Need urgent ATT"'),
}

export const REFER_IMMEDIATELY: Statement = {
  id: 'stw.refer',
  text: 'Jaundice with coagulopathy or encephalopathy — refer to a higher centre immediately',
  provenance: stw('Workflow, "Jaundice and coagulopathy/encephalopathy"'),
}

// ---------------------------------------------------------------------------
// Reintroduction — two named schedules
// ---------------------------------------------------------------------------

export interface ReintroStep {
  drug: string
  dose: string
  timing: string
}

export const SEQUENTIAL_REINTRODUCTION: ReintroStep[] = [
  { drug: 'Rifampicin', dose: '10 mg/kg', timing: 'first' },
  { drug: 'Isoniazid', dose: '5 mg/kg', timing: 'after 1 week, if LFT normal' },
  { drug: 'Pyrazinamide', dose: '25 mg/kg', timing: 'after a further week, if LFT normal' },
]

export const INCREMENTAL_REINTRODUCTION: ReintroStep[] = [
  { drug: 'Rifampicin', dose: '150 mg/day, increase gradually', timing: 'day 1, up-titrate by day 4' },
  { drug: 'Isoniazid', dose: '100 mg/day, increase gradually', timing: 'day 8, up-titrate by day 11' },
  { drug: 'Pyrazinamide', dose: '500 mg/day, increase gradually', timing: 'day 15, up-titrate by day 18' },
]

export const REINTRO_PRECONDITION: Statement = {
  id: 'stw.reintro.precondition',
  text: 'Reintroduce only when ALT and AST are below 2× ULN with normal bilirubin',
  detail: 'One drug at a time — that is what identifies the culprit.',
  provenance: stw('Workflow, "Reintroduction of ATT hepatotoxic drugs"'),
}

export const REINTRO_NOTES: Statement[] = [
  {
    id: 'stw.reintro.severe',
    text: 'If the hepatitis was severe, pyrazinamide reintroduction may be avoided',
    detail: 'Severe meaning liver failure, coagulopathy, or altered sensorium.',
    provenance: stw('Workflow, "Reintroduction of ATT hepatotoxic drugs"'),
  },
  {
    id: 'stw.reintro.duration',
    text: 'Count treatment duration only from when FULL ATT is started',
    detail:
      'The days spent on a bridge or on partial reintroduction do not count towards the regimen. Easy to get wrong, and it shortens treatment if you do.',
    provenance: stw('Workflow, "Duration of ATT: count only when full ATT is started"'),
  },
]

// ---------------------------------------------------------------------------
// Pre-existing liver disease — regimen by Child-Pugh class
// ---------------------------------------------------------------------------

export interface ChildPughRegimen {
  childClass: string
  scoreRange: string
  description: string
  regimen: string
  provenance: Provenance
}

export const ATT_BY_LIVER_DISEASE: ChildPughRegimen[] = [
  {
    childClass: 'Child A',
    scoreRange: '5–6',
    description: 'Stable liver disease',
    regimen:
      '9 months of HRE, OR 2 months of HRE followed by 7 months of HR. Two hepatotoxic drugs are tolerated.',
    provenance: stw('Workflow, "ATT selection for underlying liver disease"'),
  },
  {
    childClass: 'Child B',
    scoreRange: '7–10',
    description: 'Advanced liver disease',
    regimen:
      'One hepatotoxic drug only: 2 months of INH (or RIF) with ethambutol and an aminoglycoside, then 10 months of INH/RIF with ethambutol.',
    provenance: stw('Workflow, "ATT selection for underlying liver disease"'),
  },
  {
    childClass: 'Child C',
    scoreRange: '11–15',
    description: 'Very advanced liver disease',
    regimen:
      'NO hepatotoxic drug. 18–24 months using ethambutol, a fluoroquinolone, cycloserine and an aminoglycoside or capreomycin.',
    provenance: stw('Workflow, "ATT selection for underlying liver disease"'),
  },
  {
    childClass: 'Acute hepatitis',
    scoreRange: '—',
    description: 'Acute hepatitis at presentation',
    regimen:
      'Avoid hepatotoxic drugs. Use non-hepatotoxic ATT if treatment is urgent; otherwise wait for liver function to improve before starting.',
    provenance: stw('Workflow, "ATT selection for underlying liver disease"'),
  },
]

/** Child-Pugh components, so the score can be computed rather than looked up. */
export const CHILD_PUGH_CRITERIA = [
  { name: 'Bilirubin (mg/dL)', one: '<2', two: '2–3', three: '>3' },
  { name: 'Albumin (g/dL)', one: '>3.5', two: '2.8–3.5', three: '<2.8' },
  { name: 'INR', one: '<1.7', two: '1.7–2.2', three: '>2.2' },
  { name: 'Ascites', one: 'Absent', two: 'Slight', three: 'Moderate' },
  { name: 'Encephalopathy', one: 'Absent', two: 'Grade 1–2', three: 'Grade 3–4' },
]

export const CHILD_PUGH_PROVENANCE = stw('Workflow, "Child Pugh (CTP) Score"')

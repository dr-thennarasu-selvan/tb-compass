import type { Provenance, Severity, Statement } from '@/types/content'

/**
 * Anti-TB drug hypersensitivity: reintroduction, desensitisation, and the
 * severe cutaneous adverse reactions that forbid both.
 *
 * EVIDENCE CAVEAT, carried from the source and not softened: there is NO
 * randomised trial of ATT desensitisation. WHO and NTEP give a reintroduction
 * schedule but no desensitisation ladder. The step doses below are
 * representative of published case series, not statutory.
 */

const notes = (locator: string): Provenance => ({
  citations: [{ source: 'author-notes-hypersensitivity', locator }],
  status: 'source-checked',
})

// ---------------------------------------------------------------------------
// Three manoeuvres that get confused
// ---------------------------------------------------------------------------

export const MANOEUVRES = [
  {
    name: 'Rechallenge / sequential reintroduction',
    what: 'Drugs restarted one at a time, small dose to full dose over 2–3 days, to IDENTIFY the culprit.',
    basis: 'No immunological basis — it assumes the drug was innocent.',
    when: 'Mild to moderate delayed cutaneous reaction where the culprit is unknown.',
  },
  {
    name: 'Graded challenge',
    what: 'Full dose reached in 2–5 divided steps in one day.',
    basis: 'Tests tolerance; does not induce it.',
    when: 'Low pre-test probability of true allergy.',
  },
  {
    name: 'Desensitisation',
    what: 'Sub-therapeutic dose escalated over 6–12 steps to full dose.',
    basis: 'Genuine — IgE cross-linking below the activation threshold, with receptor internalisation.',
    when: 'Proven or probable TYPE I reaction to a drug that cannot be spared.',
  },
]

export const TOLERANCE_IS_TEMPORARY: Statement = {
  id: 'hs.temporary',
  text: 'Desensitisation tolerance is TEMPORARY and is lost within 1–2 missed doses',
  detail:
    'Roughly 24–48 hours. An interruption means the full protocol must be repeated — and the next dose after a gap is given to a fully sensitised patient.',
  provenance: notes('Section 1, definitions'),
}

// ---------------------------------------------------------------------------
// Classification — mechanism dictates what is permissible
// ---------------------------------------------------------------------------

export interface ReactionType {
  id: string
  type: string
  mechanism: string
  presentations: string[]
  desensitisable: boolean
  bar: 'none' | 'absolute'
  culprit: string
  provenance: Provenance
}

export const REACTION_TYPES: ReactionType[] = [
  {
    id: 'type1',
    type: 'Type I — immediate, IgE-mediated',
    mechanism:
      'Drug-specific IgE cross-links FcεRI on mast cells, releasing preformed mediators. Onset under 1 hour, occasionally to 6 hours.',
    presentations: ['Urticaria, angio-oedema', 'Bronchospasm, rhinoconjunctivitis', 'Anaphylaxis'],
    desensitisable: true,
    bar: 'none',
    culprit: 'Rifampicin most often implicated',
    provenance: notes('Section 3, classification'),
  },
  {
    id: 'type2',
    type: 'Type II — cytotoxic, IgG and complement',
    mechanism:
      'Drug-dependent antibody binds drug-coated cells; complement lysis and splenic clearance. Classically with intermittent or high-dose rifampicin.',
    presentations: ['Immune thrombocytopenia', 'Haemolytic anaemia', 'Agranulocytosis'],
    desensitisable: false,
    bar: 'absolute',
    culprit: 'Rifampicin, essentially alone',
    provenance: notes('Section 3, classification'),
  },
  {
    id: 'type3',
    type: 'Type III — immune complex',
    mechanism: 'Antigen–antibody deposition with complement activation.',
    presentations: [
      'Rifampicin flu-like syndrome — fever, myalgia, rigors on intermittent dosing',
      'Acute interstitial nephritis and AKI',
      'Cutaneous vasculitis, serum-sickness-like illness',
    ],
    desensitisable: false,
    bar: 'absolute',
    culprit: 'Rifampicin, essentially alone',
    provenance: notes('Section 3, classification'),
  },
  {
    id: 'type4',
    type: 'Type IV — delayed, T-cell mediated (the commonest group)',
    mechanism: 'Onset days to weeks. Subtypes IVa to IVd by effector cell.',
    presentations: [
      'IVa — eczematous, granulomatous eruption',
      'IVb — maculopapular exanthem, DRESS',
      'IVc — fixed drug eruption, SJS/TEN',
      'IVd — AGEP',
    ],
    desensitisable: false,
    bar: 'none',
    culprit: 'Pyrazinamide commonest for simple cutaneous reactions',
    provenance: notes('Section 3, classification'),
  },
]

export const ONLY_TYPE_I: Statement = {
  id: 'hs.only-type-1',
  text: 'Only type I is truly desensitisable',
  detail:
    'Types II and III, and severe type IV (the SCARs), are absolute contraindications. "Desensitisation" for delayed reactions is a misnomer — it is slow graded reintroduction, the mechanism is unproven, and breakthrough is common.',
  provenance: notes('Sections 1 and 3'),
}

// ---------------------------------------------------------------------------
// Culprit ranking — depends entirely on which reaction you are counting
// ---------------------------------------------------------------------------

export const CULPRIT_RANKING = [
  {
    reaction: 'Delayed cutaneous — by far the commonest presentation',
    leader: 'Pyrazinamide',
    order: 'Z > R > H > E',
    why: 'This is the reaction the reintroduction schedules were written for.',
  },
  {
    reaction: 'Immediate, IgE-mediated — rare',
    leader: 'Rifampicin',
    order: 'R dominant, H second',
    why: 'Rare in absolute numbers, but this is the group needing desensitisation rather than rechallenge.',
  },
  {
    reaction: 'Type II cytotoxic',
    leader: 'Rifampicin',
    order: 'R essentially alone',
    why: 'Absolute bar to re-exposure.',
  },
  {
    reaction: 'Type III immune complex',
    leader: 'Rifampicin',
    order: 'R essentially alone',
    why: 'Classically with intermittent or high-dose rifampicin.',
  },
  {
    reaction: 'Severe cutaneous — DRESS, SJS/TEN',
    leader: 'No single dominant drug',
    order: 'H, R, Z, E all reported',
    why: 'Multi-drug sensitisation is the rule, so ranking has little practical use here.',
  },
]

export const CULPRIT_SUMMARY: Statement = {
  id: 'hs.culprit-summary',
  text: 'Pyrazinamide causes the most rashes; rifampicin causes the most dangerous immunological reactions',
  detail:
    'Rifampicin is over-represented in every non-cutaneous immune category and is only second in the cutaneous one. Reading the type I row alone gives the wrong impression.',
  provenance: notes('Clarification note, section 1'),
}

// ---------------------------------------------------------------------------
// Risk stratification — the decision that governs everything
// ---------------------------------------------------------------------------

export const LOW_RISK_FEATURES = [
  'Limited maculopapular rash',
  'Isolated pruritus without rash',
  'Mild urticaria without systemic features',
  'Normal LFT, renal function and blood counts',
  'No mucosal or organ involvement',
]

export const HIGH_RISK_FEATURES = [
  'Anaphylaxis or laryngeal oedema',
  'SJS or TEN',
  'DRESS',
  'AGEP or vasculitis',
  'Hepatitis, acute kidney injury, or cytopenia',
  'ANY mucosal involvement',
]

export const ABSOLUTE_CONTRAINDICATIONS = [
  'SJS / TEN',
  'DRESS with organ failure',
  'AGEP with systemic involvement',
  'Drug-induced vasculitis',
  'Rifampicin-associated immune thrombocytopenia',
  'Haemolysis',
  'Agranulocytosis',
  'Acute interstitial nephritis',
]

export const RELATIVE_CONTRAINDICATIONS_HS = [
  'Unstable asthma',
  'Beta-blocker or ACE-inhibitor therapy — blunts the adrenaline response and worsens angio-oedema',
  'Pregnancy',
  'Unstable cardiac disease',
  'No high-dependency bed available',
]

export const REEXPOSURE_WARNING: Statement = {
  id: 'hs.reexposure',
  text: 'Re-exposure after a severe cutaneous reaction can be lethal on the first dose',
  detail:
    'Recurrent SJS/TEN has a shorter latency and higher mortality than the index episode. There is no safe test dose.',
  provenance: notes('Section 5, risk stratification'),
}

// ---------------------------------------------------------------------------
// Discriminating features: warning signs that move a patient to high risk
// ---------------------------------------------------------------------------

export const RED_FLAG_SIGNS = [
  { sign: 'Mucosal erosion at two or more sites', means: 'Epidermal necrolysis — SJS/TEN' },
  { sign: 'Skin pain out of proportion to visible lesions', means: 'Earliest warning of TEN' },
  { sign: 'Positive Nikolsky sign', means: 'Epidermal detachment — burns-unit level care' },
  { sign: 'Facial oedema, especially peri-orbital', means: 'DRESS — the fastest bedside discriminator' },
  { sign: 'High fever with a spreading exanthem', means: 'DRESS' },
  { sign: 'Eosinophilia above 700/µL', means: 'DRESS — a scoring criterion' },
  { sign: 'Organ derangement — LFT, renal, counts', means: 'DRESS or systemic hypersensitivity' },
  {
    sign: 'Fixed round dusky plaque recurring at the identical site',
    means: 'Fixed drug eruption — effectively pathognomonic for drug causation, and identifies the culprit without testing',
  },
]

export const RED_FLAG_PROVENANCE = notes('Section 4, clinical features; DRESS vs SJS/TEN discriminating table')

// ---------------------------------------------------------------------------
// Acute management
// ---------------------------------------------------------------------------

export interface AcuteStep {
  step: string
  detail: string
  pitfall: string
}

export const ACUTE_MANAGEMENT: AcuteStep[] = [
  {
    step: 'Stop ALL anti-TB drugs',
    detail:
      'Every drug simultaneously, including the FDC, co-trimoxazole prophylaxis, and ART if temporally plausible.',
    pitfall:
      'Stopping only the "suspected" drug leaves the patient on the true culprit AND on an inadequate regimen, and destroys the sequential logic later.',
  },
  {
    step: 'Treat the reaction',
    detail:
      'Anaphylaxis: adrenaline 0.5 mg (0.5 mL of 1:1000) IM into the anterolateral thigh, repeated every 5–15 minutes, with IV fluids and oxygen. Urticaria: cetirizine 10 mg daily. Extensive exanthem: prednisolone 0.5–1 mg/kg/day with a short taper.',
    pitfall:
      'Giving IV hydrocortisone first in anaphylaxis and delaying adrenaline is the classic fatal error. Steroids have no role in the first minutes.',
  },
  {
    step: 'Grade severity objectively',
    detail:
      'Body surface area involved, full mucosal survey, temperature, LFT, renal function, full blood count with eosinophil count. RegiSCAR score if DRESS is suspected.',
    pitfall:
      'Recording "rash +" without an eosinophil count and LFT misses evolving DRESS, which peaks AFTER the drug is stopped.',
  },
  {
    step: 'Exclude mimics',
    detail:
      'Scabies, viral exanthem, HIV seroconversion, co-trimoxazole or nevirapine rash, IRIS, paradoxical reaction, syphilis.',
    pitfall:
      'Attributing a nevirapine rash to anti-TB drugs permanently and needlessly removes a first-line drug.',
  },
  {
    step: 'Decide on a bridging regimen',
    detail: 'Driven by bacillary burden and site of disease.',
    pitfall:
      'Leaving a smear-positive cavitary patient entirely off treatment for 2–3 weeks risks deterioration and transmission.',
  },
  {
    step: 'Document and report',
    detail: 'Record on the treatment card and in Ni-kshay. Report to the nearest pharmacovigilance centre.',
    pitfall: 'An undocumented reaction gets repeated by the next clinician.',
  },
]

export const ACUTE_PROVENANCE = notes('Section 6, immediate management of the acute reaction')

// ---------------------------------------------------------------------------
// Bridging
// ---------------------------------------------------------------------------

export const BRIDGE_NEEDED_IF = [
  'Smear-positive cavitary disease',
  'Miliary TB',
  'TB meningitis',
  'Pericardial TB',
  'Spinal TB with cord compromise',
  'HIV with low CD4',
  'Sepsis',
]

export const BRIDGE_SAFE_TO_WAIT = [
  'Smear-negative, paucibacillary disease',
  'Clinically stable, low bacillary burden',
  'Small pleural effusion or isolated lymph node',
]

export const BRIDGE_REGIMEN = [
  'Levofloxacin 750–1000 mg daily, or moxifloxacin 400 mg daily',
  'Amikacin 15 mg/kg IM/IV daily — baseline audiometry and renal function',
  'Linezolid 600 mg daily — watch marrow, optic and peripheral neuropathy',
  'Ethambutol 15–20 mg/kg daily, only if ethambutol is not implicated',
]

export const BRIDGE_RULES: Statement[] = [
  {
    id: 'bridge.three',
    text: 'Never bridge with only one or two drugs',
    detail:
      'This is the classic route to acquired fluoroquinolone resistance in a patient who already has few options.',
    provenance: notes('Section 7, bridging regimen'),
  },
  {
    id: 'bridge.not-rechallenge',
    text: 'Do not bridge with a drug you intend to rechallenge later',
    detail: 'You will not be able to interpret the result.',
    provenance: notes('Section 7, bridging regimen'),
  },
]

// ---------------------------------------------------------------------------
// Sequential reintroduction — WHO/NTEP schedule
// ---------------------------------------------------------------------------

export interface ReintroDrug {
  order: number
  drug: string
  day1: string
  day2: string
  day3: string
  why: string
}

export const REINTRODUCTION_SCHEDULE: ReintroDrug[] = [
  {
    order: 1,
    drug: 'Isoniazid',
    day1: '50 mg',
    day2: '300 mg',
    day3: 'Full dose (5 mg/kg)',
    why: 'Least often the cutaneous culprit, so it is tested first and most patients recover their most valuable drugs earliest.',
  },
  {
    order: 2,
    drug: 'Rifampicin',
    day1: '75 mg',
    day2: '300 mg',
    day3: 'Full dose (10 mg/kg)',
    why: 'Sterilising backbone. Losing it converts a 6-month regimen into an 18-month one.',
  },
  {
    order: 3,
    drug: 'Pyrazinamide',
    day1: '250 mg',
    day2: '1 g',
    day3: 'Full dose (25 mg/kg)',
    why: 'Commonest cutaneous culprit, so it is tested late — and it is the easiest to drop, since 9-month HRE remains valid.',
  },
  {
    order: 4,
    drug: 'Ethambutol',
    day1: '100 mg',
    day2: '500 mg',
    day3: 'Full dose (15–20 mg/kg)',
    why: 'Companion drug. Loss is tolerable and replaceable by levofloxacin.',
  },
  {
    order: 5,
    drug: 'Streptomycin',
    day1: '125 mg',
    day2: '500 mg',
    day3: 'Full dose',
    why: 'Rarely used in NTEP first-line now; retained for completeness.',
  },
]

export const REINTRODUCTION_RULES: Statement[] = [
  {
    id: 'reintro.cadence',
    text: 'One new drug every 3 days; already-tolerated drugs continue at full dose',
    detail: 'Observe for 3 days after each full dose before adding the next drug.',
    provenance: notes('Section 9, rules of the procedure'),
  },
  {
    id: 'reintro.culprit',
    text: 'If a reaction recurs, the LAST drug added is the culprit',
    detail: 'Stop it permanently, wait for full resolution, then resume the sequence with the next drug.',
    provenance: notes('Section 9, rules of the procedure'),
  },
  {
    id: 'reintro.order-rationale',
    text: 'The order survives even though the frequency ranking has changed',
    detail:
      'The stated rationale is culprit likelihood. The better rationale is that isoniazid and rifampicin are the two irreplaceable drugs — testing them first means the patient recovers what matters most BEFORE any reaction can halt the sequence.',
    provenance: notes('Clarification note, section 3'),
  },
  {
    id: 'reintro.fdc',
    text: 'Sequential rechallenge is IMPOSSIBLE with fixed-dose combinations',
    detail:
      'Loose single-drug formulations must be arranged from the DR-TB centre or hospital pharmacy before starting. Under NTEP, where the daily FDC is the default supply, this is a real logistic bottleneck.',
    provenance: notes('Section 9, rules of the procedure'),
  },
  {
    id: 'reintro.ats-alternative',
    text: 'For clearly mild reactions, full-dose restart without escalation is an accepted alternative',
    detail:
      'ATS/CDC/ERS/IDSA: one drug every 2–3 days at full dose. Faster, and shown to be safe in low-risk patients. Escalation is retained where the reaction was more than trivial.',
    provenance: notes('Section 9, alternative approach'),
  },
]

// ---------------------------------------------------------------------------
// Desensitisation
// ---------------------------------------------------------------------------

export const DESENSITISATION_LADDER = [
  { step: 1, isoniazid: '0.3', rifampicin: '0.6', pyrazinamide: '25', ethambutol: '5' },
  { step: 2, isoniazid: '0.6', rifampicin: '1.2', pyrazinamide: '50', ethambutol: '10' },
  { step: 3, isoniazid: '1.25', rifampicin: '2.5', pyrazinamide: '100', ethambutol: '25' },
  { step: 4, isoniazid: '2.5', rifampicin: '5', pyrazinamide: '200', ethambutol: '50' },
  { step: 5, isoniazid: '5', rifampicin: '10', pyrazinamide: '400', ethambutol: '100' },
  { step: 6, isoniazid: '10', rifampicin: '25', pyrazinamide: '750', ethambutol: '200' },
  { step: 7, isoniazid: '25', rifampicin: '50', pyrazinamide: 'Full (1500)', ethambutol: '400' },
  { step: 8, isoniazid: '50', rifampicin: '100', pyrazinamide: '—', ethambutol: 'Full (800–1200)' },
  { step: 9, isoniazid: '100', rifampicin: '200', pyrazinamide: '—', ethambutol: '—' },
  { step: 10, isoniazid: 'Full (300)', rifampicin: '300', pyrazinamide: '—', ethambutol: '—' },
  { step: 11, isoniazid: '—', rifampicin: 'Full (balance to 600)', pyrazinamide: '—', ethambutol: '—' },
]

export const LADDER_CAVEAT: Statement = {
  id: 'hs.ladder-caveat',
  text: 'These step doses are representative of published case series, not statutory',
  detail:
    'There is no randomised trial of ATT desensitisation. WHO and NTEP give a reintroduction schedule but NO desensitisation ladder. Institutions differ in step number and interval — confirm against your own allergy protocol before use.',
  provenance: notes('Evidence-base caveat, stated up front in the source'),
}

export const DESENSITISATION_PROCEDURE: AcuteStep[] = [
  {
    step: 'Confirm eligibility',
    detail:
      'Type I phenotype. No severe cutaneous reaction, no cytopenia, no AKI, no hepatitis. Reaction fully resolved. Antihistamines washed out for 3–5 days.',
    pitfall: 'Desensitising a DRESS or SJS patient is the single most dangerous error in this topic.',
  },
  {
    step: 'Obtain written informed consent',
    detail: 'Explain that breakthrough is expected in a minority, and that tolerance is temporary.',
    pitfall: 'Consent taken from an attendant only, in an adult with capacity, is indefensible.',
  },
  {
    step: 'Set up in HDU or ICU',
    detail:
      'Continuous ECG, oxygen saturation and non-invasive blood pressure. Two secure IV cannulae. Airway trolley. Adrenaline 1:1000 drawn up at the bedside. Physician present throughout.',
    pitfall:
      'Doing this on a general TB ward "because the patient looks fine" removes the only justification for the procedure.',
  },
  {
    step: 'Withhold blunting drugs',
    detail: 'Stop beta-blockers and ACE inhibitors where clinically safe.',
    pitfall:
      'Beta-blockade makes anaphylaxis adrenaline-refractory; glucagon 1–5 mg IV must then be available.',
  },
  {
    step: 'Premedication — usually none',
    detail: 'Most protocols give none; some give an H1 antihistamine only.',
    pitfall:
      'Routine corticosteroid premedication MASKS early cutaneous warning signs and allows escalation to a much larger dose before the reaction declares itself.',
  },
  {
    step: 'Escalate doses every 30–60 minutes',
    detail: 'Roughly doubling, over 8–12 steps, culminating in the full daily dose.',
    pitfall: 'Skipping steps to finish before the shift ends is the commonest cause of breakthrough.',
  },
  {
    step: 'Inspect at every step',
    detail:
      'Look for pruritus, flush, a new wheal, cough, a rise in respiratory rate or a fall in blood pressure BEFORE giving the next dose.',
    pitfall: 'Charting vital signs but not inspecting the skin misses the earliest sign.',
  },
  {
    step: 'Manage breakthrough',
    detail:
      'Mild (isolated pruritus or urticaria): antihistamine, hold, then REPEAT the last tolerated dose before advancing. Severe (bronchospasm or hypotension): adrenaline, abandon the protocol.',
    pitfall: 'Pushing through a mild reaction to the next higher dose converts urticaria into anaphylaxis.',
  },
  {
    step: 'Observe 4–6 hours after the final dose',
    detail: 'In the monitored setting.',
    pitfall: 'Late reactions after the last step are why immediate discharge is unsafe.',
  },
  {
    step: 'Maintain tolerance with daily dosing',
    detail: 'Full dose daily without a single gap, ideally under direct observation from the next day.',
    pitfall:
      'Missing one or two doses abolishes tolerance. The next dose is then given to a fully sensitised patient.',
  },
]

export const DESENSITISATION_SEQUENCE: Statement = {
  id: 'hs.one-at-a-time',
  text: 'Desensitise one drug at a time, on consecutive days',
  detail:
    'Continue the already-desensitised drug daily. Simultaneous dual desensitisation makes attribution of a breakthrough impossible.',
  provenance: notes('Section 10, sequencing'),
}

// ---------------------------------------------------------------------------
// DRESS vs SJS/TEN
// ---------------------------------------------------------------------------

export const DRESS_VS_TEN = [
  { feature: 'Latency from first dose', dress: '2–8 weeks', ten: '4–28 days' },
  {
    feature: 'Rash morphology',
    dress: 'Infiltrated exanthem, oedematous, later exfoliative',
    ten: 'Dusky macules, atypical targets, flaccid bullae, sheet detachment',
  },
  { feature: 'Facial oedema', dress: 'Characteristic', ten: 'Absent' },
  { feature: 'Mucosal erosion', dress: 'Absent or trivial', ten: 'Two or more sites, severe, painful' },
  { feature: 'Nikolsky sign', dress: 'Negative', ten: 'Positive' },
  { feature: 'Eosinophil count', dress: 'Above 700/µL or above 10%', ten: 'Normal' },
  { feature: 'Liver involvement', dress: 'In the majority — the commonest organ hit', ten: 'Uncommon, usually secondary to sepsis' },
  { feature: 'Herpesvirus reactivation', dress: 'HHV-6/7, EBV, CMV', ten: 'Not a feature' },
  {
    feature: 'Course after stopping the drug',
    dress: 'Persists or worsens for weeks; relapses',
    ten: 'Progresses about 5 days, then re-epithelialises over 2–3 weeks',
  },
  { feature: 'Mortality', dress: 'About 2–10%', ten: 'SJS 5–10%; TEN 25–35%, up to 50% in some series' },
  {
    feature: 'Late sequelae',
    dress: 'Thyroiditis, type 1 diabetes, lupus, autoimmune hepatitis — months later',
    ten: 'Blindness, symblepharon, urethral and vaginal stricture, nail loss',
  },
]

export const DRESS_VS_TEN_PROVENANCE = notes('DRESS vs SJS/TEN, discriminating table')

export const SCAR_ONE_LINER: Statement = {
  id: 'scar.oneliner',
  text: 'SJS/TEN kills the skin; DRESS kills the organs',
  detail: 'Every difference in management flows from that.',
  provenance: notes('DRESS vs SJS/TEN, section 1'),
}

/** SCORTEN — prognostic, scored in the first 24 hours ONLY. */
export const SCORTEN_CRITERIA = [
  { id: 'age', label: 'Age over 40 years' },
  { id: 'hr', label: 'Heart rate over 120/min' },
  { id: 'malignancy', label: 'Malignancy present' },
  { id: 'bsa', label: 'Detached or detachable BSA over 10% on day 1' },
  { id: 'urea', label: 'Serum urea over 28 mg/dL (10 mmol/L)' },
  { id: 'bicarb', label: 'Serum bicarbonate below 20 mmol/L' },
  { id: 'glucose', label: 'Blood glucose over 252 mg/dL (14 mmol/L)' },
]

export const SCORTEN_MORTALITY: { score: string; mortality: string; action: string; severity: Severity }[] = [
  { score: '0–1', mortality: 'about 3%', action: 'Often manageable in a high-dependency dermatology bed', severity: 'caution' },
  { score: '2', mortality: 'about 12%', action: 'Needs ICU-level monitoring', severity: 'warning' },
  { score: '3', mortality: 'about 35%', action: 'Burns unit or ICU transfer; counsel the family', severity: 'critical' },
  { score: '4', mortality: 'about 58%', action: 'Prognosis discussion mandatory', severity: 'critical' },
  { score: '5 or more', mortality: 'about 90%', action: 'A ceiling-of-care conversation is appropriate', severity: 'critical' },
]

export const SCORTEN_CAVEAT: Statement = {
  id: 'scorten.day1',
  text: 'SCORTEN is calculated on DAY 1 and is validated only for that timepoint',
  detail: 'Recalculating on day 3 overestimates survival.',
  provenance: notes('DRESS vs SJS/TEN, section 6b'),
}

export const TEN_MANAGEMENT_KEY: Statement[] = [
  {
    id: 'ten.fluids',
    text: 'Fluid resuscitation at about two-thirds to three-quarters of a burns volume',
    detail:
      'Titrated to urine output 0.5–1 mL/kg/h. Applying full burns formulae over-resuscitates — TEN loses less fluid than a thermal burn of the same area.',
    provenance: notes('DRESS vs SJS/TEN, section 8c'),
  },
  {
    id: 'ten.silver',
    text: 'NEVER silver sulfadiazine',
    detail: 'It is a sulphonamide and may aggravate the reaction. Leave the blister roof in place as a biological dressing.',
    provenance: notes('DRESS vs SJS/TEN, section 8c'),
  },
  {
    id: 'ten.eyes',
    text: 'Daily ophthalmology review from DAY 1',
    detail:
      'Preservative-free lubricants, lysis of adhesions, early amniotic membrane transplantation in severe ocular involvement. Ocular sequelae are the leading long-term disability; referral on day 7 is too late.',
    provenance: notes('DRESS vs SJS/TEN, section 8c'),
  },
  {
    id: 'ten.abx',
    text: 'No prophylactic antibiotics',
    detail: 'Surveillance cultures instead; treat on clinical or culture evidence. Prophylaxis selects resistant organisms without reducing sepsis.',
    provenance: notes('DRESS vs SJS/TEN, section 8c'),
  },
  {
    id: 'ten.thalidomide',
    text: 'Thalidomide is HARMFUL and must never be used',
    detail: 'A randomised trial showed excess mortality.',
    provenance: notes('DRESS vs SJS/TEN, immunomodulation table'),
  },
  {
    id: 'dress.taper',
    text: 'DRESS needs a SLOW steroid taper over 6–12 weeks',
    detail:
      'Prednisolone 0.5–1 mg/kg/day. A 2-week taper is the classic error — it precipitates a florid rebound flare.',
    provenance: notes('DRESS vs SJS/TEN, section 8b'),
  },
  {
    id: 'dress.newdrugs',
    text: 'Avoid introducing new drugs during a DRESS flare',
    detail:
      'The immune activation of DRESS predisposes to reactions against unrelated drugs. Introducing three new second-line TB drugs mid-flare invites a second severe reaction — introduce them sequentially.',
    provenance: notes('DRESS vs SJS/TEN, section 8b'),
  },
  {
    id: 'dress.followup',
    text: 'Follow up DRESS for at least 12 months',
    detail:
      'Thyroid function, fasting glucose and ANA at 3, 6 and 12 months. Autoimmune thyroiditis and type 1 diabetes appear after apparent recovery.',
    provenance: notes('DRESS vs SJS/TEN, section 8b'),
  },
]

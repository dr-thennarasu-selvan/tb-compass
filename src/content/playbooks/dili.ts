import type { Action, GuidelinePack, Provenance, Statement, Threshold } from '@/types/content'

/**
 * Anti-tuberculosis drug-induced liver injury (TB-DILI).
 *
 * Thresholds live here as data so a reviewer can audit each number against its
 * citation, and so an alternative guideline pack can replace them without
 * touching engine code. The branching logic lives in engine/dili.ts.
 *
 * NOTE TO REVIEWER: every entry below is `needs-review`. The locators are
 * descriptive pointers, not verbatim section numbers — replace each one with
 * the exact locator from the source document as you verify it.
 */

const needsReview = (source: string, locator: string, divergence?: string): Provenance => ({
  citations: [{ source, locator }],
  status: 'needs-review',
  divergence,
})

const verified = (source: string, locator: string): Provenance => ({
  citations: [{ source, locator }],
  status: 'verified',
})

// ---------------------------------------------------------------------------
// Thresholds
// ---------------------------------------------------------------------------

export interface DiliThresholds {
  stopSymptomatic: Threshold
  stopAsymptomatic: Threshold
  /**
   * NTEP only: AST/ALT at or above this WITH bilirubin at or above 2x ULN is
   * an independent trigger to withhold. ATS has no equivalent combined rule.
   */
  stopWithBilirubin?: Threshold
  rechallengeAlt: Threshold
  hysLawAlt: Threshold
  hysLawBilirubin: Threshold
  hysLawAlpCeiling: Threshold
  rRatioHepatocellular: Threshold
  rRatioCholestatic: Threshold
}

/**
 * Hy's Law and the CIOMS R ratio are definitional, not guideline-specific, so
 * they are shared verbatim across packs rather than duplicated with drift.
 */
const SHARED_DEFINITIONS = {
  hysLawAlt: {
    id: 'dili.hys.alt',
    label: "Hy's Law — ALT/AST component",
    value: 3,
    unit: 'xULN',
    provenance: verified('fda-dili-2009', "Definition of Hy\u2019s Law"),
  } satisfies Threshold,
  hysLawBilirubin: {
    id: 'dili.hys.bilirubin',
    label: "Hy's Law — total bilirubin component",
    value: 2,
    unit: 'xULN',
    provenance: verified('fda-dili-2009', "Definition of Hy\u2019s Law"),
  } satisfies Threshold,
  hysLawAlpCeiling: {
    id: 'dili.hys.alp',
    label: "Hy's Law — ALP must be below this (excludes cholestasis)",
    value: 2,
    unit: 'xULN',
    provenance: verified('fda-dili-2009', "Definition of Hy\u2019s Law"),
  } satisfies Threshold,
  rRatioHepatocellular: {
    id: 'dili.r.hepatocellular',
    label: 'R ratio at or above this is hepatocellular',
    value: 5,
    unit: 'ratio',
    provenance: verified('cioms-dili', 'R ratio pattern definition'),
  } satisfies Threshold,
  rRatioCholestatic: {
    id: 'dili.r.cholestatic',
    label: 'R ratio at or below this is cholestatic',
    value: 2,
    unit: 'ratio',
    provenance: verified('cioms-dili', 'R ratio pattern definition'),
  } satisfies Threshold,
}

export const THRESHOLDS_BY_PACK: Record<GuidelinePack, DiliThresholds> = {
  who: {
    ...SHARED_DEFINITIONS,
    stopSymptomatic: {
      id: 'dili.stop.symptomatic',
      label: 'ALT threshold to stop, WITH hepatitis symptoms or jaundice',
      value: 3,
      unit: 'xULN',
      provenance: needsReview(
        'ats-hepatotox-2006',
        'Management of hepatotoxicity — thresholds for drug withdrawal',
        'WHY ATS AND NOT WHO: the WHO consolidated guidelines Module 4 (2025) were searched and contain no drug-induced liver injury management protocol — no stop thresholds, no rechallenge algorithm. They mention reintroducing drugs one at a time only in passing, in the rationale for stocking single-drug formulations. The WHO pack therefore falls back to ATS 2006 for DILI management. If WHO publishes this in the operational handbook, re-source it there.',
      ),
    },
    stopAsymptomatic: {
      id: 'dili.stop.asymptomatic',
      label: 'ALT threshold to stop, WITHOUT symptoms',
      value: 5,
      unit: 'xULN',
      provenance: needsReview(
        'ats-hepatotox-2006',
        'Management of hepatotoxicity — thresholds for drug withdrawal',
      ),
    },
    rechallengeAlt: {
      id: 'dili.rechallenge.alt',
      label: 'ALT must fall below this before sequential reintroduction',
      value: 2,
      unit: 'xULN',
      provenance: needsReview(
        'ats-hepatotox-2006',
        'Reintroduction of antituberculosis medications',
      ),
    },
  },

  ntep: {
    ...SHARED_DEFINITIONS,
    stopSymptomatic: {
      id: 'dili.stop.symptomatic',
      label: 'Symptomatic patient — withhold regardless of transaminase level',
      value: 0,
      unit: 'xULN',
      provenance: {
        citations: [
          { source: 'ntep-drtb-2024', locator: 'Figure, Management of hepatotoxicity during DR-TB treatment, p. 67 (PDF p. 69)' },
        ],
        status: 'source-checked',
        divergence:
          'The flowchart on p.67 lists "Symptomatic patient" as an INDEPENDENT trigger to withhold, alongside the two numeric criteria, with no transaminase level attached. Read literally that means any hepatitis symptom prompts withdrawal whatever the enzymes show — more aggressive than ATS 2006, which uses 3x ULN with symptoms. This entry applies it literally. Confirm your centre reads it the same way.',
      },
    },
    stopWithBilirubin: {
      id: 'dili.stop.bilirubin',
      label: 'AST/ALT threshold when accompanied by bilirubin at or above 2x ULN',
      value: 3,
      unit: 'xULN',
      provenance: {
        citations: [
          { source: 'ntep-drtb-2024', locator: 'Figure, p. 67: "AST or ALT elevation >=3x ULN accompanied by bilirubin >=2 x ULN"' },
        ],
        status: 'source-checked',
      },
    },
    stopAsymptomatic: {
      id: 'dili.stop.asymptomatic',
      label: 'AST/ALT threshold with normal bilirubin, asymptomatic',
      value: 5,
      unit: 'xULN',
      provenance: {
        citations: [
          { source: 'ntep-drtb-2024', locator: 'Figure, p. 67: "AST or ALT elevation >=5x ULN, with normal bilirubin"' },
          { source: 'ntep-drtb-2024', locator: 'Annexure 4 prose, p. 66' },
        ],
        status: 'source-checked',
      },
    },
    rechallengeAlt: {
      id: 'dili.rechallenge.alt',
      label: 'Reintroduce once enzymes are near this multiple of normal',
      value: 2,
      unit: 'xULN',
      provenance: {
        citations: [{ source: 'ntep-drtb-2024', locator: 'Annexure 4, Hepatotoxicity, p. 66 (PDF p. 68)' }],
        status: 'needs-review',
        divergence:
          'NTEP phrases this as introducing ATT "once enzyme levels are near within 2 times of normal", which is softer than a hard cutoff. Treat the 2x figure as a guide, not a gate.',
      },
    },
  },
}

/**
 * Trial-grade hepatotoxicity, as defined in the endTB trial and reported in
 * WHO Module 4 (2025). Useful for describing severity in DR-TB regimens, and
 * distinct from the withdrawal thresholds above — a grade is a label, not an
 * instruction to stop.
 */
export const HEPATOTOXICITY_GRADE_3: Threshold = {
  id: 'dili.grade3',
  label: 'Grade 3 hepatotoxicity — ALT or AST above this, up to 10x ULN',
  value: 5,
  unit: 'xULN',
  provenance: {
    citations: [{ source: 'who-m4-2025', locator: 'endTB trial safety definitions, p. 440' }],
    status: 'source-checked',
  },
}

export const ADSM_REQUIRED: Action = {
  id: 'act.adsm',
  kind: 'monitor',
  urgency: 'routine',
  text: 'Active TB drug-safety monitoring (aDSM) throughout treatment, regardless of symptoms',
  detail:
    'Required for modified 9-month DR-TB regimens. Liver enzyme elevation with or without symptoms occurred frequently in the endTB trial — transient Grade 3 or higher hepatotoxicity in 18% (BLMZ), 16% (BLLfxCZ) and 8.7% (BDLLfxZ). Symptom-triggered testing alone is not sufficient here.',
  provenance: {
    citations: [{ source: 'who-m4-2025', locator: 'Modified 9-month regimens, monitoring, p. 440' }],
    status: 'source-checked',
  },
}

export function thresholdsFor(pack: GuidelinePack): DiliThresholds {
  return THRESHOLDS_BY_PACK[pack]
}

// ---------------------------------------------------------------------------
// Alternative causes — TB-DILI is a diagnosis of exclusion
// ---------------------------------------------------------------------------

export interface AltCause extends Statement {
  /** True investigations to send. Keep out anything that is history or exam. */
  labs: string[]
  /** Bedside history/exam items — asked, not ordered. */
  bedside: string[]
  /**
   * `first` is sent on presentation. `second` is held back until injury fails
   * to resolve after withdrawal, so the initial order line stays short enough
   * to read.
   */
  tier: 'first' | 'second'
}

export const ALTERNATIVE_CAUSES: AltCause[] = [
  {
    id: 'alt.viral',
    text: 'Acute viral hepatitis',
    tier: 'first',
    labs: ['HAV IgM', 'HBsAg', 'anti-HBc IgM', 'HCV Ab', 'HEV IgM'],
    bedside: [],
    detail: 'Hepatitis E is repeatedly mistaken for TB-DILI in high-burden settings.',
    provenance: needsReview('ats-hepatotox-2006', 'Evaluation of the patient with abnormal liver tests'),
  },
  {
    id: 'alt.biliary',
    text: 'Biliary obstruction',
    tier: 'first',
    labs: ['USS abdomen'],
    bedside: [],
    detail: 'Image before attributing a cholestatic picture to drugs.',
    provenance: needsReview('ats-hepatotox-2006', 'Evaluation of the patient with abnormal liver tests'),
  },
  {
    id: 'alt.other-drugs',
    text: 'Another hepatotoxic drug',
    tier: 'first',
    labs: [],
    bedside: ['Drug history incl. herbal remedies'],
    detail:
      'Co-trimoxazole, azoles, paracetamol, nevirapine, antiepileptics, statins, methotrexate. Ask about herbal remedies explicitly — they are not volunteered.',
    provenance: needsReview('ats-hepatotox-2006', 'Concomitant hepatotoxic medications'),
  },
  {
    id: 'alt.alcohol',
    text: 'Alcohol',
    tier: 'first',
    labs: [],
    bedside: ['Alcohol history'],
    detail: 'AST:ALT above 2 points to alcohol rather than TB-DILI.',
    provenance: needsReview('ats-hepatotox-2006', 'Risk factors for hepatotoxicity'),
  },
  {
    id: 'alt.hepatic-tb',
    text: 'Hepatic or disseminated TB',
    tier: 'first',
    labs: [],
    bedside: ['Disproportionate ALP rise?'],
    detail: 'Enzymes may IMPROVE on treatment — the opposite of the DILI trajectory.',
    provenance: needsReview('ats-hepatotox-2006', 'Differential diagnosis'),
  },
  {
    id: 'alt.iris',
    text: 'Paradoxical reaction / IRIS',
    tier: 'first',
    labs: [],
    bedside: ['ART start date', 'Fever, nodes'],
    detail: 'Consider if HIV-positive and recently started on ART.',
    provenance: needsReview('who-drtb-2022', 'Management of patients with HIV'),
  },
  {
    id: 'alt.ischaemic',
    text: 'Ischaemic hepatitis',
    tier: 'first',
    labs: [],
    bedside: ['Hypotension, sepsis, cardiac failure?'],
    detail: 'Very high transaminases that fall rapidly.',
    provenance: needsReview('ats-hepatotox-2006', 'Differential diagnosis'),
  },
  {
    id: 'alt.autoimmune',
    text: 'Autoimmune hepatitis',
    tier: 'second',
    labs: ['ANA', 'ASMA', 'IgG'],
    bedside: [],
    detail: 'Send only if injury does not resolve after withdrawing all hepatotoxic drugs.',
    provenance: needsReview('ats-hepatotox-2006', 'Differential diagnosis'),
  },
]

// ---------------------------------------------------------------------------
// Symptoms and alarm features
// ---------------------------------------------------------------------------

export const HEPATITIS_SYMPTOMS = [
  { id: 'nausea', label: 'Nausea or vomiting' },
  { id: 'anorexia', label: 'Anorexia' },
  { id: 'abdominal-pain', label: 'Right upper quadrant pain or tenderness' },
  { id: 'jaundice', label: 'Jaundice or scleral icterus' },
  { id: 'dark-urine', label: 'Dark urine or pale stools' },
  { id: 'fatigue', label: 'Unexplained fatigue or malaise' },
  { id: 'pruritus', label: 'Pruritus' },
] as const

export const ALARM_FEATURES = [
  { id: 'encephalopathy', label: 'Any degree of hepatic encephalopathy or confusion' },
  { id: 'bleeding', label: 'Bleeding, bruising, or other evidence of coagulopathy' },
  { id: 'ascites', label: 'New ascites' },
  { id: 'hypoglycaemia', label: 'Hypoglycaemia' },
  { id: 'persistent-vomiting', label: 'Persistent vomiting preventing oral intake' },
] as const

export type SymptomId = (typeof HEPATITIS_SYMPTOMS)[number]['id']
export type AlarmId = (typeof ALARM_FEATURES)[number]['id']

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Editable unit protocol.
 *
 * These are the numbers a clinician actually wants stated plainly — how many
 * days, which bridge drugs. Sources give ranges rather than single values, so
 * rather than hedging in prose the app states a default and lets the unit set
 * its own. Set once in Protocol settings; every order line then reads from here.
 */
export interface DiliProtocol {
  /** Days between liver panels while off treatment. */
  recheckIntervalDays: number
  /** Days to observe each drug during sequential reintroduction. */
  rechallengeIntervalDays: number
  /** Drug ids used as the non-hepatotoxic bridge. */
  bridgeDrugs: string[]
  /**
   * How the reintroduction order is decided.
   * - 'rifampicin-first' follows ATS 2006: the drug the regimen can least
   *   afford to lose goes back first.
   * - 'least-hepatotoxic-first' follows NTEP, which orders by hepatic risk.
   * These are different principles and can give different sequences.
   */
  rechallengeOrder: 'rifampicin-first' | 'least-hepatotoxic-first'
  /** Omit pyrazinamide permanently after a severe episode. */
  omitPzaAfterSevere: boolean
  /**
   * ALT (as a multiple of ULN) that counts as recurrence after adding a drug
   * during reintroduction. Return of symptoms counts regardless of this value.
   */
  recurrenceAltThreshold: number
}

/**
 * NTEP withholds and restarts SPECIFIC drugs depending on which DR-TB regimen
 * the patient is on — not a blanket "stop the hepatotoxic ones". Read off the
 * flowchart on p.67.
 */
export interface RegimenSpecificDili {
  regimen: string
  withhold: string
  restartOrder: string
  provenance: Provenance
}

const flowchart = (locator: string): Provenance => ({
  citations: [{ source: 'ntep-drtb-2024', locator }],
  status: 'source-checked',
})

export const NTEP_DILI_BY_REGIMEN: RegimenSpecificDili[] = [
  {
    regimen: 'BPaLM',
    withhold: 'Withhold the entire BPaLM regimen.',
    restartOrder: 'Restart in order: Lzd + Mfx, then Bdq, then Pa.',
    provenance: flowchart('Figure, p. 67, withhold item 1 and restart item 1'),
  },
  {
    regimen: '9–11 month shorter oral MDR/RR-TB',
    withhold: 'Withhold high-dose isoniazid (Hh), pyrazinamide and ethionamide.',
    restartOrder: 'Restart in order: Hh, then Z.',
    provenance: flowchart('Figure, p. 67, withhold item 2 and restart item 2'),
  },
  {
    regimen: '18–20 month longer oral M/XDR-TB',
    withhold: 'Withhold bedaquiline, pyrazinamide, ethionamide and PAS.',
    restartOrder: 'Restart in order: Bdq, then Z, then Eto, then PAS.',
    provenance: flowchart('Figure, p. 67, withhold item 3 and restart item 3'),
  },
]

export const NTEP_DILI_FLOWCHART_NOTES: Statement[] = [
  {
    id: 'ntep.dili.below-threshold',
    text: 'Below threshold: continue ALL drugs and monitor every 2 weeks until resolution',
    detail:
      'AST or ALT below 5x ULN, with normal bilirubin, in an asymptomatic patient. NTEP does not stop anything here — it monitors fortnightly.',
    provenance: flowchart('Figure, p. 67, left-hand branch'),
  },
  {
    id: 'ntep.dili.monitor-weekly',
    text: 'Once drugs are withheld, monitor symptoms, AST, ALT and bilirubin ONCE A WEEK',
    detail: 'Weekly while withheld; every 3 days after each drug is reintroduced.',
    provenance: flowchart('Figure, p. 67, withhold box'),
  },
  {
    id: 'ntep.dili.no-improvement',
    text: 'No improvement: shift to the longer oral M/XDR-TB regimen',
    detail:
      'If any drug must be permanently stopped from BPaLM or the 9-11 month shorter oral regimen, shift to the longer oral regimen. If already on the longer regimen, modify it using the replacement sequence.',
    provenance: flowchart('Figure, p. 67, "No Improvement" and "Deterioration" branches'),
  },
  {
    id: 'ntep.dili.low-dose',
    text: 'Reintroduction may start at a lower dose and increase gradually',
    detail: 'Stated as an option in the figure footnote, with LFT and symptom monitoring throughout.',
    provenance: flowchart('Figure, p. 67, footnote'),
  },
  {
    id: 'ntep.dili.fq',
    text: 'Consider whether the fluoroquinolone is also contributing',
    detail:
      'NTEP names this explicitly in the opening box, despite hepatitis being rare with fluoroquinolones.',
    provenance: flowchart('Figure, p. 67, opening box'),
  },
  {
    id: 'ntep.dili.refer',
    text: 'Refer to the nodal DR-TB centre if symptoms or transaminases do not resolve',
    provenance: flowchart('Figure, p. 67, opening box'),
  },
]

export const PROTOCOL_BY_PACK: Record<GuidelinePack, DiliProtocol> = {
  who: {
    recheckIntervalDays: 3,
    rechallengeIntervalDays: 7,
    bridgeDrugs: ['ethambutol', 'levofloxacin', 'amikacin'],
    rechallengeOrder: 'rifampicin-first',
    omitPzaAfterSevere: true,
    recurrenceAltThreshold: 3,
  },
  ntep: {
    // NTEP DR-TB 2024, Annexure 4: "continue with at least three
    // non-hepatotoxic medications (for example, the injectable agent, FQ and
    // Cs)", and for the very sick "administer ATT, e.g. Amikacin, FQ and Cs".
    recheckIntervalDays: 3,
    // "monitoring liver function by testing enzymes every three days"
    rechallengeIntervalDays: 3,
    bridgeDrugs: ['amikacin', 'levofloxacin', 'cycloserine'],
    // "reintroduce remaining drugs, one at a time, with the least hepatotoxic
    // agents first"
    rechallengeOrder: 'least-hepatotoxic-first',
    // NTEP says "if the most likely agent is not essential, consider not
    // reintroducing it" — a judgement, not an automatic pyrazinamide rule.
    omitPzaAfterSevere: false,
    recurrenceAltThreshold: 3,
  },
}

export const DEFAULT_PROTOCOL: DiliProtocol = PROTOCOL_BY_PACK.who

export function protocolFor(pack: GuidelinePack): DiliProtocol {
  return PROTOCOL_BY_PACK[pack]
}

export const PROTOCOL_PROVENANCE = {
  recheckIntervalDays: needsReview(
    'ats-hepatotox-2006',
    'Monitoring after withdrawal',
    'Reported intervals range from every few days in severe cases to weekly. 3 days is a conservative default — set your unit\u2019s value.',
  ),
  rechallengeIntervalDays: needsReview(
    'ats-hepatotox-2006',
    'Reintroduction of antituberculosis medications',
    'ATS 2006 describes roughly 3 to 7 days between drugs; other sources use longer. Default is the conservative end.',
  ),
  recurrenceAltThreshold: needsReview(
    'ats-hepatotox-2006',
    'Recurrence during reintroduction',
    'Sources define recurrence variously as a return to the original stopping threshold, a set multiple of ULN, or symptom return alone. Set your unit\u2019s definition.',
  ),
  bridgeDrugs: needsReview(
    'ats-hepatotox-2006',
    'Regimens during the period of drug withdrawal',
    'Composition is stated with varying specificity across sources, and changes where fluoroquinolone resistance is present. Confirm against your programme.',
  ),
}

export const DILI_ACTIONS: Record<string, Action> = {
  stopHepatotoxic: {
    id: 'act.stop',
    kind: 'stop',
    urgency: 'immediate',
    text: 'Stop all hepatotoxic anti-TB drugs',
    detail: 'Ethambutol is not hepatotoxic and is not stopped for this reason.',
    provenance: needsReview('ats-hepatotox-2006', 'Management — withdrawal of hepatotoxic agents'),
  },
  bridgeRegimen: {
    id: 'act.bridge',
    kind: 'start',
    urgency: 'same-day',
    text: 'Start non-hepatotoxic bridge',
    detail:
      'Indicated if smear-positive, extensive or disseminated, CNS or pericardial, or deteriorating. Check resistance pattern, renal function and QT before choosing.',
    provenance: needsReview(
      'ats-hepatotox-2006',
      'Management — regimens during the period of drug withdrawal',
      'Bridging regimen composition is stated with varying specificity across sources, and WHO DR-TB guidance changes it substantially where fluoroquinolone resistance is present. Verify the exact combination your programme endorses before relying on this.',
    ),
  },
  excludeOther: {
    id: 'act.exclude',
    kind: 'investigate',
    urgency: 'same-day',
    text: 'Exclude alternative causes',
    detail:
      'TB-DILI is a diagnosis of exclusion. Attributing injury to the regimen when the cause is hepatitis E or co-trimoxazole withholds drugs needlessly.',
    provenance: needsReview('ats-hepatotox-2006', 'Evaluation of the patient with abnormal liver tests'),
  },
  monitorSerial: {
    id: 'act.monitor',
    kind: 'monitor',
    urgency: 'routine',
    text: 'Repeat LFTs',
    detail:
      'Trajectory matters more than any single value. Falling ALT with rising bilirubin and INR is deterioration, not improvement.',
    provenance: needsReview('ats-hepatotox-2006', 'Monitoring during treatment'),
  },
  referUrgent: {
    id: 'act.refer',
    kind: 'refer',
    urgency: 'immediate',
    text: 'Refer now — hepatology or critical care',
    detail: 'Possible acute liver failure. Do not manage in an outpatient TB clinic.',
    provenance: needsReview('ats-hepatotox-2006', 'Severe hepatotoxicity and acute liver failure'),
  },
  counselReport: {
    id: 'act.counsel',
    kind: 'counsel',
    urgency: 'routine',
    text: 'Counsel: stop drugs and return if symptoms recur',
    detail: 'Symptom-triggered presentation catches injury that monthly bloods miss. Repeat at every visit.',
    provenance: needsReview('ats-hepatotox-2006', 'Patient education'),
  },
  stopAllIfWorsening: {
    id: 'act.stop-all',
    kind: 'stop',
    urgency: 'immediate',
    text: 'If hepatitis worsens or fails to resolve on the three-drug bridge, stop all drugs',
    detail: 'NTEP states this explicitly as the next step when the bridge does not hold.',
    provenance: {
      citations: [{ source: 'ntep-drtb-2024', locator: 'Annexure 4, Hepatotoxicity, p. 66 (PDF p. 68)' }],
      status: 'needs-review',
    },
  },
  considerNotReintroducing: {
    id: 'act.no-reintro',
    kind: 'withhold',
    urgency: 'routine',
    text: 'If the most likely culprit is not essential, consider not reintroducing it at all',
    detail: 'Avoids a rechallenge whose only purpose is to confirm what is already suspected.',
    provenance: {
      citations: [{ source: 'ntep-drtb-2024', locator: 'Annexure 4, Hepatotoxicity, p. 66 (PDF p. 68)' }],
      status: 'needs-review',
    },
  },
  avoidInFuture: {
    id: 'act.avoid-future',
    kind: 'counsel',
    urgency: 'routine',
    text: 'Record the causative drug — it must be avoided in all future regimens',
    detail:
      'NTEP: history of previous drug hepatitis should be analysed to determine the causative agent, and those drugs avoided in future regimens.',
    provenance: {
      citations: [{ source: 'ntep-drtb-2024', locator: 'Annexure 4, Hepatotoxicity, Points to note, p. 66' }],
      status: 'needs-review',
    },
  },
  checkBilirubinSplit: {
    id: 'act.bili-split',
    kind: 'investigate',
    urgency: 'same-day',
    text: 'Send direct bilirubin before blaming rifampicin',
    detail:
      'Isolated unconjugated hyperbilirubinaemia with near-normal transaminases early on is a benign rifampicin effect, not a reason to stop.',
    provenance: needsReview('ats-hepatotox-2006', 'Rifampicin hepatotoxicity'),
  },
}

import type { Provenance, Statement } from '@/types/content'
import { drug, type HepatotoxicityRisk } from '@/content/drugs'

/**
 * Sequential reintroduction after TB-DILI has resolved.
 *
 * The principle is not in dispute: reintroduce one drug at a time, with an
 * interval and a liver panel between each, so that if injury recurs you know
 * which drug caused it. The exact order, interval and whether to start at a
 * reduced dose DO vary between sources — that variation is recorded in
 * `divergence` rather than smoothed over.
 */

const needsReview = (locator: string, divergence?: string, source = 'ats-hepatotox-2006'): Provenance => ({
  citations: [{ source, locator }],
  status: 'needs-review',
  divergence,
})

export interface RechallengeStep {
  order: number
  drugId: string
  drugName: string
  /** Days to wait on this drug before checking the panel and adding the next. */
  observeDays: number
  checkBefore: string
  rationale: string
}

export interface RechallengePlan {
  steps: RechallengeStep[]
  omitted: Statement[]
  provenance: Provenance
  /** Stated plainly in the UI — this is where sources disagree most. */
  caveat: string
}

export interface RechallengeOptions {
  /** True if the index episode involved jaundice, Hy's Law, or alarm features. */
  severeEpisode: boolean
  /** Drugs the clinician has already decided to exclude permanently. */
  permanentlyExcluded: string[]
  /** Days to observe each drug before adding the next — from unit protocol. */
  intervalDays: number
  omitPzaAfterSevere: boolean
  order: 'rifampicin-first' | 'least-hepatotoxic-first'
}

const FIRST_LINE = ['rifampicin', 'isoniazid', 'pyrazinamide']

const RISK_RANK: Record<HepatotoxicityRisk, number> = {
  minimal: 0,
  low: 1,
  moderate: 2,
  high: 3,
}

/**
 * The two guidelines order reintroduction on different principles.
 *
 * ATS 2006 goes by how much the regimen needs the drug — rifampicin first.
 * NTEP goes by hepatic risk — least hepatotoxic first.
 *
 * For the first-line trio these currently produce the SAME sequence, because
 * rifampicin is also the least hepatotoxic of the three. That coincidence is
 * worth stating rather than hiding: the sequences would diverge if the drug
 * risk data changed, or for a regimen containing other hepatotoxic agents.
 */
function orderedDrugs(strategy: RechallengeOptions['order']): string[] {
  if (strategy === 'rifampicin-first') return [...FIRST_LINE]
  return [...FIRST_LINE].sort((a, b) => {
    const ra = RISK_RANK[drug(a)?.hepatotoxicity ?? 'moderate']
    const rb = RISK_RANK[drug(b)?.hepatotoxicity ?? 'moderate']
    if (ra !== rb) return ra - rb
    return FIRST_LINE.indexOf(a) - FIRST_LINE.indexOf(b)
  })
}

export function sequencesAgree(): boolean {
  return (
    orderedDrugs('rifampicin-first').join() === orderedDrugs('least-hepatotoxic-first').join()
  )
}

export function buildRechallengePlan(opts: RechallengeOptions): RechallengePlan {
  const omitted: Statement[] = []
  const excluded = new Set(opts.permanentlyExcluded)

  if (opts.severeEpisode && opts.omitPzaAfterSevere && !excluded.has('pyrazinamide')) {
    omitted.push({
      id: 'omit.pza',
      text: 'Consider not reintroducing pyrazinamide at all',
      detail:
        'After a severe episode — jaundice, Hy’s Law criteria met, or any alarm feature — pyrazinamide is commonly omitted permanently rather than rechallenged. It is the most dispensable of the three and carries the least favourable risk-benefit on reintroduction. If it is omitted, the regimen must be lengthened accordingly.',
      provenance: needsReview(
        'Reintroduction — pyrazinamide after severe hepatotoxicity',
        'Sources differ on whether pyrazinamide should never be rechallenged after severe injury or may be attempted last with close monitoring. Record your programme’s position here.',
      ),
    })
  }

  const dropPza = opts.severeEpisode && opts.omitPzaAfterSevere
  const order = orderedDrugs(opts.order).filter(
    (id) => !excluded.has(id) && !(dropPza && id === 'pyrazinamide'),
  )
  const steps: RechallengeStep[] = order.map((id, i) => {
    const d = drug(id)!
    return {
      order: i + 1,
      drugId: id,
      drugName: d.name,
      observeDays: opts.intervalDays,
      checkBefore: 'Repeat ALT, AST and bilirubin; ask about nausea, anorexia, RUQ pain, dark urine.',
      rationale: rationaleFor(id, opts.order),
    }
  })

  return {
    steps,
    omitted,
    provenance: needsReview(
      'Reintroduction of antituberculosis medications',
      'ATS 2006 describes an interval of roughly 3 to 7 days between drugs; other sources use longer, and some reintroduce at reduced dose escalating to full. The interval is set in Protocol settings.',
    ),
    caveat:
      'If transaminases rise or symptoms return after adding a drug, that drug is the culprit: stop it, allow recovery, exclude it. Excluding a first-line drug changes both the composition and the duration of the continuation regimen.',
  }
}

function rationaleFor(id: string, strategy: RechallengeOptions['order']): string {
  if (strategy === 'least-hepatotoxic-first') {
    const risk = drug(id)?.hepatotoxicity ?? 'moderate'
    return `Ordered by hepatic risk (${risk}), least hepatotoxic first.`
  }
  switch (id) {
    case 'rifampicin':
      return 'Reintroduced first because it is the drug the regimen can least afford to lose, and because it is less often the cause of hepatocellular injury than isoniazid or pyrazinamide.'
    case 'isoniazid':
      return 'Reintroduced second. It is a common cause of hepatocellular injury, so it is added only once rifampicin has been tolerated and the panel is stable.'
    case 'pyrazinamide':
      return 'Reintroduced last, if at all. Its hepatotoxicity is dose-related and it is the most dispensable of the three.'
    default:
      return ''
  }
}

// ---------------------------------------------------------------------------
// Consequences of permanently losing a first-line drug
// ---------------------------------------------------------------------------

export const EXCLUSION_CONSEQUENCES: Record<string, Statement> = {
  pyrazinamide: {
    id: 'consequence.z',
    text: 'Pyrazinamide permanently excluded',
    detail:
      'Losing pyrazinamide removes the sterilising activity that allows a six-month regimen, so the total duration must be extended. Confirm the exact replacement regimen and duration against the WHO drug-susceptible TB module before prescribing.',
    provenance: needsReview(
      'Regimens when pyrazinamide cannot be used',
      'Do not rely on a remembered duration here — read it from the source. This field is a deliberate stub for the reviewer to complete.',
      'who-dstb-2022',
    ),
  },
  isoniazid: {
    id: 'consequence.h',
    text: 'Isoniazid permanently excluded',
    detail:
      'The patient now needs an isoniazid-free regimen. WHO addresses this under isoniazid-resistant, rifampicin-susceptible TB (Hr-TB), which adds a fluoroquinolone. Confirm the composition and duration, and note that the fluoroquinolone choice interacts with QT and with any prior fluoroquinolone exposure.',
    provenance: needsReview(
      'Treatment of isoniazid-resistant tuberculosis',
      undefined,
      'who-drtb-2022',
    ),
  },
  rifampicin: {
    id: 'consequence.r',
    text: 'Rifampicin permanently excluded',
    detail:
      'This is the most consequential loss. A rifampicin-free regimen is substantially longer and more complex, and this patient should be discussed with a drug-resistant TB specialist or programme committee rather than managed on a standard pathway.',
    provenance: needsReview('Rifampicin-free regimens', undefined, 'who-drtb-2022'),
  },
}

// ---------------------------------------------------------------------------
// Outcome of each reintroduction step
// ---------------------------------------------------------------------------

/**
 * What happened after a drug was added back.
 *
 * This is the branch that matters clinically and that a linear "reintroduce in
 * this order" list leaves unanswered: if enzymes rise again, that drug is the
 * culprit, it comes out permanently, and the regimen that remains has to be
 * rebuilt around its absence.
 */
export type RechallengeOutcome = 'pending' | 'tolerated' | 'recurred'

export type OutcomeMap = Record<string, RechallengeOutcome>

export function outcomeOf(outcomes: OutcomeMap, drugId: string): RechallengeOutcome {
  return outcomes[drugId] ?? 'pending'
}

/** Drugs that triggered recurrence and are therefore permanently excluded. */
export function recurredDrugs(outcomes: OutcomeMap): string[] {
  return Object.entries(outcomes)
    .filter(([, v]) => v === 'recurred')
    .map(([k]) => k)
}

/**
 * The step the clinician is actually on: the first drug not yet resolved.
 * Returns null when every step has an outcome.
 */
export function currentStep(
  plan: RechallengePlan,
  outcomes: OutcomeMap,
): RechallengeStep | null {
  return plan.steps.find((s) => outcomeOf(outcomes, s.drugId) === 'pending') ?? null
}

export interface RechallengeProgress {
  current: RechallengeStep | null
  tolerated: string[]
  recurred: string[]
  complete: boolean
}

export function progressOf(plan: RechallengePlan, outcomes: OutcomeMap): RechallengeProgress {
  const tolerated = plan.steps
    .filter((s) => outcomeOf(outcomes, s.drugId) === 'tolerated')
    .map((s) => s.drugId)
  const recurred = plan.steps
    .filter((s) => outcomeOf(outcomes, s.drugId) === 'recurred')
    .map((s) => s.drugId)
  const current = currentStep(plan, outcomes)
  return { current, tolerated, recurred, complete: current === null }
}

/** What to do the moment a drug is identified as the culprit. */
export function recurrenceActions(drugName: string, intervalDays: number): string[] {
  return [
    `Stop ${drugName} again immediately.`,
    'Do not re-attempt it — the drug is now identified and confirmed.',
    `Allow liver tests to settle before adding the next drug (about ${intervalDays} days).`,
    'Rebuild the regimen around its permanent absence — see below.',
  ]
}

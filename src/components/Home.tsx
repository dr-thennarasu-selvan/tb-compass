import { usePatient } from '@/store/patientContext'
import { moduleStatus } from '@/engine/moduleStatus'
import { moduleNeeds } from '@/engine/moduleNeeds'

export type View = 'home' | 'cascade' | 'dstb' | 'dili' | 'drtb' | 'eptb' | 'iris' | 'qt' | 'renal' | 'hypersensitivity' | 'pregnancy' | 'interactions' | 'airways' | 'diabetes' | 'response'

interface Module {
  id: string
  title: string
  detail: string
  view?: View
}

/**
 * The cascade is the spine, not a module. Classification evolves as results
 * arrive, and everything else reads from it — so it sits above the list.
 */
const SPINE: Module = {
  id: 'cascade',
  title: 'Diagnostic pathway',
  detail:
    'Presumptive → confirmed or clinically diagnosed → rifampicin status → LPA → DST. Shows what is pending and what each result would change.',
  view: 'cascade',
}

const MODULES: Module[] = [
  {
    id: 'dili',
    title: 'Hepatotoxicity on anti-TB treatment',
    detail:
      'Deranged liver tests or jaundice on treatment. Decides whether to withdraw, what to bridge with, and how to reintroduce.',
    view: 'dili',
  },
  {
    id: 'ds-regimen',
    title: 'Drug-susceptible TB — regimen and weight-band dosing',
    detail:
      'FDC tablets by weight band, mg/kg dose check, and where the site of disease extends the continuation phase.',
    view: 'dstb',
  },
  {
    id: 'dr-regimen',
    title: 'Drug-resistant TB — regimen from the DST pattern',
    detail:
      'BPaLM, the 9–11 month shorter oral regimen, the 18–20 month longer oral regimen and Hr-TB, checked against NTEP eligibility criteria.',
    view: 'drtb',
  },
  {
    id: 'renal',
    title: 'Renal impairment and dialysis',
    detail:
      'Creatinine clearance, interval-extended dosing below 30 mL/min, post-dialysis timing, transplant interactions, and the thresholds that bar a regimen.',
    view: 'renal',
  },
  {
    id: 'extrapulmonary',
    title: 'Extrapulmonary TB — condition workflows',
    detail:
      'Fifteen ICMR workflows: when to suspect, investigations, diagnostic pathway, management. Plus specimen handling.',
    view: 'eptb',
  },
  {
    id: 'reactions',
    title: 'IRIS and paradoxical reactions',
    detail:
      'INSHI case definition, the differential against treatment failure and resistance, severity-based steroids, and ART timing.',
    view: 'iris',
  },
  {
    id: 'hypersensitivity',
    title: 'Drug reactions, rash and desensitisation',
    detail:
      'Red flags that forbid rechallenge, the sequential reintroduction schedule, desensitisation ladders, and telling DRESS from SJS/TEN.',
    view: 'hypersensitivity',
  },
  {
    id: 'qt',
    title: 'QT prolongation and cardiac safety',
    detail:
      'QTcF calculator, NTEP grading from mild to life-threatening, and when ECG monitoring is actually required.',
    view: 'qt',
  },
]

const REGIMEN_IDS = ['ds-regimen', 'dr-regimen', 'extrapulmonary']

/** Questions that arise once treatment is under way. */
const ON_TREATMENT: Module[] = [
  {
    id: 'response',
    title: 'Not improving on treatment',
    detail:
      'Smear positive at 2 months, culture positive at 4, reversion, fever or weight loss: whether it is failure yet, and the causes to work through in order.',
    view: 'response',
  },
]

/** Checks run against the regimen before and during prescribing. */
const PRESCRIBING: Module[] = [
  {
    id: 'interactions',
    title: 'Drug interactions',
    detail:
      'The regimen against everything else the patient takes: ART, hepatitis C drugs, antidepressants, antacids, steroids, transplant drugs. Says plainly when a pair is not covered.',
    view: 'interactions',
  },
]

/**
 * Conditions that modify every other answer rather than posing their own
 * question. Pregnancy is the first; comorbidities follow the same shape.
 */
const POPULATIONS: Module[] = [
  {
    id: 'pregnancy',
    title: 'Pregnancy and breastfeeding',
    detail:
      'Regimen by gestational age and MTP decision, drugs barred at this gestation, fetal and newborn monitoring, and breastfeeding on each regimen.',
    view: 'pregnancy',
  },
  {
    id: 'diabetes',
    title: 'Diabetes',
    detail:
      'NTEP blood-sugar screening and triage thresholds, glycaemic control on rifampicin, neuropathy, eyes and kidneys, and when to extend treatment.',
    view: 'diabetes',
  },
  {
    id: 'airways',
    title: 'COPD, asthma and post-TB lung disease',
    detail:
      'Inhaled steroids and TB risk, TB red flags behind an airways label, steroid and theophylline doses on rifampicin, and the end-of-treatment lung assessment.',
    view: 'airways',
  },
]

/**
 * The line under a card title. A live status where the module has something to
 * say, otherwise the field that is blocking it — so a quiet card explains its
 * own silence instead of looking broken.
 */
function CardSignal({ view }: { view: View }) {
  const { patient, pack } = usePatient()
  const s = moduleStatus(view, patient, pack)
  if (s) {
    return (
      <span className="mod-status" data-sev={s.severity}>
        {s.text}
      </span>
    )
  }
  const needs = moduleNeeds(view, patient)
  if (needs.length === 0) return null
  return <span className="mod-needs">needs {needs.map((n) => n.short).join(', ')}</span>
}

function Card({ m, onOpen }: { m: Module; onOpen: (v: View) => void }) {
  const planned = !m.view
  return (
    <button
      className="home-card"
      data-state={planned ? 'planned' : 'ready'}
      disabled={planned}
      onClick={() => m.view && onOpen(m.view)}
    >
      <div className="t">
        <span className="t-text">{m.title}</span>
        {planned && <span className="pill">planned</span>}
        {m.view && <CardSignal view={m.view} />}
      </div>
      <div className="d">{m.detail}</div>
      <span className="go" aria-hidden="true">
        →
      </span>
    </button>
  )
}

export function Home({ onOpen }: { onOpen: (v: View) => void }) {
  const { patient } = usePatient()
  const empty =
    patient.ageYears == null &&
    patient.weightKg == null &&
    patient.sites.length === 0 &&
    patient.currentDrugs.length === 0 &&
    Object.keys(patient.labs).length === 0

  return (
    <>
      {empty && (
        <p className="home-hint">
          Add the patient above and these cards fill in — each one shows what it can already tell
          you, or the single value it is waiting on. You can also open any module directly and
          enter what it needs there.
        </p>
      )}

      <button className="home-card spine" onClick={() => onOpen('cascade')}>
        <div className="t">
          <span className="t-text">{SPINE.title}</span>
          <CardSignal view="cascade" />
        </div>
        <div className="d">{SPINE.detail}</div>
        <span className="go" aria-hidden="true">
          →
        </span>
      </button>

      <div className="section-label">Resistance Explorer</div>
      <a className="home-card" href={`${import.meta.env.BASE_URL}explorer/`}>
        <div className="t">
          <span className="t-text">Resistance Explorer</span>
        </div>
        <div className="d">
          A visual teaching model: knock out drugs on the bacillus, step through NAAT, LPA and DST,
          and watch the classification and regimens change. With guided course, cases and drill.
        </div>
        <span className="go" aria-hidden="true">
          →
        </span>
      </a>

      <div className="section-label">Regimen and duration</div>
      {MODULES.filter((m) => REGIMEN_IDS.includes(m.id)).map((m) => (
        <Card key={m.id} m={m} onOpen={onOpen} />
      ))}

      <div className="section-label">On treatment</div>
      {ON_TREATMENT.map((m) => (
        <Card key={m.id} m={m} onOpen={onOpen} />
      ))}

      <div className="section-label">Before prescribing</div>
      {PRESCRIBING.map((m) => (
        <Card key={m.id} m={m} onOpen={onOpen} />
      ))}

      <div className="section-label">Special populations</div>
      {POPULATIONS.map((m) => (
        <Card key={m.id} m={m} onOpen={onOpen} />
      ))}

      <div className="section-label">Complications — reachable at any point</div>
      {MODULES.filter((m) => !REGIMEN_IDS.includes(m.id)).map((m) => (
        <Card key={m.id} m={m} onOpen={onOpen} />
      ))}
    </>
  )
}

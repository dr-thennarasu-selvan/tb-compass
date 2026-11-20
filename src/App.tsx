import { useEffect, useLayoutEffect, useState } from 'react'
import { PatientProvider } from '@/store/patient'
import { PatientPanel } from '@/components/PatientPanel'
import { PatientSummary } from '@/components/PatientSummary'
import { NeedsBar } from '@/components/NeedsBar'
import { DiliModule } from '@/components/DiliModule'
import { DrTbModule } from '@/components/DrTbModule'
import { EptbModule } from '@/components/EptbModule'
import { IrisModule } from '@/components/IrisModule'
import { CascadeModule } from '@/components/CascadeModule'
import { QtModule } from '@/components/QtModule'
import { DsTbModule } from '@/components/DsTbModule'
import { RenalModule } from '@/components/RenalModule'
import { HypersensitivityModule } from '@/components/HypersensitivityModule'
import { PregnancyModule } from '@/components/PregnancyModule'
import { InteractionsModule } from '@/components/InteractionsModule'
import { AirwaysModule } from '@/components/AirwaysModule'
import { DiabetesModule } from '@/components/DiabetesModule'
import { ResponseModule } from '@/components/ResponseModule'
import { Home, type View } from '@/components/Home'
import { usePatient } from '@/store/patientContext'
import { PACK_LABEL, type GuidelinePack } from '@/types/content'

/**
 * Lives in its own component because the header renders inside
 * <PatientProvider>, which App itself creates — App cannot call usePatient.
 *
 * The pack is a switch rather than a label. It changes the answer in every
 * module, so burying it inside the hepatotoxicity module's protocol settings
 * made the single most consequential control the hardest one to find.
 */
const PACKS: GuidelinePack[] = ['who', 'ntep']

function PackSwitch() {
  const { pack, setPack } = usePatient()
  return (
    <div className="pack-switch" role="group" aria-label="Guideline pack">
      {PACKS.map((p) => (
        <button
          key={p}
          data-on={pack === p}
          onClick={() => setPack(p)}
          aria-pressed={pack === p}
          title={`Show ${PACK_LABEL[p]} answers`}
        >
          {PACK_LABEL[p]}
        </button>
      ))}
    </div>
  )
}

const TITLES: Record<View, string> = {
  home: '',
  cascade: 'Diagnostic pathway',
  dstb: 'Drug-susceptible TB — regimen and dosing',
  renal: 'Renal impairment and dialysis',
  hypersensitivity: 'Drug reactions, rash and desensitisation',
  dili: 'Hepatotoxicity on anti-TB treatment',
  drtb: 'Drug-resistant TB — regimen selection',
  eptb: 'Extrapulmonary TB — duration and steroids',
  iris: 'IRIS and paradoxical reactions',
  qt: 'QT prolongation and cardiac safety',
  pregnancy: 'Pregnancy and breastfeeding',
  interactions: 'Drug interactions',
  airways: 'COPD, asthma and post-TB lung disease',
  diabetes: 'Diabetes',
  response: 'Not improving on treatment',
}

/** One line under the module title saying what this screen decides. */
const SUBTITLES: Partial<Record<View, string>> = {
  cascade: 'Where this patient sits, and what each pending result would change.',
  dstb: 'Tablets by weight band, the mg/kg check, and how long to treat.',
  renal: 'Whether the dose interval changes, and which drugs are barred.',
  hypersensitivity: 'Whether rechallenge is safe, and in what order.',
  dili: 'Whether to withdraw, what to bridge with, and how to reintroduce.',
  drtb: 'Which regimen this DST pattern allows, and what is blocking the rest.',
  eptb: 'The workflow for this site, and how long treatment runs.',
  iris: 'Whether this is IRIS, and what to do about it.',
  qt: 'The grade, and whether monitoring is required.',
  pregnancy: 'Which regimen this gestation allows, what to stop, and what to monitor.',
  interactions: 'What this regimen does to everything else the patient takes — and what the sources do not cover.',
  airways: 'Inhaled steroids, TB behind an airways label, and what to assess when treatment ends.',
  diabetes: 'Where screening stands, and what diabetes changes in the regimen and its toxicity.',
  response: 'Is this failure yet — and if not, which cause to rule out first.',
}

type Theme = 'system' | 'light' | 'dark'

const THEME_ICON: Record<Theme, string> = { system: '◐', light: '☀', dark: '☾' }

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('tbcompass.theme') as Theme) ?? 'system'
    } catch {
      return 'system'
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('tbcompass.theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const cycle = () =>
    setTheme((t) => (t === 'system' ? 'light' : t === 'light' ? 'dark' : 'system'))

  return [theme, cycle]
}

/**
 * The context panel is collapsed by default everywhere, including when empty.
 *
 * It used to expand itself whenever the patient was blank, which meant a
 * clinician opening a module on a fresh patient landed on a sixty-field form
 * with the module below the fold. The summary bar is the affordance instead:
 * it says what is missing and opens the panel on demand.
 */
function ContextArea() {
  const [expanded, setExpanded] = useState(false)

  if (!expanded) return <PatientSummary onExpand={() => setExpanded(true)} />
  return <PatientPanel onDone={() => setExpanded(false)} />
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [theme, cycleTheme] = useTheme()

  // A module opened from a scrolled home screen used to keep that scroll
  // offset, landing the clinician mid-form — and putting the click target for
  // the next tap over a drug chip.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  const go = (v: View) => setView(v)

  return (
    <PatientProvider>
      <div className="app">
        <div className="sticky-head">
        <div className="demo-banner" role="note">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M8 1.8 15 14H1z" strokeLinejoin="round" />
            <path d="M8 6.2v3.6M8 11.6v.4" strokeLinecap="round" />
          </svg>
          <span>Demo for education only. Not for clinical use.</span>
        </div>
        <header className="topbar">
          {view !== 'home' && (
            <button className="back" onClick={() => go('home')} aria-label="Back to modules">
              ←<span>Modules</span>
            </button>
          )}
          <div className="brand" onClick={() => go('home')} role="button" tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && go('home')}>
            <img className="logo" src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" width={24} height={24} />
            TB <span>Compass</span>
          </div>
          <div className="spacer" />
          <PackSwitch />
          <button className="ghost icon-btn" onClick={cycleTheme} aria-label={`Theme: ${theme}`} title={`Theme: ${theme}`}>
            {THEME_ICON[theme]}
          </button>
        </header>
        </div>

        <main className="main">
          {view === 'home' ? (
            <>
              <ContextArea />
              <Home onOpen={go} />
            </>
          ) : (
            <>
              <div className="module-head">
                <h1>{TITLES[view]}</h1>
                {SUBTITLES[view] && <p>{SUBTITLES[view]}</p>}
              </div>
              <ContextArea />
              <NeedsBar view={view} onNavigate={(v) => go(v as View)} />
              {view === 'dili' && <DiliModule onNavigate={setView} />}
              {view === 'drtb' && <DrTbModule onNavigate={setView} />}
              {view === 'eptb' && <EptbModule onNavigate={setView} />}
              {view === 'iris' && <IrisModule onNavigate={setView} />}
              {view === 'cascade' && <CascadeModule />}
              {view === 'qt' && <QtModule onNavigate={setView} />}
              {view === 'dstb' && <DsTbModule onNavigate={setView} />}
              {view === 'renal' && <RenalModule onNavigate={setView} />}
              {view === 'hypersensitivity' && <HypersensitivityModule onNavigate={setView} />}
              {view === 'pregnancy' && <PregnancyModule onNavigate={setView} />}
              {view === 'interactions' && <InteractionsModule onNavigate={setView} />}
              {view === 'airways' && <AirwaysModule onNavigate={setView} />}
              {view === 'diabetes' && <DiabetesModule onNavigate={setView} />}
              {view === 'response' && <ResponseModule onNavigate={setView} />}
            </>
          )}
        </main>

        <footer className="legal">
          An education demo for clinicians, not a clinical tool. Every recommendation carries the
          source it came from — open the citation and check it before acting. This app does not
          diagnose or prescribe, and does not replace the guideline documents it cites or your own
          judgement. Patient data stays in this browser and is never transmitted.
        </footer>
      </div>
    </PatientProvider>
  )
}

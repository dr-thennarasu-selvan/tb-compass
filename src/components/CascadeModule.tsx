import { useMemo } from 'react'
import { usePatient } from '@/store/patientContext'
import { Provenance } from '@/components/Provenance'
import {
  CLASSIFICATION_LABEL,
  cascadeWarnings,
  deriveClassification,
  pendingImplications,
} from '@/engine/cascade'
import type { DiagnosticTrack, ResultState } from '@/types/diagnosis'

const TRACKS: { id: DiagnosticTrack; label: string; detail: string }[] = [
  { id: 'presumptive', label: 'Presumptive TB', detail: 'Symptoms or CXR abnormality, workup in progress' },
  {
    id: 'microbiologically-confirmed',
    label: 'Microbiologically confirmed',
    detail: 'Organism detected — susceptibility can be established',
  },
  {
    id: 'clinically-radiologically-diagnosed',
    label: 'Clinically / radiologically diagnosed',
    detail: 'No organism — susceptibility can never be established',
  },
]

const STATES: { id: ResultState; label: string }[] = [
  { id: 'not-sent', label: 'not sent' },
  { id: 'pending', label: 'pending' },
  { id: 'resulted', label: 'resulted' },
]

function StateRow({
  label,
  state,
  onChange,
  children,
}: {
  label: string
  state: ResultState
  onChange: (s: ResultState) => void
  children?: React.ReactNode
}) {
  return (
    <div className="test-row" data-state={state}>
      <div className="test-head">
        <span className="test-name">{label}</span>
        <div className="toggle-row">
          {STATES.map((s) => (
            <label key={s.id} className="toggle sm" data-on={state === s.id}>
              <input type="radio" checked={state === s.id} onChange={() => onChange(s.id)} />
              {s.label}
            </label>
          ))}
        </div>
      </div>
      {state === 'resulted' && children && <div className="test-body">{children}</div>}
    </div>
  )
}

function Tri({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string | undefined
  onChange: (v: string | undefined) => void
  options: { id: string; label: string }[]
}) {
  return (
    <div className="tri">
      <span className="tri-label">{label}</span>
      <div className="toggle-row">
        {options.map((o) => (
          <label key={o.id} className="toggle sm" data-on={value === o.id}>
            <input
              type="radio"
              checked={value === o.id}
              onChange={() => onChange(value === o.id ? undefined : o.id)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  )
}

const RES = [
  { id: 'detected', label: 'detected' },
  { id: 'not-detected', label: 'not detected' },
]
const SUSC = [
  { id: 'resistant', label: 'resistant' },
  { id: 'susceptible', label: 'susceptible' },
]

export function CascadeModule() {
  const { patient, updateDiagnosis } = usePatient()
  const d = patient.diagnosis

  const derived = useMemo(() => deriveClassification(d), [d])
  const implications = useMemo(() => pendingImplications(d), [d])
  const warnings = useMemo(() => cascadeWarnings(d), [d])

  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => updateDiagnosis({ [k]: v } as never)

  return (
    <>
      {/* ---------------- current state ---------------- */}
      <div className="verdict tight" data-sev={derived.classification === 'unknown' ? 'info' : derived.provisional ? 'caution' : 'ok'}>
        <h3>
          {CLASSIFICATION_LABEL[derived.classification]}
          {derived.provisional && <span className="prov-pill">provisional</span>}
        </h3>
        <p className="body" style={{ fontSize: 13 }}>{derived.basis}</p>
        {derived.pending.length > 0 && (
          <p className="body" style={{ fontSize: 13 }}>
            <b>Awaiting:</b> {derived.pending.join(' · ')}. The classification can still change.
          </p>
        )}
      </div>

      {/* ---------------- warnings ---------------- */}
      {warnings.map((w) => (
        <div className="card" key={w.id}>
          <div className="order" data-urgency="immediate" data-tone={w.severity === 'critical' ? 'critical' : w.severity === 'warning' ? 'warn' : 'neutral'}>
            <div className="verb">{w.severity === 'critical' ? 'Act' : 'Caution'}</div>
            <div className="main">
              <div className="p">{w.title}</div>
              <div className="meta">{w.detail}</div>
              <Provenance p={w.provenance} />
            </div>
          </div>
        </div>
      ))}

      {/* ---------------- track ---------------- */}
      <div className="card compact">
        <h2>Track</h2>
        <div className="sub">These two behave differently and must not be merged.</div>
        <div className="toggle-row">
          {TRACKS.map((t) => (
            <label key={t.id} className="toggle" data-on={d.track === t.id} title={t.detail}>
              <input type="radio" checked={d.track === t.id} onChange={() => set('track', t.id)} />
              {t.label}
            </label>
          ))}
        </div>
        <p className="note">{TRACKS.find((t) => t.id === d.track)?.detail}</p>

        <div className="section-label">Before the workup</div>
        <div className="toggle-row">
          <label className="toggle" data-on={!!d.antibioticTrialGiven}>
            <input
              type="checkbox"
              checked={!!d.antibioticTrialGiven}
              onChange={() => set('antibioticTrialGiven', !d.antibioticTrialGiven)}
            />
            Antibiotic trial given
          </label>
          {d.antibioticTrialGiven && (
            <label className="toggle" data-on={!!d.antibioticWasFluoroquinolone}>
              <input
                type="checkbox"
                checked={!!d.antibioticWasFluoroquinolone}
                onChange={() =>
                  set('antibioticWasFluoroquinolone', !d.antibioticWasFluoroquinolone)
                }
              />
              It was a fluoroquinolone
            </label>
          )}
          <label className="toggle" data-on={!!d.cxrAbnormal}>
            <input type="checkbox" checked={!!d.cxrAbnormal} onChange={() => set('cxrAbnormal', !d.cxrAbnormal)} />
            CXR abnormal
          </label>
          <label className="toggle" data-on={!!d.ctSupportive}>
            <input type="checkbox" checked={!!d.ctSupportive} onChange={() => set('ctSupportive', !d.ctSupportive)} />
            CT supportive
          </label>
          <label className="toggle" data-on={!!d.histopathologySupportive}>
            <input
              type="checkbox"
              checked={!!d.histopathologySupportive}
              onChange={() => set('histopathologySupportive', !d.histopathologySupportive)}
            />
            Histopathology supportive
          </label>
        </div>
      </div>

      {/* ---------------- the cascade ---------------- */}
      <div className="card">
        <h2>Results</h2>
        <div className="sub">
          Start treatment on what is back; modify when the rest lands.
        </div>

        <StateRow label="NAAT / CBNAAT / Truenat" state={d.naat.state} onChange={(s) => set('naat', { ...d.naat, state: s })}>
          <Tri
            label="M. tuberculosis"
            value={d.naat.mtbDetected === undefined ? undefined : d.naat.mtbDetected ? 'detected' : 'not-detected'}
            onChange={(v) => set('naat', { ...d.naat, mtbDetected: v === undefined ? undefined : v === 'detected' })}
            options={RES}
          />
          <Tri
            label="Rifampicin resistance"
            value={d.naat.rifResistance}
            onChange={(v) => set('naat', { ...d.naat, rifResistance: v as never })}
            options={[...RES, { id: 'indeterminate', label: 'indeterminate' }]}
          />
        </StateRow>

        <StateRow label="First-line LPA" state={d.flLpa.state} onChange={(s) => set('flLpa', { ...d.flLpa, state: s })}>
          <Tri
            label="Isoniazid resistance"
            value={d.flLpa.isoniazidResistance}
            onChange={(v) => set('flLpa', { ...d.flLpa, isoniazidResistance: v as never })}
            options={RES}
          />
          <Tri
            label="Rifampicin resistance"
            value={d.flLpa.rifResistance}
            onChange={(v) => set('flLpa', { ...d.flLpa, rifResistance: v as never })}
            options={RES}
          />
          {d.flLpa.isoniazidResistance === 'detected' && (
            <div className="toggle-row" style={{ marginTop: 6 }}>
              <label className="toggle sm" data-on={!!d.flLpa.katG}>
                <input type="checkbox" checked={!!d.flLpa.katG} onChange={() => set('flLpa', { ...d.flLpa, katG: !d.flLpa.katG })} />
                katG (high-level)
              </label>
              <label className="toggle sm" data-on={!!d.flLpa.inhA}>
                <input type="checkbox" checked={!!d.flLpa.inhA} onChange={() => set('flLpa', { ...d.flLpa, inhA: !d.flLpa.inhA })} />
                inhA promoter (low-level)
              </label>
            </div>
          )}
        </StateRow>

        <StateRow label="Second-line LPA" state={d.slLpa.state} onChange={(s) => set('slLpa', { ...d.slLpa, state: s })}>
          <Tri
            label="Fluoroquinolone resistance"
            value={d.slLpa.fqResistance}
            onChange={(v) => set('slLpa', { ...d.slLpa, fqResistance: v as never })}
            options={RES}
          />
          <Tri
            label="Second-line injectable resistance"
            value={d.slLpa.sliResistance}
            onChange={(v) => set('slLpa', { ...d.slLpa, sliResistance: v as never })}
            options={RES}
          />
        </StateRow>

        <StateRow label="Liquid culture DST" state={d.dst.state} onChange={(s) => set('dst', { ...d.dst, state: s })}>
          <Tri label="Bedaquiline" value={d.dst.bedaquiline} onChange={(v) => set('dst', { ...d.dst, bedaquiline: v as never })} options={SUSC} />
          <Tri label="Linezolid" value={d.dst.linezolid} onChange={(v) => set('dst', { ...d.dst, linezolid: v as never })} options={SUSC} />
          <Tri label="Moxifloxacin" value={d.dst.moxifloxacin} onChange={(v) => set('dst', { ...d.dst, moxifloxacin: v as never })} options={SUSC} />
          <Tri label="Pyrazinamide" value={d.dst.pyrazinamide} onChange={(v) => set('dst', { ...d.dst, pyrazinamide: v as never })} options={SUSC} />
        </StateRow>
      </div>

      {/* ---------------- what changes when results land ---------------- */}
      {implications.length > 0 && (
        <div className="card">
          <h2>What changes when these land</h2>
          <div className="sub">
            Decide now what each result would mean, so the regimen changes the day it arrives.
          </div>
          {implications.map((i) => (
            <div key={i.test} className="implication">
              <div className="imp-test">{i.test}</div>
              {i.outcomes.map((o, n) => (
                <div className="imp-row" key={n} data-sev={o.severity}>
                  <div className="imp-result">{o.result}</div>
                  <div className="imp-consequence">{o.consequence}</div>
                </div>
              ))}
              <Provenance p={i.provenance} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

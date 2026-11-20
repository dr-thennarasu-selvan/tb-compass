import { useMemo, useState } from 'react'
import { usePatient } from '@/store/patientContext'
import { Provenance } from '@/components/Provenance'
import { CrossLinks } from '@/components/CrossLinks'
import type { View } from '@/components/Home'
import { DRUGS } from '@/content/drugs'
import { CO_MEDS, LIVERPOOL_POINTER, RIFAMPICIN_TIMING, UNSOURCED_NOTE, type CoMedGroup } from '@/content/interactions'
import {
  FREE_PREFIX,
  checkInteractions,
  coMedLabel,
  isSourced,
  searchCoMeds,
  type Finding,
} from '@/engine/interactions'
import type { InteractionSeverity } from '@/content/interactions'

const VERB: Record<InteractionSeverity, string> = {
  avoid: 'AVOID',
  adjust: 'ADJUST',
  separate: 'SEPARATE',
  monitor: 'MONITOR',
  info: 'USABLE',
}

const TONE: Record<InteractionSeverity, string> = {
  avoid: 'critical',
  adjust: 'warn',
  separate: 'warn',
  monitor: 'neutral',
  info: 'good',
}

function FindingRow({ f }: { f: Finding }) {
  return (
    <div className="order" data-urgency={f.severity === 'avoid' ? 'immediate' : 'routine'} data-tone={TONE[f.severity]}>
      <div className="verb">{VERB[f.severity]}</div>
      <div className="main">
        <div className="p">
          {f.coMedLabel} <span className="x-sep">×</span> {f.tbDrugs.join(', ')}
        </div>
        {f.matchedAs && <div className="meta">Applies via {f.matchedAs}</div>}
        <div className="meta">{f.effect}</div>
        <div className="meta"><b>Do:</b> {f.action}</div>
        <Provenance p={f.provenance} />
      </div>
    </div>
  )
}

function CoMedEntry() {
  const { patient, update } = usePatient()
  const [q, setQ] = useState('')
  const hits = useMemo(() => searchCoMeds(q), [q])

  const add = (id: string) => {
    if (!patient.coMedications.includes(id)) update({ coMedications: [...patient.coMedications, id] })
    setQ('')
  }

  const addTyped = () => {
    const t = q.trim()
    if (t.length < 2) return
    if (hits.length > 0) add(hits[0].id)
    else add(`${FREE_PREFIX}${t}`)
  }

  return (
    <div className="ddi-search">
      <input
        type="text"
        value={q}
        placeholder="Type a medicine — warfarin, TLD, sertraline, antacid…"
        aria-label="Add another medicine"
        autoComplete="off"
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addTyped()
          }
        }}
      />
      {q.trim().length >= 2 && (
        <div className="ddi-hits" role="listbox">
          {hits.map((h) => (
            <button key={`${h.kind}-${h.id}`} className="ddi-hit" role="option" aria-selected="false" onClick={() => add(h.id)}>
              <span className="ddi-hit-name">{h.name}</span>
              {h.matched.toLowerCase() !== h.name.toLowerCase() && <span className="ddi-hit-alias">{h.matched}</span>}
              {h.kind === 'unsourced' && <span className="ddi-hit-flag">no source on file</span>}
            </button>
          ))}
          {hits.length === 0 && (
            <button className="ddi-hit" onClick={addTyped}>
              <span className="ddi-hit-name">Add “{q.trim()}”</span>
              <span className="ddi-hit-flag">not recognised</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const GROUPS: CoMedGroup[] = [
  'HIV',
  'Hepatitis C',
  'Anticoagulants',
  'Antiepileptics',
  'Anti-infectives',
  'Cardiovascular',
  'Diabetes and lipids',
  'Psychiatric and pain',
  'Stomach, antacids and minerals',
  'Steroids, transplant and hormones',
  'Other',
]

export function InteractionsModule({ onNavigate }: { onNavigate?: (v: View) => void }) {
  const { patient, update } = usePatient()
  const report = useMemo(
    () => checkInteractions(patient.currentDrugs, patient.coMedications),
    [patient.currentDrugs, patient.coMedications],
  )

  const toggleTb = (id: string) =>
    update({
      currentDrugs: patient.currentDrugs.includes(id)
        ? patient.currentDrugs.filter((d) => d !== id)
        : [...patient.currentDrugs, id],
    })

  const toggleCo = (id: string) =>
    update({
      coMedications: patient.coMedications.includes(id)
        ? patient.coMedications.filter((d) => d !== id)
        : [...patient.coMedications, id],
    })

  const counts = {
    avoid: report.findings.filter((f) => f.severity === 'avoid').length,
    change: report.findings.filter((f) => f.severity === 'adjust' || f.severity === 'separate').length + report.tbTb.length,
    monitor: report.findings.filter((f) => f.severity === 'monitor').length,
    usable: report.findings.filter((f) => f.severity === 'info').length,
    uncovered: report.uncovered.length,
  }
  const anyHiv = patient.coMedications.some((id) => CO_MEDS.find((c) => c.id === id)?.group === 'HIV')
  const hasTb = patient.currentDrugs.length > 0
  const hasCo = patient.coMedications.length > 0

  return (
    <>
      {/* ---------- inputs ---------- */}
      <div className="card">
        <h2>Anti-TB drugs</h2>
        <div className="sub">The regimen being given or planned. Shared with every other module.</div>
        <div className="toggle-row">
          {DRUGS.map((d) => (
            <label className="toggle sm" data-on={patient.currentDrugs.includes(d.id)} key={d.id}>
              <input type="checkbox" checked={patient.currentDrugs.includes(d.id)} onChange={() => toggleTb(d.id)} />
              <b className="drug-code">{d.code}</b> {d.name}
            </label>
          ))}
        </div>

        <h2 style={{ marginTop: 18 }}>Other medicines</h2>
        <div className="sub">Everything else the patient takes, by generic name, class or combination.</div>
        <CoMedEntry />
        {hasCo && (
          <div className="toggle-row" style={{ marginTop: 10 }}>
            {patient.coMedications.map((id) => (
              <button
                key={id}
                className="ddi-chip"
                data-kind={id.startsWith(FREE_PREFIX) ? 'free' : isSourced(id) ? 'sourced' : 'unsourced'}
                onClick={() => toggleCo(id)}
                aria-label={`Remove ${coMedLabel(id)}`}
              >
                {coMedLabel(id)} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}
        <details className="reveal quiet" style={{ marginTop: 10 }}>
          <summary>Browse what the sources cover</summary>
          {GROUPS.map((g) => (
            <div key={g} style={{ marginTop: 8 }}>
              <div className="section-label" style={{ marginTop: 4 }}>{g}</div>
              <div className="toggle-row">
                {CO_MEDS.filter((c) => c.group === g).map((c) => (
                  <label className="toggle sm" data-on={patient.coMedications.includes(c.id)} key={c.id} title={c.classNote}>
                    <input type="checkbox" checked={patient.coMedications.includes(c.id)} onChange={() => toggleCo(c.id)} />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </details>
      </div>

      {/* ---------- answer ---------- */}
      {hasCo && !hasTb && (
        <div className="verdict tight" data-sev="info">
          <h3>Select the anti-TB drugs above</h3>
          <p className="body" style={{ fontSize: 13 }}>Interactions are checked pair by pair against the regimen.</p>
        </div>
      )}

      {hasCo && hasTb && (
        <div
          className="verdict tight"
          data-sev={counts.avoid > 0 ? 'critical' : counts.change > 0 ? 'warning' : counts.uncovered > 0 ? 'caution' : 'ok'}
        >
          <h3>
            {[
              counts.avoid > 0 && `${counts.avoid} to avoid`,
              counts.change > 0 && `${counts.change} needing a change`,
              counts.monitor > 0 && `${counts.monitor} to monitor`,
              counts.uncovered > 0 && `${counts.uncovered} not covered by the sources`,
              counts.usable > 0 && `${counts.usable} usable as stated`,
            ]
              .filter(Boolean)
              .join(' · ') || 'No interaction in the sources for these pairs'}
          </h3>
          <p className="body" style={{ fontSize: 13 }}>
            Checked against NTEP DR-TB 2024, WHO Module 4 guidelines and operational handbook (2025), the
            ATS/CDC/IDSA 2016 guideline and the author's notes. Only interactions those documents state are shown.
          </p>
        </div>
      )}

      {report.findings.length > 0 && (
        <div className="card">
          <h2>Interactions</h2>
          {report.findings.map((f) => (
            <FindingRow key={f.key} f={f} />
          ))}
          {report.findings.some((f) => f.tbDrugs.includes('Rifampicin') && f.severity === 'adjust') && (
            <div className="banner" style={{ marginTop: 10, marginBottom: 0 }}>
              <b>{RIFAMPICIN_TIMING.text}.</b> {RIFAMPICIN_TIMING.detail}
              <Provenance p={RIFAMPICIN_TIMING.provenance} />
            </div>
          )}
          {anyHiv && (
            <div className="note" style={{ marginTop: 8 }}>
              For antiretroviral combinations WHO points to the University of Liverpool HIV drug interactions
              website.
              <Provenance p={LIVERPOOL_POINTER} />
            </div>
          )}
        </div>
      )}

      {report.tbTb.length > 0 && (
        <div className="card">
          <h2>Within the TB regimen</h2>
          {report.tbTb.map((f) => (
            <FindingRow key={f.key} f={f} />
          ))}
        </div>
      )}

      {report.uncovered.length > 0 && hasTb && (
        <div className="unauthored">
          <div className="p">Not covered — this is not the same as safe</div>
          <ul className="plain">
            {report.uncovered.map((u) => (
              <li key={u.coMed}>
                <b>{u.label}</b>
                {u.reason === 'unsourced' && ' — not addressed by any document on file.'}
                {u.reason === 'no-pair' && ' — the sources address this medicine, but not this pairing.'}
                {u.reason === 'unrecognised' && ' — not a name the checker recognises. Check the spelling, or search by class.'}
              </li>
            ))}
          </ul>
          <div className="meta" style={{ marginTop: 6 }}>{UNSOURCED_NOTE}</div>
        </div>
      )}

      <CrossLinks from="interactions" onNavigate={onNavigate} />
    </>
  )
}

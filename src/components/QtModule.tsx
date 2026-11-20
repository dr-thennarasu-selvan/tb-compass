import { useMemo, useState } from 'react'
import { usePatient } from '@/store/patientContext'
import { Provenance } from '@/components/Provenance'
import { CrossLinks } from '@/components/CrossLinks'
import {
  ECG_MONITORING_RULE,
  QTCF_FORMULA_PROVENANCE,
  QT_AGENTS_PROVENANCE,
  QT_GRADES,
  QT_SUPPORTING_MEASURES,
} from '@/content/qt'
import { assessQt, qtcBazett, qtcFridericia } from '@/engine/qt'

export function QtModule({ onNavigate }: { onNavigate?: (v: import('@/components/Home').View) => void }) {
  const { patient, updateLabs } = usePatient()
  const [qtMs, setQtMs] = useState<number | undefined>(undefined)
  const [hr, setHr] = useState<number | undefined>(undefined)
  const [symptomaticArrhythmia, setSympt] = useState(false)
  const [confirmedOnTwoEcgs, setTwoEcgs] = useState(false)
  const [lifeThreatening, setLife] = useState(false)

  const computedF = qtcFridericia(qtMs, hr)
  const computedB = qtcBazett(qtMs, hr)

  const a = useMemo(
    () => assessQt(patient, { symptomaticArrhythmia, confirmedOnTwoEcgs, lifeThreatening }),
    [patient, symptomaticArrhythmia, confirmedOnTwoEcgs, lifeThreatening],
  )

  return (
    <>
      {/* ---------- monitoring requirement ---------- */}
      <div className="verdict tight" data-sev={a.ecgRequired ? 'warning' : 'info'}>
        <h3>{a.ecgRequired ? 'ECG monitoring required' : 'ECG monitoring not required on drug grounds'}</h3>
        <p className="body" style={{ fontSize: 13 }}>{a.ecgReason}</p>
        {a.offendingDrugs.length > 0 && (
          <div className="strip" style={{ marginTop: 6 }}>
            {a.offendingDrugs.map((d) => (
              <span key={d.id}>{d.name}</span>
            ))}
          </div>
        )}
      </div>
      <Provenance p={ECG_MONITORING_RULE.provenance} />

      {/* ---------- QTcF calculator ---------- */}
      <div className="card">
        <h2>QTcF</h2>
        <div className="sub">
          Enter QTcF directly, or compute it from the QT interval and heart rate.
        </div>
        <div className="grid c3">
          <label className="field">
            QT interval (ms)
            <input
              type="number"
              inputMode="decimal"
              value={qtMs ?? ''}
              onChange={(e) => setQtMs(e.target.value === '' ? undefined : Number(e.target.value))}
            />
          </label>
          <label className="field">
            Heart rate (bpm)
            <input
              type="number"
              inputMode="decimal"
              value={hr ?? ''}
              onChange={(e) => setHr(e.target.value === '' ? undefined : Number(e.target.value))}
            />
          </label>
          <label className="field">
            QTcF in use (ms)
            <input
              type="number"
              inputMode="decimal"
              value={patient.labs.qtc ?? ''}
              onChange={(e) =>
                updateLabs({
                  qtc: e.target.value === '' ? undefined : Number(e.target.value),
                  qtcMethod: 'fridericia',
                })
              }
            />
          </label>
        </div>

        {computedF != null && (
          <>
            <div className="metrics" style={{ marginTop: 12 }}>
              <div className="metric" data-flag={computedF > 480 ? 'true' : 'false'}>
                <div className="k">QTcF — Fridericia</div>
                <div className="v">{computedF.toFixed(0)}</div>
                <div className="n">ms · NTEP uses this</div>
              </div>
              <div className="metric">
                <div className="k">QTcB — Bazett</div>
                <div className="v">{computedB!.toFixed(0)}</div>
                <div className="n">ms · for comparison</div>
              </div>
            </div>
            {Math.abs(computedF - computedB!) >= 15 && (
              <div className="divergence" style={{ marginTop: 8 }}>
                <b>The two corrections differ by {Math.abs(computedF - computedB!).toFixed(0)} ms here.</b>{' '}
                Bazett over-corrects at higher heart rates. Grade on the Fridericia value —
                grading a febrile, tachycardic patient on Bazett can stop a drug that did not
                need stopping.
              </div>
            )}
            <button
              className="primary"
              style={{ marginTop: 10 }}
              onClick={() => updateLabs({ qtc: Math.round(computedF), qtcMethod: 'fridericia' })}
            >
              Use {computedF.toFixed(0)} ms as the patient's QTcF
            </button>
          </>
        )}
        <div style={{ marginTop: 10 }}>
          <Provenance p={QTCF_FORMULA_PROVENANCE} />
        </div>
      </div>

      {/* ---------- grading inputs ---------- */}
      <div className="card compact">
        <div className="section-label" style={{ marginTop: 0 }}>Clinical qualifiers</div>
        <div className="toggle-row">
          <label className="toggle" data-on={confirmedOnTwoEcgs}>
            <input type="checkbox" checked={confirmedOnTwoEcgs} onChange={() => setTwoEcgs((v) => !v)} />
            Confirmed on two separate ECGs
          </label>
          <label className="toggle" data-on={symptomaticArrhythmia}>
            <input type="checkbox" checked={symptomaticArrhythmia} onChange={() => setSympt((v) => !v)} />
            Recurrent or symptomatic arrhythmia
          </label>
          <label className="toggle" data-on={lifeThreatening}>
            <input type="checkbox" checked={lifeThreatening} onChange={() => setLife((v) => !v)} />
            Unstable dysrhythmia / life-threatening
          </label>
        </div>
      </div>

      {/* ---------- grade and actions ---------- */}
      {a.blocked && !a.grade && (
        <div className="verdict tight" data-sev="info">
          <h3>Cannot grade yet</h3>
          <p className="body" style={{ fontSize: 13 }}>{a.blocked}</p>
        </div>
      )}

      {a.grade && (
        <div className="card">
          <div className="verdict tight" data-sev={a.grade.severity}>
            <h3>{a.grade.label}</h3>
            <div className="strip" style={{ marginTop: 4 }}>
              <span>QTcF {a.qtcf} ms</span>
              <span>{a.grade.range}</span>
            </div>
            <p className="body" style={{ fontSize: 13, marginTop: 6 }}>{a.grade.condition}</p>
          </div>

          {a.blocked && (
            <div className="divergence" style={{ marginBottom: 10 }}>
              <b>Note.</b> {a.blocked}
            </div>
          )}

          {a.grade.actions.map((act, i) => (
            <div className="order" key={i} data-urgency={a.grade!.grade >= 3 ? 'immediate' : 'same-day'} data-tone={a.grade!.grade >= 3 ? 'critical' : 'warn'}>
              <div className="verb">{i + 1}</div>
              <div className="main">
                <div className="p">{act}</div>
              </div>
            </div>
          ))}

          {a.electrolyteFlags.length > 0 && a.grade.grade >= 1 && (
            <div className="banner" style={{ marginTop: 10, marginBottom: 0 }}>
              <b>Electrolytes.</b> {a.electrolyteFlags.join('; ')}. Every grade from 1 upwards
              turns on the electrolyte result, so get it before deciding.
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <Provenance p={a.grade.provenance} />
          </div>
        </div>
      )}

      {/* ---------- reference ---------- */}
      <details className="card as-details">
        <summary>All grades and thresholds</summary>
        <div style={{ marginTop: 10 }}>
          {QT_GRADES.map((g) => (
            <div className="order" key={g.grade} data-urgency="routine" data-tone={g.severity === 'critical' ? 'critical' : g.severity === 'warning' ? 'warn' : 'neutral'}>
              <div className="verb" style={{ flexBasis: 92 }}>{g.label.split(' — ')[0]}</div>
              <div className="main">
                <div className="p" style={{ fontSize: 13.5 }}>{g.range}</div>
                <div className="meta">{g.condition}</div>
                <ul className="plain">
                  {g.actions.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </details>

      <details className="card as-details">
        <summary>Supporting measures</summary>
        <ul className="plain" style={{ marginTop: 8 }}>
          {QT_SUPPORTING_MEASURES.map((m) => (
            <li key={m.id}>
              <b>{m.text}.</b> {m.detail ?? ''}
            </li>
          ))}
        </ul>
        <Provenance p={QT_AGENTS_PROVENANCE} />
      </details>
      <CrossLinks from="qt" onNavigate={onNavigate} />

    </>
  )
}

import { useMemo, useState } from 'react'
import { usePatient } from '@/store/patientContext'
import { Provenance } from '@/components/Provenance'
import { CrossLinks } from '@/components/CrossLinks'
import {
  INSHI_ANTECEDENTS,
  INSHI_MAJOR,
  INSHI_MINOR,
  INSHI_PROVENANCE,
  IRIS_ALTERNATIVES,
  IRIS_COUNSELLING,
  IRIS_HARD_RULES,
  IRIS_INVESTIGATIONS,
  IRIS_INVESTIGATIONS_PROVENANCE,
  IRIS_LADDER,
  IRIS_PROPHYLAXIS,
  IRIS_RISK_PROVENANCE,
  IRIS_SIGNATURE,
  NON_HIV_TRIGGERS,
  RIFAMPICIN_STEROID_INTERACTION,
  STEROID_CONTRAINDICATIONS,
  type IrisSeverity,
} from '@/content/iris'
import { assessIris, riskBand, type IrisInput } from '@/engine/iris'

export function IrisModule({ onNavigate }: { onNavigate?: (v: import('@/components/Home').View) => void }) {
  const { patient } = usePatient()
  const [antecedents, setAntecedents] = useState<string[]>([])
  const [major, setMajor] = useState<string[]>([])
  const [minor, setMinor] = useState<string[]>([])
  const [excluded, setExcluded] = useState<string[]>([])
  const [severity, setSeverity] = useState<IrisSeverity | null>(null)
  const [kaposiSuspected, setKaposi] = useState(false)

  const input: IrisInput = useMemo(
    () => ({ antecedents, major, minor, excluded, severity, kaposiSuspected }),
    [antecedents, major, minor, excluded, severity, kaposiSuspected],
  )
  const a = useMemo(() => assessIris(patient, input), [patient, input])
  const risk = riskBand(a.riskScore)

  const toggle = (list: string[], set: (v: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

  return (
    <>
      <div className="banner">
        <b>IRIS is a diagnosis of exclusion.</b> Never label it without excluding drug-resistant
        TB. Treating resistance as inflammation — steroids, regimen unchanged — lets the
        resistant organism progress.
      </div>

      {/* ---------------- INSHI case definition ---------------- */}
      <div className="card compact">
        <h2>INSHI case definition</h2>
        <div className="sub">Paradoxical TB-IRIS. All three antecedents, then 1 major or 2 minor.</div>

        <div className="section-label">Antecedent requirements — all three</div>
        <div className="toggle-row">
          {INSHI_ANTECEDENTS.map((c) => (
            <label key={c.id} className="toggle" data-on={antecedents.includes(c.id)}>
              <input
                type="checkbox"
                checked={antecedents.includes(c.id)}
                onChange={() => toggle(antecedents, setAntecedents, c.id)}
              />
              {c.label}
            </label>
          ))}
        </div>

        <div className="section-label">Major criteria</div>
        <div className="toggle-row">
          {INSHI_MAJOR.map((c) => (
            <label key={c.id} className="toggle" data-on={major.includes(c.id)}>
              <input type="checkbox" checked={major.includes(c.id)} onChange={() => toggle(major, setMajor, c.id)} />
              {c.label}
            </label>
          ))}
        </div>

        <div className="section-label">Minor criteria</div>
        <div className="toggle-row">
          {INSHI_MINOR.map((c) => (
            <label key={c.id} className="toggle" data-on={minor.includes(c.id)}>
              <input type="checkbox" checked={minor.includes(c.id)} onChange={() => toggle(minor, setMinor, c.id)} />
              {c.label}
            </label>
          ))}
        </div>
        <Provenance p={INSHI_PROVENANCE} />
      </div>

      {/* ---------------- verdict ---------------- */}
      <div className="verdict tight" data-sev={a.severity}>
        <h3>
          {a.verdict === 'meets'
            ? 'Meets the INSHI case definition'
            : a.verdict === 'incomplete'
              ? 'Cannot confirm yet'
              : 'Does not meet the case definition'}
        </h3>
        <p className="body" style={{ fontSize: 13 }}>{a.verdictReason}</p>
        <div className="strip" style={{ marginTop: 6 }}>
          <span>Antecedents {antecedents.length}/3</span>
          <span>Major {major.length}</span>
          <span>Minor {minor.length}</span>
          <span>Excluded {excluded.length}/{IRIS_ALTERNATIVES.length}</span>
          <span>Risk {risk.label}</span>
        </div>
        <details className="reveal quiet">
          <summary>Onset, signature and risk</summary>
          <p>{a.onsetReason}</p>
          <p>{a.signature.text}</p>
          {a.riskFactorsPresent.length > 0 && (
            <p><b>Risk factors present:</b> {a.riskFactorsPresent.join('; ')}.</p>
          )}
          <Provenance p={IRIS_RISK_PROVENANCE} />
        </details>
      </div>

      {a.signature.present === true && (
        <div className="card">
          <div className="order" data-urgency="routine" data-tone="good">
            <div className="verb">Signature</div>
            <div className="main">
              <div className="p">{IRIS_SIGNATURE.text}</div>
              <div className="meta">{IRIS_SIGNATURE.detail}</div>
              <Provenance p={IRIS_SIGNATURE.provenance} />
            </div>
          </div>
        </div>
      )}

      {/* ---------------- mandatory exclusions ---------------- */}
      <div className="card">
        <h2>Mandatory exclusions</h2>
        <div className="sub">
          {a.exclusionsComplete
            ? 'All excluded.'
            : `${a.outstandingExclusions} outstanding. The case definition is not satisfied until these are cleared.`}
        </div>
        {IRIS_ALTERNATIVES.map((c) => (
          <div className="order" key={c.id} data-urgency={c.critical ? 'immediate' : 'routine'} data-tone={c.critical ? 'critical' : 'neutral'}>
            <label className="toggle" data-on={excluded.includes(c.id)} style={{ flex: 'none' }}>
              <input
                type="checkbox"
                checked={excluded.includes(c.id)}
                onChange={() => toggle(excluded, setExcluded, c.id)}
              />
              {excluded.includes(c.id) ? 'done' : 'todo'}
            </label>
            <div className="main">
              <div className="p">
                {c.text}
                {c.critical && <span className="pill-critical">critical</span>}
              </div>
              <div className="meta">{c.discriminator}</div>
              <div className="meta" style={{ fontFamily: 'var(--mono)', fontSize: 11.5 }}>
                {c.tests.join(' · ')}
              </div>
              {c.detail && <div className="meta detail">{c.detail}</div>}
              <Provenance p={c.provenance} />
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- management ---------------- */}
      <div className="card">
        <h2>Management</h2>
        <div className="sub">These rules hold regardless of severity.</div>
        {IRIS_HARD_RULES.map((r) => (
          <div className="order" key={r.id} data-urgency="immediate" data-tone="critical">
            <div className="verb">Rule</div>
            <div className="main">
              <div className="p">{r.text}</div>
              {r.detail && <div className="meta">{r.detail}</div>}
              <Provenance p={r.provenance} />
            </div>
          </div>
        ))}

        <div className="section-label">Severity</div>
        <div className="toggle-row">
          {IRIS_LADDER.map((t) => (
            <label key={t.severity} className="toggle" data-on={severity === t.severity}>
              <input
                type="radio"
                checked={severity === t.severity}
                onChange={() => setSeverity(t.severity)}
              />
              {t.label}
            </label>
          ))}
          <label className="toggle" data-on={kaposiSuspected}>
            <input type="checkbox" checked={kaposiSuspected} onChange={() => setKaposi((v) => !v)} />
            Kaposi sarcoma suspected
          </label>
        </div>

        {a.treatment && (
          <>
            <div className="verdict tight" data-sev={a.treatment.uiSeverity} style={{ marginTop: 12 }}>
              <h3>{a.treatment.label}</h3>
              <p className="body" style={{ fontSize: 13 }}>{a.treatment.definition}</p>
              <p className="body" style={{ fontSize: 14, fontWeight: 600 }}>{a.treatment.treatment}</p>
            </div>
            <Provenance p={a.treatment.provenance} />

            {a.steroidBlockers.length > 0 && a.treatment.severity !== 'mild' && (
              <div className="verdict tight" data-sev="critical" style={{ marginTop: 10 }}>
                <h3>Do not give steroids yet</h3>
                <ul className="plain">
                  {a.steroidBlockers.map((b, i) => (
                    <li key={i} style={{ color: 'inherit' }}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {a.treatment.severity !== 'mild' && (
              <div className="divergence" style={{ marginTop: 10 }}>
                <b>Dose looks high but is not.</b> {RIFAMPICIN_STEROID_INTERACTION.detail}
              </div>
            )}
          </>
        )}

        <details className="reveal quiet" style={{ marginTop: 10 }}>
          <summary>Steroid contraindications</summary>
          <ul className="plain" style={{ marginTop: 6 }}>
            {STEROID_CONTRAINDICATIONS.map((c) => (
              <li key={c.id}>
                <b>{c.text}.</b> {c.detail ?? ''}
              </li>
            ))}
          </ul>
          <Provenance p={STEROID_CONTRAINDICATIONS[0].provenance} />
        </details>
      </div>

      {/* ---------------- prevention ---------------- */}
      <div className="card">
        <h2>Prevention and ART timing</h2>
        {a.artTiming && (
          <div className="verdict tight" data-sev={a.artTiming.uiSeverity}>
            <h3>{a.artTiming.condition}: {a.artTiming.rule}</h3>
            <p className="body" style={{ fontSize: 13 }}>{a.artTiming.rationale}</p>
          </div>
        )}
        {a.artTiming && <Provenance p={a.artTiming.provenance} />}

        {a.prophylaxisIndicated && (
          <div className="order" data-urgency="same-day" data-tone="warn" style={{ marginTop: 10 }}>
            <div className="verb">Prophylaxis</div>
            <div className="main">
              <div className="p">{IRIS_PROPHYLAXIS.text}</div>
              <div className="meta">{IRIS_PROPHYLAXIS.detail}</div>
              <Provenance p={IRIS_PROPHYLAXIS.provenance} />
            </div>
          </div>
        )}

        <div className="order" data-urgency="routine" data-tone="neutral">
          <div className="verb">Counsel</div>
          <div className="main">
            <div className="p">{IRIS_COUNSELLING.text}</div>
            <div className="meta">{IRIS_COUNSELLING.detail}</div>
            <Provenance p={IRIS_COUNSELLING.provenance} />
          </div>
        </div>
      </div>

      <details className="card as-details">
        <summary>Investigations and expected findings</summary>
        <div style={{ marginTop: 10 }}>
          {IRIS_INVESTIGATIONS.map((i) => (
            <div className="order" key={i.test} data-urgency="routine" data-tone="neutral">
              <div className="verb" style={{ flexBasis: 150 }}>{i.test}</div>
              <div className="main">
                <div className="p" style={{ fontSize: 13.5 }}>{i.expected}</div>
                <div className="meta">{i.why}</div>
              </div>
            </div>
          ))}
          <Provenance p={IRIS_INVESTIGATIONS_PROVENANCE} />
        </div>
      </details>

      <details className="card as-details">
        <summary>IRIS without HIV</summary>
        <p className="note" style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 8 }}>
          {NON_HIV_TRIGGERS.text}
        </p>
        <p className="note" style={{ fontSize: 13, color: 'var(--text-2)' }}>
          {NON_HIV_TRIGGERS.detail}
        </p>
        <Provenance p={NON_HIV_TRIGGERS.provenance} />
      </details>
      <CrossLinks from="iris" onNavigate={onNavigate} />

    </>
  )
}

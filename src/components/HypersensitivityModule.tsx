import { useMemo, useState } from 'react'
import { Provenance } from '@/components/Provenance'
import { CrossLinks } from '@/components/CrossLinks'
import {
  ABSOLUTE_CONTRAINDICATIONS,
  ACUTE_MANAGEMENT,
  ACUTE_PROVENANCE,
  BRIDGE_NEEDED_IF,
  BRIDGE_REGIMEN,
  BRIDGE_RULES,
  BRIDGE_SAFE_TO_WAIT,
  CULPRIT_RANKING,
  CULPRIT_SUMMARY,
  DESENSITISATION_LADDER,
  DESENSITISATION_PROCEDURE,
  DESENSITISATION_SEQUENCE,
  DRESS_VS_TEN,
  DRESS_VS_TEN_PROVENANCE,
  HIGH_RISK_FEATURES,
  LADDER_CAVEAT,
  LOW_RISK_FEATURES,
  MANOEUVRES,
  ONLY_TYPE_I,
  REACTION_TYPES,
  RED_FLAG_PROVENANCE,
  RED_FLAG_SIGNS,
  REEXPOSURE_WARNING,
  REINTRODUCTION_RULES,
  REINTRODUCTION_SCHEDULE,
  RELATIVE_CONTRAINDICATIONS_HS,
  SCAR_ONE_LINER,
  SCORTEN_CAVEAT,
  SCORTEN_CRITERIA,
  SCORTEN_MORTALITY,
  TEN_MANAGEMENT_KEY,
  TOLERANCE_IS_TEMPORARY,
} from '@/content/hypersensitivity'

type Pathway = 'unknown' | 'rechallenge' | 'desensitise' | 'never'

export function HypersensitivityModule({ onNavigate }: { onNavigate?: (v: import('@/components/Home').View) => void }) {
  const [redFlags, setRedFlags] = useState<string[]>([])
  const [typeOne, setTypeOne] = useState(false)
  const [indispensable, setIndispensable] = useState(false)
  const [scorten, setScorten] = useState<string[]>([])

  const toggle = (list: string[], set: (v: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

  const pathway: Pathway = useMemo(() => {
    if (redFlags.length > 0) return 'never'
    if (typeOne && indispensable) return 'desensitise'
    if (typeOne) return 'unknown'
    return 'rechallenge'
  }, [redFlags, typeOne, indispensable])

  const scortenBand = useMemo(() => {
    const n = scorten.length
    if (n <= 1) return SCORTEN_MORTALITY[0]
    if (n === 2) return SCORTEN_MORTALITY[1]
    if (n === 3) return SCORTEN_MORTALITY[2]
    if (n === 4) return SCORTEN_MORTALITY[3]
    return SCORTEN_MORTALITY[4]
  }, [scorten])

  return (
    <>
      <div className="verdict tight" data-sev="info">
        <h3>{SCAR_ONE_LINER.text}</h3>
        <p className="body" style={{ fontSize: 13 }}>{SCAR_ONE_LINER.detail}</p>
      </div>

      {/* ---------- red flags first ---------- */}
      <div className="card">
        <h2>Red flags — check these before anything else</h2>
        <div className="sub">
          Any one of these moves the patient out of the rechallengeable group instantly.
        </div>
        {RED_FLAG_SIGNS.map((f) => (
          <div className="order" key={f.sign} data-urgency="immediate" data-tone={redFlags.includes(f.sign) ? 'critical' : 'neutral'}>
            <label className="toggle" data-on={redFlags.includes(f.sign)} style={{ flex: 'none' }}>
              <input
                type="checkbox"
                checked={redFlags.includes(f.sign)}
                onChange={() => toggle(redFlags, setRedFlags, f.sign)}
              />
              {redFlags.includes(f.sign) ? 'present' : 'absent'}
            </label>
            <div className="main">
              <div className="p" style={{ fontSize: 13.5 }}>{f.sign}</div>
              <div className="meta">{f.means}</div>
            </div>
          </div>
        ))}
        <Provenance p={RED_FLAG_PROVENANCE} />
      </div>

      {/* ---------- pathway ---------- */}
      <div className="card compact">
        <div className="section-label" style={{ marginTop: 0 }}>Reaction character</div>
        <div className="toggle-row">
          <label className="toggle" data-on={typeOne}>
            <input type="checkbox" checked={typeOne} onChange={() => setTypeOne((v) => !v)} />
            Type I — urticaria, bronchospasm or anaphylaxis within 1–6 h
          </label>
          <label className="toggle" data-on={indispensable}>
            <input type="checkbox" checked={indispensable} onChange={() => setIndispensable((v) => !v)} />
            The drug cannot be spared
          </label>
        </div>
      </div>

      <div
        className="verdict tight"
        data-sev={pathway === 'never' ? 'critical' : pathway === 'desensitise' ? 'warning' : pathway === 'rechallenge' ? 'ok' : 'caution'}
      >
        <h3>
          {pathway === 'never'
            ? 'NEVER rechallenge or desensitise'
            : pathway === 'desensitise'
              ? 'Rapid desensitisation, in HDU or ICU'
              : pathway === 'rechallenge'
                ? 'Sequential rechallenge to identify the culprit'
                : 'Type I without an indispensable drug — substitute rather than desensitise'}
        </h3>
        <p className="body" style={{ fontSize: 13 }}>
          {pathway === 'never'
            ? `${redFlags.length} red flag${redFlags.length === 1 ? '' : 's'} present. ${REEXPOSURE_WARNING.detail}`
            : pathway === 'desensitise'
              ? 'Only justified when the drug is indispensable and the phenotype is genuinely type I. Everything below applies.'
              : pathway === 'rechallenge'
                ? 'Low-risk phenotype. Identify the culprit, then drop only that drug.'
                : 'Desensitisation carries real risk. If the drug can be replaced, replace it.'}
        </p>
      </div>

      {pathway === 'never' && (
        <div className="card">
          <h2>Absolute contraindications to any re-exposure</h2>
          <ul className="plain">
            {ABSOLUTE_CONTRAINDICATIONS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <Provenance p={REEXPOSURE_WARNING.provenance} />
        </div>
      )}

      {/* ---------- acute management ---------- */}
      <div className="card">
        <h2>Immediate management</h2>
        {ACUTE_MANAGEMENT.map((s, i) => (
          <div className="order" key={s.step} data-urgency={i < 2 ? 'immediate' : 'same-day'} data-tone={i < 2 ? 'critical' : 'warn'}>
            <div className="verb">{i + 1}</div>
            <div className="main">
              <div className="p">{s.step}</div>
              <div className="meta">{s.detail}</div>
              <div className="meta detail">Pitfall: {s.pitfall}</div>
            </div>
          </div>
        ))}
        <Provenance p={ACUTE_PROVENANCE} />
      </div>

      {/* ---------- bridging ---------- */}
      <div className="card">
        <h2>Bridging regimen</h2>
        <div className="grid c2">
          <div>
            <div className="section-label" style={{ marginTop: 0 }}>Bridge needed</div>
            <ul className="plain">
              {BRIDGE_NEEDED_IF.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="section-label" style={{ marginTop: 0 }}>Safe to wait drug-free</div>
            <ul className="plain">
              {BRIDGE_SAFE_TO_WAIT.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="section-label">The bridge — at least three drugs not under suspicion</div>
        <ul className="plain">
          {BRIDGE_REGIMEN.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        {BRIDGE_RULES.map((r) => (
          <div className="order" key={r.id} data-urgency="immediate" data-tone="critical">
            <div className="verb" style={{ flexBasis: 0, display: 'none' }} />
            <div className="main">
              <div className="p">{r.text}</div>
              <div className="meta">{r.detail}</div>
              <Provenance p={r.provenance} />
            </div>
          </div>
        ))}
      </div>

      {/* ---------- reintroduction ---------- */}
      {pathway !== 'never' && (
        <div className="card">
          <h2>Sequential reintroduction</h2>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Drug</th>
                  <th>Day 1</th>
                  <th>Day 2</th>
                  <th>Day 3</th>
                </tr>
              </thead>
              <tbody>
                {REINTRODUCTION_SCHEDULE.map((d) => (
                  <tr key={d.drug}>
                    <td data-first="true">{d.order}</td>
                    <td>{d.drug}</td>
                    <td>{d.day1}</td>
                    <td>{d.day2}</td>
                    <td>{d.day3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="section-label">Why this order</div>
          <ul className="plain">
            {REINTRODUCTION_SCHEDULE.map((d) => (
              <li key={d.drug}>
                <b>{d.drug}.</b> {d.why}
              </li>
            ))}
          </ul>
          {REINTRODUCTION_RULES.map((r) => (
            <div className="order" key={r.id} data-urgency="routine" data-tone={r.id === 'reintro.fdc' ? 'warn' : 'neutral'}>
              <div className="verb" style={{ flexBasis: 0, display: 'none' }} />
              <div className="main">
                <div className="p" style={{ fontSize: 13.5 }}>{r.text}</div>
                {r.detail && <div className="meta">{r.detail}</div>}
                <Provenance p={r.provenance} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- desensitisation ---------- */}
      {pathway === 'desensitise' && (
        <div className="card">
          <h2>Rapid desensitisation</h2>
          <div className="divergence" style={{ marginBottom: 12 }}>
            <b>{LADDER_CAVEAT.text}.</b> {LADDER_CAVEAT.detail}
          </div>

          {DESENSITISATION_PROCEDURE.map((s, i) => (
            <div className="order" key={s.step} data-urgency={i < 3 ? 'immediate' : 'same-day'} data-tone={i < 3 ? 'critical' : 'warn'}>
              <div className="verb">{i + 1}</div>
              <div className="main">
                <div className="p">{s.step}</div>
                <div className="meta">{s.detail}</div>
                <div className="meta detail">Pitfall: {s.pitfall}</div>
              </div>
            </div>
          ))}

          <div className="section-label">Representative oral dose ladders (mg)</div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Isoniazid</th>
                  <th>Rifampicin</th>
                  <th>Pyrazinamide</th>
                  <th>Ethambutol</th>
                </tr>
              </thead>
              <tbody>
                {DESENSITISATION_LADDER.map((r) => (
                  <tr key={r.step}>
                    <td data-first="true">{r.step}</td>
                    <td>{r.isoniazid}</td>
                    <td>{r.rifampicin}</td>
                    <td>{r.pyrazinamide}</td>
                    <td>{r.ethambutol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="order" data-urgency="immediate" data-tone="critical">
            <div className="verb" style={{ flexBasis: 0, display: 'none' }} />
            <div className="main">
              <div className="p">{DESENSITISATION_SEQUENCE.text}</div>
              <div className="meta">{DESENSITISATION_SEQUENCE.detail}</div>
              <Provenance p={DESENSITISATION_SEQUENCE.provenance} />
            </div>
          </div>
          <div className="order" data-urgency="immediate" data-tone="critical">
            <div className="verb" style={{ flexBasis: 0, display: 'none' }} />
            <div className="main">
              <div className="p">{TOLERANCE_IS_TEMPORARY.text}</div>
              <div className="meta">{TOLERANCE_IS_TEMPORARY.detail}</div>
              <Provenance p={TOLERANCE_IS_TEMPORARY.provenance} />
            </div>
          </div>
        </div>
      )}

      {/* ---------- SCORTEN ---------- */}
      <details className="card as-details">
        <summary>SCORTEN — prognosis in epidermal necrolysis</summary>
        <div className="toggle-row" style={{ marginTop: 10 }}>
          {SCORTEN_CRITERIA.map((c) => (
            <label key={c.id} className="toggle" data-on={scorten.includes(c.id)}>
              <input
                type="checkbox"
                checked={scorten.includes(c.id)}
                onChange={() => toggle(scorten, setScorten, c.id)}
              />
              {c.label}
            </label>
          ))}
        </div>
        <div className="verdict tight" data-sev={scortenBand.severity} style={{ marginTop: 12 }}>
          <h3>SCORTEN {scorten.length} — predicted mortality {scortenBand.mortality}</h3>
          <p className="body" style={{ fontSize: 13 }}>{scortenBand.action}</p>
        </div>
        <div className="divergence">
          <b>{SCORTEN_CAVEAT.text}.</b> {SCORTEN_CAVEAT.detail}
        </div>
        <Provenance p={SCORTEN_CAVEAT.provenance} />
      </details>

      {/* ---------- DRESS vs TEN ---------- */}
      <details className="card as-details">
        <summary>DRESS versus SJS/TEN — telling them apart</summary>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Feature</th>
                <th>DRESS</th>
                <th>SJS / TEN</th>
              </tr>
            </thead>
            <tbody>
              {DRESS_VS_TEN.map((r) => (
                <tr key={r.feature}>
                  <td data-first="true">{r.feature}</td>
                  <td>{r.dress}</td>
                  <td>{r.ten}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Provenance p={DRESS_VS_TEN_PROVENANCE} />

        <div className="section-label">Management points that are easy to get wrong</div>
        {TEN_MANAGEMENT_KEY.map((k) => (
          <div className="order" key={k.id} data-urgency="same-day" data-tone="warn">
            <div className="verb" style={{ flexBasis: 0, display: 'none' }} />
            <div className="main">
              <div className="p" style={{ fontSize: 13.5 }}>{k.text}</div>
              {k.detail && <div className="meta">{k.detail}</div>}
              <Provenance p={k.provenance} />
            </div>
          </div>
        ))}
      </details>

      {/* ---------- reference ---------- */}
      <details className="card as-details">
        <summary>Mechanism, and which reactions can be desensitised</summary>
        <div className="divergence" style={{ marginTop: 10 }}>
          <b>{ONLY_TYPE_I.text}.</b> {ONLY_TYPE_I.detail}
        </div>
        {REACTION_TYPES.map((t) => (
          <div className="order" key={t.id} data-urgency="routine" data-tone={t.bar === 'absolute' ? 'critical' : t.desensitisable ? 'warn' : 'neutral'}>
            <div className="verb" style={{ flexBasis: 78 }}>
              {t.bar === 'absolute' ? 'Never' : t.desensitisable ? 'Type I' : 'Delayed'}
            </div>
            <div className="main">
              <div className="p" style={{ fontSize: 13.5 }}>{t.type}</div>
              <div className="meta">{t.mechanism}</div>
              <ul className="plain">
                {t.presentations.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className="meta detail">Culprit: {t.culprit}</div>
              <Provenance p={t.provenance} />
            </div>
          </div>
        ))}
      </details>

      <details className="card as-details">
        <summary>Which drug is the culprit — it depends on the reaction</summary>
        <div className="verdict tight" data-sev="info" style={{ marginTop: 10 }}>
          <h3>{CULPRIT_SUMMARY.text}</h3>
          <p className="body" style={{ fontSize: 13 }}>{CULPRIT_SUMMARY.detail}</p>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Reaction type</th>
                <th>Leader</th>
                <th>Order</th>
                <th>Why it matters</th>
              </tr>
            </thead>
            <tbody>
              {CULPRIT_RANKING.map((r) => (
                <tr key={r.reaction}>
                  <td data-first="true">{r.reaction}</td>
                  <td>{r.leader}</td>
                  <td>{r.order}</td>
                  <td>{r.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Provenance p={CULPRIT_SUMMARY.provenance} />
      </details>

      <details className="card as-details">
        <summary>Three manoeuvres that get confused, and risk phenotypes</summary>
        <div className="tbl-wrap" style={{ marginTop: 10 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Manoeuvre</th>
                <th>What is done</th>
                <th>Basis</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {MANOEUVRES.map((m) => (
                <tr key={m.name}>
                  <td data-first="true">{m.name}</td>
                  <td>{m.what}</td>
                  <td>{m.basis}</td>
                  <td>{m.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid c2" style={{ marginTop: 12 }}>
          <div>
            <div className="section-label" style={{ marginTop: 0 }}>Low-risk phenotype</div>
            <ul className="plain">
              {LOW_RISK_FEATURES.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="section-label" style={{ marginTop: 0 }}>High-risk phenotype</div>
            <ul className="plain">
              {HIGH_RISK_FEATURES.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="section-label">Relative contraindications to desensitisation</div>
        <ul className="plain">
          {RELATIVE_CONTRAINDICATIONS_HS.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </details>
      <CrossLinks from="hypersensitivity" onNavigate={onNavigate} />

    </>
  )
}

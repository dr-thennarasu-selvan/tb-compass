import { useMemo } from 'react'
import { usePatient } from '@/store/patientContext'
import { Provenance } from '@/components/Provenance'
import { CrossLinks } from '@/components/CrossLinks'
import { evaluateAll, type EvaluatedCriterion, type RegimenEligibility } from '@/engine/drtb'
import { PACK_LABEL } from '@/types/content'

const MARK: Record<EvaluatedCriterion['result'], string> = {
  met: '✓',
  'not-met': '×',
  unknown: '?',
}

function CriterionRow({ e }: { e: EvaluatedCriterion }) {
  return (
    <div className="crit" data-result={e.result}>
      <span className="mark">{MARK[e.result]}</span>
      <div className="main">
        <div className="p">{e.criterion.label}</div>
        <div className="meta">{e.because}</div>
        {e.criterion.detail && <div className="meta detail">{e.criterion.detail}</div>}
        <Provenance p={e.criterion.provenance} />
      </div>
    </div>
  )
}

function RegimenBlock({ r }: { r: RegimenEligibility }) {
  const { regimen, verdict, evaluated, blockers, unknowns } = r
  return (
    <div className="card">
      <div className="rhead">
        <span className="shorthand">{regimen.name}</span>
        <span className="packtag">{PACK_LABEL.ntep}</span>
        <span className="dur">{regimen.durationText}</span>
        <span className="verdict-pill" data-v={verdict}>
          {verdict === 'eligible'
            ? 'eligible'
            : verdict === 'not-eligible'
              ? 'not eligible'
              : 'indeterminate'}
        </span>
      </div>

      <div className="meta" style={{ fontFamily: 'var(--mono)', marginBottom: 10 }}>
        {regimen.shorthand}
      </div>

      {verdict === 'not-eligible' && (
        <div className="blocked" style={{ marginBottom: 10 }}>
          <div className="p">Blocked by {blockers.length === 1 ? 'this' : 'these'}</div>
          <ul className="plain">
            {blockers.map((b) => (
              <li key={b.criterion.id}>{b.because}</li>
            ))}
          </ul>
        </div>
      )}

      {verdict === 'indeterminate' && (
        <div className="banner" style={{ marginBottom: 10 }}>
          <b>Cannot decide yet.</b> Nothing disqualifies this regimen, but{' '}
          {unknowns.length} criteri{unknowns.length === 1 ? 'on is' : 'a are'} unresolved:{' '}
          {unknowns.map((u) => u.missing).filter(Boolean).join(', ')}.
        </div>
      )}

      <details className="reveal quiet">
        <summary>Criteria ({evaluated.filter((e) => e.result === 'met').length}/{evaluated.length} met)</summary>
        <div style={{ marginTop: 8 }}>
          {evaluated.map((e) => (
            <CriterionRow key={e.criterion.id} e={e} />
          ))}
        </div>
      </details>

      <details className="reveal quiet">
        <summary>Dosing</summary>
        <div style={{ marginTop: 6 }}>
          {regimen.dosing.map((d, i) => (
            <div className="phase" key={i}>
              <div className="pl">{d.drug}</div>
              <div className="pd" style={{ fontWeight: 500 }}>{d.text}</div>
            </div>
          ))}
        </div>
      </details>

      <details className="reveal quiet">
        <summary>Notes</summary>
        <ul className="plain" style={{ marginTop: 6 }}>
          {regimen.notes.map((n, i) => (
            <li key={i} className={n.startsWith('CAUTION') ? 'caution-note' : undefined}>
              {n}
            </li>
          ))}
        </ul>
        <Provenance p={regimen.provenance} />
      </details>
    </div>
  )
}

export function DrTbModule({ onNavigate }: { onNavigate?: (v: import('@/components/Home').View) => void }) {
  const { patient, pack } = usePatient()
  const results = useMemo(() => evaluateAll(patient), [patient])

  const eligible = results.filter((r) => r.verdict === 'eligible')
  const indeterminate = results.filter((r) => r.verdict === 'indeterminate')

  return (
    <>
      {pack !== 'ntep' && (
        <div className="banner">
          <b>These regimens are NTEP.</b> The active pack is {PACK_LABEL[pack]}. WHO's DR-TB
          regimens have not been authored yet — switch the pack in the header, or read this as
          NTEP content regardless.
        </div>
      )}

      <div className="verdict tight" data-sev={eligible.length > 0 ? 'ok' : indeterminate.length > 0 ? 'caution' : 'warning'}>
        <h3>
          {eligible.length > 0
            ? `${eligible[0].regimen.name} — first eligible in NTEP preference order`
            : indeterminate.length > 0
              ? 'No regimen confirmed yet'
              : 'No regimen eligible on the recorded context'}
        </h3>
        <p className="body" style={{ fontSize: 13 }}>
          {eligible.length > 0
            ? 'Confirm the criteria that the patient context cannot capture before prescribing.'
            : 'Fill in the missing fields below, or resolve the blockers.'}
        </p>
      </div>

      {results.map((r) => (
        <RegimenBlock key={r.regimen.id} r={r} />
      ))}
      <CrossLinks from="drtb" onNavigate={onNavigate} />

    </>
  )
}

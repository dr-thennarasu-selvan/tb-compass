import { useMemo } from 'react'
import { usePatient } from '@/store/patientContext'
import { Provenance } from '@/components/Provenance'
import { CrossLinks } from '@/components/CrossLinks'
import type { View } from '@/components/Home'
import type { Statement } from '@/types/content'
import { assessDiabetes } from '@/engine/diabetes'
import {
  ABSORPTION,
  CONTROL,
  REGIMEN_DR,
  REGIMEN_DS,
  SCREENING,
  TOXICITY,
  TRIAGE_GLUCOSE,
  UNCONTROLLED,
} from '@/content/diabetes'

const DR_CLASSES = ['rr-tb', 'mdr-tb', 'pre-xdr-tb', 'xdr-tb']

function Row({ s, verb, tone = 'neutral' }: { s: Statement; verb?: string; tone?: string }) {
  return (
    <div className="order" data-urgency="routine" data-tone={tone}>
      {verb ? <div className="verb">{verb}</div> : <div className="verb" style={{ display: 'none' }} />}
      <div className="main">
        <div className="p" style={{ fontSize: 13.5 }}>{s.text}</div>
        {s.detail && <div className="meta">{s.detail}</div>}
        <Provenance p={s.provenance} />
      </div>
    </div>
  )
}

export function DiabetesModule({ onNavigate }: { onNavigate?: (v: View) => void }) {
  const { patient, update } = usePatient()
  const a = useMemo(() => assessDiabetes(patient), [patient])
  const dr = patient.classification ? DR_CLASSES.includes(patient.classification) : false
  const onDrug = (ids: string[]) => ids.some((d) => patient.currentDrugs.includes(d))
  const tox = [...TOXICITY].sort((x, y) => Number(onDrug(y.drugIds)) - Number(onDrug(x.drugIds)))

  return (
    <>
      {/* ---------- where screening stands ---------- */}
      <div className="verdict tight" data-sev={a.severity}>
        <h3>{a.headline}</h3>
        <p className="body" style={{ fontSize: 13 }}>{a.detail}</p>
        {!patient.diabetes && (
          <button className="need-jump" style={{ marginTop: 8 }} onClick={() => update({ diabetes: true })}>
            Mark as known diabetes
          </button>
        )}
      </div>

      <div className="card">
        <h2>Screening</h2>
        <Row s={SCREENING} verb="SEND" tone={a.step === 'not-screened' || a.step === 'follow-up-needed' ? 'warn' : 'neutral'} />
        <Row s={TRIAGE_GLUCOSE.statement} verb="TRIAGE" tone={a.triageHits.length ? 'warn' : 'neutral'} />
        <Row s={UNCONTROLLED} verb="ADMIT" />
      </div>

      {(a.applies || patient.diabetes) && (
        <>
          <div className="card">
            <h2>Glycaemic control</h2>
            {CONTROL.map((s) => (
              <Row key={s.id} s={s} />
            ))}
            {onNavigate && (
              <button className="jump" onClick={() => onNavigate('interactions')}>
                Check the diabetes drugs against the regimen →
              </button>
            )}
          </div>

          <div className="card">
            <h2>Toxicity diabetes makes worse</h2>
            <div className="sub">Rows for drugs this patient is on are highlighted and listed first.</div>
            {tox.map((t) => (
              <Row key={t.s.id} s={t.s} verb={t.verb} tone={onDrug(t.drugIds) ? 'warn' : 'neutral'} />
            ))}
          </div>

          <div className="card">
            <h2>Regimen and duration</h2>
            {!dr && REGIMEN_DS.map((s) => <Row key={s.id} s={s} />)}
            {dr && <Row s={REGIMEN_DR} />}
            {!patient.classification && <Row s={REGIMEN_DR} />}
          </div>

          <div className="card compact">
            <Row s={ABSORPTION} verb="IF SLOW" />
          </div>
        </>
      )}

      <CrossLinks from="diabetes" onNavigate={onNavigate} />
    </>
  )
}

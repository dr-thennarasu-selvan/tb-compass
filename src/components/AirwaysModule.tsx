import { useMemo } from 'react'
import { usePatient } from '@/store/patientContext'
import { Provenance } from '@/components/Provenance'
import { CrossLinks } from '@/components/CrossLinks'
import type { View } from '@/components/Home'
import type { Statement } from '@/types/content'
import { assessAirways } from '@/engine/airways'
import {
  DIAGNOSIS,
  ICS_AGAINST,
  ICS_ASTHMA,
  ICS_BRONCHIECTASIS,
  ICS_DURING_TB_GAP,
  ICS_RISK,
  INHALER_INTERACTION_GAP,
  LINKS,
  ON_TREATMENT,
  PTLD_ASSESS,
  PTLD_WHAT,
  RED_FLAGS,
  SEVERE,
} from '@/content/airways'

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

export function AirwaysModule({ onNavigate }: { onNavigate?: (v: View) => void }) {
  const { patient } = usePatient()
  const a = useMemo(() => assessAirways(patient), [patient])

  return (
    <>
      <div className="banner">
        <b>International sources.</b> Most of this module comes from GOLD 2026 and GINA 2026 (strategy documents,
        not NTEP policy) and the 2021 clinical standards for post-TB lung disease. NTEP lines are marked by their
        citation.
      </div>

      {/* ---------- inhaled corticosteroids: the decision that differs most by patient ---------- */}
      <div className="card">
        <h2>Inhaled corticosteroids</h2>
        {a.icsEssential && (
          <div className="verdict tight" data-sev="info">
            <h3>{ICS_ASTHMA.text}</h3>
            <p className="body" style={{ fontSize: 13 }}>{ICS_ASTHMA.detail}</p>
          </div>
        )}
        {a.icsEssential && <Provenance p={ICS_ASTHMA.provenance} />}

        <Row s={ICS_RISK} verb="CAUTION" tone={a.icsCaution ? 'warn' : 'neutral'} />
        {patient.copd && <Row s={ICS_AGAINST} verb="COPD" tone="warn" />}
        {patient.copd && <Row s={ICS_BRONCHIECTASIS} verb="COPD" />}
        {!a.applies && (
          <>
            <Row s={ICS_ASTHMA} verb="ASTHMA" />
            <Row s={ICS_AGAINST} verb="COPD" />
          </>
        )}

        {(patient.onInhaledSteroid || !a.applies) && (
          <div className="unauthored" style={{ marginTop: 10 }}>
            <div className="p">{ICS_DURING_TB_GAP.title}</div>
            <div className="meta">{ICS_DURING_TB_GAP.body}</div>
          </div>
        )}
      </div>

      {/* ---------- diagnosis ---------- */}
      <div className="card">
        <h2>Don’t miss TB behind the airways label</h2>
        <div className="verdict tight" data-sev="warning">
          <h3>{RED_FLAGS.text}</h3>
          <p className="body" style={{ fontSize: 13 }}>{RED_FLAGS.detail}</p>
        </div>
        <Provenance p={RED_FLAGS.provenance} />
        {onNavigate && (
          <button className="jump" onClick={() => onNavigate('cascade')}>
            Open the diagnostic pathway →
          </button>
        )}
        <div style={{ marginTop: 8 }}>
          {DIAGNOSIS.map((s) => (
            <Row key={s.id} s={s} />
          ))}
          {LINKS.map((s) => (
            <Row key={s.id} s={s} tone={s.id === 'aw.smoking' && patient.smoker ? 'warn' : 'neutral'} />
          ))}
        </div>
      </div>

      {/* ---------- during TB treatment ---------- */}
      <div className="card">
        <h2>During TB treatment</h2>
        {ON_TREATMENT.map((s) => (
          <Row key={s.id} s={s} />
        ))}
        <p className="note">{INHALER_INTERACTION_GAP}</p>
        {onNavigate && (
          <button className="jump" onClick={() => onNavigate('interactions')}>
            Check this patient’s inhalers and other medicines →
          </button>
        )}
      </div>

      <div className="card compact">
        <div className="section-label" style={{ marginTop: 0 }}>When to admit (NTEP)</div>
        {SEVERE.map((s) => (
          <Row key={s.id} s={s} />
        ))}
      </div>

      {/* ---------- end of treatment ---------- */}
      <div className="card">
        <h2>At the end of TB treatment</h2>
        <div className="sub">{PTLD_WHAT.text}.</div>
        <p className="meta" style={{ margin: '0 0 6px' }}>{PTLD_WHAT.detail}</p>
        <Provenance p={PTLD_WHAT.provenance} />
        <div style={{ marginTop: 8 }}>
          {PTLD_ASSESS.map((o) => (
            <Row
              key={o.s.id}
              s={o.s}
              verb={o.verb}
              tone={o.verb === 'REFER' && (patient.copd || patient.asthma) ? 'warn' : 'neutral'}
            />
          ))}
        </div>
      </div>

      <CrossLinks from="airways" onNavigate={onNavigate} />
    </>
  )
}

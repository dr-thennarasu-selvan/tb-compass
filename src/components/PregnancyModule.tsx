import { useMemo } from 'react'
import { usePatient } from '@/store/patientContext'
import { Provenance } from '@/components/Provenance'
import { CrossLinks } from '@/components/CrossLinks'
import type { View } from '@/components/Home'
import type { Statement } from '@/types/content'
import { PACK_LABEL } from '@/types/content'
import { assessPregnancy } from '@/engine/pregnancy'
import {
  BECAME_PREGNANT_ON_TREATMENT,
  BREASTFEEDING,
  CHILDBEARING_AGE,
  COUNSELLING,
  DSTB_BREASTFEEDING,
  DSTB_ORDERS,
  DSTB_PYRAZINAMIDE,
  DSTB_REGIMEN,
  MONITORING,
  MONITORING_ETO,
  MTP_THRESHOLD,
  NEWBORN,
  NTEP_PATHWAY_PROVENANCE,
  PACK_OPTIONS,
  PREGNANCY_DRUGS,
  WHO_REGIMENS,
  type PregnancyStance,
} from '@/content/pregnancy'

const STANCE_LABEL: Record<PregnancyStance, string> = {
  barred: 'Avoid',
  conditional: 'Restricted',
  caution: 'Caution',
  preferred: 'Preferred',
  usable: 'Usable',
}

const STANCE_TONE: Record<PregnancyStance, string> = {
  barred: 'critical',
  conditional: 'warn',
  caution: 'neutral',
  preferred: 'good',
  usable: 'good',
}

function StatementRow({ s, n, tone = 'neutral' }: { s: Statement; n?: number; tone?: string }) {
  return (
    <div className="order" data-urgency="routine" data-tone={tone}>
      {n != null ? <div className="verb">{n}</div> : <div className="verb" style={{ display: 'none' }} />}
      <div className="main">
        <div className="p" style={{ fontSize: 13.5 }}>{s.text}</div>
        {s.detail && <div className="meta">{s.detail}</div>}
        <Provenance p={s.provenance} />
      </div>
    </div>
  )
}

function MtpChoice() {
  const { patient, update } = usePatient()
  const opts: { v: 'willing' | 'declined' | undefined; label: string }[] = [
    { v: undefined, label: 'Not yet decided' },
    { v: 'willing', label: 'Opts for MTP' },
    { v: 'declined', label: 'Declines MTP' },
  ]
  return (
    <div className="toggle-row" role="group" aria-label="MTP decision">
      {opts.map((o) => (
        <label className="toggle" data-on={patient.mtpDecision === o.v} key={o.label}>
          <input
            type="radio"
            name="mtp"
            checked={patient.mtpDecision === o.v}
            onChange={() => update({ mtpDecision: o.v })}
          />
          {o.label}
        </label>
      ))}
    </div>
  )
}

function NtepPathwayCard({ muted }: { muted?: boolean }) {
  const { patient } = usePatient()
  const a = useMemo(() => assessPregnancy(patient), [patient])
  const p = a.pathway
  if (!p) return null
  const showMtp = a.band !== '24-plus'

  return (
    <div className="card regimen" data-muted={muted ? 'true' : 'false'}>
      <div className="rhead">
        <span className="shorthand">Regimen pathway</span>
        <span className="packtag">{PACK_LABEL.ntep}</span>
      </div>
      <div className="verdict tight" data-sev={p.severity}>
        <h3>{p.branch}</h3>
        {p.pending && <p className="body" style={{ fontSize: 13 }}>{p.pending}</p>}
      </div>

      {showMtp && !muted && (
        <div style={{ margin: '10px 0' }}>
          <div className="section-label" style={{ marginTop: 0 }}>Her decision after counselling</div>
          <MtpChoice />
        </div>
      )}

      {p.options.map((o, i) => (
        <div className="order" key={o.id} data-urgency="routine" data-tone={i === 0 ? 'good' : 'neutral'}>
          <div className="verb">{i + 1}</div>
          <div className="main">
            <div className="p" style={{ fontSize: 13.5 }}>{o.name}</div>
            <div className="meta" style={{ fontFamily: 'var(--mono)' }}>{o.shorthand}</div>
            {o.note && <div className="meta">{o.note}</div>}
          </div>
        </div>
      ))}
      <p className="note">In order of preference, subject to each regimen's other eligibility criteria.</p>
      <Provenance p={NTEP_PATHWAY_PROVENANCE} />

      {a.band === '20-to-24' && !muted && (
        <div className="divergence" style={{ marginTop: 10 }}>
          <b>The source leaves this open.</b> {MTP_THRESHOLD.detail}
        </div>
      )}
    </div>
  )
}

function WhoCard({ muted }: { muted?: boolean }) {
  return (
    <div className="card regimen" data-muted={muted ? 'true' : 'false'}>
      <div className="rhead">
        <span className="shorthand">Regimens in pregnancy</span>
        <span className="packtag">{PACK_LABEL.who}</span>
      </div>
      {WHO_REGIMENS.map((r) => (
        <div
          className="order"
          key={r.id}
          data-urgency="routine"
          data-tone={r.stance === 'recommended' ? 'good' : r.stance === 'not-applicable' ? 'critical' : 'warn'}
        >
          <div className="verb">
            {r.stance === 'recommended' ? 'Use' : r.stance === 'not-applicable' ? 'Not for' : 'No data'}
          </div>
          <div className="main">
            <div className="p" style={{ fontSize: 13.5 }}>{r.name}</div>
            <div className="meta">{r.text}</div>
            <Provenance p={r.provenance} />
          </div>
        </div>
      ))}
    </div>
  )
}

function DsTbCard() {
  const { patient, pack } = usePatient()
  return (
    <div className="card">
      <h2>Drug-susceptible TB in pregnancy</h2>
      {pack === 'ntep' && (
        <div className="unauthored" style={{ margin: '6px 0 10px' }}>
          <div className="p">Not authored for {PACK_LABEL.ntep}</div>
          <div className="meta">
            The NTEP documents on file do not address drug-susceptible TB in pregnancy. What follows is from the
            WHO operational handbook (2025) and ATS/CDC/IDSA (2016).
          </div>
        </div>
      )}
      <div className="verdict tight" data-sev="ok">
        <h3>{DSTB_REGIMEN.text}</h3>
        <p className="body" style={{ fontSize: 13 }}>{DSTB_REGIMEN.detail}</p>
      </div>
      <Provenance p={DSTB_REGIMEN.provenance} />

      <div style={{ marginTop: 10 }}>
        {DSTB_ORDERS.map((o) => {
          const onDrug = o.drugId != null && patient.currentDrugs.includes(o.drugId)
          return (
            <div
              className="order"
              key={o.id}
              data-urgency="routine"
              data-tone={o.verb === 'AVOID' ? 'critical' : onDrug ? 'warn' : 'neutral'}
            >
              <div className="verb">{o.verb}</div>
              <div className="main">
                <div className="p" style={{ fontSize: 13.5 }}>{o.s.text}</div>
                {o.s.detail && <div className="meta">{o.s.detail}</div>}
                <Provenance p={o.s.provenance} />
              </div>
            </div>
          )
        })}
        <StatementRow s={DSTB_PYRAZINAMIDE} />
      </div>
    </div>
  )
}

export function PregnancyModule({ onNavigate }: { onNavigate?: (v: View) => void }) {
  const { patient, pack } = usePatient()
  const a = useMemo(() => assessPregnancy(patient), [patient])

  const onEto = patient.currentDrugs.includes('ethionamide')
  const newbornRelevant = ['ethionamide', 'linezolid', 'pas'].some((d) => patient.currentDrugs.includes(d))
  const onTreatment = patient.currentDrugs.length > 0

  return (
    <>
      {/* ---------- drugs she is on now ---------- */}
      {a.flags.length > 0 && (
        <div className="card">
          <h2>Current drugs</h2>
          <div className="sub">Checked against pregnancy and breastfeeding rules for what is prescribed now.</div>
          {a.flags.map((f, i) => (
            <div
              className="order"
              key={`${f.note.drugId}-${i}`}
              data-urgency={f.severity === 'critical' ? 'immediate' : 'routine'}
              data-tone={f.severity === 'critical' ? 'critical' : f.severity === 'warning' ? 'warn' : 'neutral'}
            >
              <div className="verb">
                {f.severity === 'critical' ? 'STOP' : f.severity === 'warning' ? 'CHECK' : 'NOTE'}
              </div>
              <div className="main">
                <div className="p">{f.note.name}</div>
                <div className="meta">{f.reason}</div>
                {(f.severity === 'critical' || f.severity === 'warning') && f.note.instead && (
                  <div className="meta"><b>Instead:</b> {f.note.instead}</div>
                )}
                <Provenance p={f.note.provenance} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- drug-susceptible TB ---------- */}
      {patient.pregnant && a.track !== 'dr' && <DsTbCard />}

      {/* ---------- drug-resistant TB ---------- */}
      {patient.pregnant && a.track !== 'ds' && (
        <>
          {a.track === 'both' && (
            <div className="section-label">If rifampicin resistance is found</div>
          )}
          <div className="banner">
            <b>{PACK_LABEL[pack]}.</b> {PACK_OPTIONS[pack]}
          </div>
          {pack === 'ntep' ? <NtepPathwayCard /> : <WhoCard />}
          <details className="muted-wrap">
            <summary className="meta" style={{ cursor: 'pointer', margin: '4px 0 10px' }}>
              What {pack === 'ntep' ? PACK_LABEL.who : PACK_LABEL.ntep} says instead
            </summary>
            {pack === 'ntep' ? <WhoCard muted /> : <NtepPathwayCard muted />}
          </details>

          {onTreatment && (
            <div className="card compact">
              <StatementRow s={BECAME_PREGNANT_ON_TREATMENT} />
            </div>
          )}

          <div className="card">
            <h2>Monitoring through pregnancy</h2>
            <div className="sub">In addition to the regimen's own schedule.</div>
            {MONITORING.map((s, i) => (
              <StatementRow key={s.id} s={s} n={i + 1} />
            ))}
            {onEto && <StatementRow s={MONITORING_ETO} n={MONITORING.length + 1} tone="warn" />}
            {newbornRelevant && <StatementRow s={NEWBORN} n={MONITORING.length + (onEto ? 2 : 1)} tone="warn" />}
          </div>

          <div className="card compact">
            <StatementRow s={COUNSELLING} />
          </div>
        </>
      )}

      {/* ---------- breastfeeding ---------- */}
      {patient.breastfeeding && (
        <div className="card">
          <h2>Breastfeeding</h2>
          {a.track !== 'dr' && DSTB_BREASTFEEDING.map((s) => <StatementRow key={s.id} s={s} />)}
          {a.track !== 'ds' && BREASTFEEDING.map((s) => <StatementRow key={s.id} s={s} />)}
        </div>
      )}

      {/* ---------- every woman of childbearing age ---------- */}
      {!patient.pregnant && patient.sex !== 'male' && (
        <div className="card">
          <h2>Before and during DR-TB treatment</h2>
          <div className="sub">Applies to every woman of childbearing age, not only when pregnant.</div>
          {CHILDBEARING_AGE.map((s) => (
            <StatementRow key={s.id} s={s} />
          ))}
        </div>
      )}

      {/* ---------- reference ---------- */}
      <details className="card as-details" open={!a.applies}>
        <summary>Drug by drug in pregnancy and breastfeeding</summary>
        <div style={{ marginTop: 10 }}>
          {PREGNANCY_DRUGS.map((d) => (
            <div className="order" key={d.drugId} data-urgency="routine" data-tone={STANCE_TONE[d.stance]}>
              <div className="verb">{STANCE_LABEL[d.stance]}</div>
              <div className="main">
                <div className="p" style={{ fontSize: 13.5 }}>{d.name}</div>
                <div className="meta">{d.pregnancy}</div>
                {d.breastfeeding && (
                  <div className="meta">
                    <b>Breastfeeding:</b> {d.breastfeeding}
                  </div>
                )}
                <Provenance p={d.provenance} />
              </div>
            </div>
          ))}
        </div>
      </details>

      <CrossLinks from="pregnancy" onNavigate={onNavigate} />
    </>
  )
}

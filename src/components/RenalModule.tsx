import { useMemo, useState } from 'react'
import { usePatient } from '@/store/patientContext'
import { Provenance } from '@/components/Provenance'
import { CrossLinks } from '@/components/CrossLinks'
import { RELATIVE_CONTRAINDICATIONS, SAFETY_THRESHOLDS } from '@/content/safetyThresholds'
import {
  RENAL_DOSING,
  RENAL_DSTB_REGIMEN,
  RENAL_MONITORING,
  RENAL_MONITORING_PROVENANCE,
  RENAL_PRINCIPLES,
  TRANSPLANT_INTERACTION,
} from '@/content/renalDosing'
import { cockcroftGault, renalBand } from '@/engine/renal'

export function RenalModule({ onNavigate }: { onNavigate?: (v: import('@/components/Home').View) => void }) {
  const { patient } = usePatient()
  const [haemoglobin, setHb] = useState<number | undefined>(undefined)
  const [platelets, setPlt] = useState<number | undefined>(undefined)
  const [anc, setAnc] = useState<number | undefined>(undefined)

  const crCl = useMemo(
    () => cockcroftGault(patient.ageYears, patient.weightKg, patient.labs.creatinine, patient.sex),
    [patient.ageYears, patient.weightKg, patient.labs.creatinine, patient.sex],
  )
  const band = renalBand(crCl)
  // Below 30 mL/min is where the interval changes begin.
  const needsAdjustment = crCl != null && crCl < 30
  const inRegimen = patient.currentDrugs

  // Creatinine as a multiple of ULN. 1.2 mg/dL is a common adult ULN; the
  // patient's own lab range is not captured for creatinine, so this is stated.
  const creatinineXuln = patient.labs.creatinine != null ? patient.labs.creatinine / 1.2 : undefined

  const values = { creatinineXuln, haemoglobin, platelets, anc, potassium: patient.labs.potassium }
  const crossed = SAFETY_THRESHOLDS.map((t) => ({ t, hit: t.test(values) }))
  const breached = crossed.filter((c) => c.hit === true)
  const unknown = crossed.filter((c) => c.hit === undefined)

  return (
    <>
      <div className="verdict tight" data-sev={breached.length > 0 ? 'critical' : band?.severity ?? 'info'}>
        <h3>
          {breached.length > 0
            ? `${breached.length} safety threshold${breached.length === 1 ? '' : 's'} breached`
            : band
              ? band.label
              : 'Creatinine clearance not yet calculable'}
        </h3>
        {band && <p className="body" style={{ fontSize: 13 }}>{band.note}</p>}
        {crCl != null && (
          <div className="strip" style={{ marginTop: 6 }}>
            <span>CrCl {crCl.toFixed(0)} mL/min</span>
            {creatinineXuln != null && <span>Creatinine {creatinineXuln.toFixed(1)}× ULN</span>}
          </div>
        )}
      </div>

      {/* ---------- governing principles ---------- */}
      <div className="card">
        <h2>The rule that governs everything here</h2>
        {RENAL_PRINCIPLES.map((p) => (
          <div className="order" key={p.id} data-urgency="immediate" data-tone={p.id === 'principle.interval' ? 'critical' : 'warn'}>
            <div className="verb" style={{ flexBasis: 0, display: 'none' }} />
            <div className="main">
              <div className="p">{p.text}</div>
              <div className="meta">{p.detail}</div>
              <Provenance p={p.provenance} />
            </div>
          </div>
        ))}
      </div>

      {/* ---------- dosing table ---------- */}
      {needsAdjustment && (
        <div className="card">
          <h2>Dosing at CrCl below 30 mL/min or on haemodialysis</h2>
          <div className="sub">
            Drugs whose INTERVAL changes are marked. Everything else is given at full dose.
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Drug</th>
                  <th>Clearance</th>
                  <th>Dose</th>
                  <th>Dialysable</th>
                </tr>
              </thead>
              <tbody>
                {RENAL_DOSING.map((d) => (
                  <tr key={d.id} data-active={inRegimen.includes(d.id) ? 'true' : 'false'}>
                    <td data-first="true">
                      {d.name}
                      {d.contraindicated && <span className="pill-critical">avoid</span>}
                      {d.intervalExtended && !d.contraindicated && (
                        <span className="pill-interval">interval</span>
                      )}
                    </td>
                    <td>{d.clearance}</td>
                    <td>{d.doseBelow30}</td>
                    <td>{d.dialysable === true ? 'yes' : d.dialysable === false ? 'no' : String(d.dialysable)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section-label">Why each one matters</div>
          {RENAL_DOSING.filter((d) => inRegimen.includes(d.id) || d.contraindicated).map((d) => (
            <div className="order" key={d.id} data-urgency="routine" data-tone={d.contraindicated ? 'critical' : 'neutral'}>
              <div className="verb" style={{ flexBasis: 0, display: 'none' }} />
              <div className="main">
                <div className="p" style={{ fontSize: 13.5 }}>{d.name}</div>
                <div className="meta">{d.note}</div>
                <Provenance p={d.provenance} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- DS-TB regimen shape ---------- */}
      {needsAdjustment && (
        <div className="card">
          <h2>Drug-susceptible regimen at CrCl below 30</h2>
          <div className="phase">
            <div className="pl">Intensive</div>
            <div className="pd">{RENAL_DSTB_REGIMEN.intensive}</div>
          </div>
          <div className="phase">
            <div className="pl">Continuation</div>
            <div className="pd">{RENAL_DSTB_REGIMEN.continuation}</div>
          </div>
          <div className="phase">
            <div className="pl">Total</div>
            <div className="pd">{RENAL_DSTB_REGIMEN.total}</div>
          </div>
          <Provenance p={RENAL_DSTB_REGIMEN.provenance} />
        </div>
      )}

      {/* ---------- transplant ---------- */}
      <details className="card as-details">
        <summary>Renal transplant — an interaction problem, not a clearance problem</summary>
        <div className="verdict tight" data-sev="critical" style={{ marginTop: 10 }}>
          <h3>Rifampicin can cause acute graft rejection</h3>
          <p className="body" style={{ fontSize: 13 }}>{TRANSPLANT_INTERACTION.problem}</p>
        </div>
        <ul className="plain">
          {TRANSPLANT_INTERACTION.options.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
        <Provenance p={TRANSPLANT_INTERACTION.provenance} />
      </details>

      {/* ---------- monitoring ---------- */}
      <details className="card as-details">
        <summary>Monitoring schedule</summary>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Test</th>
                <th>Frequency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {RENAL_MONITORING.map((m) => (
                <tr key={m.test}>
                  <td data-first="true">{m.test}</td>
                  <td>{m.frequency}</td>
                  <td>{m.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Provenance p={RENAL_MONITORING_PROVENANCE} />
      </details>

      {/* ---------- CrCl calculator ---------- */}
      <div className="card">
        <h2>Creatinine clearance</h2>
        <div className="sub">
          Cockcroft-Gault, computed from the patient context: ((140 − age) × weight) ÷ (72 ×
          creatinine), × 0.85 if female.
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <tbody>
              <tr>
                <td data-first="true">Age</td>
                <td>{patient.ageYears != null ? `${patient.ageYears} years` : 'not entered'}</td>
              </tr>
              <tr>
                <td data-first="true">Weight</td>
                <td>{patient.weightKg != null ? `${patient.weightKg} kg` : 'not entered'}</td>
              </tr>
              <tr>
                <td data-first="true">Creatinine</td>
                <td>{patient.labs.creatinine != null ? `${patient.labs.creatinine} mg/dL` : 'not entered'}</td>
              </tr>
              <tr>
                <td data-first="true">Sex</td>
                <td>{patient.sex ?? 'not entered'}</td>
              </tr>
              <tr>
                <td data-first="true">CrCl</td>
                <td>{crCl != null ? `${crCl.toFixed(0)} mL/min` : '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="note">
          Creatinine is compared against a 1.2 mg/dL upper limit for the ×ULN figure. If your
          laboratory differs, read the multiple accordingly.
        </p>
      </div>

      {/* ---------- haematology inputs ---------- */}
      <div className="card compact">
        <div className="section-label" style={{ marginTop: 0 }}>Haematology</div>
        <div className="grid c3">
          <label className="field">
            Haemoglobin (g/dL)
            <input
              type="number"
              inputMode="decimal"
              value={haemoglobin ?? ''}
              onChange={(e) => setHb(e.target.value === '' ? undefined : Number(e.target.value))}
            />
          </label>
          <label className="field">
            Platelets (/mm³)
            <input
              type="number"
              value={platelets ?? ''}
              onChange={(e) => setPlt(e.target.value === '' ? undefined : Number(e.target.value))}
            />
          </label>
          <label className="field">
            Absolute neutrophils (/mm³)
            <input
              type="number"
              value={anc ?? ''}
              onChange={(e) => setAnc(e.target.value === '' ? undefined : Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* ---------- thresholds ---------- */}
      <div className="card">
        <h2>Safety thresholds</h2>
        <div className="sub">
          Values that trigger caution or make a regimen relatively contraindicated.
          {unknown.length > 0 && ` ${unknown.length} not yet assessable.`}
        </div>
        {crossed.map(({ t, hit }) => (
          <div
            className="order"
            key={t.id}
            data-urgency={hit ? 'immediate' : 'routine'}
            data-tone={hit ? (t.severity === 'critical' ? 'critical' : 'warn') : 'neutral'}
          >
            <div className="verb">{hit === true ? 'Breached' : hit === false ? 'OK' : '—'}</div>
            <div className="main">
              <div className="p">{t.label}</div>
              <div className="meta">{t.describe}</div>
              <Provenance p={t.provenance} />
            </div>
          </div>
        ))}
      </div>

      {/* ---------- interactions ---------- */}
      <div className="card">
        <h2>Relative contraindications and interactions</h2>
        {RELATIVE_CONTRAINDICATIONS.map((c) => (
          <div className="order" key={c.id} data-urgency="routine" data-tone="neutral">
            <div className="verb" style={{ flexBasis: 0, display: 'none' }} />
            <div className="main">
              <div className="p" style={{ fontSize: 13.5 }}>{c.text}</div>
              {c.detail && <div className="meta">{c.detail}</div>}
              <Provenance p={c.provenance} />
            </div>
          </div>
        ))}
      </div>
      <CrossLinks from="renal" onNavigate={onNavigate} />

    </>
  )
}

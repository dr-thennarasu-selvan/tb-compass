import { useMemo } from 'react'
import { usePatient } from '@/store/patientContext'
import { Provenance } from '@/components/Provenance'
import { CrossLinks } from '@/components/CrossLinks'
import { RegimenCard } from '@/components/RegimenCard'
import { ADULT_WEIGHT_BANDS, bandFor, durationAdjustment, mgPerKgDoses } from '@/engine/dstb'
import { deriveClassification } from '@/engine/cascade'

const STW_PROV = {
  citations: [
    { source: 'ntep-stw-dstb-2022', locator: 'Regimen for DS-TB, drug dosages and FDC weight bands' },
  ],
  status: 'source-checked' as const,
}

export function DsTbModule({ onNavigate }: { onNavigate?: (v: import('@/components/Home').View) => void }) {
  const { patient, pack } = usePatient()
  const band = useMemo(() => bandFor(patient.weightKg), [patient.weightKg])
  const doses = useMemo(() => mgPerKgDoses(patient.weightKg), [patient.weightKg])
  const duration = useMemo(() => durationAdjustment(patient), [patient])
  const derived = useMemo(() => deriveClassification(patient.diagnosis), [patient.diagnosis])

  const notDsTb =
    derived.classification !== 'ds-tb' && derived.classification !== 'unknown'

  return (
    <>
      {notDsTb && (
        <div className="verdict tight" data-sev="warning">
          <h3>This patient is not classified as drug-susceptible</h3>
          <p className="body" style={{ fontSize: 13 }}>
            {derived.basis} These first-line regimens do not apply — use the drug-resistant TB
            module.
          </p>
        </div>
      )}

      {/* ---------- weight band ---------- */}
      <div className="card">
        <h2>Weight-band dosing</h2>
        <div className="sub">
          Daily fixed-dose combinations under direct observation. Adult 4-FDC is HRZE
          75/150/400/275; 3-FDC is HRE 75/150/275.
        </div>

        {band ? (
          <div className="verdict tight" data-sev="ok">
            <h3>{band.label}</h3>
            <div className="strip">
              <span>Intensive: {band.intensiveTablets} tablets 4-FDC</span>
              <span>Continuation: {band.continuationTablets} tablets 3-FDC</span>
            </div>
          </div>
        ) : (
          // No banner here: the missing-input prompt at the head of the module
          // already names weight as the blocking field and takes it inline.
          null
        )}

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Weight band</th>
                <th>Intensive phase — 4-FDC</th>
                <th>Continuation — 3-FDC</th>
              </tr>
            </thead>
            <tbody>
              {ADULT_WEIGHT_BANDS.map((b) => (
                <tr key={b.label} data-active={band?.label === b.label ? 'true' : 'false'}>
                  <td data-first="true">{b.label}</td>
                  <td>{b.intensiveTablets}</td>
                  <td>{b.continuationTablets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="banner" style={{ marginTop: 12 }}>
          If the patient gains more than 5 kg during treatment and crosses into the next band,
          move them to the higher band's FDC count.
        </div>
        <Provenance p={STW_PROV} />
      </div>

      {/* ---------- mg/kg check ---------- */}
      <div className="card">
        <h2>Dose check</h2>
        <div className="sub">
          What the FDC should deliver at this weight. Use it to sanity-check a band, or to dose
          loose drugs.
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Drug</th>
                <th>Target</th>
                <th>{patient.weightKg != null ? `At ${patient.weightKg} kg` : 'Enter weight'}</th>
              </tr>
            </thead>
            <tbody>
              {doses.map((d) => (
                <tr key={d.drug}>
                  <td data-first="true">{d.drug}</td>
                  <td>{d.perKg}</td>
                  <td>{d.computed ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="plain" style={{ marginTop: 8 }}>
          <li>Pyridoxine 10 mg/day.</li>
          <li>
            Streptomycin only in certain situations — TB meningitis, or to replace a first-line
            drug after an adverse reaction.
          </li>
        </ul>
        <Provenance p={STW_PROV} />
      </div>

      {/* ---------- duration ---------- */}
      <div className="card">
        <h2>Duration</h2>
        <div className="verdict tight" data-sev={duration.severity} style={{ marginBottom: 0 }}>
          <h3>{duration.applies ? 'Extended duration applies' : 'Standard duration'}</h3>
          <p className="body" style={{ fontSize: 13 }}>{duration.text}</p>
        </div>
      </div>

      {/* ---------- regimen ---------- */}
      <RegimenCard excluded={[]} pack={pack} />
      <CrossLinks from="dstb" onNavigate={onNavigate} />

    </>
  )
}

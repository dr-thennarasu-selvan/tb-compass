import { Provenance } from '@/components/Provenance'
import {
  COLLECTION_RULES,
  MICRO_PROCEDURES,
  MICRO_PROCEDURES_PROVENANCE,
  PRECIOUS_SAMPLES,
  REJECTION_CRITERIA,
  REJECTION_PROVENANCE,
  SPECIMEN_PROVENANCE,
  SPECIMEN_REQUIREMENTS,
} from '@/content/eptbMicrobiology'

/**
 * Specimen handling for extrapulmonary TB.
 *
 * Deliberately prominent rather than buried: a correct diagnostic pathway still
 * fails if the sample goes into formalin or arrives unlabelled, and the patient
 * has already undergone the procedure by then.
 */
export function SpecimenGuide() {
  return (
    <details className="card as-details">
      <summary>Specimen handling — what to send, how much, and why samples get rejected</summary>

      <div className="banner" style={{ marginTop: 10 }}>
        <b>Send in sterile SALINE, never formalin.</b> Formalin destroys the sample for culture
        and molecular testing. The stated volumes are for microbiology only — histopathology,
        cytology, ADA, glucose and protein all need extra sample, so plan the volume before the
        needle goes in.
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Site</th>
              <th>Sample</th>
              <th>Amount</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {SPECIMEN_REQUIREMENTS.map((s) => (
              <tr key={s.site}>
                <td data-first="true">{s.site}</td>
                <td>{s.sample}</td>
                <td>{s.amount}</td>
                <td>{s.note ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Provenance p={SPECIMEN_PROVENANCE} />

      <div className="section-label">Collection and transport</div>
      {COLLECTION_RULES.map((r) => (
        <div className="order" key={r.id} data-urgency="routine" data-tone="neutral">
          <div className="verb" style={{ flexBasis: 0, display: 'none' }} />
          <div className="main">
            <div className="p" style={{ fontSize: 13.5 }}>{r.text}</div>
            {r.detail && <div className="meta">{r.detail}</div>}
          </div>
        </div>
      ))}

      <div className="section-label">A sample is rejected if it is</div>
      <ul className="plain">
        {REJECTION_CRITERIA.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
      <div className="divergence" style={{ marginTop: 8 }}>
        <b>{PRECIOUS_SAMPLES.text}.</b> {PRECIOUS_SAMPLES.detail}
      </div>
      <Provenance p={REJECTION_PROVENANCE} />

      <div className="section-label">Microbiological procedures</div>
      <ul className="plain">
        {MICRO_PROCEDURES.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
      <Provenance p={MICRO_PROCEDURES_PROVENANCE} />
    </details>
  )
}

import { usePatient } from '@/store/patientContext'
import { Provenance } from '@/components/Provenance'
import { linksFrom } from '@/content/crossLinks'
import type { View } from '@/components/Home'

/**
 * Renders the connections this module has to others, at the foot of the page.
 * Shows nothing when no link is relevant to the current patient.
 */
export function CrossLinks({
  from,
  onNavigate,
}: {
  from: View
  onNavigate?: (v: View) => void
}) {
  const { patient } = usePatient()
  const links = linksFrom(from, patient)
  if (links.length === 0 || !onNavigate) return null

  return (
    <div className="card">
      <h2>Connected to</h2>
      <div className="sub">
        These modules share a clinical fact with this one. The connection is the reason they
        share a patient context.
      </div>
      {links.map((l) => (
        <div className="order" key={l.id} data-urgency="routine" data-tone="neutral">
          <div className="verb" style={{ flexBasis: 0, display: 'none' }} />
          <div className="main">
            <div className="p" style={{ fontSize: 13.5 }}>{l.toLabel}</div>
            <div className="meta">{l.why}</div>
            <button className="jump" onClick={() => onNavigate(l.to)}>
              Open {l.toLabel} →
            </button>
            <Provenance p={l.provenance} />
          </div>
        </div>
      ))}
    </div>
  )
}

import { usePatient } from '@/store/patientContext'
import { moduleNeeds, type Need } from '@/engine/moduleNeeds'
import type { TbSite } from '@/types/patient'

/**
 * The missing-input prompt at the head of a module.
 *
 * A module with nothing to say used to render silence, which reads as a broken
 * screen rather than an unanswered question. This names the blocking field and
 * accepts it inline — the clinician never has to work out which of sixty fields
 * in the patient panel this particular module was waiting on.
 */

const SITE_LABEL: Record<string, string> = {
  pleural: 'Pleural',
  'lymph-node': 'Lymph node',
  cns: 'CNS',
  'bone-joint': 'Bone / spine',
  abdominal: 'Abdominal',
  pericardial: 'Pericardial',
  genitourinary: 'Genitourinary',
  'miliary-disseminated': 'Miliary',
}

function NeedField({ need, onNavigate }: { need: Need; onNavigate?: (v: string) => void }) {
  const { patient, update, updateLabs } = usePatient()

  if (need.kind === 'navigate') {
    return (
      <button className="need-jump" onClick={() => onNavigate?.(need.id)}>
        {need.label} →
      </button>
    )
  }

  if (need.kind === 'toggle') {
    return (
      <button className="need-jump" onClick={() => update({ [need.id]: true })}>
        {need.label}
      </button>
    )
  }

  if (need.kind === 'choice') {
    return (
      <div className="need-sites">
        {need.choices?.map((c) => (
          <button key={c.id} className="need-site" onClick={() => update({ [c.id]: true })}>
            {c.label}
          </button>
        ))}
      </div>
    )
  }

  if (need.kind === 'sites') {
    return (
      <div className="need-sites">
        {Object.entries(SITE_LABEL).map(([id, label]) => (
          <button
            key={id}
            className="need-site"
            onClick={() => update({ sites: [...patient.sites, id as TbSite] })}
          >
            {label}
          </button>
        ))}
      </div>
    )
  }

  const isLab = need.id.startsWith('labs.')
  const key = isLab ? need.id.slice(5) : need.id

  return (
    <label className="need-field">
      <span className="nf-label">
        {need.label}
        {need.unit && <em>{need.unit}</em>}
      </span>
      <input
        type="number"
        step="any"
        inputMode="decimal"
        autoComplete="off"
        aria-label={need.unit ? `${need.label} in ${need.unit}` : need.label}
        onChange={(e) => {
          const v = e.target.value === '' ? undefined : Number(e.target.value)
          if (isLab) updateLabs({ [key]: v })
          else update({ [key]: v })
        }}
      />
    </label>
  )
}

export function NeedsBar({
  view,
  onNavigate,
}: {
  view: string
  onNavigate?: (v: string) => void
}) {
  const { patient } = usePatient()
  const needs = moduleNeeds(view, patient).filter((n) => n.kind !== 'here')
  if (needs.length === 0) return null

  const single = needs.length === 1

  return (
    <div className="needs">
      <div className="needs-head">
        <span className="needs-icon" aria-hidden="true">
          ?
        </span>
        <div>
          <b>
            {single
              ? 'One more detail and this module can answer'
              : `${needs.length} more details and this module can answer`}
          </b>
          <div className="needs-why">
            {needs.map((n) => n.why).join(' · ')}
          </div>
        </div>
      </div>
      <div className="needs-fields">
        {needs.map((n) => (
          <NeedField key={n.id} need={n} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  )
}

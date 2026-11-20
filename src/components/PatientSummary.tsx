import { usePatient } from '@/store/patientContext'
import { CLASSIFICATION_LABEL } from '@/engine/cascade'
import { xUln } from '@/engine/dili'
import { drug } from '@/content/drugs'

/**
 * One-line patient summary, shown in place of the full context panel once
 * anything has been entered.
 *
 * The point is that a clinician opening a module should see the module, not a
 * form they already filled in. Chips show only what is actually set, and each
 * one is a live derived value rather than a raw field — an ALT of 380 means
 * nothing without the ULN beside it.
 */

interface Chip {
  label: string
  value: string
  tone?: 'critical' | 'warn' | 'ok' | 'neutral'
}

export function usePatientChips(): Chip[] {
  const { patient } = usePatient()
  const chips: Chip[] = []

  if (patient.classification && patient.classification !== 'unknown') {
    const dr = ['rr-tb', 'mdr-tb', 'pre-xdr-tb', 'xdr-tb'].includes(patient.classification)
    chips.push({
      label: 'Class',
      value: CLASSIFICATION_LABEL[patient.classification],
      tone: dr ? 'warn' : 'ok',
    })
  }

  if (patient.sites.length > 0) {
    chips.push({ label: 'Site', value: patient.sites.join(', ') })
  }

  if (patient.ageYears != null || patient.weightKg != null) {
    const bits = [
      patient.ageYears != null ? `${patient.ageYears}y` : null,
      patient.sex && patient.sex !== 'unspecified' ? patient.sex[0].toUpperCase() : null,
      patient.weightKg != null ? `${patient.weightKg}kg` : null,
    ].filter(Boolean)
    if (bits.length) chips.push({ label: 'Patient', value: bits.join(' · ') })
  }

  if (patient.currentDrugs.length > 0) {
    chips.push({
      label: 'Regimen',
      value: patient.currentDrugs.map((d) => drug(d)?.code ?? d).join(''),
    })
  }

  const altX = xUln(patient.labs.alt, patient.ranges.altUln)
  if (altX != null) {
    chips.push({
      label: 'ALT',
      value: `${altX.toFixed(1)}×`,
      tone: altX >= 5 ? 'critical' : altX >= 3 ? 'warn' : 'ok',
    })
  }
  const biliX = xUln(patient.labs.bilirubinTotal, patient.ranges.bilirubinUln)
  if (biliX != null) {
    chips.push({ label: 'Bili', value: `${biliX.toFixed(1)}×`, tone: biliX >= 2 ? 'warn' : 'ok' })
  }
  if (patient.labs.qtc != null) {
    const q = patient.labs.qtc
    chips.push({
      label: 'QTcF',
      value: `${q} ms`,
      tone: q > 500 ? 'critical' : q >= 481 ? 'warn' : 'ok',
    })
  }
  if (patient.hivPositive) {
    chips.push({
      label: 'HIV',
      value: patient.cd4 != null ? `CD4 ${patient.cd4}` : 'positive',
      tone: patient.cd4 != null && patient.cd4 < 50 ? 'critical' : 'warn',
    })
  }
  if (patient.pregnant) {
    chips.push({
      label: '',
      value: patient.gestationWeeks != null ? `Pregnant · ${patient.gestationWeeks} wk` : 'Pregnant',
      tone: 'warn',
    })
  }
  if (patient.breastfeeding) chips.push({ label: '', value: 'Breastfeeding', tone: 'warn' })
  const airways = [patient.copd && 'COPD', patient.asthma && 'Asthma'].filter(Boolean).join(' + ')
  if (airways) chips.push({ label: '', value: patient.onInhaledSteroid ? `${airways} · ICS` : airways, tone: 'neutral' })

  return chips
}

export function PatientSummary({ onExpand }: { onExpand: () => void }) {
  const chips = usePatientChips()
  const { patient } = usePatient()

  if (chips.length === 0) {
    return (
      <button className="summary-bar empty" onClick={onExpand}>
        <span className="sb-label">Start here — add the patient</span>
        <span className="sb-action">Add context →</span>
      </button>
    )
  }

  return (
    <button className="summary-bar" onClick={onExpand}>
      <div className="sb-chips">
        {patient.label && <span className="sb-name">{patient.label}</span>}
        {chips.map((c, i) => (
          <span className="sb-chip" key={i} data-tone={c.tone ?? 'neutral'}>
            {c.label && <b>{c.label}</b>}
            {c.value}
          </span>
        ))}
      </div>
      <span className="sb-action">Edit →</span>
    </button>
  )
}

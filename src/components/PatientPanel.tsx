import { useState, type ReactNode } from 'react'
import { usePatient } from '@/store/patientContext'
import { DRUGS } from '@/content/drugs'
import { xUln } from '@/engine/dili'
import type { Labs, Sex, TbClassification, TbSite } from '@/types/patient'

/**
 * Patient context entry.
 *
 * Previously one flat wall of about sixty controls. Everything was visible at
 * once, which made the panel exhausting to scan and impossible to resume: there
 * was no way to tell what you had already filled in without reading all of it.
 *
 * Now grouped by the question each section answers, collapsed by default, with
 * each header carrying a live summary of what it holds. Nothing has been
 * removed — every field that existed is still here, and none of the clinical
 * behaviour has changed.
 */

function Num({
  label,
  value,
  onChange,
  unit,
  hint,
  placeholder,
}: {
  label: string
  value: number | undefined
  onChange: (v: number | undefined) => void
  unit?: string
  /** Live derived read-out — ×ULN, weight band — shown once a value is entered. */
  hint?: string
  placeholder?: string
}) {
  return (
    <label className="field">
      <span className="fl">
        {label}
        {unit && <em>{unit}</em>}
      </span>
      <input
        type="number"
        step="any"
        inputMode="decimal"
        autoComplete="off"
        aria-label={unit ? `${label} in ${unit}` : label}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => {
          const raw = e.target.value
          onChange(raw === '' ? undefined : Number(raw))
        }}
      />
      {hint && <span className="fh">{hint}</span>}
    </label>
  )
}

function Chip({
  on,
  onToggle,
  children,
}: {
  on: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <label className="toggle" data-on={on}>
      <input type="checkbox" checked={on} onChange={onToggle} />
      {children}
    </label>
  )
}

/**
 * A collapsible section. The summary line is the point: it lets a clinician
 * see what is already recorded without opening anything.
 */
function Group({
  title,
  summary,
  count,
  children,
  defaultOpen = false,
}: {
  title: string
  summary?: string
  count?: number
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="pgroup" data-open={open}>
      <button className="pgroup-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="pg-caret" aria-hidden="true" />
        <span className="pg-title">{title}</span>
        {count ? <span className="pg-count">{count}</span> : null}
        {!open && summary && <span className="pg-summary">{summary}</span>}
      </button>
      {open && <div className="pgroup-body">{children}</div>}
    </section>
  )
}

const CLASSIFICATIONS: { id: TbClassification; label: string }[] = [
  { id: 'ds-tb', label: 'Drug-susceptible' },
  { id: 'hr-tb', label: 'Hr-TB' },
  { id: 'rr-tb', label: 'RR-TB' },
  { id: 'mdr-tb', label: 'MDR-TB' },
  { id: 'pre-xdr-tb', label: 'Pre-XDR' },
  { id: 'xdr-tb', label: 'XDR' },
  { id: 'poly-resistant', label: 'Poly-resistant' },
  { id: 'unknown', label: 'Not yet known' },
]

const SITES: { id: TbSite; label: string }[] = [
  { id: 'pulmonary', label: 'Pulmonary' },
  { id: 'pleural', label: 'Pleural' },
  { id: 'lymph-node', label: 'Lymph node' },
  { id: 'cns', label: 'CNS' },
  { id: 'bone-joint', label: 'Bone / spine' },
  { id: 'abdominal', label: 'Abdominal' },
  { id: 'pericardial', label: 'Pericardial' },
  { id: 'genitourinary', label: 'Genitourinary' },
  { id: 'miliary-disseminated', label: 'Miliary / disseminated' },
  { id: 'other', label: 'Other' },
]

const SEXES: { id: Sex; label: string }[] = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'other', label: 'Other' },
]

/** The adult FDC weight bands, echoed back as the weight is typed. */
function weightBand(kg: number | undefined): string | undefined {
  if (kg == null) return undefined
  if (kg < 25) return 'below adult bands'
  const n = kg >= 76 ? 6 : kg >= 65 ? 5 : kg >= 50 ? 4 : kg >= 35 ? 3 : 2
  return `${n} FDC tablets`
}

function times(v: number | undefined, uln: number): string | undefined {
  const x = xUln(v, uln)
  return x == null ? undefined : `${x.toFixed(1)}× ULN`
}

export function PatientPanel({ onDone }: { onDone?: () => void }) {
  const { patient, update, updateLabs, reset } = usePatient()
  const [confirmClear, setConfirmClear] = useState(false)

  const toggleDrug = (id: string) => {
    const has = patient.currentDrugs.includes(id)
    update({
      currentDrugs: has
        ? patient.currentDrugs.filter((d) => d !== id)
        : [...patient.currentDrugs, id],
    })
  }

  const toggleSite = (id: TbSite) => {
    const has = patient.sites.includes(id)
    update({ sites: has ? patient.sites.filter((x) => x !== id) : [...patient.sites, id] })
  }

  const lab = (k: keyof Labs) => patient.labs[k] as number | undefined

  const hostFactors = [
    patient.hivPositive && 'HIV',
    patient.pregnant && 'pregnant',
    patient.breastfeeding && 'breastfeeding',
    patient.diabetes && 'diabetes',
    patient.copd && 'COPD',
    patient.asthma && 'asthma',
    patient.onInhaledSteroid && 'on ICS',
    patient.smoker && 'smoker',
    patient.chronicLiverDisease && 'chronic liver disease',
    patient.alcoholUse === 'heavy' && 'heavy alcohol',
  ].filter(Boolean) as string[]

  const labCount = [
    lab('alt'),
    lab('ast'),
    lab('alp'),
    lab('bilirubinTotal'),
    lab('bilirubinDirect'),
    lab('inr'),
    lab('albumin'),
    lab('creatinine'),
    lab('qtc'),
    lab('potassium'),
    lab('rbs'),
    lab('fbs'),
    lab('ppbs'),
    lab('hba1c'),
  ].filter((v) => v != null).length

  const whoSummary = [
    patient.ageYears != null ? `${patient.ageYears}y` : null,
    patient.sex && patient.sex !== 'unspecified' ? patient.sex : null,
    patient.weightKg != null ? `${patient.weightKg} kg` : null,
    patient.treatmentDay != null ? `day ${patient.treatmentDay}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="card patient-card">
      <div className="pc-head">
        <div>
          <h2>Patient context</h2>
          <div className="sub">Entered once, used by every module. Nothing leaves this device.</div>
        </div>
        {onDone && (
          <button className="primary" onClick={onDone}>
            Done
          </button>
        )}
      </div>

      <Group title="Who" summary={whoSummary || 'not set'} defaultOpen={!whoSummary}>
        <div className="grid c4">
          <label className="field">
            <span className="fl">Local label</span>
            <input
              type="text"
              placeholder="Bed 12 / initials"
              value={patient.label ?? ''}
              onChange={(e) => update({ label: e.target.value || undefined })}
            />
            <span className="fh static">Stays on this device</span>
          </label>
          <Num
            label="Age"
            unit="years"
            value={patient.ageYears}
            onChange={(v) => update({ ageYears: v })}
          />
          <Num
            label="Weight"
            unit="kg"
            value={patient.weightKg}
            onChange={(v) => update({ weightKg: v })}
            hint={weightBand(patient.weightKg)}
          />
          <Num
            label="Day of treatment"
            value={patient.treatmentDay}
            onChange={(v) => update({ treatmentDay: v })}
          />
        </div>

        <div className="field-label">Sex</div>
        <div className="toggle-row">
          {SEXES.map((x) => (
            <Chip
              key={x.id}
              on={patient.sex === x.id}
              onToggle={() => update({ sex: patient.sex === x.id ? undefined : x.id })}
            >
              {x.label}
            </Chip>
          ))}
        </div>
      </Group>

      <Group
        title="Disease"
        count={patient.sites.length}
        summary={
          patient.sites.length > 0 || patient.classification
            ? [patient.sites.join(', '), patient.classification].filter(Boolean).join(' · ')
            : 'no site or classification'
        }
      >
        <div className="field-label">Site of disease</div>
        <div className="toggle-row">
          {SITES.map((x) => (
            <Chip key={x.id} on={patient.sites.includes(x.id)} onToggle={() => toggleSite(x.id)}>
              {x.label}
            </Chip>
          ))}
        </div>

        <div className="field-label">Classification</div>
        <div className="toggle-row">
          {CLASSIFICATIONS.map((c) => (
            <Chip
              key={c.id}
              on={patient.classification === c.id}
              onToggle={() =>
                update({ classification: patient.classification === c.id ? undefined : c.id })
              }
            >
              {c.label}
            </Chip>
          ))}
        </div>
        <p className="fh block">
          Normally derived from the diagnostic pathway as results arrive. Setting it here is an
          override, and working through the cascade will recompute it.
        </p>
      </Group>

      <Group
        title="Current regimen"
        count={patient.currentDrugs.length}
        summary={
          patient.currentDrugs.length > 0
            ? DRUGS.filter((d) => patient.currentDrugs.includes(d.id))
                .map((d) => d.code)
                .join(' ')
            : 'no drugs recorded'
        }
      >
        <div className="toggle-row">
          {DRUGS.map((d) => (
            <Chip
              key={d.id}
              on={patient.currentDrugs.includes(d.id)}
              onToggle={() => toggleDrug(d.id)}
            >
              <b className="drug-code">{d.code}</b> {d.name}
            </Chip>
          ))}
        </div>

        <div className="field-label">Other hepatotoxic drugs</div>
        <label className="field">
          <input
            type="text"
            placeholder="e.g. co-trimoxazole, fluconazole"
            value={patient.otherHepatotoxins.join(', ')}
            onChange={(e) =>
              update({
                otherHepatotoxins: e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
          <span className="fh static">
            Comma separated — co-trimoxazole, azoles, paracetamol, nevirapine, herbal remedies
          </span>
        </label>
      </Group>

      <Group
        title="Host factors"
        count={hostFactors.length}
        summary={hostFactors.length ? hostFactors.join(', ') : 'none recorded'}
      >
        <div className="toggle-row">
          <Chip
            on={!!patient.hivPositive}
            onToggle={() => update({ hivPositive: !patient.hivPositive })}
          >
            HIV positive
          </Chip>
          <Chip on={!!patient.onArt} onToggle={() => update({ onArt: !patient.onArt })}>
            On ART
          </Chip>
          <Chip on={!!patient.pregnant} onToggle={() => update({ pregnant: !patient.pregnant })}>
            Pregnant
          </Chip>
          <Chip
            on={!!patient.breastfeeding}
            onToggle={() => update({ breastfeeding: !patient.breastfeeding })}
          >
            Breastfeeding
          </Chip>
          <Chip on={!!patient.diabetes} onToggle={() => update({ diabetes: !patient.diabetes })}>
            Diabetes
          </Chip>
          <Chip on={!!patient.copd} onToggle={() => update({ copd: !patient.copd })}>
            COPD
          </Chip>
          <Chip on={!!patient.asthma} onToggle={() => update({ asthma: !patient.asthma })}>
            Asthma
          </Chip>
          <Chip
            on={!!patient.onInhaledSteroid}
            onToggle={() => update({ onInhaledSteroid: !patient.onInhaledSteroid })}
          >
            On inhaled steroid
          </Chip>
          <Chip on={!!patient.smoker} onToggle={() => update({ smoker: !patient.smoker })}>
            Smoker
          </Chip>
          <Chip
            on={!!patient.chronicLiverDisease}
            onToggle={() => update({ chronicLiverDisease: !patient.chronicLiverDisease })}
          >
            Chronic liver disease
          </Chip>
          <Chip
            on={patient.alcoholUse === 'heavy'}
            onToggle={() =>
              update({ alcoholUse: patient.alcoholUse === 'heavy' ? 'none' : 'heavy' })
            }
          >
            Heavy alcohol use
          </Chip>
        </div>

        {patient.pregnant && (
          <div className="subgroup">
            <div className="field-label">Pregnancy</div>
            <div className="grid c4">
              <Num
                label="Gestation"
                unit="weeks"
                value={patient.gestationWeeks}
                onChange={(v) => update({ gestationWeeks: v })}
                hint={
                  patient.gestationWeeks == null
                    ? undefined
                    : patient.gestationWeeks < 20
                      ? 'below 20 weeks'
                      : patient.gestationWeeks < 24
                        ? '20–24 weeks: MTP category-dependent'
                        : patient.gestationWeeks < 32
                          ? 'beyond 24 weeks; ethionamide still barred'
                          : '32 weeks or more'
                }
              />
            </div>
          </div>
        )}

        {patient.hivPositive && (
          <div className="subgroup">
            <div className="field-label">HIV / IRIS context</div>
            <div className="grid c4">
              <Num
                label="CD4"
                unit="cells/µL"
                value={patient.cd4}
                onChange={(v) => update({ cd4: v })}
                hint={patient.cd4 != null && patient.cd4 < 50 ? 'highest IRIS risk band' : undefined}
              />
              <Num
                label="Viral load"
                unit="copies/mL"
                value={patient.viralLoad}
                onChange={(v) => update({ viralLoad: v })}
              />
              <Num
                label="Days since ART start"
                value={patient.daysSinceArt}
                onChange={(v) => update({ daysSinceArt: v })}
                hint={
                  patient.daysSinceArt != null && patient.daysSinceArt <= 90
                    ? 'within the IRIS window'
                    : undefined
                }
              />
              <Num
                label="ATT→ART interval"
                unit="days"
                value={patient.attToArtIntervalDays}
                onChange={(v) => update({ attToArtIntervalDays: v })}
              />
            </div>
            <div className="toggle-row" style={{ marginTop: 10 }}>
              <Chip
                on={!!patient.cd4Rising}
                onToggle={() => update({ cd4Rising: !patient.cd4Rising })}
              >
                CD4 rising
              </Chip>
              <Chip
                on={!!patient.viralLoadFalling}
                onToggle={() => update({ viralLoadFalling: !patient.viralLoadFalling })}
              >
                Viral load falling
              </Chip>
              <Chip
                on={!!patient.improvedBeforeArt}
                onToggle={() => update({ improvedBeforeArt: !patient.improvedBeforeArt })}
              >
                Improved on ATT before ART
              </Chip>
            </div>
          </div>
        )}
      </Group>

      <Group
        title="Laboratory"
        count={labCount}
        summary={labCount ? `${labCount} value${labCount === 1 ? '' : 's'} recorded` : 'nothing recorded'}
      >
        <div className="field-label">Liver</div>
        <div className="grid c4">
          <Num
            label="ALT"
            unit="U/L"
            value={lab('alt')}
            onChange={(v) => updateLabs({ alt: v })}
            hint={times(lab('alt'), patient.ranges.altUln)}
          />
          <Num
            label="AST"
            unit="U/L"
            value={lab('ast')}
            onChange={(v) => updateLabs({ ast: v })}
            hint={times(lab('ast'), patient.ranges.astUln)}
          />
          <Num
            label="ALP"
            unit="U/L"
            value={lab('alp')}
            onChange={(v) => updateLabs({ alp: v })}
            hint={times(lab('alp'), patient.ranges.alpUln)}
          />
          <Num
            label="Bilirubin total"
            unit="mg/dL"
            value={lab('bilirubinTotal')}
            onChange={(v) => updateLabs({ bilirubinTotal: v })}
            hint={times(lab('bilirubinTotal'), patient.ranges.bilirubinUln)}
          />
          <Num
            label="Bilirubin direct"
            unit="mg/dL"
            value={lab('bilirubinDirect')}
            onChange={(v) => updateLabs({ bilirubinDirect: v })}
          />
          <Num label="INR" value={lab('inr')} onChange={(v) => updateLabs({ inr: v })} />
          <Num
            label="Albumin"
            unit="g/dL"
            value={lab('albumin')}
            onChange={(v) => updateLabs({ albumin: v })}
          />
        </div>

        <div className="field-label">Kidney and heart</div>
        <div className="grid c4">
          <Num
            label="Creatinine"
            unit="mg/dL"
            value={lab('creatinine')}
            onChange={(v) => updateLabs({ creatinine: v })}
          />
          <Num
            label="QTcF"
            unit="ms"
            value={lab('qtc')}
            onChange={(v) => updateLabs({ qtc: v, qtcMethod: 'fridericia' })}
            hint={
              lab('qtc') == null
                ? undefined
                : lab('qtc')! > 500
                  ? 'grade 3 or above'
                  : lab('qtc')! >= 481
                    ? 'prolonged'
                    : 'within range'
            }
          />
          <Num
            label="Potassium"
            unit="mmol/L"
            value={lab('potassium')}
            onChange={(v) => updateLabs({ potassium: v })}
          />
        </div>
        <div className="field-label">Blood sugar</div>
        <div className="grid c4">
          <Num
            label="Random"
            unit="mg/dL"
            value={lab('rbs')}
            onChange={(v) => updateLabs({ rbs: v })}
            hint={lab('rbs') != null && lab('rbs')! >= 110 ? 'NTEP: follow with FBS/PPBS + HbA1c' : undefined}
          />
          <Num label="Fasting" unit="mg/dL" value={lab('fbs')} onChange={(v) => updateLabs({ fbs: v })} />
          <Num label="Post-prandial" unit="mg/dL" value={lab('ppbs')} onChange={(v) => updateLabs({ ppbs: v })} />
          <Num label="HbA1c" unit="%" value={lab('hba1c')} onChange={(v) => updateLabs({ hba1c: v })} />
        </div>

        <details className="reveal uln">
          <summary>Laboratory upper limits of normal</summary>
          <div className="grid c4" style={{ marginTop: 10 }}>
            <Num
              label="ALT ULN"
              value={patient.ranges.altUln}
              onChange={(v) => update({ ranges: { ...patient.ranges, altUln: v ?? 40 } })}
            />
            <Num
              label="AST ULN"
              value={patient.ranges.astUln}
              onChange={(v) => update({ ranges: { ...patient.ranges, astUln: v ?? 40 } })}
            />
            <Num
              label="ALP ULN"
              value={patient.ranges.alpUln}
              onChange={(v) => update({ ranges: { ...patient.ranges, alpUln: v ?? 120 } })}
            />
            <Num
              label="Bilirubin ULN"
              value={patient.ranges.bilirubinUln}
              onChange={(v) => update({ ranges: { ...patient.ranges, bilirubinUln: v ?? 1.2 } })}
            />
          </div>
          <p className="fh block">
            Every threshold in this app is a multiple of these values. Set them to your own
            laboratory's reference ranges — the defaults are placeholders, and using the wrong ULN
            shifts every conclusion.
          </p>
        </details>
      </Group>

      <div className="pc-foot">
        {confirmClear ? (
          <>
            <span className="fh">Clear every field for this patient?</span>
            <button
              className="danger"
              onClick={() => {
                reset()
                setConfirmClear(false)
              }}
            >
              Clear
            </button>
            <button className="ghost" onClick={() => setConfirmClear(false)}>
              Keep
            </button>
          </>
        ) : (
          <button className="ghost" onClick={() => setConfirmClear(true)}>
            Clear patient
          </button>
        )}
      </div>
    </div>
  )
}

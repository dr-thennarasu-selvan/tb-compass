import { useMemo, useState } from 'react'
import { usePatient } from '@/store/patientContext'
import { Provenance } from '@/components/Provenance'
import { CrossLinks } from '@/components/CrossLinks'
import {
  ALARM_FEATURES,
  ALTERNATIVE_CAUSES,
  thresholdsFor,
  HEPATITIS_SYMPTOMS,
  PROTOCOL_PROVENANCE,
  type AlarmId,
  type SymptomId,
} from '@/content/playbooks/dili'
import { assessDili, type DiliInput } from '@/engine/dili'
import { PACK_LABEL, type GuidelinePack } from '@/types/content'
import { buildOrders, type Order } from '@/engine/orders'
import {
  buildRechallengePlan,
  outcomeOf,
  progressOf,
  recurrenceActions,
  type OutcomeMap,
} from '@/engine/rechallenge'
import { RegimenCard } from '@/components/RegimenCard'

const fmtX = (x: number | undefined) => (x == null ? '—' : `${x.toFixed(1)}×`)

function OrderRow({ o }: { o: Order }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="order" data-urgency={o.urgency} data-tone={o.tone ?? o.urgency}>
      <div className="verb">{o.verb}</div>
      <div className="main">
        <div className="p">{o.primary}</div>
        {(o.timing || o.qualifier) && (
          <div className="meta">
            {o.timing}
            {o.timing && o.qualifier ? ' — ' : ''}
            {o.qualifier}
          </div>
        )}
        {o.alert && <div className="alert">{o.alert}</div>}
        {open && (
          <div className="why">
            {o.why && <p>{o.why}</p>}
            <Provenance p={o.provenance} />
          </div>
        )}
      </div>
      <button className="info" onClick={() => setOpen((v) => !v)} aria-label="Why">
        {open ? '×' : 'i'}
      </button>
    </div>
  )
}

export function DiliModule({ onNavigate }: { onNavigate?: (v: import('@/components/Home').View) => void }) {
  const { patient, protocol, updateProtocol, pack } = usePatient()
  const [symptoms, setSymptoms] = useState<SymptomId[]>([])
  const [alarms, setAlarms] = useState<AlarmId[]>([])
  const [excludedCauses, setExcluded] = useState<string[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeMap>({})

  const input: DiliInput = useMemo(
    () => ({ symptoms, alarms, excludedCauses }),
    [symptoms, alarms, excludedCauses],
  )
  const t = useMemo(() => thresholdsFor(pack), [pack])
  const otherPack: GuidelinePack = pack === 'who' ? 'ntep' : 'who'
  /**
   * The same labs can cross one guideline's withdrawal threshold and not the
   * other's — NTEP states a single 5x ULN threshold, ATS stops at 3x when
   * symptoms are present. A clinician must not have to switch packs to
   * discover that, so the disagreement is surfaced on the verdict itself.
   */
  const otherAssessment = useMemo(
    () => assessDili(patient, input, otherPack),
    [patient, input, otherPack],
  )
  const a = useMemo(() => assessDili(patient, input, pack), [patient, input, pack])
  const orders = useMemo(
    () => buildOrders(patient, a, protocol, pack),
    [patient, a, protocol, pack],
  )

  const severeEpisode =
    a.hysLaw.met || alarms.length > 0 || symptoms.includes('jaundice') || a.severity === 'critical'

  const plan = useMemo(
    () =>
      buildRechallengePlan({
        severeEpisode,
        permanentlyExcluded: [],
        intervalDays: protocol.rechallengeIntervalDays,
        omitPzaAfterSevere: protocol.omitPzaAfterSevere,
        order: protocol.rechallengeOrder,
      }),
    [severeEpisode, protocol],
  )

  const progress = useMemo(() => progressOf(plan, outcomes), [plan, outcomes])

  /**
   * Drugs the final regimen must be built without: those that caused
   * recurrence on rechallenge, plus pyrazinamide when a severe episode means
   * it was never re-attempted at all.
   */
  const finalExclusions = useMemo(() => {
    const out = new Set(progress.recurred)
    if (severeEpisode && protocol.omitPzaAfterSevere) out.add('pyrazinamide')
    return [...out]
  }, [progress.recurred, severeEpisode, protocol.omitPzaAfterSevere])

  const toggle = <T extends string>(list: T[], set: (v: T[]) => void, id: T) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

  const noTransaminase = a.altX == null && a.astX == null

  const headline = a.alarmsPresent.length > 0
    ? 'Acute liver failure — refer now'
    : a.hysLaw.met
      ? "Severe — Hy's Law met"
      : a.withdrawal.indicated
        ? 'Stop hepatotoxic drugs'
        : 'Below withdrawal threshold'

  return (
    <>
      <div className="card compact">
        <div className="section-label" style={{ marginTop: 0 }}>Symptoms</div>
        <div className="toggle-row">
          {HEPATITIS_SYMPTOMS.map((s) => (
            <label key={s.id} className="toggle" data-on={symptoms.includes(s.id)}>
              <input
                type="checkbox"
                checked={symptoms.includes(s.id)}
                onChange={() => toggle(symptoms, setSymptoms, s.id)}
              />
              {s.label}
            </label>
          ))}
        </div>
        <div className="section-label">Alarm features</div>
        <div className="toggle-row">
          {ALARM_FEATURES.map((f) => (
            <label key={f.id} className="toggle" data-on={alarms.includes(f.id)}>
              <input
                type="checkbox"
                checked={alarms.includes(f.id)}
                onChange={() => toggle(alarms, setAlarms, f.id)}
              />
              {f.label}
            </label>
          ))}
        </div>
      </div>

      {noTransaminase ? (
        <div className="verdict" data-sev="info">
          <h3>Enter ALT or AST</h3>
        </div>
      ) : (
        <>
          <div className="verdict tight" data-sev={a.severity}>
            <h3>{headline}</h3>
            <div className="strip">
              <span>ALT {fmtX(a.altX)}</span>
              <span>AST {fmtX(a.astX)}</span>
              <span>ALP {fmtX(a.alpX)}</span>
              <span>Bili {fmtX(a.bilirubinX)}</span>
              {a.rRatio != null && (
                <span>
                  R {a.rRatio.toFixed(1)} · {a.pattern}
                </span>
              )}
            </div>
            {otherAssessment.withdrawal.indicated !== a.withdrawal.indicated && (
              <div className="disagree">
                <b>{PACK_LABEL[otherPack]} disagrees.</b>{' '}
                {otherAssessment.withdrawal.indicated
                  ? `Under ${PACK_LABEL[otherPack]} this crosses the withdrawal threshold and the hepatotoxic drugs would be stopped.`
                  : `Under ${PACK_LABEL[otherPack]} this does not cross the withdrawal threshold and treatment would continue.`}{' '}
                Decide which your programme follows before acting.
              </div>
            )}
            <details className="reveal quiet">
              <summary>Why</summary>
              <p>{a.withdrawal.reason}</p>
              <p>{a.hysLaw.explanation}</p>
              {a.missing.length > 0 && <p>Missing: {a.missing.join(', ')}.</p>}
              <Provenance p={t.stopSymptomatic.provenance} />
            </details>
          </div>

          <div className="card">
            <h2>Orders</h2>
            {orders.map((o) => (
              <OrderRow key={o.id} o={o} />
            ))}
          </div>

          <div className="card">
            <h2>Reintroduce</h2>
            {!a.readyForRechallenge ? (
              <div className="blocked">
                <div className="p">Not yet</div>
                <ul className="plain">
                  {a.rechallengeBlockers.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
                {plan.steps.map((s) => {
                  const oc = outcomeOf(outcomes, s.drugId)
                  const isCurrent = progress.current?.drugId === s.drugId
                  return (
                    <div className="order" key={s.drugId} data-urgency="routine" data-outcome={oc}>
                      <div className="verb num">{oc === 'tolerated' ? '\u2713' : oc === 'recurred' ? '\u00d7' : s.order}</div>
                      <div className="main">
                        <div className="p">{s.drugName}</div>
                        <div className="meta">
                          {oc === 'pending' && `LFT on day ${s.observeDays}, then add next`}
                          {oc === 'tolerated' && 'Tolerated — keep in regimen'}
                          {oc === 'recurred' && 'Culprit — permanently excluded'}
                        </div>

                        {oc === 'recurred' && (
                          <div className="recurrence">
                            <div className="p">Enzymes rose on {s.drugName}</div>
                            <ul className="plain">
                              {recurrenceActions(s.drugName, protocol.rechallengeIntervalDays).map(
                                (t, i) => (
                                  <li key={i}>{t}</li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                        {isCurrent && (
                          <div className="outcome-btns">
                            <button
                              data-kind="good"
                              onClick={() => setOutcomes((o) => ({ ...o, [s.drugId]: 'tolerated' }))}
                            >
                              Tolerated
                            </button>
                            <button
                              data-kind="bad"
                              onClick={() => setOutcomes((o) => ({ ...o, [s.drugId]: 'recurred' }))}
                            >
                              ALT rose &ge;{protocol.recurrenceAltThreshold}&times; or symptoms
                            </button>
                          </div>
                        )}
                        {oc !== 'pending' && (
                          <div className="outcome-btns">
                            <button
                              className="ghost"
                              onClick={() =>
                                setOutcomes((o) => {
                                  const n = { ...o }
                                  delete n[s.drugId]
                                  return n
                                })
                              }
                            >
                              undo
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {plan.omitted.map((o) => (
                  <div className="order" key={o.id} data-urgency="same-day">
                    <div className="verb">Omit</div>
                    <div className="main">
                      <div className="p">Pyrazinamide</div>
                      <div className="meta">severe episode \u2014 not rechallenged</div>
                    </div>
                  </div>
                ))}

                <details className="reveal quiet" style={{ marginTop: 8 }}>
                  <summary>Rationale and sources</summary>
                  <p>{plan.caveat}</p>
                  {plan.steps.map((s) => (
                    <p key={s.drugId}>
                      <b>{s.drugName}.</b> {s.rationale}
                    </p>
                  ))}
                  <Provenance p={plan.provenance} />
                </details>
              </>
            )}
          </div>

          {a.readyForRechallenge && finalExclusions.length > 0 && (
            <RegimenCard excluded={finalExclusions} pack={pack} />
          )}
        </>
      )}

      <details className="card as-details">
        <summary>
          Alternative causes — {excludedCauses.length}/{ALTERNATIVE_CAUSES.length} excluded
        </summary>
        <div style={{ marginTop: 10 }}>
          {ALTERNATIVE_CAUSES.map((c) => (
            <div className="order" key={c.id} data-urgency="routine">
              <label className="toggle" data-on={excludedCauses.includes(c.id)} style={{ flex: 'none' }}>
                <input
                  type="checkbox"
                  checked={excludedCauses.includes(c.id)}
                  onChange={() => toggle(excludedCauses, setExcluded, c.id)}
                />
                {excludedCauses.includes(c.id) ? 'done' : 'todo'}
              </label>
              <div className="main">
                <div className="p">{c.text}</div>
                <div className="meta">{[...c.labs, ...c.bedside].join(' · ')}</div>
              </div>
            </div>
          ))}
        </div>
      </details>

      <details className="card as-details">
        <summary>Protocol settings</summary>

        <p className="note" style={{ marginTop: 0 }}>
          Active pack: <b>{PACK_LABEL[pack]}</b> — switch it in the header. Regimens are tagged by
          pack and never merged. Switching changes which answer is shown as yours; the other pack
          stays visible for comparison.
        </p>

        <div className="grid c3" style={{ marginTop: 10 }}>
          <label className="field">
            Repeat LFT every (days)
            <input
              type="number"
              min={1}
              value={protocol.recheckIntervalDays}
              onChange={(e) => updateProtocol({ recheckIntervalDays: Number(e.target.value) || 1 })}
            />
          </label>
          <label className="field">
            Rechallenge interval (days)
            <input
              type="number"
              min={1}
              value={protocol.rechallengeIntervalDays}
              onChange={(e) =>
                updateProtocol({ rechallengeIntervalDays: Number(e.target.value) || 1 })
              }
            />
          </label>
          <label className="field">
            Recurrence threshold (\u00d7 ULN)
            <input
              type="number"
              min={1}
              step="0.5"
              value={protocol.recurrenceAltThreshold}
              onChange={(e) =>
                updateProtocol({ recurrenceAltThreshold: Number(e.target.value) || 3 })
              }
            />
          </label>
          <label className="field">
            Bridge regimen (drug ids)
            <input
              type="text"
              value={protocol.bridgeDrugs.join(', ')}
              onChange={(e) =>
                updateProtocol({
                  bridgeDrugs: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
        </div>
        <p className="note">
          These numbers appear verbatim in the orders above. Defaults are conservative
          placeholders — set them to your unit's protocol.
        </p>
        <Provenance p={PROTOCOL_PROVENANCE.recheckIntervalDays} />
      </details>
      <CrossLinks from="dili" onNavigate={onNavigate} />

    </>
  )
}

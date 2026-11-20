import { useMemo } from 'react'
import { usePatient } from '@/store/patientContext'
import { Provenance } from '@/components/Provenance'
import { CrossLinks } from '@/components/CrossLinks'
import type { View } from '@/components/Home'
import { assessResponse } from '@/engine/response'
import { CXR, FAILURE_DEFINITION, TRIGGERS, type Trigger } from '@/content/response'

export function ResponseModule({ onNavigate }: { onNavigate?: (v: View) => void }) {
  const { patient, update } = usePatient()
  const a = useMemo(() => assessResponse(patient), [patient])
  const selected = new Set(patient.responseTriggers ?? [])

  const toggle = (id: Trigger) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    update({ responseTriggers: [...next] })
  }

  return (
    <>
      <div className="card">
        <h2>What are you seeing?</h2>
        <div className="sub">Pick everything that applies.</div>
        <div className="toggle-row">
          {TRIGGERS.map((t) => (
            <label className="toggle" data-on={selected.has(t.id)} key={t.id}>
              <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)} />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {a.verdict && (
        <>
          <div className="verdict tight" data-sev={a.verdict.severity}>
            <h3>{a.verdict.statement.text}</h3>
            <p className="body" style={{ fontSize: 13 }}>{a.verdict.statement.detail}</p>
          </div>
          <Provenance p={a.verdict.statement.provenance} />
        </>
      )}

      <div className="card">
        <h2>{selected.size ? 'Work through these' : 'Causes of a poor response'}</h2>
        <div className="sub">
          WHO’s list of reasons for a poor response, with what to check. Causes tied to what you are seeing, or to
          this patient, come first.
        </div>
        {a.causes.map(({ cause, boosted }, i) => (
          <div className="order" key={cause.id} data-urgency="routine" data-tone={boosted ? 'warn' : 'neutral'}>
            <div className="verb">{i + 1}</div>
            <div className="main">
              <div className="p" style={{ fontSize: 13.5 }}>
                {cause.label}
                {boosted && <span className="pill-interval" style={{ marginLeft: 8 }}>{boosted}</span>}
              </div>
              <div className="meta">{cause.check}</div>
              {cause.goTo && onNavigate && (
                <button className="jump" onClick={() => onNavigate(cause.goTo!)}>
                  Open {cause.goToLabel} →
                </button>
              )}
              <Provenance p={cause.provenance} />
            </div>
          </div>
        ))}
      </div>

      <details className="card as-details">
        <summary>Definitions: conversion, reversion, failure</summary>
        <div style={{ marginTop: 8 }}>
          <p className="meta">{FAILURE_DEFINITION.detail}</p>
          <Provenance p={FAILURE_DEFINITION.provenance} />
          <p className="meta" style={{ marginTop: 10 }}><b>{CXR.text}.</b> {CXR.detail}</p>
          <Provenance p={CXR.provenance} />
        </div>
      </details>

      <CrossLinks from="response" onNavigate={onNavigate} />
    </>
  )
}

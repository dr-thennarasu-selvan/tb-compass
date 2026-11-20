import { useMemo, useState } from 'react'
import { Provenance } from '@/components/Provenance'
import type { ConditionWorkflow } from '@/types/workflow'
import { walk } from '@/engine/workflow'
import { forksFor } from '@/content/deteriorationForks'
import type { View } from '@/components/Home'

function List({ heading, items, tone }: { heading: string; items: string[]; tone?: 'essential' | 'desirable' }) {
  if (items.length === 0) return null
  return (
    <div className="wf-list" data-tone={tone ?? 'plain'}>
      <div className="section-label" style={{ marginTop: 0 }}>{heading}</div>
      <ul className="plain">
        {items.map((i, n) => (
          <li key={n}>{i}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Renders any ConditionWorkflow in the ICMR STW shape. The diagnostic pathway
 * is interactive: the clinician picks the branch at each node and the page
 * walks the graph to the action.
 */
export function ConditionPage({
  wf,
  presetChoices,
  onNavigate,
}: {
  wf: ConditionWorkflow
  /** Branches pre-selected from patient data, e.g. an ADA value. */
  presetChoices?: Record<string, string>
  /** Lets a deterioration fork route to the module that resolves it. */
  onNavigate?: (v: View) => void
}) {
  const [manual, setManual] = useState<Record<string, string>>({})
  const choices = useMemo(() => ({ ...(presetChoices ?? {}), ...manual }), [presetChoices, manual])
  const result = useMemo(() => walk(wf, choices), [wf, choices])

  const choose = (nodeId: string, to: string) =>
    setManual((m) => {
      // Changing an upstream choice invalidates everything chosen after it.
      const idx = result.path.findIndex((n) => n.id === nodeId)
      const downstream = result.path.slice(idx + 1).map((n) => n.id)
      const next: Record<string, string> = { ...m, [nodeId]: to }
      for (const d of downstream) delete next[d]
      return next
    })

  return (
    <>
      <div className="card compact">
        <div className="rhead">
          <span className="shorthand">{wf.title}</span>
          <span className="dur">ICD-10 {wf.icd10}</span>
        </div>
        <div className="grid c2" style={{ marginTop: 8 }}>
          <List heading="When to suspect — history" items={wf.whenToSuspect.history} />
          <List heading="Examination" items={wf.whenToSuspect.examination} />
        </div>
      </div>

      <div className="card compact">
        <div className="grid c2">
          <List heading="Investigations — essential" items={wf.investigations.essential} tone="essential" />
          <List heading="Desirable" items={wf.investigations.desirable} tone="desirable" />
        </div>
      </div>

      <div className="card">
        <h2>Diagnostic pathway</h2>
        <div className="sub">Choose the branch at each step. The action appears when the pathway ends.</div>
        {result.path.map((node) => {
          const chosen = choices[node.id]
          return (
            <div className="wf-node" key={node.id} data-terminal={node.action && !chosen ? 'true' : 'false'}>
              <div className="wf-text">{node.text}</div>
              {node.branches && (
                <div className="toggle-row" style={{ marginTop: 6 }}>
                  {node.branches.map((b) => (
                    <label key={b.to} className="toggle sm" data-on={chosen === b.to}>
                      <input type="radio" checked={chosen === b.to} onChange={() => choose(node.id, b.to)} />
                      {b.label}
                    </label>
                  ))}
                </div>
              )}
              {node.action && !chosen && (
                <div className="verdict tight" data-sev={node.severity ?? 'info'} style={{ marginTop: 8, marginBottom: 0 }}>
                  <h3 style={{ fontSize: 15 }}>{node.action}</h3>
                </div>
              )}
            </div>
          )
        })}
        {Object.keys(manual).length > 0 && (
          <button className="ghost" style={{ marginTop: 8 }} onClick={() => setManual({})}>
            reset pathway
          </button>
        )}
      </div>

      {wf.conflicts?.map((c) => (
        <div className="card" key={c.id}>
          <div className="order" data-urgency="immediate" data-tone="critical">
            <div className="verb">Conflict</div>
            <div className="main">
              <div className="p">{c.text}</div>
              {c.detail && <div className="meta">{c.detail}</div>}
              <Provenance p={c.provenance} />
            </div>
          </div>
        </div>
      ))}

      <div className="card compact">
        <div className="grid c3">
          <List heading="Treatment and response" items={wf.management.treatment} />
          <List heading="When to refer" items={wf.management.whenToRefer} />
          <List heading="Follow up" items={wf.management.followUp} />
        </div>
        <Provenance p={wf.provenance} />
      </div>

      {forksFor(wf.id).map((fork) => (
        <div className="card" key={fork.id}>
          <h2>{fork.trigger}</h2>
          <div className="sub">
            Different problems with different actions. Pick the branch that matches.
          </div>
          {fork.branches.map((b, i) => (
            <div className="order" key={i} data-urgency="same-day" data-tone="warn">
              <div className="verb">{i + 1}</div>
              <div className="main">
                <div className="p">{b.label}</div>
                <div className="meta">{b.action}</div>
                {b.goTo && onNavigate && (
                  <button className="jump" onClick={() => onNavigate(b.goTo!)}>
                    Open {b.goToLabel} →
                  </button>
                )}
              </div>
            </div>
          ))}
          <Provenance p={fork.provenance} />
        </div>
      ))}

      {wf.complications && (
        <div className="card">
          <h2>Complications to watch for</h2>
          <div className="sub">Each with the presentation that signals it.</div>
          {wf.complications.items.map((c) => (
            <div className="order" key={c.name} data-urgency="routine" data-tone="warn">
              <div className="verb" style={{ flexBasis: 0, display: 'none' }} />
              <div className="main">
                <div className="p">{c.name}</div>
                <div className="meta">{c.presentation}</div>
              </div>
            </div>
          ))}
          <Provenance p={wf.complications.provenance} />
        </div>
      )}

      {wf.tables?.map((t) => (
        <details className="card as-details" key={t.title}>
          <summary>{t.title}</summary>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  {t.columns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((cell, n) => (
                      <td key={n} data-first={n === 0 ? 'true' : 'false'}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Provenance p={t.provenance} />
        </details>
      ))}
    </>
  )
}

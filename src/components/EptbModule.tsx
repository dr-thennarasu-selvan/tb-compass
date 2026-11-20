import { useState } from 'react'
import { usePatient } from '@/store/patientContext'
import { ConditionPage } from '@/components/ConditionPage'
import { WORKFLOWS } from '@/content/workflows'
import { pleuralAdaBranch } from '@/engine/workflow'
import { SpecimenGuide } from '@/components/SpecimenGuide'
import { CrossLinks } from '@/components/CrossLinks'

export function EptbModule({ onNavigate }: { onNavigate?: (v: import('@/components/Home').View) => void }) {
  const { patient } = usePatient()
  const sitesInContext = patient.sites
  const [workflowId, setWorkflowId] = useState<string | null>(null)
  const [ada, setAda] = useState<number | undefined>(undefined)

  const activeWorkflow = WORKFLOWS.find((w) => w.id === workflowId) ?? null
  // Pre-select the ADA branch of the pleural pathway from the value entered.
  const adaBranch = pleuralAdaBranch(ada)
  const preset: Record<string, string> = {}
  if (activeWorkflow?.id === 'pleural' && adaBranch) {
    preset['ada'] = adaBranch === 'below-40' ? 'biopsy' : adaBranch === '40-69' ? 'intermediate' : 'empiric'
  }

  // Workflows matching a site already in the patient context, listed first.
  const relevant = WORKFLOWS.filter((w) => sitesInContext.includes(w.site))

  return (
    <>
      <div className="card compact">
        <div className="section-label" style={{ marginTop: 0 }}>
          Condition workflows — ICMR STW
        </div>
        {relevant.length > 0 && (
          <p className="note" style={{ marginTop: 0, marginBottom: 8 }}>
            Matching this patient's recorded sites: {relevant.map((w) => w.title).join(', ')}.
          </p>
        )}
        <div className="toggle-row">
          {[...WORKFLOWS].sort((a, b) => {
            const ra = sitesInContext.includes(a.site) ? 0 : 1
            const rb = sitesInContext.includes(b.site) ? 0 : 1
            return ra - rb
          }).map((w) => (
            <label key={w.id} className="toggle" data-on={workflowId === w.id}>
              <input
                type="radio"
                checked={workflowId === w.id}
                onChange={() => setWorkflowId(workflowId === w.id ? null : w.id)}
              />
              {w.title}
            </label>
          ))}
        </div>
        {activeWorkflow?.id === 'pleural' && (
          <div className="grid c3" style={{ marginTop: 10 }}>
            <label className="field">
              Pleural fluid ADA (U/L)
              <input
                type="number"
                inputMode="decimal"
                value={ada ?? ''}
                onChange={(e) => setAda(e.target.value === '' ? undefined : Number(e.target.value))}
              />
            </label>
          </div>
        )}
        <p className="note">
          Same shape as the national workflow: when to suspect → investigations → diagnostic
          pathway → management.
        </p>
      </div>

      {activeWorkflow && (
        <ConditionPage wf={activeWorkflow} presetChoices={preset} onNavigate={onNavigate} />
      )}

      <SpecimenGuide />
      <CrossLinks from="eptb" onNavigate={onNavigate} />
    </>
  )
}

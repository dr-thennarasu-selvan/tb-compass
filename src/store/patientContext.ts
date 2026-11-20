import { createContext, useContext } from 'react'
import type { PatientContext } from '@/types/patient'
import type { DiliProtocol } from '@/content/playbooks/dili'
import type { GuidelinePack } from '@/types/content'

/**
 * The context object and its hook live in their own module, separate from the
 * provider component.
 *
 * React Fast Refresh remounts a module that exports components. When the
 * context object was created in the same file as <PatientProvider>, editing
 * that file handed the provider a new context identity while consumers still
 * held the old one, and every consumer threw "must be used inside
 * <PatientProvider>" until a hard reload. Keeping non-component exports here
 * makes HMR stable.
 */

export interface PatientStore {
  patient: PatientContext
  update: (patch: Partial<PatientContext>) => void
  updateLabs: (patch: Partial<PatientContext['labs']>) => void
  reset: () => void
  updateDiagnosis: (patch: Partial<import('@/types/diagnosis').DiagnosticState>) => void
  protocol: DiliProtocol
  updateProtocol: (patch: Partial<DiliProtocol>) => void
  /** Active guideline pack. Content is tagged, never merged across packs. */
  pack: GuidelinePack
  setPack: (p: GuidelinePack) => void
}

export const PatientCtx = createContext<PatientStore | null>(null)

export function usePatient(): PatientStore {
  const v = useContext(PatientCtx)
  if (!v) throw new Error('usePatient must be used inside <PatientProvider>')
  return v
}

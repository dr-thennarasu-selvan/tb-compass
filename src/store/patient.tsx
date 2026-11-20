import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PatientCtx } from '@/store/patientContext'
import { deriveClassification } from '@/engine/cascade'
import type { GuidelinePack } from '@/types/content'
import { emptyContext, type PatientContext } from '@/types/patient'
import { protocolFor, type DiliProtocol } from '@/content/playbooks/dili'

/**
 * Patient context store.
 *
 * Persistence is localStorage only, and deliberately so: there is no network
 * layer in this application. If a future version adds sync, that decision needs
 * a data-protection review first — it is not a small change.
 *
 * localStorage can throw or return nothing (private browsing, cleared site
 * data), so every access is guarded and the app works without it.
 */

const KEY = 'tbcompass.patient.v1'
const PROTOCOL_KEY = 'tbcompass.protocol.v1'
const PACK_KEY = 'tbcompass.pack.v1'

function load(): PatientContext {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyContext()
    const parsed = JSON.parse(raw) as Partial<PatientContext>
    // Older saved contexts predate the cascade and have no `diagnosis`.
    return { ...emptyContext(), ...parsed, diagnosis: { ...emptyContext().diagnosis, ...(parsed.diagnosis ?? {}) } }
  } catch {
    return emptyContext()
  }
}

function loadProtocol(pack: GuidelinePack): DiliProtocol {
  const base = protocolFor(pack)
  try {
    const raw = localStorage.getItem(`${PROTOCOL_KEY}.${pack}`)
    if (!raw) return { ...base }
    return { ...base, ...(JSON.parse(raw) as Partial<DiliProtocol>) }
  } catch {
    return { ...base }
  }
}

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<PatientContext>(load)
  const [pack, setPackState] = useState<GuidelinePack>(() => {
    try {
      const v = localStorage.getItem(PACK_KEY)
      return v === 'ntep' || v === 'who' ? v : 'who'
    } catch {
      return 'who'
    }
  })
  // Protocol overrides are stored PER PACK. Switching pack must not carry
  // WHO's bridge regimen or intervals across to NTEP — those are the values
  // that differ most between the two.
  const [protocol, setProtocol] = useState<DiliProtocol>(() => loadProtocol(pack))

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(patient))
    } catch {
      /* storage unavailable — the app still works, state just will not persist */
    }
  }, [patient])

  const update = useCallback((patch: Partial<PatientContext>) => {
    setPatient((p) => ({ ...p, ...patch }))
  }, [])

  const updateLabs = useCallback((patch: Partial<PatientContext['labs']>) => {
    setPatient((p) => ({ ...p, labs: { ...p.labs, ...patch } }))
  }, [])

  const reset = useCallback(() => setPatient(emptyContext()), [])

  const updateDiagnosis = useCallback(
    (patch: Partial<import('@/types/diagnosis').DiagnosticState>) => {
      setPatient((p) => {
        const diagnosis = { ...p.diagnosis, ...patch }
        // Keep the cached classification in step with the cascade, so the
        // complication modules never read a stale value.
        return { ...p, diagnosis, classification: deriveClassification(diagnosis).classification }
      })
    },
    [],
  )

  useEffect(() => {
    try {
      localStorage.setItem(`${PROTOCOL_KEY}.${pack}`, JSON.stringify(protocol))
    } catch {
      /* ignore */
    }
  }, [protocol, pack])

  const updateProtocol = useCallback((patch: Partial<DiliProtocol>) => {
    setProtocol((p) => ({ ...p, ...patch }))
  }, [])

  const setPack = useCallback((p: GuidelinePack) => {
    setPackState(p)
    setProtocol(loadProtocol(p))
    try {
      localStorage.setItem(PACK_KEY, p)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({
      patient,
      update,
      updateLabs,
      reset,
      updateDiagnosis,
      protocol,
      updateProtocol,
      pack,
      setPack,
    }),
    [patient, update, updateLabs, reset, updateDiagnosis, protocol, updateProtocol, pack, setPack],
  )

  return <PatientCtx.Provider value={value}>{children}</PatientCtx.Provider>
}

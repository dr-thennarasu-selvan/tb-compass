import {
  CO_MEDS,
  INTERACTIONS,
  SECOND_LINE,
  TB_TB,
  UNSOURCED,
  type CoMed,
  type Interaction,
  type InteractionSeverity,
} from '@/content/interactions'
import type { Provenance } from '@/types/content'

/**
 * Interaction checker. Pure: no React, no I/O.
 *
 * The one rule that matters: a pair the sources do not address is reported
 * as UNCOVERED, never silently dropped. An empty result list would read as
 * "no interaction", and for rifampicin that is frequently false.
 */

/** Stored co-medication entries: a CO_MEDS id, an UNSOURCED id, or free text. */
export const FREE_PREFIX = 'free:'

export type SearchHit =
  | { kind: 'sourced'; id: string; name: string; matched: string; classNote?: string }
  | { kind: 'unsourced'; id: string; name: string; matched: string }

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()

export function searchCoMeds(query: string, limit = 8): SearchHit[] {
  const q = norm(query)
  if (q.length < 2) return []
  const hits: (SearchHit & { rank: number })[] = []

  const score = (name: string, aliases: string[]): { rank: number; matched: string } | undefined => {
    const n = norm(name)
    if (n.startsWith(q)) return { rank: 0, matched: name }
    const aliasStart = aliases.find((a) => a.startsWith(q))
    if (aliasStart) return { rank: 1, matched: aliasStart }
    if (n.includes(q)) return { rank: 2, matched: name }
    const aliasIn = aliases.find((a) => a.includes(q))
    if (aliasIn) return { rank: 3, matched: aliasIn }
    return undefined
  }

  for (const c of CO_MEDS) {
    const s = score(c.name, c.aliases)
    if (s) hits.push({ kind: 'sourced', id: c.id, name: c.name, matched: s.matched, classNote: c.classNote, rank: s.rank })
  }
  for (const u of UNSOURCED) {
    const s = score(u.name, u.aliases)
    if (s) hits.push({ kind: 'unsourced', id: u.id, name: u.name, matched: s.matched, rank: s.rank + 0.5 })
  }
  return hits
    .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(({ rank: _rank, ...h }) => h)
}

export function coMedLabel(id: string): string {
  if (id.startsWith(FREE_PREFIX)) return id.slice(FREE_PREFIX.length)
  return CO_MEDS.find((c) => c.id === id)?.name ?? UNSOURCED.find((u) => u.id === id)?.name ?? id
}

export function isSourced(id: string): boolean {
  return CO_MEDS.some((c) => c.id === id)
}

/**
 * Each selected entry, plus what it expands to. `via` keeps the name the
 * physician actually picked, so a TLD selection reports "via TLD".
 */
function expand(selected: string[]): { id: string; via: string }[] {
  const out: { id: string; via: string }[] = []
  const seen = new Set<string>()
  const add = (id: string, via: string) => {
    const key = `${id}|${via}`
    if (seen.has(key)) return
    seen.add(key)
    out.push({ id, via })
  }
  for (const s of selected) {
    add(s, s)
    const c: CoMed | undefined = CO_MEDS.find((x) => x.id === s)
    for (const inc of c?.includes ?? []) add(inc, s)
  }
  return out
}

export interface Finding {
  key: string
  severity: InteractionSeverity
  /** Co-medication as the physician picked it. */
  coMedLabel: string
  /** The entry that matched, when it differs from what was picked (e.g. a combination component). */
  matchedAs?: string
  tbDrugs: string[]
  effect: string
  action: string
  provenance: Provenance
}

export interface Uncovered {
  coMed: string
  label: string
  /** 'unsourced' — the drug is not in any source. 'no-pair' — it is, but not with these TB drugs. 'unrecognised' — free text. */
  reason: 'unsourced' | 'no-pair' | 'unrecognised'
}

export interface InteractionReport {
  findings: Finding[]
  tbTb: Finding[]
  uncovered: Uncovered[]
}

export const SEVERITY_ORDER: InteractionSeverity[] = ['avoid', 'adjust', 'separate', 'monitor', 'info']

const TB_NAME: Record<string, string> = {
  isoniazid: 'Isoniazid', rifampicin: 'Rifampicin', pyrazinamide: 'Pyrazinamide', ethambutol: 'Ethambutol',
  levofloxacin: 'Levofloxacin', moxifloxacin: 'Moxifloxacin', amikacin: 'Amikacin', streptomycin: 'Streptomycin',
  linezolid: 'Linezolid', bedaquiline: 'Bedaquiline', ethionamide: 'Ethionamide', pretomanid: 'Pretomanid',
  clofazimine: 'Clofazimine', cycloserine: 'Cycloserine', delamanid: 'Delamanid',
}
export const tbName = (id: string) => TB_NAME[id] ?? id

function triggering(i: Interaction, tb: string[]): string[] {
  if (i.tbDrugs.includes('second-line')) return tb.filter((d) => SECOND_LINE.includes(d))
  return i.tbDrugs.filter((d) => tb.includes(d))
}

export function checkInteractions(tbDrugs: string[], coMeds: string[]): InteractionReport {
  const findings: Finding[] = []
  const uncovered: Uncovered[] = []
  const expanded = expand(coMeds)

  for (const picked of coMeds) {
    if (picked.startsWith(FREE_PREFIX)) {
      uncovered.push({ coMed: picked, label: coMedLabel(picked), reason: 'unrecognised' })
      continue
    }
    if (!isSourced(picked)) {
      uncovered.push({ coMed: picked, label: coMedLabel(picked), reason: 'unsourced' })
      continue
    }

    const mine = expanded.filter((e) => e.via === picked)
    let hit = false
    const triggeredBy = new Set<string>()
    for (const { id } of mine) {
      for (const i of INTERACTIONS.filter((x) => x.coMed === id)) {
        const trig = triggering(i, tbDrugs)
        if (trig.length === 0) continue
        hit = true
        trig.forEach((t) => triggeredBy.add(t))
        findings.push({
          key: `${picked}:${i.id}`,
          severity: i.severity,
          coMedLabel: coMedLabel(picked),
          matchedAs: id === picked ? undefined : id === 'art-other' ? 'antiretroviral therapy in general' : coMedLabel(id).toLowerCase(),
          tbDrugs: trig.map(tbName),
          effect: i.effect,
          action: i.action,
          provenance: i.provenance,
        })
      }
    }
    if (!hit && tbDrugs.length > 0) {
      uncovered.push({ coMed: picked, label: coMedLabel(picked), reason: 'no-pair' })
    } else if (hit && tbDrugs.includes('rifampicin') && !triggeredBy.has('rifampicin')) {
      // A finding against another TB drug must not hide the rifampicin pair.
      // The pill flagged against a DR-TB drug says nothing about the pill with
      // rifampicin, and that silence would read as reassurance.
      uncovered.push({ coMed: `${picked}+rifampicin`, label: `${coMedLabel(picked)} with rifampicin`, reason: 'no-pair' })
    }
  }

  const tbTb: Finding[] = TB_TB.filter((p) => tbDrugs.includes(p.a) && tbDrugs.includes(p.b)).map((p) => ({
    key: p.id,
    severity: p.severity,
    coMedLabel: tbName(p.b),
    tbDrugs: [tbName(p.a)],
    effect: p.effect,
    action: p.action,
    provenance: p.provenance,
  }))

  const bySeverity = (a: Finding, b: Finding) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  return { findings: findings.sort(bySeverity), tbTb, uncovered }
}

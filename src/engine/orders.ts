import type { GuidelinePack, Provenance } from '@/types/content'
import type { PatientContext } from '@/types/patient'
import { drug } from '@/content/drugs'
import {
  ALTERNATIVE_CAUSES,
  ADSM_REQUIRED,
  DILI_ACTIONS,
  thresholdsFor,
  PROTOCOL_PROVENANCE,
  type DiliProtocol,
} from '@/content/playbooks/dili'
import type { DiliAssessment } from '@/engine/dili'
import { DR_REGIMENS } from '@/content/drRegimens'
import { evaluateRegimen } from '@/engine/drtb'

/**
 * An order line.
 *
 * `verb` and `primary` are what the clinician reads at the bedside and must be
 * short enough to scan. Everything explanatory goes in `why`, which the UI keeps
 * collapsed. If `primary` needs a comma and a subordinate clause, it is too long.
 */
export interface Order {
  id: string
  verb: string
  primary: string
  /** When, or until what condition. Short. */
  timing?: string
  /** The condition under which this order applies. Short. */
  qualifier?: string
  /** Sort position and the tag shown for timing pressure. */
  urgency: 'immediate' | 'same-day' | 'routine'
  /**
   * Visual weight of the verb, which is NOT the same as urgency: "Continue" is
   * acted on immediately but is reassurance, not alarm, and must not read red.
   */
  tone?: 'critical' | 'warn' | 'good' | 'neutral'
  why?: string
  provenance: Provenance
  /** Rendered in red — a contraindication or hard stop. */
  alert?: string
}

const names = (ids: string[]) =>
  ids
    .map((id) => drug(id)?.name ?? id)
    .join(' · ')

export function buildOrders(
  ctx: PatientContext,
  a: DiliAssessment,
  protocol: DiliProtocol,
  pack: GuidelinePack,
): Order[] {
  const out: Order[] = []
  const recheck = protocol.recheckIntervalDays
  const rechallengeLimit = thresholdsFor(pack).rechallengeAlt.value

  if (a.alarmsPresent.length > 0) {
    out.push({
      id: 'o.refer',
      verb: 'Refer',
      primary: 'Hepatology or critical care',
      timing: 'now',
      qualifier: a.alarmsPresent.join(', ').toLowerCase(),
      urgency: 'immediate',
      tone: 'critical',
      why: DILI_ACTIONS.referUrgent.detail,
      provenance: DILI_ACTIONS.referUrgent.provenance,
    })
  }

  if (a.withdrawal.indicated) {
    if (a.culprits.length > 0) {
      out.push({
        id: 'o.stop',
        verb: 'Stop',
        primary: names(a.culprits.map((d) => d.id)),
        timing: `now — hold until ALT <${rechallengeLimit}\u00d7 ULN`,
        urgency: 'immediate',
        why: DILI_ACTIONS.stopHepatotoxic.detail,
        provenance: DILI_ACTIONS.stopHepatotoxic.provenance,
      })
    }

    if (a.retained.length > 0) {
      out.push({
        id: 'o.continue',
        verb: 'Continue',
        primary: names(a.retained.map((d) => d.id)),
        urgency: 'immediate',
        tone: 'good',
        why: 'Not hepatotoxic — no hepatic reason to withdraw.',
        provenance: a.retained[0].provenance,
      })
    }

    const aminoglycoside = protocol.bridgeDrugs.some((d) =>
      ['amikacin', 'streptomycin'].includes(d),
    )
    out.push({
      id: 'o.bridge',
      verb: 'Bridge',
      primary: names(protocol.bridgeDrugs),
      timing: `until ALT <${rechallengeLimit}× ULN`,
      qualifier: 'if smear-positive, severe, CNS, or deteriorating',
      urgency: 'same-day',
      why: DILI_ACTIONS.bridgeRegimen.detail,
      provenance: PROTOCOL_PROVENANCE.bridgeDrugs,
      alert:
        aminoglycoside && ctx.pregnant
          ? 'Aminoglycoside in pregnancy — substitute before prescribing.'
          : undefined,
    })

    if (pack === 'ntep') {
      out.push({
        id: 'o.stop-all',
        verb: 'Escalate',
        primary: 'Stop all drugs if hepatitis worsens on the bridge',
        qualifier: 'not resolving on three non-hepatotoxic drugs',
        urgency: 'same-day',
        tone: 'warn',
        why: DILI_ACTIONS.stopAllIfWorsening.detail,
        provenance: DILI_ACTIONS.stopAllIfWorsening.provenance,
      })
    }
  }

  // Investigations split from bedside questions: a lab order line that includes
  // "alcohol history" is not an order anyone can action at the phlebotomy desk.
  const pending = ALTERNATIVE_CAUSES.filter(
    (c) => !a.excludedCauseIds.includes(c.id) && c.tier === 'first',
  )
  const labs = Array.from(new Set(pending.flatMap((c) => c.labs)))
  if (labs.length > 0) {
    out.push({
      id: 'o.send',
      verb: 'Send',
      primary: labs.join(' · '),
      timing: 'today',
      urgency: 'same-day',
      why: DILI_ACTIONS.excludeOther.detail,
      provenance: DILI_ACTIONS.excludeOther.provenance,
    })
  }
  const bedside = Array.from(new Set(pending.flatMap((c) => c.bedside)))
  if (bedside.length > 0) {
    out.push({
      id: 'o.ask',
      verb: 'Ask',
      primary: bedside.join(' · '),
      urgency: 'same-day',
      tone: 'neutral',
      why: 'Excludes the causes no blood test will find.',
      provenance: DILI_ACTIONS.excludeOther.provenance,
    })
  }

  if (a.needsBilirubinSplit) {
    out.push({
      id: 'o.bili',
      verb: 'Send',
      primary: 'Direct (conjugated) bilirubin',
      timing: 'today',
      qualifier: 'jaundice on rifampicin',
      urgency: 'same-day',
      why: DILI_ACTIONS.checkBilirubinSplit.detail,
      provenance: DILI_ACTIONS.checkBilirubinSplit.provenance,
    })
  }

  out.push({
    id: 'o.lft',
    verb: 'Repeat LFT',
    primary: 'ALT · AST · bilirubin · INR',
    timing: `in ${recheck} day${recheck === 1 ? '' : 's'}, then every ${recheck} days until ALT <${rechallengeLimit}× ULN`,
    urgency: 'routine',
    why: DILI_ACTIONS.monitorSerial.detail,
    provenance: PROTOCOL_PROVENANCE.recheckIntervalDays,
  })

  // aDSM applies to DR-TB regimens, where enzyme rises are frequent and often
  // asymptomatic — symptom-triggered testing alone misses them.
  const drTbClassification = ['rr-tb', 'mdr-tb', 'pre-xdr-tb', 'xdr-tb'].includes(
    ctx.classification ?? '',
  )
  const drTbDrugs = ['bedaquiline', 'pretomanid', 'linezolid', 'clofazimine'].some((d) =>
    ctx.currentDrugs.includes(d),
  )
  if (drTbClassification || drTbDrugs) {
    out.push({
      id: 'o.adsm',
      verb: 'aDSM',
      primary: 'Scheduled liver monitoring regardless of symptoms',
      timing: `every ${recheck} days while off treatment, then per regimen schedule`,
      urgency: 'routine',
      tone: 'neutral',
      why: ADSM_REQUIRED.detail,
      provenance: ADSM_REQUIRED.provenance,
    })
  }

  out.push({
    id: 'o.avoid-future',
    verb: 'Record',
    primary: 'Culprit drug — to be avoided in all future regimens',
    urgency: 'routine',
    tone: 'neutral',
    why: DILI_ACTIONS.avoidInFuture.detail,
    provenance: DILI_ACTIONS.avoidInFuture.provenance,
  })

  out.push({
    id: 'o.counsel',
    verb: 'Counsel',
    primary: 'Return immediately if symptoms recur',
    urgency: 'routine',
    why: DILI_ACTIONS.counselReport.detail,
    provenance: DILI_ACTIONS.counselReport.provenance,
  })

  // Cross-module consequence: liver injury can disqualify a DR-TB patient from
  // BPaLM. Surfacing it here means the physician learns it while managing the
  // hepatitis, not weeks later when the regimen is being chosen.
  const bpalmLiver = evaluateRegimen(DR_REGIMENS.find((r) => r.id === 'bpalm')!, ctx).evaluated.find(
    (e) => e.criterion.id === 'liver-ok',
  )
  const mdrPatient = ['rr-tb', 'mdr-tb', 'pre-xdr-tb', 'xdr-tb'].includes(ctx.classification ?? '')
  if (mdrPatient && bpalmLiver?.result === 'not-met') {
    out.push({
      id: 'o.bpalm-excluded',
      verb: 'Note',
      primary: 'This liver panel now excludes BPaLM',
      qualifier: bpalmLiver.because,
      urgency: 'same-day',
      tone: 'warn',
      why: 'NTEP excludes BPaLM where AST/ALT exceeds 3x ULN AND total bilirubin exceeds 2x ULN. Re-check once the liver recovers — the exclusion is on the current panel, not permanent.',
      provenance: bpalmLiver.criterion.provenance,
    })
  }

  const rank = { immediate: 0, 'same-day': 1, routine: 2 } as const
  return out.sort((x, y) => rank[x.urgency] - rank[y.urgency])
}

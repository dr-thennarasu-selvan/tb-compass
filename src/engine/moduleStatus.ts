import type { Severity } from '@/types/content'
import type { PatientContext } from '@/types/patient'
import { assessDili } from '@/engine/dili'
import { buildOrders } from '@/engine/orders'
import { evaluateAll } from '@/engine/drtb'
import { assessQt } from '@/engine/qt'
import { assessPregnancy } from '@/engine/pregnancy'
import { checkInteractions } from '@/engine/interactions'
import { assessDiabetes } from '@/engine/diabetes'
import { assessResponse } from '@/engine/response'
import { deriveClassification } from '@/engine/cascade'
import { protocolFor } from '@/content/playbooks/dili'
import type { GuidelinePack } from '@/types/content'

/**
 * A one-line live status for a module card, computed from the patient context.
 *
 * The point is that the home screen should tell the clinician where to go. A
 * card reading "3 immediate orders" is a different thing from a card reading
 * "nothing entered", and the difference is what makes the landing page useful
 * rather than a menu.
 *
 * Returns undefined when the module has nothing to say — an empty card is
 * better than a card that invents urgency.
 */
export interface ModuleStatus {
  text: string
  severity: Severity
}

export function moduleStatus(
  view: string,
  ctx: PatientContext,
  pack: GuidelinePack,
): ModuleStatus | undefined {
  switch (view) {
    case 'cascade': {
      const d = deriveClassification(ctx.diagnosis)
      if (d.classification === 'unknown' && d.pending.length === 0) return undefined
      if (d.pending.length > 0) {
        return {
          text: `${d.pending.length} result${d.pending.length === 1 ? '' : 's'} pending — classification provisional`,
          severity: 'caution',
        }
      }
      return { text: 'Classification settled on current results', severity: 'ok' }
    }

    case 'dili': {
      if (ctx.labs.alt == null && ctx.labs.ast == null) return undefined
      const a = assessDili(ctx, { symptoms: [], alarms: [], excludedCauses: [] }, pack)
      if (a.withdrawal.indicated) {
        const orders = buildOrders(ctx, a, protocolFor(pack), pack)
        const immediate = orders.filter((o) => o.urgency === 'immediate').length
        return {
          text: `Withdrawal threshold crossed — ${immediate} immediate order${immediate === 1 ? '' : 's'}`,
          severity: a.hysLaw.met ? 'critical' : 'warning',
        }
      }
      return { text: 'Below withdrawal threshold', severity: 'ok' }
    }

    case 'drtb': {
      if (!ctx.classification || ctx.classification === 'unknown') return undefined
      const results = evaluateAll(ctx)
      const eligible = results.filter((r) => r.verdict === 'eligible')
      if (eligible.length > 0) return { text: `${eligible[0].regimen.name} eligible`, severity: 'ok' }
      const indet = results.filter((r) => r.verdict === 'indeterminate').length
      if (indet > 0) return { text: `${indet} regimen${indet === 1 ? '' : 's'} indeterminate`, severity: 'caution' }
      return { text: 'No regimen eligible on recorded context', severity: 'warning' }
    }

    case 'qt': {
      const q = assessQt(ctx, {
        symptomaticArrhythmia: false,
        confirmedOnTwoEcgs: false,
        lifeThreatening: false,
      })
      if (q.ecgRequired && ctx.labs.qtc == null) {
        return { text: 'ECG monitoring required — no QTcF recorded', severity: 'warning' }
      }
      if (q.grade && q.grade.grade > 0) return { text: q.grade.label, severity: q.grade.severity }
      if (q.grade) return { text: 'QTcF normal', severity: 'ok' }
      return undefined
    }

    case 'iris': {
      if (!ctx.hivPositive) return undefined
      if (ctx.cd4 != null && ctx.cd4 < 50) {
        return { text: `CD4 ${ctx.cd4} — highest IRIS risk band`, severity: 'critical' }
      }
      if (ctx.daysSinceArt != null && ctx.daysSinceArt <= 90) {
        return { text: `Day ${ctx.daysSinceArt} of ART — within the IRIS window`, severity: 'caution' }
      }
      return { text: 'HIV positive', severity: 'info' }
    }

    case 'dstb': {
      if (ctx.weightKg == null) return undefined
      const b = ctx.weightKg
      const band = b >= 76 ? 6 : b >= 65 ? 5 : b >= 50 ? 4 : b >= 35 ? 3 : b >= 25 ? 2 : undefined
      if (!band) return { text: 'Below adult weight bands', severity: 'caution' }
      return { text: `${band} FDC tablets daily`, severity: 'ok' }
    }

    case 'renal': {
      if (ctx.ageYears == null || ctx.weightKg == null || ctx.labs.creatinine == null) return undefined
      const base = ((140 - ctx.ageYears) * ctx.weightKg) / (72 * ctx.labs.creatinine)
      const crcl = ctx.sex === 'female' ? base * 0.85 : base
      if (crcl < 30) return { text: `CrCl ${crcl.toFixed(0)} mL/min`, severity: 'critical' }
      if (crcl < 60) return { text: `CrCl ${crcl.toFixed(0)} mL/min`, severity: 'caution' }
      return { text: `CrCl ${crcl.toFixed(0)} mL/min`, severity: 'ok' }
    }

    case 'eptb': {
      if (ctx.sites.length === 0) return undefined
      const extra = ctx.sites.filter((s) => s !== 'pulmonary')
      if (extra.length === 0) return undefined
      return { text: `${extra.join(', ')} recorded`, severity: 'info' }
    }

    case 'interactions': {
      if (ctx.coMedications.length === 0 || ctx.currentDrugs.length === 0) return undefined
      const r = checkInteractions(ctx.currentDrugs, ctx.coMedications)
      const avoid = r.findings.filter((f) => f.severity === 'avoid').length
      const change = r.findings.filter((f) => f.severity === 'adjust' || f.severity === 'separate').length + r.tbTb.length
      if (avoid > 0) return { text: `${avoid} combination${avoid === 1 ? '' : 's'} to avoid`, severity: 'critical' }
      if (change > 0) return { text: `${change} needing a dose or timing change`, severity: 'warning' }
      if (r.uncovered.length > 0) {
        return { text: `${r.uncovered.length} not covered by the sources`, severity: 'caution' }
      }
      const monitor = r.findings.filter((f) => f.severity === 'monitor').length
      if (monitor > 0) return { text: `${monitor} to monitor`, severity: 'info' }
      return { text: 'Combinations usable as stated', severity: 'ok' }
    }

    case 'response': {
      const r = assessResponse(ctx)
      if (!r.verdict) return undefined
      return { text: r.verdict.statement.text.split(' — ')[0], severity: r.verdict.severity }
    }

    case 'diabetes': {
      const d = assessDiabetes(ctx)
      if (d.step === 'not-screened' && !ctx.labs.rbs) return undefined
      return { text: d.headline, severity: d.severity }
    }

    case 'airways': {
      if (!ctx.copd && !ctx.asthma) return undefined
      const label = [ctx.copd && 'COPD', ctx.asthma && 'asthma'].filter(Boolean).join(' + ')
      if (ctx.copd && ctx.onInhaledSteroid) {
        return { text: `${label} on ICS — TB risk caution applies`, severity: 'caution' }
      }
      return { text: `${label} recorded`, severity: 'info' }
    }

    case 'pregnancy': {
      const a = assessPregnancy(ctx)
      if (!a.applies) return undefined
      const stop = a.flags.filter((f) => f.severity === 'critical')
      if (stop.length > 0) {
        return {
          text: `${stop.map((f) => f.note.name.split(' (')[0]).join(', ')} — barred ${ctx.pregnant ? 'in pregnancy' : 'while breastfeeding'}`,
          severity: 'critical',
        }
      }
      const check = a.flags.filter((f) => f.severity === 'warning')
      if (check.length > 0) {
        return {
          text: `${check.map((f) => f.note.name.split(' (')[0]).join(', ')} — decision needed`,
          severity: 'warning',
        }
      }
      if (ctx.pregnant) {
        return {
          text: ctx.gestationWeeks != null ? `Pregnant · ${ctx.gestationWeeks} weeks` : 'Pregnant — gestation not recorded',
          severity: ctx.gestationWeeks != null ? 'info' : 'caution',
        }
      }
      return { text: 'Breastfeeding', severity: 'info' }
    }

    default:
      return undefined
  }
}

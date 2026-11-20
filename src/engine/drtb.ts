import type { PatientContext } from '@/types/patient'
import { DR_REGIMENS, type Criterion, type DrRegimen } from '@/content/drRegimens'
import { xUln } from '@/engine/dili'

/**
 * Eligibility evaluation for NTEP DR-TB regimens.
 *
 * Three-valued on purpose. `unknown` is not a soft `fail`: it means the context
 * lacks the field, and the UI must say which field rather than quietly
 * disqualifying a regimen the patient may well be eligible for.
 */
export type CriterionResult = 'met' | 'not-met' | 'unknown'

export interface EvaluatedCriterion {
  criterion: Criterion
  result: CriterionResult
  /** Why the engine reached this result, in one short clause. */
  because: string
  /** Names the missing context field when result is `unknown`. */
  missing?: string
}

export interface RegimenEligibility {
  regimen: DrRegimen
  /** 'eligible' only when nothing fails AND nothing is unknown. */
  verdict: 'eligible' | 'not-eligible' | 'indeterminate'
  evaluated: EvaluatedCriterion[]
  blockers: EvaluatedCriterion[]
  unknowns: EvaluatedCriterion[]
}

const SEVERE_EPTB_SITES = ['cns', 'bone-joint', 'miliary-disseminated'] as const

function evaluate(c: Criterion, ctx: PatientContext): EvaluatedCriterion {
  const r = (result: CriterionResult, because: string, missing?: string): EvaluatedCriterion => ({
    criterion: c,
    result,
    because,
    missing,
  })

  switch (c.id) {
    case 'age14': {
      if (ctx.ageYears == null) return r('unknown', 'Age not entered.', 'age')
      return ctx.ageYears >= 14
        ? r('met', `Age ${ctx.ageYears}.`)
        : r('not-met', `Age ${ctx.ageYears} is below 14.`)
    }

    case 'mdr-rr': {
      if (!ctx.classification) return r('unknown', 'Classification not set.', 'classification')
      const ok = ['mdr-tb', 'rr-tb', 'pre-xdr-tb', 'xdr-tb'].includes(ctx.classification)
      return ok
        ? r('met', `Classified as ${ctx.classification.toUpperCase()}.`)
        : r('not-met', `Classified as ${ctx.classification}, not MDR/RR-TB.`)
    }

    case 'rif-resistant': {
      if (!ctx.classification) return r('unknown', 'Classification not set.', 'classification')
      const ok = ['rr-tb', 'mdr-tb', 'pre-xdr-tb', 'xdr-tb'].includes(ctx.classification)
      return ok ? r('met', 'Rifampicin resistance present.') : r('not-met', 'No rifampicin resistance.')
    }

    case 'fq-susceptible': {
      if (!ctx.classification) return r('unknown', 'Classification not set.', 'classification')
      // Pre-XDR is defined by fluoroquinolone resistance.
      if (ctx.classification === 'pre-xdr-tb' || ctx.classification === 'xdr-tb') {
        return r('not-met', `${ctx.classification.toUpperCase()} implies fluoroquinolone resistance.`)
      }
      return r('unknown', 'Second-line DST for fluoroquinolones not recorded.', 'second-line DST')
    }

    case 'h-resistant': {
      if (!ctx.classification) return r('unknown', 'Classification not set.', 'classification')
      return ctx.classification === 'hr-tb'
        ? r('met', 'Hr-TB: isoniazid resistant, rifampicin susceptible.')
        : r('not-met', `Classified as ${ctx.classification}, not Hr-TB.`)
    }

    case 'liver-ok': {
      const alt = Math.max(
        xUln(ctx.labs.alt, ctx.ranges.altUln) ?? 0,
        xUln(ctx.labs.ast, ctx.ranges.astUln) ?? 0,
      )
      const bili = xUln(ctx.labs.bilirubinTotal, ctx.ranges.bilirubinUln)
      if ((ctx.labs.alt == null && ctx.labs.ast == null) || bili == null) {
        return r('unknown', 'Liver panel incomplete.', 'ALT/AST and total bilirubin')
      }
      // The source states AND, not OR — both limbs must be crossed.
      const excluded = alt > 3 && bili > 2
      return excluded
        ? r('not-met', `AST/ALT ${alt.toFixed(1)}× AND bilirubin ${bili.toFixed(1)}× both exceed the limits.`)
        : r(
            'met',
            `AST/ALT ${alt.toFixed(1)}×, bilirubin ${bili.toFixed(1)}× — the exclusion needs BOTH >3× and >2×.`,
          )
    }

    case 'severe-eptb':
    case 'severe-eptb-2': {
      if (ctx.sites.length === 0) return r('unknown', 'No disease site recorded.', 'site of disease')
      const hit = ctx.sites.filter((s) => (SEVERE_EPTB_SITES as readonly string[]).includes(s))
      return hit.length > 0
        ? r('not-met', `Severe extrapulmonary involvement: ${hit.join(', ')}.`)
        : r('met', 'No severe extrapulmonary site recorded.')
    }

    case 'qtcf': {
      if (ctx.labs.qtc == null) return r('unknown', 'QTc not entered.', 'QTc')
      if (ctx.sex !== 'male' && ctx.sex !== 'female') {
        return r('unknown', 'Sex not recorded — the QTcF limit differs by sex.', 'sex')
      }
      const limit = ctx.sex === 'male' ? 450 : 470
      return ctx.labs.qtc > limit
        ? r('not-met', `QTcF ${ctx.labs.qtc} ms exceeds ${limit} ms.`)
        : r('met', `QTcF ${ctx.labs.qtc} ms is within ${limit} ms.`)
    }

    case 'pregnancy': {
      if (ctx.sex === 'male') return r('met', 'Not applicable.')
      if (ctx.pregnant) {
        return r(
          'not-met',
          ctx.mtpDecision === 'willing'
            ? 'Pregnant — BPaLM applies only once the MTP she has opted for is done.'
            : 'Pregnant — BPaLM applies only below 20/24 weeks after MTP. See the pregnancy module for the pathway.',
        )
      }
      // Inclusion iv admits "lactating women but not breast-feeding" — the bar
      // is breastfeeding on pretomanid, not lactation as such.
      if (ctx.breastfeeding) {
        return r('not-met', 'Breastfeeding — not on pretomanid unless she replaces breastfeeding with formula feed.')
      }
      if (ctx.pregnant == null) return r('unknown', 'Pregnancy status not recorded.', 'pregnancy status')
      return r('met', 'Not pregnant, not breastfeeding.')
    }

    // Criteria that depend on history the context does not yet carry.
    case 'drug-resistance':
    case 'no-sld-exposure':
    case 'not-extensive':
    case 'ineligible-others':
    case 'cardiac':
      return r('unknown', 'Not captured in the patient context — confirm manually.', c.label)

    default:
      return r('unknown', 'No evaluation implemented for this criterion.', c.id)
  }
}

export function evaluateRegimen(regimen: DrRegimen, ctx: PatientContext): RegimenEligibility {
  const evaluated = regimen.criteria.map((c) => evaluate(c, ctx))
  const blockers = evaluated.filter((e) => e.result === 'not-met')
  const unknowns = evaluated.filter((e) => e.result === 'unknown')

  const verdict: RegimenEligibility['verdict'] =
    blockers.length > 0 ? 'not-eligible' : unknowns.length > 0 ? 'indeterminate' : 'eligible'

  return { regimen, verdict, evaluated, blockers, unknowns }
}

/** All regimens in NTEP's stated preference order. */
export function evaluateAll(ctx: PatientContext): RegimenEligibility[] {
  return [...DR_REGIMENS]
    .sort((a, b) => a.preference - b.preference)
    .map((r) => evaluateRegimen(r, ctx))
}

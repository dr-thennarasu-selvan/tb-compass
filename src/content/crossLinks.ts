import type { Provenance } from '@/types/content'
import type { PatientContext } from '@/types/patient'
import type { View } from '@/components/Home'

/**
 * Cross-module links.
 *
 * Distinct from the deterioration forks in content/deteriorationForks.ts. Those
 * sit inside a condition workflow and resolve a "this could be three things"
 * sentence. These sit at the foot of a module and connect two modules that
 * share an underlying clinical fact — the sort of connection a set of separate
 * documents cannot make, and the main reason for holding one patient context.
 *
 * `when` keeps a link out of the way until it is actually relevant.
 */
export interface CrossLink {
  id: string
  from: View
  to: View
  toLabel: string
  /** The shared fact. One sentence, stated plainly. */
  why: string
  /** Only render when this holds. Omit to always render. */
  when?: (ctx: PatientContext) => boolean
  provenance: Provenance
}

const shared = (source: string, locator: string): Provenance => ({
  citations: [{ source, locator }],
  status: 'source-checked',
})

export const CROSS_LINKS: CrossLink[] = [
  // --- the bridge regimen is the same object in two modules -----------------
  {
    id: 'link.hs-to-dili',
    from: 'hypersensitivity',
    to: 'dili',
    toLabel: 'Hepatotoxicity module',
    why: 'The non-hepatotoxic bridge here is the same combination used when hepatotoxicity forces withdrawal — a fluoroquinolone with ethambutol and an aminoglycoside. If this patient has also had drug-induced liver injury, both modules are competing for the same three drugs, and ethambutol may already be implicated.',
    provenance: shared('icmr-stw', 'ATT-related hepatitis workflow, non-hepatotoxic bridge; hypersensitivity bridging regimen'),
  },
  {
    id: 'link.dili-to-hs',
    from: 'dili',
    to: 'hypersensitivity',
    toLabel: 'Drug reactions and desensitisation',
    why: 'If the presentation includes a rash as well as deranged liver tests, this may be DRESS rather than isolated drug-induced liver injury. DRESS causes hepatitis in the majority of cases, and it forbids the sequential reintroduction this module would otherwise recommend.',
    when: (ctx) => ctx.labs.alt != null || ctx.labs.ast != null,
    provenance: shared('author-notes-hypersensitivity', 'DRESS vs SJS/TEN — liver involvement is the commonest organ hit'),
  },

  // --- DRESS and IRIS share a differential ---------------------------------
  {
    id: 'link.hs-to-iris',
    from: 'hypersensitivity',
    to: 'iris',
    toLabel: 'IRIS module',
    why: 'IRIS is on the differential for a drug reaction and the reverse is also true — both present as deterioration weeks into treatment. IRIS spares the skin barrier and follows ART; DRESS brings facial oedema, eosinophilia and organ injury. Getting this backwards means either steroids into an undiagnosed reaction, or stopping drugs that were never the problem.',
    when: (ctx) => Boolean(ctx.hivPositive),
    provenance: shared('author-notes-hypersensitivity', 'Section 6, exclude mimics — IRIS and paradoxical reaction'),
  },
  {
    id: 'link.iris-to-hs',
    from: 'iris',
    to: 'hypersensitivity',
    toLabel: 'Drug reactions and desensitisation',
    why: 'Drug reaction is one of the mandatory exclusions before IRIS can be labelled. In a patient on ATT plus co-trimoxazole plus ART, attribution is genuinely hard — and a severe cutaneous reaction forbids re-exposure to whichever drug caused it.',
    provenance: shared('author-notes', 'Section 8, differential diagnosis — drug reaction'),
  },

  // --- the same electrolyte rule, from two directions -----------------------
  {
    id: 'link.qt-to-renal',
    from: 'qt',
    to: 'renal',
    toLabel: 'Renal impairment and dialysis',
    why: 'Every QT grade from 1 upwards turns on the electrolyte result, and dialysis is what moves electrolytes fastest. Potassium, calcium and magnesium all swing across a session, which is why post-dialysis is both when drugs are given and when the ECG is worth repeating.',
    provenance: shared('ntep-drtb-2024', 'Annexure 4, QT prolongation — electrolytes; renal dosing, post-dialysis timing'),
  },
  {
    id: 'link.renal-to-qt',
    from: 'renal',
    to: 'qt',
    toLabel: 'QT prolongation',
    why: 'Bedaquiline, moxifloxacin and clofazimine all need no renal dose change, so patients on dialysis often end up on several QT-prolonging drugs at full dose while their electrolytes swing each session. Correct potassium and magnesium before starting any of them.',
    when: (ctx) =>
      ['bedaquiline', 'moxifloxacin', 'clofazimine', 'levofloxacin', 'delamanid'].some((d) =>
        ctx.currentDrugs.includes(d),
      ),
    provenance: shared('author-notes-renal', 'Core principles — correct K and Mg before QT-prolonging drugs'),
  },

  // --- hepatic disease sits behind the DILI module -------------------------
  {
    id: 'link.dili-to-renal',
    from: 'dili',
    to: 'renal',
    toLabel: 'Renal impairment and dialysis',
    why: 'The two organ modules share a principle: know the elimination route. Isoniazid, rifampicin and pyrazinamide are hazardous in liver disease but need no change in renal failure; ethambutol, the fluoroquinolones and the aminoglycosides are the reverse.',
    provenance: shared('author-notes-renal', 'Core principle governing both situations'),
  },

  // --- interactions reach into three other modules ---------------------------
  {
    id: 'link.ddi-to-qt',
    from: 'interactions',
    to: 'qt',
    toLabel: 'QT prolongation',
    why: 'QT prolongation between TB drugs is graded there. A QT-prolonging co-medication adds to it, and NTEP grades every QT step on the electrolyte result.',
    when: (ctx) =>
      ctx.coMedications.includes('qt-drugs') ||
      (ctx.coMedications.includes('boosted-pi') && ctx.currentDrugs.includes('bedaquiline')),
    provenance: shared('ntep-drtb-2024', 'Table 3.2, p. 25; Annexure 4, p. 64'),
  },
  {
    id: 'link.ddi-to-renal',
    from: 'interactions',
    to: 'renal',
    toLabel: 'Renal impairment and dialysis',
    why: 'A patient on tacrolimus, ciclosporin or sirolimus usually has a transplant. The renal module carries the full transplant plan: rifampicin-free options, rifabutin, trough levels and the rebound when rifampicin stops.',
    when: (ctx) => ctx.coMedications.includes('calcineurin'),
    provenance: shared('author-notes-renal', 'Renal transplant — a separate problem'),
  },
  {
    id: 'link.ddi-to-iris',
    from: 'interactions',
    to: 'iris',
    toLabel: 'IRIS and ART timing',
    why: 'Choosing the antiretroviral and timing its start are one decision. The IRIS module covers when to start ART after TB treatment begins.',
    when: (ctx) => ctx.coMedications.some((id) => ['efavirenz', 'dolutegravir', 'tld', 'tle', 'boosted-pi', 'zidovudine', 'lamivudine', 'art-other'].includes(id)),
    provenance: shared('who-m4-2025', 'Recommendation 6.1, starting ART, p. 150'),
  },
  {
    id: 'link.drtb-to-ddi',
    from: 'drtb',
    to: 'interactions',
    toLabel: 'Drug interactions',
    why: 'NTEP lists concurrent drugs with known interactions or overlapping toxicity as a relative contraindication to BPaLM: CYP450 inducers or inhibitors, QT-prolonging drugs, serotonergic antidepressants and myelosuppressive drugs.',
    provenance: shared('ntep-drtb-2024', 'Table 3.2, relative contraindications for BPaLM, p. 25'),
  },

  // --- not improving ---------------------------------------------------------
  {
    id: 'link.iris-to-response',
    from: 'iris',
    to: 'response',
    toLabel: 'Not improving on treatment',
    why: 'A paradoxical reaction and treatment failure look alike. Before labelling IRIS, the response module walks through resistance, adherence, dosing, absorption and NTM.',
    provenance: shared('who-handbook-m4-2025', 'Section 9, monitoring treatment response, pp. 41–43'),
  },
  {
    id: 'link.dstb-to-response',
    from: 'dstb',
    to: 'response',
    toLabel: 'Not improving on treatment',
    why: 'A positive smear at the end of month 2 is not failure on its own. The response module sets out what it can mean and what to check.',
    provenance: shared('who-handbook-m4-2025', 'Section 9.3, p. 42'),
  },

  // --- diabetes ---------------------------------------------------------------
  {
    id: 'link.dm-to-ddi',
    from: 'diabetes',
    to: 'interactions',
    toLabel: 'Drug interactions',
    why: 'Rifampicin lowers sulfonylurea levels and may raise metformin’s effect; fluoroquinolones disturb glucose control. The checker has each diabetes drug class.',
    when: (ctx) => ctx.currentDrugs.length > 0,
    provenance: shared('who-handbook-m4-2025', 'Section 8.1, p. 35; Annex 1, levofloxacin p. 275, moxifloxacin p. 284'),
  },
  {
    id: 'link.dstb-to-dm',
    from: 'dstb',
    to: 'diabetes',
    toLabel: 'Diabetes',
    why: 'NTEP screens every person with TB for diabetes with a random blood sugar. ATS notes some experts extend treatment to 9 months in poorly controlled diabetes.',
    when: (ctx) => Boolean(ctx.diabetes) || ctx.labs.rbs == null || ctx.labs.rbs >= 110,
    provenance: shared('ntep-dtc-2025', 'Blood sugar screening, p. 32'),
  },

  // --- airways disease -------------------------------------------------------
  {
    id: 'link.airways-to-ddi',
    from: 'airways',
    to: 'interactions',
    toLabel: 'Drug interactions',
    why: 'Rifampicin lowers prednisolone and theophylline levels, so an exacerbation treated with the usual steroid dose is underdosed. The checker has both entries, and says plainly which inhalers are not covered.',
    when: (ctx) => ctx.currentDrugs.includes('rifampicin'),
    provenance: shared('ats-dstb-2016', 'Table 8 — corticosteroids; theophylline'),
  },
  {
    id: 'link.ddi-to-airways',
    from: 'interactions',
    to: 'airways',
    toLabel: 'COPD, asthma and post-TB lung disease',
    why: 'An inhaled steroid is a TB risk factor in COPD, and GOLD asks for active TB to be excluded before one is started.',
    when: (ctx) => Boolean(ctx.copd || ctx.asthma || ctx.onInhaledSteroid),
    provenance: shared('gold-2026', 'Chapter 5, pulmonary tuberculosis, p. 121'),
  },

  // --- pregnancy modifies the regimen modules --------------------------------
  {
    id: 'link.drtb-to-pregnancy',
    from: 'drtb',
    to: 'pregnancy',
    toLabel: 'Pregnancy and breastfeeding',
    why: 'In pregnancy NTEP chooses the regimen from gestational age and the MTP decision, not from the eligibility checklist alone. The linezolid shorter regimen is open at any gestation; ethionamide is barred before 32 weeks and amikacin until after delivery.',
    when: (ctx) => Boolean(ctx.pregnant || ctx.breastfeeding),
    provenance: shared('ntep-drtb-2024', 'Section 3.9.1, pp. 40–42'),
  },
  {
    id: 'link.pregnancy-to-drtb',
    from: 'pregnancy',
    to: 'drtb',
    toLabel: 'Drug-resistant TB regimens',
    why: 'The pregnancy pathway names regimens in order of preference, but each still has its own eligibility criteria — fluoroquinolone resistance, prior second-line exposure, extent of disease. Check them there.',
    provenance: shared('ntep-drtb-2024', 'Section 3.9.1, p. 41 — "after considering other eligibility criteria"'),
  },
  {
    id: 'link.eptb-to-pregnancy',
    from: 'eptb',
    to: 'pregnancy',
    toLabel: 'Pregnancy and breastfeeding',
    why: 'The adult TBM workflow offers RHZS as an intensive-phase option. Streptomycin is an aminoglycoside, usually contraindicated in pregnancy for its effect on the fetal eighth nerve — use RHZE.',
    when: (ctx) => Boolean(ctx.pregnant) && ctx.sites.includes('cns'),
    provenance: {
      citations: [
        { source: 'icmr-stw', locator: 'DS-TB treatment workflow, adult TBM, p. 14' },
        { source: 'who-m4-2025', locator: 'Longer regimens — Pregnancy, p. 133' },
      ],
      status: 'source-checked',
    },
  },
  {
    id: 'link.dili-to-pregnancy',
    from: 'dili',
    to: 'pregnancy',
    toLabel: 'Pregnancy and breastfeeding',
    why: 'The usual non-hepatotoxic bridge includes an aminoglycoside, which is contraindicated throughout pregnancy. The bridge needs a different third drug for this patient.',
    when: (ctx) => Boolean(ctx.pregnant),
    provenance: shared('ntep-drtb-2024', 'Section 3.9.1, p. 40 — SLIs contraindicated throughout pregnancy'),
  },
  {
    id: 'link.dstb-to-pregnancy',
    from: 'dstb',
    to: 'pregnancy',
    toLabel: 'Pregnancy and breastfeeding',
    why: 'The standard 2HRZE/4HR regimen is used in pregnancy, with pyridoxine alongside isoniazid and vitamin K for mother and neonate when rifampicin is given late in pregnancy. Streptomycin, which the DS-TB workflow allows as a substitute, should be avoided (congenital deafness).',
    when: (ctx) => Boolean(ctx.pregnant || ctx.breastfeeding),
    provenance: {
      citations: [
        { source: 'who-handbook-m4-2025', locator: 'Section 8.2, p. 36; Annex 1, rifampicin p. 295, streptomycin p. 304' },
      ],
      status: 'source-checked',
    },
  },
]

export function linksFrom(view: View, ctx: PatientContext): CrossLink[] {
  return CROSS_LINKS.filter((l) => l.from === view && (!l.when || l.when(ctx)))
}

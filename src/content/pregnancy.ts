import type { GuidelinePack, Provenance, Statement } from '@/types/content'

/**
 * Pregnancy and breastfeeding.
 *
 * NTEP DR-TB 2024, Section 3.9.1 (pp. 40–42), including the "Duration of
 * pregnancy" flowchart on p. 41; and WHO Module 4 (2025), the pregnancy
 * subgroup considerations under each regimen recommendation.
 *
 * WHO page numbers are the printed page numbers (PDF page minus 14).
 *
 * First-line drugs come from the WHO operational handbook M4 2025 (Section 8.2,
 * p. 36, and the Annex 1 drug sheets; printed page = PDF page minus 16) and the
 * ATS/CDC/IDSA 2016 guideline ("Pregnancy and Breastfeeding" section).
 */

const ntep = (locator: string): Provenance => ({
  citations: [{ source: 'ntep-drtb-2024', locator }],
  status: 'source-checked',
})

const who = (locator: string): Provenance => ({
  citations: [{ source: 'who-m4-2025', locator }],
  status: 'source-checked',
})

const hb = (locator: string): Provenance => ({
  citations: [{ source: 'who-handbook-m4-2025', locator }],
  status: 'source-checked',
})

const cite = (cs: [string, string][], divergence?: string): Provenance => ({
  citations: cs.map(([source, locator]) => ({ source, locator })),
  status: divergence ? 'disputed' : 'source-checked',
  divergence,
})

const both = (ntepLocator: string, whoLocator: string): Provenance => ({
  citations: [
    { source: 'ntep-drtb-2024', locator: ntepLocator },
    { source: 'who-m4-2025', locator: whoLocator },
  ],
  status: 'source-checked',
})

// ---------------------------------------------------------------------------
// Drug by drug
// ---------------------------------------------------------------------------

/**
 * `barred` — do not use in pregnancy at this gestation.
 * `conditional` — usable only after a gestational threshold or post partum.
 * `caution` — usable, with a stated concern.
 * `preferred` — named by the source as the option to use in pregnancy.
 * `usable` — the source states it is not contraindicated / considered safe.
 */
export type PregnancyStance = 'barred' | 'conditional' | 'caution' | 'preferred' | 'usable'

export interface PregnancyDrugNote {
  /** Drug id from content/drugs.ts, where one exists. */
  drugId: string
  name: string
  stance: PregnancyStance
  /**
   * For `conditional` drugs: the gestation (weeks) from which the source
   * allows the drug. `postpartum` means not at any gestation.
   */
  allowedFrom?: number | 'postpartum'
  pregnancy: string
  breastfeeding?: string
  /** What the source puts in its place, when it says. Shown with a STOP. */
  instead?: string
  provenance: Provenance
}

export const PREGNANCY_DRUGS: PregnancyDrugNote[] = [
  // --- first line ------------------------------------------------------------
  {
    drugId: 'isoniazid',
    name: 'Isoniazid',
    stance: 'usable',
    pregnancy:
      'Not contraindicated in pregnancy. Pregnant and postpartum women should always receive pyridoxine (vitamin B6) while taking isoniazid.',
    breastfeeding:
      'Not contraindicated. Mother and exclusively breastfed infant should both receive pyridoxine. Drug in breast milk is not treatment for the infant.',
    provenance: cite([
      ['who-handbook-m4-2025', 'Annex 1, isoniazid (high dose) sheet, pp. 270–271'],
      ['ats-dstb-2016', 'Pregnancy and Breastfeeding section'],
    ]),
  },
  {
    drugId: 'rifampicin',
    name: 'Rifampicin',
    stance: 'usable',
    pregnancy:
      'No contraindication. Given in late pregnancy it carries a risk of maternal and neonatal bleeding: give phytomenadione (vitamin K) to the mother and the neonate.',
    breastfeeding: 'No contraindication.',
    provenance: hb('Annex 1, rifampicin sheet, p. 295'),
  },
  {
    drugId: 'pyrazinamide',
    name: 'Pyrazinamide',
    stance: 'usable',
    pregnancy:
      'No known teratogenicity; part of the standard 2HRZE/4HR regimen WHO uses in pregnancy.',
    breastfeeding: 'Distributed into breast milk but commonly used while breastfeeding.',
    provenance: cite(
      [
        ['who-handbook-m4-2025', 'Section 8.2, p. 36; Annex 1, pyrazinamide sheet, p. 292'],
        ['ats-dstb-2016', 'Pregnancy and Breastfeeding section'],
      ],
      'ATS calls pyrazinamide in pregnancy controversial in the United States and asks for a case-by-case decision with the patient. It favours including it with HIV, extrapulmonary or severe TB, and if it is left out, gives at least 9 months of isoniazid, rifampicin and ethambutol. WHO includes it as standard.',
    ),
  },
  {
    drugId: 'ethambutol',
    name: 'Ethambutol',
    stance: 'usable',
    pregnancy: 'Considered safe in pregnancy.',
    breastfeeding: 'Can be used while breastfeeding; it may appear in breast milk.',
    provenance: hb('Annex 1, ethambutol sheet, p. 263'),
  },

  // --- second line and injectables --------------------------------------------
  {
    drugId: 'amikacin',
    name: 'Amikacin (and other injectables)',
    stance: 'conditional',
    allowedFrom: 'postpartum',
    pregnancy:
      'Contraindicated throughout pregnancy because of its effect on the fetal eighth cranial nerve. May be considered post partum only, and never as a replacement drug in the final 12 months of treatment.',
    instead: 'In the longer regimen, add replacements in the order Z, E, then PAS.',
    breastfeeding: 'Excreted into breast milk; considered compatible with breastfeeding, with caution.',
    provenance: cite([
      ['ntep-drtb-2024', 'Section 3.9.1, p. 40; longer regimen modification, p. 41'],
      ['who-m4-2025', 'Longer regimens, subgroup considerations — Pregnancy, p. 133'],
      ['who-handbook-m4-2025', 'Annex 1, amikacin sheet, p. 301 — documented congenital deafness'],
    ]),
  },
  {
    drugId: 'streptomycin',
    name: 'Streptomycin',
    stance: 'barred',
    pregnancy:
      'WHO lists streptomycin with amikacin as usually contraindicated in pregnancy. NTEP bars second-line injectables for the same eighth-nerve reason. This matters in drug-susceptible TB too: the ICMR TBM workflow offers RHZS as an intensive-phase option.',
    instead: 'In TBM, the same workflow offers RHZE as the alternative intensive phase.',
    provenance: {
      citations: [
        { source: 'who-m4-2025', locator: 'Longer regimens, subgroup considerations — Pregnancy, p. 133' },
        { source: 'ntep-drtb-2024', locator: 'Section 3.9.1, p. 40 — SLIs contraindicated' },
        { source: 'icmr-stw', locator: 'DS-TB treatment workflow, adult TBM, p. 14 — "2 months of RHZE or RHZS"' },
        { source: 'who-handbook-m4-2025', locator: 'Annex 1, streptomycin sheet, p. 304 — avoid in pregnancy, documented congenital deafness' },
      ],
      status: 'source-checked',
    },
  },
  {
    drugId: 'ethionamide',
    name: 'Ethionamide / prothionamide',
    stance: 'conditional',
    allowedFrom: 32,
    pregnancy:
      'Contraindicated for the first 32 weeks because of teratogenic effects. After 32 weeks it may be considered if a linezolid-based regimen cannot be used. If it is used, check TSH monthly until normal (below 2.5), then quarterly, and check the infant for early hypothyroidism.',
    instead: 'Use linezolid in its place — the linezolid version of the shorter regimen is open at any gestation.',
    provenance: both(
      'Section 3.9.1, pp. 40–42',
      '9-month regimen, subgroup considerations, p. 96; longer regimens — Pregnancy, p. 133',
    ),
  },
  {
    drugId: 'linezolid',
    name: 'Linezolid',
    stance: 'preferred',
    pregnancy:
      'There is experience of its use in pregnancy. Both NTEP and WHO use the linezolid version of the 9–11 month shorter regimen in place of ethionamide for pregnant and breastfeeding women, at any gestation.',
    breastfeeding: 'The linezolid version is also the one recommended in breastfeeding women.',
    provenance: both(
      'Section 3.9.1, p. 40; Section 3.4.1 criterion vi, p. 32',
      '9-month regimen, Remark 2, p. 86; subgroup considerations, p. 96',
    ),
  },
  {
    drugId: 'bedaquiline',
    name: 'Bedaquiline',
    stance: 'caution',
    pregnancy:
      'In utero exposure was associated with low birth weight (45% vs 26%; mean 2690 g vs 2900 g). No other significant difference in infant outcomes, pregnancy outcomes or maternal treatment outcomes was seen, including infant weight gain to one year. WHO notes the effect could not be conclusively ascribed to bedaquiline.',
    breastfeeding: 'WHO notes that bedaquiline concentrations in breast milk may be high, with implications for breastfeeding.',
    provenance: {
      citations: [
        { source: 'ntep-drtb-2024', locator: 'Section 3.9.1, p. 40' },
        { source: 'who-m4-2025', locator: 'Longer regimens, bedaquiline in pregnancy cohort, pp. 129–130 and 133' },
        { source: 'who-m4-2025', locator: 'Annex 5, BDLLfxC evidence-to-decision table, p. 326 — breast milk' },
      ],
      status: 'source-checked',
    },
  },
  {
    drugId: 'pretomanid',
    name: 'Pretomanid',
    stance: 'barred',
    pregnancy:
      'Data in pregnancy are limited; animal studies do not show harm to embryo-fetal development. Because of that uncertainty BPaLM does not apply to pregnant women, except before 20/24 weeks in a woman who has opted for medical termination.',
    breastfeeding:
      'Not recommended while breastfeeding unless the mother is willing to replace breastfeeding with formula feed.',
    instead: 'Shift to the 9–11 month shorter regimen (linezolid version), or the longer oral regimen.',
    provenance: both(
      'Section 3.9.1, p. 40; Section 3.3.1 inclusion iv, p. 23',
      'BPaLM Remark 3 and footnote 22, p. 47; subgroup considerations, p. 68',
    ),
  },
  {
    drugId: 'delamanid',
    name: 'Delamanid',
    stance: 'caution',
    pregnancy:
      'Knowledge of its safety in pregnancy and breastfeeding is sparse. WHO nonetheless recommends the delamanid-containing BDLLfxC regimen in pregnant and breastfeeding women.',
    provenance: who('Longer regimens — Pregnancy, p. 133; BDLLfxC subgroup considerations, p. 82'),
  },
  {
    drugId: 'levofloxacin',
    name: 'Levofloxacin (Hr-TB)',
    stance: 'caution',
    pregnancy:
      'In isoniazid-resistant TB, WHO lists pregnancy and breastfeeding among the situations where levofloxacin is not added to (H)REZ, while stating this is not an absolute contraindication. Without a fluoroquinolone, 6(H)REZ can still be given.',
    provenance: who('Hr-TB recommendation, pp. 140 and 143'),
  },
  {
    drugId: 'pas',
    name: 'PAS',
    stance: 'caution',
    pregnancy:
      'Used in the longer regimen for pregnant women when a drug must be replaced (the replacement order is Z, E, PAS). PAS and ethionamide both cause hypothyroidism, so a newborn exposed to them, or to linezolid, needs CBC and TSH at birth.',
    provenance: ntep('Longer regimen modification, p. 41; additional monitoring ix, p. 42'),
  },
]

// ---------------------------------------------------------------------------
// Drug-susceptible TB in pregnancy
// ---------------------------------------------------------------------------

export const DSTB_REGIMEN: Statement = {
  id: 'preg.dstb.regimen',
  text: 'Treat with the standard 6-month 2HRZE/4HR regimen',
  detail:
    'Standard DS-TB treatment is considered safe in pregnancy and outweighs the grave risks of untreated TB. The drugs cross the placenta but have not shown teratogenic effects in humans. Start treatment whenever the probability of maternal TB is moderate to high.',
  provenance: cite([
    ['who-handbook-m4-2025', 'Section 8.2, pregnancy, p. 36'],
    ['ats-dstb-2016', 'Pregnancy and Breastfeeding section'],
  ]),
}

export const DSTB_PYRAZINAMIDE: Statement = {
  id: 'preg.dstb.pza',
  text: 'Pyrazinamide: standard under WHO, a case-by-case decision under ATS',
  detail:
    'If pyrazinamide is left out, ATS gives at least 9 months of isoniazid, rifampicin and ethambutol. ATS favours including it with HIV, extrapulmonary or severe TB.',
  provenance: cite(
    [
      ['who-handbook-m4-2025', 'Section 8.2, p. 36'],
      ['ats-dstb-2016', 'Pregnancy and Breastfeeding section'],
    ],
    'WHO treats pregnant women with the standard 2HRZE/4HR regimen. ATS notes pyrazinamide in pregnancy is controversial in the United States and asks clinicians to weigh it with the patient.',
  ),
}

export const DSTB_ORDERS: { id: string; verb: string; drugId?: string; s: Statement }[] = [
  {
    id: 'lft',
    verb: 'SEND',
    s: {
      id: 'preg.dstb.lft',
      text: 'Baseline liver function before starting',
      detail: 'If abnormal, manage accordingly before and during treatment.',
      provenance: hb('Section 8.2, p. 36'),
    },
  },
  {
    id: 'b6',
    verb: 'ADD',
    drugId: 'isoniazid',
    s: {
      id: 'preg.dstb.b6',
      text: 'Pyridoxine throughout pregnancy and breastfeeding while on isoniazid',
      detail:
        'ATS: 25–50 mg/day for the mother, and 1–2 mg/kg/day for an exclusively breastfed infant. WHO gives no dose in the pregnancy section.',
      provenance: cite(
        [
          ['who-handbook-m4-2025', 'Section 8.2, p. 36; Annex 1, isoniazid sheet, p. 270'],
          ['ats-dstb-2016', 'Pregnancy and Breastfeeding section; Table 2 footnote d'],
          ['icmr-stw', 'DS-TB treatment workflow, p. 14 — "Pyridoxine may be given at a dosage of 10 mg per day"'],
        ],
        'The ICMR/NTEP DS-TB workflow gives 10 mg/day as a general dose, not a pregnancy-specific one. ATS gives 25–50 mg/day in pregnancy.',
      ),
    },
  },
  {
    id: 'vitk',
    verb: 'PLAN',
    drugId: 'rifampicin',
    s: {
      id: 'preg.dstb.vitk',
      text: 'Vitamin K (phytomenadione) to mother and neonate if rifampicin is given in late pregnancy',
      detail: 'Rifampicin in late pregnancy carries a risk of maternal and neonatal bleeding disorders. The source does not give a dose or a gestational cut-off.',
      provenance: hb('Annex 1, rifampicin sheet, p. 295'),
    },
  },
  {
    id: 'avoid-4m',
    verb: 'AVOID',
    s: {
      id: 'preg.hpmz',
      text: 'The 4-month rifapentine–moxifloxacin (2HPMZ/2HPM) regimen',
      detail:
        'Evidence in pregnancy is lacking: pregnant and breastfeeding women were excluded from the trial. There are no adequate studies of rifapentine in pregnancy.',
      provenance: cite([
        ['who-handbook-m4-2025', 'Section 8.2, p. 36; Annex 1, rifapentine sheet, p. 298'],
        ['who-m4-2025', '4-month HPMZ regimen, subgroups, p. 17'],
      ]),
    },
  },
]

export const DSTB_BREASTFEEDING: Statement[] = [
  {
    id: 'preg.dstb.bf',
    text: 'Encourage breastfeeding once she is non-infectious and on first-line drugs',
    detail:
      'The small amounts of TB drugs in breast milk have not been reported to harm the infant — nor do they treat TB or TB infection in the infant.',
    provenance: cite([['ats-dstb-2016', 'Pregnancy and Breastfeeding section']]),
  },
  {
    id: 'preg.dstb.isolation',
    text: 'No need to isolate the infant once the mother has had at least 2 weeks of treatment',
    detail: 'Keep the mother’s isolation to the minimum needed, so breastfeeding is not interrupted.',
    provenance: hb('Section 8.2, p. 36; implementation considerations, p. 37'),
  },
]

// ---------------------------------------------------------------------------
// Regimen pathway by gestation — NTEP flowchart, p. 41
// ---------------------------------------------------------------------------

export interface RegimenOption {
  id: string
  name: string
  shorthand: string
  note?: string
}

export const NTEP_OPTIONS: Record<'bpalm' | 'shorterLzd' | 'longer', RegimenOption> = {
  bpalm: {
    id: 'bpalm',
    name: 'BPaLM',
    shorthand: '6–9 Bdq Pa Lzd Mfx',
  },
  shorterLzd: {
    id: 'shorter-lzd',
    name: '9–11 month shorter oral regimen, linezolid version',
    shorthand: '4–6 Bdq (6m), Lfx/Mfx, Cfz, Lzd (2m), Hh, Z, E / 5 Lfx/Mfx, Cfz, Z, E',
    note: 'Linezolid can be swapped back to ethionamide only after MTP, or after 32 weeks.',
  },
  longer: {
    id: 'longer',
    name: '18–20 month longer oral regimen',
    shorthand: '18–20 Lfx, Bdq (6m or longer), Lzd, Cfz, Cs',
    note: 'If a drug cannot be used, add replacements in the order Z, E, then PAS. Ethionamide only after 32 weeks. Amikacin post partum only, and not in the final 12 months.',
  },
}

export const NTEP_PATHWAY_PROVENANCE = ntep('Section 3.9.1, "Duration of pregnancy" flowchart and footnotes, p. 41')

/** The source's own wording for the gestational cut-off, kept verbatim. */
export const MTP_THRESHOLD_TEXT =
  '"<20 or <24 weeks gestation … as per latest MTP gazette notification"'

export const MTP_THRESHOLD: Statement = {
  id: 'preg.mtp-threshold',
  text: 'NTEP states the cut-off as "<20 or <24 weeks", deferring to the MTP notification in force',
  detail:
    'The guideline does not say which applies to whom; that depends on the category under the MTP (Amendment) Act, 2021. Between 20 and 24 weeks, confirm with the obstetrician whether termination is available to this woman before relying on the BPaLM branch.',
  provenance: ntep('Section 3.3.1 inclusion iv, p. 23; Section 3.9.1, pp. 40–41'),
}

export const BECAME_PREGNANT_ON_TREATMENT: Statement = {
  id: 'preg.on-treatment',
  text: 'Pregnant while already on a DR-TB regimen',
  detail:
    'Explain the risk to mother and fetus. Below 24 weeks, continuing BPaLM depends on her willingness to opt for MTP. If she is unwilling, or beyond 24 weeks, shift from BPaLM in order of preference to the 9–11 month shorter regimen (linezolid version) or the longer oral regimen.',
  provenance: ntep('Section 3.9.1, p. 41'),
}

// WHO pack ------------------------------------------------------------------

export interface WhoRegimenStance {
  id: string
  name: string
  stance: 'recommended' | 'not-applicable' | 'no-data'
  text: string
  provenance: Provenance
}

export const WHO_REGIMENS: WhoRegimenStance[] = [
  {
    id: 'bdllfxc',
    name: '6-month BDLLfxC (bedaquiline, delamanid, linezolid, levofloxacin, clofazimine)',
    stance: 'recommended',
    text: 'Recommended for pregnant and breastfeeding women. In BEAT-TB pregnant women could enrol in any trimester and continue if they became pregnant. All 10 pregnancies ended in singleton live births, one premature.',
    provenance: who('Recommendation 1.2, Remark 2c, p. 73; subgroup considerations, p. 82'),
  },
  {
    id: 'nine-month-lzd',
    name: '9-month all-oral regimen, linezolid version',
    stance: 'recommended',
    text: 'The linezolid version may be used in pregnant women. The ethionamide version may not.',
    provenance: who('9-month regimen, Remark 2, p. 86; subgroup considerations, p. 96'),
  },
  {
    id: 'endtb',
    name: '9-month endTB regimens (BLMZ, BLLfxCZ, BDLLfxZ)',
    stance: 'no-data',
    text: 'The recommendation text includes pregnant and breastfeeding women, but the endTB trial produced no data in them. Other studies support use during pregnancy with caution over the drugs used.',
    provenance: who('Recommendation text, p. 98; subgroup considerations, p. 112'),
  },
  {
    id: 'bpalm',
    name: 'BPaLM / BPaL',
    stance: 'not-applicable',
    text: 'Does not apply to pregnant and breastfeeding women because pretomanid safety is unclear. Other options need to be used.',
    provenance: who('BPaLM Remark 3, p. 47; subgroup considerations, p. 68'),
  },
]

// ---------------------------------------------------------------------------
// Monitoring, counselling, breastfeeding
// ---------------------------------------------------------------------------

export const MONITORING: Statement[] = [
  { id: 'mon.delivery', text: 'Plan delivery at a tertiary centre, or at least where a paediatrician is available', provenance: ntep('Section 3.9.1, additional monitoring i, p. 42') },
  { id: 'mon.cbc', text: 'CBC with Hb monthly, more often if clinically indicated', provenance: ntep('Section 3.9.1, additional monitoring ii, p. 42') },
  { id: 'mon.usg18', text: 'Fetal anomaly scan at 18 weeks', detail: 'Fetal echo only if the scan is abnormal.', provenance: ntep('Section 3.9.1, additional monitoring iii, p. 42') },
  { id: 'mon.usg32', text: 'Growth scan at 32 weeks', provenance: ntep('Section 3.9.1, additional monitoring iii, p. 42') },
  { id: 'mon.ecg', text: 'ECG and serum electrolytes more often, as clinically indicated', provenance: ntep('Section 3.9.1, additional monitoring iv, p. 42') },
  { id: 'mon.mtp2', text: 'Second-trimester MTP remains an option if the mother is fit, based on the second-trimester scan', provenance: ntep('Section 3.9.1, additional monitoring v, p. 42') },
  { id: 'mon.adsm', text: 'Strict aDSM, with the pregnancy recorded in Ni-kshay', provenance: ntep('Section 3.9.1, p. 40; additional monitoring vi, p. 42') },
  { id: 'mon.anc', text: 'ANC registration and regular obstetric follow-up; jointly managed by obstetrician and DR-TBC physician', provenance: ntep('Section 3.9.1, pp. 40 and 42') },
  { id: 'mon.surveillance', text: 'Document treatment and pregnancy outcomes, including postpartum surveillance for congenital anomalies', provenance: who('Longer regimens — Pregnancy, p. 133; monitoring, p. 136') },
]

export const MONITORING_ETO: Statement = {
  id: 'mon.tsh',
  text: 'Ethionamide in the regimen with a deranged baseline TSH: TSH monthly until below 2.5, then quarterly',
  detail: 'Check the infant for early evidence of hypothyroidism.',
  provenance: ntep('Section 3.9.1, additional monitoring viii, p. 42'),
}

export const NEWBORN: Statement = {
  id: 'mon.newborn',
  text: 'Newborn exposed to PAS, ethionamide or linezolid: CBC and TSH at birth',
  provenance: ntep('Section 3.9.1, additional monitoring ix, p. 42'),
}

/** Applies to every woman of childbearing age on or awaiting DR-TB treatment, not only the pregnant. */
export const CHILDBEARING_AGE: Statement[] = [
  {
    id: 'cba.test',
    text: 'Pregnancy test in pre-treatment evaluation, and during treatment',
    detail: 'Urine pregnancy test is part of the PTE for women of reproductive age, and is repeated on BPaLM as clinically indicated.',
    provenance: ntep('Table 3.1, p. 22; Table 3.4, p. 31; Section 3.9.1, p. 40'),
  },
  {
    id: 'cba.contraception',
    text: 'Counsel intensively on contraception while awaiting C&DST and throughout treatment',
    detail: 'Oral contraceptives may be less effective because of vomiting and drug interactions with DR-TB drugs.',
    provenance: ntep('Section 3.9.1, p. 40'),
  },
]

export const COUNSELLING: Statement = {
  id: 'preg.counsel',
  text: 'Counsel on MTP, with informed consent recorded',
  detail:
    'Cover the risk of delaying treatment, possible effects of the new drugs on the fetus including anomalies if she continues the pregnancy, and the need for closer maternal–fetal–neonatal follow-up. Weigh treatment risk and benefit, disease severity and gestational age with the obstetrician.',
  provenance: ntep('Section 3.9.1, p. 40'),
}

export const BREASTFEEDING: Statement[] = [
  {
    id: 'bf.encourage',
    text: 'Encourage breastfeeding if she is smear/culture negative and not on a pretomanid-containing regimen',
    detail: 'Treating through pregnancy aims for a smear- and culture-negative mother at delivery, so mother and infant need not be separated.',
    provenance: ntep('Section 3.9.1, p. 41'),
  },
  {
    id: 'bf.pa',
    text: 'On pretomanid: breastfeeding only if she is willing to replace it with formula feed',
    provenance: both('Section 3.9.1, p. 40', 'BPaLM subgroup considerations, p. 68'),
  },
]

export const PACK_OPTIONS: Record<GuidelinePack, string> = {
  ntep: 'NTEP chooses the regimen from gestational age and the MTP decision.',
  who: 'WHO names regimens that include pregnant and breastfeeding women; gestational age does not change the choice.',
}

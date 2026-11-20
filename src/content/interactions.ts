import type { Provenance, Statement } from '@/types/content'

/**
 * Drug–drug interactions between anti-TB drugs and co-medications.
 *
 * Only what the documents on file state:
 *
 *   ntep  NTEP DR-TB 2024 — printed page numbers (PDF page minus 2).
 *   who   WHO M4 guidelines 2025 — printed page numbers (PDF page minus 14).
 *   hb    WHO operational handbook M4 2025 — printed page numbers (PDF page
 *         minus 16). Annex 1 (pp. 252–304) is one information sheet per drug,
 *         each with a "Drug interactions" row; Annex 2 pp. 312–313 lists the
 *         DR-TB interactions to watch.
 *   ats   ATS/CDC/IDSA 2016 DS-TB guideline — Table 8 (rifamycin interactions)
 *         and the "Drug–drug interactions" section. Saved from PMC, so the
 *         locator names the table or section rather than a page.
 *
 * Drugs still not covered by any of these are listed in `UNSOURCED` so the
 * checker says the pair is uncovered instead of returning an empty result.
 */

const ntep = (locator: string): Provenance => ({ citations: [{ source: 'ntep-drtb-2024', locator }], status: 'source-checked' })
const who = (locator: string): Provenance => ({ citations: [{ source: 'who-m4-2025', locator }], status: 'source-checked' })
const hb = (locator: string): Provenance => ({ citations: [{ source: 'who-handbook-m4-2025', locator }], status: 'source-checked' })
const ats = (locator: string): Provenance => ({ citations: [{ source: 'ats-dstb-2016', locator }], status: 'source-checked' })

/** Several citations in one provenance. Pass `divergence` where they disagree. */
const cite = (cs: [string, string][], divergence?: string, status?: Provenance['status']): Provenance => ({
  citations: cs.map(([source, locator]) => ({ source, locator })),
  status: status ?? (divergence ? 'disputed' : 'source-checked'),
  divergence,
})

const T8 = 'Table 8, clinically significant interactions involving the rifamycins'

// ---------------------------------------------------------------------------
// Co-medications
// ---------------------------------------------------------------------------

export type CoMedGroup =
  | 'HIV'
  | 'Hepatitis C'
  | 'Anticoagulants'
  | 'Antiepileptics'
  | 'Anti-infectives'
  | 'Cardiovascular'
  | 'Diabetes and lipids'
  | 'Psychiatric and pain'
  | 'Stomach, antacids and minerals'
  | 'Steroids, transplant and hormones'
  | 'Other'

export interface CoMed {
  id: string
  name: string
  group: CoMedGroup
  /** Other names a physician might type. Lower case. */
  aliases: string[]
  /**
   * Set when this entry is a class the source names without listing its
   * members. The physician decides whether their drug belongs to it.
   */
  classNote?: string
  /**
   * Entries this one also counts as: the components of a fixed-dose
   * combination, or a class the source makes a statement about.
   */
  includes?: string[]
}

export const CO_MEDS: CoMed[] = [
  // --- HIV ---------------------------------------------------------------------
  { id: 'efavirenz', name: 'Efavirenz', group: 'HIV', aliases: ['efv'], includes: ['art-other', 'qt-drugs'] },
  { id: 'dolutegravir', name: 'Dolutegravir', group: 'HIV', aliases: ['dtg'], includes: ['art-other'] },
  { id: 'tld', name: 'TLD (tenofovir + lamivudine + dolutegravir)', group: 'HIV', aliases: ['tld', 'tenofovir lamivudine dolutegravir'], includes: ['dolutegravir', 'lamivudine', 'art-other'] },
  { id: 'tle', name: 'TLE (tenofovir + lamivudine + efavirenz)', group: 'HIV', aliases: ['tle', 'tenofovir lamivudine efavirenz'], includes: ['efavirenz', 'lamivudine', 'art-other'] },
  { id: 'nevirapine', name: 'Nevirapine', group: 'HIV', aliases: ['nvp'], includes: ['art-other'] },
  { id: 'raltegravir', name: 'Raltegravir', group: 'HIV', aliases: ['ral'], includes: ['art-other'] },
  { id: 'rilpivirine', name: 'Rilpivirine or etravirine', group: 'HIV', aliases: ['rilpivirine', 'etravirine', 'rpv', 'etr'], includes: ['art-other'] },
  { id: 'elvitegravir', name: 'Elvitegravir / cobicistat', group: 'HIV', aliases: ['elvitegravir', 'cobicistat', 'stribild', 'genvoya'], includes: ['art-other'] },
  { id: 'maraviroc', name: 'Maraviroc', group: 'HIV', aliases: [], includes: ['art-other'] },
  {
    id: 'boosted-pi',
    name: 'Protease inhibitor (ritonavir-boosted or not)',
    group: 'HIV',
    aliases: ['ritonavir', 'lopinavir', 'lopinavir/ritonavir', 'lpv/r', 'atazanavir', 'darunavir', 'saquinavir', 'protease inhibitor'],
    includes: ['art-other'],
  },
  { id: 'zidovudine', name: 'Zidovudine', group: 'HIV', aliases: ['azt', 'zdv'], includes: ['art-other'] },
  { id: 'lamivudine', name: 'Lamivudine', group: 'HIV', aliases: ['3tc'], includes: ['art-other'] },
  { id: 'abacavir', name: 'Abacavir', group: 'HIV', aliases: ['abc'], includes: ['art-other'] },
  {
    id: 'art-other',
    name: 'Antiretroviral therapy (other or unspecified)',
    group: 'HIV',
    aliases: ['art', 'antiretroviral', 'arv', 'tenofovir'],
    classNote: 'For ART not listed separately.',
  },
  { id: 'cotrimoxazole', name: 'Co-trimoxazole', group: 'HIV', aliases: ['cotrimoxazole', 'septran', 'bactrim', 'trimethoprim-sulfamethoxazole', 'ctx'] },

  // --- Hepatitis C ---------------------------------------------------------------
  { id: 'hcv-daa', name: 'HCV direct-acting antiviral', group: 'Hepatitis C', aliases: ['daa', 'sofosbuvir', 'ledipasvir', 'velpatasvir', 'glecaprevir', 'pibrentasvir', 'hepatitis c treatment'] },
  { id: 'daclatasvir', name: 'Daclatasvir', group: 'Hepatitis C', aliases: ['dcv'], includes: ['hcv-daa'] },

  // --- Anticoagulants ------------------------------------------------------------
  { id: 'warfarin', name: 'Warfarin', group: 'Anticoagulants', aliases: ['coumadin', 'warf'] },
  {
    id: 'noac',
    name: 'Non-vitamin K oral anticoagulant (NOAC / DOAC)',
    group: 'Anticoagulants',
    aliases: ['apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban', 'doac', 'noac', 'xarelto', 'eliquis'],
  },
  { id: 'heparin', name: 'Heparin / low-molecular-weight heparin', group: 'Anticoagulants', aliases: ['heparin', 'enoxaparin', 'lmwh', 'dalteparin', 'fondaparinux'] },

  // --- Antiepileptics ------------------------------------------------------------
  { id: 'phenytoin', name: 'Phenytoin', group: 'Antiepileptics', aliases: ['eptoin', 'dilantin'] },
  { id: 'carbamazepine', name: 'Carbamazepine', group: 'Antiepileptics', aliases: ['tegretol', 'cbz'], includes: ['cyp3a-inducer'] },
  { id: 'phenobarbital', name: 'Phenobarbital', group: 'Antiepileptics', aliases: ['phenobarbitone', 'gardenal'] },
  { id: 'lamotrigine', name: 'Lamotrigine', group: 'Antiepileptics', aliases: ['lamictal'] },
  { id: 'valproate', name: 'Valproate', group: 'Antiepileptics', aliases: ['sodium valproate', 'valproic acid', 'divalproex', 'valparin', 'encorate'] },

  // --- Anti-infectives -----------------------------------------------------------
  { id: 'azole-strong', name: 'Itraconazole, ketoconazole, voriconazole, posaconazole', group: 'Anti-infectives', aliases: ['itraconazole', 'ketoconazole', 'voriconazole', 'posaconazole', 'isavuconazole'], includes: ['qt-drugs'] },
  { id: 'fluconazole', name: 'Fluconazole', group: 'Anti-infectives', aliases: ['forcan'], includes: ['qt-drugs'] },
  { id: 'clarithromycin', name: 'Clarithromycin', group: 'Anti-infectives', aliases: ['claribid'], includes: ['qt-drugs'] },
  { id: 'erythromycin', name: 'Erythromycin', group: 'Anti-infectives', aliases: [], includes: ['qt-drugs'] },
  { id: 'azithromycin', name: 'Azithromycin', group: 'Anti-infectives', aliases: ['azee', 'zithromax'], includes: ['qt-drugs'] },
  { id: 'doxycycline', name: 'Doxycycline', group: 'Anti-infectives', aliases: [] },
  { id: 'atovaquone', name: 'Atovaquone', group: 'Anti-infectives', aliases: [] },
  { id: 'chloramphenicol', name: 'Chloramphenicol', group: 'Anti-infectives', aliases: [] },
  { id: 'mefloquine', name: 'Mefloquine', group: 'Anti-infectives', aliases: [] },
  { id: 'quinoline-antimalarial', name: 'Chloroquine / hydroxychloroquine', group: 'Anti-infectives', aliases: ['chloroquine', 'hydroxychloroquine', 'hcq', 'halofantrine', 'quinacrine'], includes: ['qt-drugs'] },

  // --- Cardiovascular ------------------------------------------------------------
  { id: 'ccb', name: 'Verapamil, nifedipine, diltiazem', group: 'Cardiovascular', aliases: ['verapamil', 'nifedipine', 'diltiazem', 'felodipine', 'nisoldipine'] },
  { id: 'beta-blocker', name: 'Propranolol or metoprolol', group: 'Cardiovascular', aliases: ['propranolol', 'metoprolol'] },
  { id: 'acei-arb', name: 'Enalapril or losartan', group: 'Cardiovascular', aliases: ['enalapril', 'losartan'] },
  { id: 'digoxin', name: 'Digoxin / digitoxin', group: 'Cardiovascular', aliases: ['digoxin', 'digitoxin', 'lanoxin'] },
  {
    id: 'antiarrhythmic-ia-iii',
    name: 'Class IA or III antiarrhythmic',
    group: 'Cardiovascular',
    aliases: ['amiodarone', 'dronedarone', 'sotalol', 'quinidine', 'disopyramide', 'ajmaline', 'procainamide'],
    includes: ['qt-drugs'],
  },
  { id: 'antiarrhythmic-ic', name: 'Mexiletine, tocainide, propafenone, flecainide', group: 'Cardiovascular', aliases: ['mexiletine', 'tocainide', 'propafenone', 'flecainide', 'encainide'], includes: ['qt-drugs'] },
  { id: 'diuretic', name: 'Furosemide or hydrochlorothiazide', group: 'Cardiovascular', aliases: ['furosemide', 'frusemide', 'lasix', 'hydrochlorothiazide', 'hctz', 'torsemide', 'ethacrynic acid', 'loop diuretic', 'mannitol'], includes: ['qt-drugs'] },
  { id: 'theophylline', name: 'Theophylline', group: 'Cardiovascular', aliases: ['aminophylline', 'deriphyllin'] },

  // --- Diabetes and lipids -------------------------------------------------------
  {
    id: 'antidiabetic',
    name: 'Antidiabetic drug (any)',
    group: 'Diabetes and lipids',
    aliases: ['gliclazide', 'pioglitazone', 'dapagliflozin', 'empagliflozin', 'oral hypoglycaemic', 'oha'],
    classNote: 'For antidiabetics not listed separately. WHO names "antidiabetics" as a class; sulfonylureas, metformin, DPP-4 inhibitors, GLP-1 agonists and insulin have their own entries.',
  },
  { id: 'sulfonylurea', name: 'Sulfonylurea (glimepiride, glibenclamide…)', group: 'Diabetes and lipids', aliases: ['glimepiride', 'glibenclamide', 'glyburide', 'tolbutamide', 'chlorpropamide', 'repaglinide', 'sulfonylurea'], includes: ['antidiabetic'] },
  { id: 'metformin', name: 'Metformin', group: 'Diabetes and lipids', aliases: ['glycomet', 'biguanide'] },
  { id: 'dpp4', name: 'DPP-4 inhibitor (gliptin)', group: 'Diabetes and lipids', aliases: ['sitagliptin', 'vildagliptin', 'teneligliptin', 'linagliptin', 'saxagliptin', 'gliptin'] },
  { id: 'glp1', name: 'GLP-1 receptor agonist', group: 'Diabetes and lipids', aliases: ['liraglutide', 'semaglutide', 'dulaglutide', 'exenatide', 'glp-1'] },
  { id: 'insulin', name: 'Insulin', group: 'Diabetes and lipids', aliases: ['insulin', 'glargine', 'aspart', 'lispro', 'mixtard', 'actrapid'] },
  { id: 'statin', name: 'Statin', group: 'Diabetes and lipids', aliases: ['atorvastatin', 'rosuvastatin', 'pravastatin', 'statin'], classNote: 'WHO names statins as a class; ATS names simvastatin and fluvastatin.' },
  { id: 'simvastatin', name: 'Simvastatin or fluvastatin', group: 'Diabetes and lipids', aliases: ['simvastatin', 'fluvastatin'], includes: ['statin'] },

  // --- Psychiatric and pain -------------------------------------------------------
  { id: 'maoi', name: 'MAO inhibitor', group: 'Psychiatric and pain', aliases: ['moclobemide', 'selegiline', 'rasagiline', 'phenelzine', 'tranylcypromine', 'monoamine oxidase inhibitor'] },
  { id: 'serotonergic', name: 'SSRI / SNRI antidepressant', group: 'Psychiatric and pain', aliases: ['ssri', 'snri', 'sertraline', 'fluoxetine', 'paroxetine', 'venlafaxine', 'duloxetine', 'desvenlafaxine'] },
  { id: 'citalopram', name: 'Citalopram or escitalopram', group: 'Psychiatric and pain', aliases: ['citalopram', 'escitalopram'], includes: ['serotonergic', 'qt-drugs'] },
  { id: 'tca', name: 'Tricyclic antidepressant', group: 'Psychiatric and pain', aliases: ['amitriptyline', 'imipramine', 'tricyclic', 'clomipramine', 'dothiepin'], includes: ['qt-drugs'] },
  { id: 'nortriptyline', name: 'Nortriptyline (incl. gabapentin-NT)', group: 'Psychiatric and pain', aliases: ['nortriptyline', 'gabapentin nt', 'gabantin nt'], includes: ['tca'] },
  { id: 'neuroleptic', name: 'Haloperidol or phenothiazine antipsychotic', group: 'Psychiatric and pain', aliases: ['haloperidol', 'chlorpromazine', 'thioridazine', 'trifluoperazine', 'prochlorperazine', 'fluphenazine', 'pimozide', 'sertindole', 'periciazine'], includes: ['qt-drugs'] },
  { id: 'quetiapine', name: 'Quetiapine', group: 'Psychiatric and pain', aliases: [] },
  { id: 'benzodiazepine', name: 'Benzodiazepine, zolpidem', group: 'Psychiatric and pain', aliases: ['diazepam', 'triazolam', 'alprazolam', 'clonazepam', 'lorazepam', 'zolpidem', 'benzodiazepine'] },
  { id: 'buspirone', name: 'Buspirone', group: 'Psychiatric and pain', aliases: [] },
  { id: 'bupropion', name: 'Bupropion', group: 'Psychiatric and pain', aliases: [] },
  { id: 'methadone', name: 'Methadone', group: 'Psychiatric and pain', aliases: [], includes: ['qt-drugs', 'opioid'] },
  { id: 'opioid', name: 'Opioid analgesic', group: 'Psychiatric and pain', aliases: ['tramadol', 'tapentadol', 'morphine', 'codeine', 'fentanyl', 'opioid'] },
  { id: 'triptan', name: 'Triptan (5-HT1 agonist)', group: 'Psychiatric and pain', aliases: ['sumatriptan', 'rizatriptan', 'zolmitriptan', 'triptan'] },
  { id: 'antiparkinson', name: 'Anti-Parkinson or dopaminergic drug', group: 'Psychiatric and pain', aliases: ['levodopa', 'carbidopa', 'syndopa', 'ropinirole', 'pramipexole', 'dopamine agonist'] },
  { id: 'paracetamol', name: 'Paracetamol', group: 'Psychiatric and pain', aliases: ['acetaminophen', 'crocin', 'dolo', 'calpol'] },

  // --- Stomach, antacids, minerals ------------------------------------------------
  {
    id: 'divalent-cations',
    name: 'Antacids, magnesium, calcium, iron, zinc',
    group: 'Stomach, antacids and minerals',
    aliases: ['antacid', 'magnesium', 'magnesium trisilicate', 'magnesium sulphate', 'calcium', 'iron', 'ferrous', 'zinc', 'aluminium hydroxide', 'gelusil', 'digene', 'multivitamin'],
    classNote: 'The sources name antacids, magnesium, and supplements containing calcium, iron or zinc.',
  },
  { id: 'sucralfate', name: 'Sucralfate', group: 'Stomach, antacids and minerals', aliases: ['sucral'] },
  { id: 'antiemetic', name: 'Ondansetron or metoclopramide', group: 'Stomach, antacids and minerals', aliases: ['ondansetron', 'emeset', 'metoclopramide', 'perinorm', 'antiemetic'], includes: ['qt-drugs'] },

  // --- Steroids, transplant, hormones ---------------------------------------------
  { id: 'prednisolone', name: 'Corticosteroid (prednisolone, dexamethasone…)', group: 'Steroids, transplant and hormones', aliases: ['prednisone', 'prednisolone', 'dexamethasone', 'methylprednisolone', 'hydrocortisone', 'steroid', 'corticosteroid', 'glucocorticoid', 'wysolone'] },
  { id: 'calcineurin', name: 'Tacrolimus, ciclosporin or sirolimus', group: 'Steroids, transplant and hormones', aliases: ['tacrolimus', 'ciclosporin', 'cyclosporine', 'cyclosporin', 'sirolimus', 'transplant', 'immunosuppressant'] },
  { id: 'azathioprine', name: 'Azathioprine or cytotoxic drug', group: 'Steroids, transplant and hormones', aliases: ['azathioprine', 'cytotoxic', 'chemotherapy'], includes: ['myelosuppressive'] },
  { id: 'ocp', name: 'Oral contraceptive pill', group: 'Steroids, transplant and hormones', aliases: ['ocp', 'combined pill', 'contraceptive', 'birth control', 'ethinylestradiol', 'norethindrone', 'norethisterone'] },
  { id: 'dmpa', name: 'Injectable medroxyprogesterone (DMPA)', group: 'Steroids, transplant and hormones', aliases: ['dmpa', 'depo-provera', 'antara', 'injectable contraceptive', 'medroxyprogesterone'] },
  { id: 'levothyroxine', name: 'Levothyroxine', group: 'Steroids, transplant and hormones', aliases: ['thyroxine', 'eltroxin', 'thyronorm'] },
  { id: 'tamoxifen', name: 'Tamoxifen', group: 'Steroids, transplant and hormones', aliases: [] },

  // --- Other ---------------------------------------------------------------------
  { id: 'rifabutin', name: 'Rifabutin', group: 'Other', aliases: [] },
  { id: 'cold-remedy', name: 'Cough and cold remedy', group: 'Other', aliases: ['dextromethorphan', 'pseudoephedrine', 'diphenhydramine', 'guaifenesin', 'cough syrup', 'cold medicine'] },
  { id: 'sympathomimetic', name: 'Sympathomimetic or vasopressor', group: 'Other', aliases: ['adrenaline', 'epinephrine', 'noradrenaline', 'norepinephrine', 'dopamine', 'dobutamine', 'vasopressor'] },
  { id: 'st-johns-wort', name: "St John's wort", group: 'Other', aliases: ['hypericum', 'st johns wort'] },
  {
    id: 'qt-drugs',
    name: 'Other QT-prolonging drug',
    group: 'Other',
    aliases: ['antiarrhythmic', 'antipsychotic', 'qt prolonging'],
    classNote: 'For a QT-prolonging drug not listed separately. Whether a specific drug prolongs QT is for you to confirm.',
  },
  {
    id: 'cyp3a-inducer',
    name: 'Strong CYP3A inducer (other)',
    group: 'Other',
    aliases: ['cyp450', 'cyp3a4', 'enzyme inducer'],
    classNote: 'The handbook’s contraindication to bedaquiline names rifamycins and carbamazepine. Phenytoin, phenobarbital, St John’s wort and glucocorticoids are listed separately here at the severity the handbook gives them.',
  },
  {
    id: 'myelosuppressive',
    name: 'Drug that causes myelosuppression (other)',
    group: 'Other',
    aliases: ['myelosuppressive', 'bone marrow suppression'],
    classNote: 'The handbook names azathioprine, cytotoxic agents and zidovudine.',
  },
]

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------

/**
 * `avoid`    — the source says do not use, avoid, or contraindicated.
 * `adjust`   — combine with a dose change, drug-level monitoring, or an alternative considered.
 * `separate` — combine, with doses separated in time.
 * `monitor`  — combine, with closer clinical, ECG or laboratory monitoring.
 * `info`     — the source states the combination is usable, or names it as the alternative.
 */
export type InteractionSeverity = 'avoid' | 'adjust' | 'separate' | 'monitor' | 'info'

export interface Interaction {
  id: string
  coMed: string
  /**
   * TB drug ids that trigger this entry — any one present suffices.
   * `second-line` matches any DR-TB drug, for statements the source makes
   * about "DR-TB drugs" without naming them.
   */
  tbDrugs: string[]
  severity: InteractionSeverity
  effect: string
  action: string
  provenance: Provenance
}

export const SECOND_LINE = [
  'levofloxacin', 'moxifloxacin', 'bedaquiline', 'linezolid', 'clofazimine',
  'cycloserine', 'pretomanid', 'delamanid', 'ethionamide', 'amikacin',
]

const R = ['rifampicin']
const FQ = ['levofloxacin', 'moxifloxacin']
const QT_TB = ['bedaquiline', 'moxifloxacin', 'levofloxacin', 'clofazimine', 'pretomanid', 'delamanid']

export const INTERACTIONS: Interaction[] = [
  // ===========================================================================
  // HIV
  // ===========================================================================
  {
    id: 'efv-bdq', coMed: 'efavirenz', tbDrugs: ['bedaquiline'], severity: 'avoid',
    effect: 'Efavirenz induces bedaquiline metabolism; exposure falls and activity may be lost.',
    action: 'Do not co-administer. Switch the antiretroviral with the ART centre.',
    provenance: cite([
      ['ntep-drtb-2024', 'Section 3.9.4 (i), p. 42'],
      ['who-m4-2025', 'BPaLM drug–drug interactions, p. 70; 9-month regimen, p. 96; BDLLfxC, p. 84'],
      ['who-handbook-m4-2025', 'BPaLM, p. 85; Annex 2, p. 312'],
    ]),
  },
  {
    id: 'efv-pa', coMed: 'efavirenz', tbDrugs: ['pretomanid'], severity: 'avoid',
    effect: 'Efavirenz reduces pretomanid exposure significantly.',
    action: 'Use an alternative antiretroviral if BPaLM is used.',
    provenance: cite(
      [
        ['ntep-drtb-2024', 'Section 3.9.4 (i), p. 42'],
        ['who-m4-2025', 'BPaLM drug–drug interactions, p. 70'],
        ['who-handbook-m4-2025', 'BPaLM, p. 85'],
      ],
      'On the alternative: the WHO guideline (p. 70, p. 84) calls dolutegravir-based ART with two NRTIs the preferred partner for BPaLM/BPaL and BDLLfxC. The WHO handbook (p. 85) and NTEP (p. 42) both say dolutegravir is "potentially" the alternative, "although there is currently insufficient evidence for this".',
    ),
  },
  {
    id: 'efv-rif', coMed: 'efavirenz', tbDrugs: R, severity: 'info',
    effect: 'Rifampicin decreases exposure to all NNRTIs, but efavirenz-based ART was the combination WHO recommended with standard rifampicin-containing treatment.',
    action: 'Usable together. ATS notes that many experts give efavirenz at the standard 600 mg, while the FDA recommends 800 mg daily above 60 kg.',
    provenance: cite([
      ['who-handbook-m4-2025', 'Section 3.4.1, people living with HIV, p. 14'],
      ['ats-dstb-2016', T8 + ' — NNRTIs'],
    ]),
  },
  {
    id: 'efv-cs', coMed: 'efavirenz', tbDrugs: ['cycloserine'], severity: 'monitor',
    effect: 'Co-administration may increase neuropsychiatric adverse events.',
    action: 'Monitor for depression, psychosis and behavioural change.',
    provenance: hb('Annex 1, cycloserine sheet, p. 258'),
  },
  {
    id: 'dtg-rif', coMed: 'dolutegravir', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin lowers dolutegravir concentrations, with concern for HIV treatment failure and resistance.',
    action: 'Give dolutegravir 50 mg twice daily instead of once daily. WHO notes emerging evidence that doubling may not be necessary; the recommendation stands.',
    provenance: cite([
      ['who-handbook-m4-2025', 'Section 3.4.1, people living with HIV, p. 14'],
      ['ats-dstb-2016', T8 + ' — INSTIs'],
    ]),
  },
  {
    id: 'dtg-bpalm', coMed: 'dolutegravir', tbDrugs: ['pretomanid', 'bedaquiline', 'delamanid'], severity: 'monitor',
    effect: 'The sources differ on the strength of evidence for dolutegravir alongside the newer regimens. The handbook suggests an integrase inhibitor such as dolutegravir in place of a protease inhibitor with bedaquiline.',
    action: 'Manage with the ART centre. No interaction between delamanid and dolutegravir has been found.',
    provenance: cite(
      [
        ['ntep-drtb-2024', 'Section 3.9.4 (i), p. 42'],
        ['who-m4-2025', 'BPaLM, p. 70; BDLLfxC, p. 84'],
        ['who-handbook-m4-2025', 'BPaLM, p. 85; Annex 1, bedaquiline sheet, p. 254; delamanid sheet, p. 261'],
      ],
      'WHO guideline: dolutegravir-based ART is preferred with BPaLM and BDLLfxC. WHO handbook and NTEP: potentially the alternative, but evidence is currently insufficient.',
    ),
  },
  {
    id: 'nvp-rif', coMed: 'nevirapine', tbDrugs: R, severity: 'avoid',
    effect: 'Rifampicin decreases nevirapine exposure.',
    action: 'WHO lists rifampicin with nevirapine as a key contraindicated combination; substitute rifabutin where available.',
    provenance: cite(
      [
        ['who-handbook-m4-2025', 'Section 3.4.1, p. 14'],
        ['ats-dstb-2016', T8 + ' — NNRTIs'],
      ],
      'ATS allows nevirapine with rifampicin if the 200 mg lead-in is omitted and 400 mg daily is given. WHO calls the combination contraindicated.',
    ),
  },
  {
    id: 'nvp-pa', coMed: 'nevirapine', tbDrugs: ['pretomanid'], severity: 'monitor',
    effect: 'Nevirapine decreased pretomanid AUC by 35% in studies.',
    action: 'Weigh with the ART centre; avoid strong CYP3A inducers with pretomanid where possible.',
    provenance: hb('Annex 1, pretomanid sheet, p. 290'),
  },
  {
    id: 'ral-rif', coMed: 'raltegravir', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin lowers raltegravir exposure.',
    action: 'Increase raltegravir to 800 mg twice daily (trial data show similar efficacy at 400 mg twice daily).',
    provenance: ats(T8 + ' — INSTIs'),
  },
  {
    id: 'rpv-rif', coMed: 'rilpivirine', tbDrugs: R, severity: 'avoid',
    effect: 'Rifampicin decreases exposure to all NNRTIs.',
    action: 'Do not give rilpivirine or etravirine with rifampicin. Rifabutin can be used with etravirine; rilpivirine should not be given with rifabutin either.',
    provenance: ats(T8 + ' — NNRTIs'),
  },
  {
    id: 'evg-rif', coMed: 'elvitegravir', tbDrugs: R, severity: 'avoid',
    effect: 'Rifampicin lowers elvitegravir exposure.',
    action: 'Do not use rifampicin with elvitegravir. Rifabutin can be used with integrase inhibitors.',
    provenance: ats(T8 + ' — INSTIs'),
  },
  {
    id: 'mvc-rif', coMed: 'maraviroc', tbDrugs: R, severity: 'avoid',
    effect: 'Rifampicin lowers maraviroc exposure.',
    action: 'Do not use rifampicin with maraviroc. Rifabutin can be used.',
    provenance: ats(T8 + ' — CCR5 inhibitors'),
  },
  {
    id: 'pi-rif', coMed: 'boosted-pi', tbDrugs: R, severity: 'avoid',
    effect: 'Rifampicin substantially decreases protease inhibitor concentrations. With ritonavir-boosted saquinavir there is an increased risk of severe hepatocellular toxicity.',
    action: 'Use rifabutin in place of rifampicin (ATS: rifabutin 150 mg daily with ritonavir-boosted regimens). ATS allows double-dose lopinavir/ritonavir with rifampicin, at the cost of more toxicity.',
    provenance: cite([
      ['who-handbook-m4-2025', 'Section 3.4.1, p. 14; Annex 1, rifampicin sheet, p. 295'],
      ['ats-dstb-2016', T8 + ' — HIV-1 protease inhibitors'],
    ]),
  },
  {
    id: 'pi-bdq', coMed: 'boosted-pi', tbDrugs: ['bedaquiline'], severity: 'adjust',
    effect: 'Protease inhibitors (CYP3A4 inhibitors) raise bedaquiline levels. Increased adverse events have not been noted in studies of concurrent use.',
    action: 'Substitute an integrase inhibitor (dolutegravir or raltegravir) where possible. If a ritonavir-boosted PI must be used, do an ECG every 2 weeks for the first 8 weeks.',
    provenance: cite([
      ['ntep-drtb-2024', 'Section 3.9.4 (ii), p. 42'],
      ['who-m4-2025', '9-month regimen, p. 96'],
      ['who-handbook-m4-2025', 'Annex 1, bedaquiline sheet, p. 254; Annex 2, p. 312'],
    ]),
  },
  {
    id: 'pi-dlm', coMed: 'boosted-pi', tbDrugs: ['delamanid'], severity: 'monitor',
    effect: 'Ritonavir is a strong CYP3A inhibitor.',
    action: 'Consider frequent ECG monitoring.',
    provenance: hb('Annex 1, delamanid sheet, p. 261'),
  },
  {
    id: 'azt-lzd', coMed: 'zidovudine', tbDrugs: ['linezolid'], severity: 'avoid',
    effect: 'Additive myelosuppression (pancytopenia), peripheral neuropathy, and lactic acidosis risk.',
    action: 'Avoid zidovudine if possible; manage through the ART centre and DR-TB centre together.',
    provenance: cite([
      ['ntep-drtb-2024', 'Section 3.9.4 (iii), p. 43'],
      ['who-m4-2025', 'BDLLfxC drug–drug interactions, p. 84'],
      ['who-handbook-m4-2025', 'Annex 1, linezolid sheet, p. 278; Annex 2, p. 312'],
    ]),
  },
  {
    id: '3tc-lzd', coMed: 'lamivudine', tbDrugs: ['linezolid'], severity: 'monitor',
    effect: 'Increased risk of lactic acidosis.',
    action: 'Watch for lactic acidosis.',
    provenance: hb('Annex 1, linezolid sheet, p. 278'),
  },
  {
    id: 'abc-lzd', coMed: 'abacavir', tbDrugs: ['linezolid'], severity: 'monitor',
    effect: 'Increased risk of lactic acidosis.',
    action: 'Watch for lactic acidosis.',
    provenance: hb('Annex 1, linezolid sheet, p. 278'),
  },
  {
    id: '3tc-lfx', coMed: 'lamivudine', tbDrugs: ['levofloxacin'], severity: 'info',
    effect: 'Levofloxacin may raise lamivudine levels by interfering with its clearance.',
    action: 'No dose adjustment is needed. Levofloxacin is not contraindicated with other antiretrovirals.',
    provenance: who('Hr-TB, drug–drug interactions, pp. 142–143'),
  },
  {
    id: 'art-rif', coMed: 'art-other', tbDrugs: R, severity: 'monitor',
    effect: 'Rifampicin lowers the concentrations of many antiretrovirals (NNRTIs and protease inhibitors in particular). On the 6-month regimen the interaction lasts all 6 months.',
    action: 'Check the specific antiretroviral — several are listed separately here. WHO and ATS both point to the University of Liverpool HIV drug interactions resource.',
    provenance: cite([
      ['who-m4-2025', 'DS-TB subgroup considerations, p. 8; Liverpool resource, pp. 133 and 152'],
      ['who-handbook-m4-2025', 'Annex 1, rifampicin sheet, p. 295'],
    ]),
  },
  {
    id: 'art-new', coMed: 'art-other', tbDrugs: ['bedaquiline', 'pretomanid', 'delamanid'], severity: 'monitor',
    effect: 'Newer TB drugs interact with several antiretrovirals; neuropathy, liver enzyme rises and CNS effects can come from either side.',
    action: 'For newer agents WHO says to consult the package inserts. Manage with the ART centre.',
    provenance: who('BDLLfxC drug–drug interactions, p. 84; 9-month regimen, p. 96'),
  },
  {
    id: 'ctx-lzd', coMed: 'cotrimoxazole', tbDrugs: ['linezolid'], severity: 'monitor',
    effect: 'Increased risk of pancytopenia.',
    action: 'Monitor the blood count closely.',
    provenance: hb('Annex 1, linezolid sheet, p. 278'),
  },

  // ===========================================================================
  // Hepatitis C
  // ===========================================================================
  {
    id: 'daa-rif', coMed: 'hcv-daa', tbDrugs: R, severity: 'avoid',
    effect: 'Known interactions with rifamycins preclude co-administration of direct-acting antivirals during drug-susceptible TB treatment.',
    action: 'Do not co-administer with a rifamycin.',
    provenance: cite([
      ['who-m4-2025', 'HCV and MDR/RR-TB co-administration, background, p. 154'],
      ['who-handbook-m4-2025', 'Annex 1, rifampicin sheet, p. 295'],
    ]),
  },
  {
    id: 'daa-bdq', coMed: 'hcv-daa', tbDrugs: ['bedaquiline'], severity: 'monitor',
    effect: 'Few interactions are expected with MDR-TB drugs, but bedaquiline may increase the risk of liver toxicity with some HCV treatments.',
    action: 'Co-administration is recommended. Consult a specialist and monitor liver function. Unavailable HCV treatment should not delay MDR-TB treatment.',
    provenance: who('HCV co-administration, p. 158; Annex 5 recommendation and remarks, pp. 415–416'),
  },
  {
    id: 'dcv-eto-cfz', coMed: 'daclatasvir', tbDrugs: ['ethionamide', 'clofazimine'], severity: 'monitor',
    effect: 'Ethionamide/prothionamide and clofazimine are CYP3A4 inhibitors in vitro and could, in theory, raise daclatasvir levels. Clinical relevance is unknown.',
    action: 'Consult a specialist before combining.',
    provenance: who('HCV co-administration, p. 158; Annex 5, p. 416'),
  },

  // ===========================================================================
  // Anticoagulants
  // ===========================================================================
  {
    id: 'warf-rif', coMed: 'warfarin', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin substantially decreases warfarin concentrations. WHO calls this interaction especially problematic.',
    action: 'Monitor prothrombin time/INR closely; warfarin may need a 2- to 3-fold dose increase. WHO considers heparin or a non-vitamin K oral anticoagulant considerably safer. Reduce the warfarin dose again within 2 weeks of stopping rifampicin.',
    provenance: cite([
      ['ats-dstb-2016', T8 + ' — anticoagulants; "Drug interactions due to rifamycins" (offset)'],
      ['who-handbook-m4-2025', 'Section 8.3, older people, p. 37; Annex 1, rifampicin sheet, p. 295'],
    ]),
  },
  {
    id: 'warf-fq', coMed: 'warfarin', tbDrugs: FQ, severity: 'monitor',
    effect: 'The fluoroquinolone may enhance the effect of warfarin.',
    action: 'Monitor prothrombin time and INR, and watch for bleeding.',
    provenance: hb('Annex 1, levofloxacin sheet, p. 275; moxifloxacin sheet, p. 284'),
  },
  {
    id: 'warf-inh', coMed: 'warfarin', tbDrugs: ['isoniazid'], severity: 'monitor',
    effect: 'Isoniazid may increase warfarin toxicity; this has not been well studied. With rifampicin in the regimen, the rifampicin effect dominates.',
    action: 'Monitor INR.',
    provenance: ats('Drug–drug interactions — drug interactions due to INH'),
  },
  {
    id: 'warf-dlm', coMed: 'warfarin', tbDrugs: ['delamanid'], severity: 'monitor',
    effect: 'Delamanid may attenuate vitamin K-dependent clotting and prolong PT and aPTT.',
    action: 'Monitor PT/INR.',
    provenance: hb('Annex 1, delamanid sheet, p. 261'),
  },
  {
    id: 'noac-rif', coMed: 'noac', tbDrugs: R, severity: 'monitor',
    effect: 'WHO states that heparin or a non-vitamin K oral anticoagulant is "considerably safer" than warfarin with rifampicin.',
    action: 'This is the only statement on file. It names no specific NOAC and gives no dose. Product labelling for NOACs with rifampicin is not among the documents here — check it before relying on this line.',
    provenance: cite([['who-handbook-m4-2025', 'Section 8.3, older people, p. 37']], undefined, 'needs-review'),
  },
  {
    id: 'hep-rif', coMed: 'heparin', tbDrugs: R, severity: 'info',
    effect: 'WHO names heparin as considerably safer than warfarin in patients on rifampicin.',
    action: 'A preferred option where anticoagulation is needed on rifampicin.',
    provenance: hb('Section 8.3, older people, p. 37'),
  },

  // ===========================================================================
  // Antiepileptics
  // ===========================================================================
  {
    id: 'pht-rif', coMed: 'phenytoin', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases phenytoin concentrations. Rifampicin’s induction outweighs isoniazid’s inhibition, so on HR together the net effect is a fall.',
    action: 'Therapeutic drug monitoring recommended; the dose may need increasing.',
    provenance: cite([
      ['ats-dstb-2016', T8 + ' — anticonvulsants; "Drug interactions due to INH"'],
      ['who-handbook-m4-2025', 'Annex 1, rifampicin sheet, p. 295'],
    ]),
  },
  {
    id: 'pht-inh', coMed: 'phenytoin', tbDrugs: ['isoniazid'], severity: 'monitor',
    effect: 'Isoniazid inhibits phenytoin metabolism and can raise it to toxic levels.',
    action: 'Monitor levels and for toxicity, especially if rifampicin is not in the regimen.',
    provenance: cite([
      ['ats-dstb-2016', 'Drug–drug interactions — drug interactions due to INH'],
      ['who-handbook-m4-2025', 'Annex 1, high-dose isoniazid sheet, p. 271'],
    ]),
  },
  {
    id: 'cbz-inh', coMed: 'carbamazepine', tbDrugs: ['isoniazid'], severity: 'monitor',
    effect: 'Isoniazid raises carbamazepine concentrations, with a risk of toxicity and hepatotoxicity.',
    action: 'Monitor levels and liver function.',
    provenance: cite([
      ['ats-dstb-2016', 'Drug–drug interactions — drug interactions due to INH'],
      ['who-handbook-m4-2025', 'Annex 1, high-dose isoniazid sheet, p. 271'],
    ]),
  },
  {
    id: 'ltg-rif', coMed: 'lamotrigine', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases lamotrigine concentrations.',
    action: 'Therapeutic drug monitoring recommended; the dose may need increasing.',
    provenance: ats(T8 + ' — anticonvulsants'),
  },
  {
    id: 'vpa-inh', coMed: 'valproate', tbDrugs: ['isoniazid'], severity: 'monitor',
    effect: 'Isoniazid may increase valproate toxicity; not well studied.',
    action: 'Monitor clinically and with levels if available.',
    provenance: ats('Drug–drug interactions — drug interactions due to INH'),
  },
  {
    id: 'inducer-bdq', coMed: 'cyp3a-inducer', tbDrugs: ['bedaquiline'], severity: 'avoid',
    effect: 'Strong CYP3A inducers lower bedaquiline concentrations.',
    action: 'The handbook lists strong CYP3A inducers (e.g. rifamycins, carbamazepine) as a contraindication to bedaquiline. NTEP makes strong CYP450 inducers a relative contraindication to BPaLM.',
    provenance: cite([
      ['who-handbook-m4-2025', 'Annex 1, bedaquiline sheet, pp. 253–254; Annex 2, p. 313'],
      ['ntep-drtb-2024', 'Table 3.2 and footnote, p. 25'],
    ]),
  },
  {
    id: 'inducer-pa', coMed: 'cyp3a-inducer', tbDrugs: ['pretomanid'], severity: 'avoid',
    effect: 'Strong CYP3A inducers lower pretomanid exposure.',
    action: 'Avoid if possible. NTEP allows an exception after 3 days or less of the inducer with a washout of five half-lives.',
    provenance: cite([
      ['who-handbook-m4-2025', 'Annex 1, pretomanid sheet, p. 290'],
      ['ntep-drtb-2024', 'Table 3.2 and footnote, p. 25'],
    ]),
  },
  {
    id: 'inducer-dlm', coMed: 'cyp3a-inducer', tbDrugs: ['delamanid'], severity: 'avoid',
    effect: 'Strong CYP3A inducers (e.g. carbamazepine) lower delamanid exposure.',
    action: 'Avoid co-administration.',
    provenance: hb('Annex 1, delamanid sheet, p. 261'),
  },

  {
    id: 'pht-bdq', coMed: 'phenytoin', tbDrugs: ['bedaquiline'], severity: 'adjust',
    effect: 'Phenytoin is a CYP3A4 inducer and may lower bedaquiline concentrations.',
    action: 'The handbook asks for caution and possible dose adjustment, or substitution of the anticonvulsant.',
    provenance: hb('Annex 1, bedaquiline sheet, p. 254; Annex 2, pp. 312–313'),
  },
  {
    id: 'pb-bdq', coMed: 'phenobarbital', tbDrugs: ['bedaquiline'], severity: 'adjust',
    effect: 'Phenobarbital is a CYP3A4 inducer and can interact with bedaquiline.',
    action: 'Vigilance or, preferably, substitution of the interacting drug.',
    provenance: hb('Annex 2, pp. 312–313'),
  },
  {
    id: 'sjw-bdq', coMed: 'st-johns-wort', tbDrugs: ['bedaquiline'], severity: 'adjust',
    effect: 'St John’s wort is a CYP3A4 inducer and can interact with bedaquiline.',
    action: 'Vigilance or, preferably, stop the St John’s wort.',
    provenance: hb('Annex 2, pp. 312–313'),
  },
  {
    id: 'pred-bdq', coMed: 'prednisolone', tbDrugs: ['bedaquiline'], severity: 'adjust',
    effect: 'Glucocorticoids are CYP3A4 inducers and may lower bedaquiline concentrations.',
    action: 'The handbook asks for caution and possible dose adjustment.',
    provenance: hb('Annex 1, bedaquiline sheet, p. 254; Annex 2, p. 313'),
  },

  // ===========================================================================
  // Anti-infectives
  // ===========================================================================
  {
    id: 'azole-rif', coMed: 'azole-strong', tbDrugs: R, severity: 'avoid',
    effect: 'Itraconazole, ketoconazole and voriconazole concentrations may be subtherapeutic with any rifamycin; the decrease can be unacceptable.',
    action: 'Choose an alternative antifungal, or a rifamycin-free regimen.',
    provenance: ats(T8 + ' — azole antifungal agents; "Drug interactions due to rifamycins"'),
  },
  {
    id: 'azole-bdq', coMed: 'azole-strong', tbDrugs: ['bedaquiline'], severity: 'monitor',
    effect: 'Azole antifungals are CYP3A4 inhibitors and raise bedaquiline levels; they also add QT prolongation.',
    action: 'In general these can safely be used for less than 2 weeks. Monitor ECG.',
    provenance: hb('Annex 1, bedaquiline sheet, p. 254; Annex 2, p. 313'),
  },
  {
    id: 'flu-rif', coMed: 'fluconazole', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin lowers fluconazole concentrations.',
    action: 'Fluconazole can be used, but may need a higher dose (ATS). WHO: give the two 12 hours apart — rifampicin in the morning, fluconazole in the evening.',
    provenance: cite([
      ['ats-dstb-2016', T8 + ' — azole antifungal agents'],
      ['who-handbook-m4-2025', 'Annex 1, rifampicin sheet, p. 295'],
    ]),
  },
  {
    id: 'flu-bdq', coMed: 'fluconazole', tbDrugs: ['bedaquiline'], severity: 'monitor',
    effect: 'Fluconazole is an azole; azoles raise bedaquiline levels and add QT prolongation.',
    action: 'Unlike the other azoles, fluconazole can potentially be used for more than 2 weeks. Monitor ECG.',
    provenance: hb('Annex 1, bedaquiline sheet, p. 254; Annex 2, p. 313'),
  },
  {
    id: 'clari-bdq', coMed: 'clarithromycin', tbDrugs: ['bedaquiline', 'moxifloxacin'], severity: 'monitor',
    effect: 'Clarithromycin raises bedaquiline levels (CYP3A4 inhibition) and adds QT prolongation.',
    action: 'Avoid if possible; if prescribed, extra vigilance with ECG monitoring.',
    provenance: hb('Annex 1, bedaquiline sheet, p. 254; Annex 2, pp. 312–313'),
  },
  {
    id: 'ery-rif', coMed: 'erythromycin', tbDrugs: R, severity: 'monitor',
    effect: 'Erythromycin clearance may increase with rifamycins.',
    action: 'Expect a reduced effect.',
    provenance: ats(T8 + ' — macrolide antibiotics'),
  },
  {
    id: 'azi-rif', coMed: 'azithromycin', tbDrugs: R, severity: 'info',
    effect: 'Azithromycin has no significant interaction with rifamycins.',
    action: 'Usable. Macrolides still count among QT-prolonging drugs with bedaquiline, clofazimine and delamanid.',
    provenance: ats(T8 + ' — macrolide antibiotics'),
  },
  {
    id: 'doxy-rif', coMed: 'doxycycline', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin substantially decreases doxycycline concentrations.',
    action: 'May require a drug other than doxycycline.',
    provenance: ats(T8 + ' — anti-infectives'),
  },
  {
    id: 'atov-rif', coMed: 'atovaquone', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin substantially decreases atovaquone concentrations.',
    action: 'Consider another form of Pneumocystis treatment or prophylaxis.',
    provenance: ats(T8 + ' — anti-infectives'),
  },
  {
    id: 'chlor-rif', coMed: 'chloramphenicol', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin substantially decreases chloramphenicol concentrations.',
    action: 'Consider an alternative antibiotic.',
    provenance: ats(T8 + ' — anti-infectives'),
  },
  {
    id: 'meflo-rif', coMed: 'mefloquine', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin substantially decreases mefloquine concentrations.',
    action: 'Consider another form of malaria prophylaxis.',
    provenance: ats(T8 + ' — anti-infectives'),
  },

  // ===========================================================================
  // Cardiovascular
  // ===========================================================================
  {
    id: 'ccb-rif', coMed: 'ccb', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases verapamil, nifedipine and diltiazem concentrations (predicted also for felodipine and nisoldipine).',
    action: 'Monitor clinically; may need a change to another cardiovascular agent.',
    provenance: ats(T8 + ' — cardiovascular agents'),
  },
  {
    id: 'bb-rif', coMed: 'beta-blocker', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases propranolol and metoprolol concentrations.',
    action: 'Monitor clinically; may need a dose increase or an alternative.',
    provenance: ats(T8 + ' — cardiovascular agents'),
  },
  {
    id: 'acei-rif', coMed: 'acei-arb', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases enalapril and losartan concentrations.',
    action: 'Monitor blood pressure; may need a dose increase or an alternative.',
    provenance: cite([
      ['ats-dstb-2016', T8 + ' — cardiovascular agents'],
      ['who-handbook-m4-2025', 'Section 8.3, older people, pp. 37–38'],
    ]),
  },
  {
    id: 'dig-rif', coMed: 'digoxin', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases digoxin (in renal insufficiency) and digitoxin concentrations.',
    action: 'Therapeutic drug monitoring recommended; the dose may need increasing.',
    provenance: ats(T8 + ' — cardiovascular agents'),
  },
  {
    id: 'aa3-mfx', coMed: 'antiarrhythmic-ia-iii', tbDrugs: ['moxifloxacin'], severity: 'avoid',
    effect: 'Class IA and III antiarrhythmics with moxifloxacin enhance the proarrhythmic effect.',
    action: 'Avoid the combination.',
    provenance: hb('Annex 1, moxifloxacin sheet, p. 284'),
  },
  {
    id: 'aa3-rif', coMed: 'antiarrhythmic-ia-iii', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases quinidine concentrations.',
    action: 'Therapeutic drug monitoring for quinidine; the dose may need increasing. ATS does not address the other class IA/III drugs with rifampicin.',
    provenance: ats(T8 + ' — cardiovascular agents'),
  },
  {
    id: 'aa1c-rif', coMed: 'antiarrhythmic-ic', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases mexiletine, tocainide and propafenone concentrations.',
    action: 'Monitor clinically; may need a change to another agent.',
    provenance: ats(T8 + ' — cardiovascular agents'),
  },
  {
    id: 'diur-amk', coMed: 'diuretic', tbDrugs: ['amikacin', 'streptomycin'], severity: 'avoid',
    effect: 'Loop diuretics (furosemide, ethacrynic acid) and mannitol increase aminoglycoside ototoxicity and hypokalaemia.',
    action: 'Avoid if possible; use with caution alongside nephrotoxic drugs, dehydration or electrolyte disturbance.',
    provenance: hb('Annex 1, amikacin sheet, p. 301; streptomycin sheet, p. 304'),
  },
  {
    id: 'theo-rif', coMed: 'theophylline', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases theophylline concentrations.',
    action: 'Therapeutic drug monitoring recommended; the dose may need increasing.',
    provenance: ats(T8 + ' — theophylline'),
  },
  {
    id: 'theo-inh', coMed: 'theophylline', tbDrugs: ['isoniazid'], severity: 'monitor',
    effect: 'Isoniazid may increase theophylline toxicity; not well studied. Levofloxacin and moxifloxacin do not affect theophylline metabolism.',
    action: 'Monitor levels.',
    provenance: ats('Drug–drug interactions — due to INH; due to the fluoroquinolones'),
  },

  // ===========================================================================
  // Diabetes and lipids
  // ===========================================================================
  {
    id: 'su-rif', coMed: 'sulfonylurea', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases sulfonylurea concentrations (tolbutamide, chlorpropamide, glyburide, glimepiride, repaglinide).',
    action: 'Monitor blood glucose; may need a dose increase or a change of agent. Insulin may be needed to control glucose during treatment.',
    provenance: cite([
      ['ats-dstb-2016', T8 + ' — sulfonylurea hypoglycemics'],
      ['who-handbook-m4-2025', 'Section 8.1, diabetes, p. 35'],
      ['ntep-drtb-2024', 'Section 3.9.7, p. 43 (insulin)'],
    ]),
  },
  {
    id: 'dm-rif', coMed: 'antidiabetic', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin reduces the effect of antidiabetic drugs.',
    action: 'Monitor blood glucose and adjust the dose if necessary. This is a class-level statement; the handbook describes metformin, DPP-4 inhibitors, GLP-1 agonists and insulin differently (see their own entries).',
    provenance: hb('Annex 1, rifampicin sheet, p. 295; Section 8.3, p. 38'),
  },
  {
    id: 'dm-fq', coMed: 'antidiabetic', tbDrugs: FQ, severity: 'monitor',
    effect: 'Fluoroquinolones can disturb glucose control in patients on antidiabetic agents.',
    action: 'Monitor blood glucose carefully.',
    provenance: hb('Annex 1, levofloxacin sheet, p. 275; moxifloxacin sheet, p. 284'),
  },
  {
    id: 'metformin-rif', coMed: 'metformin', tbDrugs: R, severity: 'monitor',
    effect: 'Metformin is not metabolised by P450, but rifampicin may increase its glucose-lowering effect by raising hepatic uptake.',
    action: 'Monitor blood glucose for hypoglycaemia as well as loss of control.',
    provenance: hb('Section 8.1, diabetes, p. 35'),
  },
  {
    id: 'dpp4-rif', coMed: 'dpp4', tbDrugs: R, severity: 'info',
    effect: 'Rifampicin has only a slight effect on DPP-4 inhibitors.',
    action: 'Usable; monitor glucose as usual.',
    provenance: hb('Section 8.1, diabetes, p. 35'),
  },
  {
    id: 'glp1-rif', coMed: 'glp1', tbDrugs: R, severity: 'info',
    effect: 'No effect of rifampicin on GLP-1 receptor agonist exposure is known.',
    action: 'Usable.',
    provenance: hb('Section 8.1, diabetes, p. 35'),
  },
  {
    id: 'insulin-rif', coMed: 'insulin', tbDrugs: R, severity: 'info',
    effect: 'Insulin is not metabolised, so there are no pharmacokinetic interactions with anti-TB drugs.',
    action: 'Some authors recommend insulin at the start of TB treatment to speed sputum conversion and avoid interactions; NTEP notes insulin may be needed for control.',
    provenance: {
      citations: [
        { source: 'who-handbook-m4-2025', locator: 'Section 8.1, diabetes, p. 35' },
        { source: 'ntep-drtb-2024', locator: 'Section 3.9.7, p. 43' },
      ],
      status: 'source-checked',
    },
  },
  {
    id: 'metformin-fq', coMed: 'metformin', tbDrugs: FQ, severity: 'monitor',
    effect: 'Fluoroquinolones can disturb glucose control in patients on antidiabetic agents.',
    action: 'Monitor blood glucose carefully.',
    provenance: hb('Annex 1, levofloxacin sheet, p. 275; moxifloxacin sheet, p. 284'),
  },
  {
    id: 'insulin-fq', coMed: 'insulin', tbDrugs: FQ, severity: 'monitor',
    effect: 'Fluoroquinolones can disturb glucose control in patients on antidiabetic agents.',
    action: 'Monitor blood glucose carefully.',
    provenance: hb('Annex 1, levofloxacin sheet, p. 275; moxifloxacin sheet, p. 284'),
  },
  {
    id: 'dpp4-fq', coMed: 'dpp4', tbDrugs: FQ, severity: 'monitor',
    effect: 'Fluoroquinolones can disturb glucose control in patients on antidiabetic agents.',
    action: 'Monitor blood glucose carefully.',
    provenance: hb('Annex 1, levofloxacin sheet, p. 275; moxifloxacin sheet, p. 284'),
  },
  {
    id: 'glp1-fq', coMed: 'glp1', tbDrugs: FQ, severity: 'monitor',
    effect: 'Fluoroquinolones can disturb glucose control in patients on antidiabetic agents.',
    action: 'Monitor blood glucose carefully.',
    provenance: hb('Annex 1, levofloxacin sheet, p. 275; moxifloxacin sheet, p. 284'),
  },
  {
    id: 'metformin-lzd', coMed: 'metformin', tbDrugs: ['linezolid'], severity: 'monitor',
    effect: 'Metformin (especially at high dose) with linezolid increases the risk of lactic acidosis.',
    action: 'Watch for lactic acidosis. Diabetes also adds to the neuropathy risk from linezolid, high-dose isoniazid and cycloserine.',
    provenance: cite([
      ['ntep-drtb-2024', 'Section 3.9.7, p. 43'],
      ['who-handbook-m4-2025', 'Annex 1, linezolid sheet, p. 278'],
    ]),
  },
  {
    id: 'simva-rif', coMed: 'simvastatin', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases simvastatin and fluvastatin concentrations.',
    action: 'Monitor the lipid-lowering effect; may need an alternative agent.',
    provenance: ats(T8 + ' — hypolipidemics'),
  },
  {
    id: 'statin-rif', coMed: 'statin', tbDrugs: R, severity: 'monitor',
    effect: 'WHO lists statins among the important interactions with TB treatment.',
    action: 'Evaluate the specific statin. ATS names only simvastatin and fluvastatin.',
    provenance: hb('Section 8.3, older people, pp. 37–38'),
  },

  // ===========================================================================
  // Psychiatric and pain
  // ===========================================================================
  {
    id: 'maoi-lzd', coMed: 'maoi', tbDrugs: ['linezolid'], severity: 'avoid',
    effect: 'Linezolid is itself an MAO inhibitor; combining raises the risk of serotonin syndrome.',
    action: 'Current MAO inhibitors, or use within the previous 2 weeks, are a relative contraindication to BPaLM.',
    provenance: cite([
      ['ntep-drtb-2024', 'Table 3.2, p. 25'],
      ['who-handbook-m4-2025', 'Annex 1, linezolid sheet, p. 278'],
    ]),
  },
  {
    id: 'ssri-lzd', coMed: 'serotonergic', tbDrugs: ['linezolid'], severity: 'avoid',
    effect: 'Risk of serotonin syndrome — linezolid is an MAO inhibitor.',
    action: 'Serotonergic antidepressants currently or within 3 days are a relative contraindication to BPaLM. NTEP names duloxetine; WHO names sertraline and fluoxetine.',
    provenance: cite([
      ['ntep-drtb-2024', 'Table 3.2, p. 25; neuropathy treatment — duloxetine, p. 63'],
      ['who-handbook-m4-2025', 'Annex 1, linezolid sheet, p. 278; Annex 2, p. 312'],
    ]),
  },
  {
    id: 'ssri-inh', coMed: 'serotonergic', tbDrugs: ['isoniazid'], severity: 'monitor',
    effect: 'Isoniazid may increase the toxicity of serotonergic antidepressants; not well studied.',
    action: 'Monitor clinically.',
    provenance: ats('Drug–drug interactions — drug interactions due to INH'),
  },
  {
    id: 'tca-lzd', coMed: 'tca', tbDrugs: ['linezolid'], severity: 'avoid',
    effect: 'Risk of serotonin syndrome — linezolid is an MAO inhibitor.',
    action: 'Tricyclics currently or within 3 days are a relative contraindication to BPaLM.',
    provenance: cite([
      ['ntep-drtb-2024', 'Table 3.2, p. 25'],
      ['who-handbook-m4-2025', 'Annex 1, linezolid sheet, p. 278'],
    ]),
  },
  {
    id: 'tca-bdq', coMed: 'tca', tbDrugs: ['bedaquiline', 'moxifloxacin'], severity: 'avoid',
    effect: 'Amitriptyline adds QT prolongation to bedaquiline and moxifloxacin.',
    action: 'NTEP says to avoid amitriptyline with bedaquiline. WHO asks for extra ECG vigilance if it is prescribed.',
    provenance: cite(
      [
        ['ntep-drtb-2024', 'Neuropathy treatment — amitriptyline, p. 63'],
        ['who-handbook-m4-2025', 'Annex 2, p. 312'],
      ],
      'NTEP p. 63 gives the reason as "Bdq as mild MAO inhibitor". The WHO handbook (p. 278) identifies linezolid as the MAO inhibitor, and lists amitriptyline among QT-prolonging drugs to watch with bedaquiline and moxifloxacin (p. 312). The avoidance advice stands either way; the mechanism NTEP gives is for a reviewer to confirm.',
    ),
  },
  {
    id: 'nort-rif', coMed: 'nortriptyline', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases nortriptyline concentrations.',
    action: 'Therapeutic drug monitoring recommended; may need a dose increase or an alternative.',
    provenance: ats(T8 + ' — psychotropic drugs'),
  },
  {
    id: 'neuro-rif', coMed: 'neuroleptic', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases haloperidol concentrations.',
    action: 'Monitor clinically; may need a dose increase or an alternative.',
    provenance: ats(T8 + ' — psychotropic drugs'),
  },
  {
    id: 'quet-rif', coMed: 'quetiapine', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases quetiapine concentrations.',
    action: 'Monitor clinically; may need a dose increase or an alternative.',
    provenance: ats(T8 + ' — psychotropic drugs'),
  },
  {
    id: 'bzd-rif', coMed: 'benzodiazepine', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases concentrations of benzodiazepines (e.g. diazepam, triazolam) and zolpidem. With isoniazid as well, the net effect is still a fall.',
    action: 'Monitor clinically; may need a dose increase or an alternative.',
    provenance: ats(T8 + ' — psychotropic drugs; "Drug interactions due to INH"'),
  },
  {
    id: 'bzd-inh', coMed: 'benzodiazepine', tbDrugs: ['isoniazid'], severity: 'monitor',
    effect: 'Isoniazid raises concentrations of benzodiazepines metabolised by oxidation (diazepam, triazolam) but not those conjugated (oxazepam).',
    action: 'Watch for sedation if rifampicin is not in the regimen.',
    provenance: ats('Drug–drug interactions — drug interactions due to INH'),
  },
  {
    id: 'busp-rif', coMed: 'buspirone', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases buspirone concentrations.',
    action: 'Monitor clinically; may need a dose increase or an alternative.',
    provenance: ats(T8 + ' — psychotropic drugs'),
  },
  {
    id: 'busp-lzd', coMed: 'buspirone', tbDrugs: ['linezolid'], severity: 'avoid',
    effect: 'Risk of serotonin syndrome — linezolid is an MAO inhibitor.',
    action: 'Avoid, or monitor closely for serotonin toxicity.',
    provenance: hb('Annex 1, linezolid sheet, p. 278'),
  },
  {
    id: 'bup-lzd', coMed: 'bupropion', tbDrugs: ['linezolid'], severity: 'avoid',
    effect: 'Risk of serotonin syndrome — linezolid is an MAO inhibitor.',
    action: 'Avoid, or monitor closely for serotonin toxicity.',
    provenance: hb('Annex 1, linezolid sheet, p. 278'),
  },
  {
    id: 'meth-rif', coMed: 'methadone', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases methadone concentrations; withdrawal can follow.',
    action: 'The methadone dose may need increasing.',
    provenance: ats(T8 + ' — narcotics'),
  },
  {
    id: 'opioid-lzd', coMed: 'opioid', tbDrugs: ['linezolid'], severity: 'avoid',
    effect: 'Opioid analgesics with linezolid raise the risk of serotonin syndrome.',
    action: 'Avoid, or monitor closely for serotonin toxicity.',
    provenance: hb('Annex 1, linezolid sheet, p. 278'),
  },
  {
    id: 'triptan-lzd', coMed: 'triptan', tbDrugs: ['linezolid'], severity: 'avoid',
    effect: 'Serotonin 5-HT1 agonists with linezolid raise the risk of serotonin syndrome.',
    action: 'Avoid, or monitor closely for serotonin toxicity.',
    provenance: hb('Annex 1, linezolid sheet, p. 278'),
  },
  {
    id: 'parkinson-lzd', coMed: 'antiparkinson', tbDrugs: ['linezolid'], severity: 'avoid',
    effect: 'Anti-Parkinson and dopaminergic drugs with linezolid raise the risk of serotonin syndrome and toxicity.',
    action: 'Avoid, or monitor closely.',
    provenance: hb('Annex 1, linezolid sheet, p. 278'),
  },
  {
    id: 'para-inh', coMed: 'paracetamol', tbDrugs: ['isoniazid'], severity: 'monitor',
    effect: 'Isoniazid may increase paracetamol toxicity; not well studied.',
    action: 'Keep paracetamol doses conservative and watch liver function.',
    provenance: ats('Drug–drug interactions — drug interactions due to INH'),
  },

  // ===========================================================================
  // Stomach, antacids, minerals
  // ===========================================================================
  {
    id: 'cation-fq', coMed: 'divalent-cations', tbDrugs: FQ, severity: 'separate',
    effect: 'Antacids and supplements containing magnesium, calcium, iron or zinc markedly reduce fluoroquinolone absorption.',
    action: 'Give them at least 2 hours apart from the fluoroquinolone. Milk products need no restriction.',
    provenance: cite([
      ['ntep-drtb-2024', 'Section 3.2.2, p. 23; Table 3.2, p. 25'],
      ['who-m4-2025', 'Hr-TB, drug–drug interactions, p. 143'],
      ['ats-dstb-2016', 'Drug–drug interactions — interactions affecting antituberculosis drugs'],
    ]),
  },
  {
    id: 'cation-rif', coMed: 'divalent-cations', tbDrugs: R, severity: 'separate',
    effect: 'Antacids may reduce rifampicin absorption.',
    action: 'Give rifampicin at least 1 hour before any antacid.',
    provenance: hb('Annex 1, rifampicin sheet, p. 295'),
  },
  {
    id: 'cation-emb', coMed: 'divalent-cations', tbDrugs: ['ethambutol'], severity: 'separate',
    effect: 'Aluminium hydroxide antacids interfere with ethambutol.',
    action: 'Avoid aluminium hydroxide antacids for at least 4 hours after ethambutol.',
    provenance: hb('Annex 1, ethambutol sheet, p. 264'),
  },
  {
    id: 'sucral-fq', coMed: 'sucralfate', tbDrugs: FQ, severity: 'separate',
    effect: 'Sucralfate markedly reduces fluoroquinolone absorption.',
    action: 'Give it at least 2 hours apart from the fluoroquinolone.',
    provenance: ats('Drug–drug interactions — interactions affecting antituberculosis drugs'),
  },
  {
    id: 'antiemetic-lzd', coMed: 'antiemetic', tbDrugs: ['linezolid'], severity: 'monitor',
    effect: 'Antiemetics are among the drug classes that raise serotonin syndrome risk with linezolid.',
    action: 'Monitor for serotonin toxicity.',
    provenance: hb('Annex 1, linezolid sheet, p. 278'),
  },

  // ===========================================================================
  // Steroids, transplant, hormones
  // ===========================================================================
  {
    id: 'pred-rif', coMed: 'prednisolone', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin induces CYP3A4 and roughly halves prednisolone exposure.',
    action: 'Corticosteroids may need a 2- to 3-fold dose increase; monitor clinically. Doses that look high are effectively normal on rifampicin — do not reduce them on that assumption.',
    provenance: cite([
      ['ats-dstb-2016', T8 + ' — corticosteroids'],
      ['who-handbook-m4-2025', 'Annex 1, rifampicin sheet, p. 295'],
      ['author-notes', 'IRIS notes, Section 10b, footnote'],
      ['author-notes-renal', 'Renal transplant — a separate problem'],
    ]),
  },
  {
    id: 'pred-fq', coMed: 'prednisolone', tbDrugs: FQ, severity: 'monitor',
    effect: 'Concomitant corticosteroids increase the risk of tendon rupture with fluoroquinolones.',
    action: 'Warn the patient; stop the fluoroquinolone at the first sign of tendon pain.',
    provenance: hb('Annex 1, levofloxacin sheet, p. 275; moxifloxacin sheet, p. 284'),
  },
  {
    id: 'cni-rif', coMed: 'calcineurin', tbDrugs: R, severity: 'avoid',
    effect: 'Rifampicin induces CYP3A4 and P-glycoprotein. Tacrolimus, ciclosporin and sirolimus levels fall 60–90%, with graft rejection within 1–2 weeks.',
    action: 'Prefer a rifampicin-free regimen, or rifabutin, which may allow ciclosporin with a rifamycin. If rifampicin is kept, raise the calcineurin inhibitor 3–5-fold with trough levels twice weekly, and expect levels to rebound when rifampicin stops.',
    provenance: cite([
      ['author-notes-renal', 'Renal transplant — a separate problem'],
      ['ats-dstb-2016', T8 + ' — immunosuppressive agents; "Drug interactions due to rifamycins"'],
    ]),
  },
  {
    id: 'myelo-lzd', coMed: 'myelosuppressive', tbDrugs: ['linezolid'], severity: 'avoid',
    effect: 'Additive myelosuppression.',
    action: 'A relative contraindication to BPaLM. If unavoidable, monitor the blood count closely.',
    provenance: cite([
      ['ntep-drtb-2024', 'Table 3.2, p. 25'],
      ['who-handbook-m4-2025', 'Annex 2, p. 313'],
    ]),
  },
  {
    id: 'ocp-rif', coMed: 'ocp', tbDrugs: R, severity: 'avoid',
    effect: 'Rifampicin reduces the effectiveness of the oral contraceptive pill.',
    action: 'WHO: use injectable medroxyprogesterone or an intrauterine device instead. ATS: add a barrier method.',
    provenance: cite([
      ['who-handbook-m4-2025', 'Annex 1, rifampicin sheet, pp. 295–296'],
      ['ats-dstb-2016', T8 + ' — hormone therapy'],
    ]),
  },
  {
    id: 'ocp-drtb', coMed: 'ocp', tbDrugs: ['second-line'], severity: 'monitor',
    effect: 'Oral contraceptives may be less effective because of vomiting and interactions with DR-TB drugs. The source does not name which drugs.',
    action: 'Counsel intensively on contraception; do not rely on the pill alone.',
    provenance: ntep('Section 3.9.1, p. 40'),
  },
  {
    id: 'dmpa-rif', coMed: 'dmpa', tbDrugs: R, severity: 'info',
    effect: 'WHO names injectable medroxyprogesterone, or an intrauterine device, as the contraception to use with rifampicin.',
    action: 'A recommended option on rifampicin.',
    provenance: hb('Annex 1, rifampicin sheet, p. 295'),
  },
  {
    id: 'thyrox-rif', coMed: 'levothyroxine', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin decreases levothyroxine concentrations.',
    action: 'Monitor TSH; the levothyroxine dose may need increasing.',
    provenance: ats(T8 + ' — hormone therapy'),
  },
  {
    id: 'tamox-rif', coMed: 'tamoxifen', tbDrugs: R, severity: 'adjust',
    effect: 'Rifampicin substantially decreases tamoxifen concentrations.',
    action: 'May need alternative therapy or a rifamycin-free regimen.',
    provenance: ats(T8 + ' — hormone therapy'),
  },

  // ===========================================================================
  // Other
  // ===========================================================================
  {
    id: 'rfb-bdq', coMed: 'rifabutin', tbDrugs: ['bedaquiline'], severity: 'avoid',
    effect: 'Rifabutin, like all rifamycins, significantly reduces bedaquiline concentrations. Bedaquiline also raises rifabutin levels, risking uveitis and neutropenia.',
    action: 'Avoid co-administration.',
    provenance: cite([
      ['who-handbook-m4-2025', 'Annex 1, bedaquiline sheet, p. 254'],
      ['author-notes-renal', 'Renal transplant — a separate problem'],
    ]),
  },
  {
    id: 'cold-lzd', coMed: 'cold-remedy', tbDrugs: ['linezolid'], severity: 'avoid',
    effect: 'Over-the-counter cough and cold products (dextromethorphan, pseudoephedrine, diphenhydramine, guaifenesin) raise the risk of serotonin syndrome with linezolid.',
    action: 'Tell the patient to avoid them while on linezolid.',
    provenance: hb('Annex 1, linezolid sheet, p. 278'),
  },
  {
    id: 'symp-lzd', coMed: 'sympathomimetic', tbDrugs: ['linezolid'], severity: 'monitor',
    effect: 'Sympathomimetics and vasopressors interact with linezolid (an MAO inhibitor).',
    action: 'Titrate cautiously and monitor blood pressure.',
    provenance: hb('Annex 1, linezolid sheet, p. 278'),
  },
  {
    id: 'qt-stack', coMed: 'qt-drugs', tbDrugs: QT_TB, severity: 'monitor',
    effect: 'Additive QTcF prolongation. The handbook lists azoles, macrolides, metoclopramide, ondansetron, efavirenz, furosemide, hydrochlorothiazide, citalopram, escitalopram, methadone, antiarrhythmics, neuroleptics and quinoline antimalarials.',
    action: 'Avoid where possible; if prescribed, monitor the ECG and keep potassium, calcium and magnesium normal. A relative contraindication to BPaLM.',
    provenance: cite([
      ['ntep-drtb-2024', 'Table 3.2, p. 25; Annexure 4, p. 64'],
      ['who-handbook-m4-2025', 'Annex 1, bedaquiline p. 254, clofazimine p. 256, delamanid p. 261, pretomanid p. 290; Annex 2, p. 312'],
    ]),
  },
]

/**
 * Interactions between two anti-TB drugs in the same regimen.
 * QT stacking between TB drugs is graded in the QT module, not duplicated here.
 */
export const TB_TB: { id: string; a: string; b: string; severity: InteractionSeverity; effect: string; action: string; provenance: Provenance }[] = [
  {
    id: 'rif-bdq', a: 'rifampicin', b: 'bedaquiline', severity: 'avoid',
    effect: 'Rifamycins significantly reduce bedaquiline concentrations (by more than half).',
    action: 'Do not combine; strong CYP3A inducers such as rifamycins are listed as a contraindication to bedaquiline.',
    provenance: hb('Annex 1, bedaquiline sheet, pp. 253–254'),
  },
  {
    id: 'rif-pa', a: 'rifampicin', b: 'pretomanid', severity: 'avoid',
    effect: 'Rifampicin decreased pretomanid AUC by 66% in studies.',
    action: 'Avoid strong CYP3A inducers with pretomanid where possible.',
    provenance: hb('Annex 1, pretomanid sheet, p. 290'),
  },
  {
    id: 'rif-mfx', a: 'rifampicin', b: 'moxifloxacin', severity: 'adjust',
    effect: 'Rifampicin lowers moxifloxacin concentrations by 25–30%. The same has not been reported for levofloxacin.',
    action: 'Where a fluoroquinolone is added to a rifampicin regimen (Hr-TB), WHO prefers levofloxacin.',
    provenance: cite([
      ['who-m4-2025', 'Hr-TB, rationale for levofloxacin, p. 142'],
      ['ats-dstb-2016', 'Drug–drug interactions — interactions affecting antituberculosis drugs'],
    ]),
  },
  {
    id: 'inh-cs', a: 'isoniazid', b: 'cycloserine', severity: 'monitor',
    effect: 'Increased risk of CNS toxicity.',
    action: 'Monitor for neuropsychiatric effects.',
    provenance: hb('Annex 1, cycloserine sheet, p. 258; high-dose isoniazid sheet, p. 271'),
  },
  {
    id: 'eto-inh', a: 'ethionamide', b: 'isoniazid', severity: 'monitor',
    effect: 'Ethionamide temporarily raises isoniazid concentrations; side effects may increase.',
    action: 'Monitor for isoniazid toxicity.',
    provenance: hb('Annex 1, ethionamide sheet, p. 266'),
  },
  {
    id: 'eto-cs', a: 'ethionamide', b: 'cycloserine', severity: 'monitor',
    effect: 'Potential for increased side effects when combined.',
    action: 'Monitor closely.',
    provenance: hb('Annex 1, ethionamide sheet, p. 266'),
  },
]

/**
 * Rifampicin's induction has an onset and an offset. A dose raised to
 * compensate becomes an overdose two weeks after rifampicin stops.
 */
export const RIFAMPICIN_TIMING: Statement = {
  id: 'ddi.rif-timing',
  text: 'Rifampicin’s effect takes about 1–2 weeks to build up and about 2 weeks to wear off',
  detail:
    'If you raised another drug’s dose to compensate, reduce it again within 2 weeks of stopping rifampicin. Rifabutin can replace rifampicin when an interaction is unacceptable, for example with ciclosporin or most HIV protease inhibitors.',
  provenance: ats('Drug–drug interactions — "Drug interactions due to rifamycins"'),
}

// ---------------------------------------------------------------------------
// Recognised but unsourced
// ---------------------------------------------------------------------------

/**
 * Drugs the checker recognises so it can say "not covered" instead of
 * returning nothing. Holds NO interaction claim — only names.
 */
export const UNSOURCED: { id: string; name: string; aliases: string[] }[] = [
  { id: 'vka-other', name: 'Acenocoumarol and other vitamin K antagonists', aliases: ['acenocoumarol', 'acitrom', 'nicoumalone', 'phenindione'] },
  { id: 'antiepileptic-other', name: 'Other antiepileptics', aliases: ['levetiracetam', 'oxcarbazepine', 'topiramate', 'lacosamide', 'clobazam', 'brivaracetam'] },
  { id: 'buprenorphine', name: 'Buprenorphine', aliases: ['buprenorphine'] },
  { id: 'ccb-other', name: 'Other antihypertensives', aliases: ['amlodipine', 'cilnidipine', 'telmisartan', 'olmesartan', 'ramipril', 'atenolol', 'bisoprolol', 'carvedilol', 'prazosin'] },
  { id: 'hormonal-other', name: 'Contraceptive implant or emergency pill', aliases: ['implant', 'levonorgestrel', 'emergency contraception', 'i-pill', 'etonogestrel'] },
  { id: 'inhaled', name: 'Inhaled corticosteroids and bronchodilators', aliases: ['budesonide', 'fluticasone', 'beclomethasone', 'formoterol', 'salmeterol', 'tiotropium', 'glycopyrronium', 'salbutamol', 'levosalbutamol', 'doxofylline', 'montelukast'] },
  { id: 'antimalarial-other', name: 'Artemisinin-based antimalarials', aliases: ['artemether', 'lumefantrine', 'artesunate', 'primaquine'] },
  { id: 'antiplatelet', name: 'Antiplatelet drugs', aliases: ['aspirin', 'clopidogrel', 'ticagrelor', 'prasugrel'] },
  { id: 'ppi', name: 'Proton pump inhibitors and H2 blockers', aliases: ['pantoprazole', 'omeprazole', 'esomeprazole', 'rabeprazole', 'ranitidine', 'famotidine'] },
]

export const UNSOURCED_NOTE =
  'An interaction missing from the documents on file is not evidence of safety. Check a drug-interaction reference before co-prescribing, and send a source so it can be added here.'

export const LIVERPOOL_POINTER = cite([
  ['who-m4-2025', 'Longer regimens — HIV infection, p. 133; Starting ART, p. 152'],
  ['ats-dstb-2016', 'Table 8 footnote; "Useful websites regarding drug interactions"'],
])

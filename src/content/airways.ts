import type { Provenance, Statement } from '@/types/content'

/**
 * TB with COPD, asthma, and post-TB lung disease.
 *
 * Sources:
 *   gold    GOLD 2026 report — printed page = PDF page minus 11. The TB section
 *           is "Pulmonary tuberculosis", Chapter 5, pp. 120–121.
 *   gina    GINA 2026 strategy report — printed page = PDF page minus 1.
 *   ptld    Clinical standards for post-TB lung disease (IJTLD 2021) — HTML,
 *           no page numbers; locators name the standard or table.
 *   hb      WHO operational handbook M4 2025.
 *   dtc     NTEP National Guidance on Differentiated TB Care 2025.
 *
 * GOLD and GINA are international strategy documents. Nothing here is NTEP
 * policy unless it cites an NTEP source.
 *
 * Known gap, stated rather than filled: no source on file says whether to
 * continue, reduce or stop an inhaled corticosteroid once active TB has been
 * diagnosed and treatment has started. `ICS_DURING_TB_GAP` holds that place.
 */

const gold = (locator: string): Provenance => ({ citations: [{ source: 'gold-2026', locator }], status: 'source-checked' })
const gina = (locator: string): Provenance => ({ citations: [{ source: 'gina-2026', locator }], status: 'source-checked' })
const ptld = (locator: string): Provenance => ({ citations: [{ source: 'ptld-standards-2021', locator }], status: 'source-checked' })
const dtc = (locator: string): Provenance => ({ citations: [{ source: 'ntep-dtc-2025', locator }], status: 'source-checked' })
const cite = (cs: [string, string][]): Provenance => ({
  citations: cs.map(([source, locator]) => ({ source, locator })),
  status: 'source-checked',
})

// ---------------------------------------------------------------------------
// Why the two diseases travel together
// ---------------------------------------------------------------------------

export const LINKS: Statement[] = [
  {
    id: 'aw.copd-risk',
    text: 'COPD triples the risk of active TB, and past TB is a cause of COPD',
    detail:
      'A history of pulmonary TB is associated with chronic airflow obstruction; TB-associated COPD is increasingly recognised as a distinct cause of COPD. TB is both a differential diagnosis for COPD and a possible comorbidity.',
    provenance: gold('Chapter 1, infections, p. 15; Chapter 5, pulmonary tuberculosis, pp. 120–121'),
  },
  {
    id: 'aw.smoking',
    text: 'Smoking and TB act together',
    detail:
      'Patients with TB who smoke often have more severe disease, more cavitation, a delayed response to anti-TB treatment and worse outcomes.',
    provenance: gold('Chapter 5, pulmonary tuberculosis, p. 121'),
  },
]

// ---------------------------------------------------------------------------
// Do not miss TB in a patient labelled COPD or asthma
// ---------------------------------------------------------------------------

export const RED_FLAGS: Statement = {
  id: 'aw.redflags',
  text: 'Investigate for TB when a patient with COPD or asthma has these',
  detail:
    'Chronic cough with haemoptysis, fever, night sweats, anorexia or weight loss, or a unilateral wheeze. In COPD, weight loss and anorexia can be signs of TB and should always be investigated.',
  provenance: cite([
    ['gina-2026', 'Box 1-3, differential diagnosis of asthma, p. 30'],
    ['gold-2026', 'Chapter 2, additional clinical features in severe disease, pp. 23–24'],
  ]),
}

export const DIAGNOSIS: Statement[] = [
  {
    id: 'aw.lmic',
    text: 'In TB-endemic settings the asthma differential includes TB',
    detail:
      'GINA notes that many patients with respiratory symptoms present at TB clinics. Before starting inhaled treatment for undifferentiated obstructive disease in low-resource settings, it is important to exclude HIV and TB first.',
    provenance: gina('Diagnosis in LMICs, p. 38; management in low-resource settings, p. 133'),
  },
  {
    id: 'aw.refer',
    text: 'Refer when the airways diagnosis does not fit',
    detail:
      'Persistent symptoms or exacerbations despite treatment; an uncertain diagnosis, including post-tuberculous scarring or bronchiectasis; or atypical features such as haemoptysis, significant weight loss, night sweats or fever.',
    provenance: gina('Section 7, referral for patients with features of asthma and COPD, p. 147'),
  },
]

// ---------------------------------------------------------------------------
// Inhaled corticosteroids
// ---------------------------------------------------------------------------

export const ICS_RISK: Statement = {
  id: 'aw.ics.risk',
  text: 'Inhaled corticosteroids, especially at higher doses, may increase the risk of TB',
  detail:
    'The risk applies in COPD and in patients with underlying risk factors: living in a TB-endemic region, radiological sequelae of TB, immunocompromise, diabetes, or low body weight. In such settings use ICS with caution, exclude active TB before starting, and monitor closely. The increased risk has been found in observational studies and a meta-analysis of RCTs, but without dedicated RCT data firm conclusions are not possible.',
  provenance: gold('Chapter 5, pulmonary tuberculosis, p. 121; Chapter 5, ICS adverse effects, p. 151'),
}

export const ICS_AGAINST: Statement = {
  id: 'aw.ics.against',
  text: 'In COPD, a history of mycobacterial infection counts against adding an ICS',
  detail:
    'GOLD lists it with repeated pneumonia and blood eosinophils below 100 cells/µL as factors against adding ICS to long-acting bronchodilators. The figure notes that the scenario is different when considering ICS withdrawal.',
  provenance: gold('Figure 3.10, factors to consider when initiating ICS treatment, p. 67'),
}

export const ICS_ASTHMA: Statement = {
  id: 'aw.ics.asthma',
  text: 'In asthma, ICS-containing treatment is the cornerstone of care',
  detail:
    'GINA: ICS-containing medication is the cornerstone of care for all patients with asthma, regardless of severity. GOLD: if a patient with COPD has concomitant asthma, treat as asthma — ICS use is mandatory.',
  provenance: cite([
    ['gina-2026', 'Introduction, p. 15'],
    ['gold-2026', 'Chapter 3, initial pharmacological management, p. 65'],
  ]),
}

export const ICS_BRONCHIECTASIS: Statement = {
  id: 'aw.ics.bx',
  text: 'COPD with bronchiectasis: weigh ICS carefully',
  detail:
    'These patients are prone to pneumonia and non-tuberculous mycobacterial infection. A blood eosinophil count of 300 cells/µL could support ICS use; if lower respiratory infections are frequent, consider stopping it.',
  provenance: gold('Chapter 5, bronchiectasis, p. 121'),
}

/** The question physicians ask most — and no source on file answers it. */
export const ICS_DURING_TB_GAP = {
  title: 'Continue, reduce or stop the ICS once TB treatment has started? No source on file says',
  body:
    'GOLD’s caution is about starting an ICS in someone at risk (exclude active TB first). None of GOLD, GINA, the WHO handbook, NTEP or the post-TB lung disease standards addresses a patient already on an ICS who is then diagnosed with active TB. For asthma, GINA and GOLD treat ICS as essential. This will not be filled from memory — send a source if you have one.',
}

// ---------------------------------------------------------------------------
// While on TB treatment
// ---------------------------------------------------------------------------

export const ON_TREATMENT: Statement[] = [
  {
    id: 'aw.bronchospasm',
    text: 'Bronchospasm during DR-TB treatment: inhaled β2-agonist, ICS, or oral or injectable steroids',
    detail: 'Salbutamol, beclomethasone, prednisolone or dexamethasone are the examples given. Spacers help inhaled delivery in children and some adults.',
    provenance: { citations: [{ source: 'who-handbook-m4-2025', locator: 'Annex 2, Table A2.4, ancillary medications — bronchospasm, p. 340' }], status: 'source-checked' },
  },
  {
    id: 'aw.oral-steroid',
    text: 'Oral steroids for an exacerbation on rifampicin may need 2–3 times the usual dose',
    detail: 'Rifampicin roughly halves prednisolone exposure. See the interaction checker for the full entry.',
    provenance: cite([
      ['ats-dstb-2016', 'Table 8, clinically significant interactions involving the rifamycins — corticosteroids'],
      ['author-notes', 'IRIS notes, Section 10b, footnote'],
    ]),
  },
  {
    id: 'aw.theophylline',
    text: 'Theophylline: rifampicin lowers its level; isoniazid may raise its toxicity',
    detail: 'Therapeutic drug monitoring is recommended. Levofloxacin and moxifloxacin do not affect theophylline metabolism.',
    provenance: { citations: [{ source: 'ats-dstb-2016', locator: 'Table 8 — theophylline; drug interactions due to INH and to the fluoroquinolones' }], status: 'source-checked' },
  },
]

export const INHALER_INTERACTION_GAP =
  'No source on file addresses interactions between anti-TB drugs and inhaled corticosteroids, LABA or LAMA inhalers, or montelukast.'

// ---------------------------------------------------------------------------
// Severity — when to admit
// ---------------------------------------------------------------------------

export const SEVERE: Statement[] = [
  {
    id: 'aw.severe-copd',
    text: 'Severe COPD is a listed reason for severe illness needing inpatient care',
    detail: 'Recorded in the comprehensive assessment of a triage-positive patient at the referral facility.',
    provenance: dtc('Annexure 2, comprehensive DTC assessment case form, p. 70'),
  },
  {
    id: 'aw.niv',
    text: 'Non-invasive ventilation for COPD exacerbations is a desirable therapeutic at referral facilities',
    provenance: dtc('Annexure 4, facility-wise diagnostics and therapeutics, p. 72'),
  },
]

// ---------------------------------------------------------------------------
// End of TB treatment — post-TB lung disease
// ---------------------------------------------------------------------------

export const PTLD_WHAT: Statement = {
  id: 'aw.ptld.what',
  text: 'About a third of people who survive pulmonary TB have post-TB lung disease',
  detail:
    'Defined as chronic respiratory abnormality, with or without symptoms, attributable at least in part to previous pulmonary TB: bronchiectasis, fibrosis, pleural thickening, cavitation, pulmonary hypertension, Aspergillus or NTM colonisation. It carries reduced life expectancy and an increased risk of recurrent TB.',
  provenance: cite([
    ['ptld-editorial-2024', 'Editorial, paragraph 1'],
    ['who-handbook-m4-2025', 'Extensive pulmonary TB disease, p. 70'],
  ]),
}

export const PTLD_ASSESS: { verb: string; s: Statement }[] = [
  {
    verb: 'ASSESS',
    s: {
      id: 'aw.ptld.eot',
      text: 'Evaluate every patient completing TB treatment for post-TB lung disease, as soon as possible',
      detail: 'WHO specifically asks that patients with extensive disease be thoroughly evaluated after MDR/RR-TB treatment.',
      provenance: cite([
        ['ptld-standards-2021', 'Standard 1'],
        ['who-handbook-m4-2025', 'Extensive pulmonary TB disease, p. 70'],
      ]),
    },
  },
  {
    verb: 'HISTORY',
    s: {
      id: 'aw.ptld.history',
      text: 'Respiratory history: asthma, COPD, bronchiectasis, smoking, biomass and silica exposure, vaccinations',
      detail: 'Record known respiratory comorbidities and their previous treatment, and vaccination history (influenza, pneumococcal, COVID-19).',
      provenance: ptld('Standard 1, focused respiratory history'),
    },
  },
  {
    verb: 'EXAMINE',
    s: {
      id: 'aw.ptld.exam',
      text: 'Weight, BMI trend, vital signs and oxygen saturation',
      detail: 'SpO2 below 94%, falling BMI, clubbing, coarse crackles, raised JVP or oedema may point to pathology other than TB or a concurrent condition.',
      provenance: ptld('Standard 1, clinical examination'),
    },
  },
  {
    verb: 'SEND',
    s: {
      id: 'aw.ptld.tests',
      text: 'Chest X-ray, spirometry before and after bronchodilator, 6-minute walk test with SpO2',
      detail: 'These, with a symptom score and quality-of-life questionnaire, are the essential set. CT, plethysmography, DLCO and blood gases are conditional. Compare spirometry with any earlier result.',
      provenance: ptld('Standard 1, Table 1'),
    },
  },
  {
    verb: 'REFER',
    s: {
      id: 'aw.ptld.pr',
      text: 'Evaluate for pulmonary rehabilitation once TB is cured or treatment completed',
      detail:
        'When any of these is present: impaired exercise capacity; respiratory symptoms; comorbid COPD, asthma, bronchiectasis, fibrosis or pulmonary hypertension; at least 1 hospitalisation or 2 exacerbations in the last 12 months; or obstruction, restriction or reduced DLCO on lung function.',
      provenance: ptld('Standard 2, Table 2'),
    },
  },
  {
    verb: 'COUNSEL',
    s: {
      id: 'aw.ptld.counsel',
      text: 'Smoking cessation, sputum clearance and possible post-TB symptoms',
      detail: 'Self-managed sputum clearance reduces exacerbations and unnecessary antibiotics. Counsel on possible respiratory sequelae and on returning if symptoms recur.',
      provenance: cite([
        ['ptld-standards-2021', 'Standard 5'],
        ['who-handbook-m4-2025', 'Counselling at the end of TB treatment, p. 217'],
      ]),
    },
  },
]

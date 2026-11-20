import type { Provenance } from '@/types/content'

/**
 * Anti-TB dosing in renal impairment.
 *
 * THE GOVERNING PRINCIPLE, and the reason this is not a simple dose table:
 * renally cleared drugs have their INTERVAL extended, not their dose reduced.
 * Ethambutol, the fluoroquinolones and the aminoglycosides are
 * concentration-dependent killers — a reduced daily dose produces
 * sub-inhibitory peaks and selects resistance, while a full dose at a longer
 * interval preserves the peak and still allows clearance.
 *
 * Source is clinician-authored notes, not a published table. See the source
 * registry entry for what that means.
 */

const notes = (locator: string): Provenance => ({
  citations: [{ source: 'author-notes-renal', locator }],
  status: 'source-checked',
})

export type Clearance = 'hepatic' | 'renal' | 'mixed' | 'other'

export interface RenalDrugDose {
  id: string
  name: string
  clearance: Clearance
  /** Dose when CrCl is below 30 mL/min, or on haemodialysis. */
  doseBelow30: string
  /** Whether the interval changes rather than the dose. */
  intervalExtended: boolean
  dialysable: boolean | 'partly' | 'unclear'
  /** Why this matters at the bedside. */
  note: string
  /** Absolute bar in renal failure. */
  contraindicated?: boolean
  provenance: Provenance
}

export const RENAL_DOSING: RenalDrugDose[] = [
  {
    id: 'isoniazid',
    name: 'Isoniazid',
    clearance: 'hepatic',
    doseBelow30: '300 mg daily — UNCHANGED',
    intervalExtended: false,
    dialysable: 'partly',
    note: 'Add pyridoxine 50–100 mg daily. Uraemia and isoniazid both cause peripheral neuropathy, and the effect is additive.',
    provenance: notes('Master pharmacology table; renal dosing table'),
  },
  {
    id: 'rifampicin',
    name: 'Rifampicin',
    clearance: 'hepatic',
    doseBelow30: '10 mg/kg (450–600 mg) daily — UNCHANGED',
    intervalExtended: false,
    dialysable: false,
    note: 'DAILY ONLY. Intermittent rifampicin causes immune-mediated flu-like syndrome, haemolysis and acute interstitial nephritis — the last of which causes AKI in a patient who can least afford it.',
    provenance: notes('Renal dosing table; core principles'),
  },
  {
    id: 'pyrazinamide',
    name: 'Pyrazinamide',
    clearance: 'mixed',
    doseBelow30: '25–35 mg/kg THREE TIMES A WEEK',
    intervalExtended: true,
    dialysable: true,
    note: 'Hepatically metabolised but the metabolites are renally excreted. Pyrazinoic acid accumulates, causing hyperuricaemia and gout. Asymptomatic hyperuricaemia alone is not a reason to stop it.',
    provenance: notes('Master pharmacology table'),
  },
  {
    id: 'ethambutol',
    name: 'Ethambutol',
    clearance: 'renal',
    doseBelow30: '15–25 mg/kg THREE TIMES A WEEK',
    intervalExtended: true,
    dialysable: true,
    note: '80% renally cleared. Daily dosing in renal failure accumulates and causes optic neuritis — the main preventable toxicity in this group. Test colour vision monthly.',
    provenance: notes('Master pharmacology table'),
  },
  {
    id: 'levofloxacin',
    name: 'Levofloxacin',
    clearance: 'renal',
    doseBelow30: '750–1000 mg THREE TIMES A WEEK, post-dialysis',
    intervalExtended: true,
    dialysable: true,
    note: 'Never daily in renal failure — tendinopathy and CNS toxicity accumulate.',
    provenance: notes('Renal dosing table'),
  },
  {
    id: 'moxifloxacin',
    name: 'Moxifloxacin',
    clearance: 'hepatic',
    doseBelow30: '400 mg daily — UNCHANGED',
    intervalExtended: false,
    dialysable: false,
    note: 'Hepatically cleared, so it is the PREFERRED fluoroquinolone in renal failure. Weigh against its greater QT effect.',
    provenance: notes('DR-TB in renal disease, drug-by-drug dosing'),
  },
  {
    id: 'linezolid',
    name: 'Linezolid',
    clearance: 'other',
    doseBelow30: '600 mg daily — give AFTER dialysis',
    intervalExtended: false,
    dialysable: true,
    note: 'Non-enzymatic clearance so the parent dose is unchanged, but metabolites accumulate in end-stage renal disease and raise the risk of myelosuppression, lactic acidosis and neuropathy. Drop to 300 mg if cytopenia develops. Roughly 30% is removed per dialysis session.',
    provenance: notes('DR-TB in renal disease, drug-by-drug dosing'),
  },
  {
    id: 'cycloserine',
    name: 'Cycloserine',
    clearance: 'renal',
    doseBelow30: '250 mg daily, OR 500 mg three times a week post-dialysis',
    intervalExtended: true,
    dialysable: true,
    note: 'Accumulation causes psychosis and seizures, and uraemia already lowers the seizure threshold. Cycloserine toxicity is routinely mistaken for uraemic encephalopathy.',
    provenance: notes('DR-TB in renal disease, drug-by-drug dosing'),
  },
  {
    id: 'bedaquiline',
    name: 'Bedaquiline',
    clearance: 'hepatic',
    doseBelow30: '400 mg daily × 2 weeks, then 200 mg three times a week — UNCHANGED',
    intervalExtended: false,
    dialysable: false,
    note: 'CYP3A4 cleared and 99.9% protein bound, so dialysis does not remove it. QT monitoring is mandatory, and electrolyte shifts on dialysis raise the torsades risk.',
    provenance: notes('DR-TB in renal disease, drug-by-drug dosing'),
  },
  {
    id: 'clofazimine',
    name: 'Clofazimine',
    clearance: 'other',
    doseBelow30: '100 mg daily — UNCHANGED',
    intervalExtended: false,
    dialysable: false,
    note: 'Faecal and biliary clearance. Take with food. Watch QT and skin pigmentation, which is an adherence problem in its own right.',
    provenance: notes('DR-TB in renal disease, drug-by-drug dosing'),
  },
  {
    id: 'pretomanid',
    name: 'Pretomanid',
    clearance: 'hepatic',
    doseBelow30: '200 mg daily — CAUTION or AVOID below eGFR 30',
    intervalExtended: false,
    dialysable: 'unclear',
    note: 'Under 1% renally cleared, but the trials EXCLUDED these patients so there is no evidence. This is what limits BPaLM in advanced CKD.',
    provenance: notes('DR-TB in renal disease, drug-by-drug dosing'),
  },
  {
    id: 'delamanid',
    name: 'Delamanid',
    clearance: 'hepatic',
    doseBelow30: '100 mg twice daily — NOT RECOMMENDED below eGFR 30 (no data)',
    intervalExtended: false,
    dialysable: false,
    note: 'QT prolongation via the DM-6705 metabolite.',
    provenance: notes('DR-TB in renal disease, drug-by-drug dosing'),
  },
  {
    id: 'ethionamide',
    name: 'Ethionamide',
    clearance: 'hepatic',
    doseBelow30: '15–20 mg/kg — UNCHANGED',
    intervalExtended: false,
    dialysable: false,
    note: 'Monitor TSH — hypothyroidism is common and easily missed.',
    provenance: notes('Master pharmacology table'),
  },
  {
    id: 'amikacin',
    name: 'Amikacin / streptomycin / kanamycin / capreomycin',
    clearance: 'renal',
    doseBelow30: 'CONTRAINDICATED in DR-TB. If truly unavoidable in DS-TB: 12–15 mg/kg two to three times a week with drug levels and audiometry.',
    intervalExtended: true,
    dialysable: true,
    contraindicated: true,
    note: 'Nephrotoxic and ototoxic, and both are additive with existing renal loss. Ototoxicity is irreversible. Residual renal function is destroyed.',
    provenance: notes('Central principles; drug-by-drug dosing'),
  },
  {
    id: 'pas',
    name: 'Para-aminosalicylic acid',
    clearance: 'renal',
    doseBelow30: 'AVOID. If essential, use granules and avoid the sodium salt.',
    intervalExtended: false,
    dialysable: true,
    note: 'The sodium load causes volume overload and refractory hypertension in CKD.',
    provenance: notes('DR-TB in renal disease, drug-by-drug dosing'),
  },
  {
    id: 'meropenem',
    name: 'Meropenem with amoxicillin-clavulanate',
    clearance: 'renal',
    doseBelow30: '1 g ONCE daily (from 1 g twice daily), post-dialysis',
    intervalExtended: true,
    dialysable: true,
    note: 'Prefer meropenem over imipenem — imipenem causes seizures in renal failure.',
    provenance: notes('DR-TB in renal disease, drug-by-drug dosing'),
  },
]

export const RENAL_PRINCIPLES = [
  {
    id: 'principle.interval',
    text: 'Extend the INTERVAL, do not reduce the dose',
    detail:
      'Ethambutol, the fluoroquinolones and the aminoglycosides are concentration-dependent killers. A reduced daily dose gives sub-inhibitory peaks and selects resistance; a full dose at a longer interval preserves the peak while allowing clearance.',
    provenance: notes('Core principle, Part B'),
  },
  {
    id: 'principle.post-hd',
    text: 'On dialysis days, give ALL drugs AFTER the session',
    detail:
      'Pyrazinamide, ethambutol, cycloserine, linezolid and levofloxacin are all dialysable. Dosing before dialysis strips the drug out and leaves the patient sub-therapeutic. Post-dialysis dosing also allows directly observed therapy by dialysis staff.',
    provenance: notes('Core principles; practical rules'),
  },
  {
    id: 'principle.hepatic-safe',
    text: 'Hepatically cleared drugs need no change',
    detail:
      'Isoniazid, rifampicin, moxifloxacin, bedaquiline, clofazimine and linezolid are all given at full dose. The all-oral era has largely solved DR-TB dosing in renal failure.',
    provenance: notes('Core principles'),
  },
  {
    id: 'principle.no-intermittent-rif',
    text: 'Never use intermittent rifampicin',
    detail:
      'Intermittent dosing causes immune-mediated flu-like syndrome, haemolysis and acute interstitial nephritis. Daily only.',
    provenance: notes('Core principles, DR-TB in renal disease'),
  },
  {
    id: 'principle.electrolytes',
    text: 'Correct potassium and magnesium BEFORE starting QT-prolonging drugs',
    detail:
      'Dialysis-related electrolyte swings, plus bedaquiline, moxifloxacin and clofazimine together, multiply the torsades risk.',
    provenance: notes('Core principles, DR-TB in renal disease'),
  },
  {
    id: 'principle.pyridoxine',
    text: 'Pyridoxine 50–100 mg daily is mandatory',
    detail: 'Uraemic, isoniazid and cycloserine neuropathy all stack.',
    provenance: notes('Practical rules'),
  },
]

/** The DS-TB regimen shape in CrCl below 30 or on haemodialysis. */
export const RENAL_DSTB_REGIMEN = {
  intensive: 'H daily + R daily + Z three times a week + E three times a week — 2 months',
  continuation: 'H daily + R daily + E three times a week — 4 months',
  total: '6 months; extend to 9 months in bone/joint or CNS disease, or in slow responders',
  provenance: notes('NTEP-compatible regimen in CrCl <30 mL/min or on haemodialysis'),
}

/** Renal transplant is an interaction problem, not a clearance problem. */
export const TRANSPLANT_INTERACTION = {
  problem:
    'Rifampicin induces CYP3A4 and P-glycoprotein. Tacrolimus, ciclosporin and sirolimus levels fall by 60–90%, causing ACUTE GRAFT REJECTION within 1–2 weeks.',
  options: [
    'Prefer a rifampicin-free regimen. In MDR-TB this is automatic, since rifampicin is already resistant — a hidden advantage.',
    'If a rifamycin is unavoidable, substitute RIFABUTIN, a weaker inducer. Note that bedaquiline raises rifabutin levels, risking uveitis and neutropenia.',
    'If rifampicin is retained, increase the calcineurin inhibitor 3–5 fold with trough levels twice weekly. Levels REBOUND when the rifamycin stops — a cause of nephrotoxicity.',
    'Double the maintenance steroid dose; steroids are cleared faster too.',
  ],
  provenance: notes('Renal transplant — a separate problem'),
}

export const RENAL_MONITORING = [
  { test: 'Creatinine, eGFR, potassium, uric acid', frequency: 'Monthly', action: 'Re-band the regimen if eGFR falls' },
  { test: 'Colour vision and visual acuity', frequency: 'Monthly while on ethambutol', action: 'Stop ethambutol immediately on any change' },
  { test: 'Audiometry', frequency: 'Monthly if an aminoglycoside is used', action: 'Stop the injectable' },
  { test: 'ECG QTc', frequency: 'Weeks 0, 2, 4, 8, 12, then monthly', action: 'QTc ≥500 ms or a rise of ≥60 ms — stop Bdq/Cfz/Mfx and correct electrolytes' },
  { test: 'Full blood count', frequency: 'Fortnightly for 2 months, then monthly', action: 'Hb below 8 or platelets below 50 — reduce linezolid to 300 mg or interrupt' },
  { test: 'TSH', frequency: '3-monthly on ethionamide or PAS', action: 'Treat hypothyroidism' },
]

export const RENAL_MONITORING_PROVENANCE = notes('Monitoring schedule')

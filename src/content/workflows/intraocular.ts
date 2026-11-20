import type { ConditionWorkflow } from '@/types/workflow'

/** Intraocular tuberculosis — ICMR STW, ICD-10 A18.3. Source p. 9. */
export const INTRAOCULAR_TB: ConditionWorkflow = {
  id: 'intraocular',
  site: 'other',
  title: 'Intraocular tuberculosis',
  icd10: 'A18.3',
  whenToSuspect: {
    history: [
      'Blurred vision',
      'Redness',
      'Photophobia',
      'Pain in the eye',
      'Floaters',
      'Flashes of light',
    ],
    examination: [
      'Assess visual acuity',
      'Anterior chamber cells, keratic precipitates, synechiae, irregular pupil, relative afferent pupillary defect',
      'Complicated cataract, high or very low intraocular pressure',
      'Vitritis, pars plana exudates, retinal vasculitis, retinitis, choroiditis, optic nerve head swelling',
      'REFER TO AN OPHTHALMOLOGIST for detailed examination — the facility must have at minimum a slit lamp, ophthalmoscope, and intraocular pressure assessment device',
    ],
  },
  investigations: {
    essential: ['Chest X-ray for healed or active pulmonary TB', 'Investigations to rule out other causes of the clinical presentation'],
    desirable: [
      'Mantoux test — 10 mm induration considered positive',
      'CT chest if available, for healed or active pulmonary TB',
      'Retinal photographs using a fundus camera',
      'Optical coherence tomography if available',
      'Fluorescein angiogram if available',
    ],
  },
  diagnostic: {
    entry: 'ocular-symptoms',
    nodes: [
      {
        id: 'ocular-symptoms',
        text: 'Ocular symptoms suggestive of intraocular TB',
        action:
          'Refer to an ophthalmologist for detailed examination. Imaging of the eye ascertains the diagnosis, the extent of disease, and supports follow-up and teleconsultation.',
        severity: 'warning',
      },
    ],
  },
  management: {
    treatment: [
      'ATT: 2 months of RHEZ plus 7 months of RH, depending on clinical response and side effects.',
      'Add pyridoxine 10 mg/day.',
      'Corticosteroids: topical steroid eye drops for severe or anterior chamber inflammation.',
      'Systemic corticosteroids for severe inflammation, in consultation with a uveitis expert.',
      'For treatment in children, refer to a paediatrician.',
    ],
    whenToRefer: [
      'Not confident to treat',
      'Vision threatening',
      'Non-response to treatment',
      'Side effects due to treatment',
      'Atypical reaction',
    ],
    followUp: [
      'Every 1–2 weeks in the first month, then monthly for 3 months, then 3-monthly.',
      'Eye: clinical grading of inflammation using fundus photographs and OCT scans if available.',
      'Topical steroids: monitor intraocular pressure, cataract, and any signs of bacterial or fungal infection.',
      'Systemic steroids: monitor body weight, blood sugar and blood pressure.',
    ],
  },
  provenance: {
    citations: [{ source: 'icmr-stw', locator: 'Intraocular tuberculosis workflow, ICD-10 A18.3, p. 9' }],
    status: 'source-checked',
  },
}

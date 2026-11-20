/**
 * Cockcroft-Gault creatinine clearance.
 *
 * A formula rather than guideline content, so it can be stated exactly:
 *   CrCl = ((140 - age) x weight) / (72 x serum creatinine), x 0.85 if female
 * with weight in kg and creatinine in mg/dL.
 */
export function cockcroftGault(
  ageYears: number | undefined,
  weightKg: number | undefined,
  creatinineMgDl: number | undefined,
  sex: string | undefined,
): number | undefined {
  if (ageYears == null || weightKg == null || creatinineMgDl == null) return undefined
  if (!Number.isFinite(ageYears) || !Number.isFinite(weightKg) || creatinineMgDl <= 0) return undefined
  const base = ((140 - ageYears) * weightKg) / (72 * creatinineMgDl)
  return sex === 'female' ? base * 0.85 : base
}

export interface RenalBand {
  label: string
  severity: 'ok' | 'caution' | 'warning' | 'critical'
  note: string
}

/**
 * Descriptive CKD-style bands. These describe renal function; they do NOT
 * carry dose adjustments, because no supplied source provides them.
 */
export function renalBand(crCl: number | undefined): RenalBand | undefined {
  if (crCl == null) return undefined
  if (crCl >= 90) return { label: 'Normal (≥90 mL/min)', severity: 'ok', note: 'No renal caution on this value alone.' }
  if (crCl >= 60)
    return { label: 'Mildly reduced (60–89 mL/min)', severity: 'ok', note: 'No renal caution on this value alone.' }
  if (crCl >= 30)
    return {
      label: 'Moderately reduced (30–59 mL/min)',
      severity: 'caution',
      note: 'Review nephrotoxic and renally cleared drugs. Dose figures are not in the supplied sources.',
    }
  if (crCl >= 15)
    return {
      label: 'Severely reduced (15–29 mL/min)',
      severity: 'warning',
      note: 'Below the endTB trial screening cut-off of 30 mL/min. Specialist input needed.',
    }
  return {
    label: 'Kidney failure (<15 mL/min)',
    severity: 'critical',
    note: 'Specialist and nephrology input required before prescribing.',
  }
}

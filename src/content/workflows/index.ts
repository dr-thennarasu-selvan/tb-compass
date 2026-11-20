import type { ConditionWorkflow } from '@/types/workflow'
import { PLEURAL_TB } from '@/content/workflows/pleural'
import { TBM } from '@/content/workflows/tbm'
import { PERICARDIAL_TB } from '@/content/workflows/pericardial'
import { LYMPHADENOPATHY } from '@/content/workflows/lymphadenopathy'
import { ABDOMINAL_TB } from '@/content/workflows/abdominal'
import { MUSCULOSKELETAL_TB } from '@/content/workflows/musculoskeletal'
import { INTRAOCULAR_TB } from '@/content/workflows/intraocular'
import { GENITOURINARY_TB } from '@/content/workflows/genitourinary'
import { CUTANEOUS_TB } from '@/content/workflows/cutaneous'
import { FEMALE_GENITAL_TB } from '@/content/workflows/femaleGenital'
import { PAED_INTRATHORACIC } from '@/content/workflows/paedIntrathoracic'
import { PAED_TBM } from '@/content/workflows/paedTbm'
import { PAED_LYMPH_NODE } from '@/content/workflows/paedLymphNode'
import { PAED_ABDOMINAL } from '@/content/workflows/paedAbdominal'
import { PAED_OSTEOARTICULAR } from '@/content/workflows/paedOsteoarticular'

/**
 * Registry of condition workflows in the ICMR STW shape. Nineteen exist in
 * the source document; add each one here as it is transcribed.
 */
export const WORKFLOWS: ConditionWorkflow[] = [
  TBM,
  PLEURAL_TB,
  PERICARDIAL_TB,
  LYMPHADENOPATHY,
  ABDOMINAL_TB,
  MUSCULOSKELETAL_TB,
  INTRAOCULAR_TB,
  GENITOURINARY_TB,
  FEMALE_GENITAL_TB,
  CUTANEOUS_TB,
  PAED_INTRATHORACIC,
  PAED_TBM,
  PAED_LYMPH_NODE,
  PAED_ABDOMINAL,
  PAED_OSTEOARTICULAR,
]

export function workflowForSite(site: string): ConditionWorkflow | undefined {
  return WORKFLOWS.find((w) => w.site === site)
}

import type { Provenance } from '@/types/content'
import type { View } from '@/components/Home'

/**
 * Deterioration forks.
 *
 * Several workflows say some version of "if it gets worse, it could be a
 * paradoxical reaction, drug resistance, or an alternative diagnosis" — three
 * problems with three different actions. That sentence is where the app can do
 * something a document cannot: route the clinician to the module that resolves
 * each branch.
 */

export interface ForkBranch {
  label: string
  action: string
  /** Module that resolves this branch, if one exists. */
  goTo?: View
  goToLabel?: string
}

export interface DeteriorationFork {
  id: string
  /** Workflow ids this fork applies to. */
  appliesTo: string[]
  trigger: string
  branches: ForkBranch[]
  provenance: Provenance
}

export const DETERIORATION_FORKS: DeteriorationFork[] = [
  {
    id: 'fork.effusion',
    appliesTo: ['pleural'],
    trigger: 'Pleural effusion INCREASING on treatment',
    branches: [
      {
        label: 'Paradoxical reaction',
        action: 'Worsening with immune recovery. Confirm the diagnosis and check whether steroids are indicated.',
        goTo: 'iris',
        goToLabel: 'IRIS module',
      },
      {
        label: 'Drug-resistant TB',
        action: 'Re-check the resistance status. A pending second-line LPA or DST changes the regimen.',
        goTo: 'cascade',
        goToLabel: 'Diagnostic pathway',
      },
      {
        label: 'Alternative aetiology',
        action: 'Reconsider the diagnosis. Pleural biopsy is the higher-yield sample.',
      },
    ],
    provenance: {
      citations: [{ source: 'icmr-stw', locator: 'Adult pleural TB workflow, Follow up, p. 3' }],
      status: 'source-checked',
    },
  },
  {
    id: 'fork.node',
    appliesTo: ['lymph-node', 'paed-lymph-node'],
    trigger: 'Lymph node ENLARGING on treatment',
    branches: [
      {
        label: 'Paradoxical worsening — constitutional symptoms HAVE resolved',
        action:
          'Likely paradoxical, but only once drug resistance is ruled out. May need anti-inflammatory agents, or surgical removal if accessible.',
        goTo: 'iris',
        goToLabel: 'IRIS module',
      },
      {
        label: 'Constitutional symptoms have NOT resolved',
        action: 'Suggests drug-resistant TB or an alternate cause. Check the old culture; send new cultures if none.',
        goTo: 'drtb',
        goToLabel: 'DR-TB regimens',
      },
      {
        label: 'Adequate drug levels in doubt',
        action: 'Consider therapeutic drug monitoring.',
      },
    ],
    provenance: {
      citations: [{ source: 'icmr-stw', locator: 'Peripheral lymphadenopathy workflow, response at 3 months, p. 2' }],
      status: 'source-checked',
    },
  },
  {
    id: 'fork.musculoskeletal',
    appliesTo: ['bone-joint', 'paed-osteoarticular'],
    trigger: 'Symptoms WORSENING on treatment — the timing decides the branch',
    branches: [
      {
        label: 'Early, under 3 months',
        action: 'Reads as a paradoxical reaction.',
        goTo: 'iris',
        goToLabel: 'IRIS module',
      },
      {
        label: 'Late, beyond 4 months',
        action: 'Raises the question of drug resistance.',
        goTo: 'drtb',
        goToLabel: 'DR-TB regimens',
      },
      {
        label: 'New neurological deficit at any time',
        action: 'Refer — imaging may show compressive myelopathy needing surgery.',
      },
    ],
    provenance: {
      citations: [{ source: 'icmr-stw', locator: 'Musculoskeletal TB workflow, follow-up, p. 7' }],
      status: 'source-checked',
    },
  },
  {
    id: 'fork.tbm',
    appliesTo: ['tbm', 'paed-tbm'],
    trigger: 'Deteriorating on TBM treatment',
    branches: [
      {
        label: 'Worsening headache with vomiting or altered sensorium',
        action: 'Hydrocephalus and raised intracranial pressure. May need an external ventricular drain or VP shunt.',
      },
      {
        label: 'Expanding tuberculoma, new focal deficit, or new seizures',
        action:
          'Could be a paradoxical reaction — particularly if HIV positive and recently started on ART. CNS IRIS carries the highest mortality of any subtype.',
        goTo: 'iris',
        goToLabel: 'IRIS module',
      },
      {
        label: 'No improvement or deterioration after 2–4 weeks',
        action: 'Consider MDR TB meningitis. Refer to a medical college or higher centre.',
        goTo: 'drtb',
        goToLabel: 'DR-TB regimens',
      },
      {
        label: 'Rising liver enzymes on a 12-month regimen',
        action: 'This regimen runs 12 months — hepatotoxicity risk is cumulative.',
        goTo: 'dili',
        goToLabel: 'Hepatotoxicity module',
      },
    ],
    provenance: {
      citations: [{ source: 'icmr-stw', locator: 'TBM workflows, complications and referral, pp. 5 and 19' }],
      status: 'source-checked',
    },
  },
  {
    id: 'fork.abdominal',
    appliesTo: ['abdominal', 'paed-abdominal'],
    trigger: 'Not responding, or deteriorating after initial improvement',
    branches: [
      {
        label: 'Non-response, or worsening constitutional symptoms after initial improvement',
        action: 'A pointer towards DR-TB investigation.',
        goTo: 'drtb',
        goToLabel: 'DR-TB regimens',
      },
      {
        label: 'Obstructive symptoms persisting or worsening',
        action:
          'May persist or worsen despite ATT — this ALONE is not treatment failure. Surgery if acute obstruction or perforation.',
      },
      {
        label: 'Crohn’s disease not excluded',
        action: 'Differentiating Crohn’s is genuinely difficult. Refer for further evaluation.',
      },
    ],
    provenance: {
      citations: [{ source: 'icmr-stw', locator: 'Abdominal TB workflows, monitoring, pp. 6 and 15' }],
      status: 'source-checked',
    },
  },
]

export function forksFor(workflowId: string): DeteriorationFork[] {
  return DETERIORATION_FORKS.filter((f) => f.appliesTo.includes(workflowId))
}

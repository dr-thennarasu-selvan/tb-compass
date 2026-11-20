import type { Provenance } from '@/types/content'

export type HepatotoxicityRisk = 'high' | 'moderate' | 'low' | 'minimal'

export interface Drug {
  id: string
  name: string
  /** Standard single-letter or short code, e.g. H, R, Z, E, Lfx. */
  code: string
  hepatotoxicity: HepatotoxicityRisk
  /** True if this drug is normally withdrawn in significant TB-DILI. */
  withdrawInDili: boolean
  /** Clinically important liver-specific behaviour, shown in the DILI module. */
  hepaticNote?: string
  provenance: Provenance
}

const p = (locator: string, source = 'ats-hepatotox-2006'): Provenance => ({
  citations: [{ source, locator }],
  status: 'needs-review',
})

export const DRUGS: Drug[] = [
  {
    id: 'isoniazid',
    name: 'Isoniazid',
    code: 'H',
    hepatotoxicity: 'high',
    withdrawInDili: true,
    hepaticNote:
      'A leading cause of hepatocellular TB-DILI. Risk rises with age and with pre-existing liver disease. Asymptomatic transaminase rise in the first weeks is common and usually self-limiting; distinguish it from true injury using the stop thresholds rather than the absolute number alone.',
    provenance: p('Isoniazid hepatotoxicity section'),
  },
  {
    id: 'rifampicin',
    name: 'Rifampicin',
    code: 'R',
    hepatotoxicity: 'moderate',
    withdrawInDili: true,
    hepaticNote:
      'Important distinction: isolated UNCONJUGATED hyperbilirubinaemia in the first weeks, with normal or near-normal transaminases, reflects competitive inhibition of bilirubin uptake and conjugation — it is benign and is not an indication to stop. True rifampicin hepatotoxicity is usually cholestatic or mixed. Check the direct/indirect split before withdrawing.',
    provenance: p('Rifampicin hepatotoxicity section'),
  },
  {
    id: 'pyrazinamide',
    name: 'Pyrazinamide',
    code: 'Z',
    hepatotoxicity: 'high',
    withdrawInDili: true,
    hepaticNote:
      'Dose-related hepatotoxicity. Frequently the drug that is permanently omitted after a severe episode, because it is the most dispensable of the three and rechallenge carries the least favourable risk-benefit.',
    provenance: p('Pyrazinamide hepatotoxicity section'),
  },
  {
    id: 'ethambutol',
    name: 'Ethambutol',
    code: 'E',
    hepatotoxicity: 'minimal',
    withdrawInDili: false,
    hepaticNote:
      'Not meaningfully hepatotoxic. Usually retained or used as part of a non-hepatotoxic bridging regimen. Its own dose-limiting toxicity is optic neuritis, and it requires renal dose adjustment.',
    provenance: p('Non-hepatotoxic agents'),
  },
  {
    id: 'levofloxacin',
    name: 'Levofloxacin',
    code: 'Lfx',
    hepatotoxicity: 'low',
    withdrawInDili: false,
    provenance: p('Fluoroquinolone use during hepatotoxicity'),
  },
  {
    id: 'moxifloxacin',
    name: 'Moxifloxacin',
    code: 'Mfx',
    hepatotoxicity: 'low',
    withdrawInDili: false,
    hepaticNote: 'Prolongs QT more than levofloxacin — weigh this if combined with bedaquiline or clofazimine.',
    provenance: p('Fluoroquinolone use during hepatotoxicity'),
  },
  {
    id: 'amikacin',
    name: 'Amikacin',
    code: 'Am',
    hepatotoxicity: 'minimal',
    withdrawInDili: false,
    hepaticNote: 'Non-hepatotoxic, but requires audiometry and renal monitoring; avoid if renal impairment.',
    provenance: p('Non-hepatotoxic agents'),
  },
  {
    id: 'streptomycin',
    name: 'Streptomycin',
    code: 'S',
    hepatotoxicity: 'minimal',
    withdrawInDili: false,
    provenance: p('Non-hepatotoxic agents'),
  },
  {
    id: 'linezolid',
    name: 'Linezolid',
    code: 'Lzd',
    hepatotoxicity: 'low',
    withdrawInDili: false,
    hepaticNote:
      'Rarely hepatotoxic, but can cause lactic acidosis. Its dose-limiting toxicities are myelosuppression and peripheral/optic neuropathy.',
    provenance: p('Group A agents', 'who-drtb-2022'),
  },
  {
    id: 'bedaquiline',
    name: 'Bedaquiline',
    code: 'Bdq',
    hepatotoxicity: 'moderate',
    withdrawInDili: true,
    hepaticNote:
      'Transaminase elevation is a recognised effect and bedaquiline is metabolised by CYP3A4. Also prolongs QT. In DR-TB DILI it must be considered as a candidate culprit alongside the first-line drugs.',
    provenance: p('Bedaquiline safety', 'who-drtb-2022'),
  },
  {
    id: 'ethionamide',
    name: 'Ethionamide',
    code: 'Eto',
    hepatotoxicity: 'moderate',
    withdrawInDili: true,
    provenance: p('Group C agents', 'who-drtb-2022'),
  },
  {
    id: 'pretomanid',
    name: 'Pretomanid',
    code: 'Pa',
    hepatotoxicity: 'moderate',
    withdrawInDili: true,
    hepaticNote: 'Hepatotoxicity is a known class effect within BPaL/BPaLM and has protocol-defined stopping rules.',
    provenance: p('BPaLM/BPaL regimen', 'who-drtb-2022'),
  },
  {
    id: 'clofazimine',
    name: 'Clofazimine',
    code: 'Cfz',
    hepatotoxicity: 'low',
    withdrawInDili: false,
    hepaticNote: 'Prolongs QT.',
    provenance: p('Group B agents', 'who-drtb-2022'),
  },
  {
    id: 'cycloserine',
    name: 'Cycloserine',
    code: 'Cs',
    hepatotoxicity: 'minimal',
    withdrawInDili: false,
    hepaticNote: 'Non-hepatotoxic; dose-limiting toxicity is neuropsychiatric.',
    provenance: p('Group B agents', 'who-drtb-2022'),
  },
]

export const DRUG_BY_ID: Record<string, Drug> = Object.fromEntries(
  DRUGS.map((d) => [d.id, d]),
)

export function drug(id: string): Drug | undefined {
  return DRUG_BY_ID[id]
}

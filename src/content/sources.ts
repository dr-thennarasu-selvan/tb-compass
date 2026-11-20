import type { Source } from '@/types/content'

/**
 * Source registry.
 *
 * Add a source here before citing it. Titles and years are deliberately written
 * out in full so a reviewer can find the exact document without guessing.
 */
export const SOURCES: Record<string, Source> = {
  'who-m4-2025': {
    id: 'who-m4-2025',
    pack: 'who',
    short: 'WHO M4 2025',
    title: 'WHO consolidated guidelines on tuberculosis. Module 4: treatment and care',
    publisher: 'World Health Organization',
    year: 2025,
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK613092/',
  },
  'who-dstb-2022': {
    id: 'who-dstb-2022',
    pack: 'who',
    supersededBy: 'who-m4-2025',
    short: 'WHO DS-TB 2022',
    title:
      'WHO consolidated guidelines on tuberculosis. Module 4: Treatment — drug-susceptible tuberculosis treatment',
    publisher: 'World Health Organization',
    year: 2022,
    url: 'https://www.who.int/publications/i/item/9789240048126',
  },
  'who-drtb-2022': {
    id: 'who-drtb-2022',
    pack: 'who',
    supersededBy: 'who-m4-2025',
    short: 'WHO DR-TB 2022',
    title:
      'WHO consolidated guidelines on tuberculosis. Module 4: Treatment — drug-resistant tuberculosis treatment, 2022 update',
    publisher: 'World Health Organization',
    year: 2022,
    url: 'https://www.who.int/publications/i/item/9789240063129',
  },
  'who-handbook-m4-2022': {
    id: 'who-handbook-m4-2022',
    pack: 'who',
    supersededBy: 'who-handbook-m4-2025',
    short: 'WHO Handbook M4',
    title:
      'WHO operational handbook on tuberculosis. Module 4: Treatment — drug-susceptible tuberculosis treatment',
    publisher: 'World Health Organization',
    year: 2022,
    url: 'https://www.who.int/publications/i/item/9789240050761',
  },
  'who-handbook-m4-2025': {
    id: 'who-handbook-m4-2025',
    pack: 'who',
    short: 'WHO Handbook M4 2025',
    title:
      'WHO consolidated operational handbook on tuberculosis. Module 4: treatment and care (docs/WHO-Handbook-Module4-2025.pdf). Page numbers are printed page numbers (PDF page minus 16).',
    publisher: 'World Health Organization',
    year: 2025,
    url: 'https://www.who.int/publications/i/item/9789240108141',
  },
  'ats-dstb-2016': {
    id: 'ats-dstb-2016',
    pack: 'shared',
    short: 'ATS/CDC/IDSA 2016',
    title:
      'Official ATS/CDC/IDSA Clinical Practice Guidelines: Treatment of Drug-Susceptible Tuberculosis (Nahid P et al., Clin Infect Dis 2016;63:e147–e195). Saved as the PMC6590850 full-text page (docs/ATS-CDC-IDSA-DSTB-2016-PMC6590850.html), which carries no page numbers — locators name the table or section.',
    publisher: 'American Thoracic Society / CDC / Infectious Diseases Society of America',
    year: 2016,
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6590850/',
  },
  'gold-2026': {
    id: 'gold-2026',
    pack: 'shared',
    short: 'GOLD 2026',
    title:
      'Global Strategy for the Diagnosis, Management, and Prevention of COPD, 2026 Report (docs/GOLD-2026-Report.pdf). Printed page = PDF page minus 11. An international strategy document, not national programme guidance.',
    publisher: 'Global Initiative for Chronic Obstructive Lung Disease',
    year: 2026,
    url: 'https://goldcopd.org/2026-gold-report-and-pocket-guide/',
  },
  'gina-2026': {
    id: 'gina-2026',
    pack: 'shared',
    short: 'GINA 2026',
    title:
      'Global Strategy for Asthma Management and Prevention, 2026 Strategy Report (docs/GINA-2026-Strategy-Report.pdf). Printed page = PDF page minus 1. An international strategy document, not national programme guidance.',
    publisher: 'Global Initiative for Asthma',
    year: 2026,
    url: 'https://ginasthma.org/reports/',
  },
  'ptld-standards-2021': {
    id: 'ptld-standards-2021',
    pack: 'shared',
    short: 'PTLD Standards 2021',
    title:
      'Migliori GB et al. Clinical standards for the assessment, management and rehabilitation of post-TB lung disease. Int J Tuberc Lung Dis 2021;25(10):797–813 (docs/PTLD-Clinical-Standards-2021-PMC8504493.html; no page numbers — locators name the standard or table).',
    publisher: 'The Union (IJTLD)',
    year: 2021,
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8504493/',
  },
  'ptld-editorial-2024': {
    id: 'ptld-editorial-2024',
    pack: 'shared',
    short: 'IJTLD Open 2024',
    title:
      'Silva DR, Inwentarz S. Guidelines for the diagnosis and management of post-TB lung disease: a call to action. IJTLD Open 2024;1(3):101–102 (editorial; docs/PTLD-Call-to-Action-2024-PMC11221581.html).',
    publisher: 'The Union (IJTLD Open)',
    year: 2024,
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11221581/',
  },
  'ntep-dtc-2025': {
    id: 'ntep-dtc-2025',
    pack: 'ntep',
    short: 'NTEP Differentiated TB Care 2025',
    title:
      'National Guidance on Differentiated TB Care, March 2025 (docs/NTEP-Differentiated-TB-Care-2025.pdf). Printed page numbers.',
    publisher: 'Central TB Division, Ministry of Health and Family Welfare, Government of India',
    year: 2025,
  },
  'who-tb-2010': {
    id: 'who-tb-2010',
    pack: 'who',
    short: 'WHO TB 2010 (4th ed)',
    title: 'Treatment of tuberculosis: guidelines, 4th edition',
    publisher: 'World Health Organization',
    year: 2010,
    url: 'https://www.who.int/publications/i/item/9789241547833',
  },
  'ats-hepatotox-2006': {
    id: 'ats-hepatotox-2006',
    pack: 'shared',
    short: 'ATS Hepatotoxicity 2006',
    title:
      'An Official ATS Statement: Hepatotoxicity of Antituberculosis Therapy (Saukkonen JJ et al., Am J Respir Crit Care Med 2006;174:935-952)',
    publisher: 'American Thoracic Society',
    year: 2006,
    url: 'https://www.atsjournals.org/doi/10.1164/rccm.200510-1666ST',
  },
  'cioms-dili': {
    id: 'cioms-dili',
    pack: 'shared',
    short: 'CIOMS / DILIN',
    title:
      'CIOMS criteria for drug-induced liver injury pattern (R ratio), as adopted by the US Drug-Induced Liver Injury Network',
    publisher: 'Council for International Organizations of Medical Sciences',
    year: 1990,
  },
  'fda-dili-2009': {
    id: 'fda-dili-2009',
    pack: 'shared',
    short: 'FDA DILI 2009',
    title:
      'Guidance for Industry — Drug-Induced Liver Injury: Premarketing Clinical Evaluation (source of the operational definition of Hy’s Law)',
    publisher: 'US Food and Drug Administration',
    year: 2009,
    url: 'https://www.fda.gov/media/116737/download',
  },
  'author-notes': {
    id: 'author-notes',
    pack: 'shared',
    short: 'Author notes',
    title:
      'Clinician-authored teaching notes supplied by the app author (IRIS, SAQ format). Not a published guideline: this is expert-authored material. Where these notes cite a trial or consensus definition, that upstream reference is named in the locator, but only the notes themselves have been read.',
    publisher: 'App author',
    year: 2026,
  },
  'author-notes-drtb': {
    id: 'author-notes-drtb',
    pack: 'shared',
    short: 'Author notes (DR-TB)',
    title:
      'Clinician-authored teaching notes supplied by the app author: LAQ #2, Drug-Resistant Tuberculosis / PMDT. Expert-authored, not published consensus. Upstream references named in locators are NOT independently read.',
    publisher: 'App author',
    year: 2026,
  },
  'author-notes-renal': {
    id: 'author-notes-renal',
    pack: 'shared',
    short: 'Author notes (renal/hepatic)',
    title:
      'Clinician-authored teaching notes supplied by the app author: management of TB in hepatic disease and chronic renal failure, and DR-TB in pre-existing renal disease. Expert-authored, not published consensus.',
    publisher: 'App author',
    year: 2026,
  },
  'author-notes-hypersensitivity': {
    id: 'author-notes-hypersensitivity',
    pack: 'shared',
    short: 'Author notes (hypersensitivity)',
    title:
      'Clinician-authored teaching notes supplied by the app author: anti-TB drug hypersensitivity, desensitisation and reintroduction; and ATT-induced DRESS versus SJS/TEN. Expert-authored, not published consensus. The author states explicitly that no randomised trial of ATT desensitisation exists and that step doses are representative, not statutory.',
    publisher: 'App author',
    year: 2026,
  },
  'inshi-2008': {
    id: 'inshi-2008',
    pack: 'shared',
    short: 'INSHI 2008',
    title:
      'International Network for the Study of HIV-associated IRIS (INSHI) consensus case definition for paradoxical TB-IRIS in resource-limited settings',
    publisher: 'INSHI',
    year: 2008,
  },
  'predart-2018': {
    id: 'predart-2018',
    pack: 'shared',
    short: 'PredART 2018',
    title:
      'Prednisone for the prevention of paradoxical tuberculosis-associated IRIS (PredART). N Engl J Med 2018; RCT, n=240, CD4 <=100',
    publisher: 'New England Journal of Medicine',
    year: 2018,
  },
  'meintjes-2010': {
    id: 'meintjes-2010',
    pack: 'shared',
    short: 'Meintjes 2010',
    title:
      'Randomized placebo-controlled trial of prednisone for paradoxical TB-associated IRIS. AIDS 2010; n=110',
    publisher: 'AIDS',
    year: 2010,
  },
  'ntep-drtb-2024': {
    id: 'ntep-drtb-2024',
    pack: 'ntep',
    short: 'NTEP DR-TB 2024',
    title: 'National Guidelines for Management of Drug Resistant TB, November 2024',
    publisher:
      'Central TB Division, Ministry of Health and Family Welfare, Government of India',
    year: 2024,
  },
  'ntep-stw-dstb-2022': {
    id: 'ntep-stw-dstb-2022',
    pack: 'ntep',
    short: 'NTEP STW DS-TB 2022',
    title:
      'Standard Treatment Workflow (STW) Guidelines for Drug Sensitive-TB Treatment as per NTEP, March 2022',
    publisher:
      'Department of Health Research, Ministry of Health and Family Welfare, Government of India',
    year: 2022,
  },
  'icmr-stw': {
    id: 'icmr-stw',
    pack: 'ntep',
    short: 'ICMR STW',
    title:
      'Standard Treatment Workflows (STW) for the Management of Tuberculosis — 19 condition-specific workflows including ATT-related hepatitis, adult and paediatric extrapulmonary TB, and DS-TB treatment',
    publisher:
      'Indian Council of Medical Research and Department of Health Research, Ministry of Health & Family Welfare, Government of India',
    year: 2022,
    url: 'https://stw.icmr.org.in',
  },
  'index-tb-2016': {
    id: 'index-tb-2016',
    pack: 'ntep',
    short: 'INDEX-TB 2016',
    title:
      'INDEX-TB Guidelines: Guidelines on extra-pulmonary tuberculosis for India',
    publisher:
      'Central TB Division, MoHFW Government of India, with WHO Country Office for India and AIIMS New Delhi',
    year: 2016,
  },
}

export function sourceOf(id: string): Source {
  const s = SOURCES[id]
  if (!s) throw new Error(`Unknown source id: ${id}. Register it in content/sources.ts.`)
  return s
}

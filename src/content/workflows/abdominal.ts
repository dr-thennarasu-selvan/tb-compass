import type { ConditionWorkflow } from '@/types/workflow'

/** Adult abdominal tuberculosis — ICMR STW, ICD-10 A18.3. Source p. 6. */
export const ABDOMINAL_TB: ConditionWorkflow = {
  id: 'abdominal',
  site: 'abdominal',
  title: 'Adult abdominal tuberculosis',
  icd10: 'A18.3',
  whenToSuspect: {
    history: [
      'Any organ in the abdominal cavity may be affected, including gut lumen and peritoneum.',
      'Peritoneal: abdominal distension, pain, fever',
      'Intestinal: recurrent colic, partial or incomplete obstruction, chronic diarrhoea, weight loss, palpable mass, lower GI bleeding',
      'Oesophageal: dysphagia, odynophagia, haematemesis, constitutional symptoms',
      'Gastro-duodenal: gastric outlet obstruction, GI bleed',
      'Perianal: simple or complex peri-anal fistula, persistent discharge, fistulae recurring after multiple surgeries',
      'Pancreatic: abdominal pain, obstructive jaundice, dilated pancreatic or bile duct with peri-pancreatic mass or cyst, constitutional symptoms',
      'Hepatobiliary: fever of unknown origin, hepatomegaly, jaundice, elevated ALP, space-occupying lesion, hepatic abscess',
    ],
    examination: ['Abdominal distension, palpable mass, ascites', 'Perianal fistula or discharge'],
  },
  investigations: {
    essential: [
      'HIV and blood sugar in ALL suspected patients, per NTEP',
      'Peritoneal: ascitic tap — cytology (lymphocyte predominance, absence of malignant cells), SAAG below 1.1 g/dL, culture, NAAT, ascitic ADA above 39 U/L',
      'Peritoneal: ultrasound for ascites, lymph nodes, bowel thickening, and for tissue acquisition',
      'Gastrointestinal: CT or MR enterography preferred — bowel thickening, strictures, necrotic nodes',
      'Gastrointestinal: endoscopic biopsies — UGIE for oesophageal/gastroduodenal, ileo-colonoscopy for intestinal TB is MANDATORY to acquire tissue',
      'Microbiology on tissue: culture and NAAT',
    ],
    desirable: [
      'CT chest may also be done',
      'Barium studies if endoscopy or CT unavailable',
      'Perianal: MRI pelvis, endoanal ultrasound or EUS, tissue for histology and microbiology',
      'Pancreatic/hepatobiliary: imaging or endoscopic-ultrasound guided tissue acquisition',
    ],
  },
  diagnostic: {
    entry: 'suspect',
    nodes: [
      {
        id: 'suspect',
        text: 'Suspected abdominal TB — which compartment?',
        branches: [
          { label: 'Peritoneal', to: 'peritoneal' },
          { label: 'Gastrointestinal', to: 'gi' },
          { label: 'Perianal', to: 'perianal' },
          { label: 'Pancreatic or hepatobiliary', to: 'pancreatic' },
        ],
      },
      {
        id: 'peritoneal',
        text: 'Ascitic tap and ultrasound',
        branches: [
          { label: 'Supports TB — lymphocytic, SAAG <1.1, ADA >39 U/L', to: 'definitive' },
          { label: 'Diagnosis unclear', to: 'laparoscopy' },
        ],
      },
      {
        id: 'laparoscopy',
        text: 'Peritoneal diagnosis unclear',
        action: 'Refer for laparoscopy.',
        severity: 'caution',
      },
      {
        id: 'gi',
        text: 'Imaging and endoscopic biopsy — histology, culture, NAAT',
        branches: [
          { label: 'Caseating granuloma, or microbiology positive', to: 'definitive' },
          { label: 'Diagnosis unclear', to: 'gi-unclear' },
        ],
      },
      {
        id: 'gi-unclear',
        text: 'GI diagnosis unclear — differentiating Crohn’s disease is challenging',
        action:
          'Refer for further evaluation. A trial of antitubercular therapy with careful follow-up may be appropriate.',
        severity: 'warning',
      },
      {
        id: 'perianal',
        text: 'Perianal TB — uncommon',
        action:
          'MRI pelvis, endoanal ultrasound or EUS. Acquire tissue for histology and microbiology.',
        severity: 'info',
      },
      {
        id: 'pancreatic',
        text: 'Pancreatic or hepatobiliary',
        action:
          'MALIGNANCY is the more important concern here. Needs imaging or endoscopic-ultrasound guided tissue acquisition. Refer to a higher centre.',
        severity: 'critical',
      },
      {
        id: 'definitive',
        text: 'Definitive abdominal TB — microbiologically positive or caseating granulomas',
        action: 'Start ATT: 2HRZE / 4HRE.',
        severity: 'ok',
      },
    ],
  },
  management: {
    treatment: [
      'First-line treatment for adults and children with abdominal TB: 2HRZE / 4HRE.',
      'Six months of standard first-line ATT is recommended for abdominal TB (INDEX-TB 2016, strong recommendation, very low quality evidence).',
      'Start treatment and follow up as per NTEP guidelines.',
      'Extend duration in cases of inadequate response.',
      'Clinical assessment at 4 and 8 weeks: no fever or pain, disappearance of abdominal distension, weight gain.',
      'Assess ATT-induced hepatotoxicity with serial LFTs.',
    ],
    whenToRefer: [
      'Surgical management for complications: intestinal obstruction due to strictures, perforation.',
      'Consider endoscopic dilatation for accessible strictures.',
      'Biliary drainage for jaundice due to biliary obstruction (hepatobiliary or pancreatic TB).',
      'No improvement at 8 weeks — refer to exclude MDR.',
      'No improvement on reassessment — refer to exclude an alternative diagnosis.',
    ],
    followUp: [
      'Clinically diagnosed cases: peritoneal TB — ultrasound for ascites at 4–8 weeks; intestinal TB — ileo-colonoscopy at 8–12 weeks.',
      'End of therapy: document mucosal healing in colonic and upper GI TB.',
      'Imaging in small bowel disease to document healing.',
      'Clinically diagnosed abdominal TB means a consistent clinical and radiological picture, elevated ascitic ADA, granuloma on histology, and exclusion of differentials.',
    ],
  },
  provenance: {
    citations: [{ source: 'icmr-stw', locator: 'Adult abdominal tuberculosis workflow, ICD-10 A18.3, p. 6' }],
    status: 'source-checked',
  },
}

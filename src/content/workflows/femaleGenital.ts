import type { ConditionWorkflow } from '@/types/workflow'

/** Female genital tuberculosis — ICMR STW, ICD-10 A18.17. Source p. 11. */
export const FEMALE_GENITAL_TB: ConditionWorkflow = {
  id: 'female-genital',
  site: 'genitourinary',
  title: 'Female genital tuberculosis',
  icd10: 'A18.17',
  whenToSuspect: {
    history: [
      'History of infertility, primary or secondary',
      'Chronic lower abdominal or pelvic pain',
      'Amenorrhoea or other menstrual disturbance',
      'Abnormal vaginal discharge',
      'Constitutional symptoms of TB — low grade fever, weight loss',
      'Symptoms of extra-genital TB — abdominal, CNS, bone, lymph nodes',
    ],
    examination: [
      'General physical examination',
      'Pelvic examination — cervical growth, uterine size and mobility, adnexal tenderness and mass',
    ],
  },
  investigations: {
    essential: [
      'Abdominal and pelvic ultrasound, preferably transvaginal — uterus, adnexa, pelvis',
      'Endometrial cavity and vascularity examined carefully with colour Doppler',
      'Endometrial sampling or biopsy with a Pipelle device or Karman cannula (4 mm), for microbiology and histopathology',
      'MTB diagnosis from biopsy specimen: AFB smear microscopy and culture, GeneXpert or other NAAT, histopathology',
      'Standard investigations for TB in addition',
    ],
    desirable: [
      'Hysteroscopy — tubercles, pale endometrium, endometrial adhesions',
      'Laparoscopy — tubercle-like lesions on uterus, tubes and other pelvic organs including peritoneum, caseous nodules',
      'Laparoscopic biopsy from peritoneum or abdominal/pelvic lesions',
      'HSG as indicated in infertility — AVOID in the acute phase',
      'CT/MRI for tubo-ovarian mass',
    ],
  },
  diagnostic: {
    entry: 'stepwise',
    nodes: [
      {
        id: 'stepwise',
        text: 'Stepwise: clinical history → general and pelvic examination → pelvic ultrasound → HSG as indicated in infertility',
        branches: [
          { label: 'A confirmatory test is positive', to: 'definite' },
          { label: 'Imaging or endoscopy suggestive, no positive test', to: 'probable' },
          { label: 'No evidence on any modality', to: 'negative' },
        ],
      },
      {
        id: 'definite',
        text: 'Definite FGTB — AFB microscopy positive, AFB culture positive, GeneXpert or other NAAT positive, or histopathological demonstration of epithelioid granuloma',
        action: 'Needs ATT. Treat as per NTEP.',
        severity: 'ok',
      },
      {
        id: 'probable',
        text: 'Probable FGTB — clinical findings with suggestive imaging or endoscopy',
        action:
          'Needs ATT. Supporting findings: tubo-ovarian masses on imaging; laparoscopic beaded tubes, caseous nodules, tubercles, adhesions, hydrosalpinx or pyosalpinx; hysteroscopic tubercles, caseous nodules, pale endometrium or intrauterine adhesions.',
        severity: 'warning',
      },
      {
        id: 'negative',
        text: 'Negative FGTB — no microbiological, histological, radiological, laparoscopic or hysteroscopic evidence',
        action: 'NO ATT.',
        severity: 'info',
      },
    ],
  },
  management: {
    treatment: [
      'Treatment of FGTB as per NTEP.',
      'MENSTRUAL BLOOD SHOULD NOT BE USED FOR NAAT.',
    ],
    whenToRefer: [
      'Patients requiring specific treatment such as infertility management, Asherman syndrome, or tubo-ovarian mass — refer to a higher centre.',
    ],
    followUp: [
      'Follow-up should be flexible, depending on clinical presentation and response to ATT.',
      '1 month: clinical evaluation, general and gynaecological.',
      '3 months: clinical evaluation, general and gynaecological.',
      '6 months: clinical evaluation and investigations — endometrial biopsy, hystero-laparoscopy and ultrasound as needed.',
    ],
  },
  tables: [
    {
      title: 'Suggestive findings in FGTB',
      columns: ['Modality', 'Findings'],
      rows: [
        [
          'HSG (avoid in acute phase)',
          'Blocked fallopian tubes, usually cornual; tobacco pouch appearance of the tubes; beaded tubes; filling defect in the uterine cavity (Asherman syndrome)',
        ],
        ['Ultrasound', 'Cogwheel appearance of tubes; uterine cavity may show thin diffuse endometrium with irregular borders'],
        ['CT/MRI', 'Can be used for tubo-ovarian mass'],
        ['Hysteroscopy', 'Tubercles, pale endometrium, endometrial adhesions'],
        ['Laparoscopy', 'Direct visualisation of tubercle-like lesions on uterus, tubes and other pelvic organs including peritoneum; caseous nodules'],
      ],
      provenance: {
        citations: [{ source: 'icmr-stw', locator: 'Female genital TB workflow, Suggestive findings, p. 11' }],
        status: 'source-checked',
      },
    },
  ],
  provenance: {
    citations: [{ source: 'icmr-stw', locator: 'Female genital tuberculosis workflow, ICD-10 A18.17, p. 11' }],
    status: 'source-checked',
  },
}

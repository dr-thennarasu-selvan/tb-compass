import type { ConditionWorkflow } from '@/types/workflow'

/** Pericardial tuberculosis — ICMR STW, ICD-10 A18.84. Source p. 4. */
export const PERICARDIAL_TB: ConditionWorkflow = {
  id: 'pericardial',
  site: 'pericardial',
  title: 'Pericardial tuberculosis',
  icd10: 'A18.84',
  whenToSuspect: {
    history: [
      'Cough, fever, breathlessness or pleuritic chest pain',
      'May be associated with weight loss, night sweats, or difficulty lying down',
      'Past history of TB, or contact with a patient diagnosed with TB',
    ],
    examination: [
      'Tachycardia',
      'Increased jugular venous pressure',
      'Hepatomegaly, ascites, peripheral oedema',
      'Pericardial friction rub and distant heart sounds',
      'If the clinical picture with or without cardiac ultrasound suggests pericarditis or effusion — refer for echocardiogram',
    ],
  },
  investigations: {
    essential: ['Chest X-ray', 'ECG', 'Echocardiogram'],
    desirable: ['Cardiac enzymes', 'CT/MRI thorax', 'Pericardiocentesis', 'Pericardial biopsy'],
  },
  diagnostic: {
    entry: 'cxr-ecg',
    nodes: [
      {
        id: 'cxr-ecg',
        text: 'Suspicion of pericardial TB — CXR and ECG',
        branches: [
          { label: 'Cardiomegaly or pericardial calcification', to: 'echo' },
          { label: 'CXR normal, ECG shows ST elevation', to: 'echo' },
          { label: 'CXR and ECG both normal', to: 'alternate' },
        ],
      },
      {
        id: 'alternate',
        text: 'CXR and ECG normal',
        action: 'Look for an alternate diagnosis.',
        severity: 'info',
      },
      {
        id: 'echo',
        text: 'Echocardiogram ± CT thorax',
        branches: [
          { label: 'Pericardial effusion', to: 'tap' },
          { label: 'Constrictive physiology with pericardial thickness above 4 mm', to: 'constrictive' },
        ],
      },
      {
        id: 'tap',
        text: 'Pericardiocentesis — send TC, DC, LDH, sugar, protein, ADA, Xpert MTB/RIF, AFB culture and sensitivity',
        branches: [
          { label: 'Exudate with Xpert positive, OR exudate with ADA at or above 40 U/L', to: 'likely-tb' },
          { label: 'Exudate with pleocytosis but Xpert negative, OR ADA below 40 U/L', to: 'hiv-fork' },
        ],
      },
      {
        id: 'likely-tb',
        text: 'Likely pericardial TB',
        action: 'Start ATT.',
        severity: 'ok',
      },
      {
        id: 'hiv-fork',
        text: 'Not supported by fluid analysis — check HIV status',
        branches: [
          { label: 'HIV positive', to: 'lymphoma' },
          { label: 'HIV negative', to: 'viral' },
        ],
      },
      {
        id: 'lymphoma',
        text: 'HIV positive',
        action: 'Look for features of lymphoma.',
        severity: 'warning',
      },
      {
        id: 'viral',
        text: 'Rule out viral pericarditis',
        branches: [
          { label: 'Viral features present', to: 'symptomatic' },
          { label: 'Viral causes excluded', to: 'trial' },
        ],
      },
      { id: 'symptomatic', text: 'Viral pericarditis likely', action: 'Symptomatic treatment.', severity: 'info' },
      {
        id: 'trial',
        text: 'No alternative found',
        action: 'Therapeutic trial of ATT.',
        severity: 'caution',
      },
      {
        id: 'constrictive',
        text: 'Constrictive physiology with pericardial thickness above 4 mm',
        action: 'Start ATT plus steroids. Reassess response at 11 weeks.',
        severity: 'warning',
        branches: [
          { label: 'Response at 11 weeks — YES', to: 'stop-steroids' },
          { label: 'Response at 11 weeks — NO', to: 'pericardiectomy' },
        ],
      },
      {
        id: 'stop-steroids',
        text: 'Responded by 11 weeks',
        action: 'Stop steroids but continue ATT.',
        severity: 'ok',
      },
      {
        id: 'pericardiectomy',
        text: 'No response at 11 weeks',
        action:
          'Refer for pericardiectomy. Send pericardial tissue for Xpert MTB/RIF, AFB culture and sensitivity, and histopathology. Granulomas with or without caseation, Xpert positive or negative, then continue ATT and check response.',
        severity: 'critical',
      },
    ],
  },
  management: {
    treatment: [
      'Antitubercular therapy as per NTEP.',
      'Steroids are recommended in large pericardial effusions, prominent pleocytosis, pericardial fluid with high inflammatory markers, or early constriction.',
      'Prednisolone 60 mg/day for 4 weeks, then 30 mg/day for 4 weeks, then 15 mg/day for 2 weeks, then 5 mg/day for 1 week.',
      'Total duration of systemic steroids is 11 weeks, depending on the regimen used.',
      'INDEX-TB 2016 also recommends steroids for TB pericarditis with pericardial effusion in BOTH HIV-negative and HIV-positive patients (conditional recommendation, low quality evidence).',
    ],
    whenToRefer: [
      'Non-response of cardiac symptoms to ATT — cardiac surgical evaluation may be required.',
      'Non-response to steroids and ATT — refer to a specialist centre for confirmation of the diagnosis.',
      'Evaluate for effusio-constrictive pericarditis.',
    ],
    followUp: [
      'Reassess response at 11 weeks to decide whether steroids stop or pericardiectomy is needed.',
      'Common alternate diagnoses if not responding: viral infection, systemic lupus erythematosus, primary effusion lymphoma, pericardial malignancy.',
    ],
  },
  complications: {
    items: [
      {
        name: 'Constrictive pericarditis',
        presentation:
          'Kussmaul’s sign (no inspiratory decline in JVP), elevated distended jugular veins with a prominent Y descent, pericardial knock (rare)',
      },
      {
        name: 'Cardiac tamponade',
        presentation:
          'Sinus tachycardia, hypotension with narrow pulse pressure, elevated JVP, muffled heart sounds, pulsus paradoxus (systolic BP falls more than 10 mmHg on inspiration), ascites',
      },
      {
        name: 'Myopericarditis',
        presentation: 'Abnormal ejection fraction with elevated cardiac enzymes and ST elevation on ECG',
      },
      {
        name: 'Effusive constrictive pericarditis',
        presentation:
          'Mixed picture — elevated JVP clinically and raised right atrial pressure on echo despite removal of pericardial fluid',
      },
    ],
    provenance: {
      citations: [{ source: 'icmr-stw', locator: 'Pericardial TB workflow, Complications, p. 4' }],
      status: 'source-checked',
    },
  },
  provenance: {
    citations: [
      { source: 'icmr-stw', locator: 'Pericardial tuberculosis workflow, ICD-10 A18.84, p. 4' },
      { source: 'index-tb-2016', locator: 'Recommendations: adjunctive steroids in EPTB — TB pericarditis' },
    ],
    status: 'source-checked',
  },
}

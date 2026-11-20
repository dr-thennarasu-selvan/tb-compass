import type { Provenance, Severity } from '@/types/content'
import type { DerivedClassification, DiagnosticState } from '@/types/diagnosis'
import type { TbClassification } from '@/types/patient'

/**
 * Derives the classification from what the laboratory has actually said, and —
 * just as importantly — states what is still pending and what each pending
 * result would change.
 *
 * Nothing here guesses. If a test has not resulted, its branch stays open and
 * is reported as open.
 */

const ntep = (locator: string): Provenance => ({
  citations: [{ source: 'ntep-drtb-2024', locator }],
  status: 'source-checked',
})

const authorDrtb = (locator: string): Provenance => ({
  citations: [{ source: 'author-notes-drtb', locator }],
  status: 'source-checked',
})

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

export function deriveClassification(d: DiagnosticState): DerivedClassification {
  const pending: string[] = []
  if (d.naat.state === 'pending') pending.push('NAAT / CBNAAT')
  if (d.flLpa.state === 'pending') pending.push('First-line LPA')
  if (d.slLpa.state === 'pending') pending.push('Second-line LPA')
  if (d.dst.state === 'pending') pending.push('Liquid culture DST')

  const provisional = pending.length > 0

  // --- clinically / radiologically diagnosed track ------------------------
  if (d.track === 'clinically-radiologically-diagnosed') {
    return {
      classification: 'unknown',
      provisional: false,
      basis:
        'Clinically and radiologically diagnosed. No organism, therefore no drug susceptibility information — resistance cannot be detected in this patient by any test currently available.',
      pending,
    }
  }

  if (d.naat.state !== 'resulted' || !d.naat.mtbDetected) {
    return {
      classification: 'unknown',
      provisional,
      basis:
        d.naat.state === 'pending'
          ? 'NAAT pending. No classification can be made yet.'
          : 'No microbiological confirmation recorded.',
      pending,
    }
  }

  const rifR = d.naat.rifResistance === 'detected' || d.flLpa.rifResistance === 'detected'
  const hR = d.flLpa.isoniazidResistance === 'detected'
  const fqR = d.slLpa.fqResistance === 'detected'
  const groupAResistant = d.dst.bedaquiline === 'resistant' || d.dst.linezolid === 'resistant'

  // --- XDR: MDR/RR + FQ resistance + at least one Group A -----------------
  // WHO 2021 definition. Group A resistance WITHOUT fluoroquinolone
  // resistance is not XDR — it is MDR/RR with additional resistance, which
  // still forces a salvage regimen but is a different label.
  if (rifR && fqR && groupAResistant) {
    return {
      classification: 'xdr-tb',
      provisional,
      basis:
        'Rifampicin resistance, fluoroquinolone resistance, and resistance to at least one Group A drug (bedaquiline or linezolid).',
      pending,
    }
  }

  if (rifR && fqR) {
    return {
      classification: 'pre-xdr-tb',
      provisional,
      basis: 'Rifampicin resistance with fluoroquinolone resistance.',
      pending,
    }
  }

  if (rifR) {
    return {
      classification: hR ? 'mdr-tb' : 'rr-tb',
      provisional,
      basis: hR
        ? 'Rifampicin and isoniazid resistance both detected.'
        : 'Rifampicin resistance detected. Isoniazid status not yet established, so this is RR-TB rather than confirmed MDR-TB.',
      pending,
    }
  }

  if (hR) {
    return {
      classification: 'hr-tb',
      provisional,
      basis: 'Isoniazid resistance with rifampicin susceptibility (Hr-TB).',
      pending,
    }
  }

  return {
    classification: 'ds-tb',
    provisional,
    basis: 'M. tuberculosis detected, rifampicin susceptible.',
    pending,
  }
}

// ---------------------------------------------------------------------------
// What each pending result would change
// ---------------------------------------------------------------------------

export interface PendingImplication {
  test: string
  /** One line per possible outcome and its consequence. */
  outcomes: { result: string; consequence: string; severity: Severity }[]
  provenance: Provenance
}

export function pendingImplications(d: DiagnosticState): PendingImplication[] {
  const out: PendingImplication[] = []
  const rifR = d.naat.rifResistance === 'detected' || d.flLpa.rifResistance === 'detected'
  const fqR = d.slLpa.fqResistance === 'detected'

  if (d.naat.state === 'pending') {
    out.push({
      test: 'NAAT / CBNAAT',
      outcomes: [
        {
          result: 'MTB detected, rifampicin sensitive',
          consequence: 'Drug-susceptible TB. Start the standard first-line regimen.',
          severity: 'ok',
        },
        {
          result: 'MTB detected, rifampicin resistant',
          consequence:
            'RR-TB. Route to the DR-TB pathway and send first- and second-line LPA immediately.',
          severity: 'warning',
        },
        {
          result: 'MTB not detected',
          consequence:
            'Does not exclude TB. If clinical and radiological features still point to TB, move to the clinically diagnosed track — but that track can never yield a DST.',
          severity: 'caution',
        },
      ],
      provenance: ntep('Chapter 2, integrated diagnostic algorithm, footnote 3'),
    })
  }

  if (d.flLpa.state === 'pending') {
    out.push({
      test: 'First-line LPA',
      outcomes: [
        {
          result: 'Isoniazid resistance detected, rifampicin susceptible',
          consequence: 'Hr-TB. Regimen becomes (06) LfxREZ — note this contains pyrazinamide.',
          severity: 'warning',
        },
        {
          result: 'Both H and R resistance detected',
          consequence: 'MDR-TB confirmed. Second-line LPA becomes the priority.',
          severity: 'critical',
        },
        {
          result: 'No resistance detected',
          consequence: 'Supports drug-susceptible TB; continue the first-line regimen.',
          severity: 'ok',
        },
      ],
      provenance: ntep('Chapter 2, footnote 3(ii)'),
    })
  }

  if (d.slLpa.state === 'pending' && rifR) {
    out.push({
      test: 'Second-line LPA',
      outcomes: [
        {
          result: 'Fluoroquinolone resistance detected',
          consequence:
            'Pre-XDR. This rules OUT the 9-11 month shorter oral regimen, which requires FQ susceptibility. It does NOT rule out BPaLM: moxifloxacin is continued in BPaLM regardless of FQ resistance.',
          severity: 'critical',
        },
        {
          result: 'No fluoroquinolone resistance',
          consequence:
            'The 9-11 month shorter oral regimen remains available if the other eligibility criteria are met.',
          severity: 'ok',
        },
      ],
      provenance: ntep('Sections 3.3.5 and 3.4.1'),
    })
  }

  if (d.dst.state === 'pending' && rifR) {
    out.push({
      test: 'Liquid culture DST',
      outcomes: [
        {
          result: 'Bedaquiline or linezolid resistance detected',
          consequence: fqR
            ? 'XDR-TB. Salvage regimen designed on the full susceptibility pattern, at the N/DDR-TBC.'
            : 'Group A resistance without FQ resistance. Not XDR by definition, but BPaLM and the longer oral regimen both need redesigning — refer to N/DDR-TBC.',
          severity: 'critical',
        },
        {
          result: 'Group A drugs susceptible',
          consequence:
            'Current regimen stands. NTEP: start on NAAT/LPA and modify on LC-DST only when it changes something.',
          severity: 'ok',
        },
        {
          result: 'Pyrazinamide resistance detected during the intensive phase',
          consequence:
            'If on the 9-11 month shorter oral regimen, switch to the longer oral M/XDR-TB regimen.',
          severity: 'warning',
        },
      ],
      provenance: ntep('Sections 3.3.4 and 3.4.1(vi); Chapter 2 footnote 3(v)'),
    })
  }

  return out
}

// ---------------------------------------------------------------------------
// Safety flags raised by the cascade itself
// ---------------------------------------------------------------------------

export interface CascadeWarning {
  id: string
  title: string
  detail: string
  severity: Severity
  provenance: Provenance
}

export function cascadeWarnings(d: DiagnosticState): CascadeWarning[] {
  const out: CascadeWarning[] = []

  // The antibiotic trial is standard practice, and a fluoroquinolone is the
  // usual choice for a non-resolving chest infection. That choice has three
  // separate harms in a patient who turns out to have TB.
  if (d.antibioticTrialGiven && d.antibioticWasFluoroquinolone) {
    out.push({
      id: 'warn.fq-trial',
      title: 'A fluoroquinolone was given as the antibiotic trial',
      detail:
        'Three consequences in a patient who turns out to have TB: partial treatment masks the disease and delays diagnosis; smear and culture yield may fall; and fluoroquinolone resistance can be induced, which compromises the second-line LPA and removes levofloxacin and moxifloxacin from future regimens. Record the exposure and interpret a later FQ-resistance result in that light.',
      severity: 'warning',
      provenance: authorDrtb(
        'Section 1.3: fluoroquinolone resistance among MDR isolates in India is roughly 20-25%, "driven by unregulated over-the-counter FQ use for community respiratory infections"',
      ),
    })
  }

  if (d.antibioticTrialGiven && d.antibioticWasFluoroquinolone === undefined) {
    out.push({
      id: 'warn.fq-unknown',
      title: 'Was the antibiotic trial a fluoroquinolone?',
      detail:
        'Levofloxacin and moxifloxacin are commonly prescribed for a non-resolving chest infection and both have anti-tuberculous activity. Establish which antibiotic was given before interpreting the workup.',
      severity: 'caution',
      provenance: authorDrtb('Section 1.3, epidemiological framing'),
    })
  }

  if (d.track === 'clinically-radiologically-diagnosed') {
    out.push({
      id: 'warn.no-organism',
      title: 'No organism means no drug susceptibility testing, ever',
      detail:
        'Resistance cannot be detected in this patient. If there is no response to treatment, the instinct to assume resistance and escalate is the wrong first move — go back for microbiological confirmation on a better specimen (induced sputum, BAL, gastric lavage, FNAC, tissue) before changing the regimen. Also re-examine whether the diagnosis is TB at all.',
      severity: 'warning',
      provenance: ntep('Chapter 2, footnote 1 and footnote 3'),
    })
  }

  if (
    d.naat.state === 'resulted' &&
    d.naat.rifResistance === 'detected' &&
    d.slLpa.state === 'not-sent'
  ) {
    out.push({
      id: 'warn.sl-lpa',
      title: 'Rifampicin resistance detected — second-line LPA has not been sent',
      detail:
        'The fluoroquinolone result determines pre-XDR status and governs which shorter regimen is available. Send it now rather than at the next visit.',
      severity: 'critical',
      provenance: ntep('Chapter 2, footnote 3(ii)'),
    })
  }

  if (
    d.naat.state === 'resulted' &&
    d.naat.rifResistance === 'detected' &&
    d.dst.state === 'not-sent'
  ) {
    out.push({
      id: 'warn.dst',
      title: 'Baseline liquid culture DST has not been sent',
      detail:
        'NTEP: baseline LC-DST for MDR-TB patients covers bedaquiline, linezolid, pretomanid, delamanid, pyrazinamide and moxifloxacin where available. Without it, Group A resistance goes undetected until the patient fails.',
      severity: 'warning',
      provenance: ntep('Chapter 2, footnote 3(iii)'),
    })
  }

  // katG versus inhA changes what can be done with isoniazid and with
  // ethionamide. Xpert cannot make this distinction; only the LPA can.
  if (d.flLpa.state === 'resulted' && d.flLpa.isoniazidResistance === 'detected') {
    if (d.flLpa.inhA && !d.flLpa.katG) {
      out.push({
        id: 'warn.inha-only',
        title: 'inhA promoter mutation only — low-level isoniazid resistance',
        detail:
          'Low-level resistance (MIC 0.2-1 ug/mL) that may still respond to high-dose isoniazid at 10-15 mg/kg. But it also confers cross-resistance to ethionamide and prothionamide, so an ethionamide-containing regimen is compromised.',
        severity: 'caution',
        provenance: authorDrtb('Section 3, isoniazid resistance mechanisms; Section 5.5(D)'),
      })
    }
    if (d.flLpa.katG && !d.flLpa.inhA) {
      out.push({
        id: 'warn.katg',
        title: 'katG mutation — high-level isoniazid resistance',
        detail:
          'High-level resistance (MIC >1 ug/mL). High-dose isoniazid will not overcome this. Ethionamide is not cross-resistant on this mechanism.',
        severity: 'warning',
        provenance: authorDrtb('Section 3, isoniazid resistance mechanisms'),
      })
    }
    if (d.flLpa.katG && d.flLpa.inhA) {
      out.push({
        id: 'warn.katg-inha',
        title: 'Both katG and inhA mutations present',
        detail:
          'NTEP: the ethionamide-containing shorter oral regimen CANNOT be given when both mutations are present. The linezolid-containing version can.',
        severity: 'critical',
        provenance: ntep('Section 3.4.1, criterion viii, p. 32'),
      })
    }
  }

  // A rifampicin-resistant Xpert is not always true resistance.
  if (
    d.naat.state === 'resulted' &&
    d.naat.rifResistance === 'detected' &&
    d.flLpa.state !== 'resulted'
  ) {
    out.push({
      id: 'warn.silent-mutation',
      title: 'Confirm rifampicin resistance before committing to a DR-TB regimen',
      detail:
        'Silent mutations in the rpoB resistance-determining region (for example synonymous changes at codons 514 and 533) cause FALSE-POSITIVE rifampicin resistance on Xpert MTB/RIF. Xpert Ultra uses melting-temperature analysis and distinguishes these; the first-line LPA and phenotypic DST resolve it definitively.',
      severity: 'caution',
      provenance: authorDrtb('Sections 1.2 and 5.5(A)(B): silent mutation, false-positive RR'),
    })
  }

  return out
}

/** Classification labels for display. */
export const CLASSIFICATION_LABEL: Record<TbClassification, string> = {
  'ds-tb': 'Drug-susceptible TB',
  'hr-tb': 'Hr-TB (isoniazid-resistant)',
  'rr-tb': 'RR-TB (rifampicin-resistant)',
  'mdr-tb': 'MDR-TB',
  'pre-xdr-tb': 'Pre-XDR TB',
  'xdr-tb': 'XDR-TB',
  'poly-resistant': 'Poly-resistant TB',
  unknown: 'Not yet classified',
}

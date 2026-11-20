# TB Compass — state of play

Read this plus `README.md` and you have the whole picture. Everything is committed;
`git log --oneline` is a readable history of why each decision was made.

## What this is

Offline-first PWA giving TB physicians decision support at the pivotal points of care,
built on Indian NTEP/ICMR and WHO sources. Not a set of calculators — the modules share one
patient context, and that sharing is what lets a finding in one change the answer in
another.

## Run it

```bash
npm install          # note: see the npm cache caveat in README.md
npm run dev          # http://localhost:5273
npm run build        # production PWA
npm run typecheck
```

## Architecture in four sentences

1. **`Provenance` is a required field** on every clinical assertion. If you cannot cite it,
   it does not ship.
2. **Thresholds and statements are data; control flow is code.** A different national
   guideline should be a new content pack, not a fork.
3. **Classification is derived, not entered.** `engine/cascade.ts` computes it from what the
   laboratory has actually said, marks it provisional while results are pending, and states
   what each pending result would change.
4. **There is no network layer.** Patient context lives in `localStorage` only.

The interface rules that follow from this — module opens on the module, a blocked module
names its missing field, context entry is grouped and resumable — are written up under
**Interface rules** in `README.md`.

## What is built

| Area | State |
|---|---|
| Diagnostic cascade (the spine) | Built |
| Drug-susceptible TB — weight bands, dose check, duration | Built |
| Drug-resistant TB — BPaLM, 9–11m, 18–20m, Hr-TB with eligibility | Built |
| Hepatotoxicity — withdrawal, bridge, rechallenge with outcomes | Built |
| IRIS — INSHI criteria, exclusions, steroid ladder, ART timing | Built |
| QT — QTcF calculator, NTEP grading 0–4, monitoring rule | Built |
| Renal — CrCl, interval-extended dosing, transplant interactions | Built |
| Hypersensitivity — red flags, reintroduction, desensitisation, SCORTEN | Built |
| Extrapulmonary — 15 ICMR condition workflows + specimen handling | Built |
| Pregnancy and breastfeeding — DS-TB (WHO handbook/ATS) and DR-TB (NTEP gestation/MTP pathway) | Built |
| Drug interaction checker — co-medication search, sourced pairs, explicit "not covered" | Built |
| COPD, asthma and post-TB lung disease | Built (see gap below) |
| Diabetes — NTEP screening/triage thresholds, control, toxicity, duration | Built |
| Not improving on treatment — failure verdict and ordered differential | Built |

## The three connective mechanisms

These are the parts that a set of PDFs cannot do, and the reason for the shared context.

- **Deterioration forks** (`content/deteriorationForks.ts`) — inside a condition workflow.
  Turns "this could be a paradoxical reaction, resistance, or another diagnosis" into
  branches with a button into the module that resolves each.
- **Cross-links** (`content/crossLinks.ts`) — at the foot of a module. Connects two modules
  that share an underlying fact. Each has an optional `when` predicate so it stays hidden
  until relevant.
- **Module status** (`engine/moduleStatus.ts`) — live status on each home card, computed
  from context. Returns nothing rather than inventing urgency.
- **Module needs** (`engine/moduleNeeds.ts`) — the inverse of the above. Where a module has
  nothing to say, this names the field blocking it, and the UI accepts that field inline at
  the head of the module and on the home card. It mirrors the `undefined` branches of
  `moduleStatus`; if you add a module to one, add it to the other or the card goes silent
  for no stated reason.

## Known conflicts, deliberately unresolved

The app shows these rather than picking a winner. All render as `disputed` with every
citation.

1. **TB meningitis continuation phase.** ICMR adult TBM (p. 5) says RHZ; ICMR paediatric TBM
   (p. 19) and the ICMR/NTEP DS-TB workflow both say RHE. The adult page is the outlier
   against the paediatric page in its own document.
2. **Hepatotoxicity stop thresholds.** ATS 2006 and the ICMR DS-TB workflow use 3× with
   symptoms and 5× without. NTEP's DR-TB flowchart (p. 67) uses 5×, or 3× with bilirubin
   ≥2×, or symptoms alone — and that flowchart contradicts the prose on p. 66 of the same
   document.
3. **ART timing in non-CNS TB.** The author's IRIS notes say within 2 weeks irrespective of
   CD4; the author's HIV-TB notes say CD4 <50 → 2 weeks, CD4 ≥50 → 8 weeks.

## Pregnancy module

`content/pregnancy.ts` covers both tracks. The engine picks one from the derived
classification, falls back to the prescribed drugs, and shows both when neither
settles it.

- **Drug-susceptible TB:** WHO operational handbook M4 2025 (Section 8.2, p. 36; Annex 1
  sheets) and ATS/CDC/IDSA 2016 ("Pregnancy and Breastfeeding"). Covers 2HRZE/4HR,
  baseline LFT, pyridoxine, vitamin K when rifampicin is given late in pregnancy, avoiding
  the 4-month HPMZ regimen, and breastfeeding with no infant isolation after 2 weeks of
  maternal treatment. The NTEP documents on file do not cover this, so under the NTEP pack
  the card says "Not authored for NTEP" before showing the WHO/ATS answer.
- **Drug-resistant TB:** NTEP DR-TB 2024 §3.9.1 (pp. 40–42, flowchart p. 41) and the WHO
  2025 subgroup text.

Encoded as `disputed`:
- Pyrazinamide: WHO standard; ATS case by case (at least 9 months HRE if left out).
- Pyridoxine dose: ATS gives 25–50 mg/day in pregnancy; ICMR/NTEP gives 10 mg/day as a
  general dose.

Still unspecified by any source: vitamin K dose, and the gestation at which "late
pregnancy" begins.

NTEP's MTP cut-off is "<20 or <24 weeks … as per latest MTP gazette notification", so
20–24 weeks is its own band and the clinician is told to confirm with the obstetrician.

## Diabetes

`content/diabetes.ts` has two groups of thresholds, stored as data:
- NTEP DTC screening: RBS ≥110 → FBS/PPBS + HbA1c (p. 32).
- NTEP DTC triage glucose criteria, Box 4.3, p. 28: RBS ≥200 with symptoms, FBS ≥126,
  PPBS ≥200, HbA1c ≥6.5%.

`engine/diabetes.ts` walks: not screened → follow-up needed → diabetic range / screen
negative. RBS ≥200 counts only "with diabetes symptoms", which the context does not
carry, so the engine asks for confirmation rather than counting it.

Clinical content comes from the WHO handbook (pp. 20, 35, 99, 110, 120–121, 138, 166). The
9-month extension in poorly controlled diabetes is ATS expert opinion. NTEP says nothing
on it; the entry is `disputed`.

## Not improving on treatment

`content/response.ts` turns the WHO handbook's list of reasons for a positive 2-month smear
(Section 9.3, p. 42) into an ordered differential, each cause with a check and a link to
the module that resolves it.

Verdicts:
- Culture positive from month 4 → failure (ATS; NTEP BPaLM definition, pp. 49–50).
- Reversion → the NTEP failure definition.
- Smear positive, culture negative → dead bacilli (ATS).

Ordering is a presentation choice, documented in the file: resistance first, because
WHO says to repeat DST for anyone who stays positive (p. 43); then WHO's list. The pill on
a cause marks a reason specific to this patient (diabetes, HIV on ART) and never
reorders.

## COPD, asthma and post-TB lung disease

`content/airways.ts` draws on:
- GOLD 2026 (`docs/GOLD-2026-Report.pdf`; printed page = PDF page minus 11): TB section
  pp. 120–121, ICS factors Figure 3.10 p. 67, ICS adverse effects p. 151.
- GINA 2026 (`docs/GINA-2026-Strategy-Report.pdf`; printed page = PDF page minus 1): TB in
  the differential p. 30, low-resource settings pp. 38 and 133, referral p. 147.
- The 2021 IJTLD clinical standards for post-TB lung disease, and a 2024 editorial (PMC
  HTML in `docs/`).
- NTEP Differentiated TB Care 2025 (`docs/NTEP-Differentiated-TB-Care-2025.pdf`, copied
  from the user's Downloads).

GOLD and GINA are international strategy documents. The module says so in a banner.

**Open gap (`ICS_DURING_TB_GAP`):** no source says whether to continue, reduce or stop an
inhaled steroid once active TB is diagnosed. GOLD's caution is about starting one. No
source addresses interactions between TB drugs and inhalers or montelukast either.

## Interaction checker — what it can and cannot say

`content/interactions.ts` holds about 100 pairs, each cited to NTEP DR-TB 2024, WHO M4
guidelines 2025, the **WHO operational handbook M4 2025** (Annex 1 drug sheets, pp.
252–304; Annex 2, pp. 312–313), the **ATS/CDC/IDSA 2016 DS-TB guideline** (Table 8,
rifamycin interactions; "Drug–drug interactions" section), or the author's notes.

Both new sources are in `docs/`: `WHO-Handbook-Module4-2025.pdf` (from WHO IRIS) and
`ATS-CDC-IDSA-DSTB-2016-PMC6590850.html`. PMC served the full-text page but put its PDF
behind a bot check, so the HTML is the saved copy. It has no page numbers; ATS
locators name the table or section.

Diabetes drugs follow handbook p. 35: rifampicin lowers sulfonylureas, may *increase*
metformin's effect, has a slight effect on DPP-4 inhibitors, no known effect on GLP-1
agonists, and none on insulin.

Still unsourced, and listed by name only in `UNSOURCED`: acenocoumarol (Acitrom) and
other non-warfarin vitamin K antagonists, amlodipine and most other antihypertensives,
levetiracetam and newer antiepileptics, buprenorphine, inhaled drugs, antiplatelets,
PPIs, artemisinin antimalarials, implants and emergency contraception. The engine also
reports any medicine whose pairing with rifampicin is uncovered, even when the same
medicine matched another TB drug. Never let an empty result read as "no interaction".

Flagged for review:
- NOAC with rifampicin (`noac-rif`, status `needs-review`). WHO handbook p. 37 says
  heparin or a NOAC is "considerably safer" than warfarin, naming no drug and no dose. No
  NOAC labelling is on file. Check before relying on it.
- Dolutegravir with BPaLM (`disputed`). WHO guideline: preferred. WHO handbook and NTEP:
  evidence insufficient.
- Nevirapine with rifampicin (`disputed`). WHO: contraindicated. ATS: usable without the
  lead-in dose.
- NTEP p. 63 calls bedaquiline "a mild MAO inhibitor". The WHO handbook (p. 278) says
  linezolid is the MAO inhibitor. The amitriptyline warning stands on QT grounds either
  way.

## Sources

Guideline PDFs live in `docs/`. Registry is `src/content/sources.ts`.

Two kinds, and the distinction matters. **Published guidelines** — WHO Module 4 (2025),
NTEP DR-TB (2024), NTEP STW DS-TB (2022), ICMR STW, INDEX-TB (2016) — read directly, cited
with page numbers. **Clinician-authored notes** supplied by the app author, marked
`author-notes*`, expert-authored rather than published consensus. Where those notes cite an
upstream trial, the locator names it but only the notes were read — do not upgrade those to
`verified` without reading the primary paper.

## The one thing outstanding

**Nothing has been clinically verified.** Review status lives in the data (`needs-review` /
`source-checked` / `verified` / `disputed`) but is no longer printed beside every line — one
disclaimer sits at the foot of the app. Every citation is checkable and every conflict is
flagged, but no clinician has signed any of it off.

To review: open a content file, read the cited source at the given locator, replace any
descriptive locator with the exact one, set `status: 'verified'` with `verifiedBy` and
`verifiedOn`.

## If you are picking this up in a new session

Say: *"Read HANDOFF.md and README.md in ~/Documents/TBCompass, then <what you want>."*
The git log carries the reasoning behind each decision if you need more.

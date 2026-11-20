# TB Compass

> **Demo for education only. Not for clinical use.**

Live demo: https://dr-thennarasu-selvan.github.io/tb-compass/ — includes the
**Resistance Explorer** at [/explorer/](https://dr-thennarasu-selvan.github.io/tb-compass/explorer/).

A teaching model of tuberculosis management for clinicians, built on WHO and NTEP guidance.
Every clinical statement cites its source document and page. The guideline PDFs themselves
are not included in this repository.

Build for GitHub Pages: `BASE_PATH=/tb-compass/ npm run build`.

All nine modules are implemented end to end:

- **Diagnostic pathway** — the cascade spine.
- **Drug-susceptible TB** — FDC weight bands, mg/kg dose check, duration extension by site.
- **Hepatotoxicity on anti-TB treatment** — withdrawal decision, bridge, sequential
  reintroduction with outcome tracking, and the replacement regimen when a drug is lost.
- **Drug-resistant TB** — BPaLM, the 9–11 month shorter oral regimen, the 18–20 month
  longer oral regimen and Hr-TB, each evaluated against NTEP eligibility criteria.
- **Extrapulmonary TB** — duration and adjunctive corticosteroids by site.
- **IRIS and paradoxical reactions** — INSHI case definition, the mandatory differential
  against treatment failure and resistance, severity-based steroid ladder, ART timing.
- **QT prolongation** — QTcF calculator (Fridericia, with Bazett for comparison), NTEP
  grading 0–4, and when ECG monitoring is actually required.
- **Renal impairment and dialysis** — Cockcroft-Gault, interval-extended dosing below
  30 mL/min, post-dialysis timing, transplant interactions, and the thresholds that bar a
  regimen.
- **Drug reactions, rash and desensitisation** — red flags that forbid rechallenge, the
  sequential reintroduction schedule, desensitisation ladders, SCORTEN, and telling DRESS
  from SJS/TEN.

---

## The rule that shapes everything

**A clinical assertion cannot exist in this codebase without provenance.**

`Provenance` is a required field on every statement, threshold, action and drug note
(`src/types/content.ts`). It carries the citation, a review status, and — where guidelines
genuinely disagree — an explicit `divergence` note that the UI renders rather than silently
resolving.

Review status lives in the data and drives the review queue, but it is **not printed beside
every line**. Each assertion shows its citation; one disclaimer at the foot of the app
covers what per-line badges used to repeat. `divergence` is not a disclaimer and is still
shown inline — where two guidelines genuinely give different answers, that is clinical
content, not a caveat.

## Output style: orders, not prose

The module outputs **order lines**, not paragraphs. Each line is a verb, a short
subject, and a timing:

```
STOP         Isoniazid · Rifampicin · Pyrazinamide    now — hold until ALT <2x ULN
CONTINUE     Ethambutol
BRIDGE       Ethambutol · Levofloxacin · Amikacin     until ALT <2x ULN
SEND         HAV IgM · HBsAg · anti-HBc IgM · ...     today
REPEAT LFT   ALT · AST · bilirubin · INR              in 3 days, then every 3 days
```

Rationale and citations sit behind the `i` button on each row, collapsed by
default. If an order's `primary` needs a comma and a subordinate clause, it is
too long — shorten it or move the words into `why`.

**Where the numbers come from.** Guidelines give ranges, not single values. Rather
than hedging in prose, the app states a default and puts the uncertainty in
**Protocol settings** — recheck interval, rechallenge interval, bridge regimen.
Set them once to your unit's protocol and every order line reads from them.

## Interface rules

Three rules shape the screens, and each one exists because the alternative was tried:

1. **A module opens on the module.** The patient panel is collapsed everywhere by
   default — it used to expand itself whenever the patient was blank, which meant opening
   a module on a fresh patient landed you on a sixty-field form with the answer below the
   fold. The summary bar replaces it, and opens the panel on demand.
2. **A module that cannot answer says what it is waiting on.** `engine/moduleNeeds.ts`
   names the blocking field and the UI takes it inline, so the answer appears without
   leaving the screen. Silence reads as a broken page; "needs creatinine" does not. Home
   cards carry the same signal, so a quiet card explains itself.
3. **Context entry is grouped and resumable.** The panel is five collapsible sections, each
   header carrying a live summary of what it already holds. Numeric fields echo what the
   app derived from them as you type — a weight shows its FDC band, an ALT shows its ×ULN —
   so entry and answer are not separated by a navigation step.

The guideline pack is a switch in the header rather than a setting inside one module: it
changes the answer everywhere, so it belongs in the chrome.

## Architecture

```
src/
  types/content.ts      Provenance, Statement, Action, Threshold — the schema contract
  types/patient.ts      PatientContext: entered once, drives every module
  content/
    sources.ts          Source registry. Register before citing.
    drugs.ts            Drug monographs with hepatic behaviour
    playbooks/dili.ts   Thresholds, alternative causes, actions — as DATA
  engine/
    dili.ts             assessDili() — pure, no React, no I/O
    orders.ts           buildOrders() — assessment + protocol -> order lines
    rechallenge.ts      Sequential reintroduction planning
  components/           UI. Provenance.tsx renders the citation chips.
  store/patientContext.ts  Context + hook (separate file: Fast Refresh stability)
  store/patient.tsx     Provider. localStorage only; there is no network layer.
```

**The split that matters:** thresholds and statements are *data*, so they can be audited
line by line and swapped for another guideline pack. Control flow is *code*. A different
national programme should be a new content pack, not a fork.

## Guideline packs

The same clinical question has different correct answers under WHO and under
India's NTEP/PMDT. Content is **tagged by pack, never merged**:

- `GuidelinePack = 'who' | 'ntep'` on every source and regimen.
- The active pack's answer is shown as yours; the other pack's answer renders
  alongside, muted, so divergence stays visible.
- Where a branch has no content for the active pack, the UI says **"Not authored
  for <pack>"** rather than silently falling back to the other pack. That
  fallback is exactly the error the separation exists to prevent.

**Divergences already encoded**, from NTEP DR-TB 2024 (Annexure 4, p. 66):

| | WHO / ATS 2006 | NTEP DR-TB 2024 |
|---|---|---|
| Stop threshold, symptomatic | ALT 3x ULN | **5x ULN — no separate symptomatic threshold is stated** |
| Stop threshold, asymptomatic | ALT 5x ULN | 5x ULN |
| Bridge regimen | E + Lfx + Am | **Am + Lfx + Cs** ("at least three non-hepatotoxic") |
| LFT during reintroduction | every 7 days | **every 3 days** |
| Reintroduction order | rifampicin first (most needed) | **least hepatotoxic first** |
| Bridge fails | (not stated) | **stop all drugs** |

The two ordering principles happen to produce the same sequence for H/R/Z,
because rifampicin is also the least hepatotoxic of the three. `sequencesAgree()`
in `engine/rechallenge.ts` makes that coincidence explicit rather than hiding it.

Because these thresholds differ, the same labs can cross one guideline's
threshold and not the other's. When that happens the verdict carries an explicit
**"<other pack> disagrees"** banner — a clinician must not have to switch packs
to discover it. Worked example: ALT 4.5x ULN with jaundice → WHO stops the
hepatotoxic drugs, NTEP continues them.

## The regimen graph

`content/regimens.ts` is keyed by the **set** of permanently excluded drugs,
because the answers do not compose. Losing pyrazinamide has a clean answer;
losing isoniazid has a different clean answer; losing both lands somewhere
neither entry covers, and that branch is marked `specialistRequired`.

Rechallenge is not a linear list. Each drug carries an outcome — pending,
tolerated, or recurred — and a recurrence permanently excludes that drug and
rebuilds the regimen around its absence:

```
1 ✓ Rifampicin     tolerated — keep in regimen
2 × Isoniazid      culprit — permanently excluded
3 × Pyrazinamide   culprit — permanently excluded
  → Regimen after exclusion: R + E + Lfx  [WHO] [SPECIALIST]
```

Note the cross-check this makes possible: the WHO Hr-TB regimen contains
pyrazinamide, so it is unusable when pyrazinamide was itself the culprit. That
conflict is stated in the regimen's notes rather than left for the reader to
notice.

## Condition pages use the national template

Every condition page follows the shape of the ICMR Standard Treatment Workflows:

> **When to suspect** → **Investigations** (essential / desirable) → **Diagnostic pathway** → **Management** (treatment, when to refer, follow-up)

`types/workflow.ts` is that template as a type; `content/workflows/` holds one file per
condition, transcribed from `docs/ICMR-STW-TB-Workflows.pdf`; `components/ConditionPage.tsx`
renders any of them. The diagnostic pathway is a node graph the clinician walks by choosing
a branch at each step (`engine/workflow.ts`), and values from the patient context can
pre-select branches — pleural fluid ADA picks the ADA branch automatically.

Adopting the national shape rather than inventing one means the source document maps onto
the screen section by section, which is what makes each citation checkable. **Fifteen
condition workflows are transcribed** — adult pleural, pericardial, lymphadenopathy, TBM,
abdominal, musculoskeletal, cutaneous, intraocular, genitourinary and female genital, plus
paediatric intrathoracic, TBM, lymph node, abdominal and osteoarticular — along with the
extrapulmonary specimen-handling layer.

### Deterioration forks

Several workflows say a version of *"if it worsens, it could be a paradoxical reaction,
drug resistance, or an alternative diagnosis."* Three problems, three different actions.
`content/deteriorationForks.ts` turns that sentence into branches with a button that opens
the module resolving each one — IRIS, the diagnostic cascade, DR-TB regimens, or
hepatotoxicity. This is the thing the app can do that the printed workflow cannot.

### Live module status

Home cards carry a status computed from the patient context — "Withdrawal threshold
crossed — 2 immediate orders", "2 regimens indeterminate", "Grade 2 — moderate". A card
returns nothing rather than inventing urgency when the module has nothing to say, so the
landing page tells the clinician where to go instead of just listing what exists.

## Three-valued eligibility

`engine/drtb.ts` returns `met` / `not-met` / **`unknown`**, and `unknown` is not a soft
`not-met`. A regimen with no failures but unresolved criteria is **indeterminate**, and
the UI names the missing field rather than quietly disqualifying a regimen the patient may
well be eligible for. Some criteria (prior second-line exposure, extent of disease, cardiac
history) are always `unknown` because the patient context does not carry them — they are
flagged for manual confirmation, not guessed.

## Cross-module consequences

Modules are not independent calculators; they share the patient context, so a finding in
one changes the answer in another. Implemented:

- A liver panel crossing NTEP's BPaLM exclusion (AST/ALT >3× ULN **and** bilirubin >2× ULN
  — the source states AND, not OR) raises a `NOTE` order inside the hepatotoxicity module,
  so the physician learns it while managing the hepatitis rather than weeks later at
  regimen selection.
- A DR-TB classification, or bedaquiline/pretomanid/linezolid/clofazimine in the regimen,
  switches monitoring to aDSM — scheduled regardless of symptoms.
- Both the WHO and NTEP Hr-TB regimens contain pyrazinamide, so neither is usable when
  pyrazinamide caused the injury. Stated in the regimen notes.

## Source types

Not all sources are the same kind of thing, and the schema distinguishes them:

- **Published guidelines** (WHO Module 4 2025, NTEP DR-TB 2024, NTEP STW 2022, INDEX-TB 2016)
  — read directly from the PDFs in `docs/`, cited with page numbers.
- **Clinician-authored notes** (`author-notes`) — expert-authored material supplied by the
  app author, not published consensus. Used for the IRIS module.

Where the author's notes cite an upstream trial or consensus definition, the locator names
it — for example `Section 10b (notes cite Meintjes, AIDS 2010, as the source of this
schedule)`. That phrasing is load-bearing: it means the notes were transcribed faithfully
but the primary paper was **not** independently read. Do not upgrade any of these to
`verified` without reading the source paper.

## Privacy

There is no network layer. Patient context lives in memory and `localStorage` on the
device, and nothing is transmitted. Adding sync is not a small change — it needs a
data-protection review first.

## Development

```bash
npm install
npm run dev        # http://localhost:5273
npm run build      # production PWA with service worker
npm run typecheck
```

> **Note:** this machine has root-owned files in `~/.npm` from an old npm bug, which makes
> `npm install` fail with EACCES. Either run
> `sudo chown -R 501:20 "$HOME/.npm"` once, or pass `--cache <writable-dir>`.

## Clinical review workflow

1. Open a content file — start with `src/content/playbooks/dili.ts`.
2. For each entry, read the cited source at the given locator.
3. Replace the descriptive locator with the exact section or table number.
4. Set `status: 'verified'`, and add `verifiedBy` and `verifiedOn`.
5. Where sources conflict, set `status: 'disputed'` and write the `divergence` note.

Entries deliberately left as stubs for a reviewer, because they should not be written
from memory:

- `EXCLUSION_CONSEQUENCES.pyrazinamide` — the regimen and duration when pyrazinamide is
  permanently excluded.
- `DILI_ACTIONS.bridgeRegimen` — the exact non-hepatotoxic bridging combination your
  programme endorses.
- `DILI_THRESHOLDS.rechallengeAlt` — whether your setting follows the numeric ALT
  threshold or the symptom-and-jaundice resolution framing.

## Roadmap

The module list on the home screen is the roadmap. Each planned module follows the same
shape: content pack with provenance, pure engine, thin UI.

## Disclaimer

Decision support for qualified clinicians. Does not diagnose, prescribe, or replace the
source guideline documents it cites, or clinical judgement.

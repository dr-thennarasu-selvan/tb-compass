import { Provenance } from '@/components/Provenance'
import { drug } from '@/content/drugs'
import { regimensFor, regimensForOtherPacks, type Regimen } from '@/content/regimens'
import { PACK_LABEL, type GuidelinePack } from '@/types/content'

const names = (ids: string[]) => ids.map((id) => drug(id)?.name ?? id).join(' · ')

function RegimenBlock({ r, muted }: { r: Regimen; muted?: boolean }) {
  return (
    <div className="regimen" data-muted={muted ? 'true' : 'false'}>
      <div className="rhead">
        <span className="shorthand">{r.shorthand}</span>
        <span className="packtag">{PACK_LABEL[r.pack]}</span>
        {r.totalMonths != null && <span className="dur">{r.totalMonths} months</span>}
        {r.specialistRequired && <span className="specialist">specialist</span>}
      </div>

      {r.phases.length > 0 &&
        r.phases.map((ph, i) => (
          <div className="phase" key={i}>
            <div className="pl">
              {ph.label}
              {ph.months > 0 ? ` · ${ph.months} mo` : ''}
            </div>
            <div className="pd">{names(ph.drugs)}</div>
          </div>
        ))}

      {r.notes.length > 0 && (
        <ul className="plain">
          {r.notes.map((n, i) => (
            <li key={i} className={n.startsWith('CAUTION') ? 'caution-note' : undefined}>
              {n}
            </li>
          ))}
        </ul>
      )}

      <Provenance p={r.provenance} />
    </div>
  )
}

/**
 * The regimen that follows from a set of permanently excluded drugs.
 *
 * When a branch has not been authored for the active pack, this says so
 * explicitly. It must never silently substitute the other pack's regimen —
 * that is precisely the error the pack separation exists to prevent.
 */
export function RegimenCard({
  excluded,
  pack,
}: {
  excluded: string[]
  pack: GuidelinePack
}) {
  const mine = regimensFor(excluded, pack)
  const others = regimensForOtherPacks(excluded, pack)

  return (
    <div className="card">
      <h2>Regimen after exclusion</h2>
      <div className="sub">
        {excluded.length === 0
          ? 'Nothing excluded — standard regimen.'
          : `Without ${names(excluded)}.`}
      </div>

      {mine.length > 0 ? (
        mine.map((r) => <RegimenBlock key={r.id} r={r} />)
      ) : (
        <div className="unauthored">
          <div className="p">Not authored for {PACK_LABEL[pack]}</div>
          <div className="meta">
            This branch has no {PACK_LABEL[pack]} content yet. The other pack's answer is shown
            below for reference only — it is not a substitute, and the regimens genuinely differ.
            Author this branch from your source document.
          </div>
        </div>
      )}

      {others.length > 0 && (
        <>
          <div className="section-label">Other guideline for comparison</div>
          {others.map((r) => (
            <RegimenBlock key={r.id} r={r} muted />
          ))}
        </>
      )}
    </div>
  )
}

import type { Provenance as P } from '@/types/content'
import { SOURCES } from '@/content/sources'

/**
 * Renders the source of a clinical assertion.
 *
 * Citation only. The review status lives in the data — a reviewer can still
 * query it, and the review queue still uses it — but it is not printed beside
 * every line. One disclaimer at the foot of the app covers what the badges
 * used to repeat.
 *
 * `divergence` is NOT a disclaimer and is still shown: where two guidelines
 * genuinely give different answers, that is clinical content.
 */
export function Provenance({ p }: { p: P }) {
  return (
    <>
      <div className="prov">
        {p.citations.map((c, i) => {
          const s = SOURCES[c.source]
          return (
            <span
              key={i}
              className="cite"
              data-superseded={s?.supersededBy ? 'true' : 'false'}
              title={
                s
                  ? `${s.title} (${s.publisher}, ${s.year})${
                      s.supersededBy
                        ? ` — superseded by ${SOURCES[s.supersededBy]?.short ?? s.supersededBy}`
                        : ''
                    }`
                  : c.source
              }
            >
              {s ? s.short : c.source} — {c.locator}
            </span>
          )
        })}
      </div>
      {p.divergence && (
        <div className="divergence">
          <b>Sources differ.</b> {p.divergence}
        </div>
      )}
    </>
  )
}

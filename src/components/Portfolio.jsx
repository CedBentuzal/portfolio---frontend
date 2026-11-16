import { useState } from "react"
import WorkCard from "./WorkCard"

// One work section for one category (for example Motion design or Shorts).
// `tall` shows the cards in the upright 9:16 shape used for shorts.
// `flush` removes the top space when the section follows another work section.
export default function Portfolio({
  id,
  number,
  title,
  category,
  tall = false,
  flush = false,
  items = [],
  isLoading = false,
  onOpen = () => {},
}) {
  const [showAll, setShowAll] = useState(false)

  // Show 4 first; the "Show all" button reveals the rest.
  const initialCount = 4
  const sectionItems = items.filter((item) => item.category === category)
  const visible = showAll ? sectionItems : sectionItems.slice(0, initialCount)

  return (
    <section id={id} className="reveal-section">
      <div className={`cd-wrap cd-work ${flush ? "cd-work--flush" : ""}`}>
        <div className="cd-section-head">
          <div>
            <span className="cd-mono cd-muted">({number}) Work</span>
            <h2 className="cd-h2">{title}</h2>
          </div>
          {!isLoading && sectionItems.length > 0 && (
            <span className="cd-mono cd-muted">
              {sectionItems.length} {sectionItems.length === 1 ? "project" : "projects"}
            </span>
          )}
        </div>

        <div className={`cd-grid ${tall ? "cd-grid--tall" : ""}`}>
          {isLoading ? (
            [0, 1, 2, 3].map((index) => (
              <div key={index} className="cd-card cd-skeleton" aria-hidden="true">
                <span className="cd-thumb" />
              </div>
            ))
          ) : visible.length > 0 ? (
            visible.map((item) => <WorkCard key={item.key} item={item} onOpen={onOpen} />)
          ) : (
            <p className="cd-empty cd-muted">Nothing here yet. New work is coming soon.</p>
          )}
        </div>

        {!isLoading && sectionItems.length > initialCount && (
          <div className="cd-more">
            <button
              type="button"
              className="cd-btn cd-btn--ghost"
              onClick={() => setShowAll((previous) => !previous)}
            >
              {showAll ? "Show less" : `Show all (${sectionItems.length})`}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

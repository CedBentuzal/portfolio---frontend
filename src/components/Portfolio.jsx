import { useState } from "react"
import WorkCard from "./WorkCard"

// One work section for one category (for example Motion design or Shorts).
// `tall` shows the cards in the upright 9:16 shape used for shorts.
// `flush` removes the top space when the section follows another work section.
// `filters` (optional) adds type buttons, for example Real Estate or Fitness.
export default function Portfolio({
  id,
  number,
  title,
  category,
  tall = false,
  flush = false,
  filters = [],
  items = [],
  isLoading = false,
  onOpen = () => {},
}) {
  const [showAll, setShowAll] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")

  // Show 4 first; the "Show more" button reveals the rest.
  const initialCount = 4
  const sectionItems = items.filter((item) => item.category === category)
  // "Show all" keeps every item, including the ones with no type.
  const filtered =
    activeFilter === "all"
      ? sectionItems
      : sectionItems.filter((item) => item.subcategory === activeFilter)
  const visible = showAll ? filtered : filtered.slice(0, initialCount)

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

        {filters.length > 0 && (
          <div className="cd-filters cd-filters--row" role="group" aria-label={`Filter ${title}`}>
            {[{ id: "all", label: "Show all" }, ...filters].map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`cd-chip cd-mono ${activeFilter === filter.id ? "is-active" : ""}`}
                aria-pressed={activeFilter === filter.id}
                onClick={() => {
                  setActiveFilter(filter.id)
                  setShowAll(false)
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}

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

        {!isLoading && filtered.length > initialCount && (
          <div className="cd-more">
            <button
              type="button"
              className="cd-btn cd-btn--ghost"
              onClick={() => setShowAll((previous) => !previous)}
            >
              {showAll ? "Show less" : `Show more (${filtered.length - initialCount})`}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

import { useMemo, useState } from "react"
import { categoryLabel, portfolioCategories } from "../hooks/usePortfolioItems"
import WorkCard from "./WorkCard"

const filters = [{ id: "all", label: "All" }, ...portfolioCategories]
const INITIAL_COUNT = 6

// "Selected work" section: filter chips + project grid.
export default function Portfolio({ items = [], isLoading = false, onOpen = () => {} }) {
  const [activeFilter, setActiveFilter] = useState("all")
  const [showAll, setShowAll] = useState(false)

  const filtered = useMemo(
    () => (activeFilter === "all" ? items : items.filter((item) => item.category === activeFilter)),
    [items, activeFilter]
  )
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_COUNT)
  const isTall = activeFilter === "shorts"

  return (
    <section id="portfolio" className="reveal-section">
      <div className="cd-wrap cd-work">
        <div className="cd-section-head">
          <div>
            <span className="cd-mono cd-muted">(01) Work</span>
            <h2 className="cd-h2">Selected work</h2>
          </div>
          <div className="cd-filters" role="group" aria-label="Filter work">
            {filters.map((filter) => (
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
        </div>

        <div className={`cd-grid ${isTall ? "cd-grid--tall" : ""}`}>
          {isLoading ? (
            [0, 1, 2, 3].map((index) => (
              <div key={index} className="cd-card cd-skeleton" aria-hidden="true">
                <span className="cd-thumb" />
              </div>
            ))
          ) : visible.length > 0 ? (
            visible.map((item) => (
              <WorkCard key={item.key} item={item} tag={categoryLabel(item.category)} onOpen={onOpen} />
            ))
          ) : (
            <p className="cd-empty cd-muted">Nothing here yet. New work is coming soon.</p>
          )}
        </div>

        {!isLoading && filtered.length > INITIAL_COUNT && (
          <div className="cd-more">
            <button type="button" className="cd-btn cd-btn--ghost" onClick={() => setShowAll((prev) => !prev)}>
              {showAll ? "Show less" : "View all work"}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

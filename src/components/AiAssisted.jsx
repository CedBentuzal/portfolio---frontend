import { useState } from "react"
import WorkCard from "./WorkCard"

const INITIAL_COUNT = 4

const steps = [
  ["01", "Idea & script"],
  ["02", "AI exploration"],
  ["03", "Refine by hand"],
  ["04", "Animate & deliver"],
]

// Shown only while there is no "AI Assisted" work uploaded yet.
const placeholders = ["Ideas and moodboards", "Style frames", "Assets and cleanup", "Animation tests"]

const Sparkle = () => (
  <svg className="cd-sparkle" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 1.5l2.2 8.3 8.3 2.2-8.3 2.2-2.2 8.3-2.2-8.3-8.3-2.2 8.3-2.2L12 1.5z"
      fill="currentColor"
    />
  </svg>
)

// New section: work made with help from AI tools.
export default function AiAssisted({ items = [], onOpen = () => {} }) {
  const [showAll, setShowAll] = useState(false)
  const aiItems = items.filter((item) => item.category === "ai-assisted")
  const visible = showAll ? aiItems : aiItems.slice(0, INITIAL_COUNT)

  return (
    <section id="ai-assisted" className="reveal-section">
      <div className="cd-wrap">
        <div className="cd-ai-panel">
          <div className="cd-section-head">
            <div>
              <span className="cd-mono cd-muted">(03) New — AI Assisted</span>
              <h2 className="cd-h2">
                AI assisted,
                <br />
                human directed.
              </h2>
            </div>
            <p className="cd-body-l cd-muted cd-ai-intro">
              In this section are projects that I used AI tools to move faster on ideas, style frames, assets and animation. 
            </p>
          </div>

          <div className="cd-ai-cards">
            {aiItems.length > 0
              ? visible.map((item) => (
                  <WorkCard key={item.key} item={item} tag="AI Assisted" onOpen={onOpen} />
                ))
              : placeholders.map((title) => (
                  <div key={title} className="cd-card">
                    <span className="cd-thumb">
                      <span className="cd-tag cd-mono">AI Assisted</span>
                      <Sparkle />
                    </span>
                    <span className="cd-meta-text">
                      <span className="cd-title">{title}</span>
                      <span className="cd-muted">Examples coming soon</span>
                    </span>
                  </div>
                ))}
          </div>

          {aiItems.length > INITIAL_COUNT && (
            <div className="cd-more">
              <button
                type="button"
                className="cd-btn cd-btn--ghost"
                onClick={() => setShowAll((previous) => !previous)}
              >
                {showAll ? "Show less" : `Show all (${aiItems.length})`}
              </button>
            </div>
          )}

          <div className="cd-steps">
            {steps.map(([number, label]) => (
              <div key={number} className="cd-step">
                <span className="cd-mono cd-muted">{number}</span>
                <span className="cd-title">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

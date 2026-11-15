import { useState } from "react"

const STORAGE_KEY = "cdbn-theme"

const readTheme = () =>
  document.documentElement.dataset.theme === "night" ? "night" : "day"

// Day / Night switch. The choice is saved in the browser.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme)

  const choose = (next) => {
    document.documentElement.setAttribute("data-theme", next)
    setTheme(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Saving is optional; the switch still works without it.
    }
  }

  return (
    <div className="cd-toggle" role="group" aria-label="Color theme">
      {["day", "night"].map((option) => (
        <button
          key={option}
          type="button"
          className={`cd-mono ${theme === option ? "is-active" : ""}`}
          aria-pressed={theme === option}
          onClick={() => choose(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

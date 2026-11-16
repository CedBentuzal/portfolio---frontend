import { useEffect, useState } from "react"
import ThemeToggle from "./ThemeToggle"

const links = [
  ["#motion-design", "Motion design"],
  ["#shorts", "Shorts"],
  ["#ai-assisted", "AI Assisted"],
  ["#about", "About"],
  ["#contact", "Contact"],
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false)
    }

    if (isOpen) {
      document.body.classList.add("nav-open")
      window.addEventListener("keydown", onKeyDown)
    } else {
      document.body.classList.remove("nav-open")
    }

    return () => {
      document.body.classList.remove("nav-open")
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen])

  return (
    <nav className="cd-nav">
      <div className="cd-wrap cd-nav-inner">
        <a className="cd-logo" href="/admin">
          Cdbn.Ae
        </a>

        <div className={`cd-nav-links ${isOpen ? "is-open" : ""}`}>
          {links.map(([href, label]) => (
            <a key={href} href={href} className="cd-nav-link" onClick={() => setIsOpen(false)}>
              {label}
            </a>
          ))}
        </div>

        <div className="cd-nav-actions">
          <ThemeToggle />
          <a href="#contact" className="cd-btn">
            Let's talk
          </a>
          <button
            type="button"
            className={`cd-burger ${isOpen ? "is-open" : ""}`}
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  )
}

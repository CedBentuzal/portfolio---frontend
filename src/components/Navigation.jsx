import { useEffect, useState } from "react"
import hamburgerIcon from "../assets/hamburger.png"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
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
    <nav
      className="nav-shell"
      style={{
        backdropFilter: "blur(4px)",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        fontWeight: "400",
        left: "0px",
        position: "fixed",
        right: "0px",
        top: "0px",
        zIndex: "50",
      }}
    >
      <div className="nav-inner">
        <a className="nav-logo" href="/admin">
          Cdbn.Ae
        </a>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <img
            src={hamburgerIcon}
            alt="Menu"
            className="nav-toggle-icon"
          />
        </button>

        <div className={`nav-links ${isOpen ? "is-open" : ""}`}>
          <a href="#home" className="nav-link nav-item" onClick={() => setIsOpen(false)}>Home</a>
          <a href="#about" className="nav-link nav-item" onClick={() => setIsOpen(false)}>About</a>
          <a href="#portfolio" className="nav-link nav-item" onClick={() => setIsOpen(false)}>Portfolio</a>
          <a href="#contact" className="nav-link nav-item" onClick={() => setIsOpen(false)}>Contact</a>
        </div>
      </div>

      <div
        className={`nav-overlay ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen(false)}
      />
    </nav>
  )
}

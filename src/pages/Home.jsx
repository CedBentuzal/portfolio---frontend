import { useCallback, useEffect, useRef, useState } from "react"
import Navigation from "../components/Navigation"
import Hero from "../components/Hero"
import About from "../components/About"
import Portfolio from "../components/Portfolio"
import AiAssisted from "../components/AiAssisted"
import Contact from "../components/Contact"
import MediaModal from "../components/MediaModal"
import usePortfolioItems from "../hooks/usePortfolioItems"

export default function Home() {
  const { items, isLoading } = usePortfolioItems()
  const [selectedItem, setSelectedItem] = useState(null)
  const closeModal = useCallback(() => setSelectedItem(null), [])

  const dragState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  })

  // Click and drag anywhere to scroll the page.
  useEffect(() => {
    const state = dragState.current

    const onMouseDown = (event) => {
      if (event.button !== 0) return
      const target = event.target
      if (target.closest("input, textarea, button, a, select, option, label")) {
        return
      }
      state.active = true
      state.startX = event.clientX
      state.startY = event.clientY
      state.scrollLeft = window.scrollX
      state.scrollTop = window.scrollY
      document.body.style.cursor = "grabbing"
      document.body.style.userSelect = "none"
    }

    const onMouseMove = (event) => {
      if (!state.active) return
      const dx = event.clientX - state.startX
      const dy = event.clientY - state.startY
      window.scrollTo(state.scrollLeft - dx, state.scrollTop - dy)
    }

    const endDrag = () => {
      if (!state.active) return
      state.active = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    window.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", endDrag)
    window.addEventListener("mouseleave", endDrag)

    return () => {
      window.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", endDrag)
      window.removeEventListener("mouseleave", endDrag)
      endDrag()
    }
  }, [])

  // Fade each section in the first time it comes on screen.
  useEffect(() => {
    const sections = document.querySelectorAll(".reveal-section")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.05 }
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="cd-site">
      <Navigation />
      <Hero onOpen={setSelectedItem} />
      <Portfolio items={items} isLoading={isLoading} onOpen={setSelectedItem} />
      <AiAssisted items={items} onOpen={setSelectedItem} />
      <About />
      <Contact />
      <MediaModal item={selectedItem} onClose={closeModal} />
    </div>
  )
}

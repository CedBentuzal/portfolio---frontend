import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "")

const videoExtensions = ["mp4", "webm", "mov", "m4v"]

const isVideo = (fileName) => {
  const ext = fileName.split(".").pop()?.toLowerCase()
  return videoExtensions.includes(ext || "")
}

export default function Portfolio() {
  const [remoteItems, setRemoteItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [activeIndex, setActiveIndex] = useState(1)
  const [selectedItem, setSelectedItem] = useState(null)
  const videoRefs = useRef([])

  const placeholderItems = useMemo(
    () => [
      { name: "placeholder-1", type: "placeholder", label: "Placeholder" },
      { name: "placeholder-2", type: "placeholder", label: "Placeholder" },
      { name: "placeholder-3", type: "placeholder", label: "Placeholder" },
    ],
    []
  )

  const fetchPortfolio = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage("")
    try {
      const response = await fetch(`${backendBaseUrl}/api/cloudinary-list`)

      if (!response.ok) {
        throw new Error("Failed to load uploads")
      }

      const data = await response.json()
      const items = (data.items || []).filter(Boolean)
      setRemoteItems(items)
      if (items.length > 0) {
        setActiveIndex(items.length > 1 ? 1 : 0)
      }
    } catch (error) {
      console.warn("Failed to list portfolio items", error)
      setErrorMessage("Unable to load uploads. Check Cloudinary list endpoint.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  const displayItems = remoteItems.length > 0 ? remoteItems : placeholderItems
  const maxIndex = Math.max(0, displayItems.length - 1)

  useEffect(() => {
    if (activeIndex > maxIndex) {
      setActiveIndex(maxIndex)
    }
  }, [activeIndex, maxIndex])

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) {
        return
      }

      if (index === activeIndex) {
        const playPromise = video.play()
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {})
        }
      } else {
        video.pause()
      }
    })
  }, [activeIndex, displayItems])

  const handlePrev = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  const getCoverflowStyle = (index) => {
    const offset = index - activeIndex
    const absOffset = Math.abs(offset)

    if (absOffset > 2) {
      return {
        opacity: 0,
        pointerEvents: "none",
        transform: "translateX(0) scale(0.6)",
        zIndex: 0,
      }
    }

    const translateX = offset * 220
    const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.85 : 0.7
    const rotateY = offset * -18
    const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.7 : 0.4

    return {
      transform: `translateX(calc(-50% + ${translateX}px)) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity,
      zIndex: 10 - absOffset,
    }
  }

  return (
    <section id="portfolio" className="min-h-screen bg-portfolio-bg reveal-section">
      <main style={{ padding: "128px 24px 80px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <h1
            style={{
              font: "400 48px/48px Jaro, sans-serif",
              color: "black",
              marginBottom: "64px",
              textAlign: "center",
            }}
          >
            Portfolio
          </h1>

          <div style={{ marginBottom: "96px" }}>
            <h2
              style={{
                font: "700 32px/48px Quicksand, sans-serif",
                color: "rgb(0, 141, 229)",
                marginBottom: "32px",
                textAlign: "center",
              }}
            >
              Motion/Graphic Design
            </h2>

            <div className="coverflow-row">
              {displayItems.length > 1 && (
                <button
                  type="button"
                  className="portfolio-arrow"
                  onClick={handlePrev}
                  disabled={activeIndex === 0}
                  aria-label="Previous"
                >
                  ←
                </button>
              )}
              <div className="coverflow">
                {displayItems.map((item, index) => (
                  <div
                    key={item.name}
                    className="portfolio-card coverflow-item"
                    style={{
                      width: "228px",
                      height: "272px",
                      backgroundColor: "#d9d9d9",
                      cursor: "pointer",
                      overflow: "hidden",
                      ...getCoverflowStyle(index),
                    }}
                    onClick={() => {
                      if (item.type === "video" && index === activeIndex) {
                        const video = videoRefs.current[index]
                        if (video?.paused) {
                          const playPromise = video.play()
                          if (playPromise && typeof playPromise.catch === "function") {
                            playPromise.catch(() => {})
                          }
                        } else if (video) {
                          video.pause()
                        }
                        return
                      }

                      if (item.type === "image" || item.type === "video") {
                        setSelectedItem(item)
                      }
                    }}
                  >
                    {item.type === "video" ? (
                      <video
                        src={item.src}
                        loop
                        muted
                        playsInline
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        ref={(node) => {
                          videoRefs.current[index] = node
                        }}
                      />
                    ) : item.type === "image" ? (
                      <img
                        src={item.src}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "linear-gradient(135deg, #f2f2f2 0%, #d9d9d9 100%)",
                          color: "#666",
                          font: "700 14px/18px Quicksand, sans-serif",
                          letterSpacing: "0.02em",
                          textTransform: "uppercase",
                        }}
                      >
                        {item.label}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {displayItems.length > 1 && (
                <button
                  type="button"
                  className="portfolio-arrow"
                  onClick={handleNext}
                  disabled={activeIndex >= maxIndex}
                  aria-label="Next"
                >
                  →
                </button>
              )}
            </div>
            {isLoading && (
              <p style={{ marginTop: "16px", textAlign: "center", color: "#555" }}>
                Loading uploads...
              </p>
            )}
            {errorMessage && (
              <p style={{ marginTop: "8px", textAlign: "center", color: "#b00020" }}>
                {errorMessage}
              </p>
            )}
          </div>

          <div>
            <h2
              style={{
                font: "700 32px/48px Quicksand, sans-serif",
                color: "rgb(0, 141, 229)",
                marginBottom: "32px",
                textAlign: "center",
              }}
            >
              System Development
            </h2>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <p style={{ font: "400 24px/32px Jaro, sans-serif", color: "rgb(177, 10, 10)" }}>
                No System to show yet!
              </p>
            </div>
          </div>
        </div>
      </main>

      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedItem(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "relative",
              width: "min(92vw, 960px)",
              maxHeight: "85vh",
              backgroundColor: "#000",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              aria-label="Close"
              style={{
                position: "absolute",
                right: "12px",
                top: "12px",
                background: "rgba(255, 255, 255, 0.9)",
                border: "none",
                borderRadius: "999px",
                width: "36px",
                height: "36px",
                cursor: "pointer",
                fontSize: "18px",
                lineHeight: "36px",
                zIndex: 2,
              }}
            >
              ×
            </button>
            {selectedItem.type === "video" ? (
              <video
                src={selectedItem.src}
                controls
                autoPlay
                playsInline
                style={{ width: "100%", height: "100%", maxHeight: "85vh", objectFit: "contain" }}
              />
            ) : (
              <img
                src={selectedItem.src}
                alt={selectedItem.name}
                style={{ width: "100%", height: "100%", maxHeight: "85vh", objectFit: "contain" }}
              />
            )}
          </div>
        </div>
      )}
    </section>
  )
}
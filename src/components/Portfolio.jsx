import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "")

const portfolioCategories = [
  { id: "motion-saas", label: "Motion and SaaS" },
  { id: "shorts", label: "Shorts" },
  { id: "static-visuals", label: "Static visuals" },
]

const parsePortfolioMeta = (name = "") => {
  const baseName = name.split("/").pop() || name
  const parts = baseName.split("__")

  if (parts.length >= 3) {
    const [category, featuredFlag, ...rest] = parts
    return {
      category,
      isFeatured: featuredFlag === "featured",
      displayName: rest.join("__") || baseName,
    }
  }

  return {
    category: "motion-saas",
    isFeatured: false,
    displayName: baseName,
  }
}

export default function Portfolio() {
  const [remoteItems, setRemoteItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndexByCategory, setActiveIndexByCategory] = useState({})
  const [selectedItem, setSelectedItem] = useState(null)
  const videoRefsByCategory = useRef({})
  const modalVideoRef = useRef(null)

  const fetchPortfolio = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${backendBaseUrl}/api/cloudinary-list`)

      if (!response.ok) {
        throw new Error("Failed to load uploads")
      }

      const data = await response.json()
      const items = (data.items || []).filter(Boolean)
      setRemoteItems(items)
    } catch (error) {
      console.warn("Failed to list portfolio items", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  const itemsWithMeta = useMemo(
    () =>
      remoteItems.map((item) => {
        const meta = parsePortfolioMeta(item.name)
        return {
          ...item,
          category: meta.category,
          isFeatured: meta.isFeatured,
          displayName: meta.displayName,
        }
      }),
    [remoteItems]
  )

  const itemsByCategory = useMemo(() => {
    const grouped = portfolioCategories.reduce((accumulator, category) => {
      accumulator[category.id] = []
      return accumulator
    }, {})

    itemsWithMeta.forEach((item) => {
      const categoryId =
        portfolioCategories.find((category) => category.id === item.category)?.id ||
        "motion-saas"
      grouped[categoryId].push(item)
    })

    return grouped
  }, [itemsWithMeta])

  const displayItemsByCategory = useMemo(() => {
    return portfolioCategories.reduce((accumulator, category) => {
      const items = itemsByCategory[category.id] || []
      if (items.length > 0) {
        accumulator[category.id] = items
      } else {
        accumulator[category.id] = [
          {
            name: `placeholder-${category.id}`,
            type: "placeholder",
            label: category.label,
          },
        ]
      }
      return accumulator
    }, {})
  }, [itemsByCategory])

  useEffect(() => {
    setActiveIndexByCategory((prev) => {
      let hasChanges = false
      const next = { ...prev }

      portfolioCategories.forEach((category) => {
        const items = displayItemsByCategory[category.id] || []
        const existingIndex = prev[category.id]
        const featuredIndex = items.findIndex((item) => item.isFeatured)
        const fallbackIndex = featuredIndex >= 0 ? featuredIndex : 0

        if (existingIndex === undefined) {
          next[category.id] = fallbackIndex
          hasChanges = true
          return
        }

        if (existingIndex >= items.length) {
          next[category.id] = fallbackIndex
          hasChanges = true
          return
        }

        if (featuredIndex >= 0 && existingIndex !== featuredIndex) {
          next[category.id] = featuredIndex
          hasChanges = true
        }
      })

      return hasChanges ? next : prev
    })
  }, [displayItemsByCategory])

  useEffect(() => {
    portfolioCategories.forEach((category) => {
      const items = displayItemsByCategory[category.id] || []
      const activeIndex = activeIndexByCategory[category.id] ?? 0
      const refs = videoRefsByCategory.current[category.id] || []

      refs.forEach((video, index) => {
        if (!video) {
          return
        }

        if (index === activeIndex && items[index]?.type === "video") {
          const playPromise = video.play()
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {})
          }
        } else {
          video.pause()
        }
      })
    })
  }, [activeIndexByCategory, displayItemsByCategory])

  const handlePrev = (categoryId) => {
    setActiveIndexByCategory((prev) => {
      const currentIndex = prev[categoryId] ?? 0
      return { ...prev, [categoryId]: Math.max(0, currentIndex - 1) }
    })
  }

  const handleNext = (categoryId, maxIndex) => {
    setActiveIndexByCategory((prev) => {
      const currentIndex = prev[categoryId] ?? 0
      return { ...prev, [categoryId]: Math.min(maxIndex, currentIndex + 1) }
    })
  }

  const getCoverflowStyle = (index, activeIndex) => {
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

  const handleEnterFullscreen = () => {
    const video = modalVideoRef.current
    if (!video) {
      return
    }

    const requestFullscreen =
      video.requestFullscreen ||
      video.webkitRequestFullscreen ||
      video.mozRequestFullScreen ||
      video.msRequestFullscreen

    if (requestFullscreen) {
      requestFullscreen.call(video)
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

            {portfolioCategories.map((category) => {
              const displayItems = displayItemsByCategory[category.id] || []
              const activeIndex = activeIndexByCategory[category.id] ?? 0
              const maxIndex = Math.max(0, displayItems.length - 1)

              return (
                <div key={category.id} style={{ marginBottom: "56px" }}>
                  <h3
                    style={{
                      font: "600 22px/28px Quicksand, sans-serif",
                      color: "#222",
                      marginBottom: "20px",
                      textAlign: "center",
                    }}
                  >
                    {category.label}
                  </h3>
                  <div className="coverflow-row">
                    {displayItems.length > 1 && (
                      <button
                        type="button"
                        className="portfolio-arrow"
                        onClick={() => handlePrev(category.id)}
                        disabled={activeIndex === 0}
                        aria-label="Previous"
                      >
                        ←
                      </button>
                    )}
                    <div className="coverflow">
                      {displayItems.map((item, index) => (
                        <div
                          key={`${category.id}-${item.name}`}
                          className="portfolio-card coverflow-item"
                          style={{
                            backgroundColor: "#d9d9d9",
                            cursor: "pointer",
                            overflow: "hidden",
                            ...getCoverflowStyle(index, activeIndex),
                          }}
                          onClick={() => {
                            if (item.type === "video" && index === activeIndex) {
                              const video =
                                videoRefsByCategory.current[category.id]?.[index]
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
                          {item.type === "video" && index === activeIndex && (
                            <button
                              type="button"
                              className="portfolio-expand"
                              aria-label="Open fullscreen player"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedItem(item)
                              }}
                            >
                              ⤢
                            </button>
                          )}
                          {item.type === "video" ? (
                            <video
                              src={item.src}
                              loop
                              muted
                              playsInline
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              ref={(node) => {
                                if (!videoRefsByCategory.current[category.id]) {
                                  videoRefsByCategory.current[category.id] = []
                                }
                                videoRefsByCategory.current[category.id][index] = node
                              }}
                            />
                          ) : item.type === "image" ? (
                            <img
                              src={item.src}
                              alt={item.displayName || item.name}
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
                        onClick={() => handleNext(category.id, maxIndex)}
                        disabled={activeIndex >= maxIndex}
                        aria-label="Next"
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
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
            {selectedItem.type === "video" && (
              <button
                type="button"
                onClick={handleEnterFullscreen}
                aria-label="Enter fullscreen"
                style={{
                  position: "absolute",
                  right: "56px",
                  top: "12px",
                  background: "rgba(255, 255, 255, 0.9)",
                  border: "none",
                  borderRadius: "999px",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  fontSize: "16px",
                  lineHeight: "36px",
                  zIndex: 2,
                }}
              >
                ⤢
              </button>
            )}
            {selectedItem.type === "video" ? (
              <video
                src={selectedItem.src}
                controls
                autoPlay
                playsInline
                style={{ width: "100%", height: "100%", maxHeight: "85vh", objectFit: "contain" }}
                ref={modalVideoRef}
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
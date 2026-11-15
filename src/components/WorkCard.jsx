import { useRef } from "react"

export const PlayIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" />
  </svg>
)

// One project card: thumbnail, category tag, title.
// Videos play (muted) while the mouse is over the card.
export default function WorkCard({ item, tag, onOpen }) {
  const videoRef = useRef(null)

  const play = () => {
    const promise = videoRef.current?.play()
    if (promise && typeof promise.catch === "function") promise.catch(() => {})
  }
  const pause = () => videoRef.current?.pause()

  const handleClick = () => {
    if (item.type === "link") {
      if (item.url) window.open(item.url, "_blank", "noopener,noreferrer")
      return
    }
    onOpen(item)
  }

  const image = item.type === "image" ? item.src : item.thumbnailUrl
  const hasMedia = item.type === "video" || Boolean(image)

  return (
    <button
      type="button"
      className="cd-card"
      onClick={handleClick}
      onMouseEnter={play}
      onMouseLeave={pause}
      onFocus={play}
      onBlur={pause}
      aria-label={`Open ${item.title}`}
    >
      <span className={`cd-thumb ${hasMedia ? "" : "is-empty"}`}>
        {item.type === "video" ? (
          <video
            ref={videoRef}
            src={item.poster ? item.src : `${item.src}#t=0.1`}
            poster={item.poster || undefined}
            muted
            loop
            playsInline
            preload={item.poster ? "none" : "metadata"}
          />
        ) : image ? (
          <img src={image} alt="" loading="lazy" />
        ) : null}
        {tag && <span className="cd-tag cd-mono">{tag}</span>}
        {item.type !== "image" && item.type !== "link" && (
          <span className="cd-play">
            <PlayIcon />
          </span>
        )}
      </span>
      <span className="cd-meta-text">
        <span className="cd-title">{item.title}</span>
        <span className="cd-muted">{item.kindLabel}</span>
      </span>
    </button>
  )
}

import { useEffect } from "react"

// Full-screen viewer for a video, image, or YouTube/Vimeo embed.
export default function MediaModal({ item, onClose }) {
  useEffect(() => {
    if (!item) return undefined
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [item, onClose])

  if (!item) return null

  return (
    <div className="cd-modal" role="dialog" aria-modal="true" aria-label={item.title} onClick={onClose}>
      <div className="cd-modal-box" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="cd-modal-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        {item.type === "embed" ? (
          <iframe
            src={item.embedUrl}
            title={item.title || "Video"}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : item.type === "video" ? (
          <video src={item.src} controls autoPlay playsInline />
        ) : (
          <img src={item.src} alt={item.title || ""} />
        )}
      </div>
    </div>
  )
}

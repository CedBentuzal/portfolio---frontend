import { useEffect, useMemo, useState } from "react"

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "")

// Categories shown on the site. "Static visuals" and "Brand" were removed.
export const portfolioCategories = [
  { id: "motion-saas", label: "Motion and SaaS" },
  { id: "shorts", label: "Shorts" },
  { id: "ai-assisted", label: "AI Assisted" },
]

// Old categories: items saved with these ids are hidden from the site.
const removedCategories = ["static-visuals", "brand"]

export const categoryLabel = (id) =>
  portfolioCategories.find((category) => category.id === id)?.label || ""

export const resolveCategory = (rawCategory) => {
  if (removedCategories.includes(rawCategory)) return null
  return (
    portfolioCategories.find((category) => category.id === rawCategory)?.id ||
    "motion-saas"
  )
}

export const parsePortfolioMeta = (name = "") => {
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

  return { category: "motion-saas", isFeatured: false, displayName: baseName }
}

// "1739000000000_my-cool_video" -> "my cool video"
export const cleanTitle = (value = "") =>
  value
    .replace(/^\d{10,}_/, "")
    .replace(/\.[a-z0-9]{2,4}$/i, "")
    .replace(/[_-]+/g, " ")
    .trim()

const getYouTubeId = (url = "") => {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/)
  return match ? match[1] : ""
}

const getVimeoId = (url = "") => {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match ? match[1] : ""
}

const buildEmbedUrl = (kind, url) => {
  if (kind === "youtube") {
    const id = getYouTubeId(url)
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0` : ""
  }
  if (kind === "vimeo") {
    const id = getVimeoId(url)
    return id ? `https://player.vimeo.com/video/${id}?autoplay=1&playsinline=1` : ""
  }
  return ""
}

const buildThumbnailUrl = (kind, url) => {
  if (kind === "youtube") {
    const id = getYouTubeId(url)
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ""
  }
  if (kind === "vimeo") {
    const id = getVimeoId(url)
    return id ? `https://vumbnail.com/${id}.jpg` : ""
  }
  return ""
}

// Cloudinary can make a still image from a video by changing the file ending.
const buildVideoPoster = (src = "") =>
  /res\.cloudinary\.com\/.+\/video\/upload\//.test(src)
    ? src.replace(/\.(mp4|webm|mov|m4v)(\?.*)?$/i, ".jpg")
    : ""

const fromCloudinary = (item) => {
  const meta = parsePortfolioMeta(item.name)
  const category = resolveCategory(meta.category)
  if (!category) return null
  const type = item.type === "image" ? "image" : "video"
  return {
    key: `cloudinary-${item.name}`,
    category,
    createdAt: Date.parse(item.created_at) || 0,
    // The title typed in the admin panel wins; the file name is the fallback.
    title: (item.title || "").trim() || cleanTitle(meta.displayName) || "Untitled",
    kindLabel: type === "image" ? "Image" : "Video",
    type,
    src: item.src,
    poster: type === "video" ? buildVideoPoster(item.src) : "",
  }
}

const fromExternal = (link) => {
  const category = resolveCategory(link.category)
  if (!category) return null
  const kind = link.kind || "video"
  const base = {
    key: `external-${link.id}`,
    category,
    createdAt: Number(link.createdAt) || 0,
  }

  if (kind === "image") {
    return { ...base, title: link.title || "Image", kindLabel: "Image", type: "image", src: link.url }
  }
  if (kind === "video") {
    return { ...base, title: link.title || "Video", kindLabel: "Video", type: "video", src: link.url, poster: "" }
  }
  if (kind === "behance") {
    return {
      ...base,
      title: link.title || "Behance project",
      kindLabel: "Behance",
      type: "link",
      url: link.url,
      thumbnailUrl: link.thumbnailUrl || "",
    }
  }
  if (kind === "youtube" || kind === "vimeo") {
    const embedUrl = buildEmbedUrl(kind, link.url)
    if (!embedUrl) return null
    return {
      ...base,
      title: link.title || (kind === "youtube" ? "YouTube video" : "Vimeo video"),
      kindLabel: kind === "youtube" ? "YouTube" : "Vimeo",
      type: "embed",
      embedUrl,
      thumbnailUrl: link.thumbnailUrl || buildThumbnailUrl(kind, link.url),
    }
  }
  return null
}

const fetchItems = async (path) => {
  const response = await fetch(`${backendBaseUrl}${path}`)
  if (!response.ok) throw new Error(`Failed to load ${path}`)
  const data = await response.json()
  return (data.items || []).filter(Boolean)
}

// Loads uploads + external links and returns one flat list, newest first.
export default function usePortfolioItems() {
  const [remoteItems, setRemoteItems] = useState([])
  const [externalLinks, setExternalLinks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.allSettled([
      fetchItems("/api/cloudinary-list"),
      fetchItems("/api/external-links"),
    ]).then(([uploads, links]) => {
      if (cancelled) return
      if (uploads.status === "fulfilled") setRemoteItems(uploads.value)
      else console.warn("Failed to list portfolio items", uploads.reason)
      if (links.status === "fulfilled") setExternalLinks(links.value)
      else console.warn("Failed to list external links", links.reason)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const items = useMemo(() => {
    return [...externalLinks.map(fromExternal), ...remoteItems.map(fromCloudinary)]
      .filter(Boolean)
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [remoteItems, externalLinks])

  return { items, isLoading }
}

import { useCallback, useMemo, useState } from "react"
import ThemeToggle from "../components/ThemeToggle"
import {
  cleanTitle,
  parsePortfolioMeta,
  portfolioCategories,
  resolveCategory,
  resolveShortsType,
  shortsTypes,
} from "../hooks/usePortfolioItems"
import "../admin.css"

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "")

const linkKinds = [
  { id: "youtube", label: "YouTube" },
  { id: "vimeo", label: "Vimeo" },
  { id: "video", label: "Direct video" },
]

const kindLabels = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  video: "Video link",
  image: "Image link",
  behance: "Behance",
}

const readError = async (response, fallback) => {
  const body = await response.json().catch(() => null)
  return body?.error?.message || body?.error || fallback
}

// Dropdown for the Shorts type. "No type" items show only under "Show all".
function ShortsTypeSelect({ value, onChange, ...rest }) {
  return (
    <select className="ad-input" value={value} onChange={(event) => onChange(event.target.value)} {...rest}>
      <option value="">No type (Show all only)</option>
      {shortsTypes.map((type) => (
        <option key={type.id} value={type.id}>
          {type.label}
        </option>
      ))}
    </select>
  )
}

// One uploaded file or link: edit its title (and Shorts type), or delete it.
function ItemRow({ entry, onSave, onDelete }) {
  const [title, setTitle] = useState(entry.title)
  const [subcategory, setSubcategory] = useState(entry.subcategory)
  const [isBusy, setIsBusy] = useState(false)
  const isShort = entry.category === "shorts"
  const hasChanged = title.trim() !== entry.title || subcategory !== entry.subcategory

  const save = async (event) => {
    event.preventDefault()
    setIsBusy(true)
    await onSave(entry, title.trim(), subcategory)
    setIsBusy(false)
  }

  const remove = async () => {
    setIsBusy(true)
    await onDelete(entry)
    setIsBusy(false)
  }

  return (
    <form className="ad-row" onSubmit={save}>
      <span className="ad-kind cd-mono">{entry.kindLabel}</span>
      <input
        className="ad-input"
        type="text"
        value={title}
        maxLength={120}
        aria-label="Title shown on the site"
        placeholder="Title shown on the site"
        onChange={(event) => setTitle(event.target.value)}
      />
      {isShort && (
        <ShortsTypeSelect
          value={subcategory}
          onChange={setSubcategory}
          aria-label="Shorts type"
          style={{ flex: "0 0 190px" }}
        />
      )}
      <button type="submit" className="ad-small" disabled={!hasChanged || isBusy}>
        Save
      </button>
      <button type="button" className="ad-small ad-small--danger" disabled={isBusy} onClick={remove}>
        Delete
      </button>
    </form>
  )
}

export default function Admin() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [status, setStatus] = useState("")

  const [uploads, setUploads] = useState([])
  const [links, setLinks] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const [file, setFile] = useState(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadCategory, setUploadCategory] = useState("motion-saas")
  const [uploadSubcategory, setUploadSubcategory] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const [linkTitle, setLinkTitle] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkCategory, setLinkCategory] = useState("motion-saas")
  const [linkSubcategory, setLinkSubcategory] = useState("")
  const [linkKind, setLinkKind] = useState("youtube")

  const post = useCallback(
    (path, body) =>
      fetch(`${backendBaseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ...body }),
      }),
    [email, password]
  )

  const loadAll = useCallback(async () => {
    setIsLoading(true)
    try {
      const [uploadResponse, linkResponse] = await Promise.all([
        fetch(`${backendBaseUrl}/api/cloudinary-list`),
        fetch(`${backendBaseUrl}/api/external-links`),
      ])
      if (!uploadResponse.ok || !linkResponse.ok) throw new Error("Unable to load your work.")
      const [uploadData, linkData] = await Promise.all([uploadResponse.json(), linkResponse.json()])
      setUploads((uploadData.items || []).filter(Boolean))
      setLinks((linkData.items || []).filter(Boolean))
    } catch (error) {
      setStatus(error.message || "Unable to load your work.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    setAuthError("")
    setStatus("Signing in...")
    try {
      const response = await post("/api/admin-login", {})
      if (!response.ok) {
        setAuthError("Invalid admin credentials.")
        setStatus("")
        return
      }
      setIsAuthorized(true)
      setStatus("")
      loadAll()
    } catch (error) {
      setAuthError(error.message || "Unable to sign in.")
      setStatus("")
    }
  }

  const handleLogout = () => {
    setIsAuthorized(false)
    setPassword("")
    setStatus("")
  }

  // Uploads and links in one list per category.
  const entriesByCategory = useMemo(() => {
    const grouped = Object.fromEntries(portfolioCategories.map((category) => [category.id, []]))

    uploads.forEach((item) => {
      const meta = parsePortfolioMeta(item.name)
      const category = resolveCategory(meta.category)
      if (!category) return
      grouped[category].push({
        key: `upload-${item.publicId || item.name}`,
        source: "upload",
        publicId: item.publicId || `portfolio/${item.name}`,
        type: item.type,
        category,
        subcategory: category === "shorts" ? resolveShortsType(item.subcategory) : "",
        title: (item.title || "").trim() || cleanTitle(meta.displayName),
        kindLabel: item.type === "image" ? "Image" : "Video",
      })
    })

    links.forEach((link) => {
      const category = resolveCategory(link.category)
      if (!category) return
      grouped[category].push({
        key: `link-${link.id}`,
        source: "link",
        id: link.id,
        category,
        subcategory: category === "shorts" ? resolveShortsType(link.subcategory) : "",
        title: link.title || link.url || "",
        kindLabel: kindLabels[link.kind] || "Link",
      })
    })

    return grouped
  }, [uploads, links])

  const handleUpload = async (event) => {
    event.preventDefault()
    if (!file) {
      setStatus("Please choose a file.")
      return
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const publicId = `${uploadCategory}__standard__${Date.now()}_${safeName}`
    const title = uploadTitle.trim()
    const subcategory = uploadCategory === "shorts" ? uploadSubcategory : ""

    setIsUploading(true)
    setStatus("Uploading...")
    try {
      const signatureResponse = await post("/api/cloudinary-signature", {
        folder: "portfolio",
        publicId,
      })
      if (!signatureResponse.ok) {
        setStatus(`Upload failed: ${await readError(signatureResponse, "Unauthorized.")}`)
        return
      }
      const signatureData = await signatureResponse.json()

      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", signatureData.apiKey)
      formData.append("timestamp", signatureData.timestamp)
      formData.append("signature", signatureData.signature)
      formData.append("folder", "portfolio")
      formData.append("public_id", publicId)

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
        { method: "POST", body: formData }
      )
      if (!uploadResponse.ok) {
        setStatus(`Upload failed: ${await readError(uploadResponse, "Upload error")}`)
        return
      }
      const uploaded = await uploadResponse.json()

      let titleProblem = ""
      if (title || subcategory) {
        const titleResponse = await post("/api/cloudinary-update-title", {
          publicId: uploaded.public_id,
          resourceType: uploaded.resource_type,
          title,
          subcategory,
        })
        if (!titleResponse.ok) {
          titleProblem = await readError(titleResponse, "Unable to save title.")
        }
      }

      setStatus(
        titleProblem
          ? `Uploaded, but the title and type were not saved: ${titleProblem}`
          : "✓ Upload complete!"
      )
      setFile(null)
      setUploadTitle("")
      setFileInputKey((previous) => previous + 1)
      loadAll()
    } catch (error) {
      setStatus(`Upload failed: ${error.message || "Upload error"}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddLink = async (event) => {
    event.preventDefault()
    if (!linkUrl.trim()) {
      setStatus("Please enter a URL.")
      return
    }

    setStatus("Saving link...")
    try {
      const response = await post("/api/external-links", {
        action: "create",
        title: linkTitle.trim(),
        url: linkUrl.trim(),
        category: linkCategory,
        subcategory: linkCategory === "shorts" ? linkSubcategory : "",
        kind: linkKind,
      })
      if (!response.ok) {
        setStatus(`Save failed: ${await readError(response, "Unable to save link.")}`)
        return
      }
      setStatus("✓ Link saved!")
      setLinkTitle("")
      setLinkUrl("")
      loadAll()
    } catch (error) {
      setStatus(`Save failed: ${error.message || "Save error"}`)
    }
  }

  const handleSave = async (entry, title, subcategory) => {
    if (entry.source === "link" && !title) {
      setStatus("A link needs a title.")
      return
    }

    setStatus("Saving...")
    try {
      const response =
        entry.source === "upload"
          ? await post("/api/cloudinary-update-title", {
              publicId: entry.publicId,
              resourceType: entry.type,
              title,
              subcategory,
            })
          : await post("/api/external-links", { action: "update", id: entry.id, title, subcategory })
      if (!response.ok) {
        setStatus(`Not saved: ${await readError(response, "Unable to save.")}`)
        return
      }
      setStatus("✓ Saved!")
      await loadAll()
    } catch (error) {
      setStatus(`Not saved: ${error.message || "Save error"}`)
    }
  }

  const handleDelete = async (entry) => {
    const confirmed = window.confirm(`Delete "${entry.title || "this item"}"? This cannot be undone.`)
    if (!confirmed) return

    setStatus("Deleting...")
    try {
      const response =
        entry.source === "upload"
          ? await post("/api/cloudinary-delete", {
              publicId: entry.publicId,
              resourceType: entry.type,
            })
          : await post("/api/external-links", { action: "delete", id: entry.id })
      if (!response.ok) {
        setStatus(`Delete failed: ${await readError(response, "Unable to delete.")}`)
        return
      }
      setStatus("✓ Deleted!")
      await loadAll()
    } catch (error) {
      setStatus(`Delete failed: ${error.message || "Delete error"}`)
    }
  }

  const categoryOptions = portfolioCategories.map((category) => (
    <option key={category.id} value={category.id}>
      {category.label}
    </option>
  ))

  return (
    <div className="cd-site ad-page">
      <div className="ad-wrap">
        <header className="ad-header">
          <div>
            <a className="cd-mono cd-muted" href="/">
              ← Back to site
            </a>
            <h1 className="cd-h2">Admin</h1>
          </div>
          <div className="ad-header-actions">
            <ThemeToggle />
            {isAuthorized && (
              <button type="button" className="cd-btn cd-btn--ghost" onClick={handleLogout}>
                Log out
              </button>
            )}
          </div>
        </header>

        {!isAuthorized ? (
          <form className="ad-card" onSubmit={handleLogin}>
            <h2 className="cd-h3">Sign in</h2>
            <label className="ad-field">
              <span className="cd-mono cd-muted">Email</span>
              <input
                className="ad-input"
                type="email"
                value={email}
                autoComplete="username"
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="ad-field">
              <span className="cd-mono cd-muted">Password</span>
              <input
                className="ad-input"
                type="password"
                value={password}
                autoComplete="current-password"
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button type="submit" className="cd-btn">
              Sign in
            </button>
            {authError && <p className="ad-error">{authError}</p>}
          </form>
        ) : (
          <>
            <form className="ad-card" onSubmit={handleUpload}>
              <h2 className="cd-h3">Add a file</h2>
              <label className="ad-field">
                <span className="cd-mono cd-muted">Title shown on the site</span>
                <input
                  className="ad-input"
                  type="text"
                  value={uploadTitle}
                  maxLength={120}
                  placeholder="Example: Product launch animation"
                  onChange={(event) => setUploadTitle(event.target.value)}
                />
              </label>
              <label className="ad-field">
                <span className="cd-mono cd-muted">Category</span>
                <select
                  className="ad-input"
                  value={uploadCategory}
                  onChange={(event) => setUploadCategory(event.target.value)}
                >
                  {categoryOptions}
                </select>
              </label>
              {uploadCategory === "shorts" && (
                <label className="ad-field">
                  <span className="cd-mono cd-muted">Shorts type</span>
                  <ShortsTypeSelect value={uploadSubcategory} onChange={setUploadSubcategory} />
                </label>
              )}
              <label
                className="ad-drop"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  const droppedFile = event.dataTransfer.files[0]
                  if (droppedFile) setFile(droppedFile)
                }}
              >
                <input
                  key={fileInputKey}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
                <span className="cd-title">{file ? file.name : "Choose or drag a file here"}</span>
                <span className="cd-muted">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Video or image"}
                </span>
              </label>
              <button type="submit" className="cd-btn" disabled={!file || isUploading}>
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </form>

            <form className="ad-card" onSubmit={handleAddLink}>
              <h2 className="cd-h3">Add a video link</h2>
              <label className="ad-field">
                <span className="cd-mono cd-muted">Title shown on the site</span>
                <input
                  className="ad-input"
                  type="text"
                  value={linkTitle}
                  maxLength={120}
                  placeholder="Example: Explainer for a client"
                  onChange={(event) => setLinkTitle(event.target.value)}
                />
              </label>
              <div className="ad-two">
                <label className="ad-field">
                  <span className="cd-mono cd-muted">Category</span>
                  <select
                    className="ad-input"
                    value={linkCategory}
                    onChange={(event) => setLinkCategory(event.target.value)}
                  >
                    {categoryOptions}
                  </select>
                </label>
                <label className="ad-field">
                  <span className="cd-mono cd-muted">Type</span>
                  <select
                    className="ad-input"
                    value={linkKind}
                    onChange={(event) => setLinkKind(event.target.value)}
                  >
                    {linkKinds.map((kind) => (
                      <option key={kind.id} value={kind.id}>
                        {kind.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {linkCategory === "shorts" && (
                <label className="ad-field">
                  <span className="cd-mono cd-muted">Shorts type</span>
                  <ShortsTypeSelect value={linkSubcategory} onChange={setLinkSubcategory} />
                </label>
              )}
              <label className="ad-field">
                <span className="cd-mono cd-muted">URL</span>
                <input
                  className="ad-input"
                  type="url"
                  value={linkUrl}
                  placeholder="https://..."
                  required
                  onChange={(event) => setLinkUrl(event.target.value)}
                />
              </label>
              <button type="submit" className="cd-btn">
                Add link
              </button>
            </form>

            <section className="ad-card">
              <h2 className="cd-h3">Your work</h2>
              <p className="cd-muted">
                Change a title and press Save. For Shorts you can also pick a type.
              </p>
              {isLoading && uploads.length === 0 && links.length === 0 ? (
                <p className="cd-muted">Loading...</p>
              ) : (
                portfolioCategories.map((category) => {
                  const entries = entriesByCategory[category.id] || []
                  return (
                    <div key={category.id} className="ad-group">
                      <span className="cd-mono cd-muted">
                        {category.label} ({entries.length})
                      </span>
                      {entries.length === 0 ? (
                        <p className="cd-muted">Nothing here yet.</p>
                      ) : (
                        entries.map((entry) => (
                          <ItemRow
                            key={entry.key}
                            entry={entry}
                            onSave={handleSave}
                            onDelete={handleDelete}
                          />
                        ))
                      )}
                    </div>
                  )
                })
              )}
            </section>

            <section className="ad-card ad-tips">
              <span className="cd-mono cd-muted">Tips</span>
              <ul>
                <li>Files are stored in Cloudinary under "portfolio/".</li>
                <li>Supported: JPG, PNG, MP4, WebM, MOV.</li>
                <li>If you leave the title empty, the site shows the file name.</li>
              </ul>
            </section>
          </>
        )}

        {status && (
          <p className="ad-status" role="status">
            {status}
          </p>
        )}
      </div>
    </div>
  )
}

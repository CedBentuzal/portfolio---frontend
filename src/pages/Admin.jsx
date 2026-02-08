import { useCallback, useEffect, useMemo, useState } from "react"

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ""
const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || ""
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

export default function Admin() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState("")
  const [fileInputKey, setFileInputKey] = useState(0)
  const [authError, setAuthError] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("motion-saas")
  const [isFeatured, setIsFeatured] = useState(false)
  const [remoteItems, setRemoteItems] = useState([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [highlightStatus, setHighlightStatus] = useState("")
  const [highlightSelection, setHighlightSelection] = useState({})

  const handleLogin = async (event) => {
    event.preventDefault()
    setAuthError("")
    setStatus("Signing in...")

    try {
      const response = await fetch(`${backendBaseUrl}/api/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        setAuthError("Invalid admin credentials.")
        setStatus("")
        return
      }

      setIsAuthorized(true)
      setStatus("Logged in successfully!")
      setTimeout(() => setStatus(""), 2000)
    } catch (error) {
      setAuthError(error.message || "Unable to sign in.")
      setStatus("")
    }
  }

  const handleLogout = () => {
    setStatus("Signing out...")
    setIsAuthorized(false)
    setStatus("")
  }

  const fetchPortfolioItems = useCallback(async () => {
    if (!isAuthorized) {
      return
    }

    setIsLoadingItems(true)
    try {
      const response = await fetch(`${backendBaseUrl}/api/cloudinary-list`)
      if (!response.ok) {
        throw new Error("Failed to load uploads")
      }

      const data = await response.json()
      setRemoteItems((data.items || []).filter(Boolean))
    } catch (error) {
      setHighlightStatus(error.message || "Unable to load uploads.")
    } finally {
      setIsLoadingItems(false)
    }
  }, [backendBaseUrl, isAuthorized])

  useEffect(() => {
    if (isAuthorized) {
      fetchPortfolioItems()
    }
  }, [fetchPortfolioItems, isAuthorized])

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

  useEffect(() => {
    if (!isAuthorized) {
      return
    }

    setHighlightSelection((prev) => {
      let hasChanges = false
      const next = { ...prev }

      portfolioCategories.forEach((category) => {
        const items = itemsByCategory[category.id] || []
        const featuredItem = items.find((item) => item.isFeatured)

        if (!next[category.id]) {
          next[category.id] =
            featuredItem?.publicId || items[0]?.publicId || items[0]?.name || ""
          hasChanges = true
        }
      })

      return hasChanges ? next : prev
    })
  }, [isAuthorized, itemsByCategory])

  const handleUpload = async (event) => {
    event.preventDefault()
    if (!file) {
      setStatus("Please choose a file.")
      return
    }

    if (!isAuthorized) {
      setStatus("Please sign in first.")
      return
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const categorySlug = selectedCategory || "motion-saas"
    const featuredFlag = isFeatured ? "featured" : "standard"
    const publicId = `${categorySlug}__${featuredFlag}__${Date.now()}_${safeName}`

    setStatus("Uploading...")
    try {
      const signatureResponse = await fetch(`${backendBaseUrl}/api/cloudinary-signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          folder: "portfolio",
          publicId,
        }),
      })

      if (!signatureResponse.ok) {
        setStatus("Upload failed: Unauthorized.")
        return
      }

      const signatureData = await signatureResponse.json()
      const uploadCloudName = signatureData.cloudName || cloudName
      const uploadApiKey = signatureData.apiKey || apiKey

      if (!uploadCloudName || !uploadApiKey) {
        setStatus("Upload failed: Missing Cloudinary config.")
        return
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${uploadCloudName}/auto/upload`
      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", uploadApiKey)
      formData.append("timestamp", signatureData.timestamp)
      formData.append("signature", signatureData.signature)
      formData.append("folder", "portfolio")
      formData.append("public_id", publicId)

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorBody = await uploadResponse.json().catch(() => null)
        const errorMessage = errorBody?.error?.message || "Upload error"
        setStatus(`Upload failed: ${errorMessage}`)
        return
      }
    } catch (error) {
      setStatus(`Upload failed: ${error.message || "Upload error"}`)
      return
    }

    setStatus("✓ Upload complete!")
    setTimeout(() => setStatus(""), 3000)
    setFile(null)
    setIsFeatured(false)
    setFileInputKey((prev) => prev + 1)
    fetchPortfolioItems()
  }

  const handleSetHighlight = async (categoryId) => {
    if (!isAuthorized) {
      setHighlightStatus("Please sign in first.")
      return
    }

    const publicId = highlightSelection[categoryId]
    if (!publicId) {
      setHighlightStatus("Please choose an item to highlight.")
      return
    }

    const selectedItem = (itemsByCategory[categoryId] || []).find(
      (item) => item.publicId === publicId || item.name === publicId
    )

    setHighlightStatus("Updating highlight...")
    try {
      const response = await fetch(`${backendBaseUrl}/api/cloudinary-update-featured`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          category: categoryId,
          publicId,
          resourceType: selectedItem?.type,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        const errorMessage = errorBody?.error || "Unable to update highlight."
        setHighlightStatus(`Update failed: ${errorMessage}`)
        return
      }

      setHighlightStatus("✓ Highlight updated!")
      setTimeout(() => setHighlightStatus(""), 3000)
      fetchPortfolioItems()
    } catch (error) {
      setHighlightStatus(`Update failed: ${error.message || "Update error"}`)
    }
  }

  const handleDeleteItem = async (categoryId) => {
    if (!isAuthorized) {
      setHighlightStatus("Please sign in first.")
      return
    }

    const publicId = highlightSelection[categoryId]
    if (!publicId) {
      setHighlightStatus("Please choose an item to delete.")
      return
    }

    const selectedItem = (itemsByCategory[categoryId] || []).find(
      (item) => item.publicId === publicId || item.name === publicId
    )

    const displayName = selectedItem?.displayName || selectedItem?.name || publicId
    const confirmed = window.confirm(`Delete "${displayName}"? This cannot be undone.`)
    if (!confirmed) {
      return
    }

    setHighlightStatus("Deleting...")
    try {
      const response = await fetch(`${backendBaseUrl}/api/cloudinary-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          publicId,
          resourceType: selectedItem?.type,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        const errorMessage = errorBody?.error || "Unable to delete item."
        setHighlightStatus(`Delete failed: ${errorMessage}`)
        return
      }

      setHighlightStatus("✓ Item deleted!")
      setTimeout(() => setHighlightStatus(""), 3000)
      fetchPortfolioItems()
    } catch (error) {
      setHighlightStatus(`Delete failed: ${error.message || "Delete error"}`)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, rgb(0, 141, 229) 0%, rgb(0, 100, 180) 100%)",
            padding: "32px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <h1
            style={{
              font: "400 40px/48px Jaro, sans-serif",
              color: "white",
              margin: "0 0 8px 0",
              letterSpacing: "0.5px",
            }}
          >
            Admin Panel
          </h1>
          <p
            style={{
              font: "400 16px/24px Quicksand, sans-serif",
              color: "rgba(255, 255, 255, 0.9)",
              margin: 0,
            }}
          >
            {isAuthorized ? `Welcome, ${email || "Admin"}` : "Portfolio Management"}
          </p>
          {isAuthorized && (
            <button
              onClick={handleLogout}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                font: "600 14px/20px Quicksand, sans-serif",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"
              }}
            >
              Logout
            </button>
          )}
        </div>

        <div style={{ padding: "32px" }}>
          {!isAuthorized ? (
            <form
              onSubmit={handleLogin}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    font: "700 14px/20px Quicksand, sans-serif",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    font: "400 16px/24px Quicksand, sans-serif",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  placeholder="admin@example.com"
                  required
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgb(0, 141, 229)"
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0"
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    font: "700 14px/20px Quicksand, sans-serif",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    font: "400 16px/24px Quicksand, sans-serif",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  placeholder="Enter your password"
                  required
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgb(0, 141, 229)"
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0"
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "rgb(0, 141, 229)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  font: "700 16px/24px Quicksand, sans-serif",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  marginTop: "8px",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgb(0, 100, 180)"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgb(0, 141, 229)"
                }}
              >
                Sign In
              </button>

              {authError && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#fee",
                    border: "1px solid #fcc",
                    borderRadius: "8px",
                    font: "400 14px/20px Quicksand, sans-serif",
                    color: "#c00",
                  }}
                >
                  {authError}
                </div>
              )}
            </form>
          ) : (
            <form
              onSubmit={handleUpload}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    font: "700 14px/20px Quicksand, sans-serif",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Portfolio Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    font: "400 16px/24px Quicksand, sans-serif",
                    background: "white",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="motion-saas">Motion and SaaS</option>
                  <option value="shorts">Shorts</option>
                  <option value="static-visuals">Static visuals</option>
                </select>
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  font: "600 14px/20px Quicksand, sans-serif",
                  color: "#333",
                }}
              >
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                Set as highlighted front card
              </label>
              <div>
                <label
                  style={{
                    display: "block",
                    font: "700 14px/20px Quicksand, sans-serif",
                    color: "#333",
                    marginBottom: "12px",
                  }}
                >
                  Upload Image or Video
                </label>
                <div
                  style={{
                    border: "2px dashed #d0d0d0",
                    borderRadius: "8px",
                    padding: "24px",
                    textAlign: "center",
                    background: "#fafafa",
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.currentTarget.style.borderColor = "rgb(0, 141, 229)"
                    e.currentTarget.style.background = "#f0f8ff"
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    e.currentTarget.style.borderColor = "#d0d0d0"
                    e.currentTarget.style.background = "#fafafa"
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.currentTarget.style.borderColor = "#d0d0d0"
                    e.currentTarget.style.background = "#fafafa"
                    const droppedFile = e.dataTransfer.files[0]
                    if (droppedFile) setFile(droppedFile)
                  }}
                >
                  <input
                    key={fileInputKey}
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={{ display: "none" }}
                    id="file-input"
                  />
                  <label htmlFor="file-input" style={{ cursor: "pointer" }}>
                    <div
                      style={{
                        font: "400 32px/40px Jaro, sans-serif",
                        color: "rgb(0, 141, 229)",
                        marginBottom: "8px",
                      }}
                    >
                      📁
                    </div>
                    <p
                      style={{
                        font: "600 16px/24px Quicksand, sans-serif",
                        color: "#333",
                        margin: "0 0 4px 0",
                      }}
                    >
                      {file ? file.name : "Choose or drag file here"}
                    </p>
                    <p
                      style={{
                        font: "400 14px/20px Quicksand, sans-serif",
                        color: "#666",
                        margin: 0,
                      }}
                    >
                      {file
                        ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                        : "Images and videos supported"}
                    </p>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={!file}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: !file ? "#ccc" : "rgb(0, 141, 229)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  font: "700 16px/24px Quicksand, sans-serif",
                  cursor: !file ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  if (!file) return
                  e.currentTarget.style.background = "rgb(0, 100, 180)"
                }}
                onMouseOut={(e) => {
                  if (!file) return
                  e.currentTarget.style.background = "rgb(0, 141, 229)"
                }}
              >
                Upload to Portfolio
              </button>
              <div
                style={{
                  marginTop: "8px",
                  padding: "16px",
                  borderRadius: "10px",
                  background: "#f7f9fc",
                  border: "1px solid #e1e7f0",
                }}
              >
                <p
                  style={{
                    font: "700 14px/20px Quicksand, sans-serif",
                    color: "#333",
                    margin: "0 0 12px 0",
                  }}
                >
                  Highlight Front Card
                </p>
                {isLoadingItems ? (
                  <p style={{ margin: 0, font: "400 13px/20px Quicksand, sans-serif" }}>
                    Loading uploads...
                  </p>
                ) : (
                  portfolioCategories.map((category) => {
                    const items = itemsByCategory[category.id] || []
                    const featuredItem = items.find((item) => item.isFeatured)

                    return (
                      <div key={category.id} style={{ marginBottom: "14px" }}>
                        <label
                          style={{
                            display: "block",
                            font: "600 13px/20px Quicksand, sans-serif",
                            color: "#333",
                            marginBottom: "6px",
                          }}
                        >
                          {category.label}
                        </label>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <select
                            value={highlightSelection[category.id] || ""}
                            onChange={(e) =>
                              setHighlightSelection((prev) => ({
                                ...prev,
                                [category.id]: e.target.value,
                              }))
                            }
                            style={{
                              flex: "1 1 240px",
                              minWidth: "220px",
                              maxWidth: "100%",
                              padding: "10px 12px",
                              border: "1px solid #d6dbe3",
                              borderRadius: "8px",
                              font: "400 14px/20px Quicksand, sans-serif",
                              background: "white",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {items.length === 0 && <option value="">No uploads yet</option>}
                            {items.map((item) => (
                              <option key={item.publicId || item.name} value={item.publicId || item.name}>
                                {item.displayName || item.name} ({item.type})
                                {item.isFeatured ? " - current" : ""}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleSetHighlight(category.id)}
                            disabled={items.length === 0}
                            style={{
                              padding: "10px 14px",
                              borderRadius: "8px",
                              border: "none",
                              background: items.length === 0 ? "#ccc" : "rgb(0, 141, 229)",
                              color: "white",
                              font: "600 13px/18px Quicksand, sans-serif",
                              cursor: items.length === 0 ? "not-allowed" : "pointer",
                              flexShrink: 0,
                            }}
                          >
                            Set
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(category.id)}
                            disabled={items.length === 0}
                            style={{
                              padding: "10px 14px",
                              borderRadius: "8px",
                              border: "1px solid #e5b8b8",
                              background: items.length === 0 ? "#f1f1f1" : "#fff5f5",
                              color: "#b00020",
                              font: "600 13px/18px Quicksand, sans-serif",
                              cursor: items.length === 0 ? "not-allowed" : "pointer",
                              flexShrink: 0,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                        <p
                          style={{
                            margin: "6px 0 0 0",
                            font: "400 12px/18px Quicksand, sans-serif",
                            color: "#666",
                          }}
                        >
                          Current: {featuredItem?.displayName || "None"}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </form>
          )}

          {status && (
            <div
              style={{
                marginTop: "20px",
                padding: "12px 16px",
                background: status.includes("failed") ? "#fee" : "#e8f5e9",
                border: `1px solid ${status.includes("failed") ? "#fcc" : "#c8e6c9"}`,
                borderRadius: "8px",
                font: "400 14px/20px Quicksand, sans-serif",
                color: status.includes("failed") ? "#c00" : "#2e7d32",
                textAlign: "center",
              }}
            >
              {status}
            </div>
          )}

          {highlightStatus && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                background: highlightStatus.includes("failed") ? "#fee" : "#e8f5e9",
                border: `1px solid ${highlightStatus.includes("failed") ? "#fcc" : "#c8e6c9"}`,
                borderRadius: "8px",
                font: "400 14px/20px Quicksand, sans-serif",
                color: highlightStatus.includes("failed") ? "#c00" : "#2e7d32",
                textAlign: "center",
              }}
            >
              {highlightStatus}
            </div>
          )}

          {isAuthorized && (
            <div
              style={{
                marginTop: "24px",
                padding: "16px",
                background: "#f5f5f5",
                borderRadius: "8px",
                borderLeft: "4px solid rgb(0, 141, 229)",
              }}
            >
              <p
                style={{
                  font: "600 14px/20px Quicksand, sans-serif",
                  color: "#333",
                  margin: "0 0 8px 0",
                }}
              >
                💡 Tips
              </p>
              <ul
                style={{
                  font: "400 13px/20px Quicksand, sans-serif",
                  color: "#666",
                  margin: 0,
                  paddingLeft: "20px",
                }}
              >
                <li>Files stored in Cloudinary under "portfolio/"</li>
                <li>Supported: JPG, PNG, MP4, WebM, MOV</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

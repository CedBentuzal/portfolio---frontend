import { useState } from "react"

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ""
const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || ""
const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "")

export default function Admin() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState("")
  const [fileInputKey, setFileInputKey] = useState(0)
  const [authError, setAuthError] = useState("")

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
    const publicId = `${Date.now()}_${safeName}`

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
    setFileInputKey((prev) => prev + 1)
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

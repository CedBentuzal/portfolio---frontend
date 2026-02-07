import { useState } from "react"

export default function Contact() {
  const [message, setMessage] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Message:", message)
  }

  return (
    <section id="contact" className="min-h-[70vh] bg-contact-bg reveal-section">
      <main style={{ padding: "50px 24px 80px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <h1
            style={{
              font: "400 48px/48px Jaro, sans-serif",
              color: "black",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Contact
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <h2
              style={{
                font: "700 32px/48px Quicksand, sans-serif",
                color: "rgb(0, 141, 229)",
                marginBottom: "40px",
                textAlign: "left",
                width: "100%",
                maxWidth: "718px",
              }}
            >
              Message me!
            </h2>

            <form
              onSubmit={handleSubmit}
              style={{ marginBottom: "16px", width: "100%", maxWidth: "718px" }}
            >
              <div style={{ position: "relative", width: "100%", maxWidth: "718px" }}>
                <textarea
                  value={message ?? ""}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    width: "100%",
                    height: "162px",
                    backgroundColor: "#fffdfd",
                    borderRadius: "20px",
                    padding: "24px",
                    paddingRight: "80px",
                    resize: "none",
                    outline: "none",
                    border: "none",
                    fontFamily: "Quicksand, sans-serif",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgb(0, 141, 229)"
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "none"
                  }}
                  placeholder="Type your message here..."
                />
                <button
                  type="submit"
                  className="send-button"
                  style={{
                    position: "absolute",
                    right: "24px",
                    bottom: "24px",
                    font: "700 16px/20px Quicksand, sans-serif",
                    color: "#0d0d0d",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                >
                  Send
                </button>
              </div>
            </form>

            <p
              style={{
                font: "700 16px/20px Quicksand, sans-serif",
                color: "#0d0d0d",
                textAlign: "left",
                width: "100%",
                maxWidth: "718px",
              }}
            >
              Direct message me at bentuzalcedlouise@gmail.com
            </p>
          </div>
        </div>
      </main>
    </section>
  )
}

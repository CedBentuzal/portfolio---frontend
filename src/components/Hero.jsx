import heroVideo from "../assets/animation_1.mp4"
import characterImage from "../assets/character.png"

export default function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen bg-white reveal-section hero-video-section"
    >
      <video
        className="hero-video"
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
      />
      <main style={{ padding: "128px 24px 80px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: "32px", position: "relative" }}>
              <img
                src={characterImage}
                alt="Character illustration"
                style={{ width: "181px", height: "321px", objectFit: "cover" }}
              />
            </div>

            <div style={{ maxWidth: "555px", marginBottom: "48px" }}>
              <h1
                className="font-quicksand"
                style={{
                  font: "700 32px/40px Quicksand, sans-serif",
                  color: "rgb(0, 141, 229)",
                  marginBottom: "8px",
                }}
              >
                Hi, welcome.
              </h1>
              <p
                className="font-quicksand"
                style={{
                  font: "500 18px/36px Quicksand, sans-serif",
                  color: "rgb(36, 36, 36)",
                  lineHeight: "normal",
                }}
              >
                I'm a student passionate about system development and motion/graphic design,
                creating both functional apps and eye-catching visuals that bring ideas to life.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <a
                href="#contact"
                className="cta-button"
                style={{
                  backgroundColor: "white",
                  borderRadius: "20px",
                  padding: "12px 28px",
                  boxShadow: "0 4px 4.8px rgba(0, 0, 0, 0.41)",
                  border: "none",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                  textDecoration: "none",
                }}
              >
                <span
                  className="font-quicksand"
                  style={{ font: "500 16px/24px Quicksand, sans-serif", color: "black" }}
                >
                  Let's connect
                </span>
              </a>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <a
                  href="https://www.instagram.com/cdbn.ae/"
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon"
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    backgroundColor: "#fafafa",
                    boxShadow: "0 4px 4px rgba(0, 0, 0, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.2s",
                    textDecoration: "none",
                  }}
                  aria-label="Instagram"
                >
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/3597ced1db266e3369f1e1a42ee0da17c302c8ea?width=44"
                    alt=""
                    style={{ width: "22px", height: "22px" }}
                  />
                </a>

                <a
                  href="https://www.tiktok.com/@ced.ae"
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon"
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    backgroundColor: "#cbcfca",
                    boxShadow: "0 4px 4px rgba(0, 0, 0, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.2s",
                    textDecoration: "none",
                  }}
                  aria-label="TikTok"
                >
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/a82b982e49392695b068d4c89985978294762c08?width=50"
                    alt=""
                    style={{ width: "25px", height: "25px" }}
                  />
                </a>

                <a
                  href="https://www.facebook.com/Bentuzal/"
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon"
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    backgroundColor: "#989898",
                    boxShadow: "0 4px 4px rgba(0, 0, 0, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.2s",
                    textDecoration: "none",
                  }}
                  aria-label="Facebook"
                >
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/fe1a23548766ea880b5e24889ddf29b9ca33c736?width=46"
                    alt=""
                    style={{ width: "23px", height: "23px" }}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>
  )
}

export default function About() {
  return (
    <section id="about" className="min-h-[70vh] bg-about-bg reveal-section">
      <main style={{ padding: "128px 24px 80px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <h1
            className="font-jaro text-black"
            style={{
              color: "rgb(0, 0, 0)",
              marginBottom: "64px",
              font: "400 48px/48px Jaro, sans-serif",
              textAlign: "center",
            }}
          >
            About my service!
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              fontWeight: "400",
              justifyContent: "center",
            }}
          >
            <h2
              className="font-quicksand font-bold text-brand-blue"
              style={{
                color: "rgb(0, 157, 230)",
                height: "40px",
                textAlign: "left",
                marginBottom: "24px",
                font: "700 28px/48px Quicksand, sans-serif",
                width: "100%",
                maxWidth: "578px",
              }}
            >
              Let's Talk!
            </h2>
            <div
              className="font-quicksand font-medium text-brand-text"
              style={{
                color: "rgb(36, 36, 36)",
                fontFamily: "Quicksand, sans-serif",
                fontSize: "18px",
                fontWeight: "500",
                lineHeight: "31px",
                maxWidth: "578px",
                textAlign: "left",
                marginTop: "0",
              }}
            >
              I offer a combination of system development and motion/graphic design services,
              creating functional applications and engaging visuals that help ideas come to life.
              From building user-friendly systems to designing eye-catching motion graphics and
              branding assets, I focus on delivering projects that are both practical and visually
              compelling.
            </div>
          </div>
        </div>
      </main>
    </section>
  )
}

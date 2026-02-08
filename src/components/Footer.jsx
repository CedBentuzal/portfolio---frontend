export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white py-8 reveal-section">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-gray-400">Connect with me on social media</p>
        <div className="mt-4 flex items-center justify-center gap-4">
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
    </footer>
  )
}

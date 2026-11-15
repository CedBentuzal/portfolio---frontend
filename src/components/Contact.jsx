import Footer from "./Footer"

const EMAIL = "bentuzalcedlouise@gmail.com"

export default function Contact() {
  return (
    <section id="contact" className="cd-contact reveal-section">
      <div className="cd-wrap cd-contact-inner">
        <span className="cd-mono cd-muted">(04) Contact</span>

        <h2 className="cd-hero-title">
          Let's make
          <br />
          it <span className="cd-accent">move.</span>
        </h2>

        <div className="cd-contact-row">
          <a className="cd-h3 cd-mail" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          <a className="cd-btn" href={`mailto:${EMAIL}?subject=${encodeURIComponent("Project inquiry")}`}>
            Send a message
          </a>
        </div>

        <Footer />
      </div>
    </section>
  )
}

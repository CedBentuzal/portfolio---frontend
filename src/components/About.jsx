const services = [
  "Motion Graphics",
  "2D Animation",
  "Explainer Videos",
  "AI Assisted Workflows",
]

export default function About() {
  return (
    <section id="about" className="reveal-section">
      <div className="cd-wrap cd-about">
        <div>
          <span className="cd-mono cd-muted">(04) About</span>
          <h2 className="cd-h2">Hi, I'm Ced.</h2>
        </div>

        <div className="cd-about-body">
          <p className="cd-body-l">
            I'm a motion graphics designer and 2D animator based in the Philippines. I turn ideas
            and complex topics into clean, clear animation that is easy to watch and easy to
            understand.
          </p>

          <div>
            {services.map((service, index) => (
              <div key={service} className="cd-service">
                <span className="cd-title">{service}</span>
                <span className="cd-mono cd-muted">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

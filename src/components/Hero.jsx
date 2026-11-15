import heroVideo from "../assets/animation_1.mp4"
import { PlayIcon } from "./WorkCard"

const services = ["Motion Graphics", "2D Animation", "Explainer Videos", "AI Assisted"]

export default function Hero({ onOpen = () => {} }) {
  return (
    <section id="home" className="reveal-section">
      <div className="cd-wrap cd-hero">
        <div className="cd-eyebrow">
          <span className="cd-dot" />
          <span className="cd-mono cd-muted">
            Motion Graphics Designer & 2D Animator — Philippines
          </span>
        </div>

        <h1 className="cd-hero-title">
          Motion design
          <br />
          that <span className="cd-accent">moves</span> people.
        </h1>

        <div className="cd-hero-row">
          <p className="cd-body-l cd-muted">
            I make clean, clear animation for brands, explainers and YouTube channels — from first
            idea to final render.
          </p>
          <div className="cd-cta">
            <a href="#portfolio" className="cd-btn">
              View work
            </a>
            <button
              type="button"
              className="cd-btn cd-btn--ghost"
              onClick={() => onOpen({ type: "video", src: heroVideo, title: "Showreel" })}
            >
              Play showreel
            </button>
          </div>
        </div>

        <button
          type="button"
          className="cd-reel"
          aria-label="Play showreel"
          onClick={() => onOpen({ type: "video", src: heroVideo, title: "Showreel" })}
        >
          <video src={heroVideo} autoPlay loop muted playsInline />
          <span className="cd-play">
            <PlayIcon />
          </span>
          <span className="cd-reel-label cd-mono">Showreel</span>
        </button>
      </div>

      <div className="cd-strip">
        <div className="cd-wrap cd-strip-inner">
          {services.map((service, index) => (
            <span key={service} style={{ display: "contents" }}>
              <span className="cd-mono">{service}</span>
              {index < services.length - 1 && <span className="cd-dot" />}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

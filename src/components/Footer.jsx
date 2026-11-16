const socials = [
  ["Instagram", "https://www.instagram.com/cdbn.ae/"],
  ["TikTok", "https://www.tiktok.com/@ced.ae"],
  ["Facebook", "https://www.facebook.com/Bentuzal/"],
  ["Linkend", "https://www.linkedin.com/in/ced-louise-bentuzal-65a787368/"]
]

export default function Footer() {
  return (
    <footer className="cd-footer">
      <div className="cd-social">
        {socials.map(([label, href]) => (
          <a key={label} className="cd-mono" href={href} target="_blank" rel="noreferrer">
            {label}
          </a>
        ))}
      </div>
    </footer>
  )
}

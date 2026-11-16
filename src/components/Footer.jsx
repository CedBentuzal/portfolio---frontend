const socials = [
  ["Instagram", "https://www.instagram.com/cdbn.ae/"],
  ["TikTok", "https://www.tiktok.com/@ced.ae"],
  ["Facebook", "https://www.facebook.com/Bentuzal/"],
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

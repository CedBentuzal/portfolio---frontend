import { useCallback, useState } from "react"
import Navigation from "../components/Navigation"
import Portfolio from "../components/Portfolio"
import MediaModal from "../components/MediaModal"
import usePortfolioItems from "../hooks/usePortfolioItems"

export default function PortfolioPage() {
  const { items, isLoading } = usePortfolioItems()
  const [selectedItem, setSelectedItem] = useState(null)
  const closeModal = useCallback(() => setSelectedItem(null), [])

  return (
    <div className="cd-site">
      <Navigation />
      <Portfolio
        id="motion-design"
        number="01"
        title="Motion design"
        category="motion-saas"
        items={items}
        isLoading={isLoading}
        onOpen={setSelectedItem}
      />
      <Portfolio
        id="shorts"
        number="02"
        title="Shorts"
        category="shorts"
        tall
        flush
        items={items}
        isLoading={isLoading}
        onOpen={setSelectedItem}
      />
      <MediaModal item={selectedItem} onClose={closeModal} />
    </div>
  )
}

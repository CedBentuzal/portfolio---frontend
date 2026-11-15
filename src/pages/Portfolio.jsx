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
      <Portfolio items={items} isLoading={isLoading} onOpen={setSelectedItem} />
      <MediaModal item={selectedItem} onClose={closeModal} />
    </div>
  )
}

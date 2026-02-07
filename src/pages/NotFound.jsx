import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold mb-4">Page not found</h1>
        <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
        <Link className="text-blue-600 hover:underline" to="/">
          Back to home
        </Link>
      </div>
    </div>
  )
}

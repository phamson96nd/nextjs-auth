import Link from 'next/link'
import { httpRequest } from '@/lib/httpRequest';

const Header = async () => {
  let user = null;
  const response = await httpRequest("GET", "/api/auth/me")
  user = response.data

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow">
      <nav className="space-x-4">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <Link href="/profile" className="hover:text-blue-600">Profile</Link>
      </nav>
      <div className="flex items-center gap-4">
        {user?.name && (
          <span className="text-sm text-gray-700">
            Xin chào, <span className="font-medium">{user.name}</span>
          </span>
        )}
        {user?.name ? (
          <form>
            <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
              Logout
            </button>
          </form>
        ) : (
          <Link href="/login">
            <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
              Login
            </button>
          </Link>
        )}
      </div>
    </header>
  )
}

export default Header;
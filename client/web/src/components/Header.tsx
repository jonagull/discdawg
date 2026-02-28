'use client'

import { useLogout, useUser, useAuthStore } from '@shared'
import Link from 'next/link'

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()
  const { isLoading: isLoadingUser } = useUser()

  const handleLogout = () => {
    logout()
  }

  const loading = isLoading || isLoadingUser

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-semibold hover:opacity-80">
              DiscDawg
            </Link>
            <nav className="hidden md:flex items-center space-x-4">
              <Link
                href="/#how-it-works"
                className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                How it works
              </Link>
              <Link
                href="/#waitlist"
                className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                Get notified
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {loading ? (
              <span className="text-sm text-gray-500">Loading...</span>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-sm text-gray-700">{user.email}</span>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                <div className="flex items-center space-x-2">Login</div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

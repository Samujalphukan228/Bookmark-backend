"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { useState } from "react"

const links = [
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: "🏠",
    },
    {
        href: "/bookmarks",
        label: "Bookmarks",
        icon: "🔖",
    },
    {
        href: "/collections",
        label: "Collections",
        icon: "📁",
    },
    {
        href: "/search",
        label: "Search",
        icon: "🔍",
    },
    {
        href: "/import",
        label: "Import",
        icon: "📥",
    },
]

export default function Sidebar() {

    const pathname = usePathname()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleLogout() {
        setLoading(true)
        try {
            await authApi.logout()
            router.push("/login")
        } catch {
            router.push("/login")
        } finally {
            setLoading(false)
        }
    }

    return (
        <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">

            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">
                    🔖 Bookmarks
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                    Manage your bookmarks
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => {
                    const isActive = pathname === link.href
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <span>{link.icon}</span>
                            <span>{link.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                    <span>🚪</span>
                    <span>{loading ? "Logging out..." : "Logout"}</span>
                </button>
            </div>

        </aside>
    )
}
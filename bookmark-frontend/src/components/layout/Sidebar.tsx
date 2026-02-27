"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { useState } from "react"
import { 
    HiOutlineHome, 
    HiOutlineBookmark, 
    HiOutlineFolder,
    HiOutlineSearch,
    HiOutlineDownload,
    HiOutlineLogout,
    HiX
} from "react-icons/hi"

const links = [
    { href: "/dashboard", label: "Dashboard", icon: HiOutlineHome },
    { href: "/bookmarks", label: "Bookmarks", icon: HiOutlineBookmark },
    { href: "/collections", label: "Collections", icon: HiOutlineFolder },
    { href: "/search", label: "Search", icon: HiOutlineSearch },
    { href: "/import", label: "Import", icon: HiOutlineDownload },
]

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 bottom-0 z-50
                w-[280px] sm:w-64 bg-black
                flex flex-col
                transform transition-transform duration-200 ease-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0
                border-r border-neutral-800
                overflow-hidden
            `}>

                {/* Logo */}
                <div className="h-14 sm:h-16 px-4 sm:px-5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded flex items-center justify-center">
                            <HiOutlineBookmark className="w-4 h-4 text-black" />
                        </div>
                        <span className="font-semibold text-white tracking-tight">Bookmarks</span>
                    </div>

                    <button 
                        onClick={onClose}
                        className="lg:hidden p-2 hover:bg-neutral-900 rounded transition-colors touch-manipulation"
                    >
                        <HiX className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4">
                    <div className="space-y-0.5">
                        {links.map((link) => {
                            const isActive = pathname === link.href
                            const Icon = link.icon
                            
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={onClose}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded text-sm
                                        transition-colors touch-manipulation
                                        ${isActive
                                            ? "bg-white text-black font-medium"
                                            : "text-neutral-400 hover:text-white"
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{link.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-neutral-800">
                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="
                            w-full flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded text-sm
                            text-neutral-400 hover:text-white
                            transition-colors touch-manipulation
                            disabled:opacity-50 disabled:cursor-not-allowed
                        "
                    >
                        <HiOutlineLogout className="w-5 h-5" />
                        <span>{loading ? "Signing out..." : "Logout"}</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
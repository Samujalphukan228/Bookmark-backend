"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { useState, useEffect } from "react"
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

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Close on escape key
    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            window.addEventListener('keydown', handleEscape)
        }

        return () => {
            window.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onClose])

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

    // Close sidebar when route changes
    useEffect(() => {
        onClose()
    }, [pathname, onClose])

    return (
        <>
            {/* Overlay */}
            <div 
                className={`
                    fixed inset-0 bg-black/80 z-40 lg:hidden
                    transition-opacity duration-300
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 bottom-0 z-50
                w-[85vw] max-w-[300px] sm:w-64
                bg-black
                flex flex-col
                transform transition-transform duration-300 ease-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0
                border-r border-neutral-800
                overflow-hidden
                safe-area-inset
            `}
            style={{
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                paddingLeft: 'env(safe-area-inset-left)',
            }}
            >

                {/* Logo */}
                <div className="h-16 px-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
                            <HiOutlineBookmark className="w-5 h-5 text-black" />
                        </div>
                        <span className="font-semibold text-white text-lg tracking-tight">
                            Bookmarks
                        </span>
                    </div>

                    <button 
                        onClick={onClose}
                        className="lg:hidden p-3 -mr-2 hover:bg-neutral-900 rounded-lg transition-colors active:scale-95"
                        aria-label="Close menu"
                    >
                        <HiX className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    <div className="space-y-1">
                        {links.map((link) => {
                            const isActive = pathname === link.href
                            const Icon = link.icon
                            
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`
                                        flex items-center gap-3 px-4 py-3.5 rounded-lg text-[15px]
                                        transition-all duration-200 active:scale-[0.98]
                                        ${isActive
                                            ? "bg-white text-black font-medium"
                                            : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    <span>{link.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-neutral-800 flex-shrink-0">
                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="
                            w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-[15px]
                            text-neutral-400 hover:text-white hover:bg-neutral-900
                            transition-all duration-200 active:scale-[0.98]
                            disabled:opacity-50 disabled:cursor-not-allowed
                        "
                    >
                        <HiOutlineLogout className="w-5 h-5 flex-shrink-0" />
                        <span>{loading ? "Signing out..." : "Logout"}</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
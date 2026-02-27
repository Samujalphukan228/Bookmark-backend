"use client"

import { useEffect, useState } from "react"
import { authApi } from "@/lib/api"
import { User } from "@/types"
import { HiOutlineMenu } from "react-icons/hi"

interface NavbarProps {
    onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        authApi.me()
            .then((res) => setUser(res.data))
            .catch(() => {})
    }, [])

    return (
        <header className="h-14 sm:h-16 bg-black border-b border-neutral-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-neutral-900 rounded transition-colors touch-manipulation"
                >
                    <HiOutlineMenu className="w-5 h-5 text-white" />
                </button>

                <span className="text-sm text-neutral-400 hidden sm:block">
                    Welcome back
                </span>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-black text-xs sm:text-sm font-medium">
                            {user?.email?.charAt(0).toUpperCase() || "U"}
                        </span>
                    </div>
                    <span className="text-sm text-neutral-400 hidden md:block">
                        {user?.email || ""}
                    </span>
                </div>
            </div>
        </header>
    )
}
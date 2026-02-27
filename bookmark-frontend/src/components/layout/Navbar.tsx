"use client"

import { useEffect, useState } from "react"
import { authApi } from "@/lib/api"
import { User } from "@/types"

export default function Navbar() {

    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        authApi.me()
            .then((res) => setUser(res.data))
            .catch(() => {})
    }, [])

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">

            <div className="text-sm text-gray-500">
                Welcome back 👋
            </div>

            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-sm text-gray-700 font-medium">
                    {user?.email || ""}
                </span>
            </div>

        </header>
    )
}
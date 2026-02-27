"use client"

import { useState } from "react"
import Sidebar from "../../components/layout/Sidebar"
import Navbar from "../../components/layout/Sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-black">
            {/* Sidebar */}
            <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />

            {/* Main content - offset by sidebar width on desktop */}
            <div className="lg:ml-64">
                {/* Navbar */}
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                {/* Page content */}
                <main>
                    {children}
                </main>
            </div>
        </div>
    )
}
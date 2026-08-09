"use client"

import { useState } from "react"
import Sidebar from "../../components/layout/Sidebar"
import Navbar from "../../components/layout/Navbar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-black">
            <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />

            <div className="lg:ml-64">
                <Navbar onMenuClick={() => setSidebarOpen(true)} /> 

                <main>
                    {children}
                </main>
            </div>
        </div>
    )
}

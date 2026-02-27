"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authApi } from "@/lib/api"
import { HiOutlineBookmark, HiOutlineExclamation } from "react-icons/hi"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            await authApi.login(email, password)
            router.push("/dashboard")
        } catch (err: any) {
            setError(err.response?.data || "Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex flex-col">
            
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
                <div className="w-full max-w-sm">
                    
                    {/* Logo */}
                    <div className="text-center mb-8 sm:mb-10">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded mx-auto flex items-center justify-center mb-4">
                            <HiOutlineBookmark className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                            Sign in to Bookmarks
                        </h1>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-3 px-4 py-3 border border-red-900/50 bg-red-950/20 rounded text-sm text-red-400 mb-6">
                            <HiOutlineExclamation className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm text-neutral-400 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm text-neutral-400">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-neutral-500 hover:text-white transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-2.5 text-sm font-medium rounded hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation mt-6"
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-neutral-400 border-t-black rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                "Continue"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 h-px bg-neutral-800" />
                        <span className="px-4 text-xs text-neutral-600">or</span>
                        <div className="flex-1 h-px bg-neutral-800" />
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                        <p className="text-sm text-neutral-500">
                            Don't have an account?{" "}
                            <Link
                                href="/register"
                                className="text-white hover:underline transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <footer className="py-6 px-4 border-t border-neutral-900">
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-neutral-600">
                    <Link href="/privacy" className="hover:text-white transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="hover:text-white transition-colors">
                        Terms of Service
                    </Link>
                </div>
            </footer>
        </div>
    )
}
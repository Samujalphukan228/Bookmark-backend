"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authApi } from "@/lib/api"
import { HiOutlineBookmark, HiOutlineExclamation, HiOutlineCheck, HiOutlineX } from "react-icons/hi"

export default function RegisterPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const getPasswordStrength = () => {
        if (password.length === 0) return { level: 0, text: "" }
        if (password.length < 6) return { level: 1, text: "Weak" }
        if (password.length < 10) return { level: 2, text: "Good" }
        return { level: 3, text: "Strong" }
    }

    const passwordStrength = getPasswordStrength()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")

        if (password !== confirm) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setLoading(true)

        try {
            await authApi.register(email, password)
            router.push("/login")
        } catch (err: any) {
            setError(err.response?.data || "Registration failed")
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
                            Create your account
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
                            <label className="block text-sm text-neutral-400 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                                placeholder="••••••••"
                            />
                            
                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex gap-1 flex-1">
                                        {[1, 2, 3].map((level) => (
                                            <div 
                                                key={level}
                                                className={`h-1 flex-1 rounded-full transition-colors ${
                                                    passwordStrength.level >= level 
                                                        ? 'bg-white' 
                                                        : 'bg-neutral-800'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-neutral-500">
                                        {passwordStrength.text}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm text-neutral-400 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors pr-10"
                                    placeholder="••••••••"
                                />
                                
                                {/* Password Match Indicator */}
                                {confirm && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {password === confirm ? (
                                            <HiOutlineCheck className="w-4 h-4 text-white" />
                                        ) : (
                                            <HiOutlineX className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Terms Agreement */}
                        <div className="flex items-start gap-3 pt-2">
                            <input 
                                type="checkbox" 
                                required
                                id="terms"
                                className="mt-0.5 w-4 h-4 bg-black border border-neutral-800 rounded focus:ring-0 focus:ring-offset-0 checked:bg-white checked:border-white"
                            />
                            <label htmlFor="terms" className="text-xs text-neutral-500 leading-relaxed">
                                I agree to the{" "}
                                <Link href="/terms" className="text-white hover:underline">
                                    Terms of Service
                                </Link>
                                {" "}and{" "}
                                <Link href="/privacy" className="text-white hover:underline">
                                    Privacy Policy
                                </Link>
                            </label>
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
                                    Creating account...
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

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-sm text-neutral-500">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-white hover:underline transition-colors"
                            >
                                Sign in
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
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authApi } from "@/lib/api"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

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
        <div className="min-h-screen bg-[#FAF9F7] flex">
            
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#1A1A1A] relative overflow-hidden">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 35px,
                            rgba(255,255,255,0.03) 35px,
                            rgba(255,255,255,0.03) 70px
                        )`
                    }} />
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center w-full px-16">
                    <div className="text-center">
                        {/* Elegant Logo Mark */}
                        <div className="mb-8">
                            <div className="w-20 h-20 border border-[#C9A962] mx-auto flex items-center justify-center">
                                <span className="text-[#C9A962] text-3xl font-serif italic">B</span>
                            </div>
                        </div>
                        
                        <h2 className="text-white text-4xl font-light tracking-[0.4em] uppercase mb-4">
                            Maison
                        </h2>
                        <p className="text-[#C9A962] text-sm tracking-[0.3em] uppercase">
                            Bookmark
                        </p>
                        
                        <div className="w-24 h-px bg-[#C9A962] mx-auto mt-12 mb-8" />
                        
                        <p className="text-gray-400 text-xs tracking-[0.2em] uppercase max-w-xs">
                            Curate Your Digital Collection With Elegance
                        </p>
                    </div>
                </div>
                
                {/* Decorative corner elements */}
                <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-[#C9A962]/30" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-[#C9A962]/30" />
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-16">
                        <div className="w-16 h-16 border border-[#1A1A1A] mx-auto flex items-center justify-center mb-6">
                            <span className="text-[#1A1A1A] text-2xl font-serif italic">B</span>
                        </div>
                        <h1 className="text-xl tracking-[0.4em] text-[#1A1A1A] uppercase font-light">
                            Bookmark
                        </h1>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-2xl font-light tracking-[0.2em] text-[#1A1A1A] uppercase">
                            Sign In
                        </h1>
                        <div className="w-12 h-px bg-[#1A1A1A] mx-auto mt-6" />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="border-l-2 border-[#8B0000] bg-[#8B0000]/5 text-[#8B0000] px-6 py-4 text-xs tracking-[0.1em] uppercase mb-10">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-10">
                        
                        {/* Email Field */}
                        <div className="relative">
                            <label 
                                className={`absolute left-0 transition-all duration-300 text-xs tracking-[0.2em] uppercase ${
                                    focusedField === 'email' || email 
                                        ? '-top-6 text-[#1A1A1A]' 
                                        : 'top-3 text-gray-400'
                                }`}
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                required
                                className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 focus:border-[#1A1A1A] focus:outline-none transition-colors duration-300 text-[#1A1A1A] text-sm tracking-wide"
                            />
                            <div className={`absolute bottom-0 left-0 h-px bg-[#1A1A1A] transition-all duration-500 ${
                                focusedField === 'email' ? 'w-full' : 'w-0'
                            }`} />
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <label 
                                className={`absolute left-0 transition-all duration-300 text-xs tracking-[0.2em] uppercase ${
                                    focusedField === 'password' || password 
                                        ? '-top-6 text-[#1A1A1A]' 
                                        : 'top-3 text-gray-400'
                                }`}
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                required
                                className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 focus:border-[#1A1A1A] focus:outline-none transition-colors duration-300 text-[#1A1A1A] text-sm tracking-wide"
                            />
                            <div className={`absolute bottom-0 left-0 h-px bg-[#1A1A1A] transition-all duration-500 ${
                                focusedField === 'password' ? 'w-full' : 'w-0'
                            }`} />
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-xs tracking-[0.15em] text-gray-500 hover:text-[#1A1A1A] transition-colors duration-300 uppercase relative group"
                            >
                                Forgot Password?
                                <span className="absolute bottom-0 left-0 w-0 h-px bg-[#1A1A1A] group-hover:w-full transition-all duration-300" />
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full bg-[#1A1A1A] text-white py-5 text-xs tracking-[0.3em] uppercase overflow-hidden transition-all duration-500 hover:bg-[#2A2A2A] disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10">
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Please Wait
                                    </span>
                                ) : (
                                    "Sign In"
                                )}
                            </span>
                            {/* Hover effect line */}
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C9A962] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-12">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="px-6 text-xs tracking-[0.2em] text-gray-400 uppercase">Or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Register CTA */}
                    <div className="text-center">
                        <p className="text-xs tracking-[0.15em] text-gray-500 uppercase mb-6">
                            New to Bookmark?
                        </p>
                        <Link
                            href="/register"
                            className="group relative inline-block w-full py-5 border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-[0.3em] uppercase text-center overflow-hidden transition-all duration-500 hover:text-white"
                        >
                            <span className="relative z-10">Create Account</span>
                            <span className="absolute inset-0 bg-[#1A1A1A] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        </Link>
                    </div>

                    {/* Footer */}
                    <div className="mt-16 pt-8 border-t border-gray-200">
                        <div className="flex justify-center items-center gap-8 text-xs tracking-[0.1em] text-gray-400 uppercase">
                            <Link href="/privacy" className="hover:text-[#1A1A1A] transition-colors">
                                Privacy
                            </Link>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <Link href="/terms" className="hover:text-[#1A1A1A] transition-colors">
                                Terms
                            </Link>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <Link href="/help" className="hover:text-[#1A1A1A] transition-colors">
                                Help
                            </Link>
                        </div>
                        <p className="text-center text-xs text-gray-300 mt-6 tracking-[0.1em]">
                            © 2024 Bookmark Maison
                        </p>
                    </div>

                </div>
            </div>
        </div>
    )
}
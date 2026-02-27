"use client"

import { useState } from "react"
import { importApi } from "@/lib/api"
import { ImportResult } from "@/types"

export default function ImportPage() {

    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<ImportResult | null>(null)
    const [error, setError] = useState("")

    async function handleImport(e: React.FormEvent) {
        e.preventDefault()
        if (!file) return

        setLoading(true)
        setError("")
        setResult(null)

        try {
            const res = await importApi.import(file)
            setResult(res.data)
        } catch (err: any) {
            setError(err.response?.data || "Import failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Import Bookmarks</h1>
                <p className="text-gray-500 mt-1">
                    Import bookmarks from your browser
                </p>
            </div>

            {/* How to export */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h2 className="font-medium text-blue-900 mb-3">
                    How to export from your browser
                </h2>
                <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-start gap-2">
                        <span className="font-bold">1.</span>
                        <span>Open Chrome / Brave / Firefox / Edge</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="font-bold">2.</span>
                        <span>Go to Bookmark Manager (Ctrl + Shift + O)</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="font-bold">3.</span>
                        <span>Click three dots → Export Bookmarks</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="font-bold">4.</span>
                        <span>Save the HTML file</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="font-bold">5.</span>
                        <span>Upload it below</span>
                    </div>
                </div>
            </div>

            {/* Upload Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <form onSubmit={handleImport} className="space-y-4">

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bookmark HTML File
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                            <input
                                type="file"
                                accept=".html"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer"
                            >
                                <div className="text-4xl mb-3">📥</div>
                                {file ? (
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Click to change file
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            Click to upload file
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            HTML files only
                                        </p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!file || loading}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Importing..." : "Import Bookmarks"}
                    </button>

                </form>
            </div>

            {/* Result */}
            {result && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h2 className="font-semibold text-green-900 mb-4">
                        ✅ Import Complete!
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                                {result.imported}
                            </div>
                            <div className="text-sm text-green-700 mt-1">
                                Imported
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-600">
                                {result.skipped}
                            </div>
                            <div className="text-sm text-yellow-700 mt-1">
                                Skipped (duplicates)
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">
                                {result.collections_created}
                            </div>
                            <div className="text-sm text-blue-700 mt-1">
                                Collections Created
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
"use client"

import { useState } from "react"
import { importApi } from "@/lib/api"
import { ImportResult } from "@/types"
import { 
    HiOutlineUpload, 
    HiOutlineDocument,
    HiOutlineCheck,
    HiOutlineExclamation
} from "react-icons/hi"

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
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                    Import Bookmarks
                </h1>
                <p className="text-sm text-neutral-400 mt-1">
                    Import bookmarks from your browser
                </p>
            </div>

            {/* How to export */}
            <div className="border border-neutral-800 rounded p-4 sm:p-5">
                <h2 className="text-sm font-medium text-white mb-4">
                    How to export from your browser
                </h2>
                <div className="space-y-3 text-sm text-neutral-400">
                    <div className="flex items-start gap-3">
                        <span className="w-5 h-5 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center text-xs text-white flex-shrink-0">1</span>
                        <span>Open Chrome, Brave, Firefox, or Edge</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="w-5 h-5 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center text-xs text-white flex-shrink-0">2</span>
                        <span>Open Bookmark Manager <code className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-300">Ctrl + Shift + O</code></span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="w-5 h-5 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center text-xs text-white flex-shrink-0">3</span>
                        <span>Click the menu (⋮) → Export Bookmarks</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="w-5 h-5 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center text-xs text-white flex-shrink-0">4</span>
                        <span>Save the HTML file</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="w-5 h-5 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center text-xs text-white flex-shrink-0">5</span>
                        <span>Upload it below</span>
                    </div>
                </div>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleImport} className="space-y-4">

                {error && (
                    <div className="flex items-center gap-3 px-4 py-3 border border-red-900/50 bg-red-950/20 rounded text-sm text-red-400">
                        <HiOutlineExclamation className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                        Bookmark HTML File
                    </label>
                    <div className={`border-2 border-dashed rounded p-6 sm:p-8 text-center transition-colors ${
                        file 
                            ? 'border-white bg-neutral-900' 
                            : 'border-neutral-800 hover:border-neutral-700'
                    }`}>
                        <input
                            type="file"
                            accept=".html"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer touch-manipulation block"
                        >
                            {file ? (
                                <div>
                                    <HiOutlineDocument className="w-8 h-8 text-white mx-auto mb-3" />
                                    <p className="text-sm font-medium text-white">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Click to change file
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <HiOutlineUpload className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-neutral-400">
                                        Click to upload file
                                    </p>
                                    <p className="text-xs text-neutral-600 mt-1">
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
                    className="w-full px-4 py-2.5 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                >
                    {loading ? (
                        <span className="inline-flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-neutral-400 border-t-black rounded-full animate-spin" />
                            Importing...
                        </span>
                    ) : (
                        "Import Bookmarks"
                    )}
                </button>

            </form>

            {/* Result */}
            {result && (
                <div className="border border-neutral-800 rounded p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <HiOutlineCheck className="w-4 h-4 text-black" />
                        </div>
                        <h2 className="text-sm font-medium text-white">
                            Import Complete
                        </h2>
                    </div>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 border border-neutral-800 rounded text-center">
                            <div className="text-2xl sm:text-3xl font-semibold text-white tabular-nums">
                                {result.imported}
                            </div>
                            <div className="text-xs text-neutral-500 mt-1">
                                Imported
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 border border-neutral-800 rounded text-center">
                            <div className="text-2xl sm:text-3xl font-semibold text-white tabular-nums">
                                {result.skipped}
                            </div>
                            <div className="text-xs text-neutral-500 mt-1">
                                Skipped
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 border border-neutral-800 rounded text-center">
                            <div className="text-2xl sm:text-3xl font-semibold text-white tabular-nums">
                                {result.collections_created}
                            </div>
                            <div className="text-xs text-neutral-500 mt-1">
                                Collections
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
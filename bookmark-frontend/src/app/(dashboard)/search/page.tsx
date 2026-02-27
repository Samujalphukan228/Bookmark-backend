"use client"

import { useState } from "react"
import { Bookmark, Tag } from "@/types"
import { searchApi, tagApi } from "@/lib/api"
import { getDomain, formatDate } from "@/lib/utils"
import { useEffect } from "react"

export default function SearchPage() {

    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Bookmark[]>([])
    const [tags, setTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [selectedTag, setSelectedTag] = useState<string | null>(null)

    useEffect(() => {
        tagApi.list()
            .then((res) => setTags(res.data))
            .catch(() => {})
    }, [])

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        if (!query.trim()) return
        setLoading(true)
        setSearched(true)
        setSelectedTag(null)

        try {
            const res = await searchApi.search(query)
            setResults(res.data)
        } catch {
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    async function handleTagClick(tag: string) {
        setSelectedTag(tag)
        setQuery("")
        setLoading(true)
        setSearched(true)

        try {
            const res = await tagApi.bookmarksByTag(tag)
            setResults(res.data)
        } catch {
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Search</h1>
                <p className="text-gray-500 mt-1">
                    Search your bookmarks
                </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-3">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search bookmarks..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="text-sm font-medium text-gray-700 mb-3">
                        Browse by Tag
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <button
                                key={tag.name}
                                onClick={() => handleTagClick(tag.name)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                    selectedTag === tag.name
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600"
                                }`}
                            >
                                #{tag.name}
                                <span className={`ml-1 text-xs ${
                                    selectedTag === tag.name
                                        ? "text-blue-200"
                                        : "text-gray-400"
                                }`}>
                                    {tag.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Results */}
            {searched && (
                <div className="space-y-3">

                    {/* Results Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-700">
                            {loading ? "Searching..." : (
                                selectedTag
                                    ? `Bookmarks tagged #${selectedTag}`
                                    : `Results for "${query}"`
                            )}
                        </h2>
                        {!loading && (
                            <span className="text-sm text-gray-500">
                                {results.length} found
                            </span>
                        )}
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="text-center py-12 text-gray-400">
                            Searching...
                        </div>
                    )}

                    {/* Results List */}
                    {!loading && results.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                            {results.map((bookmark) => (
                                <div
                                    key={bookmark.id}
                                    className="p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
                                                🔖
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {bookmark.title}
                                                </h3>
                                                <a
                                                    href={bookmark.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-500 hover:underline"
                                                >
                                                    {getDomain(bookmark.url)}
                                                </a>
                                                {bookmark.description && (
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                        {bookmark.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 flex-shrink-0">
                                            {formatDate(bookmark.created_at)}
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {bookmark.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2 ml-11">
                                            {bookmark.tags.map((tag) => (
                                                <button
                                                    key={tag}
                                                    onClick={() => handleTagClick(tag)}
                                                    className="px-2 py-0.5 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 text-gray-600 rounded-full text-xs transition-colors"
                                                >
                                                    #{tag}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {!loading && results.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-4xl mb-4">🔍</p>
                            <p className="font-medium">No results found</p>
                            <p className="text-sm mt-1">
                                Try a different search term
                            </p>
                        </div>
                    )}

                </div>
            )}

            {/* Empty State */}
            {!searched && (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-4">🔍</p>
                    <p className="font-medium">Search your bookmarks</p>
                    <p className="text-sm mt-1">
                        Search by title, description or URL
                    </p>
                    <p className="text-sm mt-1">
                        Or click a tag above to filter
                    </p>
                </div>
            )}

        </div>
    )
}
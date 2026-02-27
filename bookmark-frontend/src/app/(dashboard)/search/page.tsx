"use client"

import { useState, useEffect } from "react"
import { Bookmark, Tag } from "@/types"
import { searchApi, tagApi } from "@/lib/api"
import { getDomain, formatDate } from "@/lib/utils"
import { 
    HiOutlineSearch, 
    HiOutlineBookmark,
    HiOutlineExternalLink
} from "react-icons/hi"

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
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                    Search
                </h1>
                <p className="text-sm text-neutral-400 mt-1">
                    Search your bookmarks by title, URL, or tags
                </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search bookmarks..."
                        className="w-full pl-10 pr-4 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 transition-colors"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {/* Tags */}
            {tags.length > 0 && (
                <div>
                    <h2 className="text-sm font-medium text-white mb-3">
                        Browse by tag
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <button
                                key={tag.name}
                                onClick={() => handleTagClick(tag.name)}
                                className={`px-3 py-1.5 rounded text-sm transition-colors touch-manipulation ${
                                    selectedTag === tag.name
                                        ? "bg-white text-black"
                                        : "border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                                }`}
                            >
                                #{tag.name}
                                <span className={`ml-1.5 ${
                                    selectedTag === tag.name
                                        ? "text-neutral-600"
                                        : "text-neutral-600"
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
                <div className="space-y-4">

                    {/* Results Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-white">
                            {loading ? "Searching..." : (
                                selectedTag
                                    ? `Tagged with #${selectedTag}`
                                    : `Results for "${query}"`
                            )}
                        </h2>
                        {!loading && (
                            <span className="text-sm text-neutral-500">
                                {results.length} found
                            </span>
                        )}
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="py-12 flex justify-center">
                            <div className="w-5 h-5 border-2 border-neutral-800 border-t-white rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Results List */}
                    {!loading && results.length > 0 && (
                        <div className="border border-neutral-800 rounded divide-y divide-neutral-800">
                            {results.map((bookmark) => (
                                <div
                                    key={bookmark.id}
                                    className="p-4 hover:bg-neutral-900 transition-colors"
                                >
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center flex-shrink-0">
                                            <HiOutlineBookmark className="w-4 h-4 text-neutral-500" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <h3 className="text-sm text-white truncate">
                                                        {bookmark.title}
                                                    </h3>
                                                    <a
                                                        href={bookmark.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-white transition-colors mt-0.5"
                                                    >
                                                        {getDomain(bookmark.url)}
                                                        <HiOutlineExternalLink className="w-3 h-3" />
                                                    </a>
                                                    {bookmark.description && (
                                                        <p className="text-xs text-neutral-500 mt-1.5 line-clamp-1">
                                                            {bookmark.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-xs text-neutral-600 flex-shrink-0 hidden sm:block">
                                                    {formatDate(bookmark.created_at)}
                                                </span>
                                            </div>

                                            {/* Tags */}
                                            {bookmark.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {bookmark.tags.map((tag) => (
                                                        <button
                                                            key={tag}
                                                            onClick={() => handleTagClick(tag)}
                                                            className="px-2 py-0.5 border border-neutral-800 hover:border-neutral-700 text-neutral-500 hover:text-white rounded text-xs transition-colors touch-manipulation"
                                                        >
                                                            #{tag}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {!loading && results.length === 0 && (
                        <div className="py-16 text-center border border-dashed border-neutral-800 rounded">
                            <HiOutlineSearch className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                            <p className="text-sm text-white mb-1">No results found</p>
                            <p className="text-xs text-neutral-500">
                                Try a different search term or tag
                            </p>
                        </div>
                    )}

                </div>
            )}

            {/* Initial State */}
            {!searched && (
                <div className="py-16 sm:py-24 text-center border border-dashed border-neutral-800 rounded">
                    <HiOutlineSearch className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                    <p className="text-sm text-white mb-1">Search your bookmarks</p>
                    <p className="text-xs text-neutral-500">
                        Enter a search term or select a tag above
                    </p>
                </div>
            )}

        </div>
    )
}
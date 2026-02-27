"use client"

import { useEffect, useState } from "react"
import { bookmarkApi } from "@/lib/api"
import { collectionApi } from "@/lib/api"
import { tagApi } from "@/lib/api"
import { Bookmark, Collection, Tag } from "@/types"
import Link from "next/link"
import { formatDate, getDomain } from "@/lib/utils"
import { 
    HiOutlineBookmark, 
    HiOutlineFolder, 
    HiOutlineTag,
    HiOutlineArrowRight,
    HiOutlineExternalLink,
    HiOutlinePlus
} from "react-icons/hi"

export default function DashboardPage() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [collections, setCollections] = useState<Collection[]>([])
    const [tags, setTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [bookmarksRes, collectionsRes, tagsRes] = await Promise.all([
                    bookmarkApi.list(),
                    collectionApi.list(),
                    tagApi.list(),
                ])
                setBookmarks(bookmarksRes.data)
                setCollections(collectionsRes.data)
                setTags(tagsRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-5 h-5 border-2 border-neutral-800 border-t-white rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">

            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                    Dashboard
                </h1>
                <p className="mt-1 text-sm text-neutral-400">
                    Overview of your bookmarks and collections
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
                <div className="p-4 sm:p-6 border border-neutral-800 rounded">
                    <p className="text-xs sm:text-sm text-neutral-400 mb-1 sm:mb-2">Bookmarks</p>
                    <p className="text-2xl sm:text-4xl font-semibold text-white tabular-nums">
                        {bookmarks.length}
                    </p>
                </div>

                <div className="p-4 sm:p-6 border border-neutral-800 rounded">
                    <p className="text-xs sm:text-sm text-neutral-400 mb-1 sm:mb-2">Collections</p>
                    <p className="text-2xl sm:text-4xl font-semibold text-white tabular-nums">
                        {collections.length}
                    </p>
                </div>

                <div className="p-4 sm:p-6 border border-neutral-800 rounded">
                    <p className="text-xs sm:text-sm text-neutral-400 mb-1 sm:mb-2">Tags</p>
                    <p className="text-2xl sm:text-4xl font-semibold text-white tabular-nums">
                        {tags.length}
                    </p>
                </div>
            </div>

            {/* Recent Bookmarks */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium text-white">Recent Bookmarks</h2>
                    <Link
                        href="/bookmarks"
                        className="text-sm text-neutral-400 hover:text-white flex items-center gap-1 transition-colors touch-manipulation"
                    >
                        View all
                        <HiOutlineArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="border border-neutral-800 rounded divide-y divide-neutral-800">
                    {bookmarks.slice(0, 5).map((bookmark) => (
                        <div
                            key={bookmark.id}
                            className="px-4 py-3 sm:py-4 hover:bg-neutral-900 transition-colors touch-manipulation"
                        >
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center flex-shrink-0">
                                    <HiOutlineBookmark className="w-4 h-4 text-neutral-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm text-white truncate">
                                        {bookmark.title}
                                    </h3>
                                    <p className="text-xs text-neutral-500 truncate mt-0.5">
                                        {getDomain(bookmark.url)}
                                    </p>
                                </div>
                                <span className="text-xs text-neutral-600 hidden sm:block">
                                    {formatDate(bookmark.created_at)}
                                </span>
                            </div>
                        </div>
                    ))}

                    {bookmarks.length === 0 && (
                        <div className="px-4 py-12 sm:py-16 text-center">
                            <HiOutlineBookmark className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                            <p className="text-sm text-white mb-1">No bookmarks yet</p>
                            <p className="text-xs text-neutral-500 mb-4">Get started by adding your first bookmark</p>
                            <Link
                                href="/bookmarks"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition-colors touch-manipulation"
                            >
                                <HiOutlinePlus className="w-4 h-4" />
                                Add Bookmark
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Collections */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium text-white">Collections</h2>
                    <Link
                        href="/collections"
                        className="text-sm text-neutral-400 hover:text-white flex items-center gap-1 transition-colors touch-manipulation"
                    >
                        View all
                        <HiOutlineArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {collections.slice(0, 6).map((collection) => (
                        <Link
                            key={collection.id}
                            href={`/collections`}
                            className="p-4 border border-neutral-800 rounded hover:bg-neutral-900 hover:border-neutral-700 transition-colors touch-manipulation"
                        >
                            <div className="flex items-center gap-3">
                                <HiOutlineFolder className="w-5 h-5 text-neutral-500 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm text-white truncate">
                                        {collection.name}
                                    </h3>
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                        {collection.bookmark_count} {collection.bookmark_count === 1 ? 'bookmark' : 'bookmarks'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {collections.length === 0 && (
                        <div className="col-span-full p-12 text-center border border-dashed border-neutral-800 rounded">
                            <HiOutlineFolder className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                            <p className="text-sm text-white mb-1">No collections yet</p>
                            <p className="text-xs text-neutral-500">Organize your bookmarks into collections</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
                <div>
                    <h2 className="text-sm font-medium text-white mb-4">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Link
                                key={tag.name}
                                href={`/search?tag=${tag.name}`}
                                className="px-3 py-1.5 border border-neutral-800 rounded text-sm text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors touch-manipulation"
                            >
                                #{tag.name}
                                <span className="ml-1.5 text-neutral-600">{tag.count}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}
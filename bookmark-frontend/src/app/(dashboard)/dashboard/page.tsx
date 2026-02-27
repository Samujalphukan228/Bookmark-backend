"use client"

import { useEffect, useState } from "react"
import { bookmarkApi } from "@/lib/api"
import { collectionApi } from "@/lib/api"
import { tagApi } from "@/lib/api"
import { Bookmark, Collection, Tag } from "@/types"
import Link from "next/link"
import { formatDate, getDomain } from "@/lib/utils"

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
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview of your bookmarks</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="text-3xl font-bold text-blue-600">
                        {bookmarks.length}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        Total Bookmarks
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="text-3xl font-bold text-green-600">
                        {collections.length}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        Collections
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="text-3xl font-bold text-purple-600">
                        {tags.length}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        Unique Tags
                    </div>
                </div>
            </div>

            {/* Recent Bookmarks */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">
                        Recent Bookmarks
                    </h2>
                    <Link
                        href="/bookmarks"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        View all
                    </Link>
                </div>

                <div className="divide-y divide-gray-100">
                    {bookmarks.slice(0, 5).map((bookmark) => (
                        <div
                            key={bookmark.id}
                            className="p-4 flex items-center justify-between hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm">
                                    🔖
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {bookmark.title}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {getDomain(bookmark.url)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">
                                {formatDate(bookmark.created_at)}
                            </div>
                        </div>
                    ))}

                    {bookmarks.length === 0 && (
                        <div className="p-8 text-center text-gray-400">
                            No bookmarks yet.{" "}
                            <Link
                                href="/bookmarks"
                                className="text-blue-600 hover:underline"
                            >
                                Add your first bookmark
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Collections */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">
                        Collections
                    </h2>
                    <Link
                        href="/collections"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        View all
                    </Link>
                </div>

                <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {collections.slice(0, 6).map((collection) => (
                        <Link
                            key={collection.id}
                            href={`/collections`}
                            className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                            <div className="text-2xl mb-2">📁</div>
                            <div className="text-sm font-medium text-gray-900">
                                {collection.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {collection.bookmark_count} bookmarks
                            </div>
                        </Link>
                    ))}

                    {collections.length === 0 && (
                        <div className="col-span-3 p-8 text-center text-gray-400">
                            No collections yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">
                        Tags
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Link
                                key={tag.name}
                                href={`/search?tag=${tag.name}`}
                                className="px-3 py-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-full text-sm text-gray-600 transition-colors"
                            >
                                #{tag.name}
                                <span className="ml-1 text-xs text-gray-400">
                                    {tag.count}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}
"use client"

import { useEffect, useState } from "react"
import { Bookmark } from "@/types"
import { bookmarkApi } from "@/lib/api"
import BookmarkCard from "@/components/bookmarks/BookmarkCard"
import BookmarkForm from "@/components/bookmarks/BookmarkForm"

export default function BookmarksPage() {

    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)
    const [search, setSearch] = useState("")

    useEffect(() => {
        fetchBookmarks()
    }, [])

    async function fetchBookmarks() {
        try {
            const res = await bookmarkApi.list()
            setBookmarks(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    function handleDelete(id: string) {
        setBookmarks((prev) => prev.filter((b) => b.id !== id))
    }

    function handleEdit(bookmark: Bookmark) {
        setEditingBookmark(bookmark)
        setShowForm(true)
    }

    function handleSuccess(bookmark: Bookmark) {
        if (editingBookmark) {
            setBookmarks((prev) =>
                prev.map((b) => (b.id === bookmark.id ? bookmark : b))
            )
        } else {
            setBookmarks((prev) => [bookmark, ...prev])
        }
        setShowForm(false)
        setEditingBookmark(null)
    }

    function handleCancel() {
        setShowForm(false)
        setEditingBookmark(null)
    }

    const filtered = bookmarks.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.url.toLowerCase().includes(search.toLowerCase())
    )

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bookmarks</h1>
                    <p className="text-gray-500 mt-1">
                        {bookmarks.length} bookmarks total
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    + Add Bookmark
                </button>
            </div>

            {/* Search */}
            <div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter bookmarks..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            {/* Bookmarks Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((bookmark) => (
                        <BookmarkCard
                            key={bookmark.id}
                            bookmark={bookmark}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-400">
                    {search ? (
                        <p>No bookmarks match your search</p>
                    ) : (
                        <div>
                            <p className="text-4xl mb-4">🔖</p>
                            <p className="font-medium">No bookmarks yet</p>
                            <p className="text-sm mt-1">
                                Click Add Bookmark to get started
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <BookmarkForm
                    bookmark={editingBookmark || undefined}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            )}

        </div>
    )
}
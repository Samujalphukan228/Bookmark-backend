"use client"

import { useEffect, useState } from "react"
import { Bookmark } from "@/types"
import { bookmarkApi } from "@/lib/api"
import BookmarkCard from "@/components/bookmarks/BookmarkCard"
import BookmarkForm from "@/components/bookmarks/BookmarkForm"
import { HiOutlinePlus, HiOutlineSearch, HiOutlineBookmark } from "react-icons/hi"

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
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-5 h-5 border-2 border-neutral-800 border-t-white rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                        Bookmarks
                    </h1>
                    <p className="text-sm text-neutral-400 mt-1">
                        {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'} total
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition-colors touch-manipulation"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    <span>Add Bookmark</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search bookmarks..."
                    className="w-full pl-10 pr-4 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 transition-colors"
                />
            </div>

            {/* Bookmarks Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                <div className="py-16 sm:py-24 text-center border border-dashed border-neutral-800 rounded">
                    {search ? (
                        <div>
                            <HiOutlineSearch className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                            <p className="text-sm text-white mb-1">No results found</p>
                            <p className="text-xs text-neutral-500">
                                Try a different search term
                            </p>
                        </div>
                    ) : (
                        <div>
                            <HiOutlineBookmark className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                            <p className="text-sm text-white mb-1">No bookmarks yet</p>
                            <p className="text-xs text-neutral-500 mb-4">
                                Get started by adding your first bookmark
                            </p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition-colors touch-manipulation"
                            >
                                <HiOutlinePlus className="w-4 h-4" />
                                Add Bookmark
                            </button>
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
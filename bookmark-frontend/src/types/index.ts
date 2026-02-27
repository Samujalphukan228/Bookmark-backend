export interface User {
    id: string
    email: string
    created_at: string
}

export interface Bookmark {
    id: string
    title: string
    url: string
    description?: string
    tags: string[]
    collection_id?: string
    created_at: string
    updated_at: string
}

export interface Collection {
    id: string
    name: string
    description?: string
    bookmark_count: number
    created_at: string
    updated_at: string
}

export interface Tag {
    name: string
    count: number
}

export interface CreateBookmarkInput {
    title: string
    url: string
    description?: string
    tags: string[]
    collection_id?: string
}

export interface UpdateBookmarkInput {
    title?: string
    url?: string
    description?: string
    tags?: string[]
    collection_id?: string
}

export interface CreateCollectionInput {
    name: string
    description?: string
}

export interface UpdateCollectionInput {
    name?: string
    description?: string
}

export interface ImportResult {
    message: string
    imported: number
    skipped: number
    collections_created: number
}

export interface ApiError {
    message: string
    status: number
}
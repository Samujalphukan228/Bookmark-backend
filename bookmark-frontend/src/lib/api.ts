import axios from "axios"

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
    withCredentials: true, // Important for cookies
    headers: {
        "Content-Type": "application/json",
    },
})

// Auth
export const authApi = {
    register: (email: string, password: string) =>
        api.post("/auth/register", { email, password }),

    login: (email: string, password: string) =>
        api.post("/auth/login", { email, password }),

    logout: () =>
        api.post("/auth/logout"),

    me: () =>
        api.get("/me"),
}

// Bookmarks
export const bookmarkApi = {
    create: (data: import("@/types").CreateBookmarkInput) =>
        api.post("/bookmarks", data),

    list: () =>
        api.get("/bookmarks"),

    get: (id: string) =>
        api.get(`/bookmarks/${id}`),

    update: (id: string, data: import("@/types").UpdateBookmarkInput) =>
        api.put(`/bookmarks/${id}`, data),

    delete: (id: string) =>
        api.delete(`/bookmarks/${id}`),
}

// Collections
export const collectionApi = {
    create: (data: import("@/types").CreateCollectionInput) =>
        api.post("/collections", data),

    list: () =>
        api.get("/collections"),

    get: (id: string) =>
        api.get(`/collections/${id}`),

    update: (id: string, data: import("@/types").UpdateCollectionInput) =>
        api.put(`/collections/${id}`, data),

    delete: (id: string) =>
        api.delete(`/collections/${id}`),
}

// Tags
export const tagApi = {
    list: () =>
        api.get("/tags"),

    bookmarksByTag: (tag: string) =>
        api.get(`/tags/bookmarks?tag=${tag}`),
}

// Search
export const searchApi = {
    search: (q: string) =>
        api.get(`/search?q=${q}`),
}

// Import
export const importApi = {
    import: (file: File) => {
        const formData = new FormData()
        formData.append("file", file)
        return api.post("/import", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
    },
}

export default api
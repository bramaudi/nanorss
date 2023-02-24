export interface JSONResponse {
    status: "success" | "error"
    message: string | null
    hash: string
    channel?: Feed
    items?: Item[]
}

export interface Feed {
    _id: number
    _hash: string
    
    url: string
    title: string
    description: string
}

export interface Item {
    _id: number
    _feedId: number
    _read: number
    _saved: number

    title: string
    url: string
    author?: {
        name: string
    }
    summary: string
    content: string
    lastModified: string
}
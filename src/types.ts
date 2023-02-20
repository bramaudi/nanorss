export interface JSONResponse {
    status: "success" | "error"
    message: string | null
    channel?: Channel
    items?: Item[]
}

export interface Channel {
    id: number
    
    url: string
    title: string
    link: string
    lastModified: {
        date: string
    }

    description: string
    read_external: number
    view_all: number
}

export interface Item {
    id: number

    title: string
    link: string
    author?: {
        name: string
    }
    summary: string
    content: string
    lastModified: string

    feedId: number
    read: number
    saved: number
}
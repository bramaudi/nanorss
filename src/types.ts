export interface Channel {
    id: number
    
    url: string
    title: string
    link: string

    description: string
    read_external: number
    view_all: number
}

export interface Item {
    id: number

    title: string
    link: string
    content: string
    lastModified: string

    feedId: number
    read: number
    saved: number
}
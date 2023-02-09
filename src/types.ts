export interface Feed {
    id: number
    title: string
    link: string
    description: string
    read_external: number
    view_all: number
}

export interface Item {
    id: number
    feedId: number
    read: number
    pin: number
    bookmark: number

    title: string
    link: string
    description: string // content
    pubDate: string
}
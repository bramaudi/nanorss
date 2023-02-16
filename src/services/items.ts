import db from "../helper/db"
import { Item } from "../types"

const TABLE = db.table('items')

export async function getItemsCount(feedId: number) {
    return await TABLE.where({ feedId }).count()
}

export async function getItemsUnreadCount(feedId: number) {
    return await TABLE.where({ feedId, read: 0 }).count()
}

export async function getItem(id: number) {
    return await db.transaction('r', TABLE, async () => {
        return await TABLE.get(Number(id))
    })
}

export async function readItem(id: number) {
    await db.transaction('rw', TABLE, () => {
        TABLE.where({ id }).modify({ read: 1 })
    })
}

export async function readAllItems(feedId: number) {
    await db.transaction('rw', TABLE, () => {
        TABLE.where({ feedId }).modify({ read: 1 })
    })
}

export async function getItemsByChannel(feedId: number) {
    return TABLE.where({ feedId }).toArray().then((arr: Item[]) =>
        arr
            .sort((a, b) => a.title.localeCompare(b.title, 'en', { numeric: true }))
            .sort((a, b) => (
                new Date(a.lastModified).valueOf() -
                new Date(b.lastModified).valueOf()
            ))
    )
}

export async function updateItem(where: object, data: object) {
    await db.transaction('rw', TABLE, async () => {
        await TABLE.where(where).modify(data)
    })
}

export async function insertItems(feedId: number, items: Item[]) {
    const filtered = items.map(item => ({
        ...item,
        feedId,
        read: 0,
        saved: 0,
    })).reverse() // reverse so latest item get higher DB id

    await db.transaction('rw', TABLE, () => {
        TABLE.bulkAdd(filtered)
    })
}

export async function deleteItems(feedId: number) {
    await db.transaction('rw', TABLE, () => {
        TABLE.where({ feedId }).delete()
    })
}
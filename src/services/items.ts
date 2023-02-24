import { createDexieArrayQuery, createDexieSignalQuery } from "solid-dexie"
import db from "../helper/db"
import { Item } from "../types"

const TABLE = db.table('items')

function sortItemsByDate(items: Item[]) {
    return items
        .sort((a, b) => a.title.localeCompare(b.title, 'en', { numeric: true }))
        .sort((a, b) => (
            new Date(a.lastModified).valueOf() -
            new Date(b.lastModified).valueOf()
        ))
}

export function getAllUnreadItemsCount() {
    return createDexieSignalQuery(
        () => TABLE.where({ _read: 0 }).count()
    )
}

export function getItemsCount(_feedId: number) {
    return createDexieSignalQuery(
        () => TABLE.where({ _feedId }).count()
    )
}

export function getUnreadItemsCount(_feedId: number) {
    return createDexieSignalQuery(
        () => TABLE.where({ _feedId, _read: 0 }).count()
    )
}

export function getItem(id: number) {
    return createDexieSignalQuery(() => TABLE.get(Number(id)))
}

export async function readItem(_id: number) {
    await db.transaction('rw', TABLE, () => {
        TABLE.where({ _id }).modify({ _read: 1 })
    })
}

export async function readAllItems(_feedId: number) {
    await db.transaction('rw', TABLE, () => {
        TABLE.where({ _feedId }).modify({ _read: 1 })
    })
}

export async function getItemsByFeed(_feedId: number) {
    return TABLE.where({ _feedId }).toArray().then(sortItemsByDate)
}

export function getItemsByFeedSignal(_feedId: number) {
    return createDexieArrayQuery(
        () => TABLE.where({ _feedId }).toArray().then(sortItemsByDate)
    )
}

export async function getItems(where: object, offset: number, limit: number) {
    let query = TABLE.where(where).offset(offset)
    if (limit) query = query.limit(limit)
    return query.toArray()
}

export async function updateItem(where: object, data: object) {
    await db.transaction('rw', TABLE, async () => {
        await TABLE.where(where).modify(data)
    })
}

export async function insertItems(_feedId: number, items: Item[]) {
    const filtered = items.map(item => ({
        ...item,
        _feedId,
    })).reverse() // reverse so latest item get higher DB id

    await db.transaction('rw', TABLE, () => {
        TABLE.bulkAdd(filtered)
    })
}

export async function deleteItems(_feedId: number) {
    await db.transaction('rw', TABLE, () => {
        TABLE.where({ _feedId }).delete()
    })
}
import db from "../helper/db";
import { createMutable } from "solid-js/store"
import { Feed, Item, JSONResponse } from "../types";
import { deleteItems, getItemsByFeed, insertItems } from "./items";
import { createDexieSignalQuery } from "solid-dexie";

const PROXY = 'https://rss2json.vercel.app/api?url='
const TABLE = db.table('feeds')

export async function getFeedByUrl(url: string) {
    return await TABLE.where({ url }).first()
}

export async function getFeed(id: number): Promise<Feed> {
    return await TABLE.get(id)
}

export function getFeedSignal(id: number) {
    return createDexieSignalQuery(() => TABLE.get(id))
}

export async function getFeeds() {
    return await TABLE.toArray()
}

export async function fetchFeed(url: string): Promise<JSONResponse> {
    return await fetch(PROXY + url).then(r => r.json())
}

export async function fetchFeedHash(url: string): Promise<JSONResponse> {
    return await fetch(PROXY + url + '&type=hash').then(r => r.json())
}

export async function insertFeed(feed: Feed, items: Item[]) {
    const existingFeed: Feed = await getFeedByUrl(feed.url)
    if (!existingFeed) {
        const lastInsertId = await db.transaction('rw', TABLE, () => TABLE.add(feed) ).then(id => Number(id))
        await insertItems(lastInsertId, items.map((item: Item) => ({...item, _read: 0, _saved: 0})))
    }
    else {
        // Rename existing feed
        const where = { url: existingFeed.url }
        await updateFeed(where, feed)
    }
}

export async function updateFeed(where: object, data: object) {
    await db.transaction('rw', TABLE, () => {
        TABLE.where(where).modify(data)
    })
}

export async function deleteFeed(feedId: number) {
    await db.transaction('rw', TABLE, () => {
        TABLE.delete(feedId)
    })
    await deleteItems(feedId)
}

export async function syncFeed(feedId: number) {
    const feed = await getFeed(feedId)
    const json = await fetchFeed(feed.url)
    const prevItems = await getItemsByFeed(feed._id)
    const updatedItems: Item[] = prevItems || [];

    json.items!.forEach((item: Item) => {
        const index = updatedItems.findIndex(v => v.url === item.url)
        const matchItem = updatedItems[index]
        // Add new item
        if (index <= -1) {
            updatedItems.push({
                ...item,
                _read: 0,
                _saved: 0,
            })
        }
        else {
            // Set new lastModified date as unread
            const newItemDate = new Date(item.lastModified).valueOf()
            const lastItemDate = new Date(matchItem.lastModified).valueOf()
            if (newItemDate > lastItemDate) {
                matchItem._read = 0
            }
        }
    })

    await updateFeed({ _id: feed._id }, {...json.channel!, _hash: json.hash})
    await deleteItems(feed._id)
    await insertItems(feed._id, updatedItems)
}
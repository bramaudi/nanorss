import db from "../helper/db";
import { Channel, Item, JSONResponse } from "../types";
import { deleteItems, getItemsCount, insertItems } from "./items";

const PROXY = 'https://rss2json.vercel.app/api?url='
const TABLE = db.table('feeds')

export async function getChannelByLink(link: string) {
    return await TABLE.where({ link }).first()
}

export async function getChannel(id: number): Promise<Channel> {
    return await TABLE.get(id)
}

export async function getChannels() {
    return await TABLE.toArray()
}

export async function downloadChannel(url: string) {
    const json: JSONResponse = await fetch(PROXY + url).then(r => r.json())
    if (json.status === 'error') alert(json.message)
    return json
}

export async function insertChannel(channel: Channel, items: Item[]) {
    const existingFeed: Channel = await getChannelByLink(channel.link)
    if (!existingFeed) {
        channel = { ...channel, read_external: 0 }
        const lastInsertId = await db.transaction('rw', TABLE, () => TABLE.add(channel) ).then(id => Number(id))
        await insertItems(lastInsertId, items)
    }
    else {
        // Rename existing feed
        const where = { link: existingFeed.link }
        await updateChannel(where, channel)
    }    
}

export async function updateChannel(where: object, data: object) {
    await db.transaction('rw', TABLE, () => {
        TABLE.where(where).modify(data)
    })
}

export async function deleteChannel(feedId: number) {
    await db.transaction('rw', TABLE, () => {
        TABLE.delete(feedId)
    })
    await deleteItems(feedId)
}

export async function fetchChannel(feedId: number, prevItems: Item[]) {
    const feed = await getChannel(feedId)
    const json: JSONResponse = await fetch(PROXY + feed.url).then(r => r.json())

    const updatedItems: Item[] = prevItems;
    json.items!.forEach((item: Item) => {
        const index = updatedItems.findIndex(v => v.link === item.link)
        const matchItem = updatedItems[index]
        // Add new item
        if (index <= -1) {
            updatedItems.push({
                ...item,
                read: 0,
                saved: 0,
            })
        }
        else {
            // Set new lastModified date as unread
            const newItemDate = new Date(item.lastModified).valueOf()
            const lastItemDate = new Date(matchItem.lastModified).valueOf()
            if (newItemDate > lastItemDate) {
                matchItem.read = 0
            }
        }
    })

    await deleteItems(feedId)
    await insertItems(feedId, updatedItems)
}
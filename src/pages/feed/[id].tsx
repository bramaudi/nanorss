import db from "../../db"
import { createEffect, createResource, createSignal, For } from "solid-js"
import { createDexieArrayQuery, createDexieSignalQuery } from "solid-dexie"
import { A, useParams } from "@solidjs/router"
import { Feed, Item } from "../../types"
import { proxyUrl } from "../../consts"

interface ComputedItem extends Item {
    feed: Feed
}

export default function () {
    const params = useParams<{ id: string }>()
    const [viewAll, setViewAll] = createSignal(false)
    const feed = createDexieSignalQuery<Feed>(() => db.table('feeds').get(Number(params.id)))
    const [items, { refetch: refetchItems, mutate: mutateItems }] = createResource<Item[]>(() => {
        return db.table('items').where({ feedId: Number(params.id) }).toArray()
    })

    function markAsRead(item: Item) {
        db.transaction('rw', db.table('items'), () => {
            db.table('items').where({ id: item.id }).modify({ read: 1 })
        })
    }

    function toggleViewAll() {
        setViewAll(v => !v)
        db.transaction('rw', db.table('feeds'), () => {
            db.table('feeds').where({ id: feed()?.id }).modify({ view_all: Number(viewAll()) })
        })
    }

    async function fetchFeed() {
        const resp = await fetch(proxyUrl + feed()!.url)
        const data = await resp.json()
        let itemsNew: Item[] = [];
        data.items.forEach((item: Item) => {
            const index = items()!.findIndex(v => v.link === item.link)
            if (index <= -1) {
                itemsNew.push({
                    ...item,
                    feedId: Number(params.id),
                    read: 0,
                    bookmark: 0,
                })
            }
        })

        await db.transaction('rw', db.table('items'), async () => {
            db.table('items').bulkAdd(itemsNew)
        })

        refetchItems()
    }
    
    createEffect(() => {
        // load saved preferences
        setViewAll(!!feed()?.view_all)
    })

    return (
        <>
            <h2>{feed()?.title}</h2>
            <button onClick={fetchFeed} style={{ "margin-right": '1em' }}>Fetch</button>
            View: 
            {viewAll() ? <strong>All</strong> : <A href="" onClick={toggleViewAll}>All</A>} | 
            {!viewAll() ? <strong>Unread</strong> : <A href="" onClick={toggleViewAll}>Unread</A>}

            <ul class="items">
                <For each={items()?.reverse()}>
                    {(item) => (
                        <li class="item" classList={{ hidden: !viewAll() && !!item.read }}>
                            <span>&rsaquo;</span>
                            <div>
                                <A
                                    href={feed()?.read_external ? item.link : `/item/${item.id}`} onClick={() => markAsRead(item)}
                                    class="title"
                                    classList={{ readed: !!item.read }}
                                >
                                    {item.title}
                                </A>
                                <a class="link" href={item.link}>({new URL(item.link).origin})</a>
                                <span class="meta">
                                    <span class="date">{item.pubDate}</span>
                                </span>
                            </div>
                        </li>
                    )}
                </For>
            </ul>
        </>
    )
}
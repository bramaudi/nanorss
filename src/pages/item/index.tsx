import db from "../../db"
import { createSignal, For } from "solid-js"
import { createDexieArrayQuery, createDexieSignalQuery } from "solid-dexie"
import { A } from "@solidjs/router"
import { Feed, Item } from "../../types"
import { isTrue } from "../../utils"

interface ComputedItem extends Item {
    feed: Feed
}

export default function () {
    const [viewAll, setViewAll] = createSignal(isTrue(localStorage.getItem('view_all')))
    const feeds = createDexieArrayQuery(() => db.table('feeds').toArray())
    const items = createDexieArrayQuery(() => {
        return db.table('items').toArray().then(items => {
            return items.map(item => ({ ...item, feed: feeds.filter(feed => feed.id === item.feedId)[0] }))
                .sort((a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf())
        })
    })

    function markAsRead(item: Item) {
        db.transaction('rw', db.table('items'), () => {
            db.table('items').where({ id: item.id }).modify({ read: 1 })
        })
    }

    function toggleViewAll() {
        setViewAll(v => !v)
        localStorage.setItem('view_all', viewAll().toString())
    }

    return (
        <>
            <h2>Unread items</h2>
            View: 
            {viewAll() ? <strong>All</strong> : <A href="" onClick={toggleViewAll}>All</A>} | 
            {!viewAll() ? <strong>Unread</strong> : <A href="" onClick={toggleViewAll}>Unread</A>}

            <ul class="items">
                <For each={items}>
                    {(item: ComputedItem) => (
                        <li classList={{ hidden: !viewAll() && !!item.read }}>
                            <span>&rsaquo;</span>
                            <div>
                                <A
                                    href={item.feed.read_external ? item.link : `/item/${item.id}`} onClick={() => markAsRead(item)}
                                    classList={{ readed: !!item.read }}
                                >
                                    {item.title}
                                </A>
                                <small>
                                    <a href={item.link}>({new URL(item.link).origin})</a>
                                    <br />
                                    <small>{item.pubDate} - <strong>{item.feed.title}</strong></small>
                                </small>
                            </div>
                        </li>
                    )}
                </For>
            </ul>
        </>
    )
}
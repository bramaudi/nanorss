import db from "../../db"
import { createResource, For } from "solid-js"
import { createDexieArrayQuery } from "solid-dexie"
import { A } from "@solidjs/router"
import AddFeed from "../../components/AddFeed"
import { Feed } from "../../types"

export default function () {
    const feeds = createDexieArrayQuery(() => {
        return db.table('feeds').toArray().then(feeds => {
            return feeds.map((feed: Feed) => {
                return {
                    ...feed,
                    itemCount: ((id: number) => createResource(id, (id: number) => {
                        return db.table('items').where({ feedId: id, read: 0 }).count()
                    })[0])(feed.id)
                }
            })
        })
    })    
    
    async function feedsDelete(feed: Feed) {
        const confirmed = confirm(`Delete feed "${feed.title}"?`)
        if (confirmed) {
            db.transaction('rw', db.table('feeds'), () => {
                db.table('feeds').delete(feed.id)
            })
            db.transaction('rw', db.table('items'), () => {
                db.table('items').where({ feedId: feed.id }).delete()
            })
        }
    }

    return (
        <>
            <AddFeed />
            <ul>
                <For each={feeds}>
                    {feed => (
                        <li class="mr-2 px-2 py-1 flex">
                            <div>
                                <A href={`/feed/${feed.id}`}>
                                    <strong>{feed.title}</strong>
                                </A>
                                <span class="ml-1">({feed.itemCount})</span>
                                <span class="text-xs">
                                    <a href="#" class="ml-2 text-red-700" onclick={() => feedsDelete(feed)}>delete</a>
                                </span>
                                <span class="block text-xs text-slate-600">{new URL(feed.link).host}</span>
                            </div>
                        </li>
                    )}
                </For>
            </ul>
        </>
    )
}
import db from "../db"
import { createSignal, Show } from "solid-js"
import { proxyUrl } from "../consts"
import { Feed, Item } from "../types"

export default function AddFeed() {
    // const [url, setUrl] = createSignal('https://news.ycombinator.com/rss')
    const [url, setUrl] = createSignal('https://lukesmith.xyz/index.xml')
    const [loading, setLoading] = createSignal(false)
    const [feed, setFeed] = createSignal<Feed>()
    const [items, setItems] = createSignal<Item[]>()

    async function feedsAdd(e: SubmitEvent) {
        e.preventDefault()
        setLoading(true)

        await fetch(proxyUrl + url())
            .then(response => (response.json()))
            .then(json => {
                const { title, link, description, item } = json.channel
                setFeed({ id: 0, title, link, description, read_external: 0, view_all: 0 })
                setItems(item)
            })

        setLoading(false)
    }

    async function feedsInsert() {
        let lastId = await db.transaction('rw', db.table('feeds'), () => {
            const { title, link, description } = feed() as Feed
            return db.table('feeds').add({
                title,
                link,
                description,
                read_external: 0
            })
        })

        // Add items
        await db.transaction('rw', db.table('items'), () => {
            const itemslist = items()!
                .map(item => ({
                    ...item,
                    feedId: lastId,
                    read: 0,
                    pin: 0,
                    bookmark: 0,
                }))

            db.table('items').bulkAdd(itemslist)
        })

        setFeed(undefined)
    }

    return (
        <>
            <form onsubmit={feedsAdd} class="flex p-2">
                <input
                    autocomplete="on"
                    onInput={e => setUrl(e.currentTarget.value)}
                    value={url()}
                    class="w-full p-2 rounded"
                />
                <button class="ml-2 p-2 rounded bg-orange-900 text-white">Find</button>
            </form>
            <div class="px-2">
                <Show when={loading()}>Fetching ...</Show>
                <Show when={feed()?.title}>
                    <div tabIndex={1} class="p-2 rounded cursor-pointer bg-slate-200" onclick={() => feedsInsert()}>
                        <strong>{feed()!.title}</strong>
                        <small class="block text-gray-500">{feed()!.link}</small>
                        <p>{feed()!.description}</p>
                    </div>
                </Show>
            </div>
        </>
    )
}
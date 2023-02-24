import { createResource, createSignal, For, Show } from "solid-js"
import { A } from "@solidjs/router"
import AddFeed from "../../components/AddFeed"
import { Feed } from "../../types"
import { syncFeed, fetchFeed, getFeeds, fetchFeedHash } from "../../services/feed"
import { getItemsByFeed, getItemsCount, getUnreadItemsCount } from "../../services/items"
import { sleep } from "../../helper/utils"

export default function () {
    const [loading, setLoading] = createSignal('')
    const [feeds, { refetch }] = createResource<Feed[]>(() => getFeeds())
    
    async function handlerSyncFeeds() {
        let done = 0
        setLoading(`Sync (${done}/${feeds()?.length}) ...`)
        for (const feed of feeds()!) {
            const json = await fetchFeedHash(feed.url)
            if (json.hash !== feed._hash) {
                await sleep(300) // Throttle api call
                await syncFeed(feed._id)
            }
            done++
            setLoading(`Sync (${done}/${feeds()?.length}) ...`)
        }
        await sleep(1000)
        refetch()
        setLoading('')
    }

    return (
        <>
            <AddFeed onInsert={refetch}/>
            <div style={{ margin: '0 0 -1.5em 0', "text-align": 'right' }}>
                &nbsp;
                <Show when={loading().length}>{loading()}&nbsp;</Show>
                [<a onClick={handlerSyncFeeds}>Sync</a>]
            </div>
            <ul class="items">
                <For each={feeds()?.reverse()}>
                    {feed => (
                        <li class="item">
                            <span>&rsaquo;</span>
                            <div>
                                <A class="title" href={`/feed/${feed._id}`}>
                                    {feed.title}
                                </A>
                                <span class="meta">
                                    <span class="date">({getUnreadItemsCount(feed._id)} / {getItemsCount(feed._id)})</span>
                                </span>
                                <br />
                                <a class="link" href={new URL(feed.url).origin}>({new URL(feed.url).host})</a>
                            </div>
                        </li>
                    )}
                </For>
            </ul>
        </>
    )
}
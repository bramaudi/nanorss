import { createSignal, For, Show } from "solid-js"
import { A, useNavigate, useParams } from "@solidjs/router"
import { Item } from "../../types"
import { deleteFeed, syncFeed, fetchFeedHash, getFeedSignal } from "../../services/feed"
import { getItemsByFeedSignal, readAllItems, readItem } from "../../services/items"
import { formatDate, sleep } from "../../helper/utils"

export default function () {
    const params = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [viewAll, setViewAll] = createSignal(false)
    const [loading, setLoading] = createSignal('')
    const feed = getFeedSignal(Number(params.id))
    const items = getItemsByFeedSignal(Number(params.id))

    function countAllItems() {
        return items.length
    }
    
    function countUnreadItems() {
        return items.filter(item => !item._read).length
    }

    function markAsRead(item: Item) {
        readItem(item._id)
    }

    async function markAllAsRead() {
        await readAllItems(feed()._id)
    }

    function toggleViewAll() {
        setViewAll(v => !v)
    }

    async function handlerSyncFeed() {
        setLoading('Checking ...')
        await sleep(500) // Throttle api call
        const json = await fetchFeedHash(feed().url)
        if (json.status === 'error') {
            alert(json.message)
            return
        }
        if (json.hash !== feed()._hash) {
            await sleep(500) // Throttle api call
            setLoading('Updating ...')
            await syncFeed(feed()._id)
        }
        setLoading('Done! ')
        await sleep(1000)
        setLoading('')
    }

    async function handlerDeleteFeed() {
        const confirmed = confirm(`Delete "${feed().title}" feed?`)
        if (confirmed) {
            await deleteFeed(feed()._id)
            navigate('/feed')
        }
    }

    return (
        <>
            <div style={{ margin: '0 0 -1.5em 0', "text-align": 'right' }}>
                &nbsp;
                <Show when={loading().length}>{loading()}&nbsp;</Show>
                [<a onClick={handlerSyncFeed}>Sync</a>]
                [<a onClick={handlerDeleteFeed}>Delete</a>]
            </div>
            <Show when={feed()}>
                <h2>
                    {feed().title}
                    &nbsp;<small><a href={feed().url} title="Go to website">&#128279;</a></small>
                </h2>
                <div style={{ margin: '-1.5em 0 0 0' }}>{feed().url}</div>
                <br />
                View:&nbsp;
                {viewAll() ? <strong>All ({countAllItems()})</strong> : <A href="" onClick={toggleViewAll}>All ({countAllItems()})</A>} |&nbsp;
                {!viewAll() ? <strong>Unread ({countUnreadItems()})</strong> : <A href="" onClick={toggleViewAll}>Unread ({countUnreadItems()})</A>}
                <Show when={!viewAll() && countUnreadItems()! > 0}>
                &nbsp;- [<a onClick={markAllAsRead}>Mark all as read</a>]
                </Show>

                <Show when={(viewAll() && !countAllItems()) || (!viewAll() && !countUnreadItems())}>
                    <div style={{ margin: '1em 0'}}>&lt;empty&gt;</div>
                </Show>
                <ul class="items">
                    <For each={[...items].reverse()}>
                        {(item) => (
                            <li class="item" classList={{ hidden: !viewAll() && !!item._read }}>
                                <span>&rsaquo;</span>
                                <div>
                                    <A
                                        href={`/item/${item._id}`} onClick={() => markAsRead(item)}
                                        class="title"
                                        classList={{ readed: !!item._read }}
                                        innerHTML={item.title}
                                    >
                                    </A>
                                    <a class="link" href={item.url}>({new URL(item.url).origin})</a>
                                    <br />
                                    <span class="meta">
                                        <span class="date">{formatDate(item.lastModified)}</span>
                                    </span>
                                </div>
                            </li>
                        )}
                    </For>
                </ul>
            </Show>
        </>
    )
}
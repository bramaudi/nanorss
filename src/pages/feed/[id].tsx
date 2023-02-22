import { createEffect, createResource, createSignal, For, Show } from "solid-js"
import { A, useNavigate, useParams } from "@solidjs/router"
import { Channel, Item } from "../../types"
import { deleteChannel, downloadChannel, fetchChannel, getChannel, updateChannel } from "../../services/channel"
import { getItemsByChannel, readAllItems, readItem } from "../../services/items"
import { formatDate } from "../../helper/util"

export default function () {
    const params = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [viewAll, setViewAll] = createSignal(false)
    const [loading, setLoading] = createSignal('')
    const [feed] = createResource<Channel>(() => getChannel(Number(params.id)))
    const [items, { refetch }] = createResource<Item[]>(() => getItemsByChannel(Number(params.id)))

    function markAsRead(item: Item) {
        readItem(item.id)
        refetch()
    }

    async function markAllAsRead() {
        await readAllItems(feed()!.id)
        refetch()
    }

    function countAllItems() {
        return items()?.length
    }
    
    function countUnreadItems() {
        return items()?.filter(item => !item.read).length
    }

    function toggleViewAll() {
        setViewAll(v => !v)
        const where = { id: feed()!.id }
        updateChannel(where, { view_all: Number(viewAll()) })
    }

    async function handlerSyncChannel() {
        setLoading('Checking ...')
        const json = await downloadChannel(feed()!.url)
        const dateNew = new Date(json.channel!.lastModified!.date).valueOf()
        const dateOld = new Date(feed()!.lastModified.date).valueOf()
        if (dateNew > dateOld) {
            setLoading('Updating ...')
            // Throttle request to api
            setTimeout(async () => {
                await fetchChannel(feed()!.id, items()!)
            }, 300);
        }
        refetch()
        setLoading('Done! ')
        setTimeout(() => {
            setLoading('')
        }, 1000);
    }

    async function handlerDeleteChannel() {
        const confirmed = confirm(`Delete "${feed()!.title}" feed?`)
        if (confirmed) {
            await deleteChannel(feed()!.id)
            navigate('/feed')
        }
    }

    createEffect(() => {
        // load preferences
        setViewAll(!!feed()?.view_all)
    })

    return (
        <>
            <div style={{ margin: '0 0 -1.5em 0', "text-align": 'right' }}>
                &nbsp;
                <Show when={loading().length}>{loading()}&nbsp;</Show>
                [<a onClick={handlerSyncChannel}>Sync</a>]
                [<a onClick={handlerDeleteChannel}>Delete</a>]
            </div>
            <Show when={feed()}>
                <h2>
                    {feed()!.title}
                    &nbsp;<small><a href={feed()!.link} title="Go to website">&#128279;</a></small>
                </h2>
                <div style={{ margin: '-.5em 0 0 0' }}>{feed()!.url}</div>
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
                    <For each={items()?.reverse()}>
                        {(item) => (
                            <li class="item" classList={{ hidden: !viewAll() && !!item.read }}>
                                <span>&rsaquo;</span>
                                <div>
                                    <A
                                        href={feed()!.read_external ? item.link : `/item/${item.id}`} onClick={() => markAsRead(item)}
                                        class="title"
                                        classList={{ readed: !!item.read }}
                                        innerHTML={item.title}
                                    >
                                    </A>
                                    <a class="link" href={item.link}>({new URL(item.link).origin})</a>
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
import db from "../../helper/db"
import { createEffect, createResource, createSignal, For, onMount, Show } from "solid-js"
import { A, useNavigate, useParams } from "@solidjs/router"
import { Channel, Item } from "../../types"
import { deleteChannel, fetchChannel, getChannel } from "../../services/channel"
import { getItemsByChannel } from "../../services/items"

export default function () {
    const params = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [viewAll, setViewAll] = createSignal(false)
    const [loading, setLoading] = createSignal('')
    const [feed] = createResource<Channel>(() => getChannel(Number(params.id)))
    const [items, { refetch }] = createResource<Item[]>(() => getItemsByChannel(Number(params.id)))

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

    async function handlerFetchChannel() {
        setLoading('Fetching ...')
        await fetchChannel(feed()!.id, items()!)
        refetch()
        setLoading('Complete!')
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
                [<a onClick={handlerFetchChannel}>Update</a>]
                [<a onClick={handlerDeleteChannel}>Delete</a>]
            </div>
            <h2>{feed()?.title} <a href={feed()?.link} title="Go to website">&#128279;</a></h2>
            <div style={{ margin: '-.5em 0 0 0' }}>{feed()?.url}</div>
            <br />
            View:&nbsp;
            {viewAll() ? <strong>All</strong> : <A href="" onClick={toggleViewAll}>All</A>} |&nbsp;
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
                                <br />
                                <span class="meta">
                                    <span class="date">{item.lastModified}</span>
                                </span>
                            </div>
                        </li>
                    )}
                </For>
            </ul>
        </>
    )
}
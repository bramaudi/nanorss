import db from "../../db"
import { A, useParams } from "@solidjs/router"
import { createDexieArrayQuery, createDexieSignalQuery } from "solid-dexie"
import { createEffect, createResource, createSignal, For, Show } from "solid-js"
import { Feed, Item } from "../../types"
import {
    RiSystemEyeOffFill as EyeClose,
    RiSystemEyeFill as EyeOpen,
    RiBusinessBookmarkFill as BookmarkFill,
    RiBusinessBookmark2Fill as BookmarkLine,
    // RiMapPushpin2Fill as PinFill,
    // RiMapPushpin2Line as PinLine
} from 'solid-icons/ri'

export default function() {
    const params = useParams()
    const [viewAll, setViewAll] = createSignal(0)
    const [viewBookmark, setViewBookmark] = createSignal(0)
    const [feed, { refetch }] = createResource<Feed>(() => {
        return db.table('feeds').get(Number(params.id))
    })
    const [items, { refetch: itemsRefetch, mutate: itemsMutate }] = createResource<Item[]>(() => {
        return createDexieArrayQuery(() => db.table('items').where({ feedId: Number(params.id) }).toArray())
    })
    const countItemsUnread = ((feedId: number) => createDexieSignalQuery(() => db.table('items').where({ feedId, read: 0 }).count()))(Number(params.id))

    async function feedsEdit(prop: string, value: string|number|boolean) {
        await db.transaction('rw', db.table('feeds'), () => {
            db.table('feeds').update(Number(params.id), { [prop]: value })
        })
        refetch()
    }

    function markAsRead(item: Item) {
        db.transaction('rw', db.table('items'), () => {
            db.table('items').where({ id: item.id }).modify({ read: 1 })
        })
    }

    function toggleViewAll() {
        setViewAll(v => Number(!v))
        db.transaction('rw', db.table('feeds'), () => {
            db.table('feeds').where({ id: Number(params.id) }).modify({ view_all: viewAll() })
        })
    }

    createEffect(() => {
        if (viewBookmark()) {
            itemsMutate(items => items?.filter(item => item.bookmark))
        } else {
            itemsRefetch()
        }

        if (feed()) {
            setViewAll(feed()!.view_all)
        }
    })

    return (
        <>
            <Show when={feed()}>
                <div class="mr-2 pl-2 py-1 flex items-center">
                    <div>
                        <A href={`/feed/${feed()!.id}`}>
                            <strong>{feed()!.title}</strong>
                        </A>
                        <span class="ml-1">({countItemsUnread})</span>
                        <span class="block text-xs text-slate-600">{new URL(feed()!.link).host}</span>
                    </div>
                    <div class="ml-auto">
                        <button class="ml-2 text-2xl" onClick={() => toggleViewAll()}>
                            <Show when={!viewAll()}><EyeClose /></Show>
                            <Show when={viewAll()}><EyeOpen /></Show>
                        </button>
                        <button class="ml-2 text-2xl" onClick={() => setViewBookmark(v => Number(!v))}>
                            <Show when={!viewBookmark()}><BookmarkFill /></Show>
                            <Show when={viewBookmark()}><BookmarkLine /></Show>
                        </button>
                    </div>
                </div>
                <ul class="mt-1 border-t border-gray-700">
                    <For each={items()}>
                        {item => (
                            <li class="mx-2 py-1" classList={{ hidden: !viewAll() && !!item.read }}>
                                <A href={feed()!.read_external ? item.link : `/item/${item.id}`} onClick={() => markAsRead(item)}>
                                    <span classList={{
                                        'font-semibold': !item.read,
                                        'text-slate-500': !!item.read
                                        }}>{item.title}</span>
                                </A>
                                <span class="block text-xs text-slate-600">
                                    {item.pubDate} | {new URL(item.link).host}
                                </span>
                            </li>
                        )}
                    </For>
                </ul>
            </Show>
        </>
    )
}
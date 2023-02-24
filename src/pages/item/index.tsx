import { createResource, For, Show } from "solid-js"
import { A } from "@solidjs/router"
import { Feed, Item } from "../../types"
import { getFeeds } from "../../services/feed"
import { getItems, readItem } from "../../services/items"
import { formatDate } from "../../helper/utils"

export default function () {
    const [feeds] = createResource<Feed[]>(() => getFeeds())
    const [items, { refetch }] = createResource<Item[]>(() => getItems({ _read: 0 }, 0, 0))

    function markAsRead(item: Item) {
        readItem(item._id)
        refetch()
    }
    
    function countUnreadItems() {
        return items()?.filter(item => !item._read).length
    }

    function selectFeed(feedId: number) {
        return feeds()?.filter(c => c._id === feedId)[0]
    }

    return (
        <>
            <Show when={items()}>
                <Show when={!countUnreadItems()}>
                    <div style={{ margin: '1em 0'}}>&lt;empty&gt;</div>
                </Show>
                <ul class="items">
                    <For each={items()?.reverse()}>
                        {(item) => (
                            <li class="item">
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
                                        {selectFeed(item._feedId)?.title} - <span class="date">{formatDate(item.lastModified)}</span>
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
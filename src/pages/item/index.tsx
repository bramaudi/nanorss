import { createResource, For, Show } from "solid-js"
import { A } from "@solidjs/router"
import { Channel, Item } from "../../types"
import { getChannels } from "../../services/channel"
import { getItems, readItem } from "../../services/items"
import { formatDate } from "../../helper/util"

export default function () {
    const [channels] = createResource<Channel[]>(() => getChannels())
    const [items, { refetch }] = createResource<Item[]>(() => getItems({ read: 0 }, 0, 10))

    function markAsRead(item: Item) {
        readItem(item.id)
        refetch()
    }
    
    function countUnreadItems() {
        return items()?.filter(item => !item.read).length
    }

    function findChannel(feedId: number) {
        return channels()?.filter(c => c.id === feedId)[0]
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
                                        href={findChannel(item.feedId)!.read_external ? item.link : `/item/${item.id}`} onClick={() => markAsRead(item)}
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
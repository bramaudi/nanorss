import { createResource, For } from "solid-js"
import { A } from "@solidjs/router"
import AddFeed from "../../components/AddFeed"
import { Channel } from "../../types"
import { deleteChannel, getChannels } from "../../services/channel"
import { getItemsCount, getItemsUnreadCount } from "../../services/items"

export default function () {
    const [channels, { refetch }] = createResource<Channel[]>(() => getChannels())
    
    async function feedsDelete(feed: Channel) {
        const { id, title } = feed
        const confirmed = confirm(`Delete feed "${title}"?`)
        if (confirmed) {
            await deleteChannel(id)
            refetch()
        }
    }

    function countItems(feedId: number) {
        const unread = createResource(() => getItemsUnreadCount(feedId))[0]
        const all = createResource(() => getItemsCount(feedId))[0]
        return {unread, all}
    }
    
    return (
        <>
            <AddFeed onInsert={refetch}/>
            <ul class="items">
                <For each={channels()?.reverse()}>
                    {feed => (
                        <li class="item">
                            <span>&rsaquo;</span>
                            <div>
                                <A class="title" href={`/feed/${feed.id}`}>
                                    <strong>{feed.title}</strong>
                                </A>
                                <span class="meta">
                                    <span class="date">({countItems(feed.id).unread} / {countItems(feed.id).all})</span>
                                </span>
                                <br />
                                <a class="link" href={new URL(feed.link).origin}>({new URL(feed.link).host})</a>
                            </div>
                        </li>
                    )}
                </For>
            </ul>
        </>
    )
}
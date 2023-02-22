import { createResource, createSignal, For, Show } from "solid-js"
import { A } from "@solidjs/router"
import AddFeed from "../../components/AddFeed"
import { Channel } from "../../types"
import { downloadChannel, fetchChannel, getChannels } from "../../services/channel"
import { getItemsByChannel, getItemsCount, getItemsUnreadCount } from "../../services/items"
import { sleep } from "../../helper/utils"

export default function () {
    const [loading, setLoading] = createSignal('')
    const [channels, { refetch }] = createResource<Channel[]>(() => getChannels())

    function countItems(feedId: number) {
        const unread = createResource(() => getItemsUnreadCount(feedId))[0]
        const all = createResource(() => getItemsCount(feedId))[0]
        return {unread, all}
    }
    
    async function handlerSyncChannels() {
        let done = 0
        setLoading(`Sync (${done}/${channels()?.length}) ...`)
        for (const channel of channels()!) {
            const json = await downloadChannel(channel.url)
            const items = await getItemsByChannel(channel.id)
            const dateNew = new Date(json.channel!.lastModified!.date).valueOf()
            const dateOld = new Date(channel.lastModified.date).valueOf()
            if (dateNew > dateOld) {
                await sleep(300) // Throttle api call
                await fetchChannel(channel.id, items)
            }
            done++
            setLoading(`Sync (${done}/${channels()?.length}) ...`)
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
                [<a onClick={handlerSyncChannels}>Sync</a>]
            </div>
            <ul class="items">
                <For each={channels()?.reverse()}>
                    {feed => (
                        <li class="item">
                            <span>&rsaquo;</span>
                            <div>
                                <A class="title" href={`/feed/${feed.id}`}>
                                    {feed.title}
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
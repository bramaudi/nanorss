import { createResource, createSignal, For, Show } from "solid-js"
import { A } from "@solidjs/router"
import AddFeed from "../../components/AddFeed"
import { Channel } from "../../types"
import { downloadChannel, fetchChannel, getChannels } from "../../services/channel"
import { getItemsByChannel, getItemsCount, getItemsUnreadCount } from "../../services/items"

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
                console.log(channel.title, `${dateNew} > ${dateOld}`);
                
                // Throttle request to api
                setTimeout(async () => {
                    await fetchChannel(channel.id, items)
                }, 300);
            }
            done++
            setLoading(`Sync (${done}/${channels()?.length}) ...`)
        }
        setTimeout(() => {
            setLoading('')
            refetch()
        }, 1000);
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
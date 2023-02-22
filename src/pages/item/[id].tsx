import { useParams } from "@solidjs/router"
import { createResource, Show } from "solid-js"
import { Item } from "../../types"
import { getItem, updateItem } from "../../services/items"
import { formatDate } from "../../helper/util"

export default function () {
    const { id } = useParams()
    const [item, { refetch }] = createResource<Item>(() => getItem(Number(id)))

    async function markAsUnread(id: number) {
        const where = { id }
        await updateItem(where, { read: 0 })
        refetch()
    }

    // remove "tab:" prefix on bearblog.dev feed
    function parseContent(content: string | undefined) {
        return content?.replaceAll(/tab:/g, '')
    }

    function showContent(item: Item) {
        if (item.content) {
            return parseContent(item.content)
        }

        return `${parseContent(item.summary) || ''}
            <br/><br/>
            [<a href="${item.link}">Read full article</a>]`
    }

    return (
        <>
            <Show when={item()}>
                <div style={{ margin: '0 0 -1.5em 0', "text-align": 'right' }}>
                    &nbsp;
                    <Show when={item()!.read}>[<a onClick={() => markAsUnread(item()!.id)}>Mark as unread</a>]</Show>
                </div>
                <article>
                    <h1
                        class="title"
                        innerHTML={`${item()!.title} <small><a href="${item()?.link}" title="Original website">&#128279;</a></small>`}>
                    </h1>
                    <span class="meta">
                        {item()!.author && `by ${item()!.author?.name}, `}
                        {formatDate(item()!.lastModified)}
                    </span>
                    <div innerHTML={showContent(item()!)}></div>
                </article>
            </Show>
        </>
    )
}
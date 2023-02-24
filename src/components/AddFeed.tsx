import { createSignal, Show } from "solid-js"
import { fetchFeed, insertFeed } from "../services/feed"
import { JSONResponse } from "../types"

type Props = {
    onInsert: () => unknown
}
export default function AddFeed(props: Props) {
    const [url, setUrl] = createSignal('')
    const [loading, setLoading] = createSignal(false)
    const [json, setJson] = createSignal<JSONResponse>()

    async function handlerDownloadFeed(e: SubmitEvent) {
        e.preventDefault()
        setLoading(true)
        const json = await fetchFeed(url())
        if (json.status === 'error') alert(json.message)
        else setJson(json)
        setLoading(false)
    }

    async function handlerInsertFeed(e: SubmitEvent) {
        e.preventDefault()
        const { hash: _hash, channel } = json()!
        const feed = {...channel!, _hash }
        await insertFeed(feed, json()?.items!)
        setJson()
        props.onInsert() // call `execute` on parent
    }

    function modifyFeedName(e: InputEvent) {
        const { value: title } = e.currentTarget as HTMLInputElement
        setJson(data => {
            data!.channel!.title = title
            return data
        })
    }

    return (
        <>
            <br />
            <form onsubmit={handlerDownloadFeed} class="flex">
                <input
                    autocomplete="on"
                    value={url()}
                    onInput={e => setUrl(e.currentTarget.value)}
                    class="w-full"
                />
                <button>Search</button>
            </form>
            <Show when={loading()}>Fetching ...</Show>
            <Show when={json()?.channel?.title}>
                <form onSubmit={handlerInsertFeed}>
                    <input
                        style={{ margin: '1em 0 0', display: 'block' }}
                        type="text"
                        value={json()!.channel?.title}
                        onInput={modifyFeedName}
                    />
                    <button>Add</button>
                </form>
            </Show>
        </>
    )
}
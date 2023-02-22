import { createSignal, Show } from "solid-js"
import { downloadChannel, insertChannel } from "../services/channel"
import { JSONResponse } from "../types"

type Props = {
    onInsert: () => unknown
}
export default function AddFeed(props: Props) {
    const [url, setUrl] = createSignal('')
    const [loading, setLoading] = createSignal(false)
    const [json, setJson] = createSignal<JSONResponse>()

    async function handlerDownloadChannel(e: SubmitEvent) {
        e.preventDefault()
        setLoading(true)
        setJson(await downloadChannel(url(), false))
        setLoading(false)
    }

    async function handlerInsertChannel(e: SubmitEvent) {
        e.preventDefault()
        await insertChannel(json()?.channel!, json()?.items!)
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
            <form onsubmit={handlerDownloadChannel} class="flex">
                <input
                    autocomplete="on"
                    value={url()}
                    onInput={e => setUrl(e.currentTarget.value)}
                    placeholder={'https://lukesmith.xyz/index.xml'}
                    class="w-full"
                />
                <button>Search</button>
            </form>
            <Show when={loading()}>Fetching ...</Show>
            <Show when={json()?.channel?.title}>
                <form onSubmit={handlerInsertChannel}>
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
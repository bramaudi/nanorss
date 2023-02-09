import db from "../../db"
import { useParams } from "@solidjs/router"
import { createResource, Show } from "solid-js"

export default function() {
    const { id } = useParams()    
    const [item] = createResource(() => {
        return db.transaction('r', db.table('items'), () => {
            return db.table('items').get(Number(id))
        })
    })

    return (
        <>
            <Show when={item()}>
                <div class="mr-2 px-2 py-1">
                    <div class="font-semibold">{item().title}</div>
                    <span class="block text-xs text-slate-600">{item().pubDate}</span>
                </div>
                <article
                    innerHTML={typeof item().description === 'object' ? '' : item().description }
                    class="prose mt-2 px-2 py-1 border-t border-gray-700"
                ></article>
            </Show>
        </>
    )
}
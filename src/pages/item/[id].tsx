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
                <article>
                    <h2>{item().title}</h2>
                    <span>{item().pubDate}</span>
                    <div innerHTML={typeof item().content === 'object' ? '' : item().content }></div>
                </article>
            </Show>
        </>
    )
}
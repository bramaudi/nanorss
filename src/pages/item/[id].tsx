import db from "../../db"
import { useParams } from "@solidjs/router"
import { createResource, Show } from "solid-js"
import { Item } from "../../types"

export default function() {
    const { id } = useParams()    
    const [item] = createResource<Item>(() => {
        return db.transaction('r', db.table('items'), () => {
            return db.table('items').get(Number(id))
        })
    })

    return (
        <>
            <Show when={item()}>
                <article>
                    <h1>{item()!.title}</h1>
                    <span>{item()!.lastModified}</span>
                    <div innerHTML={item()?.content ? item()?.content : item()?.summary }></div>
                </article>
            </Show>
        </>
    )
}
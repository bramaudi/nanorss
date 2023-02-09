import { A } from "@solidjs/router";
import { createDexieSignalQuery } from "solid-dexie";
import db from "../db";

export default function () {
    const countUnreadItems = createDexieSignalQuery(() => db.table('items').where({ read: 0 }).count())

    return (
        <>
            <header>
                <A href="/" style={{ 'text-decoration': 'none' }}>
                    <h1 style={{ 'font-size': '1.5em' }}>
                        <span>(▀̿Ĺ̯▀̿ ̿)</span> ReadSS
                    </h1>
                </A>
            </header>
            <nav>
                <A href="/feed">Feeds</A>
                <A href="/item">Unread ({countUnreadItems})</A>
            </nav>
        </>
    )
}
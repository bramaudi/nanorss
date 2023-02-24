import { A } from "@solidjs/router";
import { getAllUnreadItemsCount } from "../services/items";

export default function () {
    const count = getAllUnreadItemsCount()

    return (
        <>
            <header>
                <A href="/" style={{ 'text-decoration': 'none' }}>
                    <h1 style={{ 'font-size': '1.5em' }}>
                        <span>(╭ರ_•́)</span> nanorss
                    </h1>
                </A>
            </header>
            <nav>
                <A href="/feed">Feeds</A>
                <A href="/item">Unread ({count})</A>
            </nav>
        </>
    )
}
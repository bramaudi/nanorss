export default function () {
    return (
        <>
            <h2>A super simple feed reader just using your browser</h2>
            <h3>No singup, No Ads, No fancy UI, Just read.</h3>

            <p>
                Read your favorite news, personal blog, or anything else. <br />
                Literally everything as long as they provide
                RSS/Atom feed.
            </p>

            <p>
                No login/signup required, and your data are stored locally in the browser. <br />
                So becareful before clear your browser web storage ;)
            </p>

            <p>
                We also using our own proxy to fetch feed and converting to API
                which is open source.
            </p>

            <blockquote>
                <strong>Warning</strong>: Still under development, some functionality may break without any caution,
                and lacks of many basic features.
            </blockquote>

            <a href="https://github.com/bramaudi/nanorss">Source code</a> | 
            <a href="https://github.com/bramaudi/rss2json">API</a>
            <footer style="padding:25px 0;">
                Inspired by <a href="https://bearblog.dev">Bear ʕ•ᴥ•ʔ</a>
            </footer>
        </>
    )
}
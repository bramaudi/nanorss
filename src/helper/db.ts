import { Dexie } from 'dexie';

const db = new Dexie('ReadSS_Feeds')

db.version(1).stores({
    feeds: `
        ++id,
        title,
        link,
        description,
        read_external,
        view_all`,
    items: `
        ++id,
        feedId,
        read,
        pin,
        bookmark,
        [feedId+read],
        
        title,
        link,
        pubDate,
        description`
})

await db.open()
export default db
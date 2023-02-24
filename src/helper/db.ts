import { Dexie } from 'dexie';

const db = new Dexie('ReadSS_Feeds')

db.version(1).stores({
    feeds: `
        ++_id,
        _hash,
        
        url,
        title,
        description
        `,
    items: `
        ++_id,
        _feedId,
        _read,
        _saved,
        [_feedId+_read],
        [_feedId+_saved],
        
        title,
        url,
        author,
        summary,
        content,
        lastModified
        `
})

await db.open()
export default db
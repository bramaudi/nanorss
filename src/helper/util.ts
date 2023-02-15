export function formatDate(date: string) {
    const datetime = new Date(date)
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short',
    }
    return new Intl.DateTimeFormat('en', options).format(datetime)
}
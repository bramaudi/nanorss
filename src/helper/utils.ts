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

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function readingTime(text: string | undefined) {
    const wpm = 225;
    const words = text?.trim().split(/\s+/).length || 0;
    const time = Math.ceil(words / wpm);
    return time
  }
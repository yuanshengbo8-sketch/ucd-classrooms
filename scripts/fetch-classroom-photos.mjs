// Reads the photo addresses for each General Assignment classroom and writes
// data/classroom-photos.json, which build-data.mjs merges into classrooms.json.
//
//   node scripts/fetch-classroom-photos.mjs
//
// The Registrar's site turns scripts away, so the room pages are read from
// the Internet Archive's copies instead (one request at a time, with a pause).
// Only the photo addresses are kept: the photos stay on the university's
// server and are loaded from there. Pages are cached in data/raw/ga/rooms/,
// so an interrupted run can be restarted.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const CACHE = join(ROOT, 'data', 'raw', 'ga', 'rooms')
const OUT = join(ROOT, 'data', 'classroom-photos.json')
const PAGES = 'registrar.ucdavis.edu/faculty-staff/classroom/'
const PAUSE = 1500

const site = JSON.parse(await readFile(join(ROOT, 'campus.data.json'), 'utf8'))
const { rooms } = JSON.parse(await readFile(join(ROOT, 'public', 'data', 'classrooms.json'), 'utf8'))
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function get (url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': site.userAgent }, signal: AbortSignal.timeout(90000) })
      if (response.ok) return await response.text()
      if (response.status === 404) return null
      const wait = Number(response.headers.get('retry-after')) || 20 * (attempt + 1)
      console.warn(`  ${response.status}, waiting ${wait}s`)
      await sleep(wait * 1000)
    } catch (error) {
      console.warn(`  ${error.message}, retrying`)
      await sleep(10000 * (attempt + 1))
    }
  }
  return null
}

const photosOf = html => {
  const start = html.indexOf('Room Photos')
  if (start < 0) return null
  const section = html.slice(start, html.indexOf('</main>', start))
  // Addresses are written as https://…, or as //… without the scheme. Most
  // have plain spaces in them and a few are already escaped.
  return [...section.matchAll(/<img[^>]*\ssrc="(?:https?:)?(\/\/[^"]+\.(?:jpe?g|png))"/gi)].map(match => encodeURI(decodeURI(`https:${match[1].replace(/&amp;/g, '&')}`)))
}

// One request to the Archive's index: every capture of a room page that was
// answered normally. Some captures are of the site's "access denied" page,
// so the nearest capture is not always a usable one.
// It is only asked for once a page is missing from the cache.
let captures = null
async function capturesOf (url) {
  if (captures === null) {
    const index = await get(`https://web.archive.org/cdx/search/cdx?url=${PAGES}&matchType=prefix&filter=statuscode:200&output=json&fl=original,timestamp`)
    if (index === null) throw new Error('The Internet Archive index did not answer; try again later.')
    captures = new Map()
    for (const [original, timestamp] of JSON.parse(index).slice(1)) {
      const path = new URL(original).pathname.replace(/\/$/, '').toLowerCase()
      captures.set(path, [...(captures.get(path) ?? []), timestamp])
    }
  }
  // Newest capture first.
  return (captures.get(new URL(url).pathname.toLowerCase()) ?? []).sort().reverse()
}

await mkdir(CACHE, { recursive: true })
const photos = {}
const missing = []
for (const [index, room] of rooms.entries()) {
  const file = join(CACHE, `${room.id}.html`)
  let html = await readFile(file, 'utf8').catch(() => null)
  if (html === null) {
    // The newest capture, or an older one if that turns out not to be the room page.
    for (const stamp of (await capturesOf(room.url)).slice(0, 3)) {
      const page = await get(`https://web.archive.org/web/${stamp}id_/${room.url}`)
      await sleep(PAUSE)
      if (page !== null && photosOf(page) !== null) {
        html = page
        await writeFile(file, html)
        break
      }
    }
  }
  const found = html === null ? null : photosOf(html)
  if (found === null) missing.push(room.id)
  else if (found.length) photos[room.id] = found
  console.log(`${index + 1}/${rooms.length} ${room.id}: ${found === null ? 'no archived page' : `${found.length} photos`}`)
}

await writeFile(
  OUT,
  JSON.stringify({ source: 'https://registrar.ucdavis.edu/faculty-staff/academic-classroom-scheduling/general-assignment-classrooms', fetched: new Date().toISOString().slice(0, 10), photos }, null, 1) + '\n'
)
console.log(`${Object.keys(photos).length} of ${rooms.length} classrooms have photos`)
if (missing.length) console.log('no archived page:', missing.join(', '))

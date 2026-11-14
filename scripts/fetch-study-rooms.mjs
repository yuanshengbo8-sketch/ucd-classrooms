// Builds public/data/study-rooms.json from the UC Davis Library's reservation
// site (a LibCal site at reservations.library.ucdavis.edu): the group study
// rooms in Shields Library that students can book.
//
//   node scripts/fetch-study-rooms.mjs            download the list again
//   node scripts/fetch-study-rooms.mjs --offline  rebuild from the saved copy
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { listSpaces } from './lib/libcal.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const raw = join(root, 'data', 'raw')
const site = JSON.parse(await readFile(join(root, 'campus.data.json'), 'utf8'))
const GUIDE = 'https://library.ucdavis.edu/study-spaces/shields-library-study-spaces/group-study-rooms-at-shields-library'
/** LibCal location id of Shields Library. The other location is the medical library in Sacramento. */
const SHIELDS = 15170

await mkdir(raw, { recursive: true })
const saved = join(raw, 'libcal-allspaces.html')
let html = null
if (!process.argv.includes('--offline')) {
  try {
    const response = await fetch(`${site.libcal}/allspaces`, { headers: { 'user-agent': site.userAgent }, signal: AbortSignal.timeout(45000) })
    if (!response.ok) throw new Error(String(response.status))
    html = await response.text()
    await writeFile(saved, html)
  } catch (error) {
    console.warn(`${site.libcal}/allspaces: ${error.message}; using the saved copy`)
  }
}
html ??= await readFile(saved, 'utf8')

const rooms = []
for (const space of listSpaces(html)) {
  // Shields group study rooms only: skip test entries and equipment.
  const match = space.title.match(/^(\d{3}[A-Z]?) - (.+?) \(Capacity \d+\)$/)
  if (space.lid !== SHIELDS || !match || !/Study Rooms/i.test(space.group)) continue
  const screen = /with Presentation Screens/i.test(space.group)
  rooms.push({
    id: `shields-${match[1].toLowerCase()}`,
    name: `${match[1]} · ${match[2]}`,
    library: 'Shields Library',
    building: 'shields-library',
    buildingName: 'Shields Library',
    room: match[1],
    level: match[1][0],
    seats: space.capacity || null,
    reservable: true,
    features: ['group-study', ...(screen ? ['presentation-screen'] : [])],
    text: screen
      ? 'Group study room with a presentation screen. Booked through the Library’s reservation site.'
      : 'Group study room. Booked through the Library’s reservation site.',
    url: GUIDE,
    book: `${site.libcal}${space.url}`,
    eid: space.eid,
    gid: space.gid,
    lid: space.lid
  })
}
rooms.sort((a, b) => a.room.localeCompare(b.room, 'en', { numeric: true }))

await writeFile(
  join(root, 'public', 'data', 'study-rooms.json'),
  JSON.stringify({ source: GUIDE, booking: `${site.libcal}/allspaces`, fetched: new Date().toISOString().slice(0, 10), plans: {}, rooms })
)
console.log(`${rooms.length} bookable study rooms in Shields Library`)
for (const room of rooms) console.log(` ${room.name.padEnd(30)} level ${room.level} seats ${room.seats} ${room.features.join(',')}`)

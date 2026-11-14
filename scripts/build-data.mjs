// Turns the raw downloads in data/raw/ into the files the site loads:
//
//   public/data/classrooms.json   General Assignment classrooms from the Registrar's room summary
//   public/data/campus.json       building footprints, paths and green space
//
//   node scripts/build-data.mjs
//
// data/raw/ga/summary.html is the Registrar's "Room Summary – Sorted by Room"
// page saved from a browser. The Registrar's site turns scripts away, so this
// project does not download it automatically:
// https://registrar.ucdavis.edu/faculty-staff/academic-classroom-scheduling/general-assignment-classrooms/ga-room-summary-by-room
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildCampus, slugify } from './lib/campus-map.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const RAW = join(ROOT, 'data', 'raw')
const OUT = join(ROOT, 'public', 'data')
const REGISTRAR = 'https://registrar.ucdavis.edu'

const decode = text =>
  text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#0?39;|&rsquo;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

/** The Registrar's building label -> the building's name in OpenStreetMap. */
const BUILDING_NAMES = {
  Chemistry: 'Chemistry Building',
  Grove: 'The Grove',
  'Hart Hall': 'George Hart Hall',
  Heitman: 'Heitman Staff Learning Center',
  Hoagland: 'Hoagland Hall',
  'Kerr Hall': 'Clark Kerr Hall',
  'Khaira Lecture Hall': 'Ravinder and Kamaljeet Khaira Lecture Hall',
  'Kleiber Hall': 'Max B. Kleiber Hall',
  'Medsci C': 'Medical Sciences 1C',
  'Rock Hall': 'Peter A. Rock Hall (Chemistry)',
  Shields: 'Shields Library',
  'Social Sciences & Humanities': 'Social Sciences & Humanities Building',
  TLC: 'Teaching and Learning Complex'
}

/**
 * Floor index from a UC Davis room number. Four- and three-digit numbers
 * start with the floor (1060 and 179 are floor 1, 2205 is floor 2). One- and
 * two-digit numbers (Wellman 2, Olson 6, Roessler 55) are the basement or
 * ground level, shown as the lower level (0).
 */
export function floorOf (room) {
  const digits = room.match(/\d+/)?.[0]
  if (!digits) return 1
  return digits.length >= 3 ? Number(digits[0]) : 0
}

const tidy = text => {
  const clean = text.trim().replace(/\.$/, '')
  return clean.charAt(0).toUpperCase() + clean.slice(1).replace(/\bSeating\b/, 'seating')
}

const summary = await readFile(join(RAW, 'ga', 'summary.html'), 'utf8')
const classrooms = []
for (const row of summary.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
  const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(cell => cell[1])
  // Most links are relative; rooms borrowed from departments ("bs") use full URLs.
  const link = cells[0]?.match(/href="(?:https:\/\/registrar\.ucdavis\.edu)?(\/faculty-staff\/classroom\/(?:ga|bs)\/([^"]+))"/)
  if (!link) continue
  const label = decode(cells[0])
  const split = label.match(/^(.*?)\s+(\S+)$/)
  if (!split) continue
  const buildingName = BUILDING_NAMES[split[1]] ?? split[1]
  const room = split[2]

  // First line: seating; boards; flooring; windows. Later lines: AV and notes.
  const linesOf = cells[2].split(/<br\s*\/?>/i).map(decode).filter(Boolean)
  const parts = (linesOf[0] ?? '').split(';').map(tidy).filter(Boolean)
  // "Interactive" rooms are set up for group work; some also name their seating.
  const interactive = parts.some(part => /^interactive$/i.test(part))
  const style = parts.find(part => /seating/i.test(part)) ?? (interactive ? 'Interactive' : '')
  const boardType = parts.find(part => /chalkboard|whiteboard/i.test(part)) ?? ''
  const surroundings = parts.filter(part => part !== style && part !== boardType && !/^interactive$/i.test(part))
  const equipment = interactive && style !== 'Interactive' ? ['Interactive classroom'] : []
  const notes = []
  for (const line of linesOf.slice(1)) {
    for (const part of line.split(';').map(tidy).filter(Boolean)) {
      if (/^full av package$/i.test(part)) equipment.push('Full AV package')
      else if (/^audio & content lecture capture/i.test(part)) equipment.push('Audio & content lecture capture')
      else if (/video lecture capture available$/i.test(part)) {
        equipment.push('Video lecture capture')
        const rest = part.replace(/\s*video lecture capture available$/i, '').trim()
        if (rest) notes.push(rest)
      } else notes.push(part)
    }
  }
  classrooms.push({
    id: link[2],
    building: slugify(buildingName),
    buildingName,
    room,
    note: [...surroundings, ...notes].join(' · '),
    floor: floorOf(room),
    capacity: Number(decode(cells[1])) || null,
    style,
    boardType,
    boards: null,
    screens: null,
    wirelessMics: null,
    micFor: '',
    darkening: '',
    accessible: false,
    equipment: [...new Set(equipment)],
    photos: [],
    seatMaps: [],
    tour: null,
    url: `${REGISTRAR}${link[1]}`
  })
}
classrooms.sort((a, b) => a.buildingName.localeCompare(b.buildingName) || a.room.localeCompare(b.room, 'en', { numeric: true }))

// ---- campus ----------------------------------------------------------------

const osm = JSON.parse(await readFile(join(RAW, 'osm.json'), 'utf8'))
const site = JSON.parse(await readFile(join(ROOT, 'campus.data.json'), 'utf8'))

/** Named buildings inside the campus boundary that are not the university's. */
const NOT_CAMPUS = /church|hillel|islamic center|newman/i

/** Housing, plant, sheds and temporary buildings: drawn, but not labelled on the map. */
const MINOR = /^TB \d|Trailer|Shed|Greenhouse|Garage|Parking|Laundry|Storage|Annex|^CHCP|Cooling|Chiller|Heating|Apartments|Housing|Dining|Market|Residence|^Segundo|^Regan|^Tercero|^Cuarto|^Primero|Cooperative|^(Cottonwood|Currant|Hawthorn|Live Oak|Madrone|Mahogany|Olive|Pine|Redwood|Scrub Oak|Sequoia|Shasta|Kearney|Laben|Potter|Wall|Campbell) Hall$|Mechanical|Dairy|Barn|Facility \d|Lath House|Head House|Station \d|Office$|Scale$|Rifle|Surplus|Bath House|Child|Kappa|Alpha|Wind Tunnel|Electric|Cage Wash|Data Center|Farm|Nursery|Cabin/

/** Most of the campus is flat-roofed; these older buildings have pitched tile roofs. */
const PITCHED = ['George Hart Hall', 'Walker Hall', 'North Hall', 'South Hall', 'Dutton Hall', 'Hickey Gym', 'Robbins Hall', 'Hunt Hall', 'Voorhies Hall', 'Young Hall', 'Wyatt Pavilion Theatre', 'University House', 'Putah Creek Lodge', 'Silo', 'Cruess Hall', 'Veihmeyer Hall']
const FLAT_ROOF = { test: name => !PITCHED.includes(name) }

let photos = {}
try {
  photos = JSON.parse(await readFile(join(ROOT, 'data', 'building-photos.json'), 'utf8')).photos
} catch {
  console.warn('data/building-photos.json not found: buildings will have no photos')
}

const { campus, buildings, context, paths, areas, roomsByBuilding } = buildCampus({
  osm,
  origin: site.origin,
  bounds: site.bounds,
  classrooms,
  notCampus: NOT_CAMPUS,
  minor: MINOR,
  flatRoof: FLAT_ROOF,
  photos,
  withinCampus: true,
  plantCampus: true
})

// A room whose building is not on the map cannot be shown.
const known = new Set(buildings.map(building => building.id))
const shown = classrooms.filter(room => known.has(room.building))
const dropped = classrooms.filter(room => !known.has(room.building))

await mkdir(OUT, { recursive: true })
await writeFile(
  join(OUT, 'classrooms.json'),
  JSON.stringify({
    source: `${REGISTRAR}/faculty-staff/academic-classroom-scheduling/general-assignment-classrooms`,
    fetched: new Date().toISOString().slice(0, 10),
    rooms: shown
  })
)
await writeFile(join(OUT, 'campus.json'), JSON.stringify(campus))

const count = (list, key) => Object.fromEntries([...list.reduce((map, room) => map.set(room[key], (map.get(room[key]) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1]))
console.log(`${shown.length} classrooms in ${roomsByBuilding.size} buildings`)
if (dropped.length) console.log('not on the map:', dropped.map(room => `${room.buildingName} ${room.room}`).join(', '))
console.log(`${buildings.filter(building => building.photo).length} buildings have an exterior photo`)
console.log('labelled without rooms:', buildings.filter(b => b.rooms === 0 && !b.minor).map(b => b.name).join(' | '))
console.log(`${buildings.length} named buildings, ${context.length} context buildings, ${paths.length} paths, ${areas.length} areas, ${campus.trees.length / 2} trees`)
console.log('seating:', count(shown, 'style'))
console.log('boards:', count(shown, 'boardType'))

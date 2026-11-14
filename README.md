# UC Davis Classroom Explorer

**English** | [简体中文](README.zh-CN.md)

A 3D map of the UC Davis campus for finding a room: the General Assignment classrooms with their size, seating and equipment, and the Shields Library group study rooms with their live bookings.

**[Open the site](https://yuanshengbo8-sketch.github.io/ucd-classrooms/)** · **[Shields Library study rooms](https://yuanshengbo8-sketch.github.io/ucd-classrooms/?b=shields-library)** · **[Wellman Hall](https://yuanshengbo8-sketch.github.io/ucd-classrooms/?b=wellman-hall)**

This is an unofficial student project. It is not affiliated with or endorsed by the University of California, Davis.

It runs on the same code as the [WashU Classroom Explorer](https://github.com/yuanshengbo8-sketch/washu-classrooms); see [Shared core](#shared-core).

## What it does

- **Study rooms with live bookings.** The eight group study rooms in Shields Library that students can book. Each shows whether it is free right now and until when, a strip of today's and tomorrow's bookings, and a button to its page on the Library's reservation site.
- **3D campus map.** The campus is drawn from OpenStreetMap: buildings with roofs and window bays, lawns, courts, parking and named streets. Buildings with General Assignment classrooms have blue roofs and a label with their room count; Shields Library is gold.
- **Classrooms.** The 143 General Assignment classrooms on the map, in 32 buildings: capacity, seating, boards, AV package and lecture capture, with a link to the Registrar's page for each room, which has its photos.
- **Floor stack.** Selecting a building splits it into floors. Floors come from room numbers.
- **Seat view.** Pick any seat in a schematic of the room and look at the board from it. The schematic is generated from the seat count and seating style; it is not the real room.
- **Find a room.** Filter by minimum capacity, seating and equipment.
- **Saved rooms, share links, walking directions, Street View.** Saved rooms stay in your browser.
- **English and 中文.**

## What it cannot do yet

- **Which classrooms are free.** UC Davis's public [Class Search Tool](https://registrar-apps.ucdavis.edu/courses/search/index.cfm) lists meeting times but not rooms; rooms are in Schedule Builder, behind a login. So there is no classroom timetable and no course search here.
- **Classroom photos in the page.** The Registrar's site turns scripts away, so this project does not copy its room pages. Each classroom links to the Registrar's page instead.
- **Five classrooms in the Edwards Family Athletics Center** are in the Registrar's list but the building is not on this map.

## Run it locally

Needs Node.js 20 or newer.

```sh
git clone https://github.com/yuanshengbo8-sketch/ucd-classrooms.git
cd ucd-classrooms
npm ci
npm run dev
```

Then open http://localhost:5184/.

## Refresh the data

```sh
npm run data:osm            # OpenStreetMap buildings, paths, trees and green space
npm run data:study          # bookable rooms from the Library's reservation site
npm run data:photos         # candidate building photos from Wikimedia Commons, to pick from by hand
npm run data:build          # writes classrooms.json and campus.json
npm run data:availability   # today's and tomorrow's study-room bookings
```

The classroom list comes from the Registrar's [Room Summary – Sorted by Room](https://registrar.ucdavis.edu/faculty-staff/academic-classroom-scheduling/general-assignment-classrooms/ga-room-summary-by-room) page. Save that page from a browser as `data/raw/ga/summary.html`, then run `npm run data:build`.

`.github/workflows/study-availability.yml` runs every 20 minutes during the day. It reads the Library's public booking grid (two requests, ten seconds apart, no login) and pushes one JSON file to the `live-data` branch, which the site loads. Disable the workflow under Actions to stop it.

## Shared core

Everything listed in [`shared.json`](shared.json) (the React app, the 3D scene, the map builder in `scripts/lib/`, the workflows) is identical to the WashU repository. What belongs to UC Davis is `src/campus.ts`, `src/lib/schools.ts`, `campus.data.json`, `index.html`, the data and the data scripts. After changing a shared file, copy it to the other repository:

```sh
node scripts/sync-shared.mjs ../washu-classrooms           # copy
node scripts/sync-shared.mjs ../washu-classrooms --check   # only list differences
```

## Data and accuracy

- **Classrooms:** the Office of the University Registrar's [General Assignment classroom](https://registrar.ucdavis.edu/faculty-staff/academic-classroom-scheduling/general-assignment-classrooms) room summary.
- **Study rooms:** the UC Davis Library's [reservation site](https://reservations.library.ucdavis.edu/allspaces). Bookings are a copy up to 20 minutes old; the Library's site is the authority, and booking happens there.
- **Map:** © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, ODbL. Most trees, the roof shapes and the windows are generated for looks; only a few hundred campus trees are mapped.
- **Floors and heights:** floors are inferred from room numbers (`1060` and `179` are floor 1, `2205` is floor 2; one- and two-digit rooms such as Wellman 2 are shown as the lower level). Building heights use OpenStreetMap tags where they exist and an estimate otherwise.

## Credits and license

Built on the WashU Classroom Explorer, which was inspired by the [UCSD Classroom Explorer](https://github.com/zhenzhenfufu/ucsd-classrooms) maintained by [@zhenzhenfufu](https://github.com/zhenzhenfufu), building on work by [@wenhaoquestion](https://github.com/wenhaoquestion) and [SheepTester](https://github.com/SheepTester/ucsd-classrooms).

Code is under the [MIT License](LICENSE). Map data and classroom data belong to their sources.

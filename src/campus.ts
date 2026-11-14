import type { CampusConfig } from './lib/config'

/**
 * University of California, Davis. This file, lib/schools.ts, index.html, the
 * data and the data scripts are the campus-specific parts of the site;
 * everything else in src/ is shared with the other campus sites.
 */
export const CAMPUS: CampusConfig = {
  id: 'ucd-classrooms',
  brand: 'D',
  timeZone: 'America/Los_Angeles',
  repoUrl: 'https://github.com/yuanshengbo8-sketch/ucd-classrooms',
  liveAvailabilityUrl: 'https://raw.githubusercontent.com/yuanshengbo8-sketch/ucd-classrooms/live-data/study-availability.json',
  labelNames: {
    'George Hart Hall': 'Hart',
    'Clark Kerr Hall': 'Kerr',
    'Max B. Kleiber Hall': 'Kleiber',
    'Peter A. Rock Hall (Chemistry)': 'Rock',
    'Ravinder and Kamaljeet Khaira Lecture Hall': 'Khaira',
    'Teaching and Learning Complex': 'TLC',
    'Social Sciences & Humanities Building': 'SocSci & Humanities',
    'Medical Sciences 1C': 'Med Sci C',
    'Heitman Staff Learning Center': 'Heitman',
    'Chemistry Building': 'Chemistry',
    'Shields Library': 'Shields Library',
    'Jan Shrem and Maria Manetti Shrem Museum of Art': 'Manetti Shrem Museum',
    'Robert Mondavi Institute for Wine and Food Science': 'Mondavi Institute'
  },
  finderEquipment: ['Full AV package', 'Audio & content lecture capture', 'Video lecture capture', 'Interactive classroom'],
  // UC Davis's public class search lists times but not rooms, so there is no course data here yet.
  terms: [],
  colors: {
    primary: '#022851',
    primaryDark: '#011a36',
    primarySoft: '#e6edf6',
    accent: '#8a6400',
    accentSoft: '#fbf1d6',
    roof: 0x3a679f,
    roofHover: 0x2456b0,
    roofDim: 0xc0cbdb,
    wall: 0xe4dccb,
    wallDim: 0xeeeae0,
    floor: 0x2f66c4,
    floorEdge: 0x022851,
    match: 0x0b3d91,
    study: 0xc99700,
    studyRoof: 0xd9a927,
    managedRoof: 0x9fb2c9,
    managedRoofHover: 0x8aa0bb
  },
  sources: {
    classrooms: {
      label: 'registrar.ucdavis.edu',
      url: 'https://registrar.ucdavis.edu/faculty-staff/academic-classroom-scheduling/general-assignment-classrooms'
    },
    courses: null,
    study: { label: 'reservations.library.ucdavis.edu', url: 'https://reservations.library.ucdavis.edu/allspaces' }
  },
  studyElsewhere: [
    {
      title: { en: 'Study spaces that need no booking', zh: '不用预约的自习空间' },
      body: {
        en: 'Shields Library also has reading rooms and open study areas. The Library’s own page lists them with their hours.',
        zh: 'Shields Library 还有阅览室和开放自习区，不需要预约。图书馆自己的页面列出了这些空间和开放时间。'
      },
      links: [
        { label: { en: 'Library study spaces', zh: '图书馆自习空间' }, url: 'https://library.ucdavis.edu/service/study-and-collaboration-spaces/' }
      ]
    }
  ],
  strings: {
    appName: { en: 'UC Davis Classroom Explorer', zh: 'UC Davis 教室地图' },
    searchPlaceholder: { en: 'Search rooms and buildings', zh: '搜索教室、教学楼' },
    directoryPage: { en: 'Registrar page', zh: '注册处页面' },
    roomNotPublic: {
      en: 'UC Davis’s public Class Search Tool lists meeting times but not rooms. Check Schedule Builder for the room.',
      zh: 'UC Davis 公开的 Class Search Tool 只有上课时间，没有教室；具体教室请在 Schedule Builder 查看。'
    },
    schoolManaged: {
      en: '{school} schedules most classrooms in this building itself, so they are not in the Registrar’s General Assignment list.',
      zh: '这栋楼的大部分教室由 {school} 自己排课，不在注册处的通用教室清单里。'
    },
    notPooled: {
      en: 'This building has no General Assignment classrooms.',
      zh: '这栋楼没有通用教室（General Assignment）。'
    },
    partialList: {
      en: 'Rooms without details come from other public pages and may be incomplete.',
      zh: '没有详细信息的房间来自其他公开页面，可能不完整。'
    },
    schoolRoom: {
      en: 'Scheduled by {school}. It is not in the Registrar’s General Assignment list, so there are no details.',
      zh: '由 {school} 排课，不在注册处的通用教室清单里，所以没有详细信息。'
    },
    listedNotice: {
      en: 'Not in the Registrar’s General Assignment list. {n} class sections were listed here, most recently in {year}.',
      zh: '不在注册处的通用教室清单里。课表显示有 {n} 个班次在这里上过课，最近一次在 {year} 年。'
    },
    studyCard: { en: 'UC Davis ID access', zh: '需刷 UC Davis 证件' },
    studyBook: { en: 'Book on the Library site', zh: '去图书馆网站预约' },
    studyLive: {
      en: '{n} bookable rooms are free right now. Bookings from the Library’s reservation page, read at {time}; Davis time.',
      zh: '现在有 {n} 间可预约的自习室空着。预约情况来自图书馆的预约页面，读取于 {time}；时间均为 Davis 当地时间。'
    },
    studyNotLive: {
      en: 'Live booking data is not available right now. Open a room’s booking page to see its bookings.',
      zh: '暂时拿不到实时预约数据，请打开各房间的预约页面查看。'
    },
    planCredit: { en: 'Floor plan: UC Davis Library', zh: '平面图来自 UC Davis 图书馆' },
    aboutBody1: {
      en: 'An unofficial student project that puts UC Davis’s General Assignment classrooms and Shields Library study rooms on a 3D map of the campus. It is not affiliated with or endorsed by the University of California, Davis.',
      zh: '非官方学生项目：把 UC Davis 的通用教室和 Shields Library 自习室放到校园的 3D 地图上。本站与 University of California, Davis 无隶属关系，也未获其背书。'
    },
    aboutClassrooms: {
      en: 'Classroom sizes, seating, boards and AV: the Office of the University Registrar’s General Assignment room summary. Room photos are the Registrar’s, loaded from the university’s server.',
      zh: '教室的容量、座位、黑板和影音设备：注册处（Office of the University Registrar）的通用教室一览表。教室照片是注册处的，直接从学校的服务器加载。'
    },
    aboutCourses: {
      en: 'Courses: the Registrar’s public Class Search Tool lists times but not rooms, so there is no course search here.',
      zh: '课程：注册处公开的 Class Search Tool 只有时间、没有教室，所以这里没有课程搜索。'
    },
    aboutStudy: {
      en: 'Study rooms: the UC Davis Library’s reservation site. Bookings are read from its public pages about every 20 minutes; the Library’s site is the authority.',
      zh: '自习室：UC Davis 图书馆的预约网站。预约情况约每 20 分钟从它的公开页面读取一次，以图书馆网站为准。'
    },
    aboutFloors: {
      en: 'Floors are inferred from room numbers. Building heights, roof shapes and the floor stack are for display, not survey data.',
      zh: '楼层由房间号推断；建筑高度、屋顶形状和楼层分解仅用于展示，并非实测。'
    },
    aboutCredit: {
      en: 'Built on the same code as the WashU Classroom Explorer, inspired by the UCSD Classroom Explorer by zhenzhenfufu, wenhaoquestion and SheepTester.',
      zh: '与 WashU 教室地图使用同一套代码，灵感来自 zhenzhenfufu、wenhaoquestion 与 SheepTester 的 UCSD Classroom Explorer。'
    },
    studySource: { en: 'Study room details:', zh: '自习室信息来自：' }
  }
}

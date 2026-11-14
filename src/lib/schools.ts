import type { CSSProperties } from 'react'
import type { Lang } from './i18n'

/**
 * What a building is used for, for colouring its map label. UC Davis's
 * General Assignment classrooms are shared across colleges, so the groups here
 * are by use, not by college: buildings with General Assignment classrooms,
 * libraries, and everything else.
 */
export type SchoolId = 'classrooms' | 'library' | 'campus'

export interface School {
  en: string
  zh: string
  /** Label gradient, light to dark. */
  color: string
  dark: string
}

export const SCHOOLS: Record<SchoolId, School> = {
  classrooms: { en: 'General Assignment classrooms', zh: '通用教室', color: '#1d4f91', dark: '#022851' },
  library: { en: 'Library', zh: '图书馆', color: '#a87900', dark: '#7a5800' },
  campus: { en: 'Other campus buildings', zh: '其他校园建筑', color: '#75807a', dark: '#525c56' }
}

export const SCHOOL_ORDER: SchoolId[] = ['classrooms', 'library', 'campus']

const BY_SCHOOL: Record<SchoolId, string[]> = {
  classrooms: [
    'bainer-hall', 'california-hall', 'chemistry-building', 'clark-kerr-hall', 'cruess-hall', 'everson-hall', 'george-hart-hall',
    'giedt-hall', 'heitman-staff-learning-center', 'hickey-gym', 'hoagland-hall', 'hunt-hall', 'hutchison-hall',
    'max-b-kleiber-hall', 'medical-sciences-1c', 'olson-hall', 'peter-a-rock-hall-chemistry', 'physics',
    'ravinder-and-kamaljeet-khaira-lecture-hall', 'robbins-hall', 'roessler-hall', 'social-sciences-and-humanities-building',
    'storer-hall', 'teaching-and-learning-complex', 'the-grove', 'veihmeyer-hall', 'walker-hall', 'wellman-hall',
    'wickson-hall', 'young-hall'
  ],
  library: ['shields-library'],
  campus: []
}

const SCHOOL_OF = new Map<string, SchoolId>()
for (const id of SCHOOL_ORDER) for (const building of BY_SCHOOL[id]) SCHOOL_OF.set(building, id)

/** A building in neither list is an ordinary campus building. */
export function schoolOf (buildingId: string): SchoolId {
  return SCHOOL_OF.get(buildingId) ?? 'campus'
}

/** The group's colours as CSS variables, for a label or panel header. */
export function schoolStyle (buildingId: string): CSSProperties {
  const school = SCHOOLS[schoolOf(buildingId)]
  return { '--school': school.color, '--school-dark': school.dark } as CSSProperties
}

export function schoolName (id: SchoolId, lang: Lang): string {
  return SCHOOLS[id][lang]
}

export const LEGEND_TITLE: Record<Lang, string> = { en: 'Label colour', zh: '标签颜色' }

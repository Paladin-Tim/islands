export type PhaseId = 'morning' | 'day' | 'evening' | 'night'

type RGB = readonly [number, number, number]

type Palette = {
  id: PhaseId
  label: string
  top: RGB
  mid: RGB
  bottom: RGB
  glow: RGB
  ink: RGB
  chrome: RGB
  cloud: RGB
  ground: RGB
  star: number
  shadow: number
  glint: number
  vignette: number
  cloudAlpha: number
}

export type SkyState = {
  phaseId: PhaseId
  phaseLabel: string
  blending: boolean
  clockLabel: string
  minutes: number
  vars: Record<string, string>
}

const morning: Palette = {
  id: 'morning',
  label: 'Утро',
  top: [126, 158, 196],
  mid: [232, 176, 142],
  bottom: [244, 214, 184],
  glow: [255, 196, 138],
  ink: [42, 36, 28],
  chrome: [255, 246, 236],
  cloud: [255, 250, 246],
  ground: [110, 132, 72],
  star: 0,
  shadow: 0.14,
  glint: 0.42,
  vignette: 0.12,
  cloudAlpha: 0.78,
}

const day: Palette = {
  id: 'day',
  label: 'День',
  top: [46, 122, 196],
  mid: [120, 196, 236],
  bottom: [228, 242, 250],
  glow: [255, 246, 208],
  ink: [16, 32, 51],
  chrome: [244, 251, 255],
  cloud: [255, 255, 255],
  ground: [62, 122, 58],
  star: 0,
  shadow: 0.1,
  glint: 0.5,
  vignette: 0.08,
  cloudAlpha: 0.85,
}

const evening: Palette = {
  id: 'evening',
  label: 'Вечер',
  top: [36, 42, 92],
  mid: [196, 84, 72],
  bottom: [236, 156, 104],
  glow: [255, 132, 74],
  ink: [36, 22, 16],
  chrome: [255, 232, 216],
  cloud: [255, 214, 196],
  ground: [92, 58, 40],
  star: 0.4,
  shadow: 0.24,
  glint: 0.26,
  vignette: 0.22,
  cloudAlpha: 0.62,
}

const night: Palette = {
  id: 'night',
  label: 'Ночь',
  top: [7, 10, 22],
  mid: [18, 28, 56],
  bottom: [24, 38, 68],
  glow: [198, 214, 245],
  ink: [230, 238, 248],
  chrome: [14, 20, 36],
  cloud: [156, 176, 208],
  ground: [12, 18, 16],
  star: 1,
  shadow: 0.5,
  glint: 0.14,
  vignette: 0.42,
  cloudAlpha: 0.28,
}

/** Смена в 5:00, 11:00, 17:00 и 23:00. Смешение соседей — 40 минут вокруг границы. */
const BLEND_HALF = 20

const shifts: readonly { at: number; from: Palette; to: Palette }[] = [
  { at: 5 * 60, from: night, to: morning },
  { at: 11 * 60, from: morning, to: day },
  { at: 17 * 60, from: day, to: evening },
  { at: 23 * 60, from: evening, to: night },
]

const SUN_IN_START = 4 * 60 + 40
const SUN_IN_END = 5 * 60 + 20
const SUN_OUT_START = 22 * 60 + 40
const SUN_OUT_END = 23 * 60 + 20

export function currentMinutes(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60
}

export function computeSky(rawMinutes: number): SkyState {
  const minutes = wrapDay(rawMinutes)
  const blend = blendingPalette(minutes)
  const sun = sunOpacity(minutes)
  const moon = moonOpacity(minutes)
  const sunAt = sunPoint(minutes)
  const moonAt = moonPoint(minutes)
  const guide = sun >= moon ? sunAt : moonAt

  return {
    phaseId: blend.palette.id,
    phaseLabel: blend.palette.label,
    blending: blend.blending,
    clockLabel: formatClock(minutes),
    minutes,
    vars: {
      '--sky-top': cssColor(blend.palette.top),
      '--sky-mid': cssColor(blend.palette.mid),
      '--sky-bottom': cssColor(blend.palette.bottom),
      '--glow': cssColor(blend.palette.glow),
      '--ink': cssColor(blend.palette.ink),
      '--chrome': cssColor(blend.palette.chrome),
      '--cloud': cssColor(blend.palette.cloud),
      '--ground': cssColor(blend.palette.ground),
      '--star-opacity': cssNumber(blend.palette.star),
      '--shadow': cssNumber(blend.palette.shadow),
      '--glint': cssNumber(blend.palette.glint),
      '--vignette': cssNumber(blend.palette.vignette),
      '--cloud-alpha': cssNumber(blend.palette.cloudAlpha),
      '--sun-x': cssPercent(sunAt.x),
      '--sun-y': cssPercent(sunAt.y),
      '--sun-opacity': cssNumber(sun),
      '--moon-x': cssPercent(moonAt.x),
      '--moon-y': cssPercent(moonAt.y),
      '--moon-opacity': cssNumber(moon),
      '--light-angle': `${lightAngle(guide.x).toFixed(1)}deg`,
    },
  }
}

function blendingPalette(minutes: number) {
  for (const shift of shifts) {
    const delta = minutes - shift.at
    if (Math.abs(delta) > BLEND_HALF) continue
    const t = smoothstep((delta + BLEND_HALF) / (BLEND_HALF * 2))
    return { palette: mixPalette(shift.from, shift.to, t), blending: true }
  }

  return { palette: phaseAt(minutes), blending: false }
}

function phaseAt(minutes: number) {
  if (minutes >= 5 * 60 && minutes < 11 * 60) return morning
  if (minutes >= 11 * 60 && minutes < 17 * 60) return day
  if (minutes >= 17 * 60 && minutes < 23 * 60) return evening
  return night
}

function mixPalette(from: Palette, to: Palette, t: number): Palette {
  return {
    id: t < 0.5 ? from.id : to.id,
    label: t < 0.5 ? from.label : to.label,
    top: mixRgb(from.top, to.top, t),
    mid: mixRgb(from.mid, to.mid, t),
    bottom: mixRgb(from.bottom, to.bottom, t),
    glow: mixRgb(from.glow, to.glow, t),
    ink: mixRgb(from.ink, to.ink, t),
    chrome: mixRgb(from.chrome, to.chrome, t),
    cloud: mixRgb(from.cloud, to.cloud, t),
    ground: mixRgb(from.ground, to.ground, t),
    star: mixNum(from.star, to.star, t),
    shadow: mixNum(from.shadow, to.shadow, t),
    glint: mixNum(from.glint, to.glint, t),
    vignette: mixNum(from.vignette, to.vignette, t),
    cloudAlpha: mixNum(from.cloudAlpha, to.cloudAlpha, t),
  }
}

function sunOpacity(minutes: number) {
  if (minutes <= SUN_IN_START || minutes >= SUN_OUT_END) return 0
  if (minutes < SUN_IN_END) return ramp(minutes, SUN_IN_START, SUN_IN_END)
  if (minutes > SUN_OUT_START) return 1 - ramp(minutes, SUN_OUT_START, SUN_OUT_END)
  return 1
}

function moonOpacity(minutes: number) {
  if (minutes >= SUN_IN_END && minutes <= SUN_OUT_START) return 0
  if (minutes > SUN_OUT_START && minutes < SUN_OUT_END) return ramp(minutes, SUN_OUT_START, SUN_OUT_END)
  if (minutes > SUN_IN_START && minutes < SUN_IN_END) return 1 - ramp(minutes, SUN_IN_START, SUN_IN_END)
  return 1
}

function sunPoint(minutes: number) {
  const progress = clamp((minutes - 5 * 60) / (18 * 60), 0, 1)
  return {
    x: 12 + progress * 76,
    y: 68 - Math.sin(progress * Math.PI) * 42,
  }
}

function moonPoint(minutes: number) {
  const progress = moonProgress(minutes)
  return {
    x: 16 + progress * 68,
    y: 66 - Math.sin(progress * Math.PI) * 28,
  }
}

function moonProgress(minutes: number) {
  if (minutes >= 23 * 60) return (minutes - 23 * 60) / (6 * 60)
  if (minutes <= 5 * 60) return (minutes + 60) / (6 * 60)
  if (minutes >= SUN_OUT_START) return 0
  if (minutes <= SUN_IN_END) return 1
  return 0.5
}

/** 90° — свет слева, 180° — сверху, 270° — справа. */
function lightAngle(x: number) {
  const clamped = clamp(x, 12, 88)
  return 90 + ((clamped - 12) / 76) * 180
}

function ramp(minutes: number, start: number, end: number) {
  return smoothstep((minutes - start) / (end - start))
}

function smoothstep(value: number) {
  const t = clamp(value, 0, 1)
  return t * t * (3 - 2 * t)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function wrapDay(minutes: number) {
  return ((minutes % 1440) + 1440) % 1440
}

function mixRgb(from: RGB, to: RGB, t: number): RGB {
  return [
    mixNum(from[0], to[0], t),
    mixNum(from[1], to[1], t),
    mixNum(from[2], to[2], t),
  ]
}

function mixNum(from: number, to: number, t: number) {
  return from + (to - from) * t
}

function cssColor(rgb: RGB) {
  return `rgb(${Math.round(rgb[0])} ${Math.round(rgb[1])} ${Math.round(rgb[2])})`
}

function cssNumber(value: number) {
  return value.toFixed(3)
}

function cssPercent(value: number) {
  return `${value.toFixed(2)}%`
}

function formatClock(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/** Окна по 6 часов: 5–11 утро, 11–17 день, 17–23 вечер, 23–5 ночь. Смешение — 10 минут вокруг границы. */

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
  top: [132, 168, 196],
  mid: [186, 206, 216],
  bottom: [228, 216, 200],
  glow: [255, 228, 190],
  ink: [32, 38, 46],
  chrome: [246, 247, 248],
  cloud: [255, 255, 255],
  ground: [90, 110, 86],
  star: 0,
  shadow: 0.1,
  glint: 0.4,
  vignette: 0.1,
  cloudAlpha: 0.8,
}

const day: Palette = {
  id: 'day',
  label: 'День',
  top: [47, 126, 196],
  mid: [121, 196, 239],
  bottom: [231, 244, 251],
  glow: [255, 246, 208],
  ink: [16, 32, 51],
  chrome: [244, 251, 255],
  cloud: [255, 255, 255],
  ground: [63, 122, 58],
  star: 0,
  shadow: 0.1,
  glint: 0.5,
  vignette: 0.1,
  cloudAlpha: 0.82,
}

const evening: Palette = {
  id: 'evening',
  label: 'Вечер',
  top: [32, 44, 72],
  mid: [58, 68, 92],
  bottom: [118, 104, 108],
  glow: [226, 196, 164],
  ink: [236, 234, 230],
  chrome: [20, 26, 38],
  cloud: [200, 206, 214],
  ground: [40, 36, 34],
  star: 0.22,
  shadow: 0.32,
  glint: 0.12,
  vignette: 0.22,
  cloudAlpha: 0.55,
}

const night: Palette = {
  id: 'night',
  label: 'Ночь',
  top: [7, 11, 22],
  mid: [21, 32, 58],
  bottom: [28, 44, 74],
  glow: [201, 215, 245],
  ink: [230, 238, 248],
  chrome: [14, 22, 40],
  cloud: [158, 176, 208],
  ground: [12, 18, 16],
  star: 1,
  shadow: 0.5,
  glint: 0.14,
  vignette: 0.42,
  cloudAlpha: 0.28,
}

const BLEND_MINUTES = 10
const HALF = BLEND_MINUTES / 2

const shifts = [
  { at: 5 * 60, from: night, to: morning },
  { at: 11 * 60, from: morning, to: day },
  { at: 17 * 60, from: day, to: evening },
  { at: 23 * 60, from: evening, to: night },
] as const

function wrap(minutes: number) {
  return ((minutes % 1440) + 1440) % 1440
}

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value))
  return t * t * (3 - 2 * t)
}

function mixRgb(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function mixNum(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function mixPalette(a: Palette, b: Palette, t: number): Palette {
  return {
    id: t < 0.5 ? a.id : b.id,
    label: t < 0.5 ? a.label : b.label,
    top: mixRgb(a.top, b.top, t),
    mid: mixRgb(a.mid, b.mid, t),
    bottom: mixRgb(a.bottom, b.bottom, t),
    glow: mixRgb(a.glow, b.glow, t),
    ink: mixRgb(a.ink, b.ink, t),
    chrome: mixRgb(a.chrome, b.chrome, t),
    cloud: mixRgb(a.cloud, b.cloud, t),
    ground: mixRgb(a.ground, b.ground, t),
    star: mixNum(a.star, b.star, t),
    shadow: mixNum(a.shadow, b.shadow, t),
    glint: mixNum(a.glint, b.glint, t),
    vignette: mixNum(a.vignette, b.vignette, t),
    cloudAlpha: mixNum(a.cloudAlpha, b.cloudAlpha, t),
  }
}

function phaseAt(minutes: number): Palette {
  if (minutes >= 5 * 60 && minutes < 11 * 60) return morning
  if (minutes >= 11 * 60 && minutes < 17 * 60) return day
  if (minutes >= 17 * 60 && minutes < 23 * 60) return evening
  return night
}

function resolvePhase(minutes: number) {
  for (const shift of shifts) {
    const delta = minutes - shift.at
    if (Math.abs(delta) <= HALF) {
      const t = smoothstep((delta + HALF) / BLEND_MINUTES)
      const palette = mixPalette(shift.from, shift.to, t)
      return {
        palette,
        blending: t > 0.02 && t < 0.98,
      }
    }
  }

  const palette = phaseAt(minutes)
  return { palette, blending: false }
}

function ramp(minutes: number, start: number, end: number) {
  return smoothstep((minutes - start) / (end - start))
}

function sunOpacity(minutes: number) {
  if (minutes < 295 || minutes > 1385) return 0
  if (minutes < 305) return ramp(minutes, 295, 305)
  if (minutes > 1375) return 1 - ramp(minutes, 1375, 1385)
  return 1
}

function moonOpacity(minutes: number) {
  if (minutes >= 305 && minutes <= 1375) return 0
  if (minutes > 1375 && minutes < 1385) return ramp(minutes, 1375, 1385)
  if (minutes >= 295 && minutes < 305) return 1 - ramp(minutes, 295, 305)
  return 1
}

function sunProgress(minutes: number) {
  return Math.min(1, Math.max(0, (minutes - 300) / 1080))
}

function sunLevel(minutes: number) {
  const presence = sunOpacity(minutes)
  const height = Math.sin(sunProgress(minutes) * Math.PI)
  return presence * (0.38 + 0.62 * height)
}

function moonProgress(minutes: number) {
  if (minutes >= 1380) return (minutes - 1380) / 360
  if (minutes <= 300) return (minutes + 60) / 360
  // До заката луна ждёт слева, чтобы не пролетать через экран в момент появления.
  if (minutes < 305) return 1
  return 0
}

function arc(progress: number, x0: number, x1: number, horizon: number, lift: number) {
  const p = Math.min(1, Math.max(0, progress))
  return {
    x: x0 + (x1 - x0) * p,
    y: horizon - Math.sin(p * Math.PI) * lift,
  }
}

function cssColor(rgb: RGB) {
  return `rgb(${Math.round(rgb[0])} ${Math.round(rgb[1])} ${Math.round(rgb[2])})`
}

function lightAngle(x: number) {
  const angle = 90 + ((x - 6) / 88) * 180
  return `${angle.toFixed(1)}deg`
}

function clockLabel(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function computeSky(rawMinutes: number): SkyState {
  const minutes = wrap(rawMinutes)
  const { palette, blending } = resolvePhase(minutes)
  const sun = sunLevel(minutes)
  const moon = moonOpacity(minutes)
  const sunPoint = arc(sunProgress(minutes), 6, 94, 18, 7)
  const moonPoint = arc(moonProgress(minutes), 12, 88, 19, 6)
  const guide = sun >= moon ? sunPoint : moonPoint

  return {
    phaseId: palette.id,
    phaseLabel: palette.label,
    blending,
    clockLabel: clockLabel(minutes),
    minutes,
    vars: {
      '--sky-top': cssColor(palette.top),
      '--sky-mid': cssColor(palette.mid),
      '--sky-bottom': cssColor(palette.bottom),
      '--glow': cssColor(palette.glow),
      '--ink': cssColor(palette.ink),
      '--chrome': cssColor(palette.chrome),
      '--cloud': cssColor(palette.cloud),
      '--ground': cssColor(palette.ground),
      '--sun-x': `${sunPoint.x.toFixed(2)}%`,
      '--sun-y': `${sunPoint.y.toFixed(2)}%`,
      '--moon-x': `${moonPoint.x.toFixed(2)}%`,
      '--moon-y': `${moonPoint.y.toFixed(2)}%`,
      '--sun-opacity': sun.toFixed(3),
      '--moon-opacity': moon.toFixed(3),
      '--star-opacity': palette.star.toFixed(3),
      '--cloud-alpha': palette.cloudAlpha.toFixed(3),
      '--shadow': palette.shadow.toFixed(3),
      '--glint': palette.glint.toFixed(3),
      '--vignette': palette.vignette.toFixed(3),
      '--light-angle': lightAngle(guide.x),
    },
  }
}

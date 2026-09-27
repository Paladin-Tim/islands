import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { computeSky } from './model'

function currentMinutes(pulse: number) {
  void pulse
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60
}

export function useSkyClock(overrideMinutes: number | null) {
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    if (overrideMinutes !== null) return
    const id = window.setInterval(() => setPulse((value) => value + 1), 1000)
    return () => window.clearInterval(id)
  }, [overrideMinutes])

  const minutes = overrideMinutes ?? currentMinutes(pulse)
  const sky = useMemo(() => computeSky(minutes), [minutes])
  const moonHold = useRef<number | null>(null)
  const moonParked = useRef(false)

  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.phase = sky.phaseId
    const hidden = Number(sky.vars['--moon-opacity']) === 0

    for (const [key, value] of Object.entries(sky.vars)) {
      if (hidden && (key === '--moon-x' || key === '--moon-y')) continue
      root.style.setProperty(key, value)
    }

    if (!hidden) {
      if (moonHold.current !== null) {
        window.clearTimeout(moonHold.current)
        moonHold.current = null
      }
      moonParked.current = false
      return
    }

    if (moonParked.current || moonHold.current !== null) return

    const x = sky.vars['--moon-x']
    const y = sky.vars['--moon-y']
    moonHold.current = window.setTimeout(() => {
      moonHold.current = null
      moonParked.current = true
      const previous = root.style.transition
      root.style.transition = 'none'
      root.style.setProperty('--moon-x', x)
      root.style.setProperty('--moon-y', y)
      void root.offsetWidth
      root.style.transition = previous
    }, 1100)
  }, [sky])

  return sky
}

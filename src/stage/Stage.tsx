import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import './stage.css'
import { slides } from './slides'

type StageProps = {
  index: number
  onStep: (direction: number) => void
}

export function Stage({ index, onStep }: StageProps) {
  const onStepRef = useRef(onStep)

  useEffect(() => {
    onStepRef.current = onStep
  }, [onStep])

  useEffect(() => {
    let accumulated = 0
    let locked = false

    const onWheel = (event: WheelEvent) => {
      const target = event.target
      if (target instanceof Element && target.closest('.scrubber, input, textarea')) return
      event.preventDefault()
      if (locked) return

      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      accumulated += delta
      if (Math.abs(accumulated) < 70) return

      const direction = accumulated > 0 ? 1 : -1
      accumulated = 0
      locked = true
      window.setTimeout(() => {
        locked = false
      }, 480)
      onStepRef.current(direction)
    }

    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof Element && target.closest('input, textarea')) return
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
      event.preventDefault()
      onStepRef.current(event.key === 'ArrowRight' ? 1 : -1)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0) return
    const origin = event.clientX
    const onUp = (up: PointerEvent) => {
      const delta = up.clientX - origin
      if (delta <= -56) onStepRef.current(1)
      if (delta >= 56) onStepRef.current(-1)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointerup', onUp)
  }

  return (
    <main className="stage" aria-roledescription="карусель" aria-label="Кадры" onPointerDown={onPointerDown}>
      <div className="track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((slide, slideIndex) => (
          <article key={slide.id} className="slide" aria-hidden={slideIndex !== index}>
            <div className="caption">
              <p className="kicker">{slide.kicker}</p>
              <p className="title">{slide.title}</p>
              <p className="note">{slide.note}</p>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

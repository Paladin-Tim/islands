import { useCallback, useState } from 'react'
import { Footer } from './chrome/Footer'
import { Header } from './chrome/Header'
import { Sky } from './sky/Sky'
import { useSkyClock } from './sky/useSkyClock'
import { Stage } from './stage/Stage'
import { slides } from './stage/slides'

export default function App() {
  const [index, setIndex] = useState(0)
  const [overrideMinutes, setOverrideMinutes] = useState<number | null>(null)
  const [scrubberOpen, setScrubberOpen] = useState(false)
  const sky = useSkyClock(overrideMinutes)

  const select = useCallback((next: number) => {
    setIndex(Math.min(slides.length - 1, Math.max(0, next)))
  }, [])

  const step = useCallback((direction: number) => {
    setIndex((value) => Math.min(slides.length - 1, Math.max(0, value + direction)))
  }, [])

  return (
    <div className="app">
      <Sky />
      <Header index={index} clockLabel={sky.clockLabel} onSelect={select} />
      <Stage index={index} onStep={step} />
      <Footer
        sky={sky}
        customTime={overrideMinutes !== null}
        scrubberOpen={scrubberOpen}
        onToggleScrubber={() => setScrubberOpen((open) => !open)}
        onMinutes={setOverrideMinutes}
        onUseNow={() => setOverrideMinutes(null)}
      />
    </div>
  )
}

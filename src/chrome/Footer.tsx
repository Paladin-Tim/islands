import type { SkyState } from '../sky/model'
import './chrome.css'
import { TimeScrubber } from './TimeScrubber'

type FooterProps = {
  sky: SkyState
  customTime: boolean
  scrubberOpen: boolean
  onToggleScrubber: () => void
  onMinutes: (minutes: number) => void
  onUseNow: () => void
}

export function Footer({
  sky,
  customTime,
  scrubberOpen,
  onToggleScrubber,
  onMinutes,
  onUseNow,
}: FooterProps) {
  return (
    <>
      {scrubberOpen ? (
        <TimeScrubber sky={sky} customTime={customTime} onMinutes={onMinutes} onUseNow={onUseNow} />
      ) : null}
      <footer className="footer">
        <p className="phase">
          <span>{sky.phaseLabel}</span>
          {sky.blending ? <em>переход</em> : null}
          {customTime ? <em>вручную</em> : null}
        </p>
        <p className="keys" aria-hidden="true">
          ← →
        </p>
        <button type="button" aria-pressed={scrubberOpen} onClick={onToggleScrubber}>
          Время
        </button>
      </footer>
    </>
  )
}

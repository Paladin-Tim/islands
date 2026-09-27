import type { SkyState } from '../sky/model'

type TimeScrubberProps = {
  sky: SkyState
  customTime: boolean
  onMinutes: (minutes: number) => void
  onUseNow: () => void
}

export function TimeScrubber({ sky, customTime, onMinutes, onUseNow }: TimeScrubberProps) {
  return (
    <div className="scrubber">
      <div className="scrubber-top">
        <p>Время суток</p>
        <button type="button" onClick={onUseNow} disabled={!customTime}>
          Сейчас
        </button>
      </div>
      <p className="scrubber-clock">{sky.clockLabel}</p>
      <input
        type="range"
        min={0}
        max={1439}
        step={1}
        value={Math.floor(sky.minutes)}
        aria-label="Минуты от полуночи"
        aria-valuetext={sky.clockLabel}
        onChange={(event) => onMinutes(Number(event.target.value))}
      />
      <div className="scale" aria-hidden="true">
        <span>ночь</span>
        <span>утро</span>
        <span>день</span>
        <span>вечер</span>
      </div>
    </div>
  )
}

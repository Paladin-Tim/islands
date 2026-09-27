import { slides } from '../stage/slides'
import './chrome.css'

type HeaderProps = {
  index: number
  clockLabel: string
  onSelect: (index: number) => void
}

export function Header({ index, clockLabel, onSelect }: HeaderProps) {
  return (
    <header className="header">
      <h1>Islands</h1>
      <nav className="nav" aria-label="Кадры">
        {slides.map((slide, slideIndex) => (
          <button
            key={slide.id}
            type="button"
            aria-current={slideIndex === index ? 'true' : undefined}
            onClick={() => onSelect(slideIndex)}
          >
            <span className="dot" />
            <span className="nav-label">{slide.title}</span>
          </button>
        ))}
      </nav>
      <time className="clock" dateTime={clockLabel}>
        {clockLabel}
      </time>
    </header>
  )
}

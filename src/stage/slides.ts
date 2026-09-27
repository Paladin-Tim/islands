export type Slide = {
  id: string
  kicker: string
  title: string
  note: string
}

export const slides: readonly Slide[] = [
  { id: 'meadow', kicker: '01', title: 'Поляна', note: 'Первый кадр' },
  { id: 'map', kicker: '02', title: 'Карта', note: 'Объекты на земле' },
  { id: 'island', kicker: '03', title: 'Остров', note: 'Один ландшафт' },
]

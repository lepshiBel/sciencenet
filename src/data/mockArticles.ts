import type { Article, PublicationType, ScienceField } from '../types/article';

export const SCIENCE_FIELDS: ScienceField[] = [
  'Astronomia',
  'Biologia',
  'Fizyka',
  'Informatyka',
  'Chemia',
  'Medycyna',
];

export const PUBLICATION_TYPES: PublicationType[] = [
  'Artykuł badawczy',
  'Przegląd',
  'Preprint',
  'Notatka badawcza',
];

// Maps each science field to its dedicated CSS custom property tokens
export const FIELD_STYLES: Record<
  ScienceField,
  { bg: string; text: string; border: string }
> = {
  Astronomia: {
    bg: 'var(--field-astro-bg)',
    text: 'var(--field-astro-text)',
    border: 'var(--field-astro-border)',
  },
  Biologia: {
    bg: 'var(--field-bio-bg)',
    text: 'var(--field-bio-text)',
    border: 'var(--field-bio-border)',
  },
  Fizyka: {
    bg: 'var(--field-phys-bg)',
    text: 'var(--field-phys-text)',
    border: 'var(--field-phys-border)',
  },
  Informatyka: {
    bg: 'var(--field-it-bg)',
    text: 'var(--field-it-text)',
    border: 'var(--field-it-border)',
  },
  Chemia: {
    bg: 'var(--field-chem-bg)',
    text: 'var(--field-chem-text)',
    border: 'var(--field-chem-border)',
  },
  Medycyna: {
    bg: 'var(--field-med-bg)',
    text: 'var(--field-med-text)',
    border: 'var(--field-med-border)',
  },
};

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Nowe obserwacje teleskopu Jamesa Webba w gromadzie galaktyk',
    author: 'dr hab. Anna Kowalska',
    field: 'Astronomia',
    publicationType: 'Artykuł badawczy',
    tags: ['jwst', 'spektroskopia', 'egzoplanety'],
    content:
      'Najnowsze dane spektroskopowe ujawniają obecność złożonych cząsteczek organicznych w dyskach protoplanetarnych oddalonych o ponad 400 lat świetlnych od Ziemi. Odkrycie to rzuca nowe światło na powstawanie układów planetarnych oraz wczesną ewolucję chemiczną materii międzygwiazdowej.\n\nAnaliza widmowa w podczerwieni pozwoliła wyodrębnić sygnatury wody, metanu oraz prostych węglowodorów aromatycznych z niespotykaną dotąd precyzją.',
    imageUrl:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80',
    createdAt: '2026-11-16T14:30:00.000Z',
    likes: 24,
    isLiked: false,
    isSaved: true,
    comments: [
      {
        id: 'com-1',
        author: 'prof. Marek Nowak',
        text: 'Imponująca rozdzielczość widmowa. Czekamy na publikację surowych danych!',
        createdAt: '2026-11-16T15:10:00.000Z',
      },
    ],
  },
  {
    id: 'art-2',
    title: 'Symulacje fizyczne i optymalizacja wielowątkowa w silnikach czasu rzeczywistego',
    author: 'Elisey Avvakumov',
    field: 'Informatyka',
    publicationType: 'Preprint',
    tags: ['gamedev', 'symulacje', 'optymalizacja'],
    content:
      'Współczesne symulacje interaktywne wymagają deterministycznego rozwiązywania kolizji oraz dynamiki ciał sztywnych w oknie poniżej 16 milisekund. W pracy przedstawiono architekturę opartą na strukturach Data-Oriented Design (DOD), która minimalizuje chybienia pamięci podręcznej procesora.\n\nPrzeprowadzone benchmarki wykazały wzrost przepustowości obliczeń o 38% w porównaniu z klasycznym podejściem obiektowym.',
    createdAt: '2026-11-15T10:15:00.000Z',
    likes: 18,
    isLiked: true,
    isSaved: false,
    comments: [],
  },
  {
    id: 'art-3',
    title: 'Mechanizmy regeneracji komórkowej u płazów ogoniastych',
    author: 'dr Katarzyna Zielińska',
    field: 'Biologia',
    publicationType: 'Artykuł badawczy',
    tags: ['genetyka', 'regeneracja', 'biologia-komórkowa'],
    content:
      'Badania nad ekspresją genów w blastemie pokazują, że kluczową rolę w odbudowie tkanek odgrywa lokalna sygnalizacja białkowa oraz szybka przebudowa macierzy zewnątrzkomórkowej w pierwszych 48 godzinach po urazie.\n\nZrozumienie tych szlaków molekularnych stanowi fundament dla przyszłych terapii medycyny regeneracyjnej.',
    imageUrl:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=900&q=80',
    createdAt: '2026-11-14T18:45:00.000Z',
    likes: 31,
    isLiked: false,
    isSaved: false,
    comments: [
      {
        id: 'com-2',
        author: 'dr Tomasz Lewandowski',
        text: 'Czy planujecie badania porównawcze z ssakami w kolejnym etapie?',
        createdAt: '2026-11-14T20:05:00.000Z',
      },
    ],
  },
  {
    id: 'art-4',
    title: 'Nadprzewodnictwo wysokotemperaturowe w materiałach warstwowych',
    author: 'prof. dr hab. Jan Wójcik',
    field: 'Fizyka',
    publicationType: 'Przegląd',
    tags: ['nadprzewodnictwo', 'fizyka-ciała-stałego', 'materiały'],
    content:
      'Analiza struktury pasmowej nowych związków na bazie miedzi i tlenu sugeruje, że korelacje elektronowe w płaszczyznach krystalicznych można stabilizować poprzez kontrolowane domieszkowanie.',
    createdAt: '2026-11-13T09:20:00.000Z',
    likes: 12,
    isLiked: false,
    isSaved: false,
    comments: [],
  },
];
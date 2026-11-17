import type { Article, ScienceField } from '../types/article';

export const SCIENCE_FIELDS: ScienceField[] = [
  'Astronomia',
  'Biologia',
  'Fizyka',
  'Informatyka',
  'Chemia',
  'Medycyna',
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Nowe obserwacje teleskopu Jamesa Webba w gromadzie galaktyk',
    author: 'dr hab. Anna Kowalska',
    field: 'Astronomia',
    content:
      'Najnowsze dane spektroskopowe ujawniają obecność złożonych cząsteczek organicznych w dyskach protoplanetarnych oddalonych o ponad 400 lat świetlnych od Ziemi. Odkrycie to rzuca nowe światło na powstawanie układów planetarnych.',
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
    title: 'Optymalizacja sieci neuronowych MLP w analizie obrazów medycznych',
    author: 'mgr inż. Piotr Wiśniewski',
    field: 'Informatyka',
    content:
      'Zastosowanie regularyzacji oraz odpowiedniego doboru funkcji aktywacji pozwala znacząco zmniejszyć przeuczenie modeli klasyfikujących na niewielkich zbiorach danych klinicznych bez konieczności użycia głębokich sieci konwolucyjnych.',
    // Intentionally omitted imageUrl to test card layout without image
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
    content:
      'Badania nad ekspresją genów w blastemie pokazują, że kluczową rolę w odbudowie tkanek odgrywa lokalna sygnalizacja białkowa oraz szybka przebudowa macierzy zewnątrzkomórkowej w pierwszych 48 godzinach po urazie.',
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
    content:
      'Analiza struktury pasmowej nowych związków na bazie miedzi i tlenu sugeruje, że korelacje elektronowe w płaszczyznach krystalicznych można stabilizować poprzez kontrolowane domieszkowanie.',
    createdAt: '2026-11-13T09:20:00.000Z',
    likes: 12,
    isLiked: false,
    isSaved: false,
    comments: [],
  },
];
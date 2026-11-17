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

export interface FieldColorToken {
  bg: string;
  text: string;
  border: string;
}

export const FIELD_STYLES: Record<ScienceField, FieldColorToken> = {
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
    id: 'art-101',
    title: 'Nowe obserwacje teleskopu Jamesa Webba w gromadzie galaktyk',
    author: 'dr hab. Anna Kowalska',
    isVerifiedAuthor: true,
    field: 'Astronomia',
    publicationType: 'Artykuł badawczy',
    tags: ['jwst', 'spektroskopia', 'egzoplanety'],
    content:
      'Najnowsze dane spektroskopowe ujawniają obecność złożonych cząsteczek organicznych w dyskach protoplanetarnych oddalonych o ponad 400 lat świetlnych od Ziemi. Odkrycie to rzuca nowe światło na powstawanie układów planetarnych oraz wczesną ewolucję chemiczną materii międzygwiazdowej.\n\n> Analiza widmowa w podczerwieni (`NIRSpec`) pozwoliła wyodrębnić sygnatury wody, metanu oraz prostych węglowodorów aromatycznych z niespotykaną dotąd precyzją.',
    imageUrl:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1000&q=80',
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
      {
        id: 'com-1b',
        author: 'Elisey Avvakumov',
        isOwn: true,
        text: 'Czy planujecie udostępnić zbiory FITS do testowania algorytmów detekcji widm?',
        createdAt: '2026-11-16T16:05:00.000Z',
      },
    ],
  },
  {
    id: 'art-102',
    title: 'Architektura ECS i deterministyczne symulacje fizyczne w silnikach gier czasu rzeczywistego',
    author: 'Elisey Avvakumov',
    isOwn: true,
    isVerifiedAuthor: true,
    field: 'Informatyka',
    publicationType: 'Artykuł badawczy',
    tags: ['symulacje', 'ecs', 'algorytmy', 'optymalizacja'],
    content:
      'W złożonych grach strategicznych i symulacyjnych klasyczne podejście obiektowe prowadzi do fragmentacji pamięci podręcznej CPU (`cache miss`). Zastosowanie wzorca Entity-Component-System (ECS) z ciągłymi tablicami komponentów pozwala przetwarzać dziesiątki tysięcy jednostek w czasie poniżej `2.5 ms` na klatkę.\n\n```typescript\n// Deterministyczny krok integracji pozycji w systemie ECS\nexport function integrateMovementSystem(entities: TransformChunk, dt: number): void {\n  for (let i = 0; i < entities.count; i++) {\n    entities.posX[i] += entities.velX[i] * dt;\n    entities.posY[i] += entities.velY[i] * dt;\n  }\n}\n```\n\n> Kluczowym warunkiem powtarzalności symulacji w trybie wieloosobowym jest stały krok czasowy `FIXED_DT = 1 / 60` oraz unikanie niedeterministycznego sortowania zmiennoprzecinkowego.',
    imageUrl:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
    createdAt: '2026-11-15T18:20:00.000Z',
    likes: 31,
    isLiked: true,
    isSaved: false,
    comments: [
      {
        id: 'com-2a',
        author: 'dr Piotr Zieliński',
        text: 'Świetny przykład ułożenia danych SoA (Structure of Arrays). Różnica w L1 cache jest kolosalna.',
        createdAt: '2026-11-15T19:00:00.000Z',
      },
    ],
  },
  {
    id: 'art-103',
    title: 'Zastosowanie sieci neuronowych typu Transformer w analizie sekwencji genomowych',
    author: 'dr Piotr Zieliński',
    isVerifiedAuthor: true,
    field: 'Informatyka',
    publicationType: 'Preprint',
    tags: ['ai', 'bioinformatyka', 'algorytmy', 'deep-learning'],
    content:
      'Modele oparte na mechanizmie uwagi (`self-attention`) pozwalają na wykrywanie długodystansowych zależności w niekodujących regionach DNA bez konieczności ręcznego definiowania cech.\n\n```python\ndef compute_attention_score(query, key, scale_factor):\n    # Skalowany iloczyn skalarny dla okien sekwencji nukleotydowych\n    return (query @ key.T) / scale_factor\n```\n\nEksperymenty przeprowadzone na zbiorze referencyjnym wykazały wzrost trafności predykcji miejsc regulatorowych o `14.2%` względem klasycznych sieci splotowych (CNN).',
    imageUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
    createdAt: '2026-11-14T11:15:00.000Z',
    likes: 41,
    isLiked: false,
    isSaved: false,
    comments: [],
  },
  {
    id: 'art-104',
    title: 'Nadprzewodnictwo wysokotemperaturowe w strukturach warstwowych grafenu',
    author: 'prof. dr hab. Janusz Wiśniewski',
    isVerifiedAuthor: true,
    field: 'Fizyka',
    publicationType: 'Przegląd',
    tags: ['grafen', 'nadprzewodnictwo', 'fizyka-ciała-stałego'],
    content:
      'Skręcenie dwóch warstw grafenu pod tzw. kątem magicznym (`θ ≈ 1.1°`) prowadzi do powstania płaskich pasm elektronowych oraz silnych korelacji między elektronami.\n\n> Zjawisko to otwiera drogę do projektowania przełączników kwantowych sterowanych wyłącznie napięciem bramki elektrostatycznej, bez zmiany składu chemicznego próbki.',
    imageUrl:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1000&q=80',
    createdAt: '2026-11-13T09:45:00.000Z',
    likes: 18,
    isLiked: false,
    isSaved: true,
    comments: [
      {
        id: 'com-2',
        author: 'dr Katarzyna Lewandowska',
        text: 'Bardzo klarowne podsumowanie aktualnego stanu badań nad układami moiré.',
        createdAt: '2026-11-13T12:20:00.000Z',
      },
    ],
  },
  {
    id: 'art-105',
    title: 'Proceduralne generowanie biomów i erozji hydraulicznej w środowiskach 3D',
    author: 'Elisey Avvakumov',
    isOwn: true,
    isVerifiedAuthor: true,
    field: 'Informatyka',
    publicationType: 'Notatka badawcza',
    tags: ['symulacje', 'grafika-3d', 'algorytmy'],
    content:
      'Połączenie wielooktawowego szumu Perlina z symulacją cząsteczkową spływu wody pozwala uzyskać realistyczne doliny rzeczne i stożki napływowe w czasie rzeczywistym.\n\nW naszych testach `120 000` wirtualnych kropel wody na siatce `512×512` generuje naturalną sieć hydrograficzną w niespełna `38 ms` na układzie GPU.',
    createdAt: '2026-11-11T16:00:00.000Z',
    likes: 19,
    isLiked: false,
    isSaved: false,
    comments: [
      {
        id: 'com-5a',
        author: 'Elisey Avvakumov',
        isOwn: true,
        text: 'W kolejnej wersji dodam również zależność erozji od twardości warstw skalnych.',
        createdAt: '2026-11-11T16:15:00.000Z',
      },
    ],
  },
  {
    id: 'art-106',
    title: 'Mechanizmy adaptacji mikrobiomu glebowego do długotrwałego stresu suszy',
    author: 'dr n. biol. Ewa Dąbrowska',
    isVerifiedAuthor: true,
    field: 'Biologia',
    publicationType: 'Notatka badawcza',
    tags: ['mikrobiom', 'ekologia', 'bioinformatyka'],
    content:
      'Wstępne wyniki sekwencjonowania `16S rRNA` wskazują na wyraźny wzrost udziału promieniowców (*Actinobacteria*) w ryzosferze zbóż poddanych kontrolowanemu deficytowi wody.\n\nMikroorganizmy te produkują osmoprotektanty stabilizujące błony komórkowe korzeni i ograniczające utratę turgoru w fazie kwitnienia.',
    imageUrl:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1000&q=80',
    createdAt: '2026-11-10T10:10:00.000Z',
    likes: 14,
    isLiked: false,
    isSaved: false,
    comments: [],
  },
  {
    id: 'art-107',
    title: 'Katalizatory fotochemiczne oparte na perowskitach bez zawartości ołowiu',
    author: 'dr inż. Tomasz Kaczmarek',
    isVerifiedAuthor: true,
    field: 'Chemia',
    publicationType: 'Artykuł badawczy',
    tags: ['kataliza', 'perowskity', 'spektroskopia'],
    content:
      'Zastąpienie ołowiu bizmutem oraz antymonem w strukturach podwójnych perowskitów (`Cs2AgBiBr6`) znacząco poprawia stabilność termiczną materiału w środowisku wodnym.\n\nPomiary spektroskopii absorpcyjnej potwierdziły wydajną redukcję `CO2` do tlenku węgla pod wpływem światła widzialnego.',
    imageUrl:
      'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=1000&q=80',
    createdAt: '2026-11-08T13:40:00.000Z',
    likes: 22,
    isLiked: false,
    isSaved: false,
    comments: [],
  },
  {
    id: 'art-108',
    title: 'Biomarkery wczesnej neuroplastyczności w rehabilitacji poudarowej',
    author: 'dr hab. n. med. Magdalena Szymańska',
    isVerifiedAuthor: true,
    field: 'Medycyna',
    publicationType: 'Przegląd',
    tags: ['neurologia', 'biomarkery', 'ai'],
    content:
      'Monitorowanie stężenia czynnika neurotroficznego pochodzenia mózgowego (`BDNF`) w połączeniu z ilościową elektroencefalografią (`qEEG`) umożliwia personalizację intensywności treningu motorycznego.\n\n> Pacjenci objęci protokołem adaptacyjnym osiągnęli o `27%` wyższy wynik w skali Fugl-Meyera po 8 tygodniach terapii.',
    createdAt: '2026-11-06T09:00:00.000Z',
    likes: 29,
    isLiked: false,
    isSaved: true,
    comments: [],
  },
  {
    id: 'art-109',
    title: 'Modelowanie atmosfer egzoplanet typu gorący Jowisz z uwzględnieniem chmur krzemianowych',
    author: 'dr hab. Anna Kowalska',
    isVerifiedAuthor: true,
    field: 'Astronomia',
    publicationType: 'Preprint',
    tags: ['egzoplanety', 'jwst', 'symulacje'],
    content:
      'Trójwymiarowe modele cyrkulacji ogólnej (`GCM`) pokazują, że silne wiatry strefowe przenoszą aerozole krzemianowe ze strony dziennej na nocną, powodując wyraźną asymetrię krzywej fazowej w podczerwieni.',
    createdAt: '2026-11-04T17:25:00.000Z',
    likes: 16,
    isLiked: false,
    isSaved: false,
    comments: [],
  },
  {
    id: 'art-110',
    title: 'Balansowanie ekonomii zasobów i krzywej trudności w grach survivalowych',
    author: 'Elisey Avvakumov',
    isOwn: true,
    isVerifiedAuthor: true,
    field: 'Informatyka',
    publicationType: 'Preprint',
    tags: ['symulacje', 'optymalizacja', 'grafika-3d'],
    content:
      'W projektowaniu systemów przetrwania kluczowe jest utrzymanie napięcia między konsumpcją energii a tempem pozyskiwania surowców.\n\n```typescript\n// Funkcja kosztu utrzymania załogi w zależności od poziomu stresu\nexport const computeSurvivalDrain = (baseRate: number, stressLevel: number): number => {\n  return Number((baseRate * (1 + Math.pow(stressLevel / 100, 1.5))).toFixed(3));\n};\n```\n\nSymulacje Monte Carlo przeprowadzone dla `10 000` sesji testowych pozwoliły wyeliminować tzw. martwe pętle surowcowe w środkowej fazie rozgrywki.',
    createdAt: '2026-11-02T12:10:00.000Z',
    likes: 27,
    isLiked: true,
    isSaved: false,
    comments: [],
  },
];
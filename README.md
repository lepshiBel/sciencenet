# ScienceNet — Academic Research Network

Portal społecznościowy i repozytorium dla ludzi nauki zbudowane we **Vue 3**, **TypeScript**, **Pinia** oraz **Vue Router**.

## Funkcjonalności

- **Główna tablica publikacji i pełnotekstowe wyszukiwanie:** zwijany edytor z panelem szybkiego wstawiania (wzory, równania, tezy, bloki kodu) i trybem **Podglądu na żywo**, sortowanie (najnowsze, najpopularniejsze, najczęściej komentowane) oraz wyszukiwanie po tytułach, treści, autorach, tagach i prywatnych notatkach.
- **Formatowanie naukowe treści:** bezpieczny parser bloków kodu (` ``` `), formuł matematycznych w linii (`$...$`) i blokowych (`$$...$$`) z obsługą indeksów i symboli greckich oraz wyróżnionych tez badawczych (`>`).
- **Taksonomia i profil badacza:** podział na *Artykuł badawczy*, *Przegląd*, *Preprint* oraz *Notatkę badawczą*, kategoryzacja według dziedzin nauki, interaktywne tagi (`#słowa-kluczowe`), karta podsumowania wybranego autora oraz wskaźniki naukometryczne (publikacje, cytowania, `h-index`).
- **Czytelnia i prywatne notatki badawcze:** pełnoekranowy tryb czytania z dyskusją naukową (edycja i usuwanie komentarzy), sekcją *Powiązane publikacje*, prywatnymi notatkami badacza (`personalNote`) oraz jednolitym widokiem czytelni (`/saved`).
- **Generator cytowań i archiwum (APA, BibTeX, JSON):** kopiowanie pojedynczych cytowań APA/BibTeX, zbiorczy eksport całej czytelni do pliku `.bib` oraz eksport/import bazy danych w formacie `.json`.
- **Motywy i responsywność (RWD):** tryb jasny i ciemny (*Light / Dark*), powiadomienia Toast z funkcją cofania usunięcia oraz 3-kolumnowy układ adaptujący się do urządzeń mobilnych.

## Uruchomienie projektu

1. **Zainstaluj zależności:**
   ```bash
   npm install
   ```

2. **Uruchom serwer deweloperski:**
   ```bash
   npm run dev
   ```

3. **Zbuduj wersję produkcyjną:**
   ```bash
   npm run build
   ```
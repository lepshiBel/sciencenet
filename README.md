# ScienceNet — Academic Research Network

Portal społecznościowy dla ludzi nauki zbudowany we **Vue 3**, **TypeScript**, **Pinia** oraz **Vue Router**.

## Funkcjonalności

- **Główna tablica publikacji:** zwijany formularz tworzenia wpisów, sortowanie (najnowsze, najpopularniejsze, najczęściej komentowane), obsługa kart z ryciną (URL) oraz bez obrazka, szacowany czas czytania.
- **Formaty prac i taksonomia:** podział na *Artykuł badawczy*, *Przegląd*, *Preprint* oraz *Notatkę badawczą*, kategoryzacja według dziedzin nauki, interaktywne tagi (`#słowa-kluczowe`) oraz filtrowanie po wybranym autorze.
- **Generator cytowań (APA & BibTeX):** automatyczne tworzenie gotowych opisów bibliograficznych z kopiowaniem do schowka jednym kliknięciem.
- **Tryb czytania (Reader Modal):** pełnoekranowy widok skupionej lektury z dyskusją naukową i blokadą przewijania tła.
- **Analityka i archiwum JSON:** rozkład publikacji według dziedzin nauki w panelu bocznym, powiadomienia Toast (z funkcją cofnięcia usunięcia) oraz eksport/import bazy danych w formacie `.json`.
- **Profil badacza i motywy (Light / Dark):** edytowalna wizytówka z synchronizacją autorstwa oraz przełącznik motywu jasnego i ciemnego z zapisem w `localStorage`.
- **Responsywność (RWD):** 3-kolumnowy układ na desktopie oraz czytelny układ 1-kolumnowy na urządzeniach mobilnych.

## Uruchomienie projektu

1. **Zainstaluj zależności:**
   ```bash
   npm install
   ```

2. **Uruchom serwer deweloperski:**
   ```bash
   npm run dev
   ```

3. **Otwórz aplikację w przeglądarce** pod adresem wyświetlonym w terminalu (domyślnie `http://localhost:5173`).
# ScienceNet — Academic Research Network

Portal społecznościowy i repozytorium dla ludzi nauki zbudowane we **Vue 3**, **TypeScript**, **Pinia** oraz **Vue Router**.

## Funkcjonalności

- **Główna tablica publikacji:** zwijany formularz tworzenia wpisów, sortowanie (najnowsze, najpopularniejsze, najczęściej komentowane), obsługa kart z ryciną (URL) oraz bez obrazka, szacowany czas czytania.
- **Formatowanie naukowe treści:** wsparcie dla bloków kodu (` ``` `), formuł i zmiennych w tekście (` ` `) oraz wyróżnionych tez badawczych (`>`).
- **Formaty prac i taksonomia:** podział na *Artykuł badawczy*, *Przegląd*, *Preprint* oraz *Notatkę badawczą*, kategoryzacja według dziedzin nauki, interaktywne tagi (`#słowa-kluczowe`) oraz filtrowanie po wybranym autorze.
- **Generator cytowań (APA & BibTeX):** automatyczne tworzenie gotowych opisów bibliograficznych z kopiowaniem do schowka jednym kliknięciem.
- **Tryb czytania (Reader Modal):** pełnoekranowy widok skupionej lektury z dyskusją naukową (edycja i usuwanie własnych komentarzy) oraz sekcją *Powiązane publikacje*.
- **Profil badacza i wskaźniki naukometryczne:** edytowalna wizytówka z automatycznym obliczaniem liczby publikacji, cytowań oraz indeksu Hirscha (`h-index`), status weryfikacji akademickiej oraz przełącznik motywu jasnego i ciemnego (*Light / Dark*).
- **Analityka i archiwum JSON:** rozkład publikacji według dziedzin nauki w panelu bocznym, powiadomienia Toast (z funkcją cofnięcia usunięcia) oraz eksport/import bazy danych w formacie `.json`.
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

3. **Zbuduj wersję produkcyjną:**
   ```bash
   npm run build
   ```
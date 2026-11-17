# ScienceNet — Academic Research Network

Portal społecznościowy dla ludzi nauki zbudowany we **Vue 3**, **TypeScript**, **Pinia** oraz **Vue Router**.

## Funkcjonalności

- **Główna tablica publikacji:** sortowanie (najnowsze, najpopularniejsze, najczęściej komentowane), obsługa kart z ryciną (URL) oraz bez obrazka, szacowany czas czytania.
- **Formaty prac i taksonomia:** podział na *Artykuł badawczy*, *Przegląd*, *Preprint* oraz *Notatkę badawczą*, kategoryzacja według dziedzin nauki oraz interaktywne tagi (`#słowa-kluczowe`).
- **Tryb czytania (Reader Modal):** pełnoekranowy widok skupionej lektury z dyskusją naukową i blokadą przewijania tła.
- **Profil badacza:** edytowalna wizytówka użytkownika z automatyczną synchronizacją autorstwa w opublikowanych artykułach oraz filtrem *Moje publikacje*.
- **Motyw jasny i ciemny (Light / Dark):** przełącznik palety kolorystycznej z zapisem preferencji w `localStorage`.
- **Trwałość danych (`localStorage`):** artykuły, polubienia, zakładki (`/saved`), komentarze oraz profil zapisują się lokalnie w przeglądarce.
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
# ScienceNet — Portal społecznościowy dla ludzi nauki

Projekt zaliczeniowy zbudowany we **Vue 3**, **TypeScript**, **Pinia** oraz **Vue Router**.

## Funkcjonalności
- **Główna tablica artykułów:** sortowanie od najnowszych, obsługa kart z obrazkiem (URL) oraz bez obrazka.
- **Trwałość danych (`localStorage`):** artykuły, polubienia, zakładki oraz komentarze zapisują się automatycznie w przeglądarce.
- **Interakcje:** system polubień („Lubię to”) z dynamicznym rankingiem najpopularniejszych publikacji, komentarze pod artykułami, edycja oraz usuwanie wpisów.
- **Wyszukiwanie i filtrowanie:** filtrowanie artykułów po tytule w czasie rzeczywistym oraz według dziedziny nauki.
- **Zapisane artykuły:** dedykowana podstrona `/saved` z listą zakładek.
- **Responsywność (RWD):** 3-kolumnowy układ na desktopie oraz czytelny układ 1-kolumnowy na urządzeniach mobilnych.

## Uruchomienie projektu
\`\`\`bash
npm install
npm run dev
\`\`\`
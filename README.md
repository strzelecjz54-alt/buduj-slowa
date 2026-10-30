# Buduj słowa

Prosta aplikacja na telefon do nauki zwrotów z placu budowy. Osobne tryby: rosyjski, angielski i niemiecki. Interfejs po polsku.

## Co już działa

- Pierwsze 20 najważniejszych zwrotów z dostarczonej listy w 4 lekcjach po 5 zwrotów.
- Karty do nauki, quizy, punkty XP i powtórki błędnych odpowiedzi.
- Po „Dalej” na karcie nauki automatycznie odczytywany jest nowy zwrot. W quizie odczytywana jest wybrana odpowiedź w języku nauki, również błędna; przycisk „Posłuchaj” przy wyniku odczytuje poprawne tłumaczenie. Nowe pytanie quizu nie zdradza odpowiedzi odsłuchem.
- Krótkie dźwięki poprawnej i błędnej odpowiedzi, czytelne potwierdzenie z tłumaczeniem i panel „Głośność” u góry z osobnymi suwakami wymowy i sygnałów odpowiedzi oraz wyciszeniem sygnałów. Poziomy głośności i wyciszenie są zapamiętywane; nie wyłącza odsłuchu wymowy. Sygnały są generowane lokalnie, również offline.
- Słownik wszystkich 139 zwrotów z wyszukiwaniem, kategoriami i ćwiczeniem pojedynczego zwrotu.
- Uproszczony zapis rosyjskiej wymowy polskimi literami. Jest pomocniczy; nie oddaje dokładnie akcentu i wszystkich dźwięków.
- Odsłuch przez głosy systemowe telefonu. Gdy lista głosów jest niepełna, aplikacja prosi system o wybór głosu dla żądanego języka. Ostrzeżenie pojawia się przy błędzie odtwarzania; przerwanie wcześniejszego odsłuchu nie wyświetla błędu. Dostępność i działanie bez internetu zależą od telefonu.
- Zapis postępów osobno dla języków w pamięci przeglądarki; bez konta i synchronizacji.
- Instalacja na ekranie głównym i tryb offline po pierwszym pełnym otwarciu przez HTTPS.

## Jak uruchomić na swoim telefonie po raz pierwszy

1. W repozytorium GitHub otwórz **Settings → Pages**.
2. W sekcji **Build and deployment** wybierz źródło **Deploy from a branch**.
3. Wybierz gałąź **main** i folder **/(root)**. Kliknij **Save**.
4. Poczekaj, aż GitHub pokaże adres opublikowanej strony. Otwórz ten adres na telefonie. Pierwsza publikacja może potrwać kilka minut. GitHub Pages musi być dostępne dla ustawień i planu tego repozytorium.
5. Android / Chrome: menu **⋮ → Dodaj do ekranu głównego / Zainstaluj aplikację**. iPhone / Safari: **Udostępnij → Do ekranu początkowego → Dodaj**.

Kod w repozytorium nie oznacza jeszcze, że GitHub Pages jest włączone. Nie wymaga to sklepu Google Play ani App Store. Nie wpisuj żadnych kluczy API ani haseł w aplikacji.

## Rozwój lokalny

Nie ma zależności do instalacji ani etapu kompilacji. Wymagany Python 3 do serwera i Node.js do testów logiki.

```sh
cd /workspace/buduj-slowa
python3 -m http.server 8000 --bind 0.0.0.0
```

Serwuj aplikację przez HTTP lokalnie albo HTTPS na telefonie. Otwieranie `index.html` jako pliku nie obsługuje modułów i trybu offline. Serwer lokalny służy do rozwoju; do używania na telefonie skorzystaj z publikacji HTTPS opisanej powyżej.

```sh
node tests/learning.test.js
```

Testy sprawdzają import danych, unikalne odpowiedzi w trzech językach, punkty i niezależność powtórek. Podczas implementacji sprawdzono także pełną lekcję w Chromium przy szerokości 390 px, poprawne i błędne odpowiedzi, zapis po odświeżeniu, wyszukiwanie, kategorię oraz ponowne otwarcie offline. Odsłuch na fizycznym telefonie wymaga osobnego sprawdzenia.

Zmieniając pliki aplikacji, zwiększ wersję `CACHE` w `sw.js` oraz parametr wersji w adresach plików i importach modułów. Aktualizuj również listę `FILES`, aby odświeżyć zasoby offline. Rejestracja service workera pomija pamięć HTTP; aktualizacja na ekranie nauki nie przeładowuje trwającej lekcji. Czyszczenie danych witryny usuwa postępy.

## Materiał i bezpieczeństwo

Tłumaczenia pochodzą z dostarczonego pliku `slownictwo_plac_budowy_RU_EN_DE.txt`. Zachowano ich brzmienie, w tym grzecznościowe formy rosyjskie. Dodatkowo przygotowano przybliżoną wymowę rosyjską. Przed użyciem komend w pracy zweryfikuj je z osobą znającą język. Przy manewrach i pracy dźwigu stosuj ustalone sygnały i komendy; aplikacja służy nauce.

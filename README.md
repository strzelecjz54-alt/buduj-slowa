# Buduj słowa

Prosta aplikacja na telefon do nauki zwrotów z placu budowy. Osobne tryby: rosyjski, angielski i niemiecki. Interfejs po polsku.

## Co już działa

- Pełny kurs: 304 zwroty w 15 modułach z dostarczonego słownika, podzielone na 68 lekcji po 4–5 zwrotów. Pierwsze 20 zwrotów pozostaje początkiem kursu.
- Karty do nauki, quizy, punkty XP i „Poprawka” błędnych odpowiedzi.
- Po „Dalej” na karcie nauki automatycznie odczytywany jest nowy zwrot. W quizie odczytywana jest wybrana odpowiedź w języku nauki, również błędna. Błędny wybór znika, a pytanie trwa aż do trafienia poprawnej odpowiedzi. Nie jest ona ujawniana wcześniej. Zwrot z pomyłką zostaje do powtórki mimo późniejszej poprawy; przycisk „Posłuchaj” przy wyniku odczytuje poprawne tłumaczenie. Nowe pytanie quizu nie zdradza odpowiedzi odsłuchem.
- Krótkie dźwięki poprawnej i błędnej odpowiedzi, czytelne potwierdzenie z tłumaczeniem i panel „Głośność” u góry z osobnymi suwakami wymowy i sygnałów odpowiedzi oraz wyciszeniem sygnałów. Poziomy głośności i wyciszenie są zapamiętywane; nie wyłącza odsłuchu wymowy. Sygnały są generowane lokalnie, również offline.
- Słownik wszystkich 304 zwrotów z wyszukiwaniem, kategoriami i ćwiczeniem pojedynczego zwrotu.
- Odsłuch przez głosy systemowe telefonu. Gdy lista głosów jest niepełna, aplikacja prosi system o wybór głosu dla żądanego języka. Ostrzeżenie pojawia się przy błędzie odtwarzania; przerwanie wcześniejszego odsłuchu nie wyświetla błędu. Dostępność i działanie bez internetu zależą od telefonu.
- Zapis postępów osobno dla języków w pamięci przeglądarki; bez konta i synchronizacji.
- Instalacja na ekranie głównym i tryb offline po pierwszym pełnym otwarciu przez HTTPS.

- Punkty za rozwiązanie pytania: 10 XP bez pomyłki, 7 XP po jednej, 4 XP po dwóch, 1 XP po trzech. Błędne kliknięcia nie dodają punktów; stare wyniki pozostają bez zmian.
- „Powtórka”: sam quiz z 10 losowych nauczonych zwrotów w wybranym języku (co najmniej jedna poprawna odpowiedź w historii). Przy mniejszej puli zwroty powtarzają się do 10 pytań, z informacją przed startem.

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

Tłumaczenia pochodzą z dostarczonego pliku `slownictwo_plac_budowy_RU_EN_DE.txt`. Aktualna wersja odpowiada poprawionemu słownikowi użytkownika `slownik_PL_RU_EN_DE (1).txt`, z zachowaniem kolejności i treści wszystkich 304 wierszy. Na prośbę użytkownika nowy kurs zeruje punkty i postęp przez użycie nowego klucza `buduj-slowa-v2`. Głośność, wyciszenie i wybór języka pozostają zapisane. Rosyjski zapis fonetyczny został usunięty; do nauki wymowy służy odsłuch. Przed użyciem komend w pracy zweryfikuj je z osobą znającą język. Przy manewrach i pracy dźwigu stosuj ustalone sygnały i komendy; aplikacja służy nauce.

## Pobierz słownik

Aktualne 304 haseł w czterech językach: [TXT](exports/slownik_PL_RU_EN_DE.txt) i [CSV / Excel](exports/slownik_PL_RU_EN_DE.csv). Plik CSV ma kodowanie UTF-8 z BOM i separator średnik. W quizie wykluczane są warianty równoważne i różniące się tylko interpunkcją.

## Moduły kursu i aktualizowanie materiału

Kurs obejmuje 15 modułów w kolejności z pliku użytkownika: podstawowe komendy, manewrowanie, ciężarówka i miejsca, przygotowanie rozładunku, sprzęt, podwieszanie i przemieszczanie, odkładanie ładunku, położenie i odległości, konfiguracja dźwigu, załadunek, zasilanie, narzędzia, bezpieczeństwo, organizacja pracy, pytania i radio. Każdy moduł ma własny postęp i rozwijaną listę lekcji. Wszystkie 304 zwroty są dostępne w nauce, słowniku i quizach; 68 lekcji ma po 4–5 kart. Objaśnienia w nawiasach pozostają widoczne, ale są pomijane przy odsłuchu.

Import z obecnego formatu TXT:

```sh
python3 scripts/import-dictionary.py exports/slownik_PL_RU_EN_DE.txt
npm test
```

Importer odczytuje wyłącznie numerowane wiersze z czterema językami w 15 modułach, pomijając końcowe uwagi i propozycje przyszłych tematów. Zachowuje ich treść i kolejność; odświeża data.js oraz CSV. Po zmianie zakresu danych trzeba dostosować testy i wersje plików offline. Nie uruchamiać importu innego słownika bez decyzji o migracji postępów.

Wersję kursu 304 zwrotów sprawdzono w przeglądarce mobilnej: wszystkie 304 karty w 68 lekcjach, moduły w trzech językach, pełny końcowy quiz, postęp modułu, słownik, odsłuch bez objaśnień w nawiasach, reset starych punktów przy zachowaniu głośności i otwarcie kursu offline.

## Znaczenia pojedynczych słów

Wersja 13 pozwala dotykać słów na kartach nauki oraz w przeglądzie odpowiedzi po poprawnym rozwiązaniu pytania. Po sukcesie wracają wszystkie cztery opcje, w tym odrzucone; nie można już ponownie ich ocenić ani dostać kolejnych punktów. Podsumowanie całego quizu zawiera rozwijany przegląd wszystkich rozwiązanych pytań. Znaczenia nie są dostępne w trakcie odpowiadania. Każdy zwrot w przeglądzie ma osobne polskie tłumaczenie; słowo ma listę znaczeń i odsłuch. Pomoc działa offline i nie wysyła dotykanych słów do serwisu tłumaczącego.

Słownik obejmuje wszystkie 1040 różnych słów występujących w obecnym kursie (399 RU, 316 EN, 325 DE), z rozpoznaniem wielu odmienionych form. Ogólne znaczenia mogą nie pasować do konkretnego zdania; pełne tłumaczenie zwrotu z kursu jest dostępne osobno. Dane pochodzą z WikDict/Wiktionary, z redakcją i doprecyzowaniem terminów budowlanych. Licencja danych i źródła: [WORD_DICTIONARY_LICENSE.md](WORD_DICTIONARY_LICENSE.md). Nieznane nowe słowo wyświetla uczciwy brak osobnego hasła, zamiast wymyślać tłumaczenie.

Do odtworzenia danych słów służy `scripts/build-word-glossary.py`. To narzędzie jedynie do przygotowania danych; działająca aplikacja nie wymaga Pythona ani zewnętrznych słowników. Pobierz trzy SQLite wymienione w pliku licencji do osobnego katalogu poza repozytorium, zainstaluj build-only `pymorphy3==2.0.6` w `/tmp/buduj-word-build` lub na PYTHONPATH i uruchom:

```sh
python3 scripts/build-word-glossary.py --databases /tmp/wikdict
npm test
```

`word-overrides.json` zawiera redagowane znaczenia, w tym konstrukcje gramatyczne, odmianę i specjalistyczne słownictwo. Builder odmawia ukończenia, jeśli nowy materiał zawiera słowa bez hasła. Testy sprawdzają pokrycie wszystkich słów kursu, kluczowe terminy, tokenizację i zgodność tłumaczeń całych zwrotów. Nie należy publikować pobranych baz SQLite ani katalogu pomocniczych pakietów Pythona.

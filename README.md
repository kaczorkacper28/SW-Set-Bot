# Połączony bot SW

Ten projekt łączy siedem modułów w jednym kliencie Discord:
- dokumenty
- kadry
- stopnie
- raporty
- wypłaty
- osadzeni i przepustki
- tickety

## Konfiguracja
Ustaw zmienne środowiskowe z pliku `.env.example` w sekretach hostingu. Nie zapisuj tokenów w repozytorium.

Ważne: `TOKEN` i `CLIENT_ID` muszą wskazywać jedną aplikację Discord. `GUILD_ID` to serwer używany przez moduły, które mają tę zmienną. Wypłaty nadal używają `SW_GUILD_ID` oraz `MAIN_GUILD_ID`.

Dla niezależnych logów ticketów ustaw `TICKET_LOG_CHANNEL_ID`; gdy nie jest ustawione, moduł ticketów użyje `LOG_CHANNEL_ID`.

## Zmiana nazw komend
Moduł stopni używa `/sw-stopnie-dodaj` i `/sw-stopnie-usun`, aby nie kolidować z komendami kadrowymi `/sw-dodaj` i `/sw-usun`.

## Uruchomienie
`npm install`
`npm start`

Przed wdrożeniem produkcyjnym przetestuj każdy moduł i wszystkie role/kanały na serwerze testowym. Wypłaty należy sprawdzić szczególnie uważnie.

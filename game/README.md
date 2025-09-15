# Mini žaidimo modulis

Paprasta struktūra su būsenos mašina ir DOM atvaizdavimu. Lygiai apibrėžti `levels.js` faile.

## Naudojimas

1. Į HTML įtrauk `<script type="module" src="./game/main.js"></script>`.
2. HTML turėk elementus: `#start`, `#submit`, `#answer`, `#result`, `#highscores` (ul ar ol).
3. `onStart` kviečia `engine.startRound(0)` ir parenka pirmo lygio konfigūraciją.

## Smoke test

- Atidaryk HTML naršyklėje.
- Spausk **Start**.
- Naršyklės konsolėje `game.state.roundData.correct` parodys teisingą atsakymą.
- Įvesk šį skaičių ir spausk **Submit**.
- Rezultatas turėtų rodyti surinktus taškus, pvz., `Taškai: 10` jei atsakyta greitai.
- `#highscores` sąraše matysis geriausi rezultatai (top 5).

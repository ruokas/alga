# Mini žaidimo modulis

Paprasta struktūra su būsenos mašina ir DOM atvaizdavimu. Lygiai apibrėžti `levels.js` faile.

## Naudojimas

1. Į HTML įtrauk `<script type="module" src="./game/main.js"></script>`.
2. HTML turėk elementus: `#start`, `#submit`, `#answer`, `#result`, `#highscores` (ul ar ol).
3. Paspaudus **Start** rodoma žinutė „Per 60 s pasiek K_zona ≥ 1.1 su mažiausiais tarifais“ ir startuojamas laikmatis.

## Smoke test

- Atidaryk HTML naršyklėje.
- Spausk **Start**.
- Naršyklės konsolėje `game.state.roundData.correct` parodys teisingą atsakymą.
- Įvesk šį skaičių ir spausk **Submit**.
- Pasibaigus laikui ar pateikus atsakymą rodomas `K_zona`, sąnaudos ir taškai, siūlomas kitas raundas.
- `#highscores` sąraše matysis geriausi rezultatai (top 5).

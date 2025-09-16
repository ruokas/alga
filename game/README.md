# Direktoriaus gudrybių žaidimas

Interaktyvus „Canvas“ žaidimas, kuriame turi paslapčia surinkti kuo daugiau finansavimo dokumentų skyriui ir nepakliūti direktoriaus žvilgsniui.

## Failai

```
game.html           – pilnas UI su stiliumi ir Canvas
/game/main.js       – įkrovimas, sąsajos jungtys
game/engine.js      – žaidimo fizika ir piešimas
game/view.js        – HUD, sąveika ir rekordų valdymas
game/state.js       – būsena ir LocalStorage rekordai
game/levels.js      – misijų konfigūracijos
game/strings.js     – visos LT tekstinės eilutės
```

## Naudojimas

1. Atidaryk `game.html` naršyklėje (Chrome/Edge/Firefox). Failas savarankiškas.
2. Pasirink vieną iš penkių misijų lygių:
   - **Rezidentų triukas** – ilgesnis startinis bėgimas, žema rizika.
   - **Skyriaus vadovė** – direktorius akylesnis, bet dar įmanoma suktis.
   - **Valdybos posėdis** – trumpesnis laikas, bet vertingesni grantai.
   - **Netikėtas auditas** – įtarimas kyla žaibiškai, reikia daugiau manevrų.
   - **Ministerijos inspektorius** – galutinis iššūkis su aukščiausiais įkainiais.
3. Spausk **„Pradėti misiją“**. Direktorius pradeda žiūrėti/nusisukti.
4. Naudok **rodyklių arba WASD klavišus** judėti, kai direktorius išsiblaškęs. Kai žiūri – sustok.
5. Rink žalius grantų aplankus. Laikmatis parodo, kiek dar turi laiko.
6. Kai laikas baigsis arba direktorius pagaus – gausi rezultatą, o sumos įrašomos į vietinius rekordus.

## Smoke test

- [ ] Atidaryta `game.html`, matomas Canvas, HUD ir valdikliai.
- [ ] Pasirinktas lygis, paspausta „Pradėti misiją“ – drobėje juda personažas, atsiranda žali aplankai.
- [ ] Įtarimo juosta kinta priklausomai nuo judėjimo, laikmatis skaičiuoja žemyn.
- [ ] Pasiekus 0 s rodomas rezultatų perdangos langas ir įrašomas rekordas.
- [ ] Mygtukas „Išvalyti rekordus“ ištrina vietinius rezultatus.

## Dažniausios problemos

- **Canvas tuščias:** įsitikink, kad naršyklė leidžia `requestAnimationFrame` (patikrink konsolę dėl klaidų).
- **Valdikliai nereaguoja:** žiūrėk, ar nesi palikęs atidaryto „perdangos“ lango; uždaryk arba spausk „Dar kartą!“.
- **Klavišai neveikia:** spustelėk ant žaidimo lango, kad jis turėtų fokusą.
- **Rekordai neišsisaugo:** naršyklė gali blokuoti `localStorage` (privatus langas) – bandyk įprastame lange.

## Plėtra

- `levels.js` gali pridėti naujų misijų, koreguoti laiką, įtarimo augimą ir grantų vertes.
- `strings.js` laikomos visos tekstinės eilutės – čia pridėk papildomas kalbas.
- `engine.js` funkcijoje `createToken` gali pakeisti grantų grafiką ar pridėti papildomų kliūčių.

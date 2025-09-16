# Atlyginimo Skaičiuoklė

Šis projektas – internetinis įrankis atlyginimo tarifams skaičiuoti skubios pagalbos skyriuje. Jis apskaičiuoja zonos koeficientą pagal pacientų skaičių ir triažo lygius, tuomet pritaiko jį baziniams gydytojų, slaugytojų, padėjėjų ir kitų pasirenkamų rolių valandiniams tarifams ir pateikia galutines sumas.

Taip pat galite įvesti pamainos trukmę ir mėnesio valandų skaičių, kad pamatytumėte numatomą uždarbį už pamainą ar mėnesį.

Skaičiuoklėje galima perjungti formulę tarp „Triažas + apkrova“ ir „Laiptelinės“ versijų.

* **Triažas + apkrova (legacy)** – du priedai apskaičiuojami pagal fiksuotas apkrovos ir triažo ribas.
* **Laiptelinė (ladder)** – priedai nustatomi iš `volume_ladder` ir `triage_ladder` lentelių.

Biudžeto planavimo įrankyje galima nurodyti minimalų gydytojų, slaugytojų ir padėjėjų skaičių. Šios reikšmės (`minDoctor`, `minNurse`, `minAssistant`) naudojamos optimizacijos metu, kad siūlomas personalo skaičius niekada nenukristų žemiau nustatytų ribų.

## Vykdymas vietoje

1. Nuklonuokite arba atsisiųskite saugyklą.
2. Atidarykite `index.html` modernioje naršyklėje.
3. Užpildykite formą ir pamatysite apskaičiuotus koeficientus bei galutinius tarifus.

## Mini žaidimo modulis

Mini žaidimas padeda komandos nariams greitai praktikuoti triažo scenarijus. Žemiau pateiktas HTML fragmentas įterpia modulį į bet kurį puslapį:

```html
<!-- Mini žaidimo konteineris; skriptas pats sugeneruos vidinę sąsają -->
<section id="mini-game" class="dg-embed">
  <div id="game-root" data-game-root aria-live="polite"></div>
  <script type="module" src="./game/main.js"></script>
</section>
```

> Pastaba: `main.js` pridės reikalingus stilius ir žymeles, todėl papildoma HTML struktūra nebūtina. Stilių blokas įterpiamas kaip `<style id="director-game-styles">`, tad prireikus galite jį perrašyti savo CSS.

Naudojimo žingsniai:

1. Įtraukite pateiktą fragmentą į savo HTML puslapį arba nukopijuokite jį į atskirą projektą. Vidinė žaidimo sąsaja sugeneruojama automatiškai, svarbu turėti `div` su atributu `data-game-root`.
2. Įsitikinkite, kad `game` katalogas iš šios saugyklos yra pasiekiamas tame pačiame kelyje kaip ir puslapis, kuriame rodote modulį.
3. Atidarykite puslapį naršyklėje, spauskite **Start** ir sekite ekrane rodomas instrukcijas.
4. (Pasirinktinai) pridėkite CSS klasę `dg-embed` savo konteineriui, jei norite greitai pritaikyti numatytą tamsų foną.

Galite tiesiogiai paleisti žaidimą atidarę `game.html` arba integruoti aukščiau pateiktą skriptą į kitą jūsų skyriui skirtą puslapį.

## Priklausomybės

Projektas naudoja [Chart.js](https://www.chartjs.org/) iš CDN ir fiksuoja versiją **4.4.0**. Atnaujinkite versiją atsakingai, kad išvengtumėte netikėtų pokyčių.

## Testavimas

Įdiekite priklausomybes ir paleiskite Jest testų rinkinį:

```bash
npm install
npm test
```

## GitHub Pages

Norėdami paskelbti skaičiuoklę internete, naudodami GitHub Pages:

1. Įkelkite saugyklą į GitHub.
2. GitHub svetainėje atidarykite **Settings → Pages**. Dalyje **Build and deployment** pasirinkite *Deploy from a branch*, tada nurodykite šaką `main` ir katalogą `/` (root).
3. (Pasirinktinai) `.github/workflows/pages.yml` darbo eiga paskelbs svetainę automatiškai su kiekvienu `main` šakos pakeitimu.
4. Pasiekite svetainę adresu `https://<jūsų-github-vartotojo-vardas>.github.io/Salary-calculator/`.

Pakeiskite `<jūsų-github-vartotojo-vardas>` į savo GitHub vartotojo vardą.

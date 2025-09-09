# Atlyginimo Skaičiuoklė

Šis projektas – internetinis įrankis atlyginimo tarifams skaičiuoti skubios pagalbos skyriuje. Jis apskaičiuoja zonos koeficientą pagal pacientų skaičių ir triažo lygius, tuomet pritaiko jį baziniams gydytojų, slaugytojų, padėjėjų ir kitų pasirenkamų rolių valandiniams tarifams ir pateikia galutines sumas.

Taip pat galite įvesti pamainos trukmę ir mėnesio valandų skaičių, kad pamatytumėte numatomą uždarbį už pamainą ar mėnesį.

Biudžeto planavimo įrankyje galima nurodyti minimalų gydytojų, slaugytojų ir padėjėjų skaičių. Šios reikšmės (`minDoctor`, `minNurse`, `minAssistant`) naudojamos optimizacijos metu, kad siūlomas personalo skaičius niekada nenukristų žemiau nustatytų ribų.

## Vykdymas vietoje

1. Nuklonuokite arba atsisiųskite saugyklą.
2. Atidarykite `index.html` modernioje naršyklėje.
3. Užpildykite formą ir pamatysite apskaičiuotus koeficientus bei galutinius tarifus.

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

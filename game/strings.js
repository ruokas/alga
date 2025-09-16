export const STRINGS = {
  title: 'Direktoriaus gudrybių žaidimas',
  subtitle:
    'Surink kuo daugiau lėšų skyriui, vengdamas direktoriaus žvilgsnio. Kai jis žiūri – sustink, kai nusisuka – semk pinigus!',
  startButton: 'Pradėti misiją',
  restartButton: 'Kartoti raundą',
  timerLabel: 'Laikas',
  suspicionLabel: 'Direktoriaus įtarimas',
  fundsLabel: 'Skyriui sukaupta',
  levelLabel: 'Misijos sunkumas',
  highscoreTitle: 'Geriausi biudžeto grobiai',
  instructionsTitle: 'Taisyklės',
  instructions: [
    'Judėk rodyklių arba WASD klavišais.',
    'Kai direktorius žiūri (raudonas žvilgsnis) – lik vietoje, kitaip įtarimas auga.',
    'Surink grantų aplankus (žalsvi) ir laimėk kuo daugiau eurų.',
    'Laikas ribotas – kai baigsis, gausi tiek lėšų, kiek sukaupei.',
    'Telefonuose ir planšetėse po drobe rodoma virtuali valdymo kryžmė.',
  ],
  lookingWarning: 'Direktorius stebi – stovėk ramiai!',
  distractedInfo: 'Direktorius išsiblaškęs, judėk!',
  win: (funds) => `Puiku! Direktorius pasirašė finansavimą – +${funds.toLocaleString('lt-LT')} € skyriui.`,
  caught: 'Pagautas! Direktorius perprato gudrybę. Pabandyk dar kartą.',
  timeUp: (funds) =>
    funds > 0
      ? `Laikas baigėsi! Spėjai sutraukti ${funds.toLocaleString('lt-LT')} € – neblogai!`
      : 'Laikas baigėsi, bet finansavimo nespėjai gauti. Bandyk iš naujo.',
  clearScores: 'Išvalyti rekordus',
  localOnly: 'Rezultatai saugomi tik šioje naršyklėje.',
  overlayButton: 'Dar kartą!',
  shortcuts: 'Klaviatūra: rodyklės / WASD judėjimui, tarpas – trumpam sustoti.',
  touchHint: 'Lietimas: naudok ekranines rodykles apačioje.',
};

export function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remain = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remain}`;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('lt-LT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)));
}

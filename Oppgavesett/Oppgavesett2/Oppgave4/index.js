
const musikere = [
    {navn: "Annifrid", rating: 6},
    {navn: "Agnethe", rating: 3},
    {navn: "Benny", rating: 5},
    {navn: "Bjørn", rating: 2}
  ]

  /* Finn de musikerne som har høyere rating enn 4 i koden under. Logg resultatet til konsollen. Bruk Filter.*/


const result = musikere.filter(
    musiker => musiker.rating >4
)
console.log(result)
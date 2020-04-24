
const skurker = [
    {navn: "Billy the Kid", egenskap: "Rask på avtrekkeren"},
    {navn: "Jesse James", egenskap: "Iskald"},
    {navn: "Brødrene Dalton", egenskap: "Jobber godt sammen"}
  ]

/*Bruk Array.find() til å finne og logge ut egenskapen til skurken som heter Jesse James.*/


const found = skurker.find(
    skurk => skurk.navn === "Jesse James"
)
console.log(found)


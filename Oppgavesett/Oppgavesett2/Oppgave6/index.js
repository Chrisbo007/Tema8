const matretter = [
    "Kapteinens favoritt", 
    "Kjøtt utklemt i panne", 
    "Biff Stroganof"
]

const ulMatretter = document.querySelector("#ulMatretter")


/* Bruk Array.map() til å lage en liste med matrettene. Lag et liste-element (li) for hver matrett, og legg det inn i <ul>-elementet med id=”ulMatretter”.

Her kommer din kode */

matretter.map( retter => ulMatretter.innerHTML +=
    `<li>${retter}</li>
    `)



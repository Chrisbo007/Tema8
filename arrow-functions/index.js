console.log('I am here')

// Enkelt regnestykke:

function square(tall) {
    return tall * tall
}

console.log(square(16))

// Samme funksjon skrevet med moderne js:

const squareA = (tall) => tall * tall


console.log(squareA(21))

//Kan også skrives slik med navn:

function square(tall, name) {
    return name + ', regnestykket ditt gir: ' + tall * tall
}
console.log(square(16, 'Per'))


const fler = (name1, name2) => 'hej ' + name1 + ' og ' + name2

console.log(fler('Simon', 'Per'))

setTimeout(() => document.querySelector('body').style.backgroundColor = 'orange', 2000)


const antallTegn = ord => 'Dette ordet har ' + ord.length + ' karakterer'

console.log(antallTegn('nikodemos'))







fetch('https://www.googleapis.com/books/v1/volumes?q=hemingway')
    .then(response => response.json())
    .then(json => {
        console.log(json)
        books = json.items
        str = ''
        showBooks()
    })

const showBooks = () => {
    document.body.innerHTML = ''
    books.map(book => {
       let sec = document.createElement('section')
       sec.innerHTML = book.volumeInfo.title
       if(book.volumeInfo.imageLinks){
           sec.style.backgroundImage = `url(${book.volumeInfo.imageLinks.thumbnail})`
       }
       document.body.appendChild(sec)
    })
}
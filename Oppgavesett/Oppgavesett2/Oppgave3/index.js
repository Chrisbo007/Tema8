const numbers = [
    1, 
    7, 
    79, 
    60, 
    44, 
    34, 
    26, 
    12, 
    66, 
    50
]

let num = numbers.filter(
    numbers => (numbers >20) && (numbers<80)
)
if (num.length === 20) {
    console.log('Disse tallene er mellom 20 og 80: ' +num)
} else if (num.length === numbers.length){
    console.log('Oi! Ingen tall mellom 20 og 80?')
} else {
    console.log('Oi! Alle tallene var mellom 20 og 80')
    
}
 
  

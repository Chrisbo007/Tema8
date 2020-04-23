let name = document.querySelector('#name')
let email = document.querySelector('#email')
let inp1 = document.querySelector('#inp1')
let inp2 = document.querySelector('#inp2')
let validate = document.querySelector('#validate')
let terms = document.querySelector('#terms')
let submit = document.querySelector('#submit')
let form = document.querySelector('#form')

let password2 = "";
let password1 = "";

inp1.oninput = function (event) {
    password1 = event.target.value;
    checkpasswords();
}

inp2.oninput = function (event) {
    password2 = event.target.value;
    checkpasswords();
}

function checkpasswords() {
    if (password2 === "") return
    else if (password1 != password2) 
    validate.classList.add('show')
    else 
    validate.classList.remove('show')
}



submit.addEventListener('click', okButton)

function okButton() {
    console.log(name.value, email.value)
    greet()
}

function greet() {
    form.innerHTML = '<h1>Hei ' + name.value + ' </h1>'
    form.innerHTML += '<p> Det var veldig hyggelig at du ville være med i prosjektet.'
    form.innerHTML += '<p> Om jeg forstår det korrekt, er navnet ditt ' + name.value + ' og eposten din er: ' + email.value

    const newOkButton = document.createElement('button')
    newOkButton.innerHTML = 'OK'
    newOkButton.addEventListener('click', function () {
        form.innerHTML = '<h1>Supert!</h1>'
    })
    form.appendChild(newOkButton)

    const newCancelButton = document.createElement('button')
    newCancelButton.innerHTML = 'CANCEL'
    newCancelButton.addEventListener('click', function () {
        form.innerHTML = ''
        form.appendChild(name)
        form.appendChild(email)
        form.appendChild(submit)
    })
    form.appendChild(newCancelButton)
}
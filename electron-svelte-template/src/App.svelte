
<script>
	
const { remote } = require('electron')
const { Menu, MenuItem } = remote
	
	let info='Nothing happening yet'
	
const showNotification = () => {
    let myNotification = new Notification('Hello', {
      body: 'You are now officially part of the system OS'
    })
    myNotification.onclick = () => {
        info = 'Notification clicked'
    }
}


const amIOnline = () => {
    window.alert(navigator.onLine ? 'Yes, you are online' : 'No, you are offline')
    info = 'Alert accepted'
}


const menu = new Menu()
	menu.append(new MenuItem({ label: 'meny 1', click() { info = 'item 1 klikket' } }))
	menu.append(new MenuItem({ type: 'separator' }))
	menu.append(new MenuItem({ label: 'meny 2', click() { info = 'item 2 klikket' } } ))


const context = e => {
  e.preventDefault() //hindrer det vanlige højreklikk
  menu.popup({ window: remote.getCurrentWindow() }) //kalder menufunksjon i Electron
}

</script>

<main>
    <h1>Svelte in Electron</h1>
    <hr>
<div class="stuff" on:contextmenu={context}>

<p>{info}</p>

	<button on:click={ () => showNotification() }>klikk på meg</button>
	
	<button on:click={ () => amIOnline() }>Am I online</button>

</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}
	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}


 .stuff {
    width:100%;
    height:200px;
    background-color:lightblue;
  }
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
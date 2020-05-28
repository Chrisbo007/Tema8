<script>
	
	import Plant from './Plant.svelte'
	
	import {plants} from './plants'
	
	import EditPlant from './EditPlant.svelte'
	
	
const showNotification = (message) => {
    let myNotification = new Notification('Plantminder', {
      body: `${message} plants are thirsty today!`
    })
    myNotification.onclick = () => {
        info = 'Notification clicked'
    }
}
	

	let allPlants = plants
	
	let needWater = []
	
	let garden = []
	
	const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
	
	let day = days [new Date().getDay()]
	allPlants.map(p => p.needWater = p.days.includes(day))
	
	const checkPlants = () => {	
			needWater = allPlants.filter(plant => plant.needWater)
			if(needWater.length > 0){
				console.log('here')
				showNotification(needWater.length)
			}
			garden = allPlants.filter( plant => !plant.needWater)
	}
	
	checkPlants()

	setInterval(checkPlants, 1000 * 60 * 60 * 24)
	
	const remove = (plant) => {
		plant.needWater = false
		checkPlants()
	}

	let editPlant 
	const closePlant = () => {
		editPlant = null
	}
	
	const showPlant = (plant) => {
			
		editPlant = plant
	}
	
	const addPlant = () => {
		editPlant = {
			image: './media/placeholderimg.jpg',
			name: '',
			thirsty: 0,
			days: [],
		}
		allPlants = [editPlant,...allPlants]
	}
	
	const savePlant = (plant) => {
		//find index of the plant
		console.log(allPlants)
		console.log(plant)
		plant.needWater = plant.days.includes(day)
		let index = allPlants.findIndex(x => x.name === plant.name)
		allPlants[index] = plant
		editPlant = null
		checkPlants()
	} 
	
</script>

<main>

<div id="logo">
	<img src="../public/media/logo_light.png" alt="plantminder logo">
</div>


{#if editPlant}
	 <EditPlant {closePlant} {savePlant} myPlant={editPlant}/>
{:else}
	<div id="plantview">

	<div id="addplant">	
		 <div  on:click={() => addPlant(editPlant)}><img class="addbutton" src="../public/media/addplant.png" alt="add"></div>
		<h1>Add new plant</h1>
	</div>

	<div id="addtogarden">
	</div>

	<h2>Need water now</h2>
	<div id="needwater">	
		{#each needWater as plant}
			<Plant {plant} {remove} {showPlant}/>
		{:else}
			<h2 class="message">No thirsty plants</h2>
		{/each}
	</div>


		<h2>My Garden</h2>
	<div id="garden">
		{#each garden as plant}
			<Plant {plant} {showPlant}/>
		{:else}
			<h2 class="message">You have no plants in your garden</h2>
		{/each}
	</div>

	</div>

{/if}

</main>

<style>

* {
	box-sizing: border-box;
}

:global(body){
	background-color: #885A5A;
}

main{
	text-align: center;
	padding: 1rem;
	margin: 0 auto;
}

#logo img{
	width: 50%;
	padding-bottom: 0.4rem;
}

.addbutton {
	width: 75%;
	padding: 0.3rem;
}

#addplant{
	display: flex;
	justify-content: center;	
}


h1{
	font-family: Hoefler Text;
	font-weight: 100;
	font-size: 18px;
	color: #0A0F1D;
}
h2{
	font-family: Hoefler Text bold;
	font-size: 18px;
	color: #0A0F1D;
}

.message{
	font-weight: 100;
	font-style: italic;
}

p{
	font-family: Arial, Helvetica, sans-serif;
	font-weight: bold;
	font-size: 14px;
	color: #0A0F1D;
}

.plantview{
	display: grid;
	grid-auto-flow: column;
	justify-content: center;
	gap: 1rem;
}

#garden, #needwater{
	display: grid;
	grid-auto-flow: column;
	justify-content: center;
	gap: 1.5rem;
	padding: 0.5rem;
}
  
</style>
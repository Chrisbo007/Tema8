<script>
	import Plant from './Plant.svelte'

	import {plants} from './plants'

	import EditPlant from './EditPlant.svelte'
	
	let allPlants = plants
	let needWater = []
	let garden = []
	let editPlant = undefined

	const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
	let day = days [new Date().getDay()]
	console.log(day)
	allPlants.map(p => p.needWater = p.days.includes(day))

	const checkPlants = () => {	
			needWater = allPlants.filter(plant => plant.needWater)
			garden = allPlants.filter( plant => !plant.needWater)
	}

	checkPlants()
	console.log(allPlants)
	

	setInterval(checkPlants, 5000)

	const remove = (plant) => {
		plant.needWater = false
		checkPlants()
		console.log(plant)
	}

	const showPlant = (plant) => {
		console.log(plant)
		editPlant = plant
	}
	
</script>

<main>

<div id="logo">
	<img src="../public/media/logo_light.png" alt="plantminder logo">
</div>


{#if editPlant}
	 <EditPlant {editPlant}/>
{:else}
	<div id="plantview">

	<div id="addplant">	
		<img id="addbutton" src="../public/media/addplant.png" alt="addbutton">
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

#addbutton{
	width: 25%;
	height: 15%;
	padding: 0.3rem;
}

#addplant{
	display: inline-flex;
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
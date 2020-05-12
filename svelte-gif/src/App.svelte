<script>
	import { fade, fly, scale } from 'svelte/transition'

	import { HeartIcon} from 'svelte-eva-icons'

	import { apikeys } from '/Users/christina/Nextclouden/HK/apikeys/apikeys'

	let q = ''
	const limit = 1
	let api_key = apikeys.giphy 
	let gif 
	let favorites = [] 

	const getImage = () => {
		gif = null
	fetch(`https://api.giphy.com/v1/gifs/search?q=${q}&limit=${limit}&apiKey=${api_key}`)
		.then(res => res.json())
		.then(json => {
			console.log(json)
			gif = json.data[0].images.downsized_medium.url
		})
}

const addToFav = (gif) => {
	if(!favorites.includes(gif)){
	favorites = [gif, ...favorites]
	}else{
	favorites = favorites.filter( element => element != gif)
  }
}

let showFav = false

</script>

<main>

<div>
<input 
	placeholder="Skriv her..." 
	bind:value={q}
	on:keydown={ event => event.key == 'Enter' ? getImage() : ''}
	on:click={ e => e.target.value = ''}
	on:focus={e => e.target.value= ''}
>
<button on:click={getImage}>Hent GIF</button>
	{#if favorites.length > 0}
		 <button in:scale on:click={ () => showFav = !showFav}>
		 {showFav ? 'Skjul favoritter' : 'Vis favoritter'}
		 </button>
	{/if}
</div>

{#if !showFav}
	{#if gif}
		<img
			src="{gif}"
			alt="{q}"
			in:scale={{x:-1000}}
		>
		<div class="heart"
			on:click={()=>addToFav(gif)}
			style={favorites.includes(gif) ? 'fill:red' : 'fill:white'}
			>
			<HeartIcon />
		</div>
	{:else}
    	<h2>Er du klar for hva som kommer?...</h2>
	{/if}
{:else} 
	<div in:scale={{x:1000}} class="favorites">
		{#each favorites as fav}
			<img src="{fav}" alt="giffy">
		{/each}
	
	</div>

{/if}
</main>


<style>

	:global(body, html){
		margin:0;
		padding:0;
	}
	:global(*){
		box-sizing:border-box;
	}
	
main {
    display:grid;
    place-items:center;
    height:100%;
    position:relative;
	background-color: lightblue;
}
.heart{
    position:absolute;
    bottom:2rem;
    height:4rem;
    width:4rem;
    fill:red;
	cursor: pointer;
}

.heart:hover{
	transform:scale(1.2);
	fill:salmon;
}

img{
    max-height:40vh;
    width:60vw;
    object-fit: cover;
}

	.favorites {	
	max-height:60vh;
	display: grid;
    overflow:scroll;
    gap:.2rem;
    grid-template-columns:repeat(4, 200px);
	}

	.favorites img {	
	width:100%;
    height:200px;
    object-fit:cover;
	}

	input {
		border-radius: 25px;
		width: 40vw;
		padding: 1rem;
	}
	
	button {
		border-radius: 25px;
		padding: 1rem;
		background-color: #e68173
	}
	


</style>
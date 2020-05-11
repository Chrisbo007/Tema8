<script>
	let q = ''
	const limit = 1
	let api_key = 'Xi15hiaWpgk2eNgbzfKdyifHLP44TVg5'
	let gif 
	
	const handleKey = key => {
		if(key.key == "Enter")
		getImage()
		}

	const getImage = () => {
	fetch(`https://api.giphy.com/v1/gifs/search?q=${q}&limit=${limit}&apiKey=${api_key}`)
		.then(res => res.json())
		.then(json => {
			console.log(json)
			gif = json.data[0].images.downsized_medium.url
		})
}
	
</script>

<main>
<div>
<input bind:value={q} placeholder="Skriv her..." on:keydown={handleKey}>
<button on:click={getImage}>Hent GIF</button>
</div>


	{#if gif}
    	<img src="{gif}" alt="{q}">
	{:else}
    	<h2>Henter gif...</h2>
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
	main{
		display:grid;
		place-items:center;
		height:100%;
		background-color: lightblue
	}

	header{
		position:absolute;
		top:2rem;
		width:100%;
		display:grid;
		padding: 0 20vw 0 20vw;
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
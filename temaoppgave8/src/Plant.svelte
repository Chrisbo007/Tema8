<script>
    export let plant
   
    export let remove 
    
    export let showPlant
    
    const dropColor = (index) => {
        if (plant.thirsty >= index) {
            return './media/bluedrop.png'
        } else{
            return './media/drop.png'
        }
    }

</script>

<div class="plant {plant.needWater ? 'needWater' : ''}">
    <div class="pen" on:click={() => showPlant(plant)}><img src="./media/Penn.png" alt="Edit"></div>
    <div class="plantimage"><img src="{plant.image}" alt="Plant image"></div>
	<p>{plant.name}</p>

    <div class="drop">
        <img src={dropColor(1)} alt='drop'>
        <img src={dropColor(2)} alt='drop'>
        <img src={dropColor(3)} alt='drop'>
    </div>

    {#if plant.needWater}
        <button on:click={() => remove(plant)}></button>
    {:else}
        <span class={plant.days.includes('monday') ? 'active' : ''}>M</span>
        <span class={plant.days.includes('tuesday') ? 'active' : ''}>T</span>
        <span class={plant.days.includes('wednesday') ? 'active' : ''}>W</span>
        <span class={plant.days.includes('thursday') ? 'active' : ''}>T</span>
        <span class={plant.days.includes('friday') ? 'active' : ''}>F</span>
        <span class={plant.days.includes('saturday') ? 'active' : ''}>S</span>
        <span class={plant.days.includes('sunday') ? 'active' : ''}>S</span>
    {/if}
</div>

<style>
.plant{
    background-color: #3BB29B;
    border-radius: 20px;
	width: 100px;
    margin: auto;
    padding-bottom: 0.5rem;
    box-shadow: 2px 2px 2px #83CCCB;
}

.pen{
    margin-left: 70%;
}

.pen img {
    height: 15px;
    margin-top: 5px;
}
.plantimage{
    margin-top: -10px;
}

.plantimage img{
    border-radius: 50%;
    display: inline;
    margin: 0 auto;
    height: 70px;
    width: 70px;
    object-fit: cover;
}

.needWater{
    background-color: #3BB29B;
}

p {
    font-weight: 600;
    font-size: 0.9rem;
    font-family: Hoefler Text bold;
    margin-bottom: 0.2rem;
    margin-top: 0.3rem;
}

span {
    font-size: 10px;
    font-weight: 500;
}

.active{
    color: #84E8FF;
}

.drop img {
    height: 20px;
}
</style>
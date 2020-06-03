<script>
    export let myPlant
    
    export let closePlant
    
    export let savePlant

    export let deletePlant


     const dropColor = (plant, index) => {
        if (plant.thirsty >= index) {
            return './media/bluedrop.png'
        } else{
            return './media/drop.png'
        }
    }


</script>

<div class="plantedit">
    <div class="container">
    <div class="photoandname">
        <div class="plantimage"> 
            <img src="{myPlant.image}" alt="plantphoto" >
            <button>Change photo</button> 
        </div>

        <div class="plantname">
            <h2>Name your plant:</h2>
            <input class="input" type="text" placeholder="{myPlant.name}" bind:value={myPlant.name}>
        </div>
    </div>
        <div class="waterday">
            <h2>What day should you water?</h2>
            <span 
                on:click={
                        ()=>myPlant.days.includes('monday') ? 
                        myPlant.days = myPlant.days.filter(e=>e!='monday')
                        : myPlant.days = ['monday',...myPlant.days]} 
                class={myPlant.days.includes('monday') ? 'active' : ''}>Monday</span>
            <span 
                 on:click={
                        ()=>myPlant.days.includes('tuesday') ? 
                        myPlant.days = myPlant.days.filter(e=>e!='tuesday')
                        : myPlant.days = ['tuesday',...myPlant.days]} 
                class={myPlant.days.includes('tuesday') ? 'active' : ''}>Tuesday</span>
            <span 
                on:click={
                        ()=>myPlant.days.includes('wednesday') ? 
                        myPlant.days = myPlant.days.filter(e=>e!='wednesday')
                        : myPlant.days = ['wednesday',...myPlant.days]} 
                class={myPlant.days.includes('wednesday') ? 'active' : ''}>Wednesday</span>
            <span 
                on:click={
                        ()=>myPlant.days.includes('thursday') ? 
                        myPlant.days = myPlant.days.filter(e=>e!='thursday')
                        : myPlant.days = ['thursday',...myPlant.days]} 
                class={myPlant.days.includes('thursday') ? 'active' : ''}>Thursday</span>
            <span 
                 on:click={
                        ()=>myPlant.days.includes('friday') ? 
                        myPlant.days = myPlant.days.filter(e=>e!='friday')
                        : myPlant.days = ['friday',...myPlant.days]} 
                class={myPlant.days.includes('friday') ? 'active' : ''}>Friday</span>
            <span 
                on:click={
                        ()=>myPlant.days.includes('saturday') ? 
                        myPlant.days = myPlant.days.filter(e=>e!='saturday')
                        : myPlant.days = ['saturday',...myPlant.days]} 
                class={myPlant.days.includes('saturday') ? 'active' : ''}>Saturday</span>
            <span 
                on:click={
                        ()=>myPlant.days.includes('sunday') ? 
                        myPlant.days = myPlant.days.filter(e=>e!='sunday')
                        : myPlant.days = ['sunday',...myPlant.days]} 
                class={myPlant.days.includes('sunday') ? 'active' : ''}>Sunday</span>

        </div>

        <div class="wateramount">
            <h2>How much water?</h2>
                <div class="drop">
                    <img 
                        src={dropColor(myPlant, 1)} alt='drop'
                        on:click={
                            ()=>{
                                myPlant.thirsty=1
                                console.log(myPlant)
                                }
                        }
                        >
                    <img 
                        src={dropColor(myPlant, 2)} alt='drop'
                        on:click={
                            ()=>{
                                myPlant.thirsty=2                           
                                }
                        }
                        >
                    <img 
                        src={dropColor(myPlant, 3)} alt='drop'
                        on:click={
                            ()=>{
                                myPlant.thirsty=3
                                }
                        }
                        >
                </div>
        </div>

        <div class="closeandsave">
            <button on:click={()=>deletePlant(myPlant)}>Remove</button>
            <button on:click={closePlant}>Close</button>
            <button on:click={()=>savePlant(myPlant)}>Save</button>
        </div>

    </div>
</div>

<style>


.plantedit{
    height: 450px;
    width: 500px;
    background-color: #3BB29B;
    border-radius: 20px;
    display: inline-flex;
    justify-content: center;
    margin-top: 1.2rem;
    box-shadow: 2px 2px 2px #83CCCB;
}

.container{
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
}

.photoandname{
    display: flex;
}

.plantimage{
    display: flex;
    flex-direction: column;
    width: 30%; 
    margin-left: 2rem;
}

.plantimage img{
    border-radius: 50%;
    height: 100px;
    width: 100px;
    object-fit: cover;
    margin-bottom: 0.5rem;
}

.plantimage button{
    border-radius: 20px;
    font-size: 12px;
    font-family: './media/fonts/hoeflerText Bold.otf';
    width: 100px;
    background-color: white;
}

.plantname{
    width: 30%;
    display: flex;
    justify-content: flex-end;
    flex-direction: column;
}

.input{
    border-radius: 20px;
    font-size: 14px;
    font-family: './media/fonts/hoeflerText Bold.otf';
}

.waterday span{
    border-radius: 20px;
    font-size: 12px;
    margin-right: 0.5rem;
    width: 100px;
    height: 50px;
    font-family: './media/fonts/hoeflerText Bold.otf';
    background-color: white;
    width: 100px;
    padding: 0.5rem;
    }

.wateramount img{
   height: 35px;
}

h2 {
    font-size: 1rem;
    font-family: './media/fonts/hoeflerText Bold.otf'
}

.closeandsave{
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
}

.closeandsave button{
    border-radius: 20px;
    width: 50px;
    height: 25px;
    text-align: center;
    font-family: './media/fonts/hoeflerText Bold.otf';
    font-size: 12px;
    margin-top: 4rem;
    margin-right: 0.5rem;
    color: black;
    background-color: white;
}

 span.active{
    background-color: #84E8FF;
}

</style>
<script>
    export let editPlant

</script>

<div class="plantedit">
    <div>
        <div class="plantimage"> 
            <img src="{editPlant.image}" alt="plantphoto">
            <button>Change photo</button> 
        </div>

        <div class="plantname">
            <h2>Name your plant:</h2>
            <input class="input" type="text" placeholder="{editPlant.name}">
        </div>

        <div class="waterday">
            <h2>What day should you water?</h2>
            <button>Monday</button>
            <button>Tusday</button>
            <button>Wednesday</button>
            <button>Thursday</button>
            <button>Friday</button>
            <button>Saturday</button>
            <button>Sunday</button>
        </div>

        <div class="wateramount">
            <h2>How much water?</h2>
                <div>
                    <img src='./media/drop.png' alt="drop">
                    <img src='./media/drop.png' alt="drop">
                    <img src='./media/drop.png' alt="drop">
                </div>
        </div>

        <div class="closeandsave">
            <button>Close</button>
            <button>Save</button>
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

.plantimage{
    margin-top: -10px; 
    display: block;
}


.plantimage img{
    border-radius: 50%;
    height: 100px;
    width: 100px;
    object-fit: cover;
}

.plantimage button{
    border-radius: 20px;
    font-size: 12px;
    font-family: './media/fonts/hoeflerText Bold.otf'
}

.input{
    border-radius: 20px;
    font-size: 14px;
    font-family: './media/fonts/hoeflerText Bold.otf'
}

.waterday button{
    border-radius: 20px;
    font-size: 12px;
    margin-right: 0.3rem;
    width: 80px;
    font-family: './media/fonts/hoeflerText Bold.otf'
}

.wateramount img{
    height: 35px;

}

h2 {
    font-size: 1rem;
    font-family: './media/fonts/hoeflerText Bold.otf'
}

.closeandsave button{
    border-radius: 20px;
    width: 80px;
    font-family: './media/fonts/hoeflerText Bold.otf';
    font-size: 14px;
    display: inline;
    margin-right: 0;
    }

</style>
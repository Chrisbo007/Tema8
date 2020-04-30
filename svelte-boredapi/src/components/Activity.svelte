	
 <script>
	import { scale } from 'svelte/transition'
    export let activity
 </script>   
    
    
    
    
<div class="activity" in:scale>
	<h2>{activity.activity}</h2>
	<p>Type: {activity.type}</p>
	<p>Accessibility: {activity.accessibility} </p>
	<p>Price: {activity.price} </p>
	<p>Participants: {activity.participants}</p>
	<p>Link: {activity.link} </p>
</div>


<style>
.activity {
	width: 60vw;
	height: 40vh;
	padding: 2rem;
	background: #eee;
	box-shadow: 0 0 1rem 1px gray;
}
</style>
<template>
	<div id="forecast_embed" class="fe_container">
		<div class="fe_title" style="display:none">
			<span class="fe_location">
				<span></span>
			</span>
		</div>
		<div class="fe_forecast">
			<div class="fe_currently">
				<canvas id="fe_current_icon" width="160" height="160" style="width:80px; height:80px"></canvas>
				<div class="fe_temp"></div>
				<div class="fe_summary"></div>
				<div class="fe_wind"></div>
			</div>
			<div class="fe_daily"></div> 
			<div style="clear:left"></div>
		</div>
		<div class="fe_alert" style="display:none"></div>
		<div class="fe_loading" style="display:none">
			<canvas id="fe_loading_icon" width="100" height="100" style="width:50px; height:50px"></canvas>
			Loading...
		</div>
	</div>
</template>

<script src="./script.js"></script>

<style src="./style.css"></style>

<template>
	<div>
		Vue weather widget
	</div>
</template>

<script>
import Helper from '../helper';

export default {
	name: 'vue-weather-widget',

	/* details at https://darksky.net/dev/docs/forecast */
	props: {
		// Your Dark Sky secret key
		key: {
			type: String,
			required: true
		},

		// The latitude of a location (in decimal degrees). 
		// Positive is north, negative is south.
		latitude: {
			type: String,
			required: true
		},

		// The longitude of a location (in decimal degrees).
		// Positive is east, negative is west.
		longitude: {
			type: String,
			required: true
		},

		
	},
}
</script>

<style scoped>

</style>

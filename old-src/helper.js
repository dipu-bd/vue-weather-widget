export default {
	/**
	 * Convert given object into query parameters
	 * @param {*Object} data 
	 */
	encodeQueryParam(data) {
		return Object.keys(data).map((key) => {
			return [key, data[key]].map(encodeURIComponent).join('=');
		}).join('&');
	},

	darkSkyApi(options) {
		// build api url
		var api = 'https://api.darksky.net/forecast/'
			+ options.key + '/'
			+ options.lat + ',' + options.lon
			+ '?' + this.encodeQueryParam({
			units: options.units,
			lang: options.lang,
		});
		// return jquery ajax promise
		return $.ajax({
			type: 'GET',
			dataType: 'jsonp',
			url: api,
			crossDomain : true,
			xhrFields: {
				withCredentials: false
			}
		});
	}
	
};

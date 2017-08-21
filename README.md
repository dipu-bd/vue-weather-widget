# Vue Weather Widget

Weather widget inspired by [forecast embeds](https://blog.darksky.net/forecast-embeds/) and powered by [darksky api](https://darksky.net/dev).

## Install

### NPM
```
npm install --save vue-weather-widget
```

### YARN
```
yarn add vue-weather-widget
```


## Development

```bash
# install dependencies
npm install

# build dist files
npm run build
```

## Usage

### VueJS single file (ECMAScript 2015)

```js
<template>
    <weather 
        api-key="<your-dark-sky-api-key>"
        title="Weather"
        latitude="24.886436"
        longitude="91.880722"
        language="en"
        units="uk">
    </weather>
</template>

<script>
import VueWeatherWidget from 'vue-weather-widget';
import 'vue-weather-widget/dist/css/vue-weather-widget.css';

export default {
    components: {
        'weather': VueWeatherWidget
    },
}
</script> 
```

### Browser (ES5)
```html
<!-- Requirements -->
<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.4.0/vue.js"></script>

<!-- vue-weather-widget >
<script type="text/javascript" src="vue-weather-widget.js"></script>
<link href="vue-weather-widget.css" rel="stylesheet">
 
<!-- Vue app -->
<div id="app">
    <weather 
        api-key="<your-dark-sky-api-key>"
        title="Weather"
        latitude="24.886436"
        longitude="91.880722"
        language="en"
        units="uk">
    </weather>
</div>

<script>
window.vm = new Vue({
    el: '#app',
    components: {
        'weather': VueWeatherWidget
    }
});
</script>
```


## Props

| Props | Type | Default | Description  |
| --------|:------| -----------|-------|
| api-key | String, *required*   | - | Your Dark Sky secret key |
| latitude | String, *required* | - | The latitude of a location (in decimal degrees). Positive is north, negative is south. |
| longitude | String, *required* | - | Return summary properties in the desired language.
		[List of supported languages](https://darksky.net/dev/docs/forecast) |
| units | String | `"us"` | List of supported units:    
- `auto`: automatically select units based on geographic location
- `ca`: same as si, except that windSpeed and windGust are in kilometers per hour
- `uk2`: same as si, except that nearestStormDistance and visibility are in miles, and windSpeed and windGust are in miles per hour
- `us`: Imperial units (the default)
- `si`: SI units |
| bar-color | String | `"#333"` | Color of the Temparature bar. |
| text-color | String | `"#333"` | Color of the text. |
| title | String | `"Weather"` | Title of the widget. |
| hide-header | Boolean | `false` | Controls whether to show or hide the title bar. |
| disable-animation | Boolean | `false` | Use static icons when enabled. |
| update-interval | Number | `null` | Interval in seconds to update weather data automatically. Set it to `0` or `null` to disable auto update. |





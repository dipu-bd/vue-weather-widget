import Utils from "./utils";
import { Skycon } from "vue-skycons";

export default {
  name: "vue-weather-widget",

  components: {
    Skycon,
  },

  props: {
    // Your Dark Sky secret key
    apiKey: {
      type: String,
      required: true,
    },

    // Address to lookup location.
    address: {
      type: String,
    },

    // The latitude of a location (in decimal degrees).
    // Positive is north, negative is south.
    latitude: {
      type: String,
    },

    // The longitude of a location (in decimal degrees).
    // Positive is east, negative is west.
    longitude: {
      type: String,
    },

    // Return summary properties in the desired language.
    // For list of supported languages, visit https://darksky.net/dev/docs/forecast
    language: {
      type: String,
      default: "en",
    },

    // Return weather conditions in the requested units.
    // For list of supported units, visit https://darksky.net/dev/docs/forecast
    units: {
      type: String,
      default: "us",
    },

    // Controls whether to show or hide the title bar.
    hideHeader: {
      type: Boolean,
      default: false,
    },

    // Title of the widget.
    title: {
      type: String,
    },

    // Auto update interval in seconds
    updateInterval: {
      type: Number,
    },

    // Use static skycons
    disableAnimation: {
      type: Boolean,
      default: false,
    },

    // Color of the Temparature bar. Default: '#444'
    barColor: {
      type: String,
      default: "#444",
    },

    // Color of the text. Default: '#333'
    textColor: {
      type: String,
      default: "#333",
    },
  },

  data() {
    return {
      loading: true,
      weather: null,
      error: null,
      location: {},
    };
  },

  watch: {
    apiKey: "hydrate",
    address: "hydrate",
    latitude: "hydrate",
    longitude: "hydrate",
    language: "hydrate",
    units: "hydrate",
  },

  mounted() {
    this.hydrate();
  },

  computed: {
    currently() {
      return this.weather.currently;
    },
    isDownward() {
      const hourly = this.weather.hourly.data;
      const time = new Date().getTime() / 1e3;
      for (let i = 0; i < hourly.length; i++) {
        if (hourly[i].time <= time) continue;
        return hourly[i].temperature < this.currently.temperature;
      }
    },
    windBearing() {
      const t = Math.round(this.currently.windBearing / 45);
      return ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"][t];
    },
    daily() {
      const forecasts = [];
      let globalMaxTemp = -Infinity;
      let globalMinTemp = Infinity;
      const time = new Date().getTime() / 1e3;

      const daily = this.weather.daily.data;
      for (let i = 0; i < daily.length; i++) {
        const day = daily[i];
        if (day.time <= time) continue;
        if (day.temperatureMax > globalMaxTemp) {
          globalMaxTemp = day.temperatureMax;
        }
        if (day.temperatureMin < globalMinTemp) {
          globalMinTemp = day.temperatureMin;
        }
        forecasts.push(Object.assign({}, day));
      }

      const tempRange = globalMaxTemp - globalMinTemp;
      for (let i = 0; i < forecasts.length; ++i) {
        const day = forecasts[i];
        day.weekName = new Date(day.time * 1000).toLocaleDateString(
          this.language,
          { weekday: "short" }
        );
        const max = day.temperatureMax;
        const min = day.temperatureMin;
        day.height = Math.round((100 * (max - min)) / tempRange);
        day.top = Math.round((100 * (globalMaxTemp - max)) / tempRange);
        day.bottom = 100 - (day.top + day.height);
      }
      return forecasts;
    },
  },

  methods: {
    hydrate() {
      this.$set(this, "loading", true);
      this.$nextTick()
        .then(this.processLocation)
        .then(this.loadWeather)
        .then(() => {
          this.$set(this, "error", null);
        })
        .catch((err) => {
          this.$set(this, "error", "" + err);
        })
        .finally(() => {
          this.$set(this, "loading", false);
        });
    },

    processLocation() {
      if (!this.latitude || !this.longitude) {
        if (!this.address) {
          return Utils.fetchLocationByIP().then((data) => {
            this.$set(this, "location", {
              lat: data.latitude,
              lng: data.longitude,
              name: `${data.city}, ${data.country.name}`,
            });
          });
        } else {
          return Utils.geocode(this.address).then((data) => {
            this.$set(this, "location", {
              lat: data.latitude,
              lng: data.longitude,
              name: `${data.region}, ${data.country}`,
            });
          });
        }
      } else {
        return Utils.reverseGeocode(this.latitude, this.longitude).then(
          (data) => {
            this.$set(this, "location", {
              lat: this.latitude,
              lng: this.longitude,
              name: `${data.region}, ${data.country}`,
            });
          }
        );
      }
    },

    loadWeather() {
      return Utils.fetchWeather({
        apiKey: this.apiKey,
        lat: this.location.lat,
        lng: this.location.lng,
        units: this.units,
        language: this.language,
      }).then((data) => {
        console.log(data);
        this.$set(this, "weather", data);
      });
    },
  },
};

import fetchJsonp from "fetch-jsonp";

const IP_CACHE = "vww__cache_ip";
const IP_LOCATION_CACHE = "vww__cache_ip_location";
const GEOCODE_CACHE = "vww__cache_geocode";

const ICON_MAPPINGS = {
  'clear-day': ['01d'],
  'clear-night': ['01n'],
  'cloudy': ['03d', '03n'],
  'fog': ['50d', '50n'],
  'partly-cloudy-day': ['02d', '04d',],
  'partly-cloudy-night': ['02n', '04n'],
  'rain': ['09d', '09n', '10d', '10n', '11d', '11n'],
  'sleet': ['13d', '13n'],
  'snow': ['13d', '13n'],
  'wind': ['50d', '50n']
}

const UNIT_MAPPINGS = {
  'us': 'imperial',
  'uk': 'metric'
}

export default {
  lookupIP() {
    let cache = localStorage[IP_CACHE] || "{}";
    cache = JSON.parse(cache);
    if (cache.ip) {
      return Promise.resolve(cache);
    }

    return fetch("https://www.cloudflare.com/cdn-cgi/trace")
      .then((resp) => resp.text())
      .then((text) => {
        return text
          .split("\n")
          .map((l) => l.split("="))
          .filter((x) => x.length == 2)
          .reduce((o, x) => {
            o[x[0].trim()] = x[1].trim();
            return o;
          }, {});
      })
      .then((data) => {
        localStorage[IP_CACHE] = JSON.stringify(data);
        return data;
      });
  },

  fetchLocationByIP(ip) {
    if (!ip) {
      return this.lookupIP().then((data) => {
        return this.fetchLocationByIP(data["ip"]);
      });
    }

    let cache = localStorage[IP_LOCATION_CACHE] || "{}";
    cache = JSON.parse(cache);
    if (cache[ip]) {
      return cache[ip];
    }

    const apiKey = "f8n4kqe8pv4kii";
    return fetch(`https://api.ipregistry.co/${ip}?key=${apiKey}`)
      .then((resp) => resp.json())
      .then((result) => {
        cache[ip] = result.location || {};
        localStorage[IP_LOCATION_CACHE] = JSON.stringify(cache);
        return cache[ip];
      });
    // latitude, longitude, city, country.name
  },

  geocode(query, reversed = false) {
    let cache = localStorage[GEOCODE_CACHE] || "{}";
    cache = JSON.parse(cache);
    if (cache[query]) {
      return Promise.resolve(cache[query]);
    }

    const apiKey = "c3bb8aa0a56b21122dea6a2a8ada70c8";
    const apiType = reversed ? "reverse" : "forward";
    return fetch(
      `http://api.positionstack.com/v1/${apiType}?access_key=${apiKey}&query=${query}`
    )
      .then((resp) => resp.json())
      .then((result) => {
        cache[query] = result.data[0];
        localStorage[GEOCODE_CACHE] = JSON.stringify(cache);
        return cache[query];
      });
    // latitude, longitude, region, country
  },

  reverseGeocode(lat, lng) {
    return this.geocode(`${lat},${lng}`, true);
  },

  fetchWeather(opts) {
    opts = opts || {};
    opts.units = opts.units || "us";
    opts.language = opts.language || "en";
    if (!opts.lat || !opts.lng) {
      throw new Error("Geolocation is required");
    }

    return fetchJsonp(
      `https://api.darksky.net/forecast/${opts.apiKey}` +
        `/${opts.lat},${opts.lng}` +
        `?units=${opts.units}&lang=${opts.language}`
    ).then((resp) => resp.json());
  },

  fetchOWMWeather(opts = {}) {
    opts.units = opts.units || "us";
    opts.language = opts.language || "en";
    if (!opts.lat || !opts.lng) {
      throw new Error("Geolocation is required");
    }

    const units = UNIT_MAPPINGS[opts.units]

    return fetch(
      `https://api.openweathermap.org/data/2.5/onecall?appid=${opts.apiKey}` +
      `&lat=${opts.lat}` +
      `&lon=${opts.lng}` +
      `&units=${units}` +
      `&lang=${opts.language}`
    ).then((resp) => return this.mapData(resp.json()));
  },

  mapData(data = {}) {
    const { current } = data
    const { weather } = current
    const [currentWeather] = weather
    const { description, icon } = currentWeather
    const iconName = this.mapIcon(icon)

    return {
      currently: Object.assign({}, current, {
        icon: iconName,
        temperature: current.temp,
        summary: description,
        windSpeed: current.wind_speed,
        windBearing: current.wind_deg
      }),
      daily: {
        data: data.daily.map(day => {
          return {
            temperatureMax: day.temp.max,
            temperatureMin: day.temp.min,
            time: day.dt,
            icon: this.mapIcon(day.weather[0].icon),
          }
        })
      },
      hourly: {
        data: data.hourly.map(hour => {
          return {
            temperature: hour.temp,
          }
        })
      }
    }
  },

  mapIcon(code) {
    return Object.keys(ICON_MAPPINGS).find(key => {
      return ICON_MAPPINGS[key].includes(code)
    })
  },
};

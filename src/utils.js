import fetchJsonp from "fetch-jsonp";

const IP_CACHE = "vww__cache_ip";
const IP_LOCATION_CACHE = "vww__cache_ip_location";
const GEOCODE_CACHE = "vww__cache_geocode";

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
};

'use strict';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

/**
 * Helpers.
 */
var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

var ms = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

var debug = createCommonjsModule(function (module, exports) {
/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = ms;

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    var arguments$1 = arguments;

    // disabled?
    if (!debug.enabled) { return; }

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments$1[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') { return match; }
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) { continue; } // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) { return val.stack || val.message; }
  return val;
}
});

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

var browser = createCommonjsModule(function (module, exports) {
exports = module.exports = debug;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) { return; }

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit');

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) { return; }
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}
});

/**
 * Module dependencies
 */

var debug$1 = browser('jsonp');

/**
 * Module exports.
 */

var jsonp_1 = jsonp;

/**
 * Callback index.
 */

var count = 0;

/**
 * Noop function.
 */

function noop(){}

/**
 * JSONP handler
 *
 * Options:
 *  - param {String} qs parameter (`callback`)
 *  - prefix {String} qs parameter (`__jp`)
 *  - name {String} qs parameter (`prefix` + incr)
 *  - timeout {Number} how long after a timeout error is emitted (`60000`)
 *
 * @param {String} url
 * @param {Object|Function} optional options / callback
 * @param {Function} optional callback
 */

function jsonp(url, opts, fn){
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }
  if (!opts) { opts = {}; }

  var prefix = opts.prefix || '__jp';

  // use the callback name that was passed if one was provided.
  // otherwise generate a unique name by incrementing our counter.
  var id = opts.name || (prefix + (count++));

  var param = opts.param || 'callback';
  var timeout = null != opts.timeout ? opts.timeout : 60000;
  var enc = encodeURIComponent;
  var target = document.getElementsByTagName('script')[0] || document.head;
  var script;
  var timer;


  if (timeout) {
    timer = setTimeout(function(){
      cleanup();
      if (fn) { fn(new Error('Timeout')); }
    }, timeout);
  }

  function cleanup(){
    if (script.parentNode) { script.parentNode.removeChild(script); }
    window[id] = noop;
    if (timer) { clearTimeout(timer); }
  }

  function cancel(){
    if (window[id]) {
      cleanup();
    }
  }

  window[id] = function(data){
    debug$1('jsonp got', data);
    cleanup();
    if (fn) { fn(null, data); }
  };

  // add qs component
  url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc(id);
  url = url.replace('?&', '?');

  debug$1('jsonp req "%s"', url);

  // create script
  script = document.createElement('script');
  script.src = url;
  target.parentNode.insertBefore(script, target);

  return cancel;
}

var IP_CACHE = "vww__cache_ip";
var IP_LOCATION_CACHE = "vww__cache_ip_location";
var GEOCODE_CACHE = "vww__cache_geocode";

var ICON_MAPPINGS = {
  "clear-day": ["01d"],
  "clear-night": ["01n"],
  cloudy: ["03d", "03n"],
  fog: ["50d", "50n"],
  "partly-cloudy-day": ["02d", "04d"],
  "partly-cloudy-night": ["02n", "04n"],
  rain: ["09d", "09n", "10d", "10n", "11d", "11n"],
  sleet: ["13d", "13n"],
  snow: ["13d", "13n"],
  wind: ["50d", "50n"],
};

var UNIT_MAPPINGS = {
  auto: "standard",
  us: "imperial",
  uk: "metric",
};

var utils = {
  lookupIP: function lookupIP() {
    var cache = localStorage[IP_CACHE] || "{}";
    cache = JSON.parse(cache);
    if (cache.ip) {
      return Promise.resolve(cache);
    }

    return fetch("https://www.cloudflare.com/cdn-cgi/trace")
      .then(function (resp) { return resp.text(); })
      .then(function (text) {
        return text
          .split("\n")
          .map(function (l) { return l.split("="); })
          .filter(function (x) { return x.length == 2; })
          .reduce(function (o, x) {
            o[x[0].trim()] = x[1].trim();
            return o;
          }, {});
      })
      .then(function (data) {
        localStorage[IP_CACHE] = JSON.stringify(data);
        return data;
      });
  },

  fetchLocationByIP: function fetchLocationByIP(apiKey, ip) {
    if (!ip) {
      return utils.lookupIP().then(function (data) {
        return utils.fetchLocationByIP(apiKey, data["ip"]);
      });
    }

    var cache = localStorage[IP_LOCATION_CACHE] || "{}";
    cache = JSON.parse(cache);
    if (cache[ip]) {
      return cache[ip];
    }

    apiKey = apiKey || "f8n4kqe8pv4kii";
    return fetch(("https://api.ipregistry.co/" + ip + "?key=" + apiKey))
      .then(function (resp) { return resp.json(); })
      .then(function (result) {
        cache[ip] = result.location || {};
        localStorage[IP_LOCATION_CACHE] = JSON.stringify(cache);
        return cache[ip];
      });
    // latitude, longitude, city, country.name
  },

  geocode: function geocode(apiKey, query, reversed) {
    if ( reversed === void 0 ) reversed = false;

    var cache = localStorage[GEOCODE_CACHE] || "{}";
    cache = JSON.parse(cache);
    if (cache[query]) {
      return Promise.resolve(cache[query]);
    }

    apiKey = apiKey || "c3bb8aa0a56b21122dea6a2a8ada70c8";
    var apiType = reversed ? "reverse" : "forward";
    return fetch(("//api.positionstack.com/v1/" + apiType + "?access_key=" + apiKey + "&query=" + query))
      .then(function (resp) { return resp.json(); })
      .then(function (result) {
        if (result.error) {
          throw new Error("(api.positionstack.com) " + result.error.message);
        }
        cache[query] = result.data[0];
        localStorage[GEOCODE_CACHE] = JSON.stringify(cache);
        return cache[query];
      });
    // latitude, longitude, region, country
  },

  reverseGeocode: function reverseGeocode(apiKey, lat, lng) {
    return utils.geocode(apiKey, (lat + "," + lng), true);
  },

  fetchWeather: function fetchWeather(opts) {
    opts = opts || {};
    opts.units = opts.units || "us";
    opts.language = opts.language || "en";
    if (!opts.lat || !opts.lng) {
      throw new Error("Geolocation is required");
    }
    // return fetchJsonp(
    //   `https://api.darksky.net/forecast/${opts.apiKey}` +
    //     `/${opts.lat},${opts.lng}` +
    //     `?units=${opts.units}&lang=${opts.language}`
    // ).then((resp) => resp.json());
    return new Promise(function (resolve, reject) {
      jsonp_1(
        "https://api.darksky.net/forecast/" + (opts.apiKey) +
          "/" + (opts.lat) + "," + (opts.lng) +
          "?units=" + (opts.units) + "&lang=" + (opts.language),
        function (err, data) {
          if (err) { reject(err); }
          else { resolve(data); }
        }
      );
    });
  },

  fetchOWMWeather: function fetchOWMWeather(opts) {
    if ( opts === void 0 ) opts = {};

    opts.units = opts.units || "auto";
    opts.language = opts.language || "en";
    if (!opts.lat || !opts.lng) {
      throw new Error("Geolocation is required");
    }

    var units = UNIT_MAPPINGS[opts.units] || "standard";

    return fetch(
      "https://api.openweathermap.org/data/2.5/onecall?appid=" + (opts.apiKey) +
        "&lat=" + (opts.lat) +
        "&lon=" + (opts.lng) +
        "&units=" + units +
        "&lang=" + (opts.language)
    )
      .then(function (resp) { return resp.json(); })
      .then(utils.mapData);
  },

  mapData: function mapData(data) {
    var current = data.current;
    var weather = current.weather;
    var currentWeather = weather[0];
    var description = currentWeather.description;
    var icon = currentWeather.icon;
    var iconName = utils.mapIcon(icon);

    return {
      currently: Object.assign({}, current, {
        icon: iconName,
        temperature: current.temp,
        summary: description,
        windSpeed: current.wind_speed,
        windBearing: current.wind_deg,
      }),
      daily: {
        data: data.daily.map(function (day) {
          return {
            temperatureMax: day.temp.max,
            temperatureMin: day.temp.min,
            time: day.dt,
            icon: utils.mapIcon(day.weather[0].icon),
          };
        }),
      },
      hourly: {
        data: data.hourly.map(function (hour) {
          return {
            temperature: hour.temp,
          };
        }),
      },
    };
  },

  mapIcon: function mapIcon(code) {
    return Object.keys(ICON_MAPPINGS).find(function (key) {
      return ICON_MAPPINGS[key].includes(code);
    });
  },
};

/* Set up a RequestAnimationFrame shim so we can animate efficiently FOR
 * GREAT JUSTICE. */
var requestInterval, cancelInterval;

(function () {
  var raf =
      commonjsGlobal.requestAnimationFrame ||
      commonjsGlobal.webkitRequestAnimationFrame ||
      commonjsGlobal.mozRequestAnimationFrame ||
      commonjsGlobal.oRequestAnimationFrame ||
      commonjsGlobal.msRequestAnimationFrame,
    caf =
      commonjsGlobal.cancelAnimationFrame ||
      commonjsGlobal.webkitCancelAnimationFrame ||
      commonjsGlobal.mozCancelAnimationFrame ||
      commonjsGlobal.oCancelAnimationFrame ||
      commonjsGlobal.msCancelAnimationFrame;

  if (raf && caf) {
    requestInterval = function (fn) {
      var handle = { value: null };

      function loop() {
        handle.value = raf(loop);
        fn();
      }

      loop();
      return handle;
    };

    cancelInterval = function (handle) {
      caf(handle.value);
    };
  } else {
    requestInterval = setInterval;
    cancelInterval = clearInterval;
  }
})();

/* Catmull-rom spline stuffs. */
/*
  function upsample(n, spline) {
    var polyline = [],
        len = spline.length,
        bx  = spline[0],
        by  = spline[1],
        cx  = spline[2],
        cy  = spline[3],
        dx  = spline[4],
        dy  = spline[5],
        i, j, ax, ay, px, qx, rx, sx, py, qy, ry, sy, t;

    for(i = 6; i !== spline.length; i += 2) {
      ax = bx;
      bx = cx;
      cx = dx;
      dx = spline[i    ];
      px = -0.5 * ax + 1.5 * bx - 1.5 * cx + 0.5 * dx;
      qx =        ax - 2.5 * bx + 2.0 * cx - 0.5 * dx;
      rx = -0.5 * ax            + 0.5 * cx           ;
      sx =                   bx                      ;

      ay = by;
      by = cy;
      cy = dy;
      dy = spline[i + 1];
      py = -0.5 * ay + 1.5 * by - 1.5 * cy + 0.5 * dy;
      qy =        ay - 2.5 * by + 2.0 * cy - 0.5 * dy;
      ry = -0.5 * ay            + 0.5 * cy           ;
      sy =                   by                      ;

      for(j = 0; j !== n; ++j) {
        t = j / n;

        polyline.push(
          ((px * t + qx) * t + rx) * t + sx,
          ((py * t + qy) * t + ry) * t + sy
        );
      }
    }

    polyline.push(
      px + qx + rx + sx,
      py + qy + ry + sy
    );

    return polyline;
  }

  function downsample(n, polyline) {
    var len = 0,
        i, dx, dy;

    for(i = 2; i !== polyline.length; i += 2) {
      dx = polyline[i    ] - polyline[i - 2];
      dy = polyline[i + 1] - polyline[i - 1];
      len += Math.sqrt(dx * dx + dy * dy);
    }

    len /= n;

    var small = [],
        target = len,
        min = 0,
        max, t;

    small.push(polyline[0], polyline[1]);

    for(i = 2; i !== polyline.length; i += 2) {
      dx = polyline[i    ] - polyline[i - 2];
      dy = polyline[i + 1] - polyline[i - 1];
      max = min + Math.sqrt(dx * dx + dy * dy);

      if(max > target) {
        t = (target - min) / (max - min);

        small.push(
          polyline[i - 2] + dx * t,
          polyline[i - 1] + dy * t
        );

        target += len;
      }

      min = max;
    }

    small.push(polyline[polyline.length - 2], polyline[polyline.length - 1]);

    return small;
  }
  */

/* Define skycon things. */
/* FIXME: I'm *really really* sorry that this code is so gross. Really, I am.
 * I'll try to clean it up eventually! Promise! */
var KEYFRAME = 500,
  STROKE = 0.08,
  TAU = 2.0 * Math.PI,
  TWO_OVER_SQRT_2 = 2.0 / Math.sqrt(2);

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU, false);
  ctx.fill();
}

function line(ctx, ax, ay, bx, by) {
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.stroke();
}

function puff(ctx, t, cx, cy, rx, ry, rmin, rmax) {
  var c = Math.cos(t * TAU),
    s = Math.sin(t * TAU);

  rmax -= rmin;

  circle(
    ctx,
    cx - s * rx,
    cy + c * ry + rmax * 0.5,
    rmin + (1 - c * 0.5) * rmax
  );
}

function puffs(ctx, t, cx, cy, rx, ry, rmin, rmax) {
  var i;

  for (i = 5; i--; ) { puff(ctx, t + i / 5, cx, cy, rx, ry, rmin, rmax); }
}

function cloud(ctx, t, cx, cy, cw, s, color) {
  t /= 30000;

  var a = cw * 0.21,
    b = cw * 0.12,
    c = cw * 0.24,
    d = cw * 0.28;

  ctx.fillStyle = color;
  puffs(ctx, t, cx, cy, a, b, c, d);

  ctx.globalCompositeOperation = "destination-out";
  puffs(ctx, t, cx, cy, a, b, c - s, d - s);
  ctx.globalCompositeOperation = "source-over";
}

function sun(ctx, t, cx, cy, cw, s, color) {
  t /= 120000;

  var a = cw * 0.25 - s * 0.5,
    b = cw * 0.32 + s * 0.5,
    c = cw * 0.5 - s * 0.5,
    i,
    p,
    cos,
    sin;

  ctx.strokeStyle = color;
  ctx.lineWidth = s;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.arc(cx, cy, a, 0, TAU, false);
  ctx.stroke();

  for (i = 8; i--; ) {
    p = (t + i / 8) * TAU;
    cos = Math.cos(p);
    sin = Math.sin(p);
    line(ctx, cx + cos * b, cy + sin * b, cx + cos * c, cy + sin * c);
  }
}

function moon(ctx, t, cx, cy, cw, s, color) {
  t /= 15000;

  var a = cw * 0.29 - s * 0.5,
    b = cw * 0.05,
    c = Math.cos(t * TAU),
    p = (c * TAU) / -16;

  ctx.strokeStyle = color;
  ctx.lineWidth = s;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  cx += c * b;

  ctx.beginPath();
  ctx.arc(cx, cy, a, p + TAU / 8, p + (TAU * 7) / 8, false);
  ctx.arc(
    cx + Math.cos(p) * a * TWO_OVER_SQRT_2,
    cy + Math.sin(p) * a * TWO_OVER_SQRT_2,
    a,
    p + (TAU * 5) / 8,
    p + (TAU * 3) / 8,
    true
  );
  ctx.closePath();
  ctx.stroke();
}

function rain(ctx, t, cx, cy, cw, s, color) {
  t /= 1350;

  var a = cw * 0.16,
    b = (TAU * 11) / 12,
    c = (TAU * 7) / 12,
    i,
    p,
    x,
    y;

  ctx.fillStyle = color;

  for (i = 4; i--; ) {
    p = (t + i / 4) % 1;
    x = cx + ((i - 1.5) / 1.5) * (i === 1 || i === 2 ? -1 : 1) * a;
    y = cy + p * p * cw;
    ctx.beginPath();
    ctx.moveTo(x, y - s * 1.5);
    ctx.arc(x, y, s * 0.75, b, c, false);
    ctx.fill();
  }
}

function sleet(ctx, t, cx, cy, cw, s, color) {
  t /= 750;

  var a = cw * 0.1875,
    i,
    p,
    x,
    y;

  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (i = 4; i--; ) {
    p = (t + i / 4) % 1;
    x =
      Math.floor(cx + ((i - 1.5) / 1.5) * (i === 1 || i === 2 ? -1 : 1) * a) +
      0.5;
    y = cy + p * cw;
    line(ctx, x, y - s * 1.5, x, y + s * 1.5);
  }
}

function snow(ctx, t, cx, cy, cw, s, color) {
  t /= 3000;

  var a = cw * 0.16,
    b = s * 0.75,
    u = t * TAU * 0.7,
    ux = Math.cos(u) * b,
    uy = Math.sin(u) * b,
    v = u + TAU / 3,
    vx = Math.cos(v) * b,
    vy = Math.sin(v) * b,
    w = u + (TAU * 2) / 3,
    wx = Math.cos(w) * b,
    wy = Math.sin(w) * b,
    i,
    p,
    x,
    y;

  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (i = 4; i--; ) {
    p = (t + i / 4) % 1;
    x = cx + Math.sin((p + i / 4) * TAU) * a;
    y = cy + p * cw;

    line(ctx, x - ux, y - uy, x + ux, y + uy);
    line(ctx, x - vx, y - vy, x + vx, y + vy);
    line(ctx, x - wx, y - wy, x + wx, y + wy);
  }
}

function fogbank(ctx, t, cx, cy, cw, s, color) {
  t /= 30000;

  var a = cw * 0.21,
    b = cw * 0.06,
    c = cw * 0.21,
    d = cw * 0.28;

  ctx.fillStyle = color;
  puffs(ctx, t, cx, cy, a, b, c, d);

  ctx.globalCompositeOperation = "destination-out";
  puffs(ctx, t, cx, cy, a, b, c - s, d - s);
  ctx.globalCompositeOperation = "source-over";
}

/*
  var WIND_PATHS = [
        downsample(63, upsample(8, [
          -1.00, -0.28,
          -0.75, -0.18,
          -0.50,  0.12,
          -0.20,  0.12,
          -0.04, -0.04,
          -0.07, -0.18,
          -0.19, -0.18,
          -0.23, -0.05,
          -0.12,  0.11,
           0.02,  0.16,
           0.20,  0.15,
           0.50,  0.07,
           0.75,  0.18,
           1.00,  0.28
        ])),
        downsample(31, upsample(16, [
          -1.00, -0.10,
          -0.75,  0.00,
          -0.50,  0.10,
          -0.25,  0.14,
           0.00,  0.10,
           0.25,  0.00,
           0.50, -0.10,
           0.75, -0.14,
           1.00, -0.10
        ]))
      ];
  */

var WIND_PATHS = [
    [
      -0.75,
      -0.18,
      -0.7219,
      -0.1527,
      -0.6971,
      -0.1225,
      -0.6739,
      -0.091,
      -0.6516,
      -0.0588,
      -0.6298,
      -0.0262,
      -0.6083,
      0.0065,
      -0.5868,
      0.0396,
      -0.5643,
      0.0731,
      -0.5372,
      0.1041,
      -0.5033,
      0.1259,
      -0.4662,
      0.1406,
      -0.4275,
      0.1493,
      -0.3881,
      0.153,
      -0.3487,
      0.1526,
      -0.3095,
      0.1488,
      -0.2708,
      0.1421,
      -0.2319,
      0.1342,
      -0.1943,
      0.1217,
      -0.16,
      0.1025,
      -0.129,
      0.0785,
      -0.1012,
      0.0509,
      -0.0764,
      0.0206,
      -0.0547,
      -0.012,
      -0.0378,
      -0.0472,
      -0.0324,
      -0.0857,
      -0.0389,
      -0.1241,
      -0.0546,
      -0.1599,
      -0.0814,
      -0.1876,
      -0.1193,
      -0.1964,
      -0.1582,
      -0.1935,
      -0.1931,
      -0.1769,
      -0.2157,
      -0.1453,
      -0.229,
      -0.1085,
      -0.2327,
      -0.0697,
      -0.224,
      -0.0317,
      -0.2064,
      0.0033,
      -0.1853,
      0.0362,
      -0.1613,
      0.0672,
      -0.135,
      0.0961,
      -0.1051,
      0.1213,
      -0.0706,
      0.1397,
      -0.0332,
      0.1512,
      0.0053,
      0.158,
      0.0442,
      0.1624,
      0.0833,
      0.1636,
      0.1224,
      0.1615,
      0.1613,
      0.1565,
      0.1999,
      0.15,
      0.2378,
      0.1402,
      0.2749,
      0.1279,
      0.3118,
      0.1147,
      0.3487,
      0.1015,
      0.3858,
      0.0892,
      0.4236,
      0.0787,
      0.4621,
      0.0715,
      0.5012,
      0.0702,
      0.5398,
      0.0766,
      0.5768,
      0.089,
      0.6123,
      0.1055,
      0.6466,
      0.1244,
      0.6805,
      0.144,
      0.7147,
      0.163,
      0.75,
      0.18 ],
    [
      -0.75,
      0.0,
      -0.7033,
      0.0195,
      -0.6569,
      0.0399,
      -0.6104,
      0.06,
      -0.5634,
      0.0789,
      -0.5155,
      0.0954,
      -0.4667,
      0.1089,
      -0.4174,
      0.1206,
      -0.3676,
      0.1299,
      -0.3174,
      0.1365,
      -0.2669,
      0.1398,
      -0.2162,
      0.1391,
      -0.1658,
      0.1347,
      -0.1157,
      0.1271,
      -0.0661,
      0.1169,
      -0.017,
      0.1046,
      0.0316,
      0.0903,
      0.0791,
      0.0728,
      0.1259,
      0.0534,
      0.1723,
      0.0331,
      0.2188,
      0.0129,
      0.2656,
      -0.0064,
      0.3122,
      -0.0263,
      0.3586,
      -0.0466,
      0.4052,
      -0.0665,
      0.4525,
      -0.0847,
      0.5007,
      -0.1002,
      0.5497,
      -0.113,
      0.5991,
      -0.124,
      0.6491,
      -0.1325,
      0.6994,
      -0.138,
      0.75,
      -0.14 ] ],
  WIND_OFFSETS = [
    { start: 0.36, end: 0.11 },
    { start: 0.56, end: 0.16 } ];

function leaf(ctx, t, x, y, cw, s, color) {
  var a = cw / 8,
    b = a / 3,
    c = 2 * b,
    d = (t % 1) * TAU,
    e = Math.cos(d),
    f = Math.sin(d);

  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = s;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.arc(x, y, a, d, d + Math.PI, false);
  ctx.arc(x - b * e, y - b * f, c, d + Math.PI, d, false);
  ctx.arc(x + c * e, y + c * f, b, d + Math.PI, d, true);
  ctx.globalCompositeOperation = "destination-out";
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.stroke();
}

function swoosh(ctx, t, cx, cy, cw, s, index, total, color) {
  t /= 2500;

  var path = WIND_PATHS[index],
    a = (t + index - WIND_OFFSETS[index].start) % total,
    c = (t + index - WIND_OFFSETS[index].end) % total,
    e = (t + index) % total,
    b,
    d,
    f,
    i;

  ctx.strokeStyle = color;
  ctx.lineWidth = s;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (a < 1) {
    ctx.beginPath();

    a *= path.length / 2 - 1;
    b = Math.floor(a);
    a -= b;
    b *= 2;
    b += 2;

    ctx.moveTo(
      cx + (path[b - 2] * (1 - a) + path[b] * a) * cw,
      cy + (path[b - 1] * (1 - a) + path[b + 1] * a) * cw
    );

    if (c < 1) {
      c *= path.length / 2 - 1;
      d = Math.floor(c);
      c -= d;
      d *= 2;
      d += 2;

      for (i = b; i !== d; i += 2)
        { ctx.lineTo(cx + path[i] * cw, cy + path[i + 1] * cw); }

      ctx.lineTo(
        cx + (path[d - 2] * (1 - c) + path[d] * c) * cw,
        cy + (path[d - 1] * (1 - c) + path[d + 1] * c) * cw
      );
    } else
      { for (i = b; i !== path.length; i += 2)
        { ctx.lineTo(cx + path[i] * cw, cy + path[i + 1] * cw); } }

    ctx.stroke();
  } else if (c < 1) {
    ctx.beginPath();

    c *= path.length / 2 - 1;
    d = Math.floor(c);
    c -= d;
    d *= 2;
    d += 2;

    ctx.moveTo(cx + path[0] * cw, cy + path[1] * cw);

    for (i = 2; i !== d; i += 2)
      { ctx.lineTo(cx + path[i] * cw, cy + path[i + 1] * cw); }

    ctx.lineTo(
      cx + (path[d - 2] * (1 - c) + path[d] * c) * cw,
      cy + (path[d - 1] * (1 - c) + path[d + 1] * c) * cw
    );

    ctx.stroke();
  }

  if (e < 1) {
    e *= path.length / 2 - 1;
    f = Math.floor(e);
    e -= f;
    f *= 2;
    f += 2;

    leaf(
      ctx,
      t,
      cx + (path[f - 2] * (1 - e) + path[f] * e) * cw,
      cy + (path[f - 1] * (1 - e) + path[f + 1] * e) * cw,
      cw,
      s,
      color
    );
  }
}

var Skycons = function (opts) {
  this.list = [];
  this.interval = null;
  this.color = opts && opts.color ? opts.color : "black";
  this.resizeClear = !!(opts && opts.resizeClear);
};

Skycons.CLEAR_DAY = function (ctx, t, color) {
  var w = ctx.canvas.width,
    h = ctx.canvas.height,
    s = Math.min(w, h);

  sun(ctx, t, w * 0.5, h * 0.5, s, s * STROKE, color);
};

Skycons.CLEAR_NIGHT = function (ctx, t, color) {
  var w = ctx.canvas.width,
    h = ctx.canvas.height,
    s = Math.min(w, h);

  moon(ctx, t, w * 0.5, h * 0.5, s, s * STROKE, color);
};

Skycons.PARTLY_CLOUDY_DAY = function (ctx, t, color) {
  var w = ctx.canvas.width,
    h = ctx.canvas.height,
    s = Math.min(w, h);

  sun(ctx, t, w * 0.625, h * 0.375, s * 0.75, s * STROKE, color);
  cloud(ctx, t, w * 0.375, h * 0.625, s * 0.75, s * STROKE, color);
};

Skycons.PARTLY_CLOUDY_NIGHT = function (ctx, t, color) {
  var w = ctx.canvas.width,
    h = ctx.canvas.height,
    s = Math.min(w, h);

  moon(ctx, t, w * 0.667, h * 0.375, s * 0.75, s * STROKE, color);
  cloud(ctx, t, w * 0.375, h * 0.625, s * 0.75, s * STROKE, color);
};

Skycons.CLOUDY = function (ctx, t, color) {
  var w = ctx.canvas.width,
    h = ctx.canvas.height,
    s = Math.min(w, h);

  cloud(ctx, t, w * 0.5, h * 0.5, s, s * STROKE, color);
};

Skycons.RAIN = function (ctx, t, color) {
  var w = ctx.canvas.width,
    h = ctx.canvas.height,
    s = Math.min(w, h);

  rain(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
  cloud(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
};

Skycons.SLEET = function (ctx, t, color) {
  var w = ctx.canvas.width,
    h = ctx.canvas.height,
    s = Math.min(w, h);

  sleet(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
  cloud(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
};

Skycons.SNOW = function (ctx, t, color) {
  var w = ctx.canvas.width,
    h = ctx.canvas.height,
    s = Math.min(w, h);

  snow(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
  cloud(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
};

Skycons.WIND = function (ctx, t, color) {
  var w = ctx.canvas.width,
    h = ctx.canvas.height,
    s = Math.min(w, h);

  swoosh(ctx, t, w * 0.5, h * 0.5, s, s * STROKE, 0, 2, color);
  swoosh(ctx, t, w * 0.5, h * 0.5, s, s * STROKE, 1, 2, color);
};

Skycons.FOG = function (ctx, t, color) {
  var w = ctx.canvas.width,
    h = ctx.canvas.height,
    s = Math.min(w, h),
    k = s * STROKE;

  fogbank(ctx, t, w * 0.5, h * 0.32, s * 0.75, k, color);

  t /= 5000;

  var a = Math.cos(t * TAU) * s * 0.02,
    b = Math.cos((t + 0.25) * TAU) * s * 0.02,
    c = Math.cos((t + 0.5) * TAU) * s * 0.02,
    d = Math.cos((t + 0.75) * TAU) * s * 0.02,
    n = h * 0.936,
    e = Math.floor(n - k * 0.5) + 0.5,
    f = Math.floor(n - k * 2.5) + 0.5;

  ctx.strokeStyle = color;
  ctx.lineWidth = k;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  line(ctx, a + w * 0.2 + k * 0.5, e, b + w * 0.8 - k * 0.5, e);
  line(ctx, c + w * 0.2 + k * 0.5, f, d + w * 0.8 - k * 0.5, f);
};

Skycons.prototype = {
  _determineDrawingFunction: function (draw) {
    if (typeof draw === "string")
      { draw = Skycons[draw.toUpperCase().replace(/-/g, "_")] || null; }

    return draw;
  },
  add: function (el, draw) {
    var obj;

    if (typeof el === "string") { el = document.getElementById(el); }

    // Does nothing if canvas name doesn't exists
    if (el === null || el === undefined) { return; }

    draw = this._determineDrawingFunction(draw);

    // Does nothing if the draw function isn't actually a function
    if (typeof draw !== "function") { return; }

    obj = {
      element: el,
      context: el.getContext("2d"),
      drawing: draw,
    };

    this.list.push(obj);
    this.draw(obj, KEYFRAME);
  },
  set: function (el, draw) {
    var i;

    if (typeof el === "string") { el = document.getElementById(el); }

    for (i = this.list.length; i--; )
      { if (this.list[i].element === el) {
        this.list[i].drawing = this._determineDrawingFunction(draw);
        this.draw(this.list[i], KEYFRAME);
        return;
      } }

    this.add(el, draw);
  },
  remove: function (el) {
    var i;

    if (typeof el === "string") { el = document.getElementById(el); }

    for (i = this.list.length; i--; )
      { if (this.list[i].element === el) {
        this.list.splice(i, 1);
        return;
      } }
  },
  draw: function (obj, time) {
    var canvas = obj.context.canvas;

    if (this.resizeClear) { canvas.width = canvas.width; }
    else { obj.context.clearRect(0, 0, canvas.width, canvas.height); }

    obj.drawing(obj.context, time, this.color);
  },
  play: function () {
    var self = this;

    this.pause();
    this.interval = requestInterval(function () {
      var now = Date.now(),
        i;

      for (i = self.list.length; i--; ) { self.draw(self.list[i], now); }
    }, 1000 / 60);
  },
  pause: function () {
    if (this.interval) {
      cancelInterval(this.interval);
      this.interval = null;
    }
  },
};

var skycons = Skycons;

function buildWrapper(skycons) {
  var wrapped = {};
  wrapped.paused = !skycons.interval;
  wrapped.play = function () {
    skycons.play();
    wrapped.paused = false;
  };
  wrapped.pause = function () {
    skycons.pause();
    wrapped.paused = true;
  };
  return wrapped;
}

var SkyconComponent = {
render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('canvas',{attrs:{"width":_vm.width,"height":_vm.height,"data-condition":_vm.condition}})},
staticRenderFns: [],
  props: {
    // Weather condition
    condition: {
      type: String,
      required: true
    },

    // Icon size
    size: {
      type: [Number, String],
      default: 64
    },

    // Icon color
    color: {
      type: String,
      default: "black"
    },

    // Start with paused animation
    paused: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    width: function width() {
      return "" + this.size;
    },
    height: function height() {
      return "" + this.size;
    },
    icon: function icon() {
      return this.condition.toUpperCase().replace(/[\s.-]/g, "_");
    }
  },
  mounted: function mounted() {
    var skycons$1 = new skycons({ color: this.color });
    skycons$1.set(this.$el, skycons[this.icon]);
    if (!this.paused) { skycons$1.play(); }
    this.$emit("load", buildWrapper(skycons$1));
  }
};

var VueWeatherWidget = {
render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"vww__widget",style:({ color: _vm.textColor })},[_vm._t("header",[(!_vm.hideHeader)?_c('div',{staticClass:"vww__header",style:({ borderColor: _vm.barColor })},[_vm._t("title",[_c('span',{staticClass:"vww__title"},[_vm._v("\n          "+_vm._s(("Weather for " + (_vm.location.name)))+"\n        ")])])],2):_vm._e()]),_vm._v(" "),_c('div',{staticClass:"vww__content"},[(_vm.loading)?_c('div',{staticClass:"vww__loading"},[_vm._t("loading",[_c('skycon',{attrs:{"condition":"partly-cloudy-day","color":_vm.textColor,"paused":_vm.disableAnimation}}),_vm._v(" "),_c('span',{staticClass:"vww__title"},[_vm._v("Loading...")])])],2):(_vm.error || !_vm.weather || !_vm.currently || !_vm.daily)?_c('div',{staticClass:"vww__error"},[_vm._t("error",[_c('skycon',{attrs:{"condition":"rain","color":_vm.textColor,"paused":_vm.disableAnimation}}),_vm._v(" "),_c('span',{staticClass:"vww__title"},[_vm._v(_vm._s(_vm.error || "Something went wrong!"))])])],2):[_c('div',{staticClass:"vww__currently"},[_c('div',[_c('skycon',{attrs:{"condition":_vm.currently.icon,"size":"80","color":_vm.textColor,"paused":_vm.disableAnimation}}),_vm._v(" "),_c('div',{staticClass:"vww__temp"},[_vm._v("\n            "+_vm._s(Math.round(_vm.currently.temperature))+"°\n            "),(_vm.isDownward)?_c('div',[_c('svg',{attrs:{"viewBox":"0 0 306 306","width":"24","height":"24"}},[_c('polygon',{style:({ fill: _vm.textColor }),attrs:{"points":"270.3,58.65 153,175.95 35.7,58.65 0,94.35 153,247.35 306,94.35"}})])]):_c('div',[_c('svg',{attrs:{"viewBox":"0 0 306 306","width":"24","height":"24"}},[_c('polygon',{style:({ fill: _vm.textColor }),attrs:{"points":"35.7,247.35 153,130.05 270.3,247.35 306,211.65 153,58.65 0,211.65"}})])])])],1),_vm._v(" "),_c('div',{staticClass:"vww__title"},[_vm._v(_vm._s(_vm.currently.summary))]),_vm._v(" "),_c('div',{staticClass:"vww__wind"},[_vm._v("\n          Wind: "+_vm._s(Math.round(_vm.currently.windSpeed))+" mph ("+_vm._s(_vm.windBearing)+")\n        ")])]),_vm._v(" "),_c('div',{staticClass:"vww__daily"},_vm._l((_vm.daily),function(day){return _c('div',{key:day.time,staticClass:"vww__day"},[_c('span',[_vm._v(_vm._s(day.weekName))]),_vm._v(" "),_c('span',[_c('skycon',{staticStyle:{"display":"block"},attrs:{"condition":day.icon,"size":"26","color":_vm.textColor,"paused":_vm.disableAnimation}})],1),_vm._v(" "),_c('div',{staticClass:"vww__day-bar"},[_c('div',{style:({ height: ((day.top) + "%") })},[_c('span',[_vm._v(_vm._s(Math.round(day.temperatureMax))+"°")])]),_vm._v(" "),_c('div',{style:({
                borderRadius: '10px',
                background: _vm.barColor,
                height: ((day.height) + "%"),
              })},[_vm._v("\n               \n            ")]),_vm._v(" "),_c('div',{style:({ height: ((day.bottom) + "%") })},[_c('span',[_vm._v(_vm._s(Math.round(day.temperatureMin))+"°")])])])])}),0)]],2)],2)},
staticRenderFns: [],
  name: "VueWeatherWidget",

  components: {
    Skycon: SkyconComponent,
  },

  props: {
    // Pass true to use DarkSky API, otherwise it will use OpenWeatherMap API
    useDarkSkyApi: {
      type: Boolean,
      default: false,
    },

    // Your Dark Sky / OpenWeatherMap secret key
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

    // Auto update interval in milliseconds
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

    // Your positionstack api key for geocoding
    positionstackApi: {
      type: String,
      default: "c3bb8aa0a56b21122dea6a2a8ada70c8",
    },

    // Your ipregistry key to get location from ip address
    ipregistryKey: {
      type: String,
      default: "f8n4kqe8pv4kii",
    },
  },

  data: function data() {
    return {
      loading: true,
      weather: null,
      error: null,
      location: {},
      timeout: null,
    };
  },

  watch: {
    apiKey: "hydrate",
    address: "hydrate",
    latitude: "hydrate",
    longitude: "hydrate",
    language: "hydrate",
    units: "hydrate",
    updateInterval: "hydrate",
  },

  mounted: function mounted() {
    this.hydrate();
  },

  destroyed: function destroyed() {
    clearTimeout(this.timeout);
  },

  computed: {
    currently: function currently() {
      return this.weather.currently;
    },
    isDownward: function isDownward() {
      var hourly = this.weather.hourly.data;
      var time = new Date().getTime() / 1e3;
      for (var i = 0; i < hourly.length; i++) {
        if (hourly[i].time <= time) { continue; }
        return hourly[i].temperature < this.currently.temperature;
      }
    },
    windBearing: function windBearing() {
      var t = Math.round(this.currently.windBearing / 45);
      return ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"][t];
    },
    daily: function daily() {
      var forecasts = [];
      var globalMaxTemp = -Infinity;
      var globalMinTemp = Infinity;

      var tomorrow = new Date(new Date().toDateString());
      var today = tomorrow.getTime() / 1e3 + 24 * 3600 - 1;

      var daily = this.weather.daily.data;
      for (var i = 0; i < daily.length; i++) {
        var day = daily[i];
        if (day.temperatureMax > globalMaxTemp) {
          globalMaxTemp = day.temperatureMax;
        }
        if (day.temperatureMin < globalMinTemp) {
          globalMinTemp = day.temperatureMin;
        }
        forecasts.push(Object.assign({}, day));
      }

      var tempRange = globalMaxTemp - globalMinTemp;
      for (var i$1 = 0; i$1 < forecasts.length; ++i$1) {
        var day$1 = forecasts[i$1];
        if (day$1.time <= today) {
          day$1.weekName = "Today";
        } else {
          day$1.weekName = new Date(day$1.time * 1000).toLocaleDateString(this.language, {
            weekday: "short",
          });
        }
        var max = day$1.temperatureMax;
        var min = day$1.temperatureMin;
        day$1.height = Math.round((100 * (max - min)) / tempRange);
        day$1.top = Math.round((100 * (globalMaxTemp - max)) / tempRange);
        day$1.bottom = 100 - (day$1.top + day$1.height);
      }
      return forecasts;
    },
  },

  methods: {
    loadWeather: function loadWeather() {
      var this$1 = this;

      var fetchWeatherMethod = this.useDarkSkyApi ? utils.fetchWeather : utils.fetchOWMWeather;
      return fetchWeatherMethod({
        apiKey: this.apiKey,
        lat: this.location.lat,
        lng: this.location.lng,
        units: this.units,
        language: this.language,
      }).then(function (data) {
        this$1.$set(this$1, "weather", data);
      });
    },

    autoupdate: function autoupdate() {
      var this$1 = this;

      clearTimeout(this.timeout);
      var time = Number(this.updateInterval);
      if (!time || time < 10 || this.destroyed) {
        return;
      }
      this.timeout = setTimeout(function () { return this$1.hydrate(false); }, time);
    },

    hydrate: function hydrate(setLoading) {
      var this$1 = this;
      if ( setLoading === void 0 ) setLoading = true;

      this.$set(this, "loading", setLoading);
      return this.$nextTick()
        .then(this.processLocation)
        .then(this.loadWeather)
        .then(function () {
          this$1.$set(this$1, "error", null);
        })
        .catch(function (err) {
          this$1.$set(this$1, "error", "" + err);
        })
        .finally(function () {
          this$1.$set(this$1, "loading", false);
          this$1.autoupdate();
        });
    },

    processLocation: function processLocation() {
      var this$1 = this;

      if (!this.latitude || !this.longitude) {
        if (!this.address) {
          return utils.fetchLocationByIP(this.ipregistryKey).then(function (data) {
            this$1.$set(this$1, "location", {
              lat: data.latitude,
              lng: data.longitude,
              name: ((data.city) + ", " + (data.country.name)),
            });
          });
        } else {
          return utils.geocode(this.positionstackApi, this.address).then(function (data) {
            this$1.$set(this$1, "location", {
              lat: data.latitude,
              lng: data.longitude,
              name: ((data.region) + ", " + (data.country)),
            });
          });
        }
      } else {
        return utils.reverseGeocode(this.positionstackApi, this.latitude, this.longitude).then(
          function (data) {
            this$1.$set(this$1, "location", {
              lat: this$1.latitude,
              lng: this$1.longitude,
              name: ((data.region) + ", " + (data.country)),
            });
          }
        );
      }
    },
  },
};

module.exports = VueWeatherWidget;

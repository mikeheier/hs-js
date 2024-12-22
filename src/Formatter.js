import { format as formatDate } from '@/DateUtil.js';
import Currencies from '@/data/currencies.json';
import { getCountry } from '@/CountryUtil.js';
import { Preferences } from '@/model/Preferences.js';
import {
   round,
   merge,
   find as ldFind,
   each,
   compact,
   chunk,
   get as ldGet
} from 'lodash';
import {
   isNil,
   sprintf,
   toDistanceUnits,
   toFahrenheit,
   twosComp,
   toHex
} from '@/Utils.js';

const _resources = {
   copy: {
      yes: 'Yes',
      no: 'No',
      oneWeek: '1 Week',
      numWeeks: '{num} Weeks',
      oneDay: '1 Day',
      numDays: '{num} Days',
      oneHour: '1 Hour',
      numHours: '{num} Hours',
      oneMinute: '1 Minute',
      numMinutes: '{num} Minutes'
   }
};

let _currentPrefs = new Preferences();

function _getCurrentPreferences() {
   return _currentPrefs;
}

function _translate(resourcePath, tokenObj) {
   return sprintf(ldGet(_resources, (resourcePath || '').replace(/^\*/, ''), ''), tokenObj) ?? '';
}

export function batteryLevel(mvols) {
   return (+mvols / 1000).toFixed(2) + 'V';
}

/**
 * code - can be 3 digit code, 2 char code or 3 char code
 */
export function country(code) {
   const c = getCountry(code);

   return c?.name ?? code ?? '';
}

// TODO: thousands seperator
export function currency(amount, code = 'USD', appendCode = false) {
   let val = 0;
   let formatted = '';

   if (!isNaN(amount)) {
      val = +amount;
   }

   val = val.toFixed(2);

   // default to USD fromat
   code = code || 'USD';
   formatted = `$${val}`;

   if (code && !/usd/i.test(code)) {
      const cd = Currencies.find(c => c.currency_code.toLowerCase() === code.toLowerCase());
      const format = cd && cd.format;

      if (format) {
         const data = {
            lsym: format.positionLeft ? cd.currency_symbol : '',
            rsym: !format.positionLeft ? cd.currency_symbol : '',
            sp: format.hasSpace ? ' ' : ''
         };

         val = val.replace('.', format.fractionalSeparator);

         formatted = `${data.lsym}${data.sp}${val}${data.sp}${data.rsym}`.trim();
      }
   }

   return appendCode ? `${formatted} (${code})` : formatted;
}

export function date(date, options = {}) {
   options.includeTime = false;

   return this.dateTime(date, options);
}

/**
 * options
 *    includeDate {boolean} - default true, flag to include date part
 *    includeTime {boolean} - default true, flag to include time part
 *    seperator {string} - default spacee
 * See DateUtil.format for more options
 */
export function dateTime(date, options) {
   options = options ?? {};
   // these flags will not matter if format is set in options.
   const includeDate = options.includeDate ?? true;
   const includeTime = options.includeTime ?? true;
   let format = '';

   if (includeDate) {
      format += _getCurrentPreferences().getDateFormat();
   }

   if (includeTime) {
      if (format) {
         format += (options.seperator ?? ' ');
      }

      format += _getCurrentPreferences().getTimeFormat();
   }

   return formatDate(date, merge({
      format: format,
      jvmTimeZoneId: _getCurrentPreferences().jvmTimeZoneId
   }, options));
}

/**
 * Converts meters only and uses the distanceUom
 * of the Preference object to determine imperial or metric.
 * 
 * If the value in meters is < 1km, then we display the value in meters
 * If the value in feet is < 0.5mi, then we display the value in feet
 * 
 * distanceUom m|ft
 * imperial -> ft
 * metric -> m
 */
export function distance(valInMeters, uom) {
   uom = uom || _getCurrentPreferences().distanceUoM;

   if (isNil(valInMeters)) {
      return '';
   }

   if (uom === 'm') {
      if (valInMeters > 1000) {
         uom = 'km';
      }
   }
   // 8046.72 === 0.5 miles
   else if (valInMeters > 8046.72) {
      uom = 'mi';
   }

   return round(toDistanceUnits(valInMeters, 'm', uom), 2) + uom;
}

export function getResources() {
   return _resources;
}

/**
 * options
 *    - link {boolean}
 */
export function glatLng(coord, options) {
   let gcObj = coord;

   if (coord) {
      const ops_ = options || {};

      if (Array.isArray(coord) && coord.length > 1) {
         // geojson - [x, y] -> [lng, lat]
         gcObj = {
            lat: coord[1],
            lng: coord[0]
         };
      }

      if (gcObj.lat && gcObj.lng) {
         const lls = `${(+gcObj.lat).toFixed(6)}, ${(+gcObj.lng).toFixed(6)}`;

         if (ops_.link) {
            // see https://developers.google.com/maps/documentation/urls/get-started#search-action
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lls.replace(/\s/g, ''))}`;
         }
         else {
            return lls;
         }
      }
   }

   return '';
}

export function loadResources(resources) {
   merge(_resources, resources);
}

export function lookup(id, list, idField = 'id', nameField = 'name') {
   if (list && list.length) {
      const item = ldFind(list, li => id === li[idField]);

      if (item) {
         return item[nameField];
      }
   }

   return id;
}

export function mediaDuration(millis, pattern) {
   let minutes = 0;
   let hours = 0;
   let seconds = 0;

   pattern = pattern ?? 'hh:mm:ss.SSS';
   millis = Math.floor(+millis) || 0; // use || vs ?? as ?? is for null or undefined, || will catch NaN and if 0 then we still have 0
   seconds = Math.floor(millis / 1000) || 0;
   millis -= seconds * 1000;
   minutes = Math.floor(seconds / 60);
   seconds -= minutes * 60;
   hours = Math.floor(minutes / 60);
   minutes -= hours * 60;

   return pattern
            .replace(/h+/, padStart(hours, pattern.match(/h/g)?.length, '0'))
            .replace(/m+/, padStart(minutes, pattern.match(/m/g)?.length, '0'))
            .replace(/s+/, padStart(seconds, pattern.match(/s/g)?.length, '0'))
            .replace(/S+/, padStart(millis, pattern.match(/S/g)?.length, '0'));
}

// NWP - negative numbers with parenthesis
export function numberNWP(value) {
   value = +value;

   if (!isNaN(value)) {
      return value < 0 ? '(' + Math.abs(value) + ')' : '' + value;
   }

   return '';
}

export function padEnd(val, len, char) {
   // default to empty string
   val = val ?? '';

   // use template incase val is not a String
   return `${val}`.padEnd(len, char);
}

export function padStart(val, len, char) {
   // default to empty string
   val = val ?? '';

   // use template incase val is not a String
   return `${val}`.padStart(len, char);
}

export function temperature(valInC, options) {
   if (isNil(valInC)) {
      return '';
   }

   options = options ?? {};
   const includeSymbol = options.includeSymbol ?? true;
   const uom = options.uom || _getCurrentPreferences().temperatureUoM || 'c';

   const val = round(uom.toLowerCase() === 'f' ? toFahrenheit(valInC) : valInC, 2);

   if (!includeSymbol) {
      return val;
   }

   return `${val}\u00b0${uom.toUpperCase()}`;
}

export function time(date, options = {}) {
   options.includeDate = false;

   return this.dateTime(date, options);
}

export function timespan(startTime, endTime) {
   let days;
   let minutes;
   const daysInMinutes = 24 * 60;
   const age = [];

   if (!startTime || !endTime) {
      return '';
   }
   else {
      const plural = (base, qty) => {
            return qty > 1 ? `num${base}s` : `one${base}`;
      };
      const diff = endTime - startTime;
      minutes = Math.ceil(diff / (60000));

      if (minutes >= daysInMinutes) {
         days = Math.floor(minutes / daysInMinutes);
         minutes = minutes - (days * daysInMinutes);
      }

      const hours = Math.floor(minutes / 60);
      minutes = minutes - (60 * hours);

       // hours -= days * 24;
       // minutes -= hours * 60;

      if (days) {
         age.push(_translate(`copy.${plural('Day', days)}`, { num: days }));
      }

      if (hours) {
         age.push(_translate(`copy.${plural('Hour', hours)}`, { num: hours }));
      }

      age.push(_translate(`copy.${plural('Minute', minutes)}`, { num: minutes }));

      return age.join(' ');
   }
}

export function yesNo(val) {
   return _translate('copy.' + (val ? 'yes' : 'no'));
}

export function proper(val) {
   return `${val ?? ''}`.trim().split(/\s/g).map(s => `${s.charAt(0).toUpperCase()}${s.slice(1, s.length)}`).join(' ');
}

export const Formatter = {
   batteryLevel,
   country,
   currency,
   date,
   dateTime,
   distance,
   glatLng,
   lookup,
   mediaDuration,
   numberNWP,
   padEnd,
   padStart,
   temperature,
   time,
   timespan,
   yesNo,
   proper
};

export function injectPreferences(prefs) {
   // make sure we always have a value
   _currentPrefs = prefs ?? _currentPrefs;
}

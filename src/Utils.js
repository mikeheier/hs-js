import { format as formatDate } from '@/DateUtil.js';
import {
   compact,
   uniq,
   get as ldGet
} from 'lodash';

const _instanceMap = {};
export const isBrowser = new Function('try {return this===window;}catch(e){ return false;}');

function _splitCsv(csv) {
   var parts = [];
   // var chars = (csv ?? '').replace(/\r/g, '\n').replace(/\n+/g, '\n').split('');
   var chars = (csv ?? '').split('');
   let val = '';
   let isInQuote = false;

   for (let ndx = 0; ndx < chars.length; ndx++) {
      const c = chars[ndx];
      const pc = chars[ndx - 1];

      if (c === '"' && pc !== '\\') {
         isInQuote = !isInQuote;
         val += c; // we need to keep the double quotes
      }
      else if (/\r|\n/.test(c) && !isInQuote) {
         parts.push(val);
         val = '';

         // advance passed consecutive line break chars ie carriage return followed by new line feed (\r\n) and vice versa
         let nc = chars[ndx + 1];
         while (/\r|\n/.test(nc)) {
            if (/\r|\n/.test(nc)) {
               ndx++
            }

            nc = chars[ndx + 1];
         }
      }
      else {
         val += c;
      }
   };

   if (val.length) {
      parts.push(val);
   }

   return parts;
}

function _splitRow(row) {
   var parts = [];
   var chars = row.split('');
   let val = '';
   let isInQuote = false;

   const unescape = (val) => {
      return val.replace(/\\"/g, '"');
   };

   chars
      .forEach((c, ndx) => {
         const pc = chars[ndx - 1];

         if (c === '"' && pc !== '\\') {
            isInQuote = !isInQuote;
         }
         else if (c === ',' && !isInQuote) {
            parts.push(unescape(val));
            val = '';
         }
         else {
            val += c;
         }
      });

   if (val.length) {
      parts.push(unescape(val));
   }

   return parts;
}

export function clearTextSelection() {
   if (window.getSelection) {
      window.getSelection().removeAllRanges();
   }
   else if (document.selection) {
      document.selection.empty();
   }
}

/**
 * Returns the first non nil argument
 */
export function coalesce(...args) {
   if (args && args.length) {
      return find(args, o => !isNil(o));
   }
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// https://davidwalsh.name/javascript-debounce-function
export function debounce(func, wait, immediate) {{
      let timeout;

      return function() {
         const context = this;
         const args = arguments;
         const later = function() {
            timeout = null;
            if (!immediate) {
               func.apply(context, args);
            }
         };
         const callNow = immediate && !timeout;
         
         clearTimeout(timeout);
         timeout = setTimeout(later, wait);
         
         if (callNow) {
            func.apply(context, args);
         }
      };
   }
}

/**
 * Filters an array of files or a FileList based on the inputs accept property.
 *
 * @function filterAcceptedFiles
 * @param files {Array|FileList} the list of files
 * @param accept {String} the file input accept pattern
 *
 * @return an array of files
 */
export function filterAcceptedFiles(files, accept) {
   // always convert to array
   const filesArray = Array.prototype.slice.call(files ?? [])

   if (filesArray.length && accept) {
      const arxs = accept
                     .split(',')
                     .map((val) => {
                        // see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers
                        return new RegExp(val.replace('.', '\\.').replace('*', '.+'), 'i');
                     });

      return filesArray.filter(file => arxs.some(rx => (rx.test(file.type) || rx.test(file.name))));
   }

   return filesArray;
}

/**
 * @function generateFileTimestamp
 * @description generates a timestamp string to append to a file name
 * @param options {object} - {
 *                               timestampFormat {string} : format to use for timestamp.  applies only if fileName is provided
 *                                                          to append to file name. default 'MM-DD-YYYY HHmm A ZZ'.  see moment.js for formats
 *                               useUTCTimestamp {boolean}:   converts timestamp to append to utc.  default to false
 *                               jvmTimeZoneId {string}: timezone to use if not "useUTCTimestamp". defaults to 'utc' if not defined
 *                           }
 *
 * @return the formatted timestamp string
 *
 */
export function generateFileTimestamp(options) {
   const ops = {
      useUTCTimestamp: false,
      timestampFormat: 'MM-DD-YYYY hhmm A ZZ',
      ...options
   };

   if (ops.useUTCTimestamp) {
      return formatDate(new Date(), { jvmTimeZoneId: 'utc', format: ops.timestampFormat });
   }
   else {
      return formatDate(new Date(), { jvmTimeZoneId: ops.jvmTimeZoneId, format: ops.timestampFormat });
   }
}

// https://www.arungudelli.com/tutorial/javascript/how-to-create-uuid-guid-in-javascript-with-examples/
export function generateUUID(useRandom) {
   let uuid;

   if (isBrowser() && !useRandom && crypto?.getRandomValues) {
      return `${[1e7]+-1e3+-4e3+-4e3+-1e11}`
               .replace(/4/g, 'Z')
               .replace(/[01Z]/g, (c) => {
                  if (c === 'Z') {
                     return Math.floor(Math.random() * 5) + 1;
                  }
                  return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
               });
   }
   else {
      return 'xxxxxxxx-xxxx-Zxxx-Zxxx-xxxxxxxxxxxx'
         .replace(/[xZ]/g, (c) => {
            if (c === 'Z') {
               return Math.floor(Math.random() * 5) + 1;
            }
            const r = Math.random() * 16 | 0;
            return r.toString(16);
         });
   }
}

export function getNextInstanceNdx(name = '_') {
   const instanceNdx = _instanceMap[name] ?? 0;

   _instanceMap[name] = instanceNdx + 1;

   return instanceNdx;
}

/**
 * 0 is a valid value
 */
export function hasValue(val) {
   return typeof val !== 'undefined' && val !== null && `${val}`.trim().length > 0;
}

export function isNil(val) {
   return typeof val === 'undefined' || val === null;
}

/**
 * Creates an array from text by splitting on
 * spaces, pipes, commas, colons, semicolons and line breaks
 */
export function parseArrayFromText(text) {
   if (text && text.trim()) {
      return compact(text.split(/\s+|[,:;\n\r]/));
   }

   return [];
}

/**
 * options
 *    - columns {Array}: column definition
 *          > {
 *                key {String}: key on data item
 *                label {String}: display value of column. can specifiy a different attribute using "labelProp"
 *                formatter {Function}: method signature - fn(value, name, item)
 *            }
 *    - labelProp {String}: the field to use for the column header.  defaults to 'label'
 *    - keyProp {String}: the prop on the column definition to use to get the value from the item.  defaults to 'key'
 *    - formatter {Function}: method signature - fn(value, key, item):String
 *          > useful if column defs are used for a table, but need to override the output the value of a column
 *          > defaultFormatter(item, col):String - checks for col.formatter else returns item[col.key]
 */
export function parseCsv(data, options) {
   const defaultFormatter = (item, col) => {
      const prop = col[opts_.keyProp];
      return col.formatter ? col.formatter(item[prop], item.name, item) : item[prop];
   };
   const defaultColumnFilter = (c) => {
      return true;
   };

   const opts_ = {
      labelProp: 'label',
      keyProp: 'key',
      formatter: defaultFormatter,
      columnFilter: defaultColumnFilter,
      ...options
   };
   const fnWrap = (val) => {
      return '"' + (val || '').toString().replace(/"/g, '\\"') + '"';
   };
   const csv = [];
   const hdr = [];
   let cols = (opts_.columns || []).filter(opts_.columnFilter);

   if (!data || !data.length) {
      return '';
   }

   if (!cols || !cols.length) {
      // sample 3 objects to get better key list
      const keySamples = [].concat(Object.keys(data[0]), Object.keys(data[Math.floor(data.length / 2)]), Object.keys(data[data.length - 1]));
      const itemKeys = uniq(keySamples);

      if (itemKeys && itemKeys.length) {
         cols = itemKeys.map((key) => {
            return {
               [opts_.keyProp]: key,
               name: key,
               label: key
            };
         });
      }
   }

   // if we still don't have any column info... get out
   if (!cols || !cols.length) {
      return '';
   }

   cols
      .forEach((col) => {
         const hdrLbl = (col[opts_.labelProp] || '').trim();

         hdr.push(fnWrap(hdrLbl));
      });

   csv.push(hdr.join(','));

   data.
      forEach((item) => {
         const row = [];

         cols
            .forEach((col) => {
               const val = opts_.formatter(item, col, defaultFormatter);
               row.push(fnWrap(val));
            });

         csv.push(row.join(','));
      });

   return csv.join('\n');
}

/**
 * A wrapper for JSON.parse so we can silent any errors
 * @param {string} jsonStr - The string to parse.
 * @param {object|function} defaultValue - The default value to return if parsing fails. Can be a function
 */
export function parseJSON(jsonStr, defaultValue) {
   if (jsonStr) {
      try {
         return JSON.parse(jsonStr);
      }
      catch (e) {
         console.warn('<<< parseJSON >>> failed to parse:', jsonStr, e);
      }
   }

   return toValue(defaultValue);
}

/**
 * This will inspect the "search" property and split it into search and searchtype if applicable
 *
 * params {object}: the query param object containing the "search" term
 * searchTypeCodeProcessor {function}: callback to determine the searchtype. fn(searchTypeCode):String - where searchTypeCode is the content preceeding the ":"
 */
export function parseSearchQueryParam(params, searchTypeCodeProcessor) {
   if (params && params.search) {
      if (/^\w*:/.test(params.search)) {
         const stcd = (params.search.replace(/^(\w*):.+/, '$1') || '').trim().toLowerCase();

         if (isNil(searchTypeCodeProcessor)) {
            searchTypeCodeProcessor = (code) => {
               return code;
            };
         }

         params.searchtype = searchTypeCodeProcessor(stcd);
         params.search = params.search.replace(/^\w*:(.+)/, '$1').trim();
      }
      // so users can search on 'something:something' or ':something'
      // only need to escape the first ':'
      // unfortunately, we cannot search on '\:' without creating another condition to pull escape chars
      // if we need to, we can create an escape engine
      else if (/\\:/.test(params.search)) {
         params.search = params.search.replace(/\\:/, ':');
      }
   }
}

/**
 * path {String}
 * params {Object} - url/path params
 * query {Object} - url query params
 * tokenReplacer {Function} - fn(key):<String|RegExp> - use if path tokens do not match ':<key>' pattern.
 *
 * path param example: '/person/:id'  ':id' is the path param
 */
export function parseUri(path, params, query, tokenReplacer) {
   if (path) {
      const queryParams = [];
      const dtr_ = (k) => {
         return new RegExp(`:\\b${k}\\b`, 'g');
      };
      const tr_ = tokenReplacer ?? dtr_;

      Object.keys(params ?? {})
         .forEach((k) => {
            path = path.replace(tr_(k), encodeURIComponent(params[k]));
         });

      Object.keys(query ?? {})
         .forEach((k) => {
            queryParams.push(`${k}=${encodeURIComponent(query[k])}`);
         });

      if (queryParams?.length) {
         path = `${path}?${queryParams.join('&')}`;
      }
   }

   return path;
}

/**
 * Parses csv to array of objects
 *
 * options
 *    hasHeaders {boolean}
 *    serialize {function} fn(item):Object
 *    validate {function} fn(item):Boolean
 */
export function readCsv(csvTxt, options) {
   const csv = [];

   if (csvTxt?.trim()?.length > 0) {
      csvTxt = csvTxt.trim();

      // const rows = csvTxt.split(/\r?\n/) ?? [];
      const rows = _splitCsv(csvTxt);
      const ops_ = {
         hasHeaders: true,
         serialize(obj) {
            return obj;
         },
         validate(obj) {
            return true
         },
         ...options
      };
      let hdrKeys = [];

      if (ops_.hasHeaders) {
         hdrKeys = rows.shift().split(',').map(v => v.replace(/\s|-|"/g, ''));
      }

      rows
         .forEach((row) => {
            const cols = _splitRow(row);
            const obj = {};

            if (!hdrKeys.length) {
               hdrKeys = cols.map((v, ndx) => `col${ndx}`);
            }

            cols
               .forEach((val, ndx) => {
                  const key = hdrKeys[ndx];

                  obj[key] = val;
               });

            const fobj = ops_.serialize(obj);

            if (ops_.validate(fobj)) {
               csv.push(fobj);
            }
         });
   }

   return csv;
}

/**
 * Removes any empty (including arrays), null or undefined attribute of the given object
 */
export function removeEmpty(obj, attrs) {
   if (obj && attrs?.length) {
      attrs
         .forEach((attr) => {
            // null && undefined will be empty string
            // so we can handle all the checks agains empty string and allow values like false, 0, etc.
            const val = obj[attr] ?? '';

            if (val === '' || ((typeof val === 'string') && !val.trim()) || (val?.hasOwnProperty?.('length') && !val.length)) {
               delete obj[attr];
            }
         });
   }

   return obj;
}

// TODO: allow offset... see FccTable.scrollToItem
/**
 * elOrSelector {ElementNode|String}
 * options {Object}
 *    - behavior
 *    - block
 *    - inline
 *    - offset - todo
 */
export function scrollIntoView(elOrSelector, options) {
   const el = (typeof elOrSelector === 'string') ? document?.querySelector(elOrSelector) : elOrSelector;

   if (el) {
      el.scrollIntoView?.({
               behavior: 'smooth',
               block: 'start',
               inline: 'nearest',
               ...options
            });
   }
}

/**
 * @description return a formatted string
 * @param str - the string to use for formatting
 * @param o - the array of strings to use, in order, for substitution.
 * @public
 */
export function sprintf(str, o) {
   if (typeof str !== 'string') {
      return '';
   }
   else if (typeof o !== 'object') {
      return str;
   }

   /*
    * Search for matches of {xx} where xx is any combination of a-z, A-Z, 0-9, _ (e.g., {url_1})
    * Find match in the o object for the variable specified and substitute it.
    * e.g
    *     sprintf('Click the <a href='{url_1}'>link</a>', { url_1: 'http://www.mind-over-data.com'});
    *  transforms to:
    *     Click the <a href='http://www.mind-over-data.com'>link</a>
    */
   const regex = /\{([0-z_.]+)\}/g;

   if (regex.test(str)) {
      str = str.replace(regex, (found, match) => {
         // if the object does not contain the prop, return 'found' (i.e. '{name}'), so we can have multiple calls sprintf on a single string
         return ldGet(o, match, found);
      });
   }

   return str;
}

export function toDistanceUnits(val, valUom, resultUom) {
   val = +val;

   if (/^m$/i.test(valUom)) {
      if (/^ft$/i.test(resultUom)) {
         return val * 3.28084;
      }

      if (/^mi$/i.test(resultUom)) {
         return val / 1609.344;
      }

      if (/^km$/i.test(resultUom)) {
         return val / 1000;
      }
   }
   else if (/^ft$/i.test(valUom)) {
      if (/^mi$/i.test(resultUom)) {
         return val / 5280;
      }

      if (/^m$/i.test(resultUom)) {
         return val * 0.3048;
      }

      if (/^km$/i.test(resultUom)) {
         return (val * 0.3048) / 1000;
      }
   }
   else if (/^mi$/i.test(valUom)) {
      if (/^ft$/i.test(resultUom)) {
         return val * 5280;
      }

      if (/^m$/i.test(resultUom)) {
         return val * 0.3048 * 5280;
      }

      if (/^km$/i.test(resultUom)) {
         return (val * 0.3048 * 5280) / 1000;
      }
   }
   else if (/^km$/i.test(valUom)) {
      if (/^ft$/i.test(resultUom)) {
         return val * 3.28084 * 1000;
      }

      if (/^mi$/i.test(resultUom)) {
         return (val / 1609.344) * 1000;
      }

      if (/^m$/i.test(resultUom)) {
         return val * 1000;
      }
   }

   return val;
};

export function toFahrenheit(valInC) {
   return ((valInC * 9) / 5) + 32;
};

export function toHex(dec) {
   let hex;

   if (!isNil(dec)) {
      dec = +dec;

      if (dec < 0) {
         dec = twosComp(Math.abs(dec));
      }

      hex = dec.toString(16);

      return /^-/.test(hex) ? hex.replace('-', '-0x') : '0x' + padStart(hex, 2, '0').toUpperCase();
   }
};

export function hexToRgb(hex) {
   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

   if (result) {
      return {
         r: parseInt(result[1], 16),
         g: parseInt(result[2], 16),
         b: parseInt(result[3], 16)
      };
   }

   return {
      r: 0,
      g: 0,
      b: 0
   };
}

export function rgbToHex(r, g, b) {
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

/**
 * Converts complex data models to plain objects.
 * @param {object} data - The data model to simplify
 * @param {object|function} defaultValue - The default value to return if conversion fails. Can be a function
 */
export function toPlainObject(data, defaultValue) {
   try {
      return JSON.parse(JSON.stringify(data));
   }
   catch (e) {
      console.warn('<<< toPlainObject >>> failed to convert:', data, e);
   }
   
   return toValue(defaultValue);
}

export function toSize(sz) {
   if (/xsm|extra-small|extrasmall|xsmall|x-small|x-sm/i.test(sz)) {
      return 'xsm';
   }

   if (/sm|small/i.test(sz)) {
      return 'sm';
   }
   
   if (/md|medium/i.test(sz)) {
      return 'md';
   }
   
   if (/xlg|extra-large|extralarge|xlarge|x-large|x-lg/i.test(sz)) {
      return 'xlg';
   }
   
   if (/lg|large/i.test(sz)) {
      return 'lg';
   }

   return '';
}

export function toValue(param) {
   return typeof param === 'function' ? param() : param;
}

// default to 1 byte / 8 bits
// ~d + 1
export function twosComp(dec, len = 8) {
   let comp;

   if (!isNil(dec)) {
      // flip bits... see https://stackoverflow.com/questions/42450510/invert-unsigned-arbitrary-binary-bits-in-javascript
      comp = ~dec & (Math.pow(2, len) - 1);

      // add 1
      comp += 1;
   }

   return comp;
};

export function wrapArray(val) {
   if (Array.isArray(val)) {
      return val;
   }
   else if (hasValue(val)) {
      return [val];
   }

   return [];
}

/**
 * Implemented if 1 and only 1 value is truthy and not by an odd number of truthy values.
 *
 * returns true if there is exactly 1 truthy value
 */
export function xor(...args) {
   let count = 0;

   for (let i = 0; i < args.length; i++) {
      const val = args[i];

      if (val) {
         count++;
      }

      if (count > 1) {
         break;
      }
   }

   return count === 1;
}

/**
 * Shuffle an array
 */
export function shuffle(array) {
   if (!Array.isArray(array)) {
      return array;
   }

   let currentIndex = array.length;
   let randomIndex = 0;

   // While there remain elements to shuffle.
   while (currentIndex !== 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
   }

   return array;
}

export const Utils = {
   clearTextSelection,
   coalesce,
   debounce,
   filterAcceptedFiles,
   generateFileTimestamp,
   generateUUID,
   getNextInstanceNdx,
   hasValue,
   isBrowser,
   isNil,
   parseArrayFromText,
   parseCsv,
   parseJSON,
   parseSearchQueryParam,
   parseUri,
   readCsv,
   removeEmpty,
   scrollIntoView,
   sprintf,
   toDistanceUnits,
   toFahrenheit,
   toHex,
   hexToRgb,
   rgbToHex,
   toSize,
   toValue,
   twosComp,
   wrapArray,
   xor,
   shuffle
};

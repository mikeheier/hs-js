import { DateTime, Settings } from 'luxon';

let _tzOptions;

function _toDateTime(date, options) {
   const ops_ = {
      ...options
   };

   if (date instanceof Date) {
      // https://moment.github.io/luxon/api-docs/index.html#datetimefromjsdate
      /**
       * options
       *    zone
       */
      return DateTime.fromJSDate(date, ops_);
   }
   else if (DateTime.isDateTime(date))  {
      // https://moment.github.io/luxon/api-docs/index.html#datetimesetzone
      /**
       * options
       *    keepLocalTime
       *    keepCalendarTime
       */
      return ops_.zone ? date.setZone(ops_.zone, ops_) : date;
   }
   else if (typeof date === 'number') {
      // https://moment.github.io/luxon/api-docs/index.html#datetimefrommillis
      /**
       * options
       *    zone
       *    locale
       *    outputCalendar
       *    numberingSystem
       */
      return DateTime.fromMillis(date, ops_);
   }
   else {
      // https://moment.github.io/luxon/api-docs/index.html#datetimefromiso
      /**
       * options
       *    zone
       *    setZone
       *    locale
       *    outputCalendar
       *    numberingSystem
       */
      return DateTime.fromISO(date, ops_);
   }
}


/**
 * options
 *    - format: default yyyy-MM-dd HH:mm:ss ZZZZ - see https://moment.github.io/luxon/#/formatting?id=table-of-tokens
 *    - jvmTimeZoneId|zone
 */
function format(date, options = {}) {
   try {
      const ops_ = {
         ...options
      };

      const format = ops_.format ?? 'yyyy-MM-dd HH:mm:ss ZZZZ';

      ops_.zone = ops_.zone ?? ops_.jvmTimeZoneId ?? guessTz() ?? 'utc';
      delete ops_.format;
      delete ops_.jvmTimeZoneId;

      return _toDateTime(date, ops_)?.toFormat(format) ?? '';
   }
   catch (e) {
      return '';
   }
}

function normalizeFormatString(format) {
   // no-op...?
   // use to make sure format string followed - https://momentjs.com/docs/#/displaying/format/
   // format may may have originally followed - https://moment.github.io/luxon/#/formatting?id=table-of-tokens
   return format;
}

function guessTz() {
   return DateTime.local().zoneName;
}

/**
 * Returns the time in milliseconds
 */
function getTime(date) {
   // see https://moment.github.io/luxon/#/formatting?id=table-of-tokens
   // 'x' Unix ms timestamp
   // 'x' Unix timestamp
   return +format(date, { format: 'x' });
}

/**
 * keeps date and time and just changes the timezone
 * ie 6:39 pm CDT -> 6:39 pm PDT
 */
function toTimeZone(date, jvmTimeZoneId) {
   return _toDateTime(date).setZone(jvmTimeZoneId, { keepLocalTime: true }).toJSDate();
}

function getUtcOffset(date, jvmTimeZoneId) {
   const dt = _toDateTime(date, { zone: jvmTimeZoneId });

   return dt?.zone?.offset?.(dt.toMillis()) ?? 0;
}

function getTimeZones() {
   if (!_tzOptions) {
      const now = new Date();
      let hasUtc = false;

      _tzOptions = Intl
                     .supportedValuesOf('timeZone')
                     .map((name, ndx, ary) => {
                        const zone = _toDateTime(now, { zone: name })?.zone;

                        if (!hasUtc && name === 'UTC') {
                           hasUtc = true;
                        }

                        return {
                           value: name,
                           text: name,
                           zone,
                           offsets: zone.offsets
                        };
                     });

      if (!hasUtc) {
         _tzOptions.push({
            value: 'UTC',
            text: 'Coordinated Universal Time (UTC)',
            // zone: {
            //    valid: true,
            //    zoneName: 'Etc/UTC',
            //    ianaName: 'Etc/UTC',
            //    isUniversal: true,
            //    isValid: true,
            //    name: 'Etc/UTC',
            //    type: 'fixed'
            // },
            zone: _toDateTime(now, { zone: 'UTC' })?.zone,
            offsets: null
         });
      }

       _tzOptions.sort((a, b) => {
         if ([a.value, b.value].includes('UTC')) {
            return /utc/i.test(a.value) ? -1 : 1;
         }

         return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
       });
   }

   return _tzOptions;
}

function getDayAbbr(date, options = {}) {
   options.format = 'ccc';
   return format(date, options).toLowerCase();
}

/**
 * not sure why i used moment for this???
 */
function asDays(milliseconds) {
   return (milliseconds || 0) / (24 * 60 * 60 * 1000);
}

// see https://moment.github.io/luxon/#/moment?id=query
function isSameDate(d1, d2) {
   if (d1 && d2) {
      const dt1 = _toDateTime(d1);
      const dt2 = _toDateTime(d2);

      return dt1.hasSame(dt2, 'day');
   }

   return false;
}

// is d1 same or before d2
function isSameOrBeforeDate(d1, d2) {
   if (d1 && d2) {
      const dt1 = _toDateTime(d1);
      const dt2 = _toDateTime(d2);

      return dt1.startOf('day') <= dt2.startOf('day');
   }

   return false;
}

// is d1 same or after d2
function isSameOrAfterDate(d1, d2) {
   if (d1 && d2) {
      const dt1 = _toDateTime(d1);
      const dt2 = _toDateTime(d2);

      return dt1.startOf('day') >= dt2.startOf('day');
   }

   return false;
}

// convert from luxon tokens to java simpledateformat tokens
// https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html
// https://moment.github.io/luxon/#/formatting?id=table-of-tokens
//
//  EXAMPLE                | Luxon  | SDF
// -------------------------------------------------------------------
//  +5                     | Z      | X
// -------------------------------------------------------------------
//  +05:00                 | ZZ     | XXX
// -------------------------------------------------------------------
//  +0500                  | ZZZ    | XX
// -------------------------------------------------------------------
//  EST                    | ZZZZ   | zz
// -------------------------------------------------------------------
//  Eastern Standard Time  | ZZZZZ  | zzzz
// -------------------------------------------------------------------
//  America/New_York       | z      | -
// -------------------------------------------------------------------
//  GMT-05:00              | -      | zzz
//
function parseJavaSimpleDateFormatTime(format) {
   if (format) {
      const parts = {
         time: format,
         zone: null
      };

      if (/ZZZZZ/.test(format)) {
         parts.zone = 'zzzz';
         parts.time = format.replace('ZZZZZ', '').trim();
      }
      else if (/ZZZZ/.test(format)) {
         parts.zone = 'zz';
         parts.time = format.replace('ZZZZ', '').trim();
      }
      else if (/ZZZ/.test(format)) {
         parts.zone = 'XX';
         parts.time = format.replace('ZZZ', '').trim();
      }
      else if (/ZZ/.test(format)) {
         parts.zone = 'XXX';
         parts.time = format.replace('ZZ', '').trim();
      }
      else if (/Z/.test(format)) {
         parts.zone = 'X';
         parts.time = format.replace('Z', '').trim();
      }
      // ??? America/New_York === GMT-05:00
      else if (/z/.test(format)) {
         parts.zone = 'zzz';
         parts.time = format.replace('z', '').trim();
      }

      return parts;
   }
}

function getSettings() {
   return Settings;
}

function getSetting(key) {
   return Settings?.[key];
}

function setSetting(key, value) {
   key = key?.trim();

   if (key && Settings) {
      Settings[key] = value;
   }
}

function getLocalDateTime(...args) {
   return DateTime.local(...args);
}

format.intlApiSupport = true;

const DateUtil = {
   format,
   normalizeFormatString,
   guessTz,
   getTime,
   toTimeZone,
   getUtcOffset,
   getTimeZones,
   getDayAbbr,
   asDays,
   isSameDate,
   isSameOrBeforeDate,
   isSameOrAfterDate,
   parseJavaSimpleDateFormatTime,
   getSettings,
   getSetting,
   setSetting,
   getLocalDateTime
};

export {
   DateUtil,
   DateTime,
   format,
   normalizeFormatString,
   guessTz,
   getTime,
   toTimeZone,
   getUtcOffset,
   getTimeZones,
   getDayAbbr,
   asDays,
   isSameDate,
   isSameOrBeforeDate,
   isSameOrAfterDate,
   parseJavaSimpleDateFormatTime,
   getSettings,
   getSetting,
   setSetting,
   getLocalDateTime
};

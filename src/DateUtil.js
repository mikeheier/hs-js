import moment from 'moment-timezone';
import momentjdf from 'moment-jdateformatparser';

let _tzOptions;

// to prevent momentjdf & other plugins that are not directly used from being removed during build (webpack tree shaking)
function verifyJdateFormatParser() {
   return momentjdf !== null && momentjdf !== undefined;
}

function toMomentDate(date, jvmTimeZoneId) {
   return moment.tz(moment(date).format('YYYY-MM-DD HH:mm:ss'), jvmTimeZoneId);
}


/**
 * options
 *    - format: default YYYY-MM-DD HH:mm:ss z
 *    - jvmTimeZoneId
 */
function format(date, options = {}) {
   try {
      const dstr = moment.isDate(date) ? date.toISOString() : date;

      options = {
         format: options.format || 'YYYY-MM-DD HH:mm:ss z',
         jvmTimeZoneId: options.jvmTimeZoneId || moment.tz.guess() || 'utc',
         ...options
      };

      return moment.tz(dstr, options.jvmTimeZoneId).format(options.format);
   }
   catch (e) {
      return '';
   }
}

function normalizeFormatString(format) {
   return moment().toMomentFormatString(format);
}

function guessTz() {
   return moment.tz.guess();
}

/**
 * Returns the time in milliseconds
 */
function getTime(date) {
   // see https://momentjs.com/docs/#/parsing/string-format/
   // 'x' Unix ms timestamp
   // 'X' Unix timestamp
   return +moment(date).format('x');
}

/**
 */
function toTimeZone(date, jvmTimeZoneId) {
   return toMomentDate(date, jvmTimeZoneId).toDate();
}

function getUtcOffset(date, jvmTimeZoneId) {
   return toMomentDate(date, jvmTimeZoneId).utcOffset();
}

function getTimeZones() {
   if (!_tzOptions) {
      _tzOptions = moment
                           .tz
                           .names()
                           .map((name, ndx, ary) => {
                              const zone = moment.tz.zone(name);
                              return {
                                 value: name,
                                 text: name,
                                 zone,
                                 offsets: zone.offsets
                              };
                           });
   }

   return _tzOptions;
}

function getDayAbbr(date, options = {}) {
   options.format = 'ddd';
   return format(date, options).toLowerCase();
}

function asDays(milliseconds) {
   return moment.duration(milliseconds).asDays();
}

function isSameDate(d1, d2) {
   if (d1 && d2) {
      // will compare day, month and year according to docs
      // https://momentjs.com/docs/#/query/is-same/
      return moment(d1).isSame(d2, 'day');
   }

   return false;
}

// is d1 same or before d2
function isSameOrBeforeDate(d1, d2) {
   if (d1 && d2) {
      // will compare day, month and year according to docs
      // https://momentjs.com/docs/#/query/is-same-or-before/
      return moment(d1).isSameOrBefore(d2, 'day');
   }

   return false;
}

// is d1 same or after d2
function isSameOrAfterDate(d1, d2) {
   if (d1 && d2) {
      // will compare day, month and year according to docs
      // https://momentjs.com/docs/#/query/is-same-or-after/
      return moment(d1).isSameOrAfter(d2, 'day');
   }

   return false;
}

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
   isSameOrAfterDate
};

export {
   DateUtil,
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
   verifyJdateFormatParser
};

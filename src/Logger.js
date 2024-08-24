const LogLevel = {
   DEBUG: 4,
   INFO: 3,
   WARN: 2,
   ERROR: 1,
   NONE: 0
};

let _logLevel = LogLevel.NONE;

function _log(method, prefix, ...args) {
   if (console && console[method]) {
      console[method](prefix, ...args);
   }
}

/**
 * These will likely show in production as build tools may not be able to parse out
 * the console in the _log method.
 * 
 * The logLevel must be set properly during build process
 * The default level is ERROR
 */
const Logger = {
   DEBUG: LogLevel.DEBUG,
   INFO: LogLevel.INFO,
   WARN: LogLevel.WARN,
   ERROR: LogLevel.ERROR,
   NONE: LogLevel.NONE,

   getLogLevel() {
      return _logLevel;
   },

   setLogLevel(val) {
      if (!isNaN(val)) {
         _logLevel = parseInt(val);
      }
   },

   debug(...args) {
      if (_logLevel >= LogLevel.DEBUG) {
         _log('log', `%c[${new Date()}] <<< DEBUG >>>`, 'color: #6b6b6b;', ...args);
      }
   },

   info(...args) {
      if (_logLevel >= LogLevel.INFO) {
         _log('log', `%c[${new Date()}] <<< INFO >>>`, 'color: #007ab7;', ...args);
      }
   },

   warn(...args) {
      if (_logLevel >= LogLevel.WARN) {
         _log('warn', `%c[${new Date()}] <<< WARN >>>`, 'color: #f7b118;', ...args);
      }
   },

   error(...args) {
      if (_logLevel >= LogLevel.ERROR) {
         _log('error', `%c[${new Date()}] <<< ERROR >>>`, 'color: #de002e;', ...args);
      }
   }
};

export {
   Logger,
   LogLevel
}
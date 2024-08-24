import { GlobalStorageManager as $storage } from '@/StorageManager.js';

const _mem = {
   data: {},
   get(key) {
      return this.data[key];
   },
   set(key, data) {
      this.data[key] = data;
   }
};

function getKey(key) {
   if (!key) {
      return false;
   }

   return '_c_.' + key;
}

function getExpirationTime(ttlMinutes) {
   const ttlms = (ttlMinutes || 5) * 60 * 1000; // default to 5 min.
   return new Date().getTime() + ttlms;
}

function getCache(type, cacheKey) {
   switch (type) {
      case 'mem':
         return _mem.get(cacheKey);
      case 'local':
         return $storage.local.get(getKey(cacheKey), true);
      default:
         return $storage.session.get(getKey(cacheKey), true);
   }
}

function getStorage(type) {
   switch (type) {
      case 'mem':
         return _mem;
      case 'local':
         return $storage.local;
      default:
         return $storage.session;
   }
}

export const CacheUtil = {
   // type can contain 1 or more, ie mem,session or mem|local or memlocalsession, etc.
   // if no type is specified, all will be cleared
   clear(type) {
      const validate = (key, base) => {
         return /_c_\./.test(key);
      };

      if (!type || /session/.test(type)) {
         $storage.session.clear(validate);
      }

      if (!type || /local/.test(type)) {
         $storage.local.clear(validate);
      }

      if (!type || /mem/.test(type)) {
         _mem.data = {};
      }
   },

   /**
    * options
    *    cacheKey {String} - the key used to store the data
    *    cacheType {String} - session|local|mem >> session is default
    */
   getCache(options) {
      if (!options || !options.cacheKey) {
         return false;
      }

      let results = false;
      const cache = getCache(options.cacheType, options.cacheKey);

      if (cache) {
         if (cache.exp > new Date().getTime()) {
            results = cache.data;
         }
         else {
            console.log('<<< DEBUG >>> cache expired:', options.cacheKey, cache);
         }
      }

      return results;
   },

   getSession(cacheKey) {
      return this.getCache({
         cacheKey: cacheKey,
         cacheType: 'session'
      });
   },

   getLocal(cacheKey) {
      return this.getCache({
         cacheKey: cacheKey,
         cacheType: 'local'
      });
   },

   getMem(cacheKey) {
      return this.getCache({
         cacheKey: cacheKey,
         cacheType: 'mem'
      });
   },

   /**
    * options
    *    cacheKey {String} - the key to store the data under
    *    cacheTTL {Number} - cache "Time To Live", the amount of time in minutes to allow the cache to live
    *    cacheType {String} - session|local|mem >> session is default
    */
   store(options, data) {
      try {
         if (options && options.cacheKey) {
            const key = options.cacheType === 'mem' ? options.cacheKey : getKey(options.cacheKey);
            const storage = getStorage(options.cacheType);

            storage.set(key, {
               exp: getExpirationTime(options.cacheTTL),
               data: data
            });
         }
      }
      catch (e) {
         console.log('<<< DEBUG >>> failed to store data', e);
         console.log('<<< DEBUG >>>', data);
      }

      return this;
   },

   storeSession(cacheKey, data, cacheTTL) {
      return this.store({
         cacheKey: cacheKey,
         cacheType: 'session',
         cacheTTL: cacheTTL
      }, data);
   },

   storeLocal(cacheKey, data, cacheTTL) {
      return this.store({
         cacheKey: cacheKey,
         cacheType: 'local',
         cacheTTL: cacheTTL
      }, data);
   },

   storeMem(cacheKey, data, cacheTTL) {
      return this.store({
         cacheKey: cacheKey,
         cacheType: 'mem',
         cacheTTL: cacheTTL
      }, data);
   }
};

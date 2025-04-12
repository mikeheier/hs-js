const memCache = {};

function generateMemStorage() {
   return {
      removeItem(key) {
         delete memCache[key];
      },
      setItem(key, value) {
         memCache[key] = value;
      },
      getItem(key) {
         return memCache[key];
      }
   };
}

function getLocalStorage() {
   try {
      return window?.localStorage;
   }
   catch(e) {
      /* do nothing */
   }

   return generateMemStorage();
}

function getSessionStorage() {
   try {
      return window?.sessionStorage;
   }
   catch(e) {
      /* do nothing */
   }

   return generateMemStorage();
}

function getInterfaceByName(name) {
   if (/local/i.test(name)) {
      return getLocalStorage();
   }
   if (/session/i.test(name)) {
      return getSessionStorage();
   }
   else if (/mem/i.test(name)) {
      return generateMemStorage();
   }

   return null;
}

class Storage {
   /**
    * storageInterface
    *    defaults to mem
    *    string local|session|mem
    *    interface
    *       setItem(key, item):void
    *       getItem(key):*
    *       removeItem(key):void
    *
    * options
    *    name
    *    context
    * 
    */
   constructor(storageInterface, options) {
      if (storageInterface && typeof storageInterface === 'object') {
         this._store = storageInterface;
      }
      else if (typeof storageInterface === 'string') {
         this._store = getInterfaceByName(storageInterface);
      }

      if (!this._store) {
         this._store = getLocalStorage();
      }

      if (options) {
         Object
            .keys(options)
            .forEach((k) => {
               this[k] = options[k];
            });
      }

      // make sure these values exist
      this.name = this.name || 'hs.so';
      this.context = this.context || 'pub';
   }

   baseKey() {
      return `${this.name}.${this.context}`;
   }

   getFullKey(relKey) {
      return `${this.baseKey()}.${relKey}`;
   }

   set(key, val) {
      if (key) {
         if (val === null || typeof val === 'undefined') {
            this.remove(key);
         }
         else {
            this._store.setItem(this.getFullKey(key), typeof val === 'object' ? JSON.stringify(val) : val);
         }
      }
   }

   get(key, isObject) {
      const result = this._store.getItem(this.getFullKey(key));

      if (result && isObject) {
         try {
            return JSON.parse(result);
         }
         catch (e) {
            console.log('<<< ERROR >>> failed to parse JSON:', e);
            return null;
         }
      }
      else {
         return result;
      }
   }

   remove(key) {
      if (this._store) {
         this._store.removeItem(this.getFullKey(key));
      }
   }

   /**
    * validate {function} - method to check if key should be removed. fn(key, base):boolean
    */
   clear(validate) {
      const fullKeys = Object.keys(this._store);
      let base;

      if (fullKeys && fullKeys.length) {
         base = this.baseKey();

         if (!validate) {
            validate = (fullKey, base) => {
               return fullKey.includes(base);
            };
         }

         fullKeys
            .forEach((fullKey) => {
               if (validate(fullKey, base)) {
                  this.remove(fullKey.replace(new RegExp(`${base}\.`, 'i'), ''));
               }
            });
      }
   }
}

const defaultGlobalStorageName = 'hs.gso';

const GlobalStorageManager = {
   session: new Storage(getSessionStorage(), { name: defaultGlobalStorageName }),
   local: new Storage(getLocalStorage(), { name: defaultGlobalStorageName }),
   setContext(context) {
      this.session.context = context || 'pub';
      this.local.context = context || 'pub';
   },
   getContext() {
      return this.local.context;
   }
};

function initGlobalStorageManager(name) {
   GlobalStorageManager.session.name = name || defaultGlobalStorageName;
}

export {
   initGlobalStorageManager,
   GlobalStorageManager,
   Storage
};

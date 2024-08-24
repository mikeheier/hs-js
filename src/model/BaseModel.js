import { toPlainObject as utilsToPlainObject } from '@/Utils.js';

function getDefault(attr, bindTo) {
   if (typeof attr?.default === 'function') {
      return attr.default.call(bindTo);
   }

   return attr?.default;
}

function normalizeValue(val) {
   if (typeof val === 'string') {
      return val.trim();
   }

   return val;
}

/**
 * Removes any attr/prop starting or ending with _
 */
function removePrivateAttrs(obj) {
   if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
         removePrivateAttrs(obj[i]);
      }
   }
   else if (typeof obj === 'object') {
      const keys = Object.keys(obj);

      for (let i = 0; i < keys.length; i++) {
         const key = keys[i];

         if (/^_|_$/.test(key)) {
            delete obj[key];
         }
      }
   }

   return obj;
}

function toPlainObject(model, options) {
   const ops_ = {
      excludePrivate: false, // any attr starting or ending with _
      ...options
   };
   const results = utilsToPlainObject(model, () => {
         ops_.excludePrivate = false; // no need to remove private attrs as original already handles it.
         toPlainObjectFallback(model, ops_);
      });

   if (ops_.excludePrivate) {
      removePrivateAttrs(results);
   }

   return results;
}

function toPlainObjectFallback(model, options) {
   const result = {};
   const ops_ = {
      excludePrivate: false, // any attr starting or ending with _
      ...options
   };

   if (model) {
      if (model instanceof Array) {
         return model.map((item) => {
               if (item instanceof BaseModel) {
                  return item.toPlainObject(options);
               }
               else if (item instanceof Object) {
                  return toPlainObject(item, options);
               }
               else {
                  return item;
               }
            });
      }
      else {
         const modelKeys = Object.keys(model);

         modelKeys
            .forEach((key) => {
               if (!ops_.excludePrivate || (ops_.excludePrivate && !/^_|_$/.test(key))) {
                  const val = normalizeValue(model[key]) ?? null;

                  if (val instanceof BaseModel) {
                     result[key] = val.toPlainObject(options);
                  }
                  else if (val instanceof Object) {
                     result[key] = toPlainObject(val, options);
                  }
                  else {
                     result[key] = val;
                  }
               }
            });
      }
   }

   return result;
}

function toAttributesArray(attributes) {
   if (typeof attributes === 'object') {
      return Object.keys(attributes).map((key) => {
            return {
               name: key,
               ...attributes[key]
            };
         });
   }

   return [];
}

/**
 * Attributes define the props of the class.
 *
 * <name> {
 *    default {Any} - can be function, should be for object refs
 *    isRequired {Boolean} - for validation purposes
 *    label {String} - can be used for forms, validation, etc
 *    labelResourceKey {String} - can be used for forms, validation, etc.  takes precedence over label
 *    requiredMessage {String}
 *    convert {Function} - fn(value):* - returns the converted value
 *    validate {Function} - fn():Array - returns an array of errors, can be resource key prefixed with '*' eg '*validation.required'. 'this' context is the model object
 * }
 *
 */
const attributes = {};

let _instanceCount = -1;

class BaseModel {
   /**
    * Subclasses should override and define their own.
    */
   static getAttributes() {
      return attributes;
   }

   /**
    * data {Object} - data to initialize model
    */
   constructor(data) {
      _instanceCount++;
      this._mid = _instanceCount; // model instance id
      this._attributes = toAttributesArray(this.constructor.getAttributes());

      this.load(data ?? {}); // pass empty object if data is nil to load intial attributes

      // we will not create a backup automatically.
      // this must be called externally
      // this.backup();
   }

   get instanceId() {
      return this._mid;
   }

   attr(name) {
      return name && this._attributes.find(a => a.name === name);
   }

   labelResourceKey(attrName) {
      return this.attr(attrName)?.labelResourceKey;
   }

   /**
    */
   load(data) {
      const me = this;

      if (typeof data === 'object') {
         const attrs = this._attributes;
         const dataCopy = toPlainObject(data);

         attrs
            .forEach((attr) => {
               const key = attr.name;
               const val = attr.convert ? attr.convert(dataCopy[key]) : dataCopy[key];

               me[key] = val ?? getDefault(attr, me);
               delete dataCopy[key];
            });

         // merge the rest of the data to this
         Object
            .keys(dataCopy)
            .forEach((key) => {
               me[key] = dataCopy[key];
            });
      }

      return this;
   }

   /**
    */
   clone() {
      return new this.constructor(this.toPlainObject({ excludePrivate: true }));
   }

   validate() {
      const me = this;
      const errors = {};
      const attrs = this._attributes;

      attrs
         ?.forEach((attr) => {
            const key = attr.name;
            const val = normalizeValue(me[key]);

            if (attr.isRequired && !val) {
               errors[key] = [attr.requiredMessage || '*validation.required'];
            }
            else if (typeof attr.validate === 'function') {
               const attrErrors = attr.validate.call(me);

               if (attrErrors?.length) {
                  errors[key] = attrErrors;
               }
            }
            else if (val?.validate) {
               const childErrors = val.validate();

               if (Object.keys(childErrors ?? {}).length) {
                  // should we flatten?
                  errors[key] = childErrors;
               }
            }
         });

      return errors;
   }

   restore() {
      if (this._backup) {
         this.load(this._backup);
         this.clearBackup();
      }
   }

   backup() {
      this._backup = this.toPlainObject({ excludePrivate: true });
   }

   getBackup() {
      return this._backup;
   }

   clearBackup() {
      this._backup = null;
   }

   hasChanges() {
      // we don't know
      if (!this._backup) {
         // return true if we don't know, in case this is used to check before save, etc.
         return true;
      }

      // this will only compare properties that have been defined on the destination object
      const fnCompare = function (dest, src) {
         let hasChanges_ = false;

         Object
            .keys(dest ?? {})
            .forEach((key) => {
               const val = dest[key];

               if (typeof val === 'object') {
                  if (Array.isArray(val)) {
                     const srcArry = src[key];

                     if (!srcArry || (srcArry.length !== val.length)) {
                        hasChanges_ = true;
                     }
                     else {
                        // compare each item...
                        hasChanges_ = fnCompare(val, srcArry);
                     }
                  }
                  else {
                     hasChanges_ = typeof src !== 'object' || fnCompare(val, src[key]);
                  }
               }
               else if (src) {
                  hasChanges_ = dest[key] !== src[key];
               }

               // get out
               if (hasChanges_) {
                  return false;
               }
            });

         return hasChanges_;
      };

      return fnCompare(this._backup, this.toPlainObject({ excludePrivate: true }));
   }

   /**
    * Converts to plain object to send to back end
    */
   serialize() {
      return this.toPlainObject({ excludePrivate: true });
   }

   /**
    * Converts to plain object
    *
    * options
    *    excludePrivate {Boolean} - any attr starting or ending with _
    */
   toPlainObject(options) {
      return toPlainObject(this, options);
   }
}

export {
   BaseModel
};

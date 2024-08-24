import { BaseModel } from '@/model/BaseModel.js';
import { GlobalStorageManager as $storage } from '@/StorageManager.js';

export const attributes = {
   ...BaseModel.getAttributes()
};

class BaseFilterModel extends BaseModel {
   /**
    * @override BaseModel.getAttributes
    */
   static getAttributes() {
      return attributes;
   }

   constructor(data, useSessionStorage) {
      super(data);

      this.count = 0;
      this._useSessionStorage = useSessionStorage ?? false;
      this._defaults = { ...data };
      this.updateCount();
   }

   /**
    * @override BaseModel.serialize
    */
   serialize() {
      const obj = super.serialize();

      delete obj.count;
      return obj;
   }

   hasFilters() {
      return this.count > 0;
   }

   /**
    * subclasses should override
    * override should return _count.
    * while determining "count", do not directly set count
    * until everything is actually counted as count can be used
    * as a source of binding
    */
   updateCount() {
      return this.count;
   }

   /**
    * subclasses should override
    * override should return object
    * e.g. {
    *    search: 'mod',
    *    status: '3,6,9'
    * }
    */
   toQueryParams() {
      return null;
   }

   /**
    * subclasses should override
    * override should call updateCount and return the filter instance
    *
    */
   loadQueryParams(params) {
      return this;
   }

   getDefaults() {
      return this._defaults;
   }

   restoreDefaults() {
      this.load(this._defaults);
      // TODO - should we update all arrays here.  if so, we need to consider
      // arrays of objects such as "statuses" used with checkbox list.  the merge works
      // well with those arrays.  completely overriding with the array should have no affect on those
      // as the references to it's content will still remain, so it should be safe.
      // see note for BaseModel.load... mah
      this.updateCount();
   }

   getDataStore() {
      return this._useSessionStorage ? $storage.session : $storage.local;
   }

   /**
    */
   retrieve(storageKey) {
      return storageKey && this.getDataStore().get(storageKey + '.fltr', true);
   }

   /**
    */
   loadStoredQueryParams(storageKey) {
      this.loadQueryParams(this.retrieve(storageKey));
      return this;
   }

   /**
    */
   save(storageKey, defaultsRestored = false) {
      if (storageKey) {
         let dataToStore = null; // setting null will remove the key

         if (!defaultsRestored) {
            dataToStore = this.toQueryParams();
         }

         this.getDataStore().set(storageKey + '.fltr', dataToStore);
      }

      return this;
   }
}

export {
   BaseFilterModel
};

import { readCsv } from '@/Utils.js';

class CsvRepository {
   constructor() {
      this._data = [];
   }

   getData() {
      return this._data ?? [];
   }

   hasData() {
      return this._data?.length > 0;
   }

   each(predicate) {
      if (predicate && this.hasData()) {
         this.getData().forEach(predicate);
      }
   }

   findById(id, idKey) {
      if (this.hasData() && typeof id !== 'undefined' && id !== null) {
         idKey = idKey ?? 'id';

         return this._data.find(o => o[idKey] === id);
      }
   }

   /**
    * options
    *    hasHeaders
    */
   load(csvTxt, options) {
      this._data = readCsv(csvTxt, {
         serialize: this.serialize.bind(this),
         validate: this.validate.bind(this),
         ...options
      });

      return this;
   }

   serialize(obj) {
      return obj;
   }

   validate(obj) {
      if (!obj) {
         return false;
      }

      return Object.keys(obj).some(k => `${obj[k]}`.trim().length > 0);
   }
}

export {
   CsvRepository
};

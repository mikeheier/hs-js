import { BaseModel } from '@/model/BaseModel'
import { guessTz } from '@/DateUtil';

export const Profiles = {
   Default: {
      distanceUoM: 'm',
      temperatureUoM: 'C',
      dateFormat: 'YYYY-MM-DD',
      customDateFormat: '',
      timeFormat: 'HH:mm:ss z',
      customTimeFormat: ''
   },

   Public: {
      Inventory: {
         timeFormat: 'hh:mm A z'
      }
   }
};

const attributes = {
   ...BaseModel.getAttributes(),

   distanceUoM: {
      default: '',
      isRequired: false
   },

   temperatureUoM: {
      default: '',
      isRequired: false
   },

   dateFormat: {
      default: '',
      isRequired: false
   },

   customDateFormat: {
      default: '',
      isRequired: false
   },

   timeFormat: {
      default: '',
      isRequired: false
   },

   customTimeFormat: {
      default: '',
      isRequired: false
   }
};

class Preferences extends BaseModel {
   /**
    * @override BaseModel.getAttributes
    */
   static getAttributes() {
      return attributes;
   }

   constructor(data) {
      super({
         ...Profiles.Default,
         jvmTimeZoneId: guessTz(),
         ...data
      });
   }

   getDateFormat() {
      return this.dateFormat === 'custom' ? this.customDateFormat : this.dateFormat;
   }

   getTimeFormat() {
      return this.timeFormat === 'custom' ? this.customTimeFormat : this.timeFormat;
   }

   /**
    * options {
    *    timeFirst: default false
    *    sep: default ' ' (single space)
    * }
    */
   getDateTimeFormat(options) {
      const formats = [this.getDateFormat(), this.getTimeFormat()];
      const ops = merge({
         timeFirst: false,
         sep: ' '
      }, options);

      return (ops.timeFirst ? formats.reverse() : formats).join(ops.sep);
   }
}

export {
   Preferences
};

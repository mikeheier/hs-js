import { getCountryBy2Char } from '../dist/country-util.min.mjs';
import { mediaDuration } from '../dist/formatter.min.mjs';
import { hasValue, parseCsv, readCsv, wrapArray } from '../dist/utils.min.mjs';

export default () => {
   console.log(getCountryBy2Char('us'));
   console.log(getCountryBy2Char('ph'));
   console.log(getCountryBy2Char('mx'));
   console.log(getCountryBy2Char('ca'));

   console.log('\'ca\'', hasValue('ca'));
   console.log('0', hasValue(0));
   console.log('null', hasValue(null));
   console.log('[]', hasValue([]));
   console.log('[0]', hasValue([0]));
   console.log('undefined', hasValue());


   console.log(wrapArray('a'));
   console.log(wrapArray(['b']));

   const data = [
         {
            'id': 1,
            'name': 'Item 1 ("one")'
         },
         {
            'id': 2,
            'name': 'Item 2'
         },
         {
            'id': 3,
            'name': 'Item 3'
         }
      ];

   const csv = parseCsv(data);

   console.log(csv);
   console.log(readCsv(csv));
   console.log(mediaDuration(new Date().getTime()));
}
